#!/usr/bin/env python3
"""Trigger eval for the skill's description, with no dependency on skill-creator.

It registers the description as a temporary project command, runs `claude -p "<query>"` for every query in
evals/trigger-queries.json, and counts a run as triggered when Claude calls the Skill tool for it within the first few turns.

Three choices keep the count honest. Each one fixes an undercount that showed up in earlier measurements:

  * The Skill call may come after other tool calls. skill-creator's runner counts only a Skill call that is the very first
    tool call, so a model that searches for tools or lists files first scores as a miss.
  * Every run gets its own working folder. Parallel runs that share one folder see each other's temporary commands, and
    three identical descriptions under three names split the model's choice while only one of the three names counts.
  * A run that prints nothing (not logged in, rate limited, timed out before any output) is an error, not a miss.
    Errors are reported and left out of the trigger rate.

A run stops as soon as the Skill call appears, so a triggered run costs one turn instead of three.

    python3 evals/run-trigger.py [--runs-per-query 2] [--num-workers 3] [--timeout 240] [--max-turns 3]
                                 [--eval-set evals/trigger-queries.json] [--skill-path skills/interactive-blog]

To keep your other installed skills from changing the result, set HOME to a folder that contains only the skills you want
as competition. Each run is a short real model call. Output is JSON on stdout and progress goes to stderr.
Exit status: 0 when it ran, 2 for a usage problem (no `claude` on the path, no description), 3 when every run failed.
Needs macOS or Linux (each run is a process group, so the whole run can be stopped).
"""
import argparse
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path


def read_skill(skill_path):
    text = Path(skill_path, "SKILL.md").read_text()
    front = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not front:
        raise SystemExit("SKILL.md has no frontmatter")
    fields = dict(re.findall(r"^([A-Za-z_][\w-]*):\s*(.*)$", front.group(1), re.M))
    name = fields.get("name", "").strip()
    description = fields.get("description", "").strip().strip("\"'")
    if not name or description in ("", ">", "|", ">-", "|-"):
        raise SystemExit("SKILL.md needs a name and a one-line description in its frontmatter")
    return name, description


def triggered_in(events, command_name):
    """True if any assistant message calls the Skill tool (or reads a file) named for the temporary command."""
    for event in events:
        if event.get("type") != "assistant":
            continue
        for block in (event.get("message") or {}).get("content") or []:
            if block.get("type") != "tool_use":
                continue
            data = block.get("input") or {}
            if block.get("name") == "Skill" and command_name in str(data.get("skill", "")):
                return True
            if block.get("name") == "Read" and command_name in str(data.get("file_path", "")):
                return True
    return False


def parse_stream(text):
    events = []
    for line in text.splitlines():
        line = line.strip()
        if line.startswith("{"):
            try:
                events.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    return events


def stop(proc):
    """Stop the run and everything it started."""
    try:
        os.killpg(proc.pid, signal.SIGKILL)
    except (ProcessLookupError, PermissionError):
        pass


def run_one(query, name, description, project, timeout, max_turns, model):
    """True if the run called the skill, False if it ran and did not. Raises RuntimeError when the run printed nothing."""
    command_name = f"{name}-skill-{uuid.uuid4().hex[:8]}"
    workdir = Path(tempfile.mkdtemp(prefix="run-", dir=project))
    commands = workdir / ".claude" / "commands"
    commands.mkdir(parents=True)
    indented = "\n  ".join(description.split("\n"))
    (commands / f"{command_name}.md").write_text(f"---\ndescription: |\n  {indented}\n---\n\n# {name}\n\nThis skill handles: {description}\n")
    cmd = ["claude", "-p", query, "--output-format", "stream-json", "--verbose", "--max-turns", str(max_turns)]
    if model:
        cmd += ["--model", model]
    env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}
    proc = subprocess.Popen(cmd, cwd=workdir, env=env, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, start_new_session=True)
    timer = threading.Timer(timeout, stop, args=(proc,))
    timer.start()
    seen_output = False
    try:
        for line in proc.stdout:
            for event in parse_stream(line):
                if event.get("type") in ("assistant", "result"):
                    seen_output = True
                if triggered_in([event], command_name):
                    return True
        if not seen_output:
            raise RuntimeError("the run printed no model output (not logged in, rate limited, or timed out first)")
        return False
    finally:
        timer.cancel()
        stop(proc)
        proc.wait()
        shutil.rmtree(workdir, ignore_errors=True)


def main():
    here = Path(__file__).resolve().parent
    p = argparse.ArgumentParser(description="Trigger eval for a skill description")
    p.add_argument("--eval-set", default=str(here / "trigger-queries.json"))
    p.add_argument("--skill-path", default=str(here.parent / "skills" / "interactive-blog"))
    p.add_argument("--project", default=None, help="folder to create the per-run working folders in (default: a new temporary folder)")
    p.add_argument("--runs-per-query", type=int, default=2)
    p.add_argument("--num-workers", type=int, default=3)
    p.add_argument("--timeout", type=int, default=240)
    p.add_argument("--max-turns", type=int, default=3)
    p.add_argument("--threshold", type=float, default=0.5, help="trigger rate at or above which a query counts as triggered")
    p.add_argument("--model", default=None)
    a = p.parse_args()

    if not shutil.which("claude"):
        print("claude is not on the path", file=sys.stderr)
        sys.exit(2)
    name, description = read_skill(a.skill_path)
    queries = json.loads(Path(a.eval_set).read_text())
    own_project = a.project is None
    project = a.project or tempfile.mkdtemp(prefix="trigger-eval-")
    Path(project).mkdir(parents=True, exist_ok=True)

    hits = {i: 0 for i in range(len(queries))}
    valid = {i: 0 for i in range(len(queries))}
    errors = 0
    try:
        with ThreadPoolExecutor(max_workers=a.num_workers) as pool:
            futures = {pool.submit(run_one, q["query"], name, description, project, a.timeout, a.max_turns, a.model): i for i, q in enumerate(queries) for _ in range(a.runs_per_query)}
            for future in as_completed(futures):
                i = futures[future]
                try:
                    hits[i] += bool(future.result())
                    valid[i] += 1
                except Exception as e:  # an errored run is reported and left out of the rate
                    errors += 1
                    print(f"run failed for query {i}: {e}", file=sys.stderr)
    finally:
        if own_project:
            shutil.rmtree(project, ignore_errors=True)

    results = []
    for i, q in enumerate(queries):
        rate = hits[i] / valid[i] if valid[i] else None
        ok = rate is not None and (rate >= a.threshold) == q["should_trigger"]
        results.append({"query": q["query"], "should_trigger": q["should_trigger"], "trigger_rate": rate, "triggers": hits[i], "runs": valid[i], "pass": ok})
        shown = f"{hits[i]}/{valid[i]}" if valid[i] else "no valid runs"
        print(f"[{'PASS' if ok else 'FAIL'}] rate={shown} expected={q['should_trigger']}: {q['query'][:70]}", file=sys.stderr)
    pos = [r for r in results if r["should_trigger"]]
    neg = [r for r in results if not r["should_trigger"]]
    summary = {
        "total": len(results),
        "passed": sum(r["pass"] for r in results),
        "should_trigger_passed": sum(r["pass"] for r in pos),
        "should_trigger": len(pos),
        "should_not_passed": sum(r["pass"] for r in neg),
        "should_not": len(neg),
        "trigger_runs_on_positives": sum(r["triggers"] for r in pos),
        "positive_runs": sum(r["runs"] for r in pos),
        "false_trigger_runs": sum(r["triggers"] for r in neg),
        "negative_runs": sum(r["runs"] for r in neg),
        "errored_runs": errors,
        "max_turns": a.max_turns,
    }
    print(json.dumps({"skill_name": name, "summary": summary, "results": results}, indent=2))
    if errors and not sum(valid.values()):
        sys.exit(3)


if __name__ == "__main__":
    main()
