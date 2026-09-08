// Minimal webhook server and command loader for AKASH BOT 11
const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.WA_ACCESS_TOKEN;
const PHONE_ID = process.env.WA_PHONE_ID;
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// Dynamic commands loader
const commands = new Map();
function loadCommands(){
  commands.clear();
  const dir = path.join(__dirname, 'commands');
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)){
    if (!f.endsWith('.js')) continue;
    try{
      delete require.cache[require.resolve(path.join(dir,f))];
      const mod = require(path.join(dir,f));
      if (mod && mod.name && typeof mod.handler === 'function'){
        commands.set(mod.name, mod);
        if (Array.isArray(mod.aliases)) for (const a of mod.aliases) commands.set(a, mod);
      }
    }catch(e){console.error('Failed loading command', f, e)}
  }
  console.log('Loaded commands:', Array.from(new Set(Array.from(commands.values()).map(c=>c.name))).length);
}
loadCommands();

// Helpers to send messages via WhatsApp Cloud API
async function sendText(to, text){
  if (!ACCESS_TOKEN || !PHONE_ID){
    console.log(`[sendText] to=${to} text=${text}`);
    return;
  }
  const url = `https://graph.facebook.com/v17.0/${PHONE_ID}/messages`;
  const body = { messaging_product: 'whatsapp', to, type: 'text', text: { body: text } };
  await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

async function sendImageByUrl(to, imageUrl, caption){
  if (!ACCESS_TOKEN || !PHONE_ID){
    console.log(`[sendImage] to=${to} image=${imageUrl} caption=${caption}`);
    return;
  }
  const url = `https://graph.facebook.com/v17.0/${PHONE_ID}/messages`;
  const body = { messaging_product: 'whatsapp', to, type: 'image', image: { link: imageUrl, caption: caption || '' } };
  await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

async function sendAudioByUrl(to, audioUrl, caption){
  if (!ACCESS_TOKEN || !PHONE_ID){
    console.log(`[sendAudio] to=${to} audio=${audioUrl} caption=${caption}`);
    return;
  }
  const url = `https://graph.facebook.com/v17.0/${PHONE_ID}/messages`;
  const body = { messaging_product: 'whatsapp', to, type: 'audio', audio: { link: audioUrl }, preview_url: true };
  await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

// Webhook verification
app.get('/webhook', (req, res)=>{
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) return res.send(challenge);
  res.sendStatus(403);
});

// Webhook receiver
app.post('/webhook', async (req, res)=>{
  try{
    const data = req.body;
    if (!data?.entry) return res.sendStatus(400);
    for (const entry of data.entry){
      for (const change of entry.changes || []){
        const messages = change.value?.messages || [];
        for (const message of messages){
          const from = message.from;
          const text = message.text?.body || '';
          await handleCommand(from, text.trim(), message);
        }
      }
    }
    res.sendStatus(200);
  }catch(e){console.error(e); res.sendStatus(500)}
});

async function handleCommand(from, text, raw){
  if (!text) return;
  const parts = text.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  const mod = commands.get(cmd);
  if (mod){
    try{
      await mod.handler({ from, args, raw, sendText, sendImageByUrl, sendAudioByUrl });
    }catch(err){
      console.error('Command error', err);
      await sendText(from, 'Kuch error ho gaya. Admin ko batayein.');
    }
  }else{
    // fallback for common help
    if (cmd === 'help'){
      const list = Array.from(new Set(Array.from(commands.values()).map(c=>`${c.name} - ${c.description || ''}`))).slice(0,100).join('\n');
      await sendText(from, `Available commands (sample):\n${list}\n\nType help-commands for categories.`);
    }else{
      await sendText(from, 'Unknown command. Type help');
    }
  }
}

// Admin endpoint to reload commands (protected by simple token)
app.post('/reload-commands', (req,res)=>{
  const token = req.headers['x-admin-token'];
  if (token !== process.env.ADMIN_TOKEN) return res.sendStatus(403);
  loadCommands();
  res.json({ ok: true, loaded: Array.from(new Set(Array.from(commands.values()).map(c=>c.name))).length });
});

app.listen(PORT, ()=>console.log('AKASH BOT webhook listening on', PORT));
