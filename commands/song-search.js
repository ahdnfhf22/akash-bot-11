module.exports = {
  name: 'song-search',
  aliases: ['song','searchsong','track-search'],
  description: 'Search for a song (Spotify/YouTube links)',
  async handler({ from, args, sendText }){
    const q = args.join(' ');
    if (!q) return sendText(from, 'Usage: song-search <query>');
    const spotify = require('../src/spotify');
    const results = await spotify.searchTracks(q, 5);
    if (!results) return sendText(from, 'Search not available (no Spotify credentials).');
    const lines = results.map((t, i) => `${i+1}) ${t.name} — ${t.artists.map(a=>a.name).join(', ')} (id:${t.id})`).join('\n');
    await sendText(from, `Top results:\n${lines}\n\nUse: song-preview <id> or gp-add <id>`);
  }
};
