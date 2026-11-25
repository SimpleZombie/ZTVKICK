# ZTV style lock

Surface: app shell / data view. A 1280x720 cable guide captured 24/7 to kick.com/simplezombie. Viewers watch passively, often in a small player.

## Locked (do not re-derive)
- Mark: the ZTV network mark in index.html (keep byte for byte).
- Type: Oswald (names, titles), VT323 (times, numbers, the machine voice). Self-hosted in assets/fonts.
- Palette (Nov 20): one phosphor green family, hue 148, for everything: guide, cards, takeovers, alerts, pre-roll bumpers. Lightness carries the roles (near-black ground, pale green text, bright phosphor for times and numbers, mid green for fills). The ZTV mark keeps its own colors.
- Type scale (css/style.css, polish layer): 2.6 / 3 / 3.6 / 5 / 5.6 vh.
- Channel icons: pixel-art CRT suite (assets/channel-icons).
- Structure: header, TV + info panel, guide grid with the tuned channel pinned on top, ticker.

## Decisions (kept / rejected)
- kept: pinned tuned row (Nov 20)
- kept: polish pass, title as the biggest text, first-sentence blurb (Nov 20)
- rejected: Alamo/VHS yellow theme on the guide (Nov 20)
- rejected: big-picture layout (A) and pixel-font guide (C) (Nov 20)
- rejected: watch view rework (Nov), toony and line icons, all logo rounds but 3C (on hold)
- kept: one phosphor-green theme across the whole channel (Nov 20, user: stay in green, one theme)
