# AKASH BOT 11

This repository contains the AKASH BOT 11 scaffold for WhatsApp (Node.js, Cloud API). It includes:

- webhook-server.js — Express webhook receiver and dynamic command loader
- commands/ — command modules (owner, music & group features, placeholders)
- src/spotify.js — Spotify helper (Client Credentials)
- src/genius.js — Genius helper (lyrics)
- src/store.js — simple JSON-backed group queue storage
- tools/gen-commands.js — generate placeholder command files up to target
- dashboard/ — simple web dashboard skeleton (green + black theme)
- Dockerfile & docker-compose (skeleton)

Getting started

1) Install dependencies:
   npm install

2) Required environment variables (for full features):
   - WA_ACCESS_TOKEN, WA_PHONE_ID, WA_VERIFY_TOKEN
   - SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET (optional but recommended for music search/preview)
   - GENIUS_TOKEN (optional for lyrics)
   - YT_API_KEY (optional for Youtube search)
   - ADMIN_TOKEN (for reload endpoint)
   - OWNER_IMAGE_URL (optional) — used by owner command

3) Run locally:
   node webhook-server.js

4) Generate placeholder commands up to 500 (example):
   node tools/gen-commands.js 500

Notes & policies
- This project avoids any illegal downloading or redistribution of copyrighted music. Previews and links are used; full-track distribution is not included.
- The bot will not identify real people in images — captions are neutral.

Next steps I can take for you
- If you want, I can run the placeholder generator and add the files directly into the repo. Reply "Generate placeholders" and I will create them (this will add many files).
- Provide API keys to test live Spotify/Genius integrations, or I can mock responses for you.
