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
- Venue page for Foxy Loxy Cafe (Overview, Menu, Reviews, Photos), opened from the front For you card, Popular #2, or the first map result
- Sense reviews (Sound, Light, Crowd, Temperature, Seating) opened from the sense tiles, with a category bar to switch between them
- Write a review flow (posts into the Reviews tab)
- Book a table in three steps (When, Where to sit with a floor plan, Booking for) and Booking confirmed
- Home-linked pages: Cafés, Dining, Nightlife, Events, More (category icons), For You and Popular Around You (See all)
- Sort sheets behind the Sound, Lighting, Crowd, Temperature and Seating chips (they really reorder the list)
- Modes: Your modes sheet from the Study mode chip, Edit mode (Study, Party, custom), Add custom mode
- Hidden Discovery Mode: pull Home down from the top to reveal a swipeable card stack (not in Figma, built from a written brief)

Search is not implemented yet.

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
- The close button, Escape, or the tab-less Home slide back up. Home is never unmounted, so its mode chip and For you card stay as they were.
- Card images are illustrations (the app has no venue photography yet); the café and the park reuse the Savannah header scene.

### Booking flow rules

- Nothing is preselected. Each step's button stays faded until the step is complete; tapping it early scrolls to what's missing and nudges it.
- Step 1: times stay greyed until a date is picked. Availability changes by day, and parties of 6 or more lose peak slots. Changing date or party size clears a time that is no longer free.
- Step 2: four areas (Patio, Garden pond, Indoor, Bar). Which tables are taken depends on the date and time; tables too small for the party fade. Comfort picks that a table can't meet are called out, with a suggested table that fits.
- Step 3: summary rows jump back to the step that owns them; name, phone and email edit inline.
- The confirmation is built from the choices. "Change or cancel booking" reopens step 3 with everything kept.

## Design source

[Figma design](https://www.figma.com/design/piKIGYS9mjqhShrqGn6kGk/Design?node-id=469-2151) · Venue section: node 789-3120

Use the **Final flow**, **DS · Foundations**, and **DS · Components** pages as the design reference. See [HANDOFF.md](HANDOFF.md) for the original implementation notes and screen node IDs.

## Collaboration

The initial upload establishes the baseline on `main`. Make subsequent changes on separate branches and use pull requests to review and merge them. Pull the latest changes before starting work and include a brief description and build result with each pull request.

```sh
git switch main
git pull --ff-only
git switch -c feature/short-description
```
