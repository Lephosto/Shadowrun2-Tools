# SR2 tools: source

This folder builds `builder.html` and `gear-locker.html` in the site root. It contains no book text.

## Build

```
python3 build.py      # set SR2_SITE=/path/to/site to choose where builder.html and gear-locker.html are copied
./runall.sh           # every regression check (needs Node, Python 3 and Playwright)
```

The build runs these steps in order:

1. Inject each `shared/*.js` module into both pages, between `/*@shared:NAME*/` and `/*@end:NAME*/` markers.
2. Run `extract.js` to turn the builder's item data into `gear_data.json`.
3. Run `gear/mk.py` to build the old-layout Gear Locker (kept for reference), then `gear/mk2.py` to build the live Gear Locker from the same template with the new layout.
4. Check that every injected block matches its source module.
5. Copy the Runner Builder and the new-layout Gear Locker (`SR2_Gear_Locker_2.html`) to the site as `builder.html` and `gear-locker.html`.

## Files

| File | What it is |
|---|---|
| `sr2-builder.html` | The Runner Builder. It is the single source for all item data. |
| `gear/template.html` | The Gear Locker's data, rules and old layout; `gear/mk.py` fills it with the item data. |
| `gear/mk2.py`, `gear/v2ui.js`, `gear/v2ui.css` | The live Gear Locker layout: sources panel, category picker, grouped list, tabbed item panel, fold-away shopping list, and the build-outs (gun mount map, vehicle workshop, deck, cyberware options, cyber body). `mk2.py` rewrites a copy of the template; the rules code is untouched. |
| `shared/decks.js` | Rules code shared by both pages: deck limits and VR2 pricing. |
| `shared/guns.js` | Weapon add-ons. |
| `shared/vehicles.js` | Rigger 2 vehicle customization. |
| `shared/hosts.js` | Items with options: cybereyes, cyberears, security armor. |
| `shared/cyberbody.js`, `shared/cyberbody_ui.js` | Cyberlimbs. |
| `shared/skins.js` | Color modes. |
| `shared/skillweb.js` | Skill Web (not wired into the pages yet). |
| `chk*.js`, `gear/chk*.js`, `v2/` | Regression tests. `runall.sh` runs them; `v2/` checks the live Gear Locker, including the older Locker checks run against it. |
| `books_tools/` | Scripts that turn the rulebook PDFs into per-page text with printed page numbers, and search them. They need the PDFs; no book text is stored here. |
| (Skill Web map) | Draft lives as a claude.ai artifact, waiting for review. |
