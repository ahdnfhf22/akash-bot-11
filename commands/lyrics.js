module.exports = {
  name: 'lyrics',
  aliases: ['lyric','song-lyrics'],
  description: 'Fetch lyrics snippet via Genius (if configured)',
  async handler({ from, args, sendText }){
    const q = args.join(' ');
    if (!q) return sendText(from, 'Usage: lyrics <song name>');
    const genius = require('../src/genius');
    const hits = await genius.searchGenius(q);
    if (!hits) return sendText(from, 'Lyrics search not available (no Genius token)');
    if (hits.length===0) return sendText(from, 'No lyrics found');
    const top = hits[0].result;
    const url = genius.getSongUrl(top.path);
    await sendText(from, `Found: ${top.full_title}\n${url}`);
  }
};
