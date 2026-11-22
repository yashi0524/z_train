// ═══════════════════════════════════════════════
// scene.js — map, fog of war, ray-cast, level generation, player, items, GameScene
// (enemy logic → enemy.js, UI/layout/HUD → ui.js)
// ═══════════════════════════════════════════════

// ── ISO scale ──
const ISO_SCALE=0.6;

// ── Game constants ──
const MAP_W=1600, MAP_H=1120;
const SCROLL_MARGIN=180;
const PLAYER_SPEED=220;
const VISION_RADIUS=200;
const CABINET_RADIUS=22;
const CABINET_HIDE_MAX=5;
const TILE=40;

// ── Fog canvases (resized on launch) ──
const fogCanvas=document.getElementById('fog-canvas');
const fogCtx=fogCanvas.getContext('2d');
const exploredCanvas=document.createElement('canvas');
const exploredCtx=exploredCanvas.getContext('2d');
const dimCanvas=document.createElement('canvas');
const dimCtx=dimCanvas.getContext('2d');
let _camX=0, _camY=0;

function fogY(wy){return wy*ISO_SCALE;}
function fogCamY(){return _camY*ISO_SCALE;}

function initFogCanvases(){
  fogCanvas.width=VIEW_W; fogCanvas.height=VIEW_H;
  exploredCanvas.width=MAP_W; exploredCanvas.height=MAP_H*ISO_SCALE;
  exploredCtx.fillStyle='#000'; exploredCtx.fillRect(0,0,MAP_W,MAP_H*ISO_SCALE);
  dimCanvas.width=VIEW_W; dimCanvas.height=VIEW_H;
  fogCtx.fillStyle='#000'; fogCtx.fillRect(0,0,VIEW_W,VIEW_H);
}
function resetFog(){
  exploredCtx.fillStyle='#000'; exploredCtx.fillRect(0,0,MAP_W,MAP_H*ISO_SCALE);
  dimCtx.clearRect(0,0,VIEW_W,VIEW_H);
  fogCtx.fillStyle='#000'; fogCtx.fillRect(0,0,VIEW_W,VIEW_H);
}

function paintFog(px,py,vpts){
  const fcamY=fogCamY();
  if(vpts&&vpts.length>=3){
    exploredCtx.save(); exploredCtx.fillStyle='#fff';
    exploredCtx.beginPath();
    exploredCtx.moveTo(vpts[0].x,fogY(vpts[0].y));
    for(let i=1;i<vpts.length;i++) exploredCtx.lineTo(vpts[i].x,fogY(vpts[i].y));
    exploredCtx.closePath(); exploredCtx.fill(); exploredCtx.restore();
  }
  fogCtx.globalAlpha=1; fogCtx.fillStyle='#000';
  fogCtx.fillRect(0,0,VIEW_W,VIEW_H);
  fogCtx.save();
  fogCtx.globalCompositeOperation='destination-out';
  fogCtx.drawImage(exploredCanvas,_camX,fcamY,VIEW_W,VIEW_H,0,0,VIEW_W,VIEW_H);
  fogCtx.restore();
  if(vpts&&vpts.length>=3){
    dimCtx.clearRect(0,0,VIEW_W,VIEW_H);
    dimCtx.drawImage(exploredCanvas,_camX,fcamY,VIEW_W,VIEW_H,0,0,VIEW_W,VIEW_H);
    dimCtx.save(); dimCtx.globalCompositeOperation='source-in';
    dimCtx.fillStyle='rgba(0,0,0,0.72)'; dimCtx.fillRect(0,0,VIEW_W,VIEW_H); dimCtx.restore();
    dimCtx.save(); dimCtx.globalCompositeOperation='destination-out';
    dimCtx.beginPath();
    dimCtx.moveTo(vpts[0].x-_camX,fogY(vpts[0].y)-fcamY);
    for(let i=1;i<vpts.length;i++) dimCtx.lineTo(vpts[i].x-_camX,fogY(vpts[i].y)-fcamY);
    dimCtx.closePath(); dimCtx.fill(); dimCtx.restore();
    fogCtx.drawImage(dimCanvas,0,0);
    const fpx=px-_camX, fpy=fogY(py)-fcamY;
    const gr=fogCtx.createRadialGradient(fpx,fpy,VISION_RADIUS*ISO_SCALE*.8,fpx,fpy,VISION_RADIUS*ISO_SCALE*1.25);
    gr.addColorStop(0,'rgba(0,0,0,0)'); gr.addColorStop(1,'rgba(0,0,0,0.4)');
    fogCtx.fillStyle=gr; fogCtx.fillRect(0,0,VIEW_W,VIEW_H);
  }
}

// ── Ray-cast ─────────────────────────────────
function buildSegs(walls,pillars){
  const s=[];
  function r(x,y,w,h){s.push([x,y,x+w,y],[x+w,y,x+w,y+h],[x+w,y+h,x,y+h],[x,y+h,x,y]);}
  walls.forEach(w=>r(w.x,w.y,w.w,w.h));
  pillars.forEach(p=>r(p.x-p.s,p.y-p.s,p.s*2,p.s*2));
  const E=1; r(-E,-E,MAP_W+E*2,MAP_H+E*2); return s;
}
function castVision(px,py,segs,rad){
  const angles=[];
  segs.forEach(([x1,y1,x2,y2])=>{
    [Math.atan2(y1-py,x1-px),Math.atan2(y2-py,x2-px)].forEach(a=>angles.push(a-.0001,a,a+.0001));
  });
  const pts=[];
  angles.forEach(angle=>{
    const dx=Math.cos(angle),dy=Math.sin(angle);let minT=rad;
    segs.forEach(([x1,y1,x2,y2])=>{
      const ex=x2-x1,ey=y2-y1,d=dx*ey-dy*ex;if(Math.abs(d)<1e-8)return;
      const t=((x1-px)*ey-(y1-py)*ex)/d,u=((x1-px)*dy-(y1-py)*dx)/d;
      if(t>=0&&t<minT&&u>=0&&u<=1)minT=t;
    });
    pts.push({angle,x:px+dx*minT,y:py+dy*minT});
  });
  pts.sort((a,b)=>a.angle-b.angle);return pts;
}

// ── Level generator ──────────────────────────
function generateLevel(){
  const margin=3,cols=Math.floor(MAP_W/TILE),rows=Math.floor(MAP_H/TILE);
  const walls=[],occ=new Set();
  function addW(tx,ty,tw,th){
    walls.push({x:tx*TILE,y:ty*TILE,w:tw*TILE,h:th*TILE});
    for(let dx=0;dx<tw;dx++)for(let dy=0;dy<th;dy++)occ.add(`${tx+dx},${ty+dy}`);
  }
  [{cx:10,cy:7},{cx:28,cy:7},{cx:10,cy:18},{cx:28,cy:18},{cx:19,cy:12}].forEach(({cx,cy})=>{
    const rw=7,rh=5,rx=cx-3,ry=cy-2;
    if(rx<2||ry<3||rx+rw>cols-2||ry+rh>rows-2)return;
    addW(rx,ry,3,1);addW(rx+4,ry,3,1);addW(rx,ry+rh-1,3,1);addW(rx+4,ry+rh-1,3,1);
    addW(rx,ry,1,2);addW(rx,ry+3,1,2);addW(rx+rw-1,ry,1,2);addW(rx+rw-1,ry+3,1,2);
  });
  const ne=14+Math.floor(Math.random()*8);
  for(let a=0;a<ne*12&&walls.length<ne+40;a++){
    const h=Math.random()>.5,len=2+Math.floor(Math.random()*4);
    const tx=margin+Math.floor(Math.random()*(cols-2*margin-len));
    const ty=3+Math.floor(Math.random()*(rows-5));
    let ok=true;
    for(let i=0;i<len;i++){if(occ.has(h?`${tx+i},${ty}`:`${tx},${ty+i}`)){ok=false;break;}}
    if(!ok)continue;
    if(h)addW(tx,ty,len,1);else addW(tx,ty,1,len);
  }
  const pillars=[];
  for(let a=0;a<200&&pillars.length<10;a++){
    const tx=3+Math.floor(Math.random()*(cols-6)),ty=3+Math.floor(Math.random()*(rows-6));
    if(!occ.has(`${tx},${ty}`)){occ.add(`${tx},${ty}`);pillars.push({x:tx*TILE+20,y:ty*TILE+20,s:12});}
  }
  const cabinets=[];
  for(let a=0;a<300&&cabinets.length<7;a++){
    const tx=2+Math.floor(Math.random()*(cols-4)),ty=3+Math.floor(Math.random()*(rows-5));
    if(!occ.has(`${tx},${ty}`)){occ.add(`${tx},${ty}`);cabinets.push({x:tx*TILE+20,y:ty*TILE+20});}
  }
  const ep=Math.floor(Math.random()*4);let exit;
  if(ep===0)exit={x:(8+Math.floor(Math.random()*(cols-12)))*TILE,y:TILE};
  else if(ep===1)exit={x:(2+Math.floor(Math.random()*(cols-4)))*TILE,y:(rows-2)*TILE};
  else if(ep===2)exit={x:TILE,y:(4+Math.floor(Math.random()*(rows-6)))*TILE};
  else exit={x:(cols-2)*TILE,y:(2+Math.floor(Math.random()*(rows-4)))*TILE};
  let key=null;
  for(let a=0;a<300&&!key;a++){
    const tx=2+Math.floor(Math.random()*(cols-4)),ty=3+Math.floor(Math.random()*(rows-5));
    const kx=tx*TILE+20,ky=ty*TILE+20;
    if(!occ.has(`${tx},${ty}`)&&Math.hypot(kx-exit.x,ky-exit.y)>350&&Math.hypot(kx-MAP_W/2,ky-MAP_H/2)>180){
      occ.add(`${tx},${ty}`);key={x:kx,y:ky};
    }
  }
  if(!key)key={x:400,y:900};
  return {walls,pillars,cabinets,exit,key,keyCollected:false,exitLocked:true};
}

// ═══════════════════════════════════════════════
// Phaser Scene (core: map / player / items). Enemy + UI methods are mixed in by enemy.js / ui.js
// ═══════════════════════════════════════════════
class GameScene extends Phaser.Scene{
  constructor(){super('GameScene');}

  preload(){
    this.textures.addCanvas('player',  drawCat(48));
    this._preloadEnemy();
    this.textures.addCanvas('cabinet', drawCabinet(44));
    this.textures.addCanvas('key_tex', drawKeyTex(36));
    this.textures.addCanvas('gun_tex', drawGun(32));
    this.textures.addCanvas('exit_locked',drawExitTex(48,true));
    this.textures.addCanvas('exit_open',  drawExitTex(48,false));
  }

  create(){
    const lv=generateLevel(); this._lv=lv; _mmLevel=lv;
    this._segs=buildSegs(lv.walls,lv.pillars);
    resetFog();

    this.physics.world.setBounds(0,0,MAP_W,MAP_H);
    this.cameras.main.setBounds(0,0,MAP_W,MAP_H);
    this.cameras.main.setScroll(MAP_W/2-VIEW_W/2,MAP_H/2-VIEW_H/2);

    // Background
    const bg=this.add.graphics().setDepth(0);
    for(let tx=0;tx<MAP_W/TILE;tx++)for(let ty=0;ty<MAP_H/TILE;ty++){
      bg.fillStyle((tx+ty)%2===0?0xedf2ed:0xe3eae3,1);
      bg.fillRect(tx*TILE,ty*TILE,TILE,TILE);
    }
    bg.lineStyle(1,0xd0d8d0,.5);
    for(let x=0;x<=MAP_W;x+=TILE)bg.lineBetween(x,0,x,MAP_H);
    for(let y=0;y<=MAP_H;y+=TILE)bg.lineBetween(0,y,MAP_W,y);

    // Walls
    this.walls=this.physics.add.staticGroup();
    const wg=this.add.graphics().setDepth(2); const SIDE=16;
    lv.walls.forEach(w=>{
      wg.fillStyle(0x3a4455,1);wg.fillRect(w.x,w.y+w.h,w.w,SIDE);
      wg.fillStyle(0x8899aa,1);wg.fillRect(w.x,w.y,w.w,w.h);
      wg.fillStyle(0xbcccdd,.3);wg.fillRect(w.x+2,w.y+2,w.w-4,Math.min(6,w.h-4));
      wg.lineStyle(5,0xaaccff,.1);wg.strokeRect(w.x-2,w.y-2,w.w+4,w.h+4);
      wg.lineStyle(2,0xbbddff,.22);wg.strokeRect(w.x-1,w.y-1,w.w+2,w.h+2);
      wg.lineStyle(1.5,0xddeeff,.6);wg.strokeRect(w.x,w.y,w.w,w.h);
      const bw=w.w<w.h?w.w+4:w.w,bh=w.w<w.h?w.h:w.h+4;
      const b=this.walls.create(w.x+w.w/2,w.y+w.h/2,null);
      b.setVisible(false);b.body.setSize(bw,bh);b.refreshBody();
    });
    lv.pillars.forEach(p=>{
      const sz=p.s*2;
      wg.fillStyle(0x3a4455,1);wg.fillRect(p.x-p.s,p.y+p.s,sz,SIDE);
      wg.fillStyle(0x667799,1);wg.fillRect(p.x-p.s,p.y-p.s,sz,sz);
      wg.lineStyle(1.5,0xbbddff,.55);wg.strokeRect(p.x-p.s,p.y-p.s,sz,sz);
      const b=this.walls.create(p.x,p.y,null);
      b.setVisible(false);b.body.setSize(sz,sz);b.refreshBody();
    });

    // Cabinets
    this._cabs=[];
    const cg=this.physics.add.staticGroup();
    lv.cabinets.forEach(c=>{
      const sp=cg.create(c.x,c.y,'cabinet');
      sp.setOrigin(0.5).setDisplaySize(44,73).setDepth(3);
      sp.body.setSize(36,36);sp.refreshBody();
      this._cabs.push({sprite:sp,x:c.x,y:c.y});
    });

    // Gun
    this._hasGun=false;this._gunUsed=false;
    const gi=Math.floor(Math.random()*this._cabs.length);
    const gc=this._cabs[gi];
    this._gunSpr=this.add.image(gc.x,gc.y-26,'gun_tex').setDisplaySize(28,23).setDepth(4).setAlpha(0.9);
    this.tweens.add({targets:this._gunSpr,y:gc.y-30,yoyo:true,repeat:-1,duration:900,ease:'Sine.easeInOut'});
    this._gunZone=new Phaser.Geom.Circle(gc.x,gc.y,CABINET_RADIUS+32);

    // Key
    this._hasKey=false;
    this._keySpr=this.add.image(lv.key.x,lv.key.y,'key_tex').setDisplaySize(26,43).setDepth(3);
    this.tweens.add({targets:this._keySpr,y:lv.key.y-6,yoyo:true,repeat:-1,duration:700,ease:'Sine.easeInOut'});
    this._keyZone=new Phaser.Geom.Circle(lv.key.x,lv.key.y,26);

    // Exit
    this._exitLocked=true;
    const ex=lv.exit;
    this._exitSpr=this.add.image(ex.x,ex.y,'exit_locked').setDisplaySize(44,73).setDepth(3);
    this.tweens.add({targets:this._exitSpr,scaleX:1.12,scaleY:1.12,yoyo:true,repeat:-1,duration:700});
    this._exitZone=new Phaser.Geom.Circle(ex.x,ex.y,28);

    // Player
    this.player=this.physics.add.sprite(MAP_W/2,MAP_H/2,'player');
    this.player.setDisplaySize(36,60).setCollideWorldBounds(true).setDepth(5);
    this.player.body.setSize(20,20);this.player.body.setOffset(14,14);
    this.player.body.setMaxVelocity(PLAYER_SPEED,PLAYER_SPEED);
    this._jumpZ=0;this._jumpT=0;this._jumping=false;
    this._jumpGhost=null;
    this._shadow=this.add.graphics().setDepth(4);

    // Enemies + train (enemy.js)
    this._initEnemies();

    // HUD text (screen-fixed)
    this._hideBar=this.add.graphics().setDepth(20).setScrollFactor(0);
    this._ejectTxt=this.add.text(0,0,'',{fontSize:'18px',fontFamily:'Courier New',color:'#e63946',stroke:'#fff',strokeThickness:4}).setOrigin(0.5).setDepth(20).setScrollFactor(0);

    // Overlay (ui.js)
    this._initOverlay();

    // Input
    this.keys=this.input.keyboard.addKeys({
      up:Phaser.Input.Keyboard.KeyCodes.W, down:Phaser.Input.Keyboard.KeyCodes.S,
      left:Phaser.Input.Keyboard.KeyCodes.A, right:Phaser.Input.Keyboard.KeyCodes.D,
      space:Phaser.Input.Keyboard.KeyCodes.SPACE, f:Phaser.Input.Keyboard.KeyCodes.F,
    });
    this._spWas=false;this._fWas=false;
    this.input.on('pointerdown',(p)=>{ if(p.leftButtonDown())this._shootAt(p.x+_camX,p.y+_camY); });

    // Gun slot tap (ui.js)
    this._bindGunSlot();

    // Colliders
    this.physics.add.collider(this.player,this.walls);

    // State
    this._state='waiting';this._pt=0;this._firstSafe=true;
    this._startTime=null;this._gameTime=0;
    this._hiding=false;this._hideT=0;this._nearCab=null;
    this._caught=false;this._won=false;
    this._keyLbl=null;this._gunLbl=null;this._vbShootWas=false;

    this._showOv('🐱','請選擇開始方式<br><br>找到 🔑 鑰匙 → 抵達 EXIT 即勝利');
    this._hudUpdate();
  }

  _camUpdate(){
    const px=this.player.x,py=this.player.y,cam=this.cameras.main;
    let cx=cam.scrollX,cy=cam.scrollY;
    const sx=px-cx,sy=py-cy;
    if(sx<SCROLL_MARGIN)cx=px-SCROLL_MARGIN;
    if(sx>VIEW_W-SCROLL_MARGIN)cx=px-VIEW_W+SCROLL_MARGIN;
    if(sy<SCROLL_MARGIN)cy=py-SCROLL_MARGIN;
    if(sy>VIEW_H-SCROLL_MARGIN)cy=py-VIEW_H+SCROLL_MARGIN;
    cx=Math.max(0,Math.min(MAP_W-VIEW_W,cx));
    cy=Math.max(0,Math.min(MAP_H-VIEW_H,cy));
    cam.setScroll(cx,cy);_camX=cx;_camY=cy;
  }

  _eject(){
    this._hiding=false;this._hideT=0;this.player.setAlpha(1);this._hideBar.clear();
    const sx=this.player.x-_camX,sy=this.player.y-_camY;
    this._ejectTxt.setText('彈出！').setPosition(sx,sy-40);
    this.time.delayedCall(800,()=>{if(this._ejectTxt)this._ejectTxt.setText('');});
    UI.setStatus('暴露中','');
  }

  update(time,delta){
    if(this._caught||this._won)return;
    this._camUpdate();
    const px=this.player.x,py=this.player.y;
    const pts=castVision(px,py,this._segs,VISION_RADIUS);
    paintFog(px,py,pts);
    paintMinimap(px,py);

    if(this._state==='waiting')return;
    const dt=delta/1000;
    this._updatePhase(dt);

    const {up,down,left,right,space,f}=this.keys;
    const sx=px-_camX,sy=py-_camY;

    // Cabinet proximity
    let nc=null,nd=Infinity;
    this._cabs.forEach(c=>{
      const d=Phaser.Math.Distance.Between(px,py,c.x,c.y);
      if(d<CABINET_RADIUS+32&&d<nd){nd=d;nc=c;}
    });
    this._nearCab=nc;

    // Hide timer
    if(this._hiding){
      this._hideT+=dt;
      const pct=Math.max(0,1-this._hideT/CABINET_HIDE_MAX);
      this._hideBar.clear();
      this._hideBar.fillStyle(0x000000,.55);this._hideBar.fillRect(sx-22,sy-44,44,7);
      this._hideBar.fillStyle(pct>.4?0x50c878:0xe63946,1);this._hideBar.fillRect(sx-22,sy-44,44*pct,7);
      if(this._hideT>=CABINET_HIDE_MAX)this._eject();
    } else {this._hideBar.clear();}

    // Jump
    const spDown=space.isDown||_vbJump;
    if(spDown&&!this._spWas&&!this._hiding&&!this._jumping){
      this._jumping=true;this._jumpT=0;
      this._setCatchEnabled(false);
    }
    this._spWas=spDown;
    if(this._jumping){
      this._jumpT+=dt;const t=this._jumpT/0.42;
      if(t>=1){
        this._jumping=false;this._jumpZ=0;
        this.player.setDisplaySize(36,60);this._shadow.clear();
        this._setCatchEnabled(true);
      } else {
        this._jumpZ=Math.sin(t*Math.PI)*44;
        const sc=1+Math.sin(t*Math.PI)*.2;
        this.player.setDisplaySize(36*sc,60*sc);
        this._shadow.clear();
        const h2=Math.sin(t*Math.PI),sr=14*(1-h2*.5);
        this._shadow.fillStyle(0x000000,.2*(1-h2*.6));
        this._shadow.fillEllipse(px,py+10,sr*2,sr*.4);
      }
    } else {this._jumpZ=0;}

    if(this._jumping){
      if(!this._jumpGhost){
        this._jumpGhost=this.add.image(px,py,'player').setDisplaySize(36,60).setDepth(6);
        this.player.setAlpha(0);
      }
      const sc2=1+Math.sin((this._jumpT/0.42)*Math.PI)*.2;
      this._jumpGhost.setPosition(px,py-this._jumpZ).setDisplaySize(36*sc2,60*sc2);
      this._jumpGhost.setFlipX(this.player.flipX);
    } else {
      if(this._jumpGhost){this._jumpGhost.destroy();this._jumpGhost=null;}
      if(!this._hiding)this.player.setAlpha(1);
    }

    // Hide/F
    const fDown=f.isDown||_vbHide;
    if(fDown&&!this._fWas){
      if(this._nearCab&&!this._hiding&&!this._jumping){
        this._hiding=true;this._hideT=0;this.player.setAlpha(0.12);
        UI.setStatus('躲在櫃子裡','hiding');
      } else if(this._hiding){this._eject();}
    }
    this._fWas=fDown;

    // Movement
    if(!this._hiding){
      let vx=0,vy=0;
      if(left.isDown)vx=-PLAYER_SPEED;if(right.isDown)vx=PLAYER_SPEED;
      if(up.isDown)  vy=-PLAYER_SPEED;if(down.isDown) vy=PLAYER_SPEED;
      if(_vjActive){
        const dead=0.15;
        if(Math.abs(_vjX)>dead||Math.abs(_vjY)>dead){vx=_vjX*PLAYER_SPEED;vy=_vjY*PLAYER_SPEED;}
      }
      if(vx&&vy){vx*=0.707;vy*=0.707;}
      this.player.setVelocity(vx,vy);
      if(vx<0)this.player.setFlipX(true);else if(vx>0)this.player.setFlipX(false);
    } else {this.player.setVelocity(0,0);}

    // Item labels
    if(this._keyLbl)this._keyLbl.setPosition(sx+9,sy-24);
    if(this._gunLbl)this._gunLbl.setPosition(sx-9,sy-24);

    this._updateVirtualShoot();

    // Gun pickup
    if(!this._hasGun&&this._gunSpr&&this._gunSpr.active&&Phaser.Geom.Circle.Contains(this._gunZone,px,py)){
      this._hasGun=true;this._gunSpr.destroy();this._gunSpr=null;this._itemHUD();
      const gb=this.add.graphics().setDepth(25).setScrollFactor(0);
      gb.fillStyle(0x000000,.75);gb.fillRoundedRect(VIEW_W/2-140,VIEW_H/2-28,280,56,10);
      gb.lineStyle(2,0xaaa,.9);gb.strokeRoundedRect(VIEW_W/2-140,VIEW_H/2-28,280,56,10);
      const gm=this.add.text(VIEW_W/2,VIEW_H/2-0,'🔫 撿到手槍！',{fontSize:'18px',fontFamily:'Courier New',color:'#fff',stroke:'#000',strokeThickness:3}).setOrigin(0.5).setDepth(26).setScrollFactor(0);
      this.tweens.add({targets:[gm,gb],alpha:0,delay:1400,duration:600,onComplete:()=>{gm.destroy();gb.destroy();}});
      this._gunLbl=this.add.text(sx-9,sy-24,'🔫',{fontSize:'14px'}).setOrigin(0.5,1).setDepth(20).setScrollFactor(0);
    }

    // Key pickup
    if(!this._hasKey&&Phaser.Geom.Circle.Contains(this._keyZone,px,py)){
      this._hasKey=true;this._keySpr.destroy();
      this._exitLocked=false;this._exitSpr.setTexture('exit_open');
      this._hudUpdate();this._itemHUD();
      const bb=this.add.graphics().setDepth(25).setScrollFactor(0);
      bb.fillStyle(0x000000,.75);bb.fillRoundedRect(VIEW_W/2-150,VIEW_H/2-28,300,56,10);
      bb.lineStyle(2,0xFFD700,.9);bb.strokeRoundedRect(VIEW_W/2-150,VIEW_H/2-28,300,56,10);
      const bm=this.add.text(VIEW_W/2,VIEW_H/2,'🔑 取得鑰匙！出口已解鎖',{fontSize:'17px',fontFamily:'Courier New',color:'#FFD700',stroke:'#000',strokeThickness:3}).setOrigin(0.5).setDepth(26).setScrollFactor(0);
      this.tweens.add({targets:[bm,bb],alpha:0,delay:1400,duration:600,onComplete:()=>{bm.destroy();bb.destroy();}});
      this._keyLbl=this.add.text(sx+9,sy-24,'🔑',{fontSize:'14px'}).setOrigin(0.5,1).setDepth(20).setScrollFactor(0);
    }

    // Exit
    if(!this._exitLocked&&Phaser.Geom.Circle.Contains(this._exitZone,px,py)){
      this._won=true;this.physics.pause();
      const _elapsed=this._startTime?Math.floor((Date.now()-this._startTime)/1000):0;
      const _mm=String(Math.floor(_elapsed/60)).padStart(2,'0'),_ss=String(_elapsed%60).padStart(2,'0');
      this._showOv('🎉',`逃脫成功！<br><small style="color:#aaa">用時 ${_mm}:${_ss}</small><br><br><button onclick="resetGame()" style="margin-top:10px;padding:7px 18px;background:#27ae60;color:#fff;border:none;border-radius:8px;font-family:'Courier New',monospace;font-size:14px;cursor:pointer;">🔄 再玩</button>`);
      this._ov.style.pointerEvents='auto';
    }

    this._updateEnemies(px,py);

    this._updateHint(px,py);
  }
}
