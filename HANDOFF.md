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
