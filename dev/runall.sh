#!/bin/bash
# every regression check for both tools
cd "$(dirname "$0")"
for c in 9 10 11 12 13; do echo "== locker chk$c"; timeout 200 node gear/chk$c.js 2>&1 | grep -v -i "proxy\|TUNNEL\|Allowed domains\|For details" | tail -2 | cut -c1-160; done
for c in 8 9 10 11 12 13 14 15 16; do echo "== builder chk$c"; timeout 200 node chk$c.js 2>&1 | grep -v -i "proxy\|TUNNEL\|Allowed domains\|For details" | tail -2 | cut -c1-160; done
