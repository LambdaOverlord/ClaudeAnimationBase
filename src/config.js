// config.js: project settings.
//   duration: the video's length in seconds.
//   audio:    (optional) a soundtrack to mux into the video. This one is made by src/scenes/every_time.score.mjs.
//   bpm:      the rhythm that bounces, dances and pulse() follow. Clawd always moves to some beat; if the video has music,
//             set this to the song's tempo, and set offset to the time in seconds of its first downbeat.
const PROJECT = { duration: 41.25, bpm: 96, offset: 0, audio: 'assets/every_time.m4a' };
