#!/bin/bash
# run phase 2 for every character, four at a time
cd "$(dirname "$0")/.."
keys="sam1 sam2 deck1 deck2 rig1 rig2 adept1 adept2 mage1 mage2 shaman1 shaman2 face1"
echo $keys | tr ' ' '\n' | xargs -P 4 -I{} sh -c 'node arch/run2.js {} > arch/out2/{}.txt 2>&1'
cat $(for k in $keys; do echo arch/out2/$k.txt; done) > arch/out2/run.txt
