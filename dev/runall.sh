#!/bin/bash
# every regression check for both tools
cd "$(dirname "$0")"
echo "== vehicle sweep"; node vbsweep.js
for c in 9 10 11 12 13 17 18 19 20 21 22; do echo "== locker chk$c"; timeout 200 node gear/chk$c.js 2>&1 | grep -v -i "proxy\|TUNNEL\|Allowed domains\|For details" | tail -2 | cut -c1-160; done
for c in 8 9 10 11 12 13 14 15 16 20 21; do echo "== builder chk$c"; timeout 200 node chk$c.js 2>&1 | grep -v -i "proxy\|TUNNEL\|Allowed domains\|For details" | tail -2 | cut -c1-160; done
echo "== builder chk_ny"; node chk_ny.js
echo "== builder chk_fg"; node chk_fg.js
echo "== builder chk_amt"; node chk_amt.js
