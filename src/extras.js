// extras.js: helpers the films in src/scenes share, on top of core.js and clawd.js. Everything is a pure function of its
// arguments, like the rest of the kit.

// ---------- small maths ----------
const rot2 = (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];
const mix2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const bump = (t, a, b, c) => t < a || t > c ? 0 : t < b ? easeOut((t - a) / (b - a)) : 1 - easeIn((t - b) / (c - b));   // up by b, dropped by c
// Smooth flight through timed points [[t, x, y], ...]: a Hermite curve whose speed carries through each point.
function fly(t, K) {
  const n = K.length;
  if (t <= K[0][0]) return [K[0][1], K[0][2]];
  if (t >= K[n - 1][0]) return [K[n - 1][1], K[n - 1][2]];
  let i = 0; while (t >= K[i + 1][0]) i++;
  const p0 = K[Math.max(0, i - 1)], p1 = K[i], p2 = K[i + 1], p3 = K[Math.min(n - 1, i + 2)], dt = p2[0] - p1[0], u = (t - p1[0]) / dt, u2 = u * u, u3 = u2 * u;
  const at = d => {
    const m1 = (p2[d] - p0[d]) / ((p2[0] - p0[0]) || 1) * dt, m2 = (p3[d] - p1[d]) / ((p3[0] - p1[0]) || 1) * dt;
    return (2 * u3 - 3 * u2 + 1) * p1[d] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * p2[d] + (u3 - u2) * m2;
  };
  return [at(1), at(2)];
}
const circleKeys = (c, r0, r1, a0, turns, t0, t1, n) => { const K = []; for (let j = 0; j <= n; j++) { const u = j / n, a = a0 + turns * TAU * u, r = lerp(r0, r1, u); K.push([lerp(t0, t1, u), c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * .82]); } return K; };

function sparkle(x, y, r, k, col = '#F4B63F') {
  if (k <= 0 || k >= 1) return;
  paint(starPts(x, y, r * backOut(Math.min(1, k * 2.4)) * (1 - k * .5), .28, 4, k * 1.4), { wash: col, washOp: 255 * (1 - k * k * k), ink: PAL.ink, sw: .4 * (1 - k) });
}
// short ticks flying outward between angles a0 and a1
function burst(x, y, r0, r1, n, k, col = PAL.ink, sw = .8, a0 = 0, a1 = TAU) {
  if (k <= 0 || k >= 1) return;
  const e = easeOut(k), ra = lerp(r0, r1, e), rb = ra + (r1 - r0) * .4 * (1 - k);
  for (let i = 0; i < n; i++) { const a = lerp(a0, a1, (i + .5) / n); inkLine([[x + Math.cos(a) * ra, y + Math.sin(a) * ra], [x + Math.cos(a) * rb, y + Math.sin(a) * rb]], Math.max(.2, sw * (1 - k)), col, 'ink', 0); }
}
function shadow(x, y, w, k = 1) { if (k > .03) paint(ellPts(x, y, w, w * .17, 20), { fill: PAL.ink, fillOp: 85 * k, bleed: .2, tex: .3, border: .1, ink: null }); }

// ---------- butterfly ----------
const BFLY_GREY = ['#BDB8C4', '#A9A3B3'], BFLY_BODY = '#3B3040';
// cols: [upper wing, lower wing]. key: a stable id for its boil seeds.
// sp: wing spread 0..1 (the flap is drawn flat: the wings just narrow, like a row of drawings). colK: 0 = grey, 1 = its colours.
function bfly(x, y, s, o) {
  const key = o.key || 'bf', sp = clamp(o.sp ?? 1, .14, 1), k = clamp(o.colK ?? 1), dr = o.droop || 0;
  const cA = mixCol(BFLY_GREY[0], o.cols[0], k), cB = mixCol(BFLY_GREY[1], o.cols[1], k), sw = clamp(s / 60, .45, 1.3);
  push(); translate(x, y); rotate(o.rot || 0);
  for (const sd of [-1, 1]) {
    boilSeed(key + 'wing' + sd);
    const Wp = pts => pts.map(([a, b]) => [sd * a * sp * s, (b + dr * a * .32) * s]);
    paint(Wp([[.05, 0], [.5, .06], [.8, .38], [.56, .74], [.2, .56], [.05, .2]]), { wash: cB, ink: PAL.ink, sw: sw * .55, br: 'inkfine', curv: .5 });
    paint(Wp([[.05, -.2], [.5, -.8], [1, -.76], [1.1, -.32], [.74, .04], [.05, .06]]), { wash: cA, ink: PAL.ink, sw: sw * .6, br: 'inkfine', curv: .5 });
    if (sp > .4) {
      const a = Wp([[.74, -.46]])[0], b = Wp([[.5, .4]])[0];
      paint(ellPts(a[0], a[1], .13 * s * sp, .13 * s, 10), { wash: mixCol('#E2DEE6', PAL.cream, k), ink: null });
      paint(ellPts(b[0], b[1], .08 * s * sp, .08 * s, 8), { wash: mixCol('#C9C4D0', o.cols[0], k), ink: null });
    }
  }
  boilSeed(key + 'body');
  paint(ribbon([[0, -.3 * s], [0, 0], [0, .46 * s]], .2 * s, .08 * s), { wash: BFLY_BODY, ink: null });
  paint(ellPts(0, -.38 * s, .13 * s, .12 * s, 10), { wash: BFLY_BODY, ink: null });
  const pk = o.perk || 0;
  for (const sd of [-1, 1]) inkLine([[sd * .04 * s, -.46 * s], [sd * .15 * s, -.68 * s - pk * .06 * s], [sd * (.3 - pk * .1) * s, -.8 * s - pk * .16 * s + dr * .2 * s]], sw * .45, BFLY_BODY, 'inkfine', .6);
  pop();
  boilSeed(key + 'after');
}

// ---------- a dab of paint ----------
// One dab as a single outline: a body along the path P (tail → head), w0 wide at the tail and w1 at the head, with
// rounded ends like a loaded brush leaves. flat 0..1 squares the ends off, so a landed dab fills its cell.
function daub(P, w0, w1, flat = 0) {
  const Cp = through(P, 4), n = Cp.length, L = [], R = [], e = lerp(1, .4, flat), pw = v => Math.sign(v) * Math.pow(Math.abs(v), e);
  const tan = i => { const a = Cp[Math.max(0, i - 1)], b = Cp[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; };
  for (let i = 0; i < n; i++) { const [tx, ty] = tan(i), w = lerp(w0, w1, i / (n - 1)) / 2; L.push([Cp[i][0] - ty * w, Cp[i][1] + tx * w]); R.push([Cp[i][0] + ty * w, Cp[i][1] - tx * w]); }
  const cap = (i, w, dir) => {   // half a (super)ellipse round the end at point i, from the L side to the R side (dir 1) or back (dir -1)
    const [tx, ty] = tan(i), r = w / 2, len = r * lerp(1, .5, flat), out = [];
    for (let j = 1; j < 6; j++) { const a = j / 6 * Math.PI, c = pw(Math.cos(a)) * dir, sn = pw(Math.sin(a)) * dir; out.push([Cp[i][0] - ty * r * c + tx * len * sn, Cp[i][1] + tx * r * c + ty * len * sn]); }
    return out;
  };
  return [...L, ...cap(n - 1, w1, 1), ...R.reverse(), ...cap(0, w0, -1)].map(p => [p[0] + jit(.8), p[1] + jit(.8)]);
}
// Each dab has a home cell on Clawd's body (in u, same coordinates as clawd()) and a colour of its own that turns to
// clay as it arrives. Legs and arms first, so the body's cells cover their roots.
function clawdDabs(hues) {
  const d = [];
  for (const lx of [-4, -2, 1, 3]) d.push({ x: lx + .5, y: -1.3, w: 1.05, h: 2.3, col: PAL.clayDk });
  for (const s of [-1, 1]) d.push({ x: s * 6, y: -4.5, w: 2.3, h: 1.05, col: PAL.clay });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
    const lit = r === 0 && (c === 1 || c === 2);
    d.push({ x: -5 + (c + .5) * 10 / 6, y: -8 + (r + .5) * 1.5, w: 10 / 6 * 1.1, h: 1.5 * 1.12, col: mixCol(PAL.clay, lit ? '#F5B394' : PAL.clayDk, lit ? .45 : r === 3 ? .4 : .05 + .12 * hash(r * 6 + c)) });
  }
  const order = d.map((_, i) => i).sort((a, b) => hash(a * 7.7 + 3) - hash(b * 7.7 + 3));
  order.forEach((i, rank) => { d[i].rank = rank / (d.length - 1); });
  return d.map((q, i) => ({ ...q, i, ang: hash(i * 3.1 + 1) * TAU, up: -Math.PI / 2 + (hash(i * 4.1 + 9) - .5) * 2.6 + q.x * .05, spin: (hash(i * 2.9 + 4) - .5) * 2.2, hue: hues[i % hues.length] }));
}
