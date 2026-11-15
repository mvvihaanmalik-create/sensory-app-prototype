## Morphing ticket gradients - November 15, 2026

- TicketArtwork now uses TicketFluid: a spatially varying shader bends the artwork within fixed panel bounds. Removed the whole-image drift/rotation animation. Ticket text stays outside the canvas.
- Green and purple use a soft sampling kernel and stationary fine grain to match the brown ticket's finish. All three wallet cards and the confirmation front share the effect.
- Rendering is capped at 30fps and 2.5x pixel density, pauses offscreen/in hidden tabs, and freezes for app or OS reduced motion. The source image remains as a fallback if WebGL is unavailable.

## Photo-only screenshots and onboarding completion - November 15, 2026

- Ten captured screenshots now have SVG viewports that clip the original JPEG pixels to the photo. Menu, gallery, review reuse and the full-screen viewer share those assets. Original JPEGs remain available.
- Updated all 27 matching image fills on Final flow with photo-only crops, preserving frame geometry.
- Completion matches Figma 978:5767: illustration y114, heading y318, preferences y378, plain background, Start exploring primary action and Add another mode secondary action. Both actions retain their intended flow.

## Navigation and Edit mode spacing - November 15, 2026

- Navigation starts screen scroll areas at the top, including repeated taps on the active Home or Search tab and returns from overlays. Profile subpages also reset on entry and return. Existing component state is preserved.
- Edit mode back button now starts at y=70, title y=80 and content scroller y=130, matching the Figma header spacing and clearing the 62px status bar.
- Checked navigation resets, Explore return, and the back button's visible/clickable top edge in both builds.
- Removed the extra Any toggle from the shared onboarding preference card (Sound, Lighting, Crowd and Temperature), matching the final Figma flow. Sliders and Skip retain their existing behavior.

## Status bar and confirmation spacing - November 15, 2026

- Final flow audit: all 87 full-screen UI designs have one visible iOS/iPadOS 26 Status bar - iPhone instance, component key `51ddb19de206b67eae2d554b1d20c018feb754f4`. Eight gradient-only background variants are not screens.
- Added six missing bars on Save/Share overlay frames and Modes selection; hid the older clock/battery inside the Modes background instance. Dark standalone overlays reuse the existing light-ink variant.
- Both Figma confirmation frames (884:694, 1466:11440) now fit 956px, with tighter content gaps and safe bottom spacing. Ticket and touch-target sizes remain unchanged.
- `src/assets/status-ios26.svg` is exported directly from the existing Figma component with outlined text. The laptop preview uses it across all 38 routes, retaining light/dark ink. The phone build retains the device's actual native status bar to avoid duplicate system chrome.

## Interactive confirmation ticket

- BookingConfirmed wraps its existing Ticket in TicketInteraction. The stacked wallet tickets retain their tap/reorder behavior.
- Drag moves and rotates the ticket. Release uses measured angular velocity, exponential drag and a damped spring to settle facing forward. Touch/pen, keyboard arrows and Escape/Home are supported. MotionConfig reduced motion disables spinning.
- Both builds and mouse/emulated-touch checks passed, including settling, gallery-independent booking buttons, Add to calendar and Done. Physical-device feel still needs user review.

## Current photo updates - November 15, 2026

- Venue pass: `src/venueFinalPhotos.js` maps 22 exports to carousel, menu, highlights and Photos grid, with Final flow crops.
- Remaining pass: `src/remainingPhotos.js` maps 34 more exports to Home cards/rankings/Explore, Map recommendations, Saved and Liked, category lists, Discover's Sentient photo, and sensory review photos. Existing venue-grid images are reused for matching sensory reviews.
- All 59 JPGs in the seven supplied ZIPs are accounted for: 56 placed; three left unplaced in the coded screens: `01-06-venue-big-photo-img-5796.jpg` (visible in separate venue references 1401:21713 and 1429:23274), `04-09-review-photo-placeholder.jpg` (older standalone Explore layout), and `06-01-home-for-you-card-a.jpg` (visible in full-bleed Home variants, hidden in outlined card 1163:8037 which uses the `06-04` inset).
- People/avatars and reservation ticket photo ZIPs were not supplied. Those assets and unrelated screens remain unchanged.
- This pass preserves all existing copy, card dimensions, event handlers, state, routing and motion. Figma has other pre-existing copy/layout differences; they are outside this photo-only update.

# Sensory app (UXDG 370): coded prototype handoff

React + Vite prototype of the finalised Figma screens (Home, Map, Profile) inside an iPhone 18 Pro Max frame (440 × 956 pt screen). The code prototype is now the main prototype. Figma remains the design source; the Figma click-through prototype is no longer being maintained.

## For the next Claude session (paste this in)

> I'm continuing a coded prototype for a sensory-friendly going-out app (UXDG 370, Savannah). The zip is attached. Read HANDOFF.md first, then run `npm install` and `npm run build`. The build outputs one self-contained `dist/index.html`. Publish that file as an artifact so I get a shareable link. Keep visuals exactly matched to the Figma file (link below); don't redesign. Next task: <describe it>.

## Run it

```
npm install
npm run dev     # local dev server
npm run build   # -> dist/index.html (single file, all images and fonts links inlined)
```

`dist/index.html` opens straight from disk, or can be published as an artifact / any static host.

## Figma source

File: https://www.figma.com/design/piKIGYS9mjqhShrqGn6kGk/Design (page "Final flow")

| Screen | Node | Notes |
|---|---|---|
| Home (Morning) | 469:2153 | The finalised Home. The 8 other hero bands next to it still use the older lower layout. |
| For you stack | 685:328 | Variants Front=A/B/C |
| Map · Sheet half / full / hidden | 568:1905 / 700:2542 / 704:2310 | Sheet top = 616 / 302 / 956 |
| Profile | 737:2790 | Section "Profile", built from the glass components |
| Venue details (not built yet) | 666:15068 (V2), 666:15231 (WIP) | Not linked in the flow yet |

The Figma MCP can't download asset URLs in Claude's sandbox (figma.com is blocked). What worked: `use_figma` with `node.exportAsync({format:'SVG_STRING'})` for vectors, and `return await node.screenshot({scale:1.3})` for raster images (the image lands in /tmp/claude-tool-results/).

## Code map

```
src/App.jsx       stage, device frame, side panel, screen routing, shared tab bar, status bar
src/Home.jsx      Home: hero (scene + fountain motion), categories, For you card stack, rankings, promo, map shortcut
src/Map.jsx       Map: tiles, pins, glass controls, sense switcher, draggable sheet (snap 302/616/956)
src/Profile.jsx   Profile: header, stat tiles, sensory profile tiles, settings rows, alerts toggle
src/ui.jsx        Glass component, Icon, TabBar, StatusBar, colours, GENTLE spring
src/fountain.js   Exact keyframes for the Morning hero motion (from Figma get_motion_context)
src/svgs.js       All icons/illustrations exported from Figma
src/assets/       scene-morning.jpg, map-tiles.jpg
```

## Design rules being followed

- Screen 440 × 956, page bg #f7f5f1, Figtree (Inter only for the map sheet card titles, as in Figma).
- Text: ink #14181f, secondary #4b5462; glass components use navy #2a2650 and muted #5e5a7e.
- Glass: 1.5px white .95 stroke, white .55 fill + 135° sheen (.55 → .08), 16px backdrop blur, shadow 0 14 18 rgba(42,38,80,.1).
- Transitions use Figma's "Gentle" spring (stiffness 100, damping 15).
- Positions are taken 1:1 from Figma coordinates (mostly absolute positioning).
- The side panel has a Full motion / Reduce motion switch. The hero animation always plays unless Reduce motion is chosen.

## Interactions built

- Home: tap or swipe the For you cards; "Open map" and the Map tab go to the Map screen.
- Map: drag/flick the sheet between up, half and away; tap its header to toggle up/half. When the sheet is away, the filters and recenter button slide in, and dragging up from the bottom brings it back. Chips, sense filter and hearts are selectable (visual only).
- Tab bar: Home, Map, Profile (Search has no screen yet).
- Profile: the "Coming soon" alerts switch only nudges.

## Known gaps / next steps

- Search screen and Venue details are not built.
- Home's other hero contexts (Afternoon, Evening, Night, events) aren't included; their lower sections still use the old layout in Figma.
- The "App comfort" row in Figma's Profile is a detached Settings row (to get a sliders icon). An icon-swap property on Glass / Settings row would fix that.
