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

## Added after crew test run 2 (2026-11-20)
- **GM screen:** Initiative dice no longer explode. Each group line has its own key (`m.k`), so new copies start with clean monitors. Attacks with no successes miss. Resist has a Physical/Stun choice and separate Physical (Body) and Mana (Willpower) spell kinds, with Magic Pool spell defense for magicians. Guns have firing modes (recoil, burst and full-auto damage). Humanoid critters attack with Reaction. The stat block form has a "Drone or vehicle" kind.
- **Builder, Game night:**
  - Karma Pool rerolls are rolled by hand: the tool charges 1, 2, 3 and takes the extra successes (core p. 191).
  - Got hit: misses on 0 successes, spell resistance by core p. 131, Stun choice, spell defense, IC on persona (persona monitor `S.mxDmg`), and black IC. Stun past 10 carries into Physical.
  - Steps for bleeding out, an "Other spells" group with Drain, a Conjure roll with the Conjuring Drain Table, and spirit services spent on attack.
  - Sustaining is limited to Sustained spells, with a target name.
  - Matrix utilities roll against the node (core p. 174). "Load it" never unloads other programs.
  - Drones can target people. A Vehicle tests panel covers the Position and Crash Tests (core p. 106-107).
  - Skill checks add a defaulting roll (Skill Web) and an "Ask a contact" roll.
- **Builder, Build:**
  - Asceticism asks for the attribute given up (`asc` on the initiation entry; `ascLoss` lowers the rating and racial max, and raises cost one more).
  - Stowed guns count as mounted. A deck with no persona chips is flagged.
  - Starting cash rolled after Established goes into nuyen on hand. Builder gear purchases can be paid from nuyen.
  - The transfer bar follows the open runner and warns before overspending.
  - Blank sheets stay out of the roster. "Resources left" is hidden once Established.
- **Gear Locker:** the Fixer contact list follows the linked runner; the send dialog has "Clear the shopping list"; guns with build-outs get "Add as it comes".


## Added 2026-11-21
- **Owned vehicles (Gear Locker → Builder):** the vehicle workshop's "Working on" menu (`data-vown`) loads a vehicle the linked runner owns; `B.own` keeps the gear index and the mods it already had. The list line carries `up:{cid,gi,who}` and `pc` = only the new work (no Street Index in the Fixer). The Builder's `gearImport` puts the build-out on that line instead of adding a vehicle and charges what the line's cost went up by.
- **Magical groups (Builder, Initiation, GR p. 54–58):** `S.mg` (`mgState`) tracks role (joining or founding), members, astral contact, strictures (`STRICT`), broken strictures and the contact test log. Joining (`kind:'mgjoin'`, 3 Karma) and extra contact dice (`kind:'mgdie'`, 3 Karma) go in the Karma log. Group initiation needs `S.mg.contact`; sheets that already have a group initiation start with it set.
- **Contacts (Builder, Game night):** `CTBOOK` holds the 22 core contacts' Charisma, Intelligence and Etiquette (core p. 203–213). A contact can match one (`c.cb`, guessed from the role) or take typed numbers (`c.ce`, `c.cc`, `c.ci`). "They check around" rolls the contact's Etiquette at TN +2 (Charisma +4 with none); your own roll shows the baseline fee (core p. 202).
- **Slotted chips (Builder, Game night, core p. 248, 82):** a "Slotted chips" panel lists every ActiveSoft, KnowSoft and LinguaSoft line. Each line carries `g.sk` (the skill; defaults to the gear note), `g.mem` (runs from headware memory) and `g.slot`. `chipBlock` refuses a chip that would break the rules: ActiveSofts need skillwires (Skillwires or Skillwire Plus) and their total can't pass the rating; chips in jacks can't outnumber chipjacks (skillwires include one); memory chips need the Mp free, and KnowSofts there need a datasoft link; no Sorcery or Conjuring ActiveSofts. While slotted, `skillDiceNow`, `skillPartsNow`, `partsNamed` and `bestNow` use the chip's rating instead of the runner's own (Improved Ability set aside), and ActiveSoft skills get no Combat, Hacking or Control Pool (`chipNoPool`).
- **Skillsoft pickers (both tools):** `shared/softs.js` now holds `SKILLDB` (skills with concentrations and specializations, core p. 70–77; moved out of sr2-builder.html) and the chip helpers `softSpec`, `softOf`, `softPickHTML`, `softSet`, `softLabel` and `softText`. ActiveSofts pick from Active Skills (no Magical or Knowledge), KnowSofts from Knowledge Skills or "Other (type it)", LinguaSofts take a language. Concentration and specialization chips add their own dropdowns. Chip lines store `sk`, `cc` and `cs`; older lines fall back to the gear note. Pickers appear on the Builder's Skillsofts card, in Game night's Slotted chips panel, and in the Gear Locker's add panel (it won't add a chip until the skill is picked). Sends carry `sf:{sk,cc,cs}`.
- **Chips and the Skill Web:** `chipHaveMap` (exposed on `window` from the Game night code) feeds `swHave`, so a slotted general-skill ActiveSoft counts as having that skill at the chip's rating, in Game night's defaulting roll and in the Build tab's Defaulting box. Concentration and specialization chips don't count, because the Skill Web uses general ratings only (core p. 68).
- **Matrix Initiative modes (core p. 178):** `mxIniModes(mx)` returns full cybernetic (+1 die), cybernetic with keyboard help, keyboard only (half Reaction, no response-increase Reaction bonus, keeps the dice) and tortoise on a terminal (half Reaction, minimum 1, 1D6). VR2 decks keep their own boosts. Shown in the Build tab's deck stats, on the sheet, as Game night tiles, and as a "Where" menu on Game night's Initiative roller.
- **Skillsoft picks in the Builder's Gear section:** the Add form shows the chip dropdowns under a skillsoft (`GSOFT`, picker key `add`) and won't add it until the pick is complete. Each skillsoft row in the gear list has the same dropdowns, so a chip's skill, concentration or specialization can be changed there, on the Skillsofts card, or in Game night. All of them write `sk`, `cc` and `cs` on the line.
