module.exports = {
  name: 'gp-add',
  aliases: ['gplaylist-add','group-add'],
  description: 'Add a track id to the group queue: gp-add <track-id> (uses Spotify id)',
  async handler({ from, args, raw, sendText }){
    const groupId = raw?.from || 'dm';
    const id = args[0];
    if (!id) return sendText(from, 'Usage: gp-add <spotify-track-id>');
    const store = require('../src/store');
    const g = store.getGroupQueue(groupId);
    g.queue.push({ id, addedBy: from, addedAt: Date.now() });
    store.saveGroupQueue(groupId, g);
    await sendText(from, `Added to queue (${g.queue.length}): ${id}`);
  }
};
