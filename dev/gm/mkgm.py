#!/usr/bin/env python3
"""Build gm-screen.html: the GM screen page, with Gear Locker items (from gear_data.json) and the catalog embedded. Run from the scratchpad folder."""
import json
d=json.load(open('gear_data.json'))
items=[{k:x[k] for k in ('id','cat','n','s','pg','w','m','a','range','skill') if k in x} for x in d['items'] if x['cat'] in ('guns','melee','ranged','boom','armor') or x['id'] in ('body:Hand Razors','body:Retractable Hand Razors')]
h=open('gm/gm.html').read()
h=h.replace('/*@css*/',open('gm/gm.css').read()).replace('/*@data*/','const GMITEMS='+json.dumps(items,ensure_ascii=False,separators=(',',':'))+';\n'+open('gm/gm_data.js').read()).replace('/*@js*/',open('gm/gm.js').read())
open('SR2_GM_Screen.html','w').write(h); print('SR2_GM_Screen.html',len(h),len(items),'items')
