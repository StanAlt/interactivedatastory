// The trigger eval runner (evals/run-trigger.py): the stream parser, the trigger detection, and the whole run loop against a
// fake `claude` program, so no model is called. Skipped when python3 is not installed.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, SKILL, frontmatter, read } from "./helpers/paths.mjs";

const pythonCheck = spawnSync("python3", ["-c", "import sys; print(sys.executable)"], { encoding: "utf8" });
const opts = { skip: pythonCheck.status === 0 ? false : "python3 is not installed" };
const PYTHON = pythonCheck.stdout.trim();
const RUNNER = path.join(ROOT, "evals/run-trigger.py");
const tmp = (prefix) => fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), prefix));

// Run a snippet of Python with the runner loaded as module `m`; the snippet prints one JSON value.
function py(code, env = {}) {
  const prelude = [
    "import importlib.util, json, os, sys",
    `spec = importlib.util.spec_from_file_location("run_trigger", ${JSON.stringify(RUNNER)})`,
    "m = importlib.util.module_from_spec(spec)",
    "spec.loader.exec_module(m)",
  ].join("\n");
  const r = spawnSync(PYTHON, ["-I", "-B", "-c", `${prelude}\n${code}`], { encoding: "utf8", env: { ...process.env, ...env } });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout);
}

const toolUse = (name, input) => ({ type: "assistant", message: { content: [{ type: "tool_use", name, input }] } });
const NAME = "interactive-blog-skill-1a2b3c4d";
const detect = (events, name = NAME) =>
  py(`print(json.dumps(m.triggered_in(json.loads(${JSON.stringify(JSON.stringify(events))}), ${JSON.stringify(name)})))`);

test("parse_stream keeps JSON lines and ignores everything else", opts, () => {
  const text = ['{"type":"system"}', "plain log line", "", '{"broken": ', '  {"type":"assistant","message":{"content":[]}}  '].join("\n");
  const events = py(`print(json.dumps(m.parse_stream(${JSON.stringify(text)})))`);
  assert.deepEqual(events.map((e) => e.type), ["system", "assistant"]);
});

test("triggered_in counts a Skill call for the temporary command even when other tools came first", opts, () => {
  assert.equal(detect([toolUse("Skill", { skill: NAME })]), true);
  assert.equal(detect([toolUse("ToolSearch", { query: "x" }), toolUse("Bash", { command: "ls" }), toolUse("Skill", { skill: NAME })]), true, "not only the first tool call");
  assert.equal(detect([toolUse("Skill", { skill: `plugin:${NAME}` })]), true, "a plugin-prefixed name still matches");
  assert.equal(detect([toolUse("Read", { file_path: `/work/.claude/commands/${NAME}.md` })]), true, "reading the command file counts");
});

test("triggered_in does not count other skills, other tools, user text or tool results", opts, () => {
  assert.equal(detect([toolUse("Skill", { skill: "anthropic-skills:acadia-blog-schedule" })]), false);
  assert.equal(detect([toolUse("Skill", { skill: "interactive-blog-skill-ffffffff" })]), false, "a different run's command is not this run's");
  assert.equal(detect([toolUse("Bash", { command: `echo ${NAME}` })]), false);
  assert.equal(detect([{ type: "user", message: { content: [{ type: "tool_result", content: NAME }] } }]), false);
  assert.equal(detect([{ type: "assistant", message: { content: [{ type: "text", text: `I will use ${NAME}` }] } }]), false);
  assert.equal(detect([]), false);
  assert.equal(detect([{ type: "assistant" }, { type: "assistant", message: {} }, { type: "assistant", message: { content: [{ type: "tool_use", name: "Skill" }] } }]), false, "malformed events do not crash it");
});

test("read_skill returns the name and the whole description from SKILL.md, and refuses a folded description", opts, () => {
  const [name, description] = py(`print(json.dumps(m.read_skill(${JSON.stringify(SKILL)})))`);
  const fm = frontmatter(read("skills/interactive-blog/SKILL.md"));
  assert.equal(name, "interactive-blog");
  assert.equal(description, fm.data.description.trim());
  assert.ok(description.length > 400 && description.length <= 1024, `${description.length} characters`);
  const folded = tmp("folded-skill-");
  fs.writeFileSync(path.join(folded, "SKILL.md"), "---\nname: x\ndescription: >\n  Folded text.\n---\nBody\n");
  try {
    const r = spawnSync(PYTHON, ["-I", "-B", RUNNER, "--skill-path", folded], { encoding: "utf8", env: { ...process.env, PATH: `${folded}:${process.env.PATH}` } });
    assert.notEqual(r.status, 0);
  } finally {
    fs.rmSync(folded, { recursive: true, force: true });
  }
});

// A fake `claude`. It finds the temporary command in its own .claude/commands and behaves as FAKE_MODE says.
const FAKE = `#!/usr/bin/env bash
shopt -s nullglob
files=(.claude/commands/*.md)
cmd=$(basename "\${files[0]}" .md)
[ -n "$FAKE_ARGS_FILE" ] && echo "$@" > "$FAKE_ARGS_FILE"
[ -n "$FAKE_KEEP_FILE" ] && cp "\${files[0]}" "$FAKE_KEEP_FILE"
[ -n "$FAKE_COUNT_FILE" ] && echo "\${#files[@]}" >> "$FAKE_COUNT_FILE"
[ -n "$FAKE_DELAY" ] && sleep "$FAKE_DELAY"
skill_event() { echo '{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Skill","input":{"skill":"'"$cmd"'"}}]}}'; }
bash_event() { echo '{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Bash","input":{"command":"ls"}}]}}'; }
text_event() { echo '{"type":"assistant","message":{"content":[{"type":"text","text":"Here is a plan."}]}}'; }
case "$FAKE_MODE" in
  late) echo '{"type":"system","subtype":"init"}'; bash_event; skill_event ;;
  none) text_event ;;
  hang) bash_event; exec sleep 30 ;;
  skill-then-hang) skill_event; exec sleep 30 ;;
  silent) ;;
  by-query) case "$2" in *INTERACTIVE*) skill_event ;; *) text_event ;; esac ;;
esac
`;

function withFake(fn) {
  const bin = tmp("fake-claude-");
  const project = tmp("trigger-proj-");
  fs.writeFileSync(path.join(bin, "claude"), FAKE, { mode: 0o755 });
  const env = (extra) => ({ PATH: `${bin}:${process.env.PATH}`, ...extra });
  try {
    return fn({ bin, project, env });
  } finally {
    fs.rmSync(bin, { recursive: true, force: true });
    fs.rmSync(project, { recursive: true, force: true });
  }
}

const runOne = (project, env, timeout = 20) =>
  py(`print(json.dumps(m.run_one("Build an interactive feature on charter school closures", "demo", "Use for interactive data stories.\\nAlso for scrollytelling.", ${JSON.stringify(project)}, ${timeout}, 3, "small-model")))`, env);

test("run_one calls claude with the right flags, counts a Skill call that is not the first tool call, and cleans up", opts, () => {
  withFake(({ project, env }) => {
    const argsFile = path.join(project, "args.txt");
    const keep = path.join(project, "kept.md");
    assert.equal(runOne(project, env({ FAKE_MODE: "late", FAKE_ARGS_FILE: argsFile, FAKE_KEEP_FILE: keep })), true);
    const args = fs.readFileSync(argsFile, "utf8");
    for (const flag of ["-p", "Build an interactive feature", "--output-format stream-json", "--verbose", "--max-turns 3", "--model small-model"]) assert.ok(args.includes(flag), `claude was called with ${flag}`);
    assert.match(fs.readFileSync(keep, "utf8"), /^---\ndescription: \|\n {2}Use for interactive data stories\.\n {2}Also for scrollytelling\.\n---\n/, "the description is the command's description, indented");
    assert.deepEqual(fs.readdirSync(project).filter((f) => f.startsWith("run-")), [], "the per-run folder is removed");
  });
});

test("run_one: no Skill call is a miss, and a run that hangs is stopped at the timeout and is a miss too", opts, () => {
  withFake(({ project, env }) => {
    assert.equal(runOne(project, env({ FAKE_MODE: "none" })), false);
    const started = Date.now();
    assert.equal(runOne(project, env({ FAKE_MODE: "hang" }), 2), false);
    const seconds = (Date.now() - started) / 1000;
    assert.ok(seconds >= 1.5 && seconds < 15, `stopped at the timeout (${seconds}s), not after the fake's 30 second sleep`);
    assert.deepEqual(fs.readdirSync(project), [], "no per-run folders are left, even after a timeout");
  });
});

test("run_one stops as soon as the Skill call appears instead of waiting for the run to finish", opts, () => {
  withFake(({ project, env }) => {
    const started = Date.now();
    assert.equal(runOne(project, env({ FAKE_MODE: "skill-then-hang" }), 25), true);
    assert.ok((Date.now() - started) / 1000 < 12, "returned long before the 25 second timeout");
  });
});

test("run_one raises when the run prints nothing, so a login or rate-limit failure is not scored as a miss", opts, () => {
  withFake(({ project, env }) => {
    const out = py(`
try:
    m.run_one("q", "demo", "d", ${JSON.stringify(project)}, 10, 3, None)
    print(json.dumps("returned"))
except RuntimeError as e:
    print(json.dumps("raised: " + str(e)))
`, env({ FAKE_MODE: "silent" }));
    assert.match(out, /^raised: the run printed no model output/);
    assert.deepEqual(fs.readdirSync(project), []);
  });
});

test("parallel runs never see each other's temporary commands", opts, () => {
  withFake(({ project, env }) => {
    const counts = path.join(project, "counts.txt");
    const out = py(`
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(6) as pool:
    print(json.dumps(list(pool.map(lambda i: m.run_one("q", "demo", "d", ${JSON.stringify(project)}, 20, 3, None), range(6)))))
`, env({ FAKE_MODE: "late", FAKE_DELAY: "0.6", FAKE_COUNT_FILE: counts }));
    assert.deepEqual(out, [true, true, true, true, true, true]);
    const seen = fs.readFileSync(counts, "utf8").trim().split("\n");
    assert.equal(seen.length, 6);
    assert.ok(seen.every((n) => n === "1"), `each run saw exactly one command, saw ${seen}`);
  });
});

test("the command line tool tallies positives and near misses, reports errors, and exits 3 when every run failed", opts, () => {
  withFake(({ project, env }) => {
    const set = path.join(project, "queries.json");
    const longer = (s) => `${s} for the charter school closures story in the suburbs of the county`;
    fs.writeFileSync(set, JSON.stringify([
      { query: longer("Build an INTERACTIVE data story"), should_trigger: true },
      { query: longer("Make an INTERACTIVE feature with a map"), should_trigger: true },
      { query: longer("Fix the typo in the footer"), should_trigger: false },
      { query: longer("Schedule a plain blog post"), should_trigger: false },
    ]));
    const cli = (extra) => spawnSync(PYTHON, ["-I", "-B", RUNNER, "--eval-set", set, "--skill-path", SKILL, "--runs-per-query", "2", "--num-workers", "2", "--timeout", "10", "--project", project], { encoding: "utf8", env: { ...process.env, ...env(extra) } });
    const ok = cli({ FAKE_MODE: "by-query" });
    assert.equal(ok.status, 0, ok.stderr);
    const { summary, results } = JSON.parse(ok.stdout);
    assert.deepEqual(
      [summary.should_trigger_passed, summary.should_not_passed, summary.trigger_runs_on_positives, summary.positive_runs, summary.false_trigger_runs, summary.negative_runs, summary.errored_runs],
      [2, 2, 4, 4, 0, 4, 0],
    );
    assert.ok(results.every((r) => r.pass));
    assert.match(ok.stderr, /\[PASS\] rate=2\/2 expected=True/);

    const wrong = cli({ FAKE_MODE: "none" }); // never triggers: the positives fail, the near misses pass
    const w = JSON.parse(wrong.stdout).summary;
    assert.deepEqual([w.should_trigger_passed, w.should_not_passed], [0, 2]);

    const dead = cli({ FAKE_MODE: "silent" });
    assert.equal(dead.status, 3, "every run failed");
    const d = JSON.parse(dead.stdout);
    assert.equal(d.summary.errored_runs, 8);
    assert.ok(d.results.every((r) => r.trigger_rate === null && r.pass === false));
    assert.match(dead.stderr, /run failed for query/);
  });
});

test("the command line tool exits 2 with a message when claude is not installed", opts, () => {
  const empty = tmp("no-claude-");
  try {
    const r = spawnSync(PYTHON, ["-I", "-B", RUNNER], { encoding: "utf8", env: { ...process.env, PATH: empty } });
    assert.equal(r.status, 2);
    assert.match(r.stderr, /claude is not on the path/);
  } finally {
    fs.rmSync(empty, { recursive: true, force: true });
  }
});
