#!/usr/bin/env python3
"""Make SR2_Runner_Builder_2.html (the redesigned Runner Builder) from SR2_Runner_Builder.html.
Adds three modes (Build / Game night / After the session), a pinned budget strip and checklist drawer.
The new code goes inside the Builder's own script (so it reads S and the rules helpers, and is kept in
'builder with character' exports) and its CSS inside the Builder's own style. Run from the scratchpad folder."""
import sys
s=open('SR2_Runner_Builder.html').read()
js=open('builder2/b2ui.js').read()+'\n'+open('builder2/b2steps.js').read(); css=open('builder2/b2ui.css').read()+'\n'+open('builder2/b2steps.css').read()  # Phase 4: the Build tab in steps
mjs=open('builder2/b2market.js').read()  # the Marketplace tab (2026-11-23), with the Gear Locker's Availability and Street Index table
if mjs.count('/*AVAIL*/{}')!=1: sys.exit('b2market.js: AVAIL placeholder not found once')
js+='\n'+mjs.replace('/*AVAIL*/{}',open('gear/avail_data.json').read().strip()); css+='\n'+open('builder2/b2market.css').read()
js+='\n'+open('builder2/b2item.js').read(); css+='\n'+open('builder2/b2item.css').read()  # one home for each item, stage 1: decks (2026-11-24)
end='\n})();\n</script>'
if s.count(end)!=1: sys.exit('builder script end not found once')
s=s.replace(end,'\n/*@b2*/\n'+js+'\n/*@end:b2*/'+end)
st='<style id="appCss">'
if s.count(st)!=1: sys.exit('appCss not found once')
i=s.index(st); j=s.index('</style>',i)
s=s[:j]+'\n/*@b2css*/\n'+css+'\n/*@end:b2css*/\n'+s[j:]
s=s.replace('<title>SR2 Runner Builder</title>','<title>SR2 Runner Builder</title>',1)
open('SR2_Runner_Builder_2.html','w').write(s)
print('SR2_Runner_Builder_2.html', len(s))
