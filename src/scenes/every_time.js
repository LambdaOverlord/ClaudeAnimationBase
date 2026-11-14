// every_time.js: "Every time", a 41-second film in ONE continuous shot on a single sheet of paper (see storyboards/every_time.md).
//   A butterfly hauls in a knot it can't undo. Strokes of every colour fly in and gather into Clawd. Clawd doesn't pull
//   at the knot: it sets the loose end on the ground, and the knot grows into a flower drawn with that same one line.
//   The butterfly leaves happy; Clawd comes apart again, content, and the flower stays. The camera pulls back: the page
//   is full of such flowers. Another butterfly arrives with its own knot, and Clawd gathers once more, just as glad.
// Flight paths, butterflies, dabs and sparkles come from src/extras.js. Everything is a pure function of t. Big events sit on bar lines (96 bpm, 2.5 s a bar): see the times below.
(() => {
  // ---------- places (world px; the camera moves, the world doesn't) ----------
  const G = 820, U = 22, BS = 84;                         // ground line, Clawd's unit, butterfly size
  const KX = 700, RK = 70, HANG = 150;  // the knot at rest (centre x, radius, centre y); how far it hangs under a butterfly
  const RX = 915, HS = 390, FR = 135, HC = [RX, G - HS];  // the flower: root x, head height, petal length, head centre
  const CX0 = 1235, CXP = 1069;                           // Clawd: where it gathers, where it stands to set the end down
  const NG = 1010, K2X = 2425, NX = 2700;                 // the second meeting: ground, knot, Clawd

  const C = {
    gold: '#F4B63F', petal: '#9486EC', petalDk: '#5B49B8', stem: '#5E9150', leaf: '#86BB6C', meadow: '#A9CF86', tuft: '#5F9A52',
    b1: ['#F08BA4', '#F7C24F'], b2: ['#55B7C9', '#F4EBD0'],
  };
  const HUES = [PAL.rose, PAL.teal, PAL.ochre, PAL.violet, PAL.sap, PAL.sky, PAL.indigo, '#F2A283', '#E2476E', '#8E82E8'];

  // ---------- times ----------
  const tIn = .3, tDown = 3.0, tTug1 = 3.5, tTug2 = 4.1, tGiveUp = 4.75, tDabs = 5.3, tPop = 7.5,
        tOpen = 8.15, tSee = 9.15, tLead = 10.0, tWalk0 = 10.9, tWalk1 = 11.7, tIdea = 12.5, tTake = 13.2, tHand = 13.6, tPlant = 13.9,
        tPat1 = 14.375, tPat2 = 14.6875, tGrow = 15.0, tPet = 15.5, tLineHold = 16.8, tCol = 17.5, tMead = 18.0, tHue = 18.2, tJoy = 18.6,
        tFront = 19.4, tPerch = 20.6, tToC = 21.6, tBoop = 22.5, tLift = 23.6, tGone = 25.3, tTurn = 26.4, tRest = 27.0, tFleck = 27.5,
        tThin = 27.9, tSwap = 28.3, tEmpty = 30.0, tPull0 = 30.8, tPull1 = 33.3, tB2 = 34.2, tDabs2 = 35.3, tSet2 = 36.7, tPop2 = 37.5,
        tOpen2 = 38.15, tIris = 39.5, tEnd = DUR;

  // ---------- camera: eased moves between holds; zoom is interpolated in log space ----------
  const CAMK = [
    [0, 890, 600, 1.3], [tDabs, 905, 604, 1.3], [tPop - .3, 945, 610, 1.26],
    [tOpen + .1, 1195, 692, 1.72], [tLead - .1, 1185, 690, 1.78],                 // push in: Clawd opens its eyes
    [tWalk0 + .5, 925, 655, 1.66], [tGrow - .2, 925, 660, 1.72],                  // two-shot at the knot
    [tGrow + 1.0, 950, 545, 1.28], [tCol, 950, 540, 1.3], [tPerch, 955, 545, 1.27], [tToC, 957, 547, 1.27],   // back out as it grows; hold while the butterfly rests on it
    [tBoop - .15, 1130, 620, 1.55], [tLift + .2, 1140, 620, 1.6],
    [tGone, 1010, 520, 1.3], [tTurn + .4, 1075, 610, 1.45], [tPull0, 1070, 615, 1.5],
    [tPull1, 1450, 640, .5], [tB2 + .5, 1460, 642, .5],                        // the garden
    [tPop2 - .15, 2560, 850, 1.3], [tEnd, 2562, 852, 1.36],                       // the second meeting
  ].map(([t, x, y, z]) => [t, [x, y, Math.log(z)]]);
  function cam(t) {
    const k = kf(t, CAMK);
    const hit = (t0, a) => t > t0 ? shakeXY(t, a * Math.exp(-(t - t0) * 9)) : [0, 0], s1 = hit(tPop, 6), s2 = hit(tGrow, 5), s3 = hit(tPop2, 6), s4 = hit(tDown + .05, 2.5);
    return [k[0] + s1[0] + s2[0] + s3[0] + s4[0], k[1] + s1[1] + s2[1] + s3[1] + s4[1], Math.exp(k[2])];
  }

  // ---------- the line: a knot, and the flower it becomes ----------
  const NP = 150, NS = 64, LW = .95;   // points in the tangle / head, and in the thread / stem
  const KNOT = (() => {
    const p = []; let m = 0;
    for (let i = 0; i < NP; i++) {
      const s = i / (NP - 1);
      const x = .9 * Math.sin(TAU * 4.3 * s + 1.3) * Math.cos(TAU * 1.27 * s + .2) + .42 * Math.sin(TAU * 11.3 * s + .4) + .2 * Math.cos(TAU * 6.7 * s);
      const y = .85 * Math.cos(TAU * 3.7 * s + .7) * Math.sin(TAU * .93 * s + 2.1) + .42 * Math.cos(TAU * 9.1 * s + 1.1) + .2 * Math.sin(TAU * 5.3 * s + 2);
      p.push([x, y]); m = Math.max(m, Math.hypot(x, y));
    }
    return p.map(([x, y]) => [x / m, y / m]);
  })();
  const KBOT = Math.max(...KNOT.map(p => p[1])), KY0 = G - KBOT * RK + 4, K2Y = NG - KBOT * RK + 4;   // centre height that rests the knot on the ground
  const knotPts = (c, r, sq = 0, rot = 0) => KNOT.map(p => { const q = rot2([p[0] * r * (1 + sq * .5), p[1] * r * (1 - sq)], rot); return [c[0] + q[0], c[1] + q[1]]; });
  // The loose end: NS points from A to B with some sag; via (weight w) is a hand holding it part-way.
  const V1 = .5, V2 = .68;   // where the two leaves leave the stem
  const VS = [...Array.from({ length: 14 }, (_, i) => i / 14 * V1), ...Array(17).fill(V1), ...Array.from({ length: 6 }, (_, i) => lerp(V1, V2, (i + 1) / 7)),
    ...Array(17).fill(V2), ...Array.from({ length: 10 }, (_, i) => lerp(V2, 1, (i + 1) / 10))];   // NS values: the stem's own spacing
  function thread(A, B, sag, via = null, w = 0, u = .7) {
    const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy) || 1;
    let nx = -dy / len, ny = dx / len; if (ny < -.2 || (Math.abs(ny) <= .2 && nx < 0)) { nx = -nx; ny = -ny; }   // slack bows down, or to the right when it hangs
    return VS.map(v => {
      const bow = sag * Math.sin(Math.PI * v), a = [lerp(A[0], B[0], v) + nx * bow, lerp(A[1], B[1], v) + ny * bow];
      if (w <= 0) return a;
      const b = v < u ? [lerp(A[0], via[0], ease(v / u)), lerp(A[1], via[1], v / u) + sag * .7 * Math.sin(Math.PI * v / u)] : mix2(via, B, (v - u) / (1 - u));
      return mix2(a, b, w);
    });
  }
  // A flower drawn with ONE line, relative to its root at (0, 0). From the centre of the head it traces n petals (a rose
  // curve), then runs down the stem and round two leaves to the root. The head centre is at (hx, -H).
  function flowerLine(n, R, hx, H, rotH = 0, leafK = 1, bow = 0, fat = .72) {
    const k = n % 2 ? n : n / 2, span = n % 2 ? Math.PI : TAU, th0 = Math.PI / (2 * k);
    const pt = th => { const c = Math.cos(k * th), r = R * Math.sign(c) * Math.pow(Math.abs(c), fat), p = rot2([r * Math.cos(th), r * Math.sin(th)], -Math.PI / 2 + rotH); return [hx + p[0], -H + p[1]]; };
    const head = []; for (let i = 0; i < NP; i++) head.push(pt(th0 + i / (NP - 1) * span));
    const petals = []; for (let j = 0; j < n; j++) { const P = []; for (let i = 0; i <= 14; i++) P.push(pt(th0 + (j + i / 14) * Math.PI / k)); petals.push(P); }
    const sp = v => [hx * Math.pow(1 - v, 1.6) + bow * Math.sin(Math.PI * v), -H * (1 - v)];
    const leaf = (v, sd) => {
      const P0 = sp(v), L = Math.min(.27 * H, R * .95) * leafK, wd = L * .26, dx = sd * .84, dy = -.54, P = [P0];
      for (let i = 1; i <= 8; i++) { const u = i / 8, b = Math.sin(Math.PI * u) * wd; P.push([P0[0] + dx * L * u - dy * b * sd, P0[1] + dy * L * u + dx * b * sd]); }
      for (let i = 7; i >= 1; i--) { const u = i / 8, b = -Math.sin(Math.PI * u) * wd * .75; P.push([P0[0] + dx * L * u - dy * b * sd, P0[1] + dy * L * u + dx * b * sd]); }
      P.push(P0); return P;
    };
    const v1 = V1, v2 = V2, L1 = leaf(v1, -1), L2 = leaf(v2, 1), stem = [];
    for (let i = 0; i < 14; i++) stem.push(sp(i / 14 * v1));
    stem.push(...L1);
    for (let i = 1; i <= 6; i++) stem.push(sp(lerp(v1, v2, i / 7)));
    stem.push(...L2);
    for (let i = 1; i <= 10; i++) stem.push(sp(lerp(v2, 1, i / 10)));
    return { head, petals, stem, leaves: [L1, L2], hc: [hx, -H] };
  }
  // Paint a flower's colour and line at its root. kPet(j), kLeaf, kHeart: 0..1 how far each part has bloomed.
  function flowerPaint(F, cols, o = {}) {
    const kPet = o.kPet || (() => 1), kLeaf = o.kLeaf ?? 1, kHeart = o.kHeart ?? 1, sw = o.sw ?? 1.5, R = o.R;
    F.petals.forEach((P, j) => {
      const k = kPet(j); if (k <= .02) return;
      paint(P.map(p => [F.hc[0] + (p[0] - F.hc[0]) * k, F.hc[1] + (p[1] - F.hc[1]) * k]), { wash: cols[0], fill: cols[1], fillOp: 55, bleed: .035, tex: .55, border: .25, ink: null });
    });
    if (kLeaf > .02) for (const Lf of F.leaves) paint(Lf.map(p => [Lf[0][0] + (p[0] - Lf[0][0]) * kLeaf, Lf[0][1] + (p[1] - Lf[0][1]) * kLeaf]), { wash: C.leaf, ink: null });
    if (o.line !== false) {
      inkLine((o.stemPts || F.stem).slice().reverse(), o.stemW ?? sw * 1.5, o.stemCol || C.stem, 'inkfine', .5);
      inkLine(o.headPts || F.head, sw, PAL.ink, 'inkfine', .5);
    }
    if (kHeart > .02) paint(ellPts(F.hc[0], F.hc[1], R * .2 * kHeart, R * .2 * kHeart, 14, .6), { wash: cols[2], ink: PAL.ink, sw: sw * .6 });
  }
  // A soft patch of meadow around a root: it spreads from t0, then tufts and tiny flowers pop up outward from the middle.
  function meadow(x, y, rx, t, t0, key) {
    const k = backOut(seg(t, t0, t0 + .9)); if (k <= .02) return;
    boilSeed('meadow' + key);
    paint(ellPts(x, y, rx * k, rx * .18 * k, 26, 3), { fill: C.meadow, fillOp: 150, bleed: .22, tex: .5, border: .2, ink: null });
    const n = Math.round(rx / 24);
    for (let i = 0; i < n; i++) {
      boilSeed('tuft' + key + i);
      const a = hash(i * 3.7 + rx) * TAU, d = .25 + .7 * hash(i * 5.1 + 2), px = x + Math.cos(a) * rx * d * .92, py = y + Math.sin(a) * rx * .15 * d;
      const kk = backOut(seg(t, t0 + .25 + d * .7, t0 + .5 + d * .7)); if (kk <= .02) continue;
      const s = rx / 340, swy = wob(t, .45, hash(i) * 3) * 4 * s;
      if (i % 4 === 3) paint(ellPts(px, py - 9 * s * kk, 5.5 * s * kk, 5.5 * s * kk, 8), { wash: [PAL.cream, C.b1[0], C.gold][i % 3], ink: PAL.ink, sw: .35 });
      else for (const q of [-1, 0, 1]) inkLine([[px + q * 5 * s, py], [px + q * 9 * s + swy, py - (17 + 8 * hash(i + q)) * s * kk]], .7, C.tuft, 'inkfine', .4);
    }
  }

  // ---------- Clawd as dabs of paint ----------
  // Each dab has a home cell on Clawd's body (in u, same coordinates as clawd()) and a colour of its own that turns to
  // clay as it arrives. Legs and arms first, so the body's cells cover their roots.
  const DABS = (() => {
    const d = [];
    for (const lx of [-4, -2, 1, 3]) d.push({ x: lx + .5, y: -1.3, w: 1.05, h: 2.3, col: PAL.clayDk });
    for (const s of [-1, 1]) d.push({ x: s * 6, y: -4.5, w: 2.3, h: 1.05, col: PAL.clay });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
      const lit = r === 0 && (c === 1 || c === 2);
      d.push({ x: -5 + (c + .5) * 10 / 6, y: -8 + (r + .5) * 1.5, w: 10 / 6 * 1.1, h: 1.5 * 1.12, col: mixCol(PAL.clay, lit ? '#F5B394' : PAL.clayDk, lit ? .45 : r === 3 ? .4 : .05 + .12 * hash(r * 6 + c)) });
    }
    const order = d.map((_, i) => i).sort((a, b) => hash(a * 7.7 + 3) - hash(b * 7.7 + 3));
    order.forEach((i, rank) => { d[i].rank = rank / (d.length - 1); });
    return d.map((q, i) => ({ ...q, i, ang: hash(i * 3.1 + 1) * TAU, up: -Math.PI / 2 + (hash(i * 4.1 + 9) - .5) * 2.6 + q.x * .05, spin: (hash(i * 2.9 + 4) - .5) * 2.2, hue: HUES[i % HUES.length] }));
  })();
  // One dab at progress k (0 = far along its curved path, 1 = home): a tapered stroke that trails behind while it flies
  // and squares up into its cell as it lands.
  function dab(d, home, u, k, o) {
    const ang = o.ang ?? d.ang, far = o.far, trail = o.trail ?? .11;
    const at = kk => { const a = ang + d.spin * (o.swirl ?? 1) * Math.pow(1 - kk, 1.5), r = far * (1 - kk); return [home[0] + Math.cos(a) * r, home[1] + Math.sin(a) * r]; };
    const horiz = d.w >= d.h, long = Math.max(d.w, d.h) * u, short = Math.min(d.w, d.h) * u * (o.size ?? 1), rest = ease(seg(k, .86, 1));
    const hl = Math.max(1, long / 2 - short * .25), sg = (horiz ? -Math.cos(ang) : -Math.sin(ang)) >= 0 ? 1 : -1, P = [];
    for (let i = 0; i < 4; i++) {
      const f = at(Math.max(0, k - trail * (1 - i / 3))), q = (i / 3 * 2 - 1) * hl * sg;
      P.push(mix2(f, horiz ? [home[0] + q, home[1]] : [home[0], home[1] + q], rest));
    }
    boilSeed('dab' + o.key + d.i);
    paint(daub(P, lerp(short * .3, short, rest), short, rest), { wash: o.col, washOp: o.op ?? 255, ink: null });
  }
  // Dabs fly in from beyond the frame between t0 and t1 and pack into Clawd's shape at (x, y).
  function gather(t, t0, t1, x, y, far, key) {
    if (t < t0 || t >= t1 + .18) return;   // gone the instant Clawd pops in
    const trav = 1.15, sq = .14 * ease(seg(t, t1 - .02, t1 + .16));   // the packed block squashes just before the pop
    for (const d of DABS) {
      const ts = t0 + d.rank * (t1 - t0 - trav), k = 1 - Math.pow(1 - seg(t, ts, ts + trav), 2.4); if (k <= 0) continue;
      dab(d, [x + d.x * U * (1 + sq * .6), y + d.y * U * (1 - sq)], U, k, { far, key, col: mixCol(d.hue, d.col, Math.pow(seg(k, 1 - 480 / far, .97), 1.5)) });
    }
  }
  // The reverse, gently: from t0 the dabs peel off (top ones first), drift up and away, take their own colours back, and fade.
  function scatter(t, t0, x, y, key) {
    for (const d of DABS) {
      const ts = t0 + (.55 * (d.y + 8) / 8 + .45 * d.rank) * .75, k = 1 - Math.pow(seg(t, ts, ts + 1.05), 1.7); if (k <= 0) continue;
      const settle = seg(t, t0, t0 + .3);
      dab(d, [x + d.x * U, y + d.y * U], U, k, { far: 430 + 260 * hash(d.i * 5.3 + 2), ang: d.up, swirl: .5, trail: .05, key, size: .45 + .55 * k,
        col: mixCol(d.hue, mixCol(PAL.clay, d.col, settle), Math.pow(k, 1.4)), op: 255 * clamp(k * 2.4) });
    }
  }

  // ---------- Clawd 1 ----------
  // The front arm's tip in the 3/4 view (the far arm, 'R'), in world px: the same transforms clawd() applies.
  function armTipQ(x, y, u, o) {
    const a = o.aR ?? .2, sq = o.sq || 0, f = o.flip ? -1 : 1, r = o.rot || 0;
    const lx = ((5 + .55 * clamp((Math.abs(a) - .7) / .9)) * u + 2.2 * u * Math.cos(a)) * f * (1 + sq * .6), ly = (-4.5 * u - 2.2 * u * Math.sin(a)) * (1 - sq);
    return [x + (o.dx || 0) * u + lx * Math.cos(r) - ly * Math.sin(r), y + (o.dy || 0) * u + lx * Math.sin(r) + ly * Math.cos(r)];
  }
  const HOP = [tGrow + .12, tGrow + .52];   // knocked back when the stem shoots up
  function c1(t) {
    const w = stroll(t, tWalk0, tWalk1, CX0, CXP, U);
    const x = t < tWalk0 ? CX0 : t < HOP[0] ? w.x : lerp(CXP, CX0, seg(t, HOP[0], HOP[1]));
    const flipped = t >= tWalk0 - .08 && t < tFront + .08, sl = v => flipped ? -v : v;   // sl: a screen-space look direction
    const look1 = kf(t, [[tOpen, [0, 0]], [tOpen + .3, [.9, -.1]], [tOpen + .62, [-.9, 0]]]);
    const follow = kf(t, [[tLift + .25, [-.3, -.9]], [tLift + .65, [-.9, 0]], [tLift + .95, [-.2, .8]], [tLift + 1.2, [.9, 0]], [tLift + 1.45, [.5, -.9]], [tGone, [-.7, -1]]]);
    const mood = emotions(t, [
      [tPop, 'neutral', { eyes: 'closed', aL: kf(t, [[tPop, 0], [tPop + .5, -.45]]), aR: kf(t, [[tPop, 0], [tPop + .5, -.45]]) }],
      [tOpen, 'neutral', { eyes: 'wide', lookX: look1[0], lookY: look1[1] }],
      [tSee, 'surprised', { lookX: -.9, lookY: -.2 }],
      [tSee + .5, 'happy', { lookX: -.8, lookY: -.2 }],
      [tLead + .25, 'neutral', { eyes: 'wide', mouth: 'o', lookX: sl(-.9), lookY: .1 }],
      [tWalk1 + .05, 'thinking', { lookX: sl(-.8), lookY: .45 }],
      [tIdea, 'idea', { lookX: sl(-.5), lookY: -.1 }],
      [tTake, 'neutral', { eyes: 'look', mouth: 'tongue', lookX: sl(-.8), lookY: kf(t, [[tTake, -.6], [tPlant, -.3], [tPlant + .3, .8]]) }],
      [tPlant + .32, 'neutral', { eyes: 'closed' }],
      [tGrow + .08, 'surprised', { lookX: sl(-.7), lookY: -.6 }],
      [tLineHold, 'hopeful', { lookX: sl(-.7), lookY: -.7 }],
      [tCol + .1, 'starstruck'],
      [tFront, 'happy', { lookX: -.7, lookY: -.4 }],
      [tToC + .25, 'neutral', { eyes: 'wide', mouth: 'smile', lookX: -.6, lookY: -.7 }],
      [tBoop + .04, 'neutral', { eyes: 'wide', mouth: 'o', lookX: 0, lookY: -1 }],
      [tBoop + .45, 'shy', { lookX: 0, lookY: -1 }],
      [tLift + .25, 'happy', { lookX: follow[0], lookY: follow[1] }],
      [tGone + .25, 'hopeful', { lookX: -.7, lookY: -.9 }],
      [tTurn, 'neutral', { mouth: 'smile', lookX: -.9, lookY: -.3 }],
      [tRest, 'relieved', { emote: null }],
    ]);
    let pose = {}, mk = 1;   // mk scales the mood's own bounce where the action needs a steadier body
    if (t >= tWalk0 - .15 && t < tWalk0) pose = turn(t, tWalk0 - .15, tWalk0, 0, -.25);
    else if (t >= tWalk0 && t < tWalk1) { pose = { view: 'side', flip: true, walk: w.walk, dy: w.dy }; mk = .35; }
    else if (t >= tWalk1 && t < tWalk1 + .12) pose = turn(t, tWalk1, tWalk1 + .12, -.25, -.125);
    else if (t >= tWalk1 + .12 && t < tFront) pose = { view: 'q', flip: true };
    else if (t >= tFront && t < tFront + .15) pose = turn(t, tFront, tFront + .15, -.125, 0);
    if (t >= tTake && t < HOP[0]) {   // reach up for the loose end, lower it, hold it to the ground
      pose.aR = kf(t, [[tTake, 1.5], [tHand - .06, .5], [tPlant, .5], [tPlant + .3, -1], [tGrow, -1], [HOP[0], .6]]);
      pose.rot = kf(t, [[tTake, 0], [tHand - .06, -.07], [tPlant, -.06], [tPlant + .3, -.2], [tGrow, -.2], [HOP[0], .08]]);
      pose.dy = 4 * Math.sin(pose.rot);   // tipping forward onto the front feet, not through the floor
      pose.sq = kf(t, [[tPlant, 0], [tPlant + .3, .12], [tGrow - .05, .12], [tGrow + .08, 0]]) + .1 * (Math.exp(-Math.max(0, t - tPat1) * 9) * (t > tPat1) + Math.exp(-Math.max(0, t - tPat2) * 9) * (t > tPat2));
      pose.aL = -.35; mk = kf(t, [[tTake, 1], [tHand - .1, .15], [tGrow, .15]]);
    }
    if (t >= HOP[0] - .12 && t < HOP[1] + .5) {
      const j = jump(t, HOP[0], HOP[1], 2.6), fl = seg(t, HOP[0], HOP[1]), air = t > HOP[0] && t < HOP[1] ? Math.sin(fl * Math.PI) : 0;
      pose.dy = (pose.dy || 0) + j.dy; pose.sq = (pose.sq || 0) + j.sq; pose.rot = (pose.rot || 0) + .16 * air;
      if (air > 0) { pose.aL = 1.2; pose.aR = 1.2; }
    }
    const wave = ease(seg(t, tLift + .7, tLift + .9)) * (1 - ease(seg(t, tGone + .4, tGone + .75)));
    if (wave > 0) pose.aL = lerp(mood.aL ?? .2, 1.25 + .45 * Math.sin((t - tLift) * 13), wave);
    const still = ease(seg(t, tFleck, tThin));   // settle into the plain pose the dabs share, before coming apart
    if (still > 0) { mk = 1 - still; pose.aL = lerp(mood.aL ?? .2, 0, still); pose.aR = lerp(mood.aR ?? .2, 0, still); }
    const o = { ...mood, ...pose, noShadow: true, boilKey: 'c1', swMul: lerp(1, .05, ease(seg(t, tThin, tSwap))) };
    const a = t - tPop, pop = a < .5 ? -.2 * Math.exp(-7 * a) * Math.cos(15 * a) : 0;
    o.sq = (mood.sq || 0) * mk + (pose.sq || 0) + pop; o.dy = (mood.dy || 0) * mk + (pose.dy || 0);
    o.rot = (mood.rot || 0) * mk + (pose.rot || 0); o.dx = (mood.dx || 0) * mk;
    o.sx = o.sy = lerp(.86, 1, backOut(seg(t, tPop, tPop + .25)));
    return { x, o };
  }
  const handAt = t => { const c = c1(t); return armTipQ(c.x, G, U, c.o); };
  const HAND = handAt(tHand);   // where the loose end changes hands

  // ---------- butterfly 1 ----------
  const B1K = [
    [tIn, 80, 215], [1.1, 250, 385], [1.9, 420, 450], [2.6, 620, 505], [tDown, KX + 2, KY0 - HANG + 4], [tDown + .3, KX + 4, KY0 - HANG + 40], [tTug1 - .05, KX + 4, KY0 - HANG + 44],   // hauls the knot in, sets it down, sags
    [tTug1 + .3, KX + 6, KY0 - HANG - 24], [tTug1 + .44, KX + 4, KY0 - HANG + 40], [tTug2 - .03, KX + 4, KY0 - HANG + 44], [tTug2 + .4, KX + 8, KY0 - HANG - 50], [tTug2 + .54, KX + 4, KY0 - HANG + 42],   // pulls up, twice, harder
    [tGiveUp + .45, KX + 2, KY0 - RK - 24], [5.85, KX, KY0 - RK - 24],                                                // gives up: sinks onto the knot
    [6.5, 610, 570], [7.3, 585, 520], [tPop + .12, 540, 498], [8.3, 620, 540],                                        // up to watch; startled by the pop
    [8.95, 955, 640], [tSee + .45, 968, 668], [tSee + .65, 968, 636], [tLead, 960, 640],                          // over to say hello, with a little dip
    [tLead + .52, KX + 132, G - 9 - .46 * BS], [tLead + 1, KX + 112, 640], [tTake, KX + 122, 648],                    // back for the loose end; lifts it
    [tHand, HAND[0] - 96, HAND[1] - 104 - .46 * BS], [tHand + .5, 640, 545], [14.5, 610, 500], [tGrow, 600, 505],                // hands it over, backs off to watch
    [tGrow + .28, 500, 465], [tPet + .6, 520, 440], [tLineHold, 590, 415], [tCol + .4, 600, 425], [tJoy, 600, 425],
    ...circleKeys(HC, Math.hypot(600 - HC[0], (425 - HC[1]) / .82), 235, Math.atan2((425 - HC[1]) / .82, 600 - HC[0]), 1.22, tJoy, tPerch - .3, 12).slice(1),   // a loop of joy round the flower
    [tPerch, HC[0] + 8, HC[1] - FR * .78 - .46 * BS], [tToC, HC[0] + 8, HC[1] - FR * .78 - .46 * BS],                 // rests on the top petal
    [tToC + .5, 1085, 520], [tBoop, CX0, G - 8 * U - .46 * BS], [tLift, CX0, G - 8 * U - .46 * BS],                   // lands on Clawd's head
    [tLift + .35, 1120, 540], [tLift + .65, 1060, 690], [tLift + .95, 1190, 800], [tLift + 1.2, 1390, 715], [tLift + 1.45, 1330, 540],   // once round Clawd,
    [tGone, 1050, 340], [tGone + .45, 640, 80], [tGone + .9, 380, -190],                                              // and away
  ];
  const kPerchKnot = t => ease(seg(t, tGiveUp + .3, tGiveUp + .5)) * (1 - ease(seg(t, 5.75, 6)));
  const kPerchFlower = t => ease(seg(t, tPerch - .12, tPerch)) * (1 - ease(seg(t, tToC, tToC + .12)));
  const kPerchHead = t => ease(seg(t, tBoop - .06, tBoop + .02)) * (1 - ease(seg(t, tLift, tLift + .12)));
  function b1pos(t) {
    const p = fly(t, B1K);
    if (t < tDown) { const c = frac(t * 1.6); p[1] -= 20 * (c < .25 ? ease(c / .25) : 1 - ease((c - .25) / .75)) * (1 - seg(t, tDown - .5, tDown)); }   // labouring: heave up, sink back
    const strain = Math.min(1, pull1(t) / 20) + .5 * bump(t, tLead + 1, tLead + 1.4, tTake);
    if (strain > 0) { const f = Math.floor(t * 24); p[0] += (hash(f * 1.3) - .5) * 7 * strain; p[1] += (hash(f * 2.1 + 5) - .5) * 5 * strain - 6 * strain * Math.abs(Math.sin(t * 9)); }
    const kf2 = kPerchFlower(t); if (kf2 > 0) { const s = flowerSway(t); p[0] += s * 1.2 * kf2; }
    const kh = kPerchHead(t); if (kh > 0) { const c = c1(t); p[0] += (c.x + (c.o.dx || 0) * U - CX0) * kh; p[1] += ((c.o.dy || 0) * U + 8 * U * (c.o.sq || 0)) * kh; }
    return p;
  }
  function b1(t) {
    const p = b1pos(t), vx = b1pos(t + .04)[0] - b1pos(t - .04)[0];
    const perchSad = kPerchKnot(t), perchGlad = Math.max(kPerchFlower(t), kPerchHead(t)), perch = Math.max(perchSad, perchGlad);
    const tired = t < tDown ? 1 : 0, strain = t > tTug1 - .1 && t < tGiveUp ? 1 : 0;
    const f = strain ? 11 : tired ? 6.5 : 7.5, flap = .5 + .5 * Math.cos(TAU * f * t), open = tired ? .85 : 1;
    const sitting = perchSad > 0 ? .2 + .12 * (.5 + .5 * Math.sin(t * 2.6)) : .3 + .7 * (.5 + .5 * Math.sin(t * 5.5));
    const colK = seg(t, tHue, tHue + .4);
    return { p, o: { key: 'b1', cols: C.b1, colK, sp: lerp(lerp(.15, 1, flap) * open, sitting, perch), rot: clamp(vx / 70, -.3, .3) * (1 - perch),
      droop: Math.max(tired * .5, perchSad, strain * .15) * (1 - colK), perk: seg(t, 5.9, 6.05) * (1 - perchGlad) } };
  }

  // ---------- the knot before it grows, and the loose end ----------
  const thud = (t, t0, a = .2) => t > t0 ? a * Math.exp(-9 * (t - t0)) * Math.cos(20 * (t - t0)) : 0;
  const pull1 = t => t > tDown && t < tGiveUp ? Math.max(0, KY0 - HANG - fly(t, B1K)[1]) : 0;   // how far the butterfly has hauled the knot off the ground
  const slack1 = t => t > tDown && t < tGiveUp ? clamp((fly(t, B1K)[1] - (KY0 - HANG)) / 36) : 0;
  function knot1(t) {
    const h = fly(t - .08, B1K), lift = pull1(t);
    const landed = ease(seg(t, tDown - .12, tDown + .08)), quiver = seg(t, tGrow - .28, tGrow);
    const sq = (thud(t, tDown + .05) + thud(t, tTug1 + .4, .16) + thud(t, tTug2 + .5, .24) + .07 * kPerchKnot(t) + .14 * quiver * quiver - .16 * Math.min(1, lift / 40)) * landed;
    const c = mix2([h[0], h[1] + HANG], [KX + 3.5 * Math.sin(t * 75) * quiver, KY0 - lift + RK * Math.max(0, sq) * .8], landed);
    const swing = clamp((fly(t - .22, B1K)[0] - fly(t, B1K)[0]) / 70, -.6, .6) * (1 - landed);
    return { c, sq, rot: swing };
  }
  const FLOP = [KX + 132, G - 3];
  function tip1(t) {   // the loose end's tip: carried, dropped, picked up again, handed to Clawd, set on the ground
    const feet = (() => { const p = b1pos(t); return [p[0], p[1] + .46 * BS]; })();
    let p = mix2(feet, [FLOP[0], FLOP[1] - 14 * Math.abs(spring(t, tGiveUp + .45, 7, 16))], easeIn(seg(t, tGiveUp + .05, tGiveUp + .45)));
    p = mix2(p, feet, ease(seg(t, tLead + .5, tLead + .62)));
    const w3 = ease(seg(t, tHand - .08, tHand + .08));
    if (w3 > 0) { const h = handAt(Math.min(t, tGrow)), e = ease(seg(t, tPlant, tPlant + .3)); p = mix2(p, [lerp(h[0], RX, e), lerp(h[1], G, e)], w3); }
    return p;
  }
  const flowerSway = t => 9 * Math.sin(t * 1.15) + 4 * Math.sin(t * 2.7 + 1);

  // The whole line at time t: tangle + thread before tGrow, then the stem straightens up from the root and the tangle
  // opens into petals one at a time (each petal's points share one morph, so they pop: 5 pops on quarter-second steps).
  function theLine(t) {
    const N = 5;
    if (t < tGrow) {
      const k = knot1(t), head = knotPts(k.c, RK, k.sq, k.rot), A = head[NP - 1], tip = tip1(t);
      const wv = ease(seg(t, tPlant, tPlant + .25)), slack = Math.max(0, 100 - Math.hypot(tip[0] - A[0], tip[1] - A[1]));
      const flat = seg(t, tGiveUp + .3, tGiveUp + .5) * (1 - seg(t, tLead + .5, tLead + .7));   // lying on the ground: no sag below it
      const onFloor = [k.c[0] + RK * .95, G - 5];
      const stem = wv > 0 ? thread(A, tip, 6, handAt(t), wv) : thread(A, tip, slack * .5 + 6 + 30 * slack1(t), onFloor, flat, .45);
      shadow(k.c[0], G + 5, RK * 1.15 * (1 - .5 * (1 - ease(seg(t, tDown - .5, tDown)))), ease(seg(t, tDown - .6, tDown)));
      boilSeed('line');
      inkLine(stem, LW, PAL.ink, 'inkfine', .5);
      inkLine(head.map(p => [p[0] + jit(1), p[1] + jit(1)]), LW, PAL.ink, 'inkfine', .5);
      return;
    }
    const g = seg(t, tGrow, tGrow + .7), settle = spring(t, tGrow + .7, 5, 13) * 12, sway = flowerSway(t) * seg(t, tGrow + .7, tGrow + 1.6) + settle;
    const shiver = Math.sin(t * 60) * 3 * bump(t, tCol - .22, tCol - .04, tCol + .1);
    const kc0 = [KX, KY0], hc = [lerp(kc0[0], HC[0] + sway + shiver, easeOut(g)), lerp(kc0[1], HC[1], backOut(g))];
    const leafK = backOut(seg(t, tGrow + .45, tGrow + 1));
    const F = flowerLine(N, FR, hc[0] - RX, G - hc[1], (sway + shiver) / HS * .7, leafK, 10 * easeOut(g));
    // head: tangle → petals, the petal nearest the stem first
    const spin = 2.8 * (1 - easeOut(seg(t, tGrow, tPet + 1.1))), rk = lerp(RK, RK * 1.12, g), per = NP / N;
    const head = F.head.map((p, i) => {
      const j = N - 1 - Math.min(N - 1, Math.floor(i / per)), fr = (i % per) / per, t0 = tPet + j * .25 + (1 - fr) * .08, q = backOut(seg(t, t0, t0 + .24));
      const kn = rot2([KNOT[i][0] * rk, KNOT[i][1] * rk], spin);
      return [lerp(hc[0] - RX + kn[0], p[0], q), lerp(hc[1] - G + kn[1], p[1], q)];
    });
    // stem: the thread lying on the ground stands up
    const A = [KX - RX + KNOT[NP - 1][0] * RK, KY0 - G + KNOT[NP - 1][1] * RK], hand = handAt(tGrow), th = thread(A, [0, 0], 6, [hand[0] - RX, hand[1] - G], 1 - seg(t, tGrow, tGrow + .1));
    const qs = easeOut(seg(t, tGrow, tGrow + .5)), stem = F.stem.map((p, i) => mix2(th[i], p, qs));
    const kCol = seg(t, tCol + .1, tCol + .6);
    push(); translate(RX, G);
    boilSeed('flower');
    flowerPaint(F, [C.petal, C.petalDk, C.gold], { R: FR, headPts: head.map(p => [p[0] + jit(.7), p[1] + jit(.7)]), stemPts: stem, sw: lerp(LW, 1.3, seg(t, tPet, tLineHold)),
      stemCol: mixCol(PAL.ink, C.stem, kCol), stemW: lerp(LW, 2.4, kCol),
      kPet: j => backOut(seg(t, tCol + j * .07, tCol + j * .07 + .38)), kLeaf: backOut(seg(t, tCol + .3, tCol + .7)), kHeart: backOut(seg(t, tCol - .14, tCol + .1)) });
    pop();
    // each petal lands with a little tick at its tip
    for (let j = 0; j < N; j++) { const jj = N - 1 - j, P = F.petals[jj], tipP = P[7]; burst(RX + tipP[0], G + tipP[1], 8, 26, 3, seg(t, tPet + j * .25 + .2, tPet + j * .25 + .5), PAL.ink, .7, Math.atan2(tipP[1] - F.hc[1], tipP[0] - F.hc[0]) - .5, Math.atan2(tipP[1] - F.hc[1], tipP[0] - F.hc[0]) + .5); }
    return hc;
  }

  // ---------- the garden: flowers from meetings Clawd doesn't remember (only ever seen in the pull-back) ----------
  const PINK = ['#F2A0B5', '#D9577E', '#F4B63F'], SUN = ['#F6C453', '#E09A2B', '#D9577E'], SNOW = ['#F6F0E4', '#CFC7B8', '#F4B63F'], CORAL = ['#F29C7A', '#D8623F', '#FFE08A'],
        AQUA = ['#7CC7D9', '#3A9C98', '#FFF5E2'], LILAC = ['#C9A2F0', '#8A62C7', '#F4B63F'];
  const GARDEN = [
    { x: -300, y: -150, s: .58, n: 6, c: LILAC }, { x: 240, y: -230, s: .5, n: 5, c: CORAL }, { x: 780, y: -110, s: .6, n: 8, c: SNOW, b: ['#E27A92', '#F7C24F'] },
    { x: 1330, y: -250, s: .5, n: 5, c: PINK }, { x: 1880, y: -90, s: .62, n: 7, c: SUN }, { x: 2480, y: -220, s: .55, n: 6, c: AQUA }, { x: 3060, y: -120, s: .6, n: 5, c: PINK },
    { x: -330, y: 330, s: .78, n: 5, c: SUN }, { x: 2130, y: 330, s: .8, n: 5, c: CORAL }, { x: 2640, y: 200, s: .72, n: 8, c: LILAC, b: ['#F7C24F', '#F29C7A'] },
    { x: 3080, y: 470, s: .86, n: 6, c: SUN }, { x: -150, y: 700, s: .95, n: 6, c: PINK, b: ['#55B7C9', '#F4EBD0'] }, { x: 3330, y: 800, s: 1, n: 5, c: AQUA },
    { x: -390, y: 1080, s: 1.1, n: 7, c: AQUA }, { x: 3270, y: 1270, s: 1.2, n: 8, c: PINK }, { x: 2190, y: 1530, s: 1.3, n: 7, c: AQUA, b: ['#C9A2F0', '#F6F0E4'] },
    { x: -260, y: 1680, s: 1.35, n: 5, c: CORAL }, { x: 3000, y: 1790, s: 1.45, n: 5, c: LILAC }, { x: 330, y: 1800, s: 1.4, n: 7, c: LILAC },
    { x: 1540, y: 1830, s: 1.45, n: 5, c: SUN }, { x: 920, y: 1930, s: 1.6, n: 6, c: CORAL },
  ];
  function garden(t) {
    GARDEN.forEach((f, i) => {
      const R = 100 * f.s, H = (310 + 50 * hash(i * 3.3)) * f.s, sway = (8 * Math.sin(t * 1.1 + i * 1.7) + 3 * Math.sin(t * 2.5 + i)) * f.s;
      meadow(f.x + 10 * f.s, f.y + 6 * f.s, 170 * f.s, t, -9, 'g' + i);
      const F = flowerLine(f.n, R, sway, H, sway / H * .7, 1, (hash(i * 7.1) - .5) * 40 * f.s, f.n > 6 ? .8 : .55 + .2 * hash(i * 2.3));
      push(); translate(f.x, f.y); boilSeed('gflower' + i);
      flowerPaint(F, f.c, { R, sw: clamp(1.3 * f.s, .8, 2) });
      pop();
      if (f.b) bfly(f.x + F.hc[0] + 6 * f.s, f.y + F.hc[1] - R * .78 - .46 * 40 * f.s, 40 * f.s, { key: 'gb' + i, cols: f.b, colK: 1, sp: .3 + .7 * (.5 + .5 * Math.sin(t * 4.3 + i * 2)) });
    });
  }

  // ---------- the second meeting ----------
  const B2K = [
    [tB2, 3470, 560], [34.9, 3180, 700], [35.7, 2800, 800], [tSet2 - .25, K2X + 60, K2Y - HANG - 14], [tSet2, K2X + 4, K2Y - HANG + 4], [tPop2, K2X + 2, K2Y - HANG + 12],
    [tPop2 + .14, K2X - 44, K2Y - HANG - 30], [tOpen2, K2X - 18, K2Y - HANG - 6], [tOpen2 + .7, K2X + 12, K2Y - HANG], [tOpen2 + .92, K2X + 14, K2Y - HANG + 30], [tOpen2 + 1.2, K2X + 12, K2Y - HANG - 4], [tEnd, K2X + 8, K2Y - HANG - 8],
  ];
  function b2pos(t) { const p = fly(t, B2K); if (t < tSet2) { const c = frac(t * 1.6 + .3); p[1] -= 20 * (c < .25 ? ease(c / .25) : 1 - ease((c - .25) / .75)) * (1 - seg(t, tSet2 - .5, tSet2)); } return p; }
  function c2(t) {
    const mood = emotions(t, [
      [tPop2, 'neutral', { eyes: 'closed', aL: kf(t, [[tPop2, 0], [tPop2 + .5, -.45]]), aR: kf(t, [[tPop2, 0], [tPop2 + .5, -.45]]) }],
      [tOpen2, 'neutral', { eyes: 'wide', lookX: -.85, lookY: -.25 }],
      [tOpen2 + .4, 'happy', { lookX: -.8, lookY: -.3 }],
    ]);
    const a = t - tPop2, pop = a < .5 ? -.2 * Math.exp(-7 * a) * Math.cos(15 * a) : 0, wave = ease(seg(t, tOpen2 + .55, tOpen2 + .75));
    const o = { ...mood, noShadow: true, boilKey: 'c2' };
    if (wave > 0) o.aL = lerp(mood.aL ?? .2, 1.25 + .45 * Math.sin((t - tOpen2) * 13), wave);
    o.sq = (mood.sq || 0) + pop; o.sx = o.sy = lerp(.86, 1, backOut(seg(t, tPop2, tPop2 + .25)));
    return o;
  }

  // ---------- the film ----------
  function film(t) {
    const cm = cam(t);
    camBegin(cm[0], cm[1], cm[2]);

    // ground
    if (t > tMead) meadow(RX + 25, G + 10, 340, t, tMead, 'main');
    if (t > tPull0 - .2) garden(t);

    // the line, and what happens at its root
    const hc = theLine(t);
    for (const tp of [tPat1, tPat2]) { burst(RX, G - 2, 8, 44, 7, seg(t, tp, tp + .32), C.gold, 1.1, Math.PI * 1.05, Math.PI * 1.95); sparkle(RX + (tp === tPat1 ? -30 : 34), G - 40, 15, seg(t, tp + .02, tp + .4)); }

    // Clawd 1: dabs → Clawd → dabs
    if (t >= tPop - .25 && t < tSwap + 1.3) boilSeed('c1shadow'), shadow(CX0 + (t >= tPop && t < tSwap ? c1(t).x - CX0 : 0), G + 3, U * 5.6 * (t >= tPop && t < tSwap ? 1 - Math.min(.4, Math.abs(c1(t).o.dy || 0) * .06) : 1), ease(seg(t, tPop - .25, tPop)) * (1 - ease(seg(t, tSwap + .2, tSwap + 1.2))));
    if (t >= tPop && t < tSwap) { const c = c1(t); clawd(c.x, G, U, c.o); }

    // butterfly 1, and its marks
    if (t < tGone + .9) {
      const b = b1(t); bfly(b.p[0], b.p[1], BS, b.o);
      boilSeed('b1marks');
      const sweat = seg(t, tTug2 + .15, tTug2 + .4) * (1 - seg(t, 5.7, 5.95)); if (sweat > 0) emote('sweat', b.p[0] + 62, b.p[1] - 56, 13, sweat, t - tTug2);
      if (t > tHue && t < tGone + .5) for (let i = 1; i <= 6; i++) { const tt = Math.floor((t - i * .09) * 12) / 12, q = b1pos(tt); if (Math.hypot(q[0] - b.p[0], q[1] - b.p[1]) > 46) sparkle(q[0] + (hash(tt * 31 + i) - .5) * 40, q[1] + 26 + (hash(tt * 17 + i) - .5) * 30, 13, (t - tt) / .75 + .05, i % 2 ? C.b1[1] : C.b1[0]); }
      burst(b.p[0], b.p[1], 40, 96, 9, seg(t, tHue, tHue + .45), C.b1[0], 1.1);
      const hk = seg(t, tBoop + .03, tBoop + .3) * (1 - seg(t, tBoop + 1.1, tBoop + 1.4)); if (hk > 0) emote('heart', CX0 + 96, G - 8 * U - 54 - 22 * seg(t, tBoop, tBoop + 1.4), 13, hk, t - tBoop);
    }

    // the second meeting
    if (t > tB2 - .1) {
      const bp = b2pos(t), h = fly(t - .08, B2K), landed = ease(seg(t, tSet2 - .12, tSet2 + .08)), sq = thud(t, tSet2 + .05) * landed;
      const kc = mix2([h[0], h[1] + HANG], [K2X, K2Y + RK * sq * .8], landed), swing = clamp((fly(t - .22, B2K)[0] - fly(t, B2K)[0]) / 70, -.6, .6) * (1 - landed);
      const head = knotPts(kc, RK, sq, swing), A = head[NP - 1], feet = [bp[0], bp[1] + .46 * BS];
      shadow(kc[0], NG + 5, RK * 1.15 * (1 - .5 * (1 - ease(seg(t, tSet2 - .5, tSet2)))), ease(seg(t, tSet2 - .6, tSet2)));
      boilSeed('line2');
      inkLine(thread(A, feet, 6 + Math.max(0, 100 - Math.hypot(feet[0] - A[0], feet[1] - A[1])) * .5), LW, PAL.ink, 'inkfine', .5);
      inkLine(head.map(p => [p[0] + jit(1), p[1] + jit(1)]), LW, PAL.ink, 'inkfine', .5);
      if (t >= tPop2 - .25) { boilSeed('c2shadow'); shadow(NX, NG + 3, U * 5.6, ease(seg(t, tPop2 - .25, tPop2))); }
      if (t >= tPop2) clawd(NX, NG, U, c2(t));
      const vx = b2pos(t + .04)[0] - b2pos(t - .04)[0], tired = t < tSet2 ? 1 : 0;
      bfly(bp[0], bp[1], BS, { key: 'b2', cols: C.b2, colK: .3, sp: lerp(.15, 1, .5 + .5 * Math.cos(TAU * (tired ? 6.5 : 7.5) * t)) * (tired ? .85 : 1), rot: clamp(vx / 70, -.3, .3), droop: tired * .5 + (1 - tired) * .15, perk: seg(t, tPop2 - 1.2, tPop2 - 1) });
    }

    // paint in the air
    gather(t, tDabs, tPop - .18, CX0, G, 1650, 'a');
    if (t >= tFleck && t < tSwap + .6) for (let i = 0; i < 5; i++) {   // the first few flecks lift off while Clawd is still whole
      const t0 = tFleck + i * .16, k = seg(t, t0, t0 + .9); if (k <= 0 || k >= 1) continue;
      boilSeed('fleck' + i);
      const fx = CX0 + (hash(i * 3.3) - .5) * 8.4 * U + 26 * Math.sin(k * 3 + i), fy = G - 8 * U - 6 - 150 * easeOut(k), r = 9 * Math.sin(Math.min(1, k * 4) * Math.PI / 2) * (1 - k * .5);
      paint(ellPts(fx, fy, r * 1.3, r, 9, 1), { wash: mixCol(PAL.clay, HUES[i * 3 % HUES.length], ease(k)), washOp: 255 * (1 - k * k), ink: null });
    }
    if (t >= tSwap && t < tEmpty + .6) scatter(t, tSwap, CX0, G, 'b');
    gather(t, tDabs2, tPop2 - .18, NX, NG, 3400, 'c');

    // pops and blooms
    for (const [tp, px, py] of [[tPop, CX0, G - 4 * U], [tPop2, NX, NG - 4 * U]]) {
      burst(px, py, 150, 250, 12, seg(t, tp, tp + .4), PAL.ink, 1.3, .13);
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .5, d = lerp(150, 235, easeOut(seg(t, tp, tp + .6))); sparkle(px + Math.cos(a) * d, py + Math.sin(a) * d * .8, 22, seg(t, tp + .04 * i, tp + .55 + .04 * i), HUES[i * 3 % HUES.length]); }
    }
    if (t > tCol - .05 && t < tCol + 1.6) {
      burst(HC[0], HC[1], 125, 230, 14, seg(t, tCol, tCol + .5), C.gold, 1.4);
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + .2, d = lerp(130, 430, easeOut(seg(t, tCol, tCol + 1.1))); sparkle(HC[0] + Math.cos(a) * d, HC[1] + Math.sin(a) * d * .8, 20, seg(t, tCol + .03 * i, tCol + .9 + .03 * i), i % 3 ? C.gold : C.petal); }
    }

    const focus = toScreen((NX + K2X) / 2 + 10, NG - 150);
    camEnd();

    // out: the picture closes to a circle around the two of them, holds, and shuts: back to the blank page
    if (t > tIris) {
      const r = t < tIris + .6 ? lerp(1300, 330, ease(seg(t, tIris, tIris + .6))) : t < tEnd - .8 ? lerp(330, 312, seg(t, tIris + .6, tEnd - .8)) : lerp(312, 0, easeIn(seg(t, tEnd - .8, tEnd - .35)));
      boilSeed('iris');
      iris(focus[0], focus[1], r, PAL.paper);
      if (r > 6) { const ring = ellPts(focus[0], focus[1], r, r, 44, 1.5); ring.push(ring[0]); inkLine(ring, 1.5, PAL.ink, 'ink', .5); }
    }
  }
  shots([[0, film]]);
})();
