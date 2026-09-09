// Baileys starter for AKASH BOT 11
// Run: node baileys-start.js
// Requires: npm i @adiwajshing/baileys qrcode-terminal node-fetch@2

const { default: makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion } = require('@adiwajshing/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

// Load commands from commands/ (same format as webhook-server.js)
function loadCommands() {
  const commands = new Map();
  const dir = path.join(__dirname, 'commands');
  if (!fs.existsSync(dir)) return commands;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    try {
      delete require.cache[require.resolve(path.join(dir, f))];
      const mod = require(path.join(dir, f));
      if (mod && mod.name && typeof mod.handler === 'function') {
        commands.set(mod.name, mod);
        if (Array.isArray(mod.aliases)) for (const a of mod.aliases) commands.set(a, mod);
      }
    } catch (e) { console.error('cmd load err', f, e); }
  }
  console.log('Commands loaded:', Array.from(new Set(Array.from(commands.values()).map(c=>c.name))).length);
  return commands;
}

async function start() {
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({ version, auth: state, printQRInTerminal: false });

  // Helpers to match existing command handlers
  async function sendText(to, text) { try { await sock.sendMessage(to, { text }); } catch (e) { console.error('sendText err', e); } }
  async function sendImageByUrl(to, url, caption) { try { await sock.sendMessage(to, { image: { url }, caption: caption || '' }); } catch (e) { console.error('sendImage err', e); } }
  async function sendAudioByUrl(to, url) { try { await sock.sendMessage(to, { audio: { url }, mimetype: 'audio/mpeg' }); } catch (e) { console.error('sendAudio err', e); } }

  let commands = loadCommands();

  // Show QR when available
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log('--- QR received. Scan it from WhatsApp (Linked devices → Link a device) ---');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'open') console.log('✅ Baileys connected');
    if (connection === 'close') console.log('Connection closed', lastDisconnect?.error || lastDisconnect);
  });

  // Persist creds
  sock.ev.on('creds.update', saveState);

  // Watch commands directory to reload on change
  const cmdDir = path.join(__dirname, 'commands');
  if (fs.existsSync(cmdDir)) {
    fs.watch(cmdDir, (eventType, filename) => {
      if (filename && filename.endsWith('.js')) {
        console.log('Commands changed, reloading...');
        commands = loadCommands();
      }
    });
  }

  // Incoming messages handler
  sock.ev.on('messages.upsert', async (m) => {
    try {
      const messages = m.messages || [];
      for (const msg of messages) {
        if (!msg.message || (msg.key && msg.key.fromMe)) continue;
        const remote = msg.key.remoteJid; // e.g. '919123456789@s.whatsapp.net' or group
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        if (!text) continue;
        const from = remote;
        const parts = text.trim().split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        const handler = commands.get(cmd);
        const context = { from, args, raw: msg, sendText, sendImageByUrl, sendAudioByUrl };
        if (handler) {
          try { await handler.handler(context); } catch (e) { console.error('cmd error', e); await sendText(from, 'Error running command'); }
        } else {
          if (cmd === 'help') {
            const list = Array.from(new Set(Array.from(commands.values()).map(c=>`${c.name} - ${c.description || ''}`))).slice(0,50).join('\n');
            await sendText(from, `Available commands (sample):\n${list}`);
          }
        }
      }
    } catch (e) { console.error('messages.upsert err', e); }
  });
}

start().catch(console.error);
