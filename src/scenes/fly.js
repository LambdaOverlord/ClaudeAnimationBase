// fly.js: "Fly", a 45-second film (see storyboards/fly.md).
//   Under a low grey sky Clawd watches a butterfly climb into the clouds, and wants to fly too. It flaps its stubby arms;
//   it runs off a rock; it falls. The butterfly comes back and touches its head, and one of the dabs of paint Clawd is
//   made of lifts and flutters: every stroke of it is a pair of wings. So it jumps, and at the top of the jump it comes
//   apart into a flock that climbs through the cloud into a golden sky.
// Two worlds: below the cloud (one long moving shot) and above it, joined by flying through the cloud. Everything is a
// pure function of t; big events sit on bar lines (100 bpm, 2.4 s a bar). Helpers come from src/extras.js.
(() => {
  const U = 22, BS = 76;
  const ROSE = ['#F08BA4', '#F7C24F'], GOLD = '#F4B63F';
  const HUES = [PAL.rose, PAL.ochre, PAL.sap, '#8E82E8', PAL.sky, '#E2476E', '#5B6FD0', PAL.teal, PAL.violet, PAL.ochre];   // by dab index: the top row (6..11) gets blue, teal, violet, ochre, rose, ochre
  const DABS = clawdDabs(HUES);

  // ---------- times ----------
  const tVanish = 4.6, tAlone = 4.8, tArms = 5.1, tFlap1 = 7.2, tJump1 = 8.3, tLand1 = 8.95, tRock = 9.6, tWind = 10.2, tRun = 10.8, tLeap = 12.0,
        tHang = 12.55, tFall = 13.0, tLand = 13.6, tSad = 14.7, tBack = 16.2, tPerch = 17.8, tTap = 18.4, tUp1 = 18.5, tDown1 = 19.3, tTry = 20.6,
        tUp2 = 21.3, tIdea = 21.6, tHover = 22.2, tHover1 = 23.45, tCrouch = 24.0, tJump = 24.6, tBurst = 25.25, tCut = 28.8,
        tSpread = 30.2, tForm = 31.8, tSwoop = 33.6, tPack = 37.6, tPop = 38.4, tOpen = 39.0, tPerch2 = 40.0, tFlut = 40.8, tLook = 41.8, tOff = 42.4,
        tCrouch2 = 42.85, tJump2 = 43.2, tBurst2 = 43.55, tLight = 44.3, tEnd = DUR;

  // ---------- below the cloud: places ----------
  const SURF = [[-900, 960], [0, 842], [500, 794], [900, 778], [1180, 790], [1290, 704], [1440, 650], [1570, 628]];   // the hilltop, then up the rock
  const groundY = x => kf(x, SURF, k => k);
  const CX = 840, G1 = groundY(CX), LX = 1930, G2 = 1080;       // where Clawd stands; where it lands, under the drop
  const TAKE = [1500, groundY(1500)], APEX = [1790, 395];       // where it leaves the rock; the top of that leap
  const JUMPH = 21, TOP = [LX, G2 - JUMPH * U];                 // the last jump, in u; where it comes apart
  const SKY1 = '#A5A1BF', CEIL = '#DDD9E5', CEILDK = '#B9B3CA', HILL = '#7F9B82', HILLDK = '#647F6E', GRASS = '#93AE8C', ROCK = '#8D88A8', ROCKDK = '#6F6A8C';

  // ---------- above the cloud: places ----------
  const C2X = 900, C2Y = 852, SUN = [1560, 706], SEA = '#FFF8F0';
  const JUMP2H = 9, TOP2 = [C2X, C2Y - JUMP2H * U];

  // ---------- the rose butterfly ----------
  const BK1 = [
    [0, 380, 270], [.7, 610, 330], [1.4, 900, 290], [2.0, 1090, 400], [2.5, 1040, 520], [2.9, 870, 500], [3.3, 760, 380], [3.8, 880, 250], [4.2, 1010, 170], [tVanish, 1090, 90], [5.4, 1180, -200],
    [tBack - .4, 2230, 300], [tBack, 2190, 520], [16.7, 2170, 720], [17.1, 2130, 900], [17.45, 1790, 870], [tPerch, LX + 3.4 * U, G2 - 8 * U - .46 * BS], [19.75, LX + 3.4 * U, G2 - 8 * U - .46 * BS],   // back down, once round, onto its head
    [20.2, 1720, 850], [tIdea, 1705, 880],                                                                                    // off to one side, watching
    [tIdea + .35, 1760, 760], [tIdea + .7, 1960, 700], [tIdea + 1.05, 2160, 800], [tIdea + 1.4, 2130, 960], [tIdea + 1.75, 1760, 930], [tHover1 + .1, 1700, 800],   // round and round it
    [tCrouch + .4, 2090, 640], [tJump, 2110, 560], [tBurst, 2100, 520],                                                       // up ahead, waiting
    [25.9, 2080, 440], [26.5, 2030, 300], [27.2, 1900, 120], [27.8, 1790, -60], [28.3, 1740, -400], [tCut, 1710, -1000],                         // and it leads the way up
  ];
  const kHead1 = t => ease(seg(t, tPerch - .06, tPerch + .02)) * (1 - ease(seg(t, 19.75, 19.87)));

  // ---------- Clawd below the cloud ----------
  // where its feet are, and how it's getting there
  function at1(t) {
    if (t < tRun) return { x: CX, y: G1, slope: 0 };
    if (t < tLeap) { const k = Math.pow(seg(t, tRun, tLeap), 1.3), x = lerp(CX, TAKE[0], k); return { x, y: groundY(x), slope: (groundY(x + 8) - groundY(x - 8)) / 16, run: (x - CX) / (4 * U) * 1.2 }; }
    if (t < tHang) { const k = seg(t, tLeap, tHang); return { x: lerp(TAKE[0], APEX[0], k), y: lerp(TAKE[1], APEX[1], easeOut(k)), air: 1 }; }
    if (t < tFall) { const k = seg(t, tHang, tFall); return { x: APEX[0] + 34 * k, y: APEX[1] + 26 * k * k - 9 * Math.abs(Math.sin((t - tHang) * 15)), air: 1 }; }
    if (t < tLand) { const k = seg(t, tFall, tLand); return { x: lerp(APEX[0] + 34, LX, k), y: lerp(APEX[1] + 26, G2, k * k), air: 1 }; }
    return { x: LX, y: G2, slope: 0 };
  }
  const thud = (t, t0, a) => t > t0 ? a * Math.exp(-7 * (t - t0)) * Math.cos(18 * (t - t0)) : 0;
  const flapArm = (t, f = 6.5, lo = -.5, hi = 1.3) => lerp(lo, hi, .5 + .5 * Math.sin(TAU * f * t));
  // the top row of dabs (and a few named ones) can lift off the body and flap: how far each is up at time t (0..1)
  const TOPROW = [6, 7, 8, 9, 10, 11], DAB_A = 7, DAB_B = 10, DAB_C = 8;
  function liftOf(i, t) {
    let k = 0;
    if (i === DAB_A) k = Math.max(k, ease(seg(t, tUp1, tUp1 + .22)) * (1 - ease(seg(t, tDown1, tDown1 + .3))));
    if (i === DAB_B) k = Math.max(k, backOut(seg(t, tUp2, tUp2 + .2)) * (1 - ease(seg(t, tIdea + .35, tIdea + .6))));
    if (i === DAB_C) k = Math.max(k, backOut(seg(t, tUp2 + .16, tUp2 + .36)) * (1 - ease(seg(t, tIdea + .4, tIdea + .65))));
    if (TOPROW.includes(i)) {
      const st = (i - 6) * .05;
      k = Math.max(k, ease(seg(t, tHover + st, tHover + st + .2)) * (1 - ease(seg(t, tHover1 - .2 + st * .5, tHover1 + .05 + st * .5))) * .8);
      k = Math.max(k, ease(seg(t, tFlut + st, tFlut + st + .16)) * (1 - ease(seg(t, tFlut + .5 + st, tFlut + .72 + st))) * .7);
    }
    return k;
  }
  // drawn from clawd()'s draw hook, so the lifted dabs ride on the body through every squash and tilt
  function liftedDabs(t) {
    return (u) => {
      for (const i of TOPROW) {
        const k = liftOf(i, t); if (k <= .01) continue;
        const d = DABS[i], hx = d.x * u, hy = d.y * u, flap = .5 + .5 * Math.cos(TAU * (9.5 * t + i * .37));
        paint(rectPts(hx - d.w * u * .46, hy - d.h * u * .46, d.w * u * .92, d.h * u * .92), { wash: '#8A4530', ink: null });   // the slot it left
        tile(d, hx + Math.sin(t * 7 + i) * 3 * k, hy - (30 + 22 * (i === DAB_A || i === DAB_B || i === DAB_C ? 1 : .2)) * k, { m: k, sp: lerp(.2, 1, flap), col: mixCol(d.col, d.hue, clamp(k * 1.3)), key: 'lift', u, s: 31 });
      }
    };
  }
  const hoverK = t => ease(seg(t, tHover + .15, tHover + .5)) * (1 - ease(seg(t, tHover1 - .15, tHover1 + .12)));
  function c1(t) {
    const P = at1(t), b = fly(Math.min(t, tVanish), BK1), look = [clamp((b[0] - CX) / 230, -1, 1), clamp((b[1] - (G1 - 6 * U)) / 230, -1, 1)];
    const strain = seg(t, tTry, tUp2);
    const mood = emotions(t, [
      [0, 'hopeful', { lookX: look[0], lookY: look[1] }],
      [tAlone + .1, 'neutral', { eyes: 'sad', mouth: 'flat', lookX: .5, lookY: -.9 }],                                 // gone
      [tArms, 'neutral', { eyes: 'look', mouth: 'flat', lookX: kf(t, [[tArms, -.9], [tArms + .55, -.9], [tArms + .72, .9]]), lookY: .15 }],   // one arm, then the other
      [6.4, 'determined'],
      [tJump1 + .04, 'hopeful', { lookY: -.7 }],
      [tLand1 + .03, 'dizzy'],
      [tRock, 'thinking', { lookX: .9, lookY: -.3 }],
      [tWind, 'determined', { lookX: .8 }],
      [tLeap + .03, 'excited'],
      [tHang + .2, 'scared', { lookY: 1 }],
      [tLand + .03, 'ko'],
      [tSad, 'sad'],
      [tPerch + .08, 'neutral', { eyes: 'look', lookX: 0, lookY: -1, tint: 'blue', tintK: .15 }],
      [tUp1 + .12, 'surprised', { lookX: -.55, lookY: -1 }],
      [tDown1 + .45, 'confused', { lookX: -.3, lookY: -.8 }],
      [tTry, 'neutral', { eyes: 'squeeze', mouth: 'wobble', tint: 'flush', tintK: .6 * strain }],                      // trying to do it itself
      [tUp2 + .12, 'neutral', { eyes: ['squeeze', 'wide'], mouth: 'o', lookX: .5, lookY: -1 }],                        // one eye opens
      [tIdea, 'idea'],
      [tHover + .1, 'starstruck', { lookY: .9 }],
      [tHover1 + .2, 'excited'],
      [tCrouch, 'determined', { lookY: -.5 }],
      [tJump, 'hopeful', { lookY: -1 }],
    ]);
    let pose = {}, mk = 1;
    // reaching after the butterfly: one arm up, stretched tall, two little hops
    const reach = ease(seg(t, 2.5, 3.1)) * (1 - ease(seg(t, tAlone, tAlone + .4)));
    if (reach > 0) {
      const h1 = jump(t, 3.7, 4.0, 1.3), h2 = jump(t, 4.25, 4.6, 1.7);
      pose.aR = lerp(mood.aR ?? .2, 1.45 + .08 * Math.sin(t * 9), reach); pose.aL = lerp(mood.aL ?? .2, .5, reach); pose.sq = -.1 * reach + h1.sq + h2.sq; pose.dy = h1.dy + h2.dy; pose.rot = .05 * reach; mk = 1 - .8 * reach;
    }
    // testing the arms: a flap of the left, then of the right
    if (t >= tArms && t < 6.4) { pose.aL = lerp(-.2, flapArm(t - tArms, 4, -.3, 1.1), seg(t, tArms + .1, tArms + .2) * (1 - seg(t, tArms + .55, tArms + .65))); pose.aR = lerp(-.2, flapArm(t - tArms, 4, -.3, 1.1), seg(t, tArms + .78, tArms + .88) * (1 - seg(t, tArms + 1.2, tArms + 1.3))); }
    // attempt one: flap as hard as it can, and jump
    if (t >= tFlap1 && t < tLand1 + .5) {
      const on = seg(t, tFlap1, tFlap1 + .15) * (1 - seg(t, tLand1 - .02, tLand1 + .05)), j = jump(t, tJump1, tLand1, 3.4);
      pose.aL = lerp(mood.aL ?? .2, flapArm(t, 7), on); pose.aR = lerp(mood.aR ?? .2, flapArm(t + .04, 7), on);
      pose.sq = .14 * seg(t, tFlap1, tJump1 - .12) * (t < tJump1 - .12 ? 1 : 0) + j.sq * 1.4; pose.dy = j.dy + .12 * Math.sin(t * 80) * on * (t < tJump1 ? 1 : 0); mk = .2 + .8 * seg(t, tLand1 + .1, tLand1 + .5);
    }
    // attempt two: wind up, run up the rock, leap, hang, drop
    if (t >= tWind - .15 && t < tWind) pose = { ...pose, ...turn(t, tWind - .15, tWind, 0, .125) };
    else if (t >= tWind && t < tRun) { const w = ease(seg(t, tWind, tWind + .35)); pose = { view: 'q', rot: -.15 * w, sq: .15 * w, dx: -.9 * w, aL: -.6, aR: -.6 }; mk = .3; }
    else if (t >= tRun && t < tLeap) { pose = { view: 'side', walk: P.run, rot: Math.atan(P.slope) * .85 + .1, dy: -.35 * Math.abs(Math.sin(P.run * TAU)), aL: flapArm(t, 5, -.2, 1) }; mk = .2; }
    else if (t >= tLeap && t < tHang) { const k = seg(t, tLeap, tHang); pose = { view: 'side', rot: -.3 * (1 - k), sq: -.18 * (1 - k), aL: flapArm(t, 8), smear: .5 * (1 - k), smearDir: 1 }; mk = 0; }
    else if (t >= tHang && t < tFall) { pose = { ...turn(t, tHang, tHang + .14, .25, 0), aL: flapArm(t, 9), aR: flapArm(t + .05, 9) }; mk = .3; }
    else if (t >= tFall && t < tLand) { const k = seg(t, tFall, tLand); pose = { sq: -.24 * k, aL: 1.45, aR: 1.45, rot: .1 * Math.sin(t * 30) * k }; mk = 0; }
    else if (t >= tLand && t < tLand + .8) { pose = { sq: thud(t, tLand, .5) }; }
    // straining: a tremble; then hovering on a row of little wings
    if (strain > 0 && t < tIdea) { pose.dx = .1 * Math.sin(t * 90) * strain; pose.sq = .08 * strain; pose.aL = -.5; pose.aR = -.5; mk = .2; }
    const hv = hoverK(t);
    if (hv > 0) { pose.dy = -(2.1 + .25 * Math.sin(t * 9)) * hv; pose.aL = lerp(mood.aL ?? .2, flapArm(t, 8, -.1, 1.2), hv); pose.aR = lerp(mood.aR ?? .2, flapArm(t + .05, 8, -.1, 1.2), hv); mk = 1 - .85 * hv; pose.rot = .05 * Math.sin(t * 3.1) * hv; }
    if (t > tHover1 && t < tHover1 + .7) pose.sq = (pose.sq || 0) + thud(t, tHover1 + .1, .16);
    // the jump: a deep crouch, then everything it has
    if (t >= tCrouch) {
      const j = jump(t, tJump, tJump + 1.3, JUMPH), cr = ease(seg(t, tCrouch, tJump - .16));
      pose.sq = (t < tJump - .12 ? .3 * cr : 0) + j.sq * (t < tJump ? 1 : 1.5); pose.dy = j.dy; pose.aL = t < tJump ? lerp(mood.aL ?? .2, -1.1, cr) : 1.45; pose.aR = pose.aL; mk = t < tJump ? 1 - cr : 0;
    }
    const o = { ...mood, ...pose, noShadow: true, boilKey: 'c1' };
    o.sq = (mood.sq || 0) * mk + (pose.sq || 0); o.dy = (mood.dy || 0) * mk + (pose.dy || 0); o.rot = (mood.rot || 0) * mk + (pose.rot || 0); o.dx = (mood.dx || 0) * mk + (pose.dx || 0);
    if (liftOf(DAB_A, t) + liftOf(DAB_B, t) + liftOf(11, t) > .01) o.draw = liftedDabs(t);
    return { x: P.x, y: P.y, o, air: P.air || t >= tJump };
  }
  function bpos1(t) {
    const p = fly(t, BK1), kh = kHead1(t);
    if (kh > 0) { const c = c1(t); p[0] += (c.o.dx || 0) * U * kh; p[1] += ((c.o.dy || 0) * U + 8 * U * (c.o.sq || 0)) * kh - 16 * kh * (Math.abs(spring(t, tTap - .1, 9, 26)) + Math.abs(spring(t, tTap + .06, 9, 26))); }
    return p;
  }

  // ---------- a dab that is also a butterfly ----------
  // m 0..1 morphs a flat tile (the dab's cell on Clawd) into a small butterfly; sp is the wings' spread.
  function tile(d, x, y, o) {
    const u = o.u ?? U, m = clamp(o.m ?? 1), hw = d.w * u / 2, hh = d.h * u / 2, s = (o.s ?? 25) * u / U, sp = lerp(1, clamp(o.sp ?? 1, .16, 1), m);
    const R = [[0, -hh], [hw * .5, -hh], [hw, -hh], [hw, hh], [hw * .5, hh], [0, hh]], Wg = [[.04 * s, -.3 * s], [.5 * s, -.9 * s], [1.08 * s, -.72 * s], [.98 * s, .08 * s], [.6 * s, .78 * s], [.04 * s, .32 * s]];
    push(); translate(x, y); rotate((o.rot || 0) * m);
    boilSeed('tile' + o.key + d.i);
    for (const sd of [-1, 1]) paint(R.map((p, i) => [sd * lerp(p[0], Wg[i][0], m) * sp, lerp(p[1], Wg[i][1], m)]), { wash: o.col, ink: m > .3 ? PAL.ink : null, sw: .5 * m, br: 'inkfine', curv: .45 * m });
    if (m > .3) paint(ribbon([[0, -.36 * s], [0, 0], [0, .42 * s]], .17 * s * m, .07 * s * m), { wash: BFLY_BODY, ink: null });
    pop();
  }

  // ---------- the flock ----------
  // every dab, plus two dark ones where the eyes were. Each has its own wander, its own way out of a burst, its own wingbeat.
  const FLOCK = [...DABS, { x: -2.5, y: -6, w: 1.1, h: 2, col: PAL.ink, hue: '#3B3040', i: 30, rank: .3, eye: true }, { x: 2.5, y: -6, w: 1.1, h: 2, col: PAL.ink, hue: '#3B3040', i: 31, rank: .42, eye: true }]
    .map(d => ({ ...d, f1: 1.1 + 1.5 * hash(d.i * 1.7 + 5), f2: 1.3 + 1.3 * hash(d.i * 2.3 + 6), p1: hash(d.i * 3.9) * TAU, p2: hash(d.i * 4.7 + 1) * TAU, wa: 24 + 30 * hash(d.i * 5.9 + 2),
      ba: Math.atan2(d.y + 5, d.x) + (hash(d.i * 6.1 + 3) - .5) * 1.1, bamp: 120 + 200 * hash(d.i * 7.3 + 4), ff: 8 + 3.5 * hash(d.i * 8.1 + 5), fp: hash(d.i * 9.7 + 6) }));
  // st(t) describes the whole flock at a moment: F its path (the point Clawd's feet would be), S spread, A wander,
  // stream (how far the tail lags the head), m (0 tiles .. 1 butterflies), hue (0 clay .. 1 own colours), burst 0..1, size.
  function member(d, t, st) {
    const s = st(t), c = s.F(t - s.stream * (.03 + .32 * d.rank)), c0 = s.F(t - s.stream * (.03 + .32 * d.rank) - .06);
    const bank = clamp((c[0] - c0[0]) / 70, -.45, .45) * (s.bank ?? 1);
    const h = rot2([d.x * U * s.S * s.size, (d.y + 4) * U * s.S * s.size], bank * .6);
    const w = [Math.sin(t * d.f1 + d.p1) * d.wa * (d.eye ? .35 : 1), Math.cos(t * d.f2 + d.p2) * d.wa * .7 * (d.eye ? .35 : 1)];
    return [c[0] + h[0] + w[0] * s.A * s.size + Math.cos(d.ba) * d.bamp * s.burst, c[1] - 4 * U * s.size + h[1] + w[1] * s.A * s.size + Math.sin(d.ba) * d.bamp * s.burst * .8];
  }
  function flock(t, st, key) {
    const s = st(t);
    for (const d of FLOCK) {
      const p = member(d, t, st), q = member(d, t - .05, st), vx = p[0] - q[0], flap = .5 + .5 * Math.cos(TAU * (d.ff * t + d.fp));
      tile(d, p[0], p[1], { m: s.m, sp: lerp(.18, 1, flap), rot: clamp(vx / 26, -.5, .5), col: mixCol(d.col, d.hue, s.hue), s: (d.eye ? 27 : 32) * s.size, u: U * (s.m < 1 ? 1 : s.size), key });
    }
  }
  // below the cloud: burst out of the jump, tumble, gather into a stream, climb
  const FK1 = [[tBurst, TOP[0], TOP[1]], [25.85, TOP[0] + 12, TOP[1] + 70], [26.4, 2010, 480], [27.2, 1900, 250], [27.9, 1780, 40], [28.4, 1730, -330], [tCut, 1700, -900]];
  const st1 = t => { const a = t - tBurst; return { F: tt => fly(tt, FK1), S: lerp(1, 1.8, ease(seg(a, 0, .5))), A: ease(seg(a, .05, .5)), stream: ease(seg(a, .6, 1.3)), m: seg(a, 0, .16), hue: seg(a, .04, .45),
    burst: easeOut(seg(a, 0, .28)) * (1 - ease(seg(a, .4, 1.15))), size: 1 }; };
  // above it: out of the cloud like a fountain, wide across the sky, into Clawd's shape, a dive along the cloud tops, down to land
  const FK2 = [[tCut, 1100, 1180], [29.15, 1100, 840], [29.7, 1120, 500], [tSpread, 1180, 380], [31.2, 1260, 330], [tForm, 1300, 340], [32.8, 1150, 420], [tSwoop, 780, 360],
    [34.15, 520, 600], [34.6, 800, 742], [35.1, 1300, 728], [35.6, 1720, 520], [36.0, 1640, 270], [36.5, 1280, 290], [37.2, 980, 560], [tPack + .2, C2X, 780], [tPop - .1, C2X, C2Y], [tPop, C2X, C2Y]];
  const st2 = t => ({ F: tt => fly(tt, FK2),
    S: kf(t, [[tCut, 1.6], [tSpread, 1.7], [31.2, 3.8], [tForm - .3, 3.4], [tForm + .7, 2.1], [tSwoop, 2.1], [tSwoop + .5, 1.6], [tPack - .4, 1.5], [tPop - .15, 1]]),
    A: kf(t, [[tCut, 1], [tSpread, 1], [31.2, 2.4], [tForm - .3, 2.2], [tForm + .7, .1], [tSwoop, .1], [tSwoop + .5, .8], [tPack - .3, .8], [tPop - .2, 0]]),
    stream: kf(t, [[tCut, 1], [tSpread, 1], [31.2, .25], [tForm, .2], [tForm + .7, .1], [tSwoop, .1], [tSwoop + .4, 1], [tPack - .5, 1], [tPop - .2, 0]]),
    m: 1 - ease(seg(t, tPop - .32, tPop - .1)), hue: kf(t, [[tPack, 1], [tPop - .2, 0]]), burst: 0, size: 1, bank: kf(t, [[tForm, 1], [tForm + .6, 0], [tSwoop, 0], [tSwoop + .3, 1]]) });
  // and off again, into the sun
  const FK3 = [[tBurst2, TOP2[0], TOP2[1]], [43.95, 960, 600], [44.5, 1280, 610], [45.3, 1540, 645], [tEnd + .3, 1570, 648]];
  const st3 = t => { const a = t - tBurst2; return { F: tt => fly(tt, FK3), S: lerp(1, 1.5, ease(seg(a, 0, .4))), A: ease(seg(a, .05, .45)), stream: ease(seg(a, .35, .9)), m: seg(a, 0, .14), hue: seg(a, .04, .4),
    burst: easeOut(seg(a, 0, .24)) * (1 - ease(seg(a, .3, .85))) * .7, size: lerp(1, .32, ease(seg(t, tBurst2 + .5, tEnd - .3))) }; };

  // ---------- Clawd above the cloud ----------
  const BK2 = [[tCut, 1150, 1150], [29.05, 1150, 760], [29.6, 1190, 400], [tSpread, 1360, 260]];
  function bpos2(t) {
    if (t < tSpread) return fly(t, BK2);
    if (t < tPack + .3) { const f = fly(t + .32, FK2), k = ease(seg(t, tSpread, tSpread + .5)) * (1 - ease(seg(t, tPack - .5, tPack + .3))); const p0 = fly(Math.min(t, tSpread), BK2), land = [1110, 690];
      const R = lerp(170, 330, ease(seg(t, tForm, tForm + .6)) * (1 - ease(seg(t, tSwoop, tSwoop + .4)))), q = [f[0] + R * Math.cos(t * 1.9), f[1] - 40 + R * .62 * Math.sin(t * 2.6)]; return t < tSpread + .5 ? mix2(p0, q, k) : mix2(land, q, k); }
    const c = c2(t), head = [C2X + 3.4 * U + (c.dx || 0) * U, C2Y + cloudDip(t) + (c.dy || 0) * U - 8 * U * (1 - (c.sq || 0)) - .46 * BS * sizeB(t)];
    const K = [[tPack + .3, 1110, 690], [tPop + .2, 1120, 680], [tPerch2 - .5, 1090, 650], [tPerch2, head[0], head[1]], [tOff, head[0], head[1]], [tOff + .45, 1040, 610], [tJump2, 1130, 590], [tBurst2, 1160, 585], [44.5, 1400, 615], [45.3, 1550, 645], [tEnd + .3, 1575, 648]];
    return fly(t, K);
  }
  const sizeB = t => lerp(1, .34, ease(seg(t, tBurst2 + .4, tEnd - .3)));
  const cloudDip = t => 16 * Math.abs(spring(t, tPop, 5, 11)) + 5 * seg(t, tPop, tPop + .2) * (1 - seg(t, tJump2, tJump2 + .2)) - 10 * Math.abs(spring(t, tJump2, 6, 12));
  function c2(t) {
    const sun = { lookX: .85, lookY: -.1 };
    const mood = emotions(t, [
      [tPop, 'neutral', { eyes: 'closed', aL: kf(t, [[tPop, 0], [tPop + .5, -.45]]), aR: kf(t, [[tPop, 0], [tPop + .5, -.45]]) }],
      [tOpen, 'starstruck', sun],
      [tOpen + .9, 'happy', { lookX: .7, lookY: -.2 }],
      [tPerch2 + .05, 'neutral', { eyes: 'wide', mouth: 'smile', lookX: 0, lookY: -1 }],
      [tFlut - .1, 'neutral', { eyes: 'closed', mouth: 'smile' }],                                   // it knows how, now
      [tFlut + .85, 'happy', { lookX: 0, lookY: -.8 }],
      [tOff + .1, 'hopeful', { lookX: .8, lookY: -.5 }],
      [tCrouch2, 'determined', { lookX: .7, lookY: -.4 }],
      [tJump2, 'hopeful', { lookX: .5, lookY: -1 }],
    ]);
    const a = t - tPop, pop = a < .5 ? -.2 * Math.exp(-7 * a) * Math.cos(15 * a) : 0, j = jump(t, tJump2, tJump2 + .7, JUMP2H), cr = ease(seg(t, tCrouch2, tJump2 - .14));
    const o = { ...mood, noShadow: true, boilKey: 'c2' };
    let mk = t >= tCrouch2 ? (t < tJump2 ? 1 - cr : 0) : 1;
    o.sq = (mood.sq || 0) * mk + pop + (t >= tCrouch2 && t < tJump2 - .12 ? .28 * cr : 0) + (t >= tJump2 - .12 ? j.sq * 1.4 : 0); o.dy = (mood.dy || 0) * mk + j.dy; o.rot = (mood.rot || 0) * mk; o.dx = (mood.dx || 0) * mk;
    if (t >= tCrouch2) { o.aL = t < tJump2 ? lerp(mood.aL ?? .2, -1.1, cr) : 1.45; o.aR = o.aL; }
    o.sx = o.sy = lerp(.86, 1, backOut(seg(t, tPop, tPop + .25)));
    if (liftOf(6, t) + liftOf(11, t) > .01) o.draw = liftedDabs(t);
    return o;
  }

  // ---------- cameras: eased moves between holds; zoom in log space ----------
  const logz = K => K.map(([t, x, y, z]) => [t, [x, y, Math.log(z)]]);
  const CAM1 = logz([
    [0, 900, 420, 1.05], [tVanish - .4, 890, 405, 1.05],
    [tArms + .4, 850, 575, 1.5], [tLand1 + .4, 850, 585, 1.5],                                   // in on Clawd and its arms
    [tWind + .3, 1010, 520, 1.12], [tRun + .2, 1030, 520, 1.12], [tLeap, 1470, 500, 1.15],       // the rock; run with it
    [tHang + .12, 1800, 440, 1.3], [tFall, 1815, 450, 1.3],                                      // the hang
    [tLand + .02, LX, 930, 1.3], [tSad, LX, 945, 1.5], [tBack + .6, LX, 925, 1.5],               // whip down with the fall
    [tPerch + .3, LX, 905, 1.78], [tUp2, LX, 905, 1.8], [tHover + .3, LX, 880, 1.5], [tCrouch + .3, LX, 885, 1.38],
    [tJump, LX, 870, 1.3], [tBurst, LX, 640, 1.05], [26.5, 1940, 450, .95], [27.4, 1860, 200, .9], [28.1, 1770, -120, .9], [28.55, 1720, -780, .9], [tCut, 1700, -900, .9],
  ]);
  const CAM2 = logz([
    [tCut, 1150, 575, 1], [tSpread + .5, 1200, 470, .9], [tSwoop, 1080, 470, .93], [34.7, 930, 590, 1], [36.0, 1340, 470, .95],
    [tPack, 1010, 640, 1.2], [tPop + .25, 950, 725, 1.62], [tOff + .3, 965, 715, 1.6], [tBurst2 + .3, 1120, 620, 1.2], [tEnd, 1300, 600, 1.12],
  ]);
  function cam(t) {
    const k = kf(t, t < tCut ? CAM1 : CAM2), hit = (t0, a) => t > t0 ? shakeXY(t, a * Math.exp(-(t - t0) * 9)) : [0, 0];
    const s = [hit(tLand1, 4), hit(tLand, 10), hit(tBurst, 5), hit(tPop, 5), hit(tBurst2, 4)].reduce((a, b) => [a[0] + b[0], a[1] + b[1]], [0, 0]);
    return [k[0] + s[0], k[1] + s[1], Math.exp(k[2])];
  }

  // ---------- painting the two worlds ----------
  const scallops = (x0, x1, step, y, amp, wl, ph) => { const P = []; for (let x = x0; x <= x1; x += step) P.push([x, y - amp * Math.pow(Math.abs(Math.sin(x / wl + ph)), .7) - amp * .35 * Math.sin(x / (wl * 2.7) + ph * 1.7)]); return through(P, 3); };
  function below(t) {
    boilSeed('sky1');
    paint(rectPts(-1200, -2900, 5000, 4800), { wash: SKY1, ink: null });
    paint(ellPts(1200, 820, 2100, 300, 30, 12), { fill: '#D9CBD6', fillOp: 120, bleed: .3, tex: .5, ink: null });     // paler toward the horizon
    boilSeed('far');
    paint(through([[-1200, 1700], [-1200, 800], [-500, 730], [100, 770], [700, 715], [1300, 765], [1900, 720], [2500, 770], [3200, 735], [3800, 790], [3800, 1700]], 5), { wash: '#9596B8', ink: null });
    paint(through([[1300, 1700], [1300, 930], [1750, 880], [2300, 910], [2900, 860], [3800, 900], [3800, 1700]], 5), { wash: '#8587AD', ink: null });
    boilSeed('low');   // the ground under the drop
    paint([[1450, 1104], [1700, 1084], [2300, 1078], [3000, 1092], [3800, 1074], [3800, 1900], [1450, 1900]], { wash: HILLDK, fill: '#55705F', fillOp: 70, bleed: .05, tex: .6, ink: null });
    inkLine([[1570, 1094], [1900, 1081], [2300, 1078], [3000, 1092], [3800, 1074]], .9, PAL.ink, 'ink', .3);
    boilSeed('hill');
    paint([...SURF.slice(0, 5), [1575, 802], [1588, 1900], [-900, 1900]], { wash: HILL, fill: HILLDK, fillOp: 70, bleed: .05, tex: .6, ink: null });
    paint([[1478, 800], [1578, 800], [1590, 1110], [1460, 1110]], { fill: '#4F6558', fillOp: 150, bleed: .06, tex: .7, ink: null });   // the drop's face
    inkLine([...SURF.slice(0, 5), [1575, 802]], 1, PAL.ink, 'ink', .3); inkLine([[1576, 800], [1584, 950], [1586, 1100]], 1, PAL.ink, 'ink', .2);
    boilSeed('rock');
    paint([[1180, 794], [1290, 704], [1440, 650], [1570, 628], [1586, 700], [1580, 804]], { wash: ROCK, fill: ROCKDK, fillOp: 90, bleed: .05, tex: .7, ink: PAL.ink, sw: 1, curv: .15 });
    for (let i = 0; i < 16; i++) {   // tufts along the hilltop, and under the drop
      boilSeed('tuft1' + i);
      const x = i < 10 ? 120 + i * 108 + 40 * hash(i) : 1660 + (i - 10) * 190 + 60 * hash(i), y = i < 10 ? groundY(x) + 3 : 1082 + 3, sw = wob(t, .5, hash(i) * 3) * 5;
      for (const q of [-1, 0, 1]) inkLine([[x + q * 7, y], [x + q * 11 + sw, y - 20 - 9 * hash(i + q)]], .7, GRASS, 'inkfine', .4);
    }
  }
  function ceiling(t) {   // the underside of the cloud: drawn over whatever flies up into it
    boilSeed('ceil');
    const edge = []; for (let x = -1200; x <= 3900; x += 110) edge.push([x, 118 + 46 * Math.sin(x * .0105 + .15 * t) + 24 * Math.sin(x * .031 + 1 - .1 * t)]);
    const sm = through(edge, 4);
    paint([...sm, [3900, -3000], [-1200, -3000]], { wash: CEIL, ink: null });
    paint([...sm.map(([x, y]) => [x, y + 6]), ...edge.slice().reverse().map(([x, y]) => [x, y - 150 - 30 * Math.sin(x * .02)])], { fill: CEILDK, fillOp: 150, bleed: .2, tex: .5, border: .1, ink: null });
  }
  // Dawn above the cloud, painted in bands from deep blue down to gold, like broad strokes of a wide brush.
  const SKYB = ['#5F9FDE', '#83B9E8', '#ACD2EE', '#D6E6E4', '#F8E3BE', '#FFD69B', '#FFC680'], BANDY = [150, 255, 350, 440, 525, 610];
  function above(t) {
    boilSeed('sky2');
    paint(rectPts(-900, -1400, 4400, 3600), { wash: SKYB[6], ink: null });
    for (let i = 5; i >= 0; i--) {
      boilSeed('band' + i);
      const edge = []; for (let x = -900; x <= 3500; x += 220) edge.push([x, BANDY[i] + 20 * Math.sin(x * .0031 + i * 1.9) + 9 * Math.sin(x * .011 + i)]);
      paint([...through(edge, 4), [3500, -1400], [-900, -1400]], { wash: SKYB[i], ink: null });
    }
    boilSeed('cirrus');   // a few high streaks catching the light
    for (const [x, y, w, c] of [[420, 250, 520, '#FFF3DC'], [1750, 180, 640, '#FFE9D2'], [1050, 395, 440, '#FFF6E6'], [2350, 330, 500, '#FFEFDA']])
      paint(ribbon([[x - w / 2 + 30 * Math.sin(t * .11), y + 10], [x, y - 12], [x + w / 2 + 30 * Math.sin(t * .11), y + 4]], 3, 30), { wash: c, washOp: 215, ink: null });
    // the sun, half risen out of the cloud
    boilSeed('sun');
    const fl = seg(t, tLight, tEnd - .25);
    glow(SUN[0], SUN[1], 600 + 900 * fl, '#FFE2A0', .9); glow(SUN[0], SUN[1], 300 + 700 * fl, '#FFF4D0', 1);
    for (let i = 0; i < 14; i++) { const a = Math.PI + (i + .5) / 14 * Math.PI + .04 * Math.sin(t * .7 + i), r0 = 158 + 10 * Math.sin(t * 2 + i), r1 = r0 + 44 + 30 * Math.sin(t * 1.3 + i * 2.1); inkLine([[SUN[0] + Math.cos(a) * r0, SUN[1] + Math.sin(a) * r0], [SUN[0] + Math.cos(a) * r1, SUN[1] + Math.sin(a) * r1]], 1.2, '#FFB85C', 'ink', 0); }
    paint(ellPts(SUN[0], SUN[1], 128, 128, 28, 1.5), { wash: '#FFF9E2', ink: '#F4B63F', sw: .8 });
    // the sea of cloud, far to near: rosy in the distance, brighter and bigger as it comes closer
    boilSeed('sea0'); paint([...scallops(-900, 3500, 50, 706, 20, 130, .3 + t * .015), [3500, 2200], [-900, 2200]], { wash: '#F3BFAF', ink: null });
    boilSeed('sea1'); paint([...scallops(-900, 3500, 60, 742, 30, 185, 1.1 + t * .02), [3500, 2200], [-900, 2200]], { wash: '#F9D5C1', ink: null });
    boilSeed('sea2'); paint([...scallops(-900, 3500, 80, 792, 46, 255, 2.0 + t * .03), [3500, 2200], [-900, 2200]], { wash: '#FEE8D6', ink: null });
    boilSeed('sea2s'); paint([...scallops(-900, 3500, 80, 840, 30, 255, 2.3 + t * .03), [3500, 1000], [-900, 1000]], { fill: '#E3B6CB', fillOp: 70, bleed: .15, tex: .4, border: .1, ink: null });
  }
  function nearCloud(t) {   // drawn after the flock skims the far cloud tops: the landing cloud and the nearest bank
    boilSeed('land');
    const dip = cloudDip(t), sag = dx => dip * Math.exp(-Math.pow(dx / 170, 2));
    const top = through([[-380, 1010], [-345, 950], [-285, 918], [-238, 926], [-192, 882], [-130, 859], [-60, 852], [60, 852], [128, 858], [186, 886], [238, 908], [292, 902], [338, 944], [384, 1010]].map(([dx, y]) => [C2X + 10 + dx, y + sag(dx)]), 5);
    paint([...top, [C2X + 394, 1200], [C2X - 370, 1200]], { wash: '#FFFDF8', ink: null });
    paint(ellPts(C2X + 60, 985, 300, 44, 22, 3), { fill: '#C9B5DE', fillOp: 100, bleed: .15, tex: .4, border: .1, ink: null });               // its shaded foot
    inkLine(top, .8, '#8D7EAE', 'inkfine', .5);
    for (const [dx, w, y] of [[-205, 110, 930], [-20, 170, 905], [200, 120, 940]]) inkLine([[C2X + dx - w / 2, y + 14 + sag(dx)], [C2X + dx, y + sag(dx)], [C2X + dx + w / 2, y + 16 + sag(dx)]], .6, '#B9A6D2', 'inkfine', .6);
    boilSeed('sea3'); paint([...scallops(-900, 3500, 100, 1012, 68, 370, 2.2 + t * .04), [3500, 2400], [-900, 2400]], { wash: '#FFF8F0', ink: null });
    boilSeed('sea3s'); paint([...scallops(-900, 3500, 100, 1075, 44, 370, 2.5 + t * .04), [3500, 1400], [-900, 1400]], { fill: '#D0BFE4', fillOp: 85, bleed: .15, tex: .4, border: .1, ink: null });
  }

  // ---------- the film ----------
  function under(t) {
    const cm = cam(t); camBegin(cm[0], cm[1], cm[2]);
    below(t);
    const c = c1(t), b = bpos1(t), bv = bpos1(t + .04)[0] - bpos1(t - .04)[0], onHead = kHead1(t);
    if (t < tBurst) {
      const gy = c.x > 1575 ? G2 : groundY(c.x), h = gy - c.y - (c.o.dy || 0) * U;
      boilSeed('c1shadow'); shadow(c.x, gy + 3, U * 5.6 * (1 - Math.min(.55, h / 700)), clamp(1 - h / 520));
      clawd(c.x, c.y, U, c.o);
      boilSeed('fx1');
      for (const [t0, x, y] of [[tLand1, CX, G1], [tLand, LX, G2]]) burst(x, y - 4, 70, 150, 7, seg(t, t0, t0 + .35), PAL.ink, 1, Math.PI * 1.05, Math.PI * 1.95);   // dust kicked up on landing
    } else flock(t, st1, 'a');
    if (t < 5.6 || t > tBack - .4) bfly(b[0], b[1], BS, { key: 'rose', cols: ROSE, colK: 1, sp: lerp(lerp(.15, 1, .5 + .5 * Math.cos(TAU * 7.5 * t)), .3 + .7 * (.5 + .5 * Math.sin(t * 5.5)), onHead), rot: clamp(bv / 70, -.3, .3) * (1 - onHead) });
    boilSeed('fx2');
    burst(TOP[0], TOP[1] - 4 * U, 150, 300, 14, seg(t, tBurst, tBurst + .45), PAL.ink, 1.3, .13);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .4, d = lerp(150, 290, easeOut(seg(t, tBurst, tBurst + .6))); sparkle(TOP[0] + Math.cos(a) * d, TOP[1] - 4 * U + Math.sin(a) * d * .8, 24, seg(t, tBurst + .03 * i, tBurst + .6 + .03 * i), HUES[i * 3 % HUES.length]); }
    ceiling(t);
    const eye = toScreen(b[0], b[1]);
    camEnd();
    if (t < .75) iris(eye[0], eye[1], lerp(0, 1500, easeIn(seg(t, .05, .75))), '#8E8AAD');   // open on the butterfly
  }
  function over(t) {
    const cm = cam(t); camBegin(cm[0], cm[1], cm[2]);
    above(t);
    const b = bpos2(t), bv = bpos2(t + .04)[0] - bpos2(t - .04)[0], onHead = ease(seg(t, tPerch2 - .08, tPerch2)) * (1 - ease(seg(t, tOff, tOff + .12)));
    const skim = t > 34.2 && t < 35.4;
    if (skim) flock(t, st2, 'b');                                  // along the far cloud tops, behind the near ones
    nearCloud(t);
    if (t < tPop && !skim) flock(t, st2, 'b');
    if (t >= tPop && t < tBurst2) {
      const o = c2(t);
      boilSeed('c2shadow'); shadow(C2X, C2Y + cloudDip(t) + 4, U * 5.2 * (1 - Math.min(.5, Math.abs(o.dy || 0) * .05)), .5 * ease(seg(t, tPop, tPop + .2)));
      clawd(C2X, C2Y + cloudDip(t), U, o);
    }
    if (t >= tBurst2) flock(t, st3, 'c');
    bfly(b[0], b[1], BS * sizeB(t), { key: 'rose', cols: ROSE, colK: 1, sp: lerp(lerp(.15, 1, .5 + .5 * Math.cos(TAU * 7.5 * t)), .3 + .7 * (.5 + .5 * Math.sin(t * 5.5)), onHead), rot: clamp(bv / 70, -.3, .3) * (1 - onHead) });
    boilSeed('fx3');
    for (const [tp, px, py] of [[tPop, C2X, C2Y - 4 * U], [tBurst2, TOP2[0], TOP2[1] - 4 * U]]) {
      burst(px, py, 150, 255, 12, seg(t, tp, tp + .4), PAL.ink, 1.2, .13);
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .5, d = lerp(150, 240, easeOut(seg(t, tp, tp + .6))); sparkle(px + Math.cos(a) * d, py + Math.sin(a) * d * .8, 22, seg(t, tp + .04 * i, tp + .55 + .04 * i), HUES[i * 3 % HUES.length]); }
    }
    camEnd();
    // in: the cloud we climbed through falls away below
    if (t < tCut + 1.3) {
      boilSeed('through');
      const y = lerp(-320, H + 340, ease(seg(t, tCut - .05, tCut + .85)));
      paint([...scallops(-200, W + 200, 70, y, 60, 190, .8), [W + 200, H + 900], [-200, H + 900]], { wash: mixCol(CEIL, SEA, seg(t, tCut, tCut + .6)), ink: null });
    }
    // out: into the light
    flash(ease(seg(t, tLight + .25, tEnd - .2)), '#FFF6DC');
  }
  shots([[0, under], [tCut, over]]);
})();
