#!/usr/bin/env python3
"""Build the 1200x630 social SVG for an Interactive Blog feature.

Edit CONFIG, run from the repo root, then validate and render:
  python3 .claude/skills/interactive-blog/assets/og-image-template.py
  bash .claude/skills/interactive-blog/scripts/validate-svg.sh public/img/<topic>-research.svg
  node .claude/skills/interactive-blog/scripts/render-og.cjs public/img/<topic>-research.svg public/img/<topic>-research.png

Layout (proven legible at thumbnail size): Acadia logo top-left, kicker top-right,
hairline at y=94; headline 3-4 lines at 70-77px on the left; a simplified hero
graphic on the right with ONE large accent number; bottom rule at y=562 with the
headline statistic and acadia.im. Replace draw_graphic() with the feature's own
hero motif (this default draws the ladder from the AI jobs feature).
"""
import os

CONFIG = {
    "out": "public/img/example-research.svg",
    "headline": ["Fewer hires.", "More output.", "Where did", "the jobs go?"],
    "subhead": "AI, the 2026 layoffs and the entry-level gap",
    "stat_left": "120,136 U.S. job cuts cited AI, Jan–Sep 2026",
    "accent_value": "−19%",
    "accent_caption": "Ages 22–25 in AI-exposed jobs vs. peers · Stanford",
}

F = "Archivo, Arial, sans-serif"
INK, MUTED, CORAL, RULE, PAPER = "#14120E", "#656158", "#D6502B", "#D7D2C8", "#FAF6EF"
HERE = os.path.dirname(os.path.abspath(__file__))


def draw_graphic():
    """Right-hand motif, x 700-1144, y 120-480. Keep labels >= 16px."""
    out = []
    xb, W, ys = 770, 330, [170, 240, 310, 380, 450]
    ages = ["50+", "35–49", "31–34", "26–30", "22–25"]
    for x in (758, 1112):
        out.append(f'<line x1="{x}" y1="128" x2="{x}" y2="470" stroke="#C7C4BC" stroke-width="3" stroke-linecap="round"/>')
    for i, (y, a) in enumerate(zip(ys, ages)):
        exposed = i == 4
        w = W * 0.81 if exposed else W
        out.append(f'<text x="744" y="{y+7}" text-anchor="end" font-family="{F}" font-size="21" font-weight="700" fill="{CORAL if exposed else INK}">{a}</text>')
        if exposed:
            out.append(f'<rect x="{xb}" y="{y-8}" width="{W}" height="16" rx="8" fill="none" stroke="{CORAL}" stroke-width="2" stroke-dasharray="6 5"/>')
        out.append(f'<rect x="{xb}" y="{y-8}" width="{w:.0f}" height="16" rx="8" fill="{INK}"/>')
        for d in range(9):
            cx = xb + 16 + d * ((W - 32) / 8)
            if d < (7 if exposed else 9):
                out.append(f'<circle cx="{cx:.1f}" cy="{y-26}" r="8" fill="{INK}"/>')
            else:
                out.append(f'<circle cx="{cx:.1f}" cy="{y-26}" r="7" fill="{PAPER}" stroke="{CORAL}" stroke-width="2.5"/>')
    return out


def build(c=CONFIG):
    logo = open(os.path.join(HERE, "acadia-logo-group.svg"), encoding="utf-8").read()
    p = ['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">',
         f'<rect width="1200" height="630" fill="{PAPER}"/>', logo,
         f'<text x="1144" y="68" fill="{MUTED}" text-anchor="end" font-family="{F}" font-size="15" font-weight="600" letter-spacing="2">ACADIA INTERACTIVE RESEARCH</text>',
         f'<path d="M56 94H1144" stroke="{RULE}"/>',
         f'<g font-family="{F}" font-size="72" font-weight="700" letter-spacing="-3.5" fill="{INK}">']
    for i, line in enumerate(c["headline"]):
        p.append(f'<text x="54" y="{196 + i * 80}">{line}</text>')
    p.append("</g>")
    p.append(f'<text x="57" y="{196 + len(c["headline"]) * 80 - 16}" fill="{MUTED}" font-family="{F}" font-size="23">{c["subhead"]}</text>')
    p += draw_graphic()
    p.append(f'<text x="1112" y="514" text-anchor="end" font-family="{F}" font-size="44" font-weight="750" letter-spacing="-1.5" fill="{CORAL}">{c["accent_value"]}</text>')
    p.append(f'<text x="1112" y="540" text-anchor="end" font-family="{F}" font-size="16" fill="{MUTED}">{c["accent_caption"]}</text>')
    p.append(f'<path d="M56 562H1144" stroke="{RULE}"/>')
    p.append(f'<text x="56" y="600" font-family="{F}" font-size="22" font-weight="600" fill="{INK}">{c["stat_left"]}</text>')
    p.append(f'<text x="1144" y="600" text-anchor="end" font-family="{F}" font-size="22" font-weight="600" fill="{CORAL}">acadia.im</text>')
    p.append("</svg>")
    svg = "".join(p)
    assert "&" not in svg.replace("&amp;", ""), "escape & as &amp; in text"
    open(c["out"], "w", encoding="utf-8").write(svg)
    print("wrote", c["out"])


if __name__ == "__main__":
    build()
