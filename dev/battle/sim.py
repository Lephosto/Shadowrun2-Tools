"""Mock battle for the 13 archetype test runners (SR2 rules, core p. 80-115, 127-131, 151).
Every roll is a real die roll from a seeded generator; the log is the GM's record.
Simplifications (said in the report): one range band for the whole fight, cover as listed,
movement abstracted (melee from turn 2), Combat Pool split as described below."""
import random, json, sys
SEED=int(sys.argv[1]) if len(sys.argv)>1 else 2053
R=random.Random(SEED)
LOG=[]
def log(*a): LOG.append(' '.join(str(x) for x in a))
def d6(): return R.randint(1,6)
def roll(n,tn):
    """SR2 open-ended dice: a 6 rerolls and adds (Rule of Six); TN 2 minimum; 1s always fail."""
    tn=max(2,tn); out=[]
    for _ in range(max(0,n)):
        t=d6()
        if t==6:
            while True:
                x=d6(); t+=x
                if x!=6: break
        out.append(t)
    s=sum(1 for t in out if t>=tn and t!=1)
    return s,out
LV=['L','M','S','D']; BOX={'L':1,'M':3,'S':6,'D':10}
def stage(level,steps):
    i=LV.index(level)+steps
    if i<0: return None
    return LV[min(3,i)]

class A:
    def __init__(s,key,name,side,**k):
        s.key,s.name,s.side=key,name,side; s.__dict__.update(k)
        s.phys=0; s.stun=0; s.dead=False; s.kp=k.get('kp',1); s.ammo={}; s.notes=[]; s.deadly=False
        s.cover=k.get('cover',0)
    def wm(s):
        w=lambda b:0 if b<1 else 1 if b<3 else 2 if b<6 else 3
        return w(min(s.phys,10))+w(min(s.stun,10))
    def up(s): return not s.dead and s.phys<10 and s.stun<10
    def __repr__(s): return s.name

def take(t,level,stun=False,src=''):
    b=BOX[level]
    if stun:
        t.stun+=b
        if t.stun>10: over=t.stun-10; t.stun=10; t.phys+=over
    else: t.phys+=b
    if t.phys>=10: t.deadly=True
    if t.phys>10+t.body: t.dead=True
    return f"{t.name} takes {level}{' Stun' if stun else ''} → Physical {t.phys}/10{' (+%d overflow)'%(t.phys-10) if t.phys>10 else ''}, Stun {t.stun}/10{' — DEAD' if t.dead else ' — DOWN' if not t.up() else ''}"

def pool_take(a,n):
    n=max(0,min(n,a.pool_left)); a.pool_left-=n; return n

def resist(t,power,level,arm,atk_succ,stun=False,src='',use_pool=True,armor_half=False):
    """Damage Resistance Test: Body + Combat Pool vs Power − armor (core p. 87, 91, 110-111)."""
    if armor_half: arm=arm//2
    tn=max(2,power-arm)
    pd=pool_take(t,min(4,t.pool_left)) if use_pool else 0
    bs,_=roll(t.rbody,tn); ps,_=roll(pd,tn)
    succ=bs+ps
    # Karma Pool: reroll the failures once when this would put the runner past Deadly
    if t.side=='runner' and t.kp>0 and succ<atk_succ+2 and t.phys+BOX[stage(level,max(0,(atk_succ-succ)//2)) or 'L']>=10:
        fails=(t.rbody+pd)-succ; rs,_=roll(fails,tn); t.kp-=1; t.kpused=getattr(t,'kpused',0)+1; succ+=rs
        log(f"    {t.name} spends 1 Karma Pool to reroll {fails} failed dice: +{rs}")
    if ps>atk_succ and atk_succ>=0 and use_pool and pd:
        log(f"    clean miss: {t.name}'s {pd} pool dice got {ps} successes vs {atk_succ}"); return None
    net=atk_succ-succ
    lv=stage(level,net//2) if net>=0 else stage(level,-((-net)//2))
    log(f"    resist {t.name}: Body {t.rbody}+{pd} pool vs TN {tn} → {succ} (attacker {atk_succ}) → {lv or 'no damage'}")
    if lv: log('    '+take(t,lv,stun))
    return lv

def shoot(a,t,w,shots=1):
    rng=w.get('tn',4); mods=w.get('mods',0)+a.wm()+t.cover+(2 if getattr(a,'second',False) else 0)
    for i in range(shots):
        if not t.up(): break
        mode=w['mode']; pw,lvl=w['pw'],w['lv']; rec=0
        if mode=='BF': pw+=3; lvl=stage(lvl,1); rec=3*(i+1)
        elif mode=='FA': n=w.get('fa',6); pw+=n; lvl=stage(lvl,n//3); rec=n
        elif mode=='SA' and i==1: rec=1
        rec=max(0,rec-w.get('rc',0))
        tn=rng+mods+rec
        pd=pool_take(a,w.get('pool',max(0,a.pool_left//2)))
        s,_=roll(w['dice']+pd,tn)
        used=3 if mode=='BF' else w.get('fa',6) if mode=='FA' else 1
        a.ammo[w['n']]=a.ammo.get(w['n'],0)+used
        log(f"  {a.name} → {t.name} with {w['n']} ({mode}{' '+str(w.get('fa',6))+' rounds' if mode=='FA' else ''}): {w['dice']}+{pd} dice vs TN {tn} → {s} successes [{pw}{lvl}]")
        if s==0: log('    miss'); continue
        resist(t,pw,lvl,t.ball,s,armor_half=w.get('apds',False))

def melee(a,t,w):
    pd=pool_take(a,a.pool_left//2+1); dpd=pool_take(t,min(3,t.pool_left))
    tn_a=4+a.wm()+max(0,t.reach-w.get('reach',0)); tn_d=4+t.wm()+max(0,w.get('reach',0)-t.reach)
    s,_=roll(w['dice']+pd,tn_a); ds,_=roll(t.melee+dpd,tn_d)
    log(f"  {a.name} → {t.name} in melee ({w['n']}): {w['dice']}+{pd} vs TN {tn_a} → {s}; {t.name} defends {t.melee}+{dpd} vs TN {tn_d} → {ds}")
    net=s-ds
    if net<=0: log('    blocked'); return
    tn=max(2,w['pw']-t.imp); bs,_=roll(t.rbody,tn)
    lv=stage(w['lv'],(net-bs)//2) if net>=bs else stage(w['lv'],-((bs-net)//2))
    log(f"    resist {t.name}: Body {t.rbody} vs TN {tn} → {bs} (net {net}) → {lv or 'no damage'}")
    if lv: log('    '+take(t,lv,w.get('stun',False)))

def cast(a,t,sp,targets=None):
    """Combat spell (core p. 127-131): Sorcery + Magic Pool vs target's Willpower/Body; resisted by the same; drain after."""
    hit=targets or [t]; md=min(a.mp_left,sp.get('mp',a.mp_left)); a.mp_left-=md
    tn=max(2,(t.wil if sp['type']=='M' else t.body))+a.wm()
    s,_=roll(a.sorc+md,tn)
    log(f"  {a.name} casts {sp['n']} (Force {sp['f']}) at {', '.join(x.name for x in hit)}: Sorcery {a.sorc}+{md} vs TN {tn} → {s}")
    for x in hit:
        if not x.up(): continue
        rs,_=roll(x.wil if sp['type']=='M' else x.body, sp['f'])
        net=s-rs; lv=stage(sp['lv'],net//2) if net>=0 else stage(sp['lv'],-((-net)//2))
        if s==0: lv=None
        log(f"    {x.name} resists with {x.wil if sp['type']=='M' else x.body} dice vs TN {sp['f']} → {rs} → {lv or 'no effect'}")
        if lv: log('    '+take(x,lv,sp.get('stun',False)))
    # drain: Willpower (+ leftover Magic Pool) vs Force ÷ 2 + modifier; Physical if Force > Magic (core p. 131)
    dtn=sp['f']//2+sp.get('dmod',0); dp=min(a.mp_left,3); a.mp_left-=dp
    ds,_=roll(a.wil+dp,dtn); dl=stage(sp['dl'],-(ds//2))
    phys=sp['f']>a.magic
    log(f"    drain: Willpower {a.wil}+{dp} vs TN {max(2,dtn)} → {ds} → {dl or 'none'}{' (Physical: Force over Magic)' if phys and dl else ''}")
    if dl: log('    '+take(a,dl,not phys))

# ---------------- the runners (numbers from their Builder sheets after phase 2) ----------------
PRED={'n':'Ares Predator II','mode':'SA','pw':9,'lv':'M','tn':5}          # 15 m: medium range for a heavy pistol, TN 5
def P(dice,smart=False): w=dict(PRED); w['dice']=dice; w['mods']=-2 if smart else 0; return w
RUN=[
 A('sam1','Razor','runner',react=9,idice=3,pool=7,body=7,rbody=7,wil=3,ball=8,imp=7,reach=0,melee=4,
   weap=P(8,True), front=True),
 A('sam2','Tusk','runner',react=8,idice=2,pool=8,body=11,rbody=12,wil=3,ball=8,imp=6,reach=0,melee=4,
   weap={'n':'Ingram Smartgun','mode':'BF','pw':7,'lv':'M','tn':5,'dice':7,'mods':-2,'rc':2,'apds':True},front=True),
 A('adept1','Ghost','runner',react=5,idice=3,pool=9,body=6,rbody=6,wil=6,ball=6,imp=4,reach=0,melee=6,magic=6,
   weap=P(4),mw={'n':'Killing Hands','dice':6,'pw':5,'lv':'M','reach':0},front=True,closes=1),
 A('adept2','Rook','runner',react=3,idice=2,pool=3,body=11,rbody=12,wil=5,ball=8,imp=6,reach=1,melee=7,magic=7,
   weap=P(4),mw={'n':'Killing Hands','dice':7,'pw':10,'lv':'S','reach':1},front=True,closes=2),
 A('face1','Silk','runner',react=5,idice=1,pool=8,body=3,rbody=3,wil=5,ball=4,imp=2,reach=0,melee=2,weap=P(4)),
 A('deck1','Glitch','runner',react=5,idice=1,pool=7,body=2,rbody=2,wil=5,ball=5,imp=3,reach=0,melee=1,weap=P(3),cover=4),
 A('deck2','Byte','runner',react=5,idice=1,pool=7,body=2,rbody=2,wil=4,ball=5,imp=3,reach=0,melee=1,weap=P(3),cover=4),
 A('rig1','Gearjammer','runner',react=5,idice=1,pool=7,body=3,rbody=3,wil=3,ball=5,imp=3,reach=0,melee=1,weap=P(3),cover=4),
 A('rig2','Wrench','runner',react=5,idice=1,pool=7,body=5,rbody=5,wil=4,ball=5,imp=3,reach=0,melee=2,weap=P(3),cover=4),
 A('mage1','Sigil','runner',react=3,idice=1,pool=6,body=3,rbody=3,wil=5,ball=5,imp=3,reach=0,melee=1,magic=7,sorc=6,mpool=9,
   spells=[{'n':'Powerball','f':4,'type':'P','lv':'M','dl':'S','dmod':1,'area':3},{'n':'Mana Bolt','f':5,'type':'M','lv':'S','dl':'S'}]),
 A('mage2','Wisp','runner',react=4,idice=1,pool=7,body=2,rbody=2,wil=6,ball=4,imp=2,reach=0,melee=1,magic=7,sorc=6,mpool=6,kp=2,
   spells=[{'n':'Mana Bolt','f':3,'type':'M','lv':'S','dl':'S'}]),
 A('shaman1','Patch','runner',react=4,idice=1,pool=6,body=4,rbody=4,wil=4,ball=5,imp=3,reach=0,melee=1,magic=7,sorc=6,mpool=7,
   spells=[{'n':'Stun Bolt','f':4,'type':'M','lv':'D','dl':'D','stun':True}]),
 A('shaman2','Ursa','runner',react=3,idice=1,pool=3,body=8,rbody=8,wil=3,ball=6,imp=4,reach=0,melee=3,magic=7,sorc=6,mpool=6,
   spells=[{'n':'Mana Bolt','f':3,'type':'M','lv':'S','dl':'S'}]),
]
# ---------------- the opposition: a corporate response team, Professional NPCs (core p. 187) ----------------
HAR={'n':'FN HAR','mode':'BF','pw':8,'lv':'M','tn':4,'dice':5,'mods':-2,'rc':2}   # assault rifle at 15 m: short, TN 4
def T(i): return A(f'T{i}',f'Trooper {i}','opp',react=6,idice=2,pool=6,body=5,rbody=5,wil=4,ball=6,imp=4,reach=0,melee=4,weap=dict(HAR),cover=4)
OPP=[T(i) for i in range(1,5)]+[
 A('LT','Lieutenant Okafor','opp',react=7,idice=3,pool=7,body=6,rbody=6,wil=5,ball=6,imp=4,reach=0,melee=5,weap=dict(HAR,dice=6),cover=4),
 A('HV','Grist (troll heavy)','opp',react=4,idice=2,pool=5,body=10,rbody=11,wil=4,ball=8,imp=6,reach=1,melee=5,
   weap={'n':'Ingram Valiant LMG','mode':'FA','fa':6,'pw':7,'lv':'S','tn':4,'dice':6,'rc':6},cover=4),
 A('MG','Ms. Ilse Varga (combat mage)','opp',react=5,idice=1,pool=4,body=4,rbody=4,wil=6,ball=3,imp=1,reach=0,melee=2,magic=6,sorc=6,mpool=6,
   spells=[{'n':'Mana Bolt','f':6,'type':'M','lv':'S','dl':'S'}],cover=4),
]
ALL=RUN+OPP
def foes(a): return [x for x in ALL if x.side!=a.side and x.up()]

def act(a,turn,phase):
    F=foes(a)
    if not F: return
    if a.side=='opp':
        # NPCs shoot whoever is standing in the open first, then anyone
        open_=[x for x in F if x.cover==0] or F
        t=R.choice(open_)
        if a.key=='MG': cast(a,t,a.spells[0]); return
        shoot(a,t,a.weap,shots=1 if a.weap['mode']=='FA' else 2 if a.key!='HV' else 1); return
    # runners
    if getattr(a,'spells',None):
        sp=a.spells[0]
        if sp.get('area'):
            grp=R.sample(F,min(sp['area'],len(F))); cast(a,grp[0],sp,grp)
        else:
            t=next((x for x in F if x.key=='MG'),None) or next((x for x in F if x.key=='HV'),None) or R.choice(F); cast(a,t,sp)
        return
    if getattr(a,'mw',None) and turn>=a.closes:
        t=next((x for x in F if x.key=='HV'),None) if a.key=='adept2' else None
        t=t or R.choice(F); melee(a,t,a.mw); return
    if getattr(a,'mw',None):
        log(f"  {a.name} sprints across the dock toward the containers"); return
    t=next((x for x in F if x.key in('MG','HV')),None) if a.key in ('sam1','sam2') else None
    t=t or R.choice(F); shoot(a,t,a.weap,shots=2)

for turn in range(1,5):
    for x in ALL:
        x.pool_left=x.pool; x.mp_left=getattr(x,'mpool',0)
        x.init=x.react-x.wm()+sum(d6() for _ in range(x.idice))
    if turn==1:
        for x in OPP: x.cover=0
        log('The response team comes in across the open yard from their APC (no cover). The runners are spread along the loading dock.')
    if turn==2:
        for x in OPP:
            if x.up(): x.cover=4
        log('The surviving security troops reach the APC and the containers (partial cover, +4).')
    if turn>=2:
        for x in RUN:
            if x.key in('adept1','adept2') and turn>=x.closes: x.cover=0
    log(f'\n=== Combat Turn {turn} ===')
    log('Initiative: '+', '.join(f'{x.name} {x.init}' for x in sorted(ALL,key=lambda z:-z.init) if x.up()))
    top=max(x.init for x in ALL)
    ph=top
    while ph>0:
        for x in sorted(ALL,key=lambda z:-z.init):
            if x.up() and x.init>=ph and (x.init-ph)%10==0 and ph==x.init-10*((x.init-ph)//10):
                if x.init-ph in (0,10,20,30):
                    log(f'[{turn}/{ph}] {x.name}'); act(x,turn,ph)
        ph-=1
    alive_o=[x for x in OPP if x.up()]; alive_r=[x for x in RUN if x.up()]
    if not alive_o or not alive_r: break
    # NPC morale (core p. 187): Professionals stay; the GM pulls the survivors out when half the team is down
    if len(alive_o)<=2 and not any(x.key in('LT','HV','MG') for x in alive_o):
        log(f'Only {", ".join(x.name for x in alive_o)} left standing, no officer, no heavy, no mage: they throw smoke and fall back to the APC.')
        break

out={'seed':SEED,'log':LOG,'runners':{x.key:{'name':x.name,'phys':x.phys,'stun':x.stun,'dead':x.dead,'deadly':x.deadly,'kp':getattr(x,'kpused',0),'ammo':x.ammo,'body':x.body} for x in RUN},
     'opp':{x.key:{'name':x.name,'phys':x.phys,'stun':x.stun,'dead':x.dead} for x in OPP}}
json.dump(out,open(f'battle/result_{SEED}.json','w'),indent=1)
print('\n'.join(LOG[-3:]))
for x in RUN: print(f"{x.name:11} P{x.phys:>2} S{x.stun:>2} {'DEAD' if x.dead else 'deadly' if x.deadly else ''} ammo {x.ammo}")
print('opp:',', '.join(f"{x.name.split(' (')[0]} P{x.phys} S{x.stun}{' dead' if x.dead else ''}" for x in OPP))
