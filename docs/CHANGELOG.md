# ZTV changelog

## Current (Nov 2026)
- Weekly dead video check (`server/check-videos.py`, Sundays 5 AM Central): shows that vanished from archive.org are taken out of the schedule after two failed checks in a row, and put back if they return.
- Five pixel-art video bumpers (Night Drive, Signal, Right Back, Late Room, Surf) with their own sound, and a cleaned-up set of text cards. Bumpers no longer repeat within the last few, and some only run late at night.
- Fix: the stream could get stuck muted after a show failed to start; it now never mutes for that, turns sound back on by itself, and mods have `!unmute`, `!mute` and `!vol`.
- Ad breaks are now ZTV Classifieds (quiet cable-access listings) by default; the fake commercials are optional and their jingle is softer.
- New takeovers: ZTV Explains, Lost & Found, ZTV Is Your Friend, and Picture This (public domain photos from Wikimedia Commons with deadpan captions).
- One stylesheet (`css/style.css`) replaces five stacked ones; nothing on screen changed.
- Pixel-art CRT channel icons for every channel (`assets/channel-icons/*.png`).
- Restarts at 4 AM, noon and 8 PM Central, with stand-by and hello cards around the noon and 8 PM ones.
- New channels: The Other Line, Community Board, Deep Blue, Final Offer, Cheat Code, Factory Floor, Laboratory B, Departure Gate, Denpa, Tech Support, World of Tomorrow, TV Dinner, Waiting Room.
- Server setup installs Japanese/Chinese/Korean fonts so titles like Denpa's show properly instead of boxes.
- `server/fill-catalog.py` finds archive.org shows for a channel and saves them to `data/catalog-extra.js` on the server, where updates can't wipe them.
- Fixes: the ID cards (sign-on, sign-off, stand-by) fill the screen again, the setup script copies the `assets/` and `audio/` folders, and the frame drop/duplicate stutter in the capture is gone.
- Chat bumps, requests, Z Bucks, `!surf`, raid alerts, the late night look, 3 AM dead air, fake ads, the zombie alert, the recap card, sign-off/sign-on, and Watch view (`!fullscreen`) with its cooldown.

## Earlier notes
These are the notes from the 2.0 visual and weather passes, kept as they were written. Some mention files that have since been merged (the old css/afterhours.css, weather-boxed.css, network-fringe.css and icon-alignment.css are all in css/style.css now).

### Changelog 2.0

### ZTV 2.0 — first visual and broadcast pass

#### Visual direction
- Added `css/afterhours.css` as a non-destructive visual override layer.
- Replaced the forest-dominant page background with a restrained late-night cable network treatment.
- Reduced neon/glow, softened CRT scanlines, sharpened panel edges, and introduced muted green metadata accents.
- Preserved the original forest asset and existing ZTV logo.
- Added a violet-tinted late-night palette.

#### Broadcast identity
- Added randomized station identification cards with original deadpan copy.
- Station IDs run on a randomized 24–42 minute interval by default.
- Added `EXTRAS.stationIds` configuration to enable/disable and tune the interval.
- Station ID scenes use the existing segment runner, so they wait for active takeovers, bumpers, votes, and weather segments rather than interrupting them.

#### Compatibility
- Preserved existing channel/catalog data, Kick chat, guide, voting, Z Bucks, alerts, takeovers, weather, playback and server scripts.
- Checked modified JavaScript files with Node syntax validation.

#### Broadcast identity pass: bumpers, icons and takeovers

- Rebuilt the default bumper rotation with ten short, deadpan network messages.
- Added five coordinated bumper skins: Network, Bulletin, Local, Technical and After Hours.
- Added a ZTV logo lockup to card bumpers and more restrained 2.0 typography and framing.
- Retuned the channel icon renderer to use a consistent dark broadcast tile while preserving each channel's individual glyph and color accent. All 50 channels have a matching glyph.
- Retuned the existing takeover looks to the 2.0 palette.
- Added three takeover formats: Service Notice, Viewer Bulletin and Transmission Interrupted.
- Expanded the takeover message pool with more dry, network-style copy.
- Kept the original channel IDs, catalog, playback and server scripts unchanged.


#### Weather and motion package
- Restyled Z Weather as a restrained local-news/weather desk while preserving the Open-Meteo data flow, randomized city pool, current conditions, extended forecast and smooth-jazz audio.
- Added a decorative radar sweep explicitly labeled as a radar test display; it is not live precipitation radar.
- Added Frank, the ZTV weather-desk mascot, plus recurring original station mascots Midge and Channel Zero.
- Changed routine network IDs to a single 4.5-second ident.
- Added a 12.2-second three-part After Hours bumper sequence on a randomized interval.
- Added animated channel-change zap transitions.
- Retained and visually retuned the sign-on/sign-off package; added mascot appearances to selected ID and ad scenes.
- Added two original fictional local businesses to the fake-commercial rotation: Bud’s Night Window Repair and Last Stop Video & Bait.
- No server scripts, Kick RTMP configuration, channel catalog, or Open-Meteo request parameters were changed.

#### Weather Network and buffering refresh
- Original blue-and-white ZTV Weather Network logo, inspired by classic cable-weather legibility rather than copied branding.
- New flat SVG weather symbols for sun, clouds, rain, snow, storms, fog, and wind.
- Weather mascot removed from broadcast output; no character shown in weather segment.
- Weather radar is a decorative test sweep, NOT live precipitation radar.
- Buffering overlay now matches ZTV's olive/ivory broadcast palette.
- Existing station ID, ad, and after-hours bump timing preserved.
- Test locally in Chrome: `weatherTest()` and `afterHoursBump()` in the console; `B` previews a bumper.

### Identity Release Notes

### ZTV Network Identity — Green Cable Edition

Based directly on **ZTV Weather Desk — Viewer Requests** (not the later experimental builds).

#### Changed
- New original geometric green-and-ivory ZTV Network logo, used in the main guide header, sign-on/sign-off sequences (through the shared logo), and timed station identification.
- New matching favicon / compact Z mark.
- Updated header subline to identify the network and Kick broadcast.
- Weather Desk retains its existing ZTV Weather Network logo, forecast graphics, and `!weather` requests.

#### Not changed
- Default guide layout, watch controls, Kick chat, channel icons/logos, schedules, station-ID timing, commercials, weather content, buffering, or broadcast configuration.
- No new channel transition or random-interstitial preview commands.

#### Review
Open index.html in local staging and verify the header. In Chrome DevTools Console, use `stationId()`, `signOn()`, and `signOff()` to inspect network identity. `wxRequestTest("78701")` previews a viewer-requested forecast.

#### Deployment
This package is a candidate, not a live deployment. Keep the previous ZIP as rollback. Validate in the actual Chrome kiosk + FFmpeg environment before swapping your live broadcast directory.

### Network Muted Palette V2

ZTV network muted palette v2

Corrected the underlying hard-coded neon green colors in css/style.css, not just the branding overlay. This affects guide and fullscreen station chrome, schedule highlight, program titles, progress bars, and interaction UI. Weather-specific CSS/JS and playback logic remain unchanged.

Staging only: verify locally at 1280x720, then deploy using your existing rollback procedure. No live VPS changes were made.

### Network Fringe Update

### ZTV Network: Fringe Broadcast Identity

Changes apply to the main ZTV station, not ZTV Weather.

- Distressed ivory ZTV / Zombie Television mark replaces the split Z/TV logo.
- Muted olive, charcoal and warm ivory network palette, with minimal analog texture.
- Existing `!guide` and `!fullscreen` layouts and video sizes preserved.
- Follow, subscription, gifted-subscription and gift-bomb notifications re-themed as analog station notices.
- Viewer’s Choice vote overlay re-themed in muted broadcast colors; voting mechanics unchanged.
- Buffering elements adjusted to the same restrained palette.
- Weather branding and forecast layouts unchanged.

Local test keys: F = follow, U = subscription, G = gift bomb, V = vote.
Review both guide and fullscreen views at the real stream resolution.
This is a staging build; it has not been deployed or browser-tested.

### Weather 90S Update

### ZTV Weather Desk: 1990s Broadcast Refresh

This is a targeted update of `ztv-weather-compact-logo-and-theme.zip`.

#### Visual changes
- 1990s-style rectangular blue forecast panels and orange/blue masthead.
- Correctly scaled compact orbital ZTV logo in forecast header.
- Intro removes the unrelated mountain/radar shapes and centers the full approved WEATHER logo on a simple cable-ident plate.
- Reduced forecast typography to avoid overflow at 1280x720.
- Bottom weather-news bulletin rotates headlines every 6.8 seconds.
- Existing weather music, forecast sources, chat requests, guide and other channels remain unchanged.

#### Live weather bulletin headlines
- For continental US locations, the browser attempts to fetch **actual active National Weather Service alerts** from `api.weather.gov`. If none are active or the service is unreachable, no alert is invented.
- Optional general news feed: set `EXTRAS.weather.newsEndpoint` to a CORS-enabled JSON endpoint returning either `[{"title":"..."}]` or `{ "headlines": [...] }`. The browser will pull and rotate those headlines. Leave unset to avoid showing unsourced headlines. This is not a built-in general-news feed.
- Fallback station messages are explicitly station copy, not news reports.
- NWS and optional feed require network connectivity and CORS access.

#### Preview
Use `weatherTest()` or `wxRequestTest("78701")` in a staging browser. Verify at the actual 1280x720 capture size, including long city names and extended forecasts. Do not overwrite the live VPS without testing.

### Weather Boxed Readme

### ZTV Weather — Boxed 1990s Cable Edition

Changes are scoped to the weather overlay; the main green guide, channel icons and playback remain unchanged.

#### Visuals
- Boxed ZTV mark: `assets/ztv-weather-boxed.svg`
- Current conditions and five-day forecast are displayed together.
- A second page displays a text-based local forecast, derived from live Open-Meteo data.
- Bottom bulletin rotates live NWS alerts where available, plus optional news from `EXTRAS.weather.newsEndpoint` (a JSON feed endpoint under your control).
- No fake severe-weather alert is generated when none is returned.
- All numbers are fetched at runtime; preview mockup values are not hard-coded.

#### Music
The YouTube track requested by the user has not been downloaded or embedded. Its exact license could not be independently verified for 24/7 rebroadcast on Kick. The existing original ZTV weather theme remains the default.

Once you obtain the music recording with a license allowing livestream rebroadcast on Kick, place it in `audio/` and update `EXTRAS.weather.music` in `data/extras.js`, e.g. `music:"audio/approved-weather-track.ogg"`. The existing weather audio player loops and fades the track.

#### Test
Serve the folder over HTTP, open Chrome, and use `weatherTest()` or `wxRequestTest("78701")` in the browser console. Check 1280×720 capture, font sizing, ticker, audio and actual forecast fetching in staging before replacing the live stream.

### Weather Branding Update

### ZTV Weather Branding & Music Update

Based on ZTV Weather approved-logo build. No guide or channel behavior changes.

- Intro: full ZTV WEATHER orbital logo (`assets/ztv-weather-retro-logo.webp`).
- Forecast header: compact ZTV-only orbital logo (`assets/ztv-weather-compact.webp`).
- Weather music: original 60-second stereo theme (`audio/ztv-weather-track-01.ogg`).
- The music loops during weather breaks and fades at the end via the existing audio handler.
- Viewer-requested `!weather` forecasts share the same presentation and music.
- Existing dark weather palette and green parent-network guide remain unchanged.

Test in Chrome staging: `weatherTest()` and `wxRequestTest("78701")`.
Audio playback may require browser autoplay permission, depending on kiosk settings.
Verify in the VPS Chrome/FFmpeg capture before deploying live.

### Weather Density Update

### Weather broadcast density update

Changes only weather presentation and Open-Meteo daily fields. Keeps guide, channel selection, boxed logo, blue/orange theme, ticker, music, and viewer requests.

- Current Conditions: larger weather icon and temperature, prominent location, Right Now heading and larger stats.
- Five Day Forecast: larger icons/highs/lows and precipitation probability from Open-Meteo.
- Local Forecast: three horizontal rows with condition icons and concise forecast data.
- Sunrise and sunset appear when supplied by the API. No invented data.

Run `weatherTest()` or `wxRequestTest("78701")` in local staging. Verify 1280x720 Chrome kiosk output and FFmpeg capture before live deployment.

### Weather Grid Polish

### ZTV Weather Desk — Grid Polish v4

Built on `ztv-weather-dense-broadcast-v3.zip`.

- Local Forecast rows use fixed 18% / 14% / 38% / 30% columns.
- Weather symbols are constrained to the icon column and clipped at the row boundary.
- Period labels, icons, descriptions, and temperatures align vertically.
- Temperatures are kept closer to conditions within a stable grid.
- Footer/source text has dedicated spacing and weather bulletin padding is increased.
- No changes to the guide, soundtrack, forecast data, chat commands, or other channels.

Test at 1280×720 using `weatherTest()` and `wxRequestTest("78701")` in a staging browser. Confirm in the actual FFmpeg capture before deployment.

### Weather Logo Update

### ZTV Weather: Approved Retro Logo

This is a focused branding update built on the ZTV Network Identity Green + Weather Desk build.

- The exact ZTV WEATHER orbital logo from the generated reference image is used in the weather intro and weather forecast header.
- Source art crop: `assets/ztv-weather-retro-logo.webp`. This is a raster crop, not an editable/vector recreation.
- Existing weather forecasts, `!weather` requests, Kick chat integration, green parent network identity, and guide remain unchanged.
- Preview locally with `weatherTest()` or `wxRequestTest("78701")`.
- Test in a staging browser and FFmpeg before deploying live.

### Weather Requests

### ZTV Weather Desk — viewer requests

Based on **ZTV Weather Network Refresh**, not the subsequent Phase 1 experiments.

#### Chat commands

- `!weather 78701` — US ZIP code lookup.
- `!weather Austin, TX` — city lookup.
- `!weather Tokyo` — international city lookup.
- `!weather` — moderator-only manual random weather broadcast (legacy shortcut).

Requests resolve using Zippopotam.us (US ZIPs) or Open-Meteo geocoding (cities), then use the existing Open-Meteo forecast API. No paid API key is needed. City names with multiple matches may need a state or country. Requests are queued and shown only while the broadcast overlay is idle; each requested city gets current conditions and an extended forecast, with a requester credit in the ticker.

Default safeguards: one request per viewer per 10 minutes, 30-second global request spacing, four waiting/resolving requests maximum. Configure these in `data/extras.js` under `weather.requests`. Failed lookups are not added to the queue. The existing automated weather schedule and music are preserved.

#### Local testing

Open the site in Chrome via a local HTTP server, press F12 and run `wxRequestTest("78701")` or `wxRequestTest("Tokyo")`. The weather API needs internet connectivity. For a full end-to-end test, connect Kick chat and send `!weather 78701` from chat.

#### Production considerations

Requests are queued in browser memory and disappear on restart. Rate limiting is per broadcast browser session, not server-side. The browser needs outbound HTTPS access to api.zippopotam.us, geocoding-api.open-meteo.com, and api.open-meteo.com. CORS and network access should be tested in the same Chrome environment used by FFmpeg. There is no actual browser fullscreen toggle in this feature.

#### Visual identity

Keeps the original dark Weather Network Refresh weather theme, SVG icons, logo, guide, channel graphics, and bumper behavior. No experimental map, station logo redesign, or new transition animations have been added.

### Weather Sizing Fix

### ZTV Weather sizing correction

Based on the previous `ztv-weather-boxed-90s-build.zip`.

- Restores the boxed ZTV logo to the forecast header (older stylesheet had `display:none`).
- Reduces excess spacing in the opening ident and header.
- Replaces the mostly empty Local Forecast paragraph with three large forecast panels:
  Today / Tonight / Tomorrow, all populated from the same Open-Meteo data.
- Retains the approved blue/orange palette, news ticker, green ZTV guide, weather requests, and existing audio.
- Does not change live stream deployment.

Preview in local Chrome: `weatherTest()` or `wxRequestTest("78701")`.
Check at actual broadcast resolution before deployment.

### Channel Icon Update

### ZTV Channel Icon Suite

Generated 50 separate PNG icon assets for the **actual** ZTV channel lineup.

- ZTV channel 03 uses only a single Z, no TV lettering.
- No text is embedded in the other channel icons.
- Eight icons use artwork cropped from the approved visual concept sheet; the remaining channels have individually tinted, textured versions of their existing pixel glyphs.
- Existing `!guide` and `!fullscreen` layouts are unchanged.
- Existing channel names and dial numbers remain outside the icon artwork.
- ZTV Weather, viewer alerts, and voting logic are unchanged.

This is a staging package. Test in Chrome at 1280x720 before deploying.

### Icon Alignment V2

### Channel icon alignment + coverage v2

- Audited 50 channel IDs against matching icon files: 0 missing.
- Normalized all 50 icon PNGs to 128x128 tiles with consistent artwork padding.
- Shared `logoFor(c)` source remains used by guide, watch/fullscreen, information panel and channel banner.
- Added versioned icon URLs to avoid old browser-cached artwork.
- Added a final stylesheet to fix number/icon/name grid alignment and enforce square icon bounds.
- ZTV channel 03 remains a simple Z. No changes to playback, guide/watch view behavior, weather or voting.
- Test on local staging at 1280x720 and verify browser cache refresh; not deployed to VPS.
