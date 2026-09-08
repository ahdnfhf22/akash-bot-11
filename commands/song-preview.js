module.exports = {
  name: 'song-preview',
  aliases: ['preview','track-preview'],
  description: 'Send preview audio for a Spotify track id',
  async handler({ from, args, sendText, sendAudioByUrl }){
    const id = args[0];
    if (!id) return sendText(from, 'Usage: song-preview <spotify-track-id>');
    const spotify = require('../src/spotify');
    const t = await spotify.getTrack(id);
    if (!t) return sendText(from, 'Preview not available (no Spotify credentials)');
    const preview = t.preview_url;
    if (preview){
      await sendAudioByUrl(from, preview, `${t.name} — ${t.artists.map(a=>a.name).join(', ')}`);
    }else{
      await sendText(from, `No preview available for this track. Link: ${t.external_urls?.spotify || 'N/A'}`);
    }
  }
};
