# V1 Travel — Homepage Concept 01

A70% + C30% responsive editorial homepage. The original server project was committed and pushed to GitHub main at b8c7ab055c45d7e8cc355b04580a0f31c479a869. This local working copy contains the subsequent homepage prototype; it has not been deployed to the VPS.

## Preview

From web/: npm ci, then npm run dev -- --hostname 127.0.0.1 --port 3100.
Open http://127.0.0.1:3100. Production checks: npm run lint and npm run build.

## Brand palette

- V1 Deep Blue #243746: headings, wordmark placeholder, primary actions, chat.
- Slate Blue #607786: secondary text and accents.
- Mist Grey #DCE3E6: rules, borders, message backgrounds.
- Warm White #F7F7F4: page background.
- Ink #1B1F22: body text.
- Pure White #FFFFFF: controls and text over dark backgrounds.

The text wordmark is a placeholder pending the actual logo artwork. Core copy and controls support English, Chinese and Spanish; editorial photo captions remain English.

## Prototype scope

Responsive desktop/mobile layout, navigation anchors, language switching, mobile menu, destination/service consultation entry points, story expansion, and accessible native chat dialog. My Trips opens a consultation topic; no account dashboard is implemented. Chat explicitly identifies itself as a preview and does not transmit or persist messages. No booking, payments, advisor availability, or live support is represented as operational.

## Photography

Concept imagery downloaded from Unsplash image CDN:
- China / Great Wall: https://images.unsplash.com/photo-1508804185872-d7badad00f7d
- Spain / Madrid: https://images.unsplash.com/photo-1543783207-ec64e4d95325

Confirm final production image licensing and replace with approved brand photography before public launch.

## Server safeguards

No server source files were overwritten or removed. Existing compose configuration still binds port 3000 to 127.0.0.1 only. No firewall or running service changes were made.
