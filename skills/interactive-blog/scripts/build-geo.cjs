// Build compact U.S. state geometry plus one dot per House seat for a map story.
//
//   mkdir geo && cd geo && npm init -y && npm i us-atlas topojson-client topojson-simplify d3-geo
//   node <skill>/scripts/build-geo.cjs ../src/data/electionGeo.js
//
// Input: us-atlas states-albers-10m.json (Census boundaries, already projected to a 975 x 610 Albers USA map).
// Output: an ES module with state paths, centroids, boxes, borders and seat-dot positions. Dots are spread inside each
// state by k-means and then pushed apart so none overlap; they show how many seats a state has, not where districts are.
// Packages are resolved from the folder you run it in, not from the skill folder.
const fs = require('fs');
const path = require('path');
if (!process.argv[2]) {
  console.error('usage: node build-geo.cjs <output.js>   (run from a folder where us-atlas, topojson-client, topojson-simplify and d3-geo are installed)');
  process.exit(2);
}
const req = require('module').createRequire(path.join(process.cwd(), 'package.json'));
const topo = req('topojson-client');
const simplify = req('topojson-simplify');
const { geoPath } = req('d3-geo');

const OUT = process.argv[2];
if (!OUT) {
  console.error('usage: node build-geo.cjs <output.js>   (run from a folder where us-atlas, topojson-client, topojson-simplify and d3-geo are installed)');
  process.exit(2);
}
const us = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'node_modules/us-atlas/states-albers-10m.json'), 'utf8'));

// Light simplification keeps the outline faithful while shrinking the payload.
const pre = simplify.presimplify(us);
const minWeight = simplify.quantile(pre, 0.5);
const simple = simplify.simplify(pre, minWeight);

const ABBR = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA', Colorado: 'CO',
  Connecticut: 'CT', Delaware: 'DE', 'District of Columbia': 'DC', Florida: 'FL', Georgia: 'GA',
  Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY',
  Louisiana: 'LA', Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN',
  Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH',
  'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND',
  Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA',
  Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY',
};

// U.S. House seats per state, 2020 Census apportionment (in effect 2022–2030).
const SEATS = {
  AL: 7, AK: 1, AZ: 9, AR: 4, CA: 52, CO: 8, CT: 5, DE: 1, FL: 28, GA: 14, HI: 2, ID: 2, IL: 17,
  IN: 9, IA: 4, KS: 4, KY: 6, LA: 6, ME: 2, MD: 8, MA: 9, MI: 13, MN: 8, MS: 4, MO: 8, MT: 2,
  NE: 3, NV: 4, NH: 2, NJ: 12, NM: 3, NY: 26, NC: 14, ND: 1, OH: 15, OK: 5, OR: 6, PA: 17, RI: 2,
  SC: 7, SD: 1, TN: 9, TX: 38, UT: 4, VT: 1, VA: 11, WA: 10, WV: 2, WI: 8, WY: 1,
};
const total = Object.values(SEATS).reduce((a, b) => a + b, 0);
if (total !== 435) throw new Error(`apportionment sums to ${total}, expected 435`);

const states = topo.feature(simple, simple.objects.states).features;
const pathGen = geoPath().digits(1);
const fullPathGen = geoPath();

// Planar point-in-polygon (even-odd) for pre-projected coordinates.
function inRings(x, y, rings) {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}
function contains(geom, x, y) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  return polys.some((rings) => inRings(x, y, rings));
}

// Spread n points evenly inside a shape: dense candidate grid, then k-means.
function seatPoints(feature, n) {
  const [[x0, y0], [x1, y1]] = fullPathGen.bounds(feature);
  const area = fullPathGen.area(feature);
  const step = Math.max(0.35, Math.min(2, Math.sqrt(area / 1800)));
  const cand = [];
  for (let x = x0; x <= x1; x += step) for (let y = y0; y <= y1; y += step) if (contains(feature.geometry, x, y)) cand.push([x, y]);
  if (cand.length === 0) cand.push(fullPathGen.centroid(feature));
  // k-means++ style deterministic seeding: farthest-point sampling from the centroid.
  const c0 = fullPathGen.centroid(feature);
  let first = cand.reduce((best, p) => (Math.hypot(p[0] - c0[0], p[1] - c0[1]) < Math.hypot(best[0] - c0[0], best[1] - c0[1]) ? p : best), cand[0]);
  const centers = [first.slice()];
  while (centers.length < n) {
    let bestP = cand[0], bestD = -1;
    for (const p of cand) {
      let d = Infinity;
      for (const c of centers) d = Math.min(d, (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2);
      if (d > bestD) { bestD = d; bestP = p; }
    }
    centers.push(bestP.slice());
  }
  for (let iter = 0; iter < 30; iter++) {
    const sums = centers.map(() => [0, 0, 0]);
    for (const p of cand) {
      let bi = 0, bd = Infinity;
      centers.forEach((c, i) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2; if (d < bd) { bd = d; bi = i; } });
      sums[bi][0] += p[0]; sums[bi][1] += p[1]; sums[bi][2]++;
    }
    centers.forEach((c, i) => { if (sums[i][2]) { c[0] = sums[i][0] / sums[i][2]; c[1] = sums[i][1] / sums[i][2]; } });
  }
  return centers;
}

const out = { states: [], seats: {} };
for (const f of states) {
  const id = ABBR[f.properties.name];
  if (!id) throw new Error('unknown state ' + f.properties.name);
  const [cx, cy] = fullPathGen.centroid(f);
  const [[bx0, by0], [bx1, by1]] = fullPathGen.bounds(f);
  out.states.push({ id, name: f.properties.name, d: pathGen(f), cx: +cx.toFixed(1), cy: +cy.toFixed(1), box: [bx0, by0, bx1, by1].map((v) => +v.toFixed(1)) });
  if (SEATS[id]) out.seats[id] = seatPoints(f, SEATS[id]);
}

// Collision relaxation: keep every seat dot at least MIN apart, anchored to its start.
const R = 3.6, MIN = 2 * R + 1.1;
const all = [];
for (const [id, pts] of Object.entries(out.seats)) pts.forEach((p, i) => all.push({ id, i, x: p[0], y: p[1], ax: p[0], ay: p[1] }));
for (let iter = 0; iter < 160; iter++) {
  let moved = 0;
  for (let a = 0; a < all.length; a++) for (let b = a + 1; b < all.length; b++) {
    const A = all[a], B = all[b];
    const dx = B.x - A.x, dy = B.y - A.y; const d = Math.hypot(dx, dy) || 0.01;
    if (d < MIN) { const push = (MIN - d) / 2; const ux = dx / d, uy = dy / d; A.x -= ux * push; A.y -= uy * push; B.x += ux * push; B.y += uy * push; moved++; }
  }
  for (const p of all) { p.x += (p.ax - p.x) * 0.04; p.y += (p.ay - p.y) * 0.04; }
  if (!moved) break;
}
for (const p of all) out.seats[p.id][p.i] = [+p.x.toFixed(1), +p.y.toFixed(1)];

const borders = pathGen(topo.mesh(simple, simple.objects.states, (a, b) => a !== b));
const nation = pathGen(topo.feature(simple, simple.objects.nation));

const src = `// Generated by interactive-blog/scripts/build-geo.cjs from us-atlas@3 states-albers-10m.json
// (U.S. Census Bureau cartographic boundaries, pre-projected to Albers USA, 975 x 610).
// Do not edit by hand. Seat dots: one per House seat (2020 apportionment), placed inside
// each state's outline; positions are not district locations.
export const MAP_W = 975;
export const MAP_H = 610;
export const SEAT_RADIUS = ${R};
export const statesGeo = ${JSON.stringify(out.states)};
export const stateBorders = ${JSON.stringify(borders)};
export const nationOutline = ${JSON.stringify(nation)};
export const seatDots = ${JSON.stringify(out.seats)};
export const apportionment = ${JSON.stringify(SEATS)};
`;
fs.writeFileSync(OUT, src);
const minGap = (() => { let m = Infinity; for (let a = 0; a < all.length; a++) for (let b = a + 1; b < all.length; b++) m = Math.min(m, Math.hypot(all[a].x - all[b].x, all[a].y - all[b].y)); return m; })();
console.log('states', out.states.length, '| seat dots', all.length, '| min dot distance', minGap.toFixed(2), '| bytes', src.length);
