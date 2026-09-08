// Minimal Genius helper (fetch song url/lyrics snippet). Requires GENIUS_TOKEN env var
const fetch = require('node-fetch');

async function searchGenius(song){
  const token = process.env.GENIUS_TOKEN;
  if (!token) return null;
  const url = `https://api.genius.com/search?q=${encodeURIComponent(song)}`;
  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  const j = await r.json();
  return j.response?.hits || [];
}

async function getSongUrl(path){
  // path is Genius path e.g. /songs/123
  return `https://genius.com${path}`;
}

module.exports = { searchGenius, getSongUrl };
