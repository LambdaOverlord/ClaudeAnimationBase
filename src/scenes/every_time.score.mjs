// every_time.score.mjs: the soundtrack for "Every time", synthesised from nothing and cut to the picture.
//   node src/scenes/every_time.score.mjs            → assets/every_time.wav
// 96 bpm, so a bar is 2.5 s and the film's big events (see the times in every_time.js) sit on bar lines. Everything is in
// C major pentatonic (C D E G A): any two notes agree, so the cues can follow the action without ever clashing.
// Voices: a kalimba-like pluck, a soft pad, a round bass, and a few painted noises (thud, pop, whoosh, sparkle).
import { writeFileSync, mkdirSync } from 'node:fs';

const SR = 44100, DUR = 41.25, N = Math.ceil((DUR + 2.5) * SR), TAU = Math.PI * 2;
const dry = [new Float32Array(N), new Float32Array(N)], wet = [new Float32Array(N), new Float32Array(N)];
const BEAT = 60 / 96, BAR = BEAT * 4, bar = n => n * BAR;

// the picture's times (keep in step with every_time.js)
const T = { down: 3.0, tug1: 3.5, tug2: 4.1, giveUp: 4.75, dabs: 5.3, pop: 7.5, open: 8.15, see: 9.15, lead: 10.0, walk0: 10.9, walk1: 11.7, idea: 12.5,
  take: 13.2, hand: 13.6, plant: 13.9, pat1: 14.375, pat2: 14.6875, grow: 15.0, pet: 15.5, lineHold: 16.8, col: 17.5, mead: 18.0, hue: 18.2, joy: 18.6, perch: 20.6,
  toC: 21.6, boop: 22.5, lift: 23.6, gone: 25.3, turn: 26.4, rest: 27.0, fleck: 27.5, swap: 28.3, empty: 30.0, pull0: 30.8, pull1: 33.3, b2: 34.2, dabs2: 35.3,
  set2: 36.7, pop2: 37.5, open2: 38.15, iris: 39.5, shut: 40.9 };

// ---------- notes ----------
const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const hz = name => { const m = /^([A-G])(#|b)?(-?\d)$/.exec(name); return 440 * Math.pow(2, (SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (m[3] - 4) * 12 - 9) / 12); };
const PENTA = ['C', 'D', 'E', 'G', 'A'], penta = i => PENTA[((i % 5) + 5) % 5] + (4 + Math.floor(i / 5));   // penta(0) = C4, penta(5) = C5, ...
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// ---------- voices ----------
const put = (buf, i, v, pan) => { if (i >= 0 && i < N) { buf[0][i] += v * Math.cos((pan + 1) * Math.PI / 4); buf[1][i] += v * Math.sin((pan + 1) * Math.PI / 4); } };
// Kalimba: a sine with a couple of quick overtones and a short inharmonic "tine" click. send = how much goes to the reverb.
function pluck(t, note, vel = .5, o = {}) {
  const f = typeof note === 'string' ? hz(note) : note, len = o.len ?? 1.8, pan = o.pan ?? (rnd() - .5) * .5, send = o.send ?? .35, i0 = Math.round(t * SR), n = Math.round(len * SR);
  const bright = o.bright ?? 1, tau = (o.tau ?? .42) * Math.pow(440 / f, .25);
  for (let i = 0; i < n; i++) {
    const x = i / SR, a = Math.min(1, x / .003);
    const s = Math.sin(TAU * f * x) * Math.exp(-x / tau) + .32 * bright * Math.sin(TAU * 2 * f * x) * Math.exp(-x / (tau * .45))
      + .1 * bright * Math.sin(TAU * 3 * f * x) * Math.exp(-x / (tau * .25)) + .14 * bright * Math.sin(TAU * 5.4 * f * x) * Math.exp(-x / .025);
    const v = s * a * vel * .5;
    put(dry, i0 + i, v, pan); put(wet, i0 + i, v * send, pan);
  }
}
// Pad: slow, soft, slightly detuned sines.
function pad(t, notes, len, vel = .1) {
  const i0 = Math.round(t * SR), n = Math.round((len + 1.4) * SR);
  notes.forEach((note, k) => {
    const f = hz(note), pan = (k % 2 ? 1 : -1) * .35;
    for (let i = 0; i < n; i++) {
      const x = i / SR, env = Math.min(1, x / .9) * Math.min(1, Math.max(0, (len + 1.4 - x) / 1.4)), trem = 1 + .08 * Math.sin(TAU * .31 * x + k);
      const s = Math.sin(TAU * f * x) + .6 * Math.sin(TAU * f * 1.004 * x + 1) + .5 * Math.sin(TAU * f * .997 * x + 2) + .12 * Math.sin(TAU * 2 * f * x);
      const v = s * env * env * trem * vel * .22;
      put(dry, i0 + i, v, pan); put(wet, i0 + i, v * .5, pan);
    }
  });
}
function bass(t, note, vel = .5, len = 1.6) {
  const f = hz(note), i0 = Math.round(t * SR), n = Math.round(len * SR);
  for (let i = 0; i < n; i++) { const x = i / SR, v = (Math.sin(TAU * f * x) + .25 * Math.sin(TAU * 2 * f * x)) * Math.min(1, x / .012) * Math.exp(-x / .5) * vel * .5; put(dry, i0 + i, v, 0); put(wet, i0 + i, v * .12, 0); }
}
// Something soft and heavy landing.
function thud(t, vel = .6, f0 = 95) {
  const i0 = Math.round(t * SR), n = Math.round(.4 * SR); let ph = 0;
  for (let i = 0; i < n; i++) { const x = i / SR, f = 48 + (f0 - 48) * Math.exp(-x / .05); ph += TAU * f / SR; const v = (Math.sin(ph) * Math.exp(-x / .09) + (rnd() - .5) * .25 * Math.exp(-x / .012)) * vel * .7; put(dry, i0 + i, v, 0); put(wet, i0 + i, v * .15, 0); }
}
// The pop of something coming into being: a quick upward blip with a breath of noise.
function pop(t, vel = .7) {
  const i0 = Math.round(t * SR), n = Math.round(.25 * SR); let ph = 0;
  for (let i = 0; i < n; i++) { const x = i / SR, f = 260 + 900 * (1 - Math.exp(-x / .03)); ph += TAU * f / SR; const v = (Math.sin(ph) * Math.exp(-x / .06) + (rnd() - .5) * .5 * Math.exp(-x / .02)) * vel * .6; put(dry, i0 + i, v, 0); put(wet, i0 + i, v * .4, 0); }
}
// Brushes in the air: noise through a band that sweeps upward, swelling to t1 and then let go.
function whoosh(t0, t1, vel = .3) {
  const i0 = Math.round(t0 * SR), n = Math.round((t1 - t0 + .35) * SR); let lo = 0, bd = 0;
  for (let i = 0; i < n; i++) {
    const x = i / SR, k = Math.min(1, x / (t1 - t0)), fc = 350 * Math.pow(9, k), g = 2 * Math.sin(Math.PI * fc / SR), q = .5;
    const hi = (rnd() - .5) * 2 - lo - q * bd; bd += g * hi; lo += g * bd;                                 // state-variable band-pass
    const env = k < 1 ? Math.pow(k, 2.2) : Math.exp(-(x - (t1 - t0)) / .08), pan = Math.sin(x * 5) * .6;
    const v = bd * env * vel * .35; put(dry, i0 + i, v, pan); put(wet, i0 + i, v * .5, pan);
  }
}
const sparkles = (t, n, span, vel = .2, lo = 15, hi = 22) => { for (let i = 0; i < n; i++) pluck(t + rnd() * span, penta(lo + Math.floor(rnd() * (hi - lo))), vel * (.5 + .5 * rnd()), { len: .9, tau: .16, send: .7, pan: (rnd() - .5) * 1.6 }); };
const run = (t0, t1, i0, i1, vel0, vel1, curve = 1) => { const n = Math.abs(i1 - i0); for (let k = 0; k <= n; k++) { const u = k / n; pluck(t0 + (t1 - t0) * Math.pow(u, curve), penta(i0 + Math.sign(i1 - i0) * k), vel0 + (vel1 - vel0) * u, { len: 1.1, tau: .25 }); } };
const seq = (list, vel = .45, o = {}) => list.forEach(([t, note, v]) => pluck(t, note, v ?? vel, o));

// ---------- harmony: one chord a bar (pad + a quiet kalimba pattern + a bass note on the downbeat) ----------
const CH = { C: ['C3', 'G3', 'E4'], Am: ['A2', 'E3', 'C4'], F: ['F2', 'C3', 'A3'], G: ['G2', 'D3', 'B3'], Dm: ['D3', 'A3', 'F4'] };
const ARP = { C: ['C4', 'G4', 'C5', 'E5', 'G4', 'E5', 'C5', 'G4'], Am: ['A3', 'E4', 'A4', 'C5', 'E4', 'C5', 'A4', 'E4'], F: ['F3', 'C4', 'F4', 'A4', 'C4', 'A4', 'F4', 'C4'], G: ['G3', 'D4', 'G4', 'B4', 'D4', 'B4', 'G4', 'D4'] };
//        bar: 0     1    2    3    4     5    6    7    8    9    10   11   12    13   14    15   16
const BARS = ['Am', 'F', 'G', 'C', 'Am', 'F', 'C', 'C', 'F', 'C', 'F', 'C', 'Am', 'F', 'Am', 'C', 'C'];
const PADV = [.05, .06, .08, .12, .1, .1, .1, .15, .12, .12, .1, .09, .07, .13, .09, .13, .1];
const ARPV = [0, 0, 0, .15, .13, .12, 0, .2, .16, .15, .11, 0, 0, .13, 0, .16, 0];
BARS.forEach((c, b) => {
  pad(bar(b), CH[c], BAR, PADV[b]);
  if (ARPV[b]) { ARP[c].forEach((note, k) => pluck(bar(b) + k * BEAT / 2, note, ARPV[b] * (k % 4 ? .8 : 1), { len: 1.2, tau: .3, pan: k % 2 ? .4 : -.4 })); bass(bar(b), CH[c][0], .45); }
});
// second half of a few bars moves to G, to lean into the next downbeat
for (const b of [5, 10, 13]) { pad(bar(b) + BAR / 2, CH.G, BAR / 2, PADV[b] * .9); }

// ---------- A: the butterfly and its knot ----------
seq([[.55, 'A5'], [1.175, 'G5'], [1.8, 'E5'], [2.425, 'D5']], .3, { send: .6 });                       // sinking as it hauls
thud(T.down + .05, .5);
seq([[T.tug1 + .02, 'E5', .28], [T.tug1 + .14, 'G5', .32], [T.tug1 + .26, 'A5', .38]]); thud(T.tug1 + .4, .4, 80);   // heave ... and back down
seq([[T.tug2 + .02, 'E5', .3], [T.tug2 + .13, 'G5', .34], [T.tug2 + .24, 'A5', .4], [T.tug2 + .35, 'C6', .46]]); thud(T.tug2 + .5, .55, 80);
seq([[T.giveUp + .2, 'A4', .28], [T.giveUp + .55, 'E4', .22]], .25, { send: .6 });                     // a sigh
// the gathering: a breath of brushes and a run that quickens into the pop
whoosh(T.dabs + .2, T.pop, .32); run(T.dabs + .4, T.pop - .06, 0, 12, .16, .5, .62);
pop(T.pop); bass(T.pop, 'C2', .7, 2.2); seq([[T.pop, 'C4'], [T.pop, 'E4'], [T.pop, 'G4'], [T.pop, 'C5'], [T.pop + .02, 'E5'], [T.pop + .04, 'G5']], .5); sparkles(T.pop + .05, 9, .7);

// ---------- B: hello ----------
seq([[T.open, 'G4', .3], [T.open + .3, 'C5', .34], [T.open + .62, 'E5', .3]]);                         // eyes open, a look left and right
seq([[T.see, 'D5', .4], [T.see + .1, 'G5', .46]]);                                                    // oh!
seq([[T.see + .5, 'E5'], [T.see + .65, 'G5'], [T.see + .8, 'C6']], .42);                               // hello
seq([[T.lead + .2, 'E5', .3], [T.lead + .5, 'D5', .3]]);                                               // the butterfly shows the way
seq([[T.walk0 + .04, 'G3'], [T.walk0 + .35, 'C4'], [T.walk0 + .66, 'G3']], .34, { tau: .18, len: .6 }); // three steps
seq([[T.walk1 + .25, 'A4'], [T.walk1 + .45, 'A4'], [T.walk1 + .65, 'A4']], .26, { tau: .1, len: .4 });   // . . .
// ---------- C: the idea, the loose end, the flower ----------
seq([[T.idea, 'E6', .5], [T.idea, 'C6', .4], [T.idea + .08, 'G6', .3]], .5, { send: .7 }); sparkles(T.idea + .05, 4, .3, .14);
seq([[T.take, 'G4', .3], [T.take + .15, 'C5', .32], [T.hand, 'E5', .36]]);
seq([[T.plant, 'E5'], [T.plant + .1, 'D5'], [T.plant + .2, 'C5'], [T.plant + .3, 'A4']], .3);          // lowering it
for (const tp of [T.pat1, T.pat2]) { seq([[tp, 'C3', .5], [tp, 'G3', .34], [tp + .01, 'C5', .16]], .4, { tau: .5, send: .5 }); }   // two warm pulses at the root
for (let i = 0; i < 9; i++) pluck(T.grow - .27 + i * .03, 'G4', .1 + .035 * i, { len: .3, tau: .06 });  // the knot quivers
bass(T.grow, 'C2', .7, 2); run(T.grow, T.grow + .32, 0, 10, .3, .5); thud(T.grow + .52, .35, 70);       // up it goes; Clawd lands on its back foot
['C5', 'D5', 'E5', 'G5', 'A5'].forEach((n, j) => pluck(T.pet + j * .25 + .12, n, .44 + .03 * j, { send: .5 }));   // five petals
seq([[T.lineHold + .15, 'F4', .2], [T.lineHold + .15, 'A4', .2], [T.lineHold + .15, 'C5', .22]], .2, { send: .7, tau: .7, len: 2.2 });   // a held breath
for (let i = 0; i < 6; i++) pluck(T.col - .2 + i * .033, i % 2 ? 'A5' : 'G5', .12 + .02 * i, { len: .3, tau: .06 });
bass(T.col, 'C2', .8, 2.4); seq([[T.col, 'C4'], [T.col, 'G4'], [T.col, 'E5']], .5);                    // colour
['E5', 'G5', 'C6', 'E6', 'G6'].forEach((n, j) => pluck(T.col + .04 + j * .07, n, .46, { send: .6 })); sparkles(T.col + .1, 16, 1.2, .2);
bass(T.mead, 'G2', .4, 1.6); seq([[T.mead, 'G4', .26], [T.mead + .3, 'C5', .26], [T.mead + .6, 'E5', .26]]);
for (let i = 0; i < 6; i++) pluck(T.hue + i * .07, i % 2 ? 'C6' : 'A5', .34, { len: .5, tau: .12 }); sparkles(T.hue + .1, 6, .4, .18);   // the butterfly takes its colours
seq([[T.joy, 'G5'], [T.joy + .3, 'A5'], [T.joy + .6, 'C6'], [T.joy + .9, 'A5'], [T.joy + 1.2, 'G5'], [T.joy + 1.5, 'E5'], [T.joy + 1.8, 'D5'], [T.perch, 'C5', .44]], .38);   // a loop of joy, and a landing
// ---------- D: thank you, goodbye ----------
seq([[T.toC + .05, 'E5'], [T.toC + .35, 'G5'], [T.toC + .65, 'A5']], .34);
seq([[T.boop, 'E6', .42], [T.boop + .02, 'C6', .3], [T.boop + .3, 'G6', .2]], .4, { send: .8, tau: .5 });   // the lightest touch
seq([[T.boop + .5, 'D5', .26], [T.boop + .72, 'C5', .24]]);
seq([[T.lift, 'G5'], [T.lift + .35, 'A5'], [T.lift + .65, 'G5'], [T.lift + .95, 'E5'], [T.lift + 1.2, 'D5'], [T.lift + 1.45, 'E5']], .34);
seq([[T.gone - .1, 'G5', .3], [T.gone + .12, 'A5', .25], [T.gone + .34, 'C6', .2], [T.gone + .56, 'D6', .14], [T.gone + .78, 'E6', .09]], .3, { send: .8 });   // up and away
seq([[T.turn + .1, 'C5', .26], [T.rest + .05, 'E4', .22], [T.rest + .05, 'G4', .2]], .25, { send: .6, tau: .7, len: 2.4 });
// ---------- E: coming apart; the garden ----------
['E6', 'G6', 'A6', 'G6', 'C7'].forEach((n, i) => pluck(T.fleck + i * .16 + .1, n, .12, { len: .8, tau: .14, send: .8 }));
for (let i = 0; i < 22; i++) { const u = i / 21; pluck(T.swap + .2 + 1.45 * Math.pow(u, .8) + (rnd() - .5) * .05, penta(5 + Math.round(u * 10) + (i % 3 === 0 ? -2 : 0)), .26 * (1 - u * .75), { len: 1.2, tau: .22, send: .7, pan: (rnd() - .5) * 1.4 }); }
seq([[T.empty + .1, 'A3', .2], [T.empty + .1, 'E4', .16]], .2, { send: .7, tau: .9, len: 2.6 });
['F3', 'C4', 'A4', 'C5', 'E5', 'G5', 'A5', 'C6', 'E6'].forEach((n, i) => pluck(T.pull0 + .5 + i * .23, n, .2 + .02 * i, { send: .7, tau: .6, len: 2.2, pan: (i % 2 ? 1 : -1) * (.2 + .08 * i) }));   // flower after flower comes into view
sparkles(T.pull1 - .4, 10, 1.2, .1);
// ---------- F: again ----------
seq([[T.b2 + .3, 'A5'], [T.b2 + .925, 'G5'], [T.b2 + 1.55, 'E5'], [T.b2 + 2.175, 'D5']], .28, { send: .6 });   // the same tune as the first time
thud(T.set2 + .05, .45);
whoosh(T.dabs2 + .3, T.pop2, .32); run(T.dabs2 + .5, T.pop2 - .06, 0, 12, .16, .5, .62);
pop(T.pop2); bass(T.pop2, 'C2', .7, 2.2); seq([[T.pop2, 'C4'], [T.pop2, 'E4'], [T.pop2, 'G4'], [T.pop2, 'C5'], [T.pop2 + .02, 'E5'], [T.pop2 + .04, 'G5']], .5); sparkles(T.pop2 + .05, 9, .7);
seq([[T.open2, 'G4', .3], [T.open2 + .2, 'C5', .34]]);
seq([[T.open2 + .42, 'E5'], [T.open2 + .57, 'G5'], [T.open2 + .72, 'C6']], .42);                       // hello, as glad as the first time
seq([[T.open2 + .95, 'D6', .26], [T.open2 + 1.2, 'C6', .24]]);                                         // and the butterfly answers
seq([[T.iris + .1, 'G5', .3], [T.iris + .4, 'E5', .28], [T.iris + .7, 'C5', .28]]);
seq([[T.shut, 'C6', .3], [T.shut, 'C3', .3], [T.shut + .02, 'G5', .14]], .3, { send: .8, tau: .8, len: 2.4 });   // shut: back to the blank page

// ---------- reverb (a small Schroeder room), mix, fades, write ----------
function reverb(x) {
  const out = new Float32Array(N), combs = [1557, 1617, 1491, 1422, 1277, 1356], fb = .8, damp = .25;
  for (const d of combs) { const buf = new Float32Array(d); let p = 0, lp = 0; for (let i = 0; i < N; i++) { const y = buf[p]; lp = y * (1 - damp) + lp * damp; buf[p] = x[i] + lp * fb; p = (p + 1) % d; out[i] += y / combs.length; } }
  for (const d of [225, 556, 441]) { const buf = new Float32Array(d); let p = 0; for (let i = 0; i < N; i++) { const b = buf[p], y = b - .5 * out[i]; buf[p] = out[i] + .5 * b; p = (p + 1) % d; out[i] = y; } }
  return out;
}
const end = Math.round(DUR * SR), pcm = Buffer.alloc(44 + end * 4); let peak = 0;
const mix = [0, 1].map(c => { const w = reverb(wet[c]), m = new Float32Array(end); for (let i = 0; i < end; i++) { m[i] = dry[c][i] + w[i] * 1.1; peak = Math.max(peak, Math.abs(m[i])); } return m; });
const gain = .82 / peak, fadeOut = Math.round(.35 * SR);
pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + end * 4, 4); pcm.write('WAVEfmt ', 8); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22);
pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(end * 4, 40);
for (let i = 0; i < end; i++) for (let c = 0; c < 2; c++) { const f = Math.min(1, (end - i) / fadeOut); pcm.writeInt16LE(Math.round(Math.tanh(mix[c][i] * gain * 1.15) / Math.tanh(1.15) * f * 32767 * .97), 44 + i * 4 + c * 2); }
mkdirSync('assets', { recursive: true }); writeFileSync('assets/every_time.wav', pcm);
console.log(`assets/every_time.wav  ${DUR}s  peak before gain ${peak.toFixed(2)}`);
