module.exports = {
  name: 'gp-list',
  aliases: ['gplaylist-list','group-list'],
  description: 'List current group queue',
  async handler({ from, raw, sendText }){
    const groupId = raw?.from || 'dm';
    const store = require('../src/store');
    const g = store.getGroupQueue(groupId);
    if (!g.queue.length) return sendText(from, 'Queue is empty');
    const spotify = require('../src/spotify');
    const lines = [];
    for (let i=0;i<g.queue.length;i++){
      const item = g.queue[i];
      let meta = item.id;
      try{ const t = await spotify.getTrack(item.id); if (t && t.name) meta = `${t.name} — ${t.artists.map(a=>a.name).join(', ')}` }catch(e){}
      lines.push(`${i+1}) ${meta} (added by ${item.addedBy})`);
    }
    await sendText(from, `Queue:\n${lines.join('\n')}`);
  }
};
