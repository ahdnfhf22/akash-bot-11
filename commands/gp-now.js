module.exports = {
  name: 'gp-now',
  aliases: ['gplaylist-now','group-now'],
  description: 'Show now playing (first in queue)',
  async handler({ from, raw, sendText }){
    const groupId = raw?.from || 'dm';
    const store = require('../src/store');
    const g = store.getGroupQueue(groupId);
    if (!g.queue.length) return sendText(from, 'Queue is empty');
    const item = g.queue[0];
    const spotify = require('../src/spotify');
    try{ const t = await spotify.getTrack(item.id); if (t && t.name) return sendText(from, `Now: ${t.name} — ${t.artists.map(a=>a.name).join(', ')}`); }catch(e){}
    return sendText(from, `Now: ${item.id} (added by ${item.addedBy})`);
  }
};
