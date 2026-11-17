"""The first hour after the fight: stabilizing the dying, DocWagon, permanent damage, Magic loss (core p. 111-115, 249-250).
Dice are real and seeded; this continues from battle/result_<seed>.json."""
import json, random, sys
SEED=int(sys.argv[1]) if len(sys.argv)>1 else 8
B=json.load(open(f'battle/result_{SEED}.json')); RU=B['runners']
R=random.Random(SEED*1000+1); L=[]
def log(*a): L.append(' '.join(str(x) for x in a))
def d6(): return R.randint(1,6)
def roll(n,tn):
    tn=max(2,tn); s=0
    for _ in range(n):
        t=d6()
        if t==6:
            while True:
                x=d6(); t+=x
                if x!=6: break
        if t>=tn and t!=1: s+=1
    return s
AWAKE={'adept1':6,'adept2':7,'mage1':7,'mage2':7,'shaman1':7,'shaman2':7}
DERMAL={'sam1':0,'sam2':1,'adept2':0}
DOC={'sam1':'Gold','sam2':'Platinum','adept1':'Gold','adept2':'Platinum','deck1':'Gold','deck2':'Gold','rig1':'Gold','rig2':'Gold','mage1':'Gold','mage2':'Gold','shaman1':'Gold','face1':'Platinum'}
res={k:{'name':v['name'],'phys':v['phys'],'stun':v['stun'],'dead':v['dead'],'deadly':v['deadly'],'body':v['body'],'patched':False,'stable':not v['deadly'] or v['dead'],
        'perm':None,'magicLost':0,'days':0,'bill':0,'doc':DOC.get(k),'notes':[]} for k,v in B['runners'].items()}
for k,v in res.items():
    if v['dead']: log(f"{v['name']} is dead: Physical {v['phys']} is more than 10 + Body {v['body']} (core p. 111). Nothing brings that back.")
dying=[k for k,v in res.items() if v['deadly'] and not v['dead']]
log('Dying (Physical past 10, not yet past 10 + Body): '+', '.join(f"{res[k]['name']} ({res[k]['phys']-10} of {res[k]['body']} overflow)" if res[k]['phys']>10 else res[k]['name']+' (exactly Deadly)' for k in dying))
# Razor carries the trauma patches (6) and the medkit; Tusk is barely scratched and helps carry
patches=6
log('\nMinute 1-2: Razor (Serious, +3 TN on everything) and Tusk get to the downed. Razor slaps trauma patches on everyone dying (core p. 115).')
for k in sorted(dying,key=lambda k:-(res[k]['phys']-10)/max(1,res[k]['body'])):
    v=res[k]
    if patches<=0: break
    patches-=1; v['patched']=True
    tn=4+DERMAL.get(k,0); s=roll(v['body'],tn)
    log(f"  {v['name']}: trauma patch, natural Body {v['body']} vs TN {tn} → {s} success{'es' if s!=1 else ''} → {'STABLE' if s else 'not stable'}")
    if s: v['stable']=True
v=None
log(f'  Trauma patches left with Razor: {patches} of 6.')
# DocWagon: every contract holder's band goes off when the wearer goes down; Gold teams aren't guaranteed under 10 minutes
calls=[k for k in dying if res[k]['doc']]
nodoc=[k for k in dying if not res[k]['doc']]
minutes=0
for k in calls:
    v=res[k]; eta=(2+d6()+d6())*(1 if v['doc']=='Platinum' else 2)  # GM ruling: Platinum guarantees under 10 min (core p. 249); Gold 2D6+2 × 2 minutes
    v['eta']=eta
    log(f"\n{v['name']}'s DocWagon {v['doc']} band fires. Trauma team ETA {eta} minutes.")
    if not v['stable']:
        ticks=eta//10
        for t in range(ticks):
            v['phys']+=1; log(f"  10 minutes unattended: +1 box → {v['phys']} (death past {10+v['body']})")
            if v['phys']>10+v['body']: v['dead']=True; log(f"  {v['name']} dies before the team lands."); break
    if not v['dead']:
        v['stable']=True; log(f"  The team stabilizes {v['name']} on site and flies them out. Resuscitation not needed.")
for k in nodoc:
    v=res[k]
    log(f"\n{v['name']} has no DocWagon contract.")
    if not v['stable']:
        # Patch does first aid with Razor's medkit: Deadly TN 10, +2 magician patient, Body mod, wound mods for Patch (Stun 9: +3)
        bm=-1 if 4<=v['body']<=6 else -2 if 7<=v['body']<=9 else -3 if v['body']>=10 else 0
        tn=10+(2 if k in AWAKE else 0)+bm+3
        s=roll(4+3,tn)
        log(f"  Patch tries first aid with the medkit: First Aid 4 + medkit... vs TN {tn} → {s}")
        if s: v['stable']=True
    if v['stable']: log(f"  {v['name']} goes to a street doc in the ork underground instead (Ursa's own people).")
# permanent damage and Magic loss for everyone who reached Deadly and lived (core p. 113-115)
log('\nDeadly wounds and permanent damage (core p. 113-114): Body Test vs TN 4, +2 if a trauma patch was used.')
ATTR=['Body','Strength','Quickness','Intelligence','Willpower','Reaction']
PART=['right arm','left arm','right leg','left leg','an ear','an eye']
for k,v in res.items():
    if v['dead'] or not v['deadly']: continue
    tn=4+(2 if v['patched'] else 0); s=roll(v['body']+DERMAL.get(k,0),tn)
    if s==0:
        a=ATTR[d6()-1]; v['perm']=('attr',a); log(f"  {v['name']}: Body {v['body']} vs TN {tn} → 0. Organ damage: loses 1 point of {a} for good, and their racial maximum for it drops by 1. Healing time doubled.")
    elif s==1:
        p=PART[d6()-1]
        if p in('an ear','an eye'): p=p.replace('an ',('right ' if d6()<=3 else 'left '))
        v['perm']=('part',p); log(f"  {v['name']}: Body vs TN {tn} → 1. Mangled {p}: needs a replacement (cyber or grown). Healing time +50%.")
    else: log(f"  {v['name']}: Body vs TN {tn} → {s}. No lasting damage.")
    if k in AWAKE:
        m=AWAKE[k]; r=d6()+d6()
        if r<=m: v['magicLost']=1
        log(f"  {v['name']} is Awakened (Magic {m}): Magic loss check 2D6 = {r} {'≤' if r<=m else '>'} {m} → {'loses 1 Magic for good' if r<=m else 'keeps their Magic'} (core p. 115; DocWagon observes the +2 for magicians, so one check).")
# healing time and bills (Healing Table and Medical Costs, core p. 113)
log('\nHealing (core p. 113): Body Test vs the Healing Table TN; base time ÷ successes, never under the minimum.')
HT={'D':(30,3,10),'S':(20,2,8),'M':(10,1,6),'L':(1,0.1,4)}
def lvl(p): return 'D' if p>=10 else 'S' if p>=6 else 'M' if p>=3 else 'L' if p>=1 else None
for k,v in res.items():
    if v['dead']: continue
    days=0; bill=0; p=v['phys']; cur=lvl(p)
    while cur:
        base,mn,tn=HT[cur]; s=roll(v['body'],tn-(0))
        t=base/(s or 1) if s else base*2
        if v['perm'] and cur=='D': t*=2 if v['perm'][0]=='attr' else 1.5
        t=max(mn,t); days+=t
        rate=1000 if cur=='D' else 500
        if cur in('D','S'): bill+=rate*t
        cur={'D':'S','S':'M','M':'L','L':None}[cur]
    if v['doc']=='Gold': bill*=0.9
    if v['doc']=='Platinum': bill*=0.5
    if v['deadly']: bill+=400   # paramedic first aid for a Deadly wound
    v['days']=round(days,1); v['bill']=int(round(bill,-2))
    if p: log(f"  {v['name']}: Physical {p} → about {v['days']} days to heal fully; hospital and doctor {v['bill']:,}¥{' after the DocWagon '+v['doc']+' discount' if v['doc'] and v['bill'] else ''}.")
json.dump({'log':L,'res':res,'patchesLeft':patches},open(f'battle/after_{SEED}.json','w'),indent=1)
print('\n'.join(L))
