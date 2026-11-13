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
3. Run `gear/mk.py` to build the Gear Locker page and both offline files.
4. Check that every injected block matches its source module.

## Files

| File | What it is |
|---|---|
| `sr2-builder.html` | The Runner Builder. It is the single source for all item data. |
| `gear/template.html` | The Gear Locker page; `gear/mk.py` fills it with the item data. |
| `shared/decks.js` | Rules code shared by both pages: deck limits and VR2 pricing. |
| `shared/guns.js` | Weapon add-ons. |
| `shared/vehicles.js` | Rigger 2 vehicle customization. |
| `shared/hosts.js` | Items with options: cybereyes, cyberears, security armor. |
| `shared/cyberbody.js`, `shared/cyberbody_ui.js` | Cyberlimbs. |
| `shared/skins.js` | Color modes. |
| `shared/skillweb.js` | Skill Web (not wired into the pages yet). |
| `chk*.js`, `gear/chk*.js` | Regression tests. `runall.sh` runs them. |
| `books_tools/` | Scripts that turn the rulebook PDFs into per-page text with printed page numbers, and search them. They need the PDFs; no book text is stored here. |
| `skill-web-map.html` | Draft Skill Web map, waiting for review. |
