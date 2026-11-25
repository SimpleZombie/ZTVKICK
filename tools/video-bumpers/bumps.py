"""ZTV video bumpers, drawn as pixel art. Each bumper is frame(t) -> 320x180 canvas, plus a duration."""
import numpy as np, math, random
from px import *

GREEN=(183,227,106);CREAM=(243,234,208);OLIVE=(158,174,131)

# ---------- 1. NIGHT DRIVE: a highway at night, a green sign rolls up: ZTV NEXT EXIT ----------
def night_drive(t):
    a=canvas();vgrad(a,0,100,(8,10,26),(44,34,78));stars(a,46,3,88,t)
    rect(a,250,18,10,10,(236,226,190));rect(a,252,16,6,1,(236,226,190));rect(a,248,20,1,6,(236,226,190));rect(a,261,20,1,6,(236,226,190))
    # far hills
    for x in range(W):
        h=8+5*math.sin(x*.035)+3*math.sin(x*.11+1);rect(a,x,100-h,1,h,(18,22,34))
    vgrad(a,100,H,(14,20,16),(6,9,7))
    # road
    for y in range(100,H):
        k=(y-100)/80;half=4+150*k;rect(a,160-half,y,2*half,1,(30,30,34))
        rect(a,160-half,y,max(1,3*k),1,(150,150,140));rect(a,160+half-max(1,3*k),y,max(1,3*k),1,(150,150,140))
    # moving center dashes
    sp=.9
    for i in range(10):
        z=((i/10)+t*sp)%1.0;y0=100+80*z**2;y1=100+80*min(1,(z+.045))**2
        w=max(1,5*z);rect(a,160-w/2,y0,w,max(1,y1-y0),(230,210,120))
    # light poles passing on the right
    for i in range(4):
        z=((i/4)+t*.42)%1.0;y=100+80*z**2;x=160+150*z**2+12*z;h=3+70*z**2
        rect(a,x,y-h,max(1,2*z),h,(70,72,80));rect(a,x-4*z,y-h,8*z+1,max(1,2*z),(70,72,80))
        rect(a,x-6*z,y-h+2*z,10*z+1,max(1,3*z),(255,224,150),.9)
    # the sign comes up from the distance and stops
    p=min(1,max(0,(t-1.4)/2.6));p=1-(1-p)**3
    if t>1.4:
        sw=16+72*p;sh=sw*.52;sx=214+14*p-sw/2;sy=94-sh-4-22*p
        rect(a,sx+sw*.2,sy+sh,max(1,2+3*p),96-(sy+sh)+4,(60,62,70));rect(a,sx+sw*.78,sy+sh,max(1,2+3*p),96-(sy+sh)+4,(60,62,70))
        rect(a,sx,sy,sw,sh,(22,104,58));rect(a,sx+1,sy+1,sw-2,1,(220,230,220));rect(a,sx+1,sy+sh-2,sw-2,1,(220,230,220))
        rect(a,sx+1,sy+1,1,sh-2,(220,230,220));rect(a,sx+sw-2,sy+1,1,sh-2,(220,230,220))
        if p>.55:
            big=3 if p>.9 else 2
            text(a,"ZTV",int(sx+sw/2-text_w("ZTV",big)/2),int(sy+sh*.14),(240,240,230),big)
            text(a,"NEXT EXIT",int(sx+sw/2-text_w("NEXT EXIT",1)/2),int(sy+sh*.72),(240,240,230),1)
    if t>5.2:
        al=min(1,(t-5.2)/.4);rect(a,0,150,W,24,(0,0,0),.6*al);text(a,"STAY TUNED","c",155,CREAM,2,alpha=al,shadow=(0,0,0))
    return a
DUR_night_drive=8.0

# ---------- 2. SIGNAL: static clears into color bars, the antenna finds us ----------
BARS=[(192,192,192),(192,192,0),(0,192,192),(0,192,0),(192,0,192),(192,0,0),(0,0,192)]
_rng=np.random.default_rng(5)
def signal(t):
    a=canvas()
    bw=W/7
    for i,c in enumerate(BARS):rect(a,i*bw,0,bw+1,120,c)
    for i,c in enumerate([(0,0,192),(19,19,19),(192,0,192),(19,19,19),(0,192,192),(19,19,19),(192,192,192)]):rect(a,i*bw,120,bw+1,14,c)
    rect(a,0,134,W,46,(19,19,19));rect(a,0,134,46,46,(0,33,76));rect(a,46,134,46,46,(255,255,255));rect(a,92,134,46,46,(50,0,106))
    clear=min(1,max(0,(t-1.6)/1.6))
    if clear<1:
        n=_rng.random((H,W,1)).astype(np.float32)*255
        roll=int((t*90)%H);n[roll:roll+10]*=1.4
        a[:]=a*clear+n*(1-clear)
    # antenna + signal meter (top left), bars fill as it locks
    ang=math.sin(t*5)*.35*(1-clear)
    bx,by=16,40
    rect(a,bx-2,by-2,62,22,(10,10,10),.75)
    rect(a,bx,by,22,16,(70,62,52));rect(a,bx+2,by+2,14,11,(170,190,200) if clear>.9 else (120,120,120));rect(a,bx+18,by+4,2,2,(20,20,20))
    for sgn in (-1,1):
        th=sgn*.5+ang
        for k in range(14):rect(a,bx+9+math.sin(th)*k,by-math.cos(th)*k,1,1,(230,230,220))
    lv=int(1+clear*4.99)
    for i in range(5):rect(a,bx+26+i*5,by+15-(i+1)*3,3,(i+1)*3,GREEN if i<lv else (60,60,60))
    if t>3.4:
        al=min(1,(t-3.4)/.3)
        rect(a,58,62,204,56,(10,10,10),al*.92);rect(a,58,62,204,2,GREEN,al)
        text(a,"SIGNAL ACQUIRED","c",72,GREEN,2,alpha=al)
        text(a,"YOU ARE WATCHING ZTV","c",98,CREAM,1,alpha=al)
    return a
DUR_signal=6.5

# ---------- 3. RIGHT BACK: a VHS tape rewinding ----------
def right_back(t):
    a=canvas((22,44,168))
    rw=1.6<t<6.0
    if rw:
        # rewinding: picture jitters, tracking bands roll fast
        for y in range(0,H,2):
            off=int(3*math.sin(y*.3+t*40))
            if off:a[y]=np.roll(a[y],off,0)
    band=int((t*(260 if rw else 70))%(H+30))-20
    for y in range(band,band+(16 if rw else 9)):
        if 0<=y<H:a[y]=a[y]*.55+_rng.random((W,1)).astype(np.float32)*200*.45
    osd="PLAY >" if t<1.6 or t>=6.0 else "<< REW"
    text(a,osd,14,12,(255,255,255),2,shadow=(0,0,40))
    secs=max(0,2591-int(max(0,t-1.6)*580)) if t<6.0 else 0
    h,m,s=secs//3600,(secs//60)%60,secs%60
    text(a,"%d:%02d:%02d"%(h,m,s),214,12,(255,255,255),2,shadow=(0,0,40))
    text(a,"SP",288,160,(255,255,255),1)
    if t>.7:
        al=min(1,(t-.7)/.3)
        text(a,"WE'LL BE","c",66,(255,255,255),3,alpha=al,shadow=(0,0,40))
        text(a,"RIGHT BACK","c",96,(255,255,255),3,alpha=al,shadow=(0,0,40))
    if t>6.0:a[:]=a*max(0,1-(t-6.0)/.8)
    return a
DUR_right_back=7.0

# ---------- 4. LATE ROOM: a dark room lit only by the TV ----------
def late_room(t):
    a=canvas()
    flick=.75+.25*math.sin(t*7.3)*math.sin(t*2.1+1)+(.15 if int(t*10)%17==0 else 0)
    vgrad(a,0,118,(14,16,30),(20,22,40));vgrad(a,118,H,(18,16,22),(10,9,14))
    # window with moon + blinds
    rect(a,30,26,56,50,(26,32,64));rect(a,64,34,9,9,(220,214,180))
    for y in range(28,76,5):rect(a,30,y,56,1,(12,14,26))
    rect(a,28,24,60,2,(40,40,52));rect(a,28,76,60,2,(40,40,52))
    # TV glow on the wall and floor
    for r in range(70,0,-6):
        al=.035*flick;rect(a,226-r,64-r*.6,2*r,r*1.2+40,(90,150,200),al)
    rect(a,200,92,56,40,(36,30,26));rect(a,204,132,48,8,(30,25,22))        # stand
    rect(a,198,52,60,44,(46,42,38));rect(a,202,56,44,34,(30,34,30))        # tv body
    sc=(110*flick,170*flick,220*flick);rect(a,204,58,40,30,sc)
    for y in range(58,88,2):rect(a,204,y,40,1,(0,0,0),.25)
    rect(a,249,62,5,5,(20,20,20));rect(a,249,72,5,5,(20,20,20))
    rect(a,214,48,1,5,(150,150,150));rect(a,230,46,1,7,(150,150,150))
    # couch, from behind
    rect(a,40,124,140,40,(32,24,34));rect(a,34,116,16,48,(38,28,40));rect(a,170,116,16,48,(38,28,40))
    rect(a,50,118,120,10,(42,32,44),1)
    for x in range(50,170):rect(a,x,118,1,1,(60*flick*.6,70*flick*.6,90*flick*.6),.5)
    lines=[(0.8,3.0,"IT'S LATE."),(3.0,5.2,"YOU'RE STILL UP."),(5.2,7.6,"SO ARE WE.")]
    for t0,t1,s in lines:
        if t0<=t<t1:
            al=min(1,(t-t0)/.35,(t1-t)/.35);text(a,s,"c",160,CREAM,2,alpha=max(0,al),shadow=(0,0,0))
    return a
DUR_late_room=8.0

# ---------- 5. SURF: flipping through the dial, landing on channel 00 ----------
def mini(kind,a,t):
    if kind=="forest":
        vgrad(a,0,H,(12,22,16),(40,66,44));stars(a,14,8,60,t)
        r=random.Random(2)
        for x in range(-10,W,9):
            h=r.randint(40,90);
            for y in range(h):rect(a,x+4-y*.18,H-y,y*.36+1,1,(10,20,14))
    elif kind=="city":
        vgrad(a,0,H,(12,14,30),(42,44,70));r=random.Random(4);x=0
        while x<W:
            w=r.randint(18,34);h=r.randint(40,110);rect(a,x,H-h,w-2,h,(10,11,20))
            for wy in range(H-h+6,H-4,9):
                for wx in range(x+4,x+w-6,7):
                    if r.random()<.45:rect(a,wx,wy,3,3,(232,200,106))
            x+=w
    elif kind=="space":
        a[:]=(6,7,14);stars(a,80,9,H,t);rect(a,0,0,0,0,(0,0,0))
        for yy in range(60):
            for xx in range(-60,60):
                if xx*xx+yy*yy<3600:rect(a,250+xx,150-yy+60,1,1,(56,64,120))
    elif kind=="desert":
        vgrad(a,0,120,(46,24,58),(214,110,64));vgrad(a,120,H,(110,52,44),(60,30,32));rect(a,0,0,0,0,(0,0,0))
        for xx in range(-26,26):
            for yy in range(0,26):
                if xx*xx+yy*yy<676:rect(a,160+xx,120-yy,1,1,(246,196,106))
        rect(a,60,84,8,40,(40,70,40));rect(a,52,96,8,4,(40,70,40));rect(a,52,90,4,8,(40,70,40));rect(a,68,100,8,4,(40,70,40));rect(a,72,92,4,10,(40,70,40))
    elif kind=="sea":
        vgrad(a,0,100,(10,12,40),(40,48,110));vgrad(a,100,H,(10,16,56),(4,6,24));stars(a,30,6,90,t)
        rect(a,214,30,14,14,(236,230,200))
        for i in range(14):rect(a,180+(i%3)*20,108+i*5,40-(i%4)*6,1,(130,140,210))
    elif kind=="bars":
        for i,c in enumerate(BARS):rect(a,i*W/7,0,W/7+1,H,c)
    elif kind=="grid":
        vgrad(a,0,100,(4,10,7),(12,32,20));a[100:]=(6,13,9)
        for x in range(-200,520,24):
            for k in range(80):rect(a,160+(x-160)*(k/80),100+k,1,1,(70,196,118))
        for y in (102,106,112,121,134,152,176):rect(a,0,y,W,1,(70,196,118))
SURF=[("forest",12),("city",101),("space",50),("desert",100),("sea",54),("grid",55),("bars",65),("city",64),("forest",202)]
def surf(t):
    a=canvas();step=.42;i=int(t/step)
    if i<len(SURF):
        local=t-i*step;kind,ch=SURF[i];mini(kind,a,t)
        if local<.1:a[:]=_rng.random((H,W,1)).astype(np.float32)*255
        lab="CH %d"%ch;text(a,lab,W-12-text_w(lab,2),10,GREEN,2,shadow=(0,0,0))
    else:
        local=t-len(SURF)*step
        if local<.12:a[:]=_rng.random((H,W,1)).astype(np.float32)*255
        else:
            a[:]=(10,12,10);al=min(1,(local-.12)/.3)
            text(a,"CH 00","c",44,GREEN,4,alpha=al)
            text(a,"THERE'S ALWAYS","c",98,CREAM,2,alpha=al)
            text(a,"SOMETHING ON","c",118,CREAM,2,alpha=al)
            text(a,"ZTV","c",152,OLIVE,1,alpha=al)
    return a
DUR_surf=len(SURF)*.42+2.4

BUMPS={"night-drive":(night_drive,DUR_night_drive),"signal":(signal,DUR_signal),"right-back":(right_back,DUR_right_back),
       "late-room":(late_room,DUR_late_room),"surf":(surf,DUR_surf)}
