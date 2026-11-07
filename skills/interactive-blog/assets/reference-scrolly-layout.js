// Pure layout math for the 2026 midterms feature. No data, no DOM.
// Coordinates are in the shared 975 x 610 map space so dots can animate
// between the map, the chamber arcs and the voter clusters.

// Largest-remainder rounding: integer counts that sum exactly to `total`.
export function largestRemainder(values, total = 100) {
  const sum = values.reduce((a, b) => a + b, 0);
  if (!(sum > 0)) return values.map(() => 0);
  const raw = values.map((v) => (v / sum) * total);
  const floors = raw.map(Math.floor);
  let left = total - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((v, i) => ({ i, r: v - Math.floor(v) }))
    .sort((a, b) => b.r - a.r || a.i - b.i);
  for (let k = 0; k < order.length && left > 0; k++, left--) floors[order[k].i]++;
  return floors;
}

// Seats of a parliament arc, ordered left to right by angle.
// Returns [{x, y}] for `n` seats in `rows` concentric rows.
export function hemicycle(n, { cx = 487.5, cy = 560, inner = 120, outer = 400, rows = 10 } = {}) {
  const radii = Array.from({ length: rows }, (_, i) => inner + (i * (outer - inner)) / (rows - 1));
  const perRow = largestRemainder(radii, n);
  const seats = [];
  radii.forEach((r, i) => {
    const k = perRow[i];
    for (let j = 0; j < k; j++) {
      const a = k === 1 ? Math.PI / 2 : Math.PI - (j * Math.PI) / (k - 1);
      seats.push({ a, x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) });
    }
  });
  seats.sort((p, q) => q.a - p.a);
  return seats.map(({ x, y }) => ({ x: +x.toFixed(1), y: +y.toFixed(1) }));
}

// Assign parties to arc seats: Democrats from the left, Republicans from the
// right, anything else (uncalled, independent) in the middle.
export function arcParties(seats, d, r) {
  return seats.map((_, i) => (i < d ? "D" : i >= seats.length - r ? "R" : "U"));
}

// Compact block of `n` dots, `cols` wide, top-left at (x, y).
export function block(n, { x = 0, y = 0, cols = 10, gap = 13 } = {}) {
  return Array.from({ length: n }, (_, i) => ({
    x: +(x + (i % cols) * gap).toFixed(1),
    y: +(y + Math.floor(i / cols) * gap).toFixed(1),
  }));
}

// Lay out groups of 1%-dots side by side. Each group: { key, count, d }
// (d = how many of its dots voted Democratic). Democratic dots fill first, so
// every block reads blue-then-coral. Returns positions for 100 dots plus
// label anchors, keeping each dot's identity: dots 0..D-1 are Democratic voters.
export function clusterLayout(groups, { width = 975, top = 120, gap = 13, cols = 6, pad = 34 } = {}) {
  const totalD = groups.reduce((a, g) => a + g.d, 0);
  const totalR = groups.reduce((a, g) => a + (g.count - g.d), 0);
  const blockW = (c) => Math.min(c, cols) * gap;
  const widths = groups.map((g) => blockW(Math.max(g.count, 1)));
  const used = widths.reduce((a, b) => a + b, 0) + pad * (groups.length - 1);
  let x = (width - used) / 2;
  const positions = new Array(totalD + totalR);
  let nextD = 0;
  let nextR = totalD;
  const labels = [];
  groups.forEach((g, gi) => {
    const pts = block(g.count, { x, y: top, cols: Math.min(cols, Math.max(g.count, 1)), gap });
    for (let k = 0; k < g.count; k++) {
      const id = k < g.d ? nextD++ : nextR++;
      positions[id] = pts[k];
    }
    labels.push({ key: g.key, x: x + widths[gi] / 2 - gap / 2, y: top - 22, count: g.count, d: g.d });
    x += widths[gi] + pad;
  });
  return { positions, labels, totalD };
}

// Swing toward Democrats, in points of margin: positive = Democratic shift.
// Inputs are vote shares (%). Margin is D minus R.
export function swing(before, after) {
  return +((after.d - after.r) - (before.d - before.r)).toFixed(1);
}

export function marginLabel(m) {
  if (m === 0) return "Even";
  return m > 0 ? `D+${Math.abs(m)}` : `R+${Math.abs(m)}`;
}
