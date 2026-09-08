// Simple Spotify helper (Client Credentials flow)
const fetch = require('node-fetch');
let cached = { token: null, expires: 0 };

async function getToken(){
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (cached.token && Date.now() < cached.expires) return cached.token;
  const resp = await fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers: { Authorization: 'Basic ' + Buffer.from(id+':'+secret).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' });
  const j = await resp.json();
  if (j.access_token){ cached.token = j.access_token; cached.expires = Date.now() + (j.expires_in - 60)*1000; return cached.token; }
  return null;
}

async function searchTracks(q, limit=5){
  const token = await getToken();
  if (!token) return null;
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=${limit}`;
  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  const j = await r.json();
  return j.tracks?.items || [];
}

async function getTrack(id){
  const token = await getToken();
  if (!token) return null;
  const url = `https://api.spotify.com/v1/tracks/${id}`;
  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  return await r.json();
}

module.exports = { searchTracks, getTrack };
