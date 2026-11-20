#!/bin/bash
# every regression check for both tools
cd "$(dirname "$0")"
echo "== vehicle sweep"; node vbsweep.js
for c in 9 10 11 12 13 17 18 19 20 21 22; do echo "== locker chk$c"; timeout 200 node gear/chk$c.js 2>&1 | grep -v -i "proxy\|TUNNEL\|Allowed domains\|For details" | tail -2 | cut -c1-160; done
for c in 8 9 10 11 12 13 14 15 16 20 21; do echo "== builder chk$c"; timeout 200 node chk$c.js 2>&1 | grep -v -i "proxy\|TUNNEL\|Allowed domains\|For details" | tail -2 | cut -c1-160; done
echo "== builder chk_ny"; node chk_ny.js
echo "== builder chk_fg"; node chk_fg.js
echo "== builder chk_amt"; node chk_amt.js
echo "== locker chk23"; node gear/chk23.js
echo "== locker chk24"; node gear/chk24.js
echo "== locker chk25"; node gear/chk25.js
echo "== locker chk26"; node gear/chk26.js | cut -c1-200
echo "== locker chk27"; node gear/chk27.js | cut -c1-200
echo "== locker chk28"; node gear/chk28.js | cut -c1-200
echo "== locker chk29"; node gear/chk29.js | cut -c1-200
echo "== locker chk30 (all vehicles × all mods)"; node gear/chk30.js | cut -c1-200
echo "== builder chk_stash"; node chk_stash.js
echo "== builder chk_arch"; node chk_arch.js
echo "== chk_est"; node chk_est.js | cut -c1-200
echo "== chk_inj"; node chk_inj.js | cut -c1-200
echo "== locker 2: new layout"; node v2/chk_v2.js | cut -c1-200
echo "== locker 2: build-outs"; node v2/chk_v2b.js | cut -c1-200
echo "== locker 2: decks, options, cyber body"; node v2/chk_v2c.js | cut -c1-200
for c in 9 11 13 20 23 25 27 28; do echo "== locker 2 chk$c"; timeout 200 node v2/old/chk$c.js 2>&1 | grep -v -i "proxy\|TUNNEL\|Allowed domains\|For details" | tail -1 | cut -c1-160; done
echo "== builder 2: modes"; timeout 200 node builder2/chk_b2.js | tail -3
echo "== gm screen"; timeout 200 node gm/chk_gm.js | tail -3
