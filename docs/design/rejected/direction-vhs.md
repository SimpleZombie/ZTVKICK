# ZTV guide revamp: direction (Nov 2026)

Mode: autonomous (user asked for minimal back-and-forth). Review waived; captures are sent for approval.

## Job
- A 1280x720 cable-guide page captured 24/7 and streamed to kick.com/simplezombie.
- Viewers glance at it on a phone or a small player: in five seconds they must see what's on, which channel, and that it's live.
- Fixed: the ZTV mark, the cable-guide structure (screen, now playing, up next, grid, ticker), every feature and key binding, the CRT/VHS feel.
- Given references: Alamo Drafthouse brand standards (black, white, schoolbus yellow #F5B324, Futura Bold caps, shaded display type, halftone, sticker icons, Garamond for synopses) and 80s VHS sleeve design (rainbow stripes, spec lines, VHS badges, heavy geometric sans).

## Needs, ranked
1. A viewer needs to read the current show title from across the room, in the info panel.
2. A viewer needs to tell which channel is tuned and where it sits in the grid.
3. A viewer needs to see at a glance that this is live, 24/7 TV with a schedule they can follow.
4. The channel needs to feel like a video store / repertory cinema, not a generic dark dashboard.
5. Chat users need the commands (!ch, !guide) to stay visible without clutter.
6. Takeovers, bumpers and cards need to match the guide so the channel reads as one network.

## Facts
- 63 channels of archive.org TV; pixel-art CRT icons per channel.
- Schedule is a real 2-hour grid that scrolls; a ticker runs Kick follow text.
- Restarts 3x daily; a late-night mode switches theme after midnight.
- The audience watches on Kick, often scaled to a small player.

## Default to beat
Dark gray panels, one neon accent, monospace everywhere, thin borders (the current page).

## Direction chosen (bold)
"ZTV as the video store wall": black ground, schoolbus yellow as the one accent, white and warm cream type.
Futura-style caps (Jost) for everything that names something, the shaded display treatment once per view (the now-playing title),
Garamond (EB Garamond) for the show descriptions, the five-band VHS stripe as the single signature device under the header.
The OSD and no-signal screen keep VT323, since that's the VCR's own voice.

## Decisions
| Decision | Choice | Because |
| --- | --- | --- |
| Focal point | Now-playing title, shaded white on black with a yellow drop | need 1 |
| Accent | #F5B324 only; red #D7322A for LIVE only | user's reference; need 3 |
| Signature | 5-band VHS stripe under the header | user's VHS reference, need 4 |
| Type | Jost 800/600 caps, EB Garamond for descriptions, VT323 only inside the screen | reference brand, need 1 |
| Grid | Black rows, yellow "now" cells, yellow channel number stickers | need 2 |
| Ticker | Yellow band, black halftone, black caps | need 3, 5 |
| Late night | Accent turns orange (#F28C28) after midnight | existing late mode |
| Takeovers/cards | Green accent swapped to the same yellow | need 6 |
