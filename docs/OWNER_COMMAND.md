AKASH BOT 11 — `owner` command

Usage:
- Send the text: `owner`
- Aliases: `ownerphoto`, `whoisowner`, `creator`

Behavior:
- The bot will send an image and a neutral caption: "Profile photo (user-submitted) — AKASH BOT 11".
- The image source is chosen in this order:
  1) Environment variable `OWNER_IMAGE_URL` (recommended if you want to keep the image off-repo)
  2) Repository file: `assets/owner.jpg` (raw URL)

Security & privacy:
- The bot does not assert or identify the person in the photo. The caption is intentionally neutral.

How to make the image appear:
1) Upload the image to the repository at `assets/owner.jpg` (GitHub web UI is easiest).
2) Or set `OWNER_IMAGE_URL` in your deployment environment to a public image URL.

Next steps I can do for you:
- If you attach the image here or tell me you uploaded it, I will add the actual image file to the repo and confirm.
- I can also change the caption text if you provide a neutral alternative.