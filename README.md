# Sensory app prototype

React + Vite prototype for a sensory-friendly going-out app in Savannah, built for UXDG 370.

## Run locally

Use Node.js 20.19+ or 22.12+ and npm.

```sh
npm ci
npm run dev
```

## Build

```sh
npm run build
```

The build produces a single self-contained `dist/index.html`. Dependencies and generated builds are excluded from Git; the lockfile is included for reproducible installs.

## Current scope

- Home, Map, and Profile screens
- Home card gestures and hero motion
- Map sheet dragging and snap states
- Expanded Map sheet stops at y=172, directly below the category/filter row. The sheet and its list stay anchored to the screen bottom as the panel expands; half and hidden positions remain y=616 and y=956.
- Venue page for Foxy Loxy Cafe (Overview, Menu, Reviews, Photos), opened from the front For you card, Popular #2, or the first map result
- Sense reviews (Sound, Light, Crowd, Temperature, Seating) opened from the sense tiles, with a category bar to switch between them
- Write a review flow (posts into the Reviews tab)
- Book a table in three steps (When, Where to sit with a floor plan, Booking for) and Booking confirmed
- Home-linked pages: Cafés, Dining, Nightlife, Events, More (category icons), For You and Popular Around You (See all)
- Sort sheets behind the Sound, Lighting, Crowd, Temperature and Seating chips (they really reorder the list)
- Modes: Your modes sheet from the Study mode chip, Edit mode (Study, Party, custom), Add custom mode
- Hidden Discovery Mode: pull Home down from the top to reveal the Figma Easter egg screen (`1002:8169`)

Search browse, query results, sensory filters, and venue entry points are implemented.

### Home pages and modes rules

- Filter chips sort the list. Venues with unknown data for that sense always sort last. Several chips stack, the latest one wins. Clear resets the chip.
- Only Foxy Loxy Cafe opens a venue page; other rows show a short note. Back from the venue returns to the same list.
- Picking a mode updates the Home chip and the For You banner. Save changes stays faded until something changes; Add mode needs a name and at least one preference.
- Not in Figma, built to match: the preference picker sheet, Delete mode for custom modes, sorts for Lighting, Crowd, Temperature and Seating.

### Hidden Discovery rules

- Pull Home down while it is scrolled to the very top. Home follows the finger, the header illustration fades, and "Keep pulling to discover" turns into "Release to discover" past the threshold. Let go before it and Home springs back. Touch, mouse drag and a trackpad scroll-up that starts at the top all work.
- A mostly vertical drag pulls the page; a mostly horizontal one belongs to the For you cards (and to the Discover cards once open), so the two never fight.
- Swipe right or tap the heart to save, swipe left or tap the cross to pass, tap the card to open the place. Arrow keys also save and pass. Only Foxy Loxy Cafe has a venue page, so other cards show a short note.
- The deck is ranked by the active mode (Study, Party or a custom mode) and re-ranks when the mode changes. Each card says why it fits and flags what does not, or what is unknown. Unknown sense data is shown as Unknown, never guessed.
- Saved and passed cards persist while the app is open. Saved places add to the Saved count on Profile. "Show passed places" brings passes back.
- The close button or Escape slides Home back down over Discover. Home is never unmounted, so its mode chip and For you card stay as they were.
- Discovery uses the exact Figma morning background at 20% opacity, its 393 × 628 card at (23, 135), five sensory tiles, and 48px pass/save actions. The photo area stays the Figma placeholder. Ranking, save/pass state, Home pull gesture, and existing springs are preserved. Extra venue data remains dynamic; unknown temperature or seating stays Unknown.

### Booking flow rules

- Nothing is preselected. Each step's button stays faded until the step is complete; tapping it early scrolls to what's missing and nudges it.
- Step 1: times stay greyed until a date is picked. Availability changes by day, and parties of 6 or more lose peak slots. Changing date or party size clears a time that is no longer free.
- Step 2: four areas (Patio, Garden pond, Indoor, Bar). Which tables are taken depends on the date and time; tables too small for the party fade. Comfort picks that a table can't meet are called out, with a suggested table that fits.
- Step 3: summary rows jump back to the step that owns them; name, phone and email edit inline.
- The confirmation is built from the choices. "Change or cancel booking" reopens step 3 with everything kept.

## Search flow and source

Read November 9, 2026: Search section `985:6709` contains one finished frame, `985:6872`, named `Map · Sheet half` in Figma. It is the Search browse screen, not a map. It has no prototype reactions. The frame is 440 × 956; its search field is 328 × 52 at (24, 62), category row begins at (24, 128), scroll viewport starts at y=193, and bottom tab bar is 273 × 64 at (84, 862). Cards are 192 × 108 with 192 × 77 backgrounds and 103 × 103 illustrations. All values and artwork come from that frame. PNG artwork is stored at 2× display size. Glass, type, status bar, tab bar, and `GENTLE` springs reuse the repo's shared components.

| Screen or state | Entry | Back, close, or return |
| --- | --- | --- |
| Browse, `#search` | Search tab; Home or Map search field | Other tabs remain reachable; returning preserves browse scroll and selected chip |
| Results, `#search-results` | Type a query, tap any category card, or tap Events chip | Back to browse clears query/category and preserves applied filters and browse position |
| Filter sheet, `#search-filters` | Filter button | Close, scrim, Escape, browser Back, or swipe down discards the draft; Apply commits it |
| Sample place preview, `#search-place` | A non-Foxy search result | Done, Close, scrim, Escape, browser Back, or swipe down returns to unchanged results |
| Foxy Loxy venue | Foxy result | Back to Search restores query, filters, and results scroll |

Flow rules:

- All is selected by default as shown in Figma. Sensory filters start empty.
- Category cards narrow the dataset; query words and applied filters combine with AND. Search ignores case and accents. Blank submission focuses the input; clearing an unfiltered query returns to browse.
- Filter choices are drafts until Apply. The CTA count reflects the draft and current query/category, including zero matches. Active filter chips remove one preference at a time.
- An active Quiet mode or Quiet filter plus Buzzing or Live music shows an explanation and a one-tap switch to Quiet now without losing the quiet filter.
- Like your saved places requires the shared Foxy Loxy saved state. Save or unsave Foxy on its venue page or in Discovery and this collection and Profile count update together.
- Home and Search stay mounted. Their independent scroll containers preserve positions; opening another category or changing a query starts results at the top.
- Extra bottom padding keeps the last category row reachable above the floating tab bar.
- Hash routes and the desktop jump list are testing shortcuts. All Search screens also have real tap paths. A fresh direct place-preview route uses Gallery Café as a demo.

Prototype additions where Figma has no screen: result cards, filter sheet, empty states, conflict explanation, and compact previews for other places. Search reuses all Home/list/Discovery names, distances, event schedules, and sensory profiles. Unknown sensory data stays Unknown and cannot pass the corresponding strict filter. Category membership is a prototype mapping. One bakery fixture fills the only type absent from the repo. This inventory is prototype data, not live venue facts or recommendations. New in Savannah is a demo collection, not a verified opening list. Similar-place matching is the existing café collection unlocked by saving Foxy. Fits you tonight reuses Discovery’s active-mode ranking, without claiming live opening hours. Full venue screens currently exist only for Foxy Loxy. Search state lasts until the page is reloaded; Foxy's saved state is shared with Discovery and Profile while the app is open.

This feature branches from `feature/hidden-discovery` at `dafce5a`, the current live source, and preserves its booking, reviews, lists, modes, and Discovery flows.

## Design source

[Figma design](https://www.figma.com/design/piKIGYS9mjqhShrqGn6kGk/Design?node-id=469-2151) · Venue section: node 789-3120

Use the **Final flow**, **DS · Foundations**, and **DS · Components** pages as the design reference. See [HANDOFF.md](HANDOFF.md) for the original implementation notes and screen node IDs.

The Easter egg view is grounded in the Home page frame “Easter egg function.” The browser requires login to read the comment itself, so the connected frame is the implementation source. Only the Discovery view, its local assets, and its conditional home indicator changed for this update.

## Copy fidelity

Static subtitles and decorative helper copy should come from the corresponding Figma frame. Edit/Add mode has one title at y=62, without a “Your modes” breadcrumb (`984:7582`, `984:7663`, `984:7738`). The Your modes sheet title, mode descriptions, list location subtitles, venue subtitles, and preference hints are retained because they appear in Figma.

Removed prototype-only captions from Edit/Add mode, custom-mode cards, Discovery, Search, the review composer, and the desktop preview panel. Booking confirmation uses the source “Held Until” label with the selected time instead of an added reminder paragraph. Keep implementation and sample-data explanations in this README. Required interaction feedback, result counts, empty-state recovery, conflicts, and choice-dependent summaries remain functional.

## Map and Discover finish

The expanded Map sheet snaps to y=172, directly below the category buttons. Collapsing it resets the list scroll position; the list has enough bottom clearance to read the last result above the tab bar. Starting another drag stops the previous snap animation.

Discover follows Figma frame `1002:8169`: a 393 × 628 glass card, five sensory tiles, the exported morning artwork, and 48px Pass/Save actions. The Save fill uses a more specific selector so shared glass CSS cannot override it. Save/pass decisions survive closing and reopening Discover.

## Validation

- `npm run build` passes.
- Data checks cover all 19 category collections, 16 filter combinations, accent/case search, saved-place dependency, and mode-dependent ranking.
- Browser checks cover all 19 category tap/back paths, category chips, empty search, combined filters, cancellation, removal, Escape, swipe-down, browser Back, and sample preview Done.
- Integrated checks cover Home/Map/tab entry points, Search state restoration, venue Save reflected in Search and Profile, Party-mode ranking, and Reserve opening the existing unselected booking flow.
- Browse geometry and all 19 source illustrations were compared with Figma. No application console errors or warnings were observed.

## Collaboration

The initial upload establishes the baseline on `main`. Make subsequent changes on separate branches and use pull requests to review and merge them. Pull the latest changes before starting work and include a brief description and build result with each pull request.

```sh
git switch main
git pull --ff-only
git switch -c feature/short-description
```


## Home and Profile update

Source frames: Home selector `909:3822`; mode editors `984:7582`, `984:7663`, `984:7738`; Profile `737:2790`, `1025:6415`, `1025:6438`, `1025:6461`. The Home hero and linked category layouts were checked against the current file.

Profile uses the authored My modes carousel and Saved places page. Mode changes, edits and custom names share App state with Home, Search and Discover. Editors use the four source sliders and seating choices. Save and Back return to the screen that opened the editor. Saved places starts with the source Foxy Loxy/The Grey fixtures and reflects later venue, map and Discover saves.

Only source copy and user-entered custom names appear in these updated flows. Removed the old preference hints, picker-only labels, mode-save notifications and prototype-only list notices.


## Onboarding

Source section `978:5405`: Welcome `978:5406`, Sound `978:5432`, Light `978:5513`, Crowd `978:5594`, Temperature `978:5644`, Seating `978:5725`, Start exploring `978:5767`. Deep links are `#onboarding`, `#onboarding-sound`, `-light`, `-crowd`, `-temp`, `-seating` and `-done`; the side panel has a Replay onboarding button. The app opens on Welcome, and Skip or finishing lands on Home; a link with a view id (for example `#profile` or `#venue`) opens that view instead.

Skip leaves at any step and saves nothing. Back steps one screen. Sliders drag, tap and take arrow keys; Any clears that preference. Finishing, or Skip for now on the last screen, saves the picks as a "My comfort" custom mode and makes it active, so Home, Search, Discover and Profile follow it. Replaying onboarding replaces that mode. Add another profile saves the same mode and opens Add custom mode from Profile.

Scales: Sound Quiet / Easy to talk / Lively / Loud, Light Dim / Warm & cozy / Natural / Bright, Crowd Almost empty / Relaxed / Moderate / Busy / Packed, Temperature Cool / Mild / Warm. Every label is from Figma or the mode editor except Light's third step, Natural, which is a placeholder. The saved mode is named My comfort and has no description line; that name is not in Figma. Steps past the end of a mode scale fold into its last value (Loud becomes Lively, Packed becomes Busy). Seating chips map to the mode's seat position and layout. Illustrations are 1x Figma exports. The Welcome contour lines are the exported Figma vectors (`src/assets/onboarding/contours.svg`). The Crowd slider's tooltip uses the single-person icon, as in Figma.


## Phone build

A second build for testing on a phone. It is the same app and the same code with the iPhone frame, island, status bar, home indicator and side panel removed, so the screen fills the device and text is as large as it can be. Build it with `npm run build:phone` (output `dist/phone/index.html`); `npm run build` produces both builds, the framed laptop version at `dist/index.html` and this one.

The screen keeps its 440 x 956 layout and fills the window width, in portrait or landscape, so an iPhone 14 (390 wide) and an iPhone 17 or 18 (402 wide) get the screen edge to edge. When the window is shorter than the screen (Safari's toolbars, the status bar of a home-screen app), the empty strips at the top (32px) and bottom (24px) of the design are trimmed before the scale shrinks. On iPhone, open the link in Safari and use Share, Add to Home Screen to run it full screen; with Safari's toolbars showing there is less height, so the app scales down to fit. Page zoom, text selection and overscroll are off in this build. Reload, or close and reopen the app, to reset to Welcome between testers.

## Home hero scenes

The laptop build's side panel has a Home hero list that swaps the Home hero between the nine finished Figma bands in the Final flow section: Morning, Afternoon, Evening, Night, St. Patrick’s Day, Savannah Music Festival, Holiday Lights, Halloween and Christmas. Each scene brings its art, scrim, greeting and subtitle lines, text colours (white on the dark scenes, including the status bar clock and battery) and its Motion layer, rebuilt from the Figma keyframe tracks on the shared 6 s loop: fountains with drops and ripples, river shimmer, fireflies, music notes, twinkling lights, candle flicker and snowfall. Scene data is in `src/scenes.js`; Morning keeps its own fountain and street lamp (`src/fountain.js`, `src/lamp.js`). The chip still shows the active mode, and Reduce motion keeps the art and drops the layers. The phone build always shows Morning and leaves the other scenes out.
