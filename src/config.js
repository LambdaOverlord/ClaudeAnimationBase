// config.js: the films in this repo, and which one is loaded.
//   Pick a film with ?film=<name> in the page URL (studio.html?film=demo), or --film=<name> on render.mjs / render.sh.
//   duration: the video's length in seconds.
//   bpm:      the rhythm that bounces, dances and pulse() follow. Clawd always moves to some beat; if the video has music,
//             set this to the song's tempo, and set offset to the time in seconds of its first downbeat.
//   audio:    (optional) a soundtrack to mux into the video.
//   scenes:   the scene files to load, in order.
const FILMS = {
  every_time: { duration: 41.25, bpm: 96, offset: 0, audio: 'assets/every_time.m4a', scenes: ['src/scenes/every_time.js'] },
  demo:       { duration: 11, bpm: 120, offset: 0, scenes: ['src/scenes/demo.js'] },
};
const FILM = new URLSearchParams(location.search).get('film') || 'every_time';   // the default
if (!FILMS[FILM]) throw new Error(`no film named "${FILM}": add it to FILMS in src/config.js`);
const PROJECT = FILMS[FILM];
