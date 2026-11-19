cd "$(dirname "$0")/.."
for c in 9 11 13 17 18 19 20 21 22 23 24 25 26 27 28 29 30; do r=$(timeout 150 node v2/old/chk$c.js 2>&1 | grep -v -i "proxy\|TUNNEL\|Allowed domains\|For details\|connect_rejected\|plan,\|Free plan" | grep -E "ok|Error|errs|\"|fail" | tail -2 | cut -c1-260); echo "chk$c: $r"; done
