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
4. Run `builder2/mkb2.py` to build the live Runner Builder (Build / Game night / After the session) from the classic one, and `gm/mkgm.py` to build the GM screen with the Gear Locker items embedded. `build.py` does all of this.
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
| `builder2/mkb2.py`, `builder2/b2ui.js`, `builder2/b2ui.css` | The live Runner Builder's three modes. The code goes inside the Builder's own script, so it reads the character and rules helpers directly and travels with 'builder with character' exports. Game night: big stats, one attack panel (weapon, firing mode, ammo, ranged and melee modifiers, pools, Roll20 copy), Got hit, skill checks, powers and spells. After the session: Karma, nuyen, damage and used-up gear, saved with a snapshot. It also stores a few numbers (`S._gm`) for the GM screen. The classic page is published as `builder-classic.html`. |
| `gm/` | The GM screen: `gm_data.js` (stat blocks with printed pages, suggested loadouts), `gm.js`, `gm.css`, `gm.html`, built by `mkgm.py` into `gm-screen.html`. |
| `chk*.js`, `gear/chk*.js`, `v2/` | Regression tests. `runall.sh` runs them; `v2/` checks the live Gear Locker, including the older Locker checks run against it. |
| `books_tools/` | Scripts that turn the rulebook PDFs into per-page text with printed page numbers, and search them. They need the PDFs; no book text is stored here. |
| (Skill Web map) | Draft lives as a claude.ai artifact, waiting for review. |

## Fixer (Gear Locker)
`gear/fixer.js` and `gear/fixer.css` add the Fixer panel: street price = Cost x Street Index, then Negotiation (5% per net success) and an optional house markup and order fee; Acquisition Test odds and delivery time from each item's Availability (core p. 184-185). `gear/avail_data.json` holds Availability and Street Index per item id, checked against the printed tables (kinds: ok, always, gm, none, note, pay; `lv` for per-level rows). `mk2.py` embeds it. The Runner Builder charges `street.total` from a gear code when one is sent. Checks: `gear/chk_fx.js`, `gear/chk_fxb.js`.

## Added after the crew test run
- **Builder, Karma:** the initiation picker takes an ordeal (GR p. 39-41), a magical group and a Centering Skill, and lists each initiation with its grade, ordeal and Karma. A "Racial maximums" box shows each attribute's racial max, the 1.5x cap the book suggests, and the next point's Karma cost (core p. 190). Karma past the racial max stays the GM's call.
- **Builder, Game night:** "Practice" snapshots the runner; ending practice puts the sheet back, or you can keep the changes. Damage the GM sends from the GM screen shows as a banner the player can apply or dismiss. After the session shows a healing guide from the Healing Table (core p. 112-113). It suggests times only and changes nothing.
- **GM screen:** imported runners get +1 P / +1 S buttons on the table and "Send to their Builder", which writes `sr2-gm-hits` in this browser's storage.
- **Gear Locker:** the Fixer panel can use the core Fixer contact (core p. 207) or a fixer from the linked runner's contacts; plain items take a quantity when added; a vehicle's "Goes with" tab lists the weapons that fit each of its mounts, with fixer prices and odds (R2 p. 131-135).

