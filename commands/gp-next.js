module.exports = {
  name: 'gp-next',
  aliases: ['gplaylist-next','group-next'],
  description: 'Skip current track (admin/DJ) — pops the queue',
  async handler({ from, raw, sendText }){
    const groupId = raw?.from || 'dm';
    const store = require('../src/store');
    const g = store.getGroupQueue(groupId);
    if (!g.queue.length) return sendText(from, 'Queue is empty');
    const popped = g.queue.shift();
    store.saveGroupQueue(groupId, g);
    await sendText(from, `Skipped: ${popped.id}. Now ${g.queue[0]?.id || 'queue empty'}`);
  }
};
