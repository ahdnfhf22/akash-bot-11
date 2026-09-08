module.exports = {
  name: 'gp-vote',
  aliases: ['gplaylist-vote'],
  description: 'Vote for a queued track by position: gp-vote <pos>',
  async handler({ from, args, raw, sendText }){
    const pos = parseInt(args[0],10);
    if (!pos) return sendText(from, 'Usage: gp-vote <position>');
    const groupId = raw?.from || 'dm';
    const store = require('../src/store');
    const g = store.getGroupQueue(groupId);
    if (!g.queue[pos-1]) return sendText(from, 'Invalid position');
    g.votes = g.votes || {};
    g.votes[pos-1] = g.votes[pos-1] || [];
    if (!g.votes[pos-1].includes(from)) g.votes[pos-1].push(from);
    store.saveGroupQueue(groupId, g);
    await sendText(from, `Vote recorded for position ${pos}. Total votes: ${g.votes[pos-1].length}`);
  }
};
