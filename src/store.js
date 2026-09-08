// Simple JSON-backed store for group queues (data/store.json)
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'data', 'store.json');

function read(){
  try{ if (!fs.existsSync(path.dirname(file))) fs.mkdirSync(path.dirname(file), { recursive: true });
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ groups: {} }, null, 2));
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch(e){ console.error('store read error', e); return { groups: {} } }
}
function write(j){ fs.writeFileSync(file, JSON.stringify(j, null, 2)); }

function getGroupQueue(groupId){ const j = read(); return j.groups[groupId] || { queue: [], votes: {} }; }
function saveGroupQueue(groupId, obj){ const j = read(); j.groups[groupId] = obj; write(j); }

module.exports = { getGroupQueue, saveGroupQueue };
