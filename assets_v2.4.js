// ═══════════════════════════════════════════
// assets_v2.4.js
// ═══════════════════════════════════════════

// Oblique projection helpers
// World (wx, wy) → Screen (sx, sy) with 45° oblique depth
// Y is compressed to 0.6, giving a "looking down at an angle" feel
const ISO_Y = 0.55;  // vertical compression ratio

function isoProject(wx, wy) {
  return { x: wx, y: wy * ISO_Y };
}

// ── Cat ──────────────────────────────────────
function drawCat(size){
  const c=document.createElement('canvas');c.width=c.height=size;
  const ctx=c.getContext('2d'),s=size;
  ctx.fillStyle='#f5c97a';
  ctx.beginPath();ctx.ellipse(s*.5,s*.58,s*.28,s*.24,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(s*.5,s*.35,s*.22,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(s*.32,s*.18);ctx.lineTo(s*.22,s*.04);ctx.lineTo(s*.42,s*.16);ctx.fill();
  ctx.beginPath();ctx.moveTo(s*.68,s*.18);ctx.lineTo(s*.78,s*.04);ctx.lineTo(s*.58,s*.16);ctx.fill();
  ctx.fillStyle='#f0a0a0';
  ctx.beginPath();ctx.moveTo(s*.33,s*.17);ctx.lineTo(s*.26,s*.08);ctx.lineTo(s*.40,s*.17);ctx.fill();
  ctx.beginPath();ctx.moveTo(s*.67,s*.17);ctx.lineTo(s*.74,s*.08);ctx.lineTo(s*.60,s*.17);ctx.fill();
  ctx.fillStyle='#333';
  ctx.beginPath();ctx.ellipse(s*.41,s*.33,s*.05,s*.06,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(s*.59,s*.33,s*.05,s*.06,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.arc(s*.43,s*.31,s*.015,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(s*.61,s*.31,s*.015,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#e88';ctx.beginPath();ctx.arc(s*.5,s*.39,s*.03,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#c55';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(s*.5,s*.42);ctx.lineTo(s*.44,s*.46);ctx.stroke();
  ctx.beginPath();ctx.moveTo(s*.5,s*.42);ctx.lineTo(s*.56,s*.46);ctx.stroke();
  ctx.strokeStyle='#bbb';ctx.lineWidth=.8;
  [[.28,.38,.44,.37],[.26,.41,.43,.40],[.72,.38,.56,.37],[.74,.41,.57,.40]].forEach(([x1,y1,x2,y2])=>{
    ctx.beginPath();ctx.moveTo(s*x1,s*y1);ctx.lineTo(s*x2,s*y2);ctx.stroke();
  });
  ctx.strokeStyle='#f5c97a';ctx.lineWidth=s*.07;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(s*.72,s*.72);ctx.quadraticCurveTo(s*.95,s*.80,s*.88,s*.58);ctx.stroke();
  ctx.fillStyle='#f5c97a';
  ctx.beginPath();ctx.ellipse(s*.36,s*.80,s*.08,s*.10,-.2,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(s*.54,s*.80,s*.08,s*.10,.2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f0a0a0';
  ctx.beginPath();ctx.ellipse(s*.36,s*.86,s*.05,s*.03,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(s*.54,s*.86,s*.05,s*.03,0,0,Math.PI*2);ctx.fill();
  return c;
}

// ── Zombie ───────────────────────────────────
function drawZombie(size){
  const c=document.createElement('canvas');c.width=c.height=size;
  const ctx=c.getContext('2d'),s=size;
  ctx.fillStyle='#7dab6e';
  ctx.beginPath();ctx.ellipse(s*.5,s*.60,s*.26,s*.22,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#5a8a4a';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(s*.34,s*.50);ctx.lineTo(s*.36,s*.70);ctx.stroke();
  ctx.beginPath();ctx.moveTo(s*.50,s*.48);ctx.lineTo(s*.52,s*.72);ctx.stroke();
  ctx.beginPath();ctx.moveTo(s*.64,s*.50);ctx.lineTo(s*.62,s*.70);ctx.stroke();
  ctx.fillStyle='#8abf78';ctx.beginPath();ctx.arc(s*.5,s*.34,s*.22,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#3a2a1a';ctx.beginPath();
  ctx.moveTo(s*.30,s*.22);ctx.quadraticCurveTo(s*.28,s*.08,s*.38,s*.14);
  ctx.quadraticCurveTo(s*.40,s*.06,s*.50,s*.13);ctx.quadraticCurveTo(s*.55,s*.05,s*.62,s*.13);
  ctx.quadraticCurveTo(s*.72,s*.09,s*.70,s*.22);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#cc2222';ctx.lineWidth=1.8;
  ctx.beginPath();ctx.moveTo(s*.38,s*.29);ctx.lineTo(s*.44,s*.35);ctx.stroke();
  ctx.beginPath();ctx.moveTo(s*.44,s*.29);ctx.lineTo(s*.38,s*.35);ctx.stroke();
  ctx.beginPath();ctx.moveTo(s*.56,s*.29);ctx.lineTo(s*.62,s*.35);ctx.stroke();
  ctx.beginPath();ctx.moveTo(s*.62,s*.29);ctx.lineTo(s*.56,s*.35);ctx.stroke();
  ctx.strokeStyle='#3a1a1a';ctx.lineWidth=1.4;ctx.beginPath();
  ctx.moveTo(s*.38,s*.42);ctx.lineTo(s*.43,s*.46);ctx.lineTo(s*.48,s*.43);
  ctx.lineTo(s*.53,s*.47);ctx.lineTo(s*.58,s*.43);ctx.lineTo(s*.62,s*.46);ctx.stroke();
  ctx.strokeStyle='#7dab6e';ctx.lineWidth=s*.09;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(s*.26,s*.55);ctx.lineTo(s*.04,s*.42);ctx.stroke();
  ctx.beginPath();ctx.moveTo(s*.74,s*.55);ctx.lineTo(s*.96,s*.42);ctx.stroke();
  ctx.strokeStyle='#5a8a4a';ctx.lineWidth=1.5;
  [[.04,.42,.00,.36],[.04,.42,.02,.38],[.04,.42,.06,.35]].forEach(([x1,y1,x2,y2])=>{ctx.beginPath();ctx.moveTo(s*x1,s*y1);ctx.lineTo(s*x2,s*y2);ctx.stroke();});
  [[.96,.42,1.00,.36],[.96,.42,.98,.38],[.96,.42,.94,.35]].forEach(([x1,y1,x2,y2])=>{ctx.beginPath();ctx.moveTo(s*x1,s*y1);ctx.lineTo(s*x2,s*y2);ctx.stroke();});
  ctx.fillStyle='#7dab6e';
  ctx.beginPath();ctx.ellipse(s*.38,s*.80,s*.08,s*.10,-.15,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(s*.62,s*.80,s*.08,s*.10,.15,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#4a6a3a';
  ctx.beginPath();ctx.ellipse(s*.38,s*.87,s*.07,s*.04,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(s*.62,s*.87,s*.07,s*.04,0,0,Math.PI*2);ctx.fill();
  return c;
}

// ── Cabinet ──────────────────────────────────
function drawCabinet(size){
  const c=document.createElement('canvas');
  const W=size, H=Math.round(size*1.4);  // taller to show side in oblique
  c.width=W; c.height=H;
  const ctx=c.getContext('2d');

  // Side face (bottom strip — the "depth" in oblique view)
  ctx.fillStyle='#6a4d10';
  ctx.fillRect(2, size, W-4, H-size-2);
  // Highlight line between top and side
  ctx.fillStyle='#c49a3c';
  ctx.fillRect(2, size-1, W-4, 2);

  // Top face
  ctx.fillStyle='#8B6914'; ctx.fillRect(2,2,W-4,size-4);
  ctx.fillStyle='#A0792A'; ctx.fillRect(4,4,W-8,size-8);
  ctx.fillStyle='#C49A3C';
  ctx.fillRect(6,6,(W-12)/2-1,size-12);
  ctx.fillRect(6+(W-12)/2+1,6,(W-12)/2-1,size-12);
  ctx.strokeStyle='#7A5510';ctx.lineWidth=1.5;
  ctx.strokeRect(6,6,(W-12)/2-1,size-12);
  ctx.strokeRect(6+(W-12)/2+1,6,(W-12)/2-1,size-12);
  // Door knobs
  ctx.fillStyle='#8B5E10';
  ctx.beginPath();ctx.arc(W/2-3,size/2,2,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(W/2+3,size/2,2,0,Math.PI*2);ctx.fill();
  // Top trim
  ctx.fillStyle='#7A5510';ctx.fillRect(2,2,W-4,4);

  return c;
}

// ── Key ──────────────────────────────────────
function drawKeyTex(size){
  const c=document.createElement('canvas');c.width=c.height=size;
  const ctx=c.getContext('2d'),s=size;
  ctx.strokeStyle='#FFD700';ctx.lineWidth=4;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(s*.5,s*.55);ctx.lineTo(s*.5,s*.85);ctx.stroke();
  ctx.beginPath();ctx.moveTo(s*.5,s*.7);ctx.lineTo(s*.65,s*.7);ctx.stroke();
  ctx.beginPath();ctx.moveTo(s*.5,s*.8);ctx.lineTo(s*.62,s*.8);ctx.stroke();
  ctx.beginPath();ctx.arc(s*.5,s*.38,s*.18,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='rgba(255,215,0,0.3)';ctx.fill();
  ctx.fillStyle='#f5f5f5';
  ctx.beginPath();ctx.arc(s*.5,s*.38,s*.07,0,Math.PI*2);ctx.fill();
  return c;
}

// ── Exit door ────────────────────────────────
function drawExitTex(size, locked){
  const c=document.createElement('canvas');
  const W=size, H=Math.round(size*1.35);
  c.width=W; c.height=H;
  const ctx=c.getContext('2d');

  // Side face
  ctx.fillStyle=locked?'#444':'#0d5c2a';
  ctx.fillRect(2, size, W-4, H-size-2);
  ctx.fillStyle=locked?'#666':'#22aa55';
  ctx.fillRect(2, size-1, W-4, 2);

  // Front face
  ctx.fillStyle=locked?'#666':'#1a7a3a';ctx.fillRect(W*.1,4,W*.8,size*.9);
  ctx.fillStyle=locked?'#999':'#22aa55';ctx.fillRect(W*.15,8,W*.7,size*.75);
  ctx.fillStyle='#fff';ctx.font=`bold ${size*.3}px Arial`;
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(locked?'🔒':'↑',W/2,size*.4);
  ctx.fillStyle='#fff';ctx.font=`bold ${size*.13}px Courier New`;
  ctx.fillText('EXIT',W/2,size*.76);
  ctx.strokeStyle=locked?'#888':'#00ff88';ctx.lineWidth=2.5;
  ctx.strokeRect(W*.1,4,W*.8,size*.9);
  return c;
}

// ── Gun ──────────────────────────────────────
function drawGun(size){
  const c=document.createElement('canvas');c.width=size*2;c.height=size;
  const ctx=c.getContext('2d');const w=size*2,h=size;
  ctx.fillStyle='#333';
  ctx.beginPath();
  ctx.moveTo(w*.15,h*.35);ctx.lineTo(w*.75,h*.35);
  ctx.lineTo(w*.75,h*.55);ctx.lineTo(w*.85,h*.55);
  ctx.lineTo(w*.85,h*.45);ctx.lineTo(w*.92,h*.45);
  ctx.lineTo(w*.92,h*.55);ctx.lineTo(w*.75,h*.55);
  ctx.lineTo(w*.75,h*.72);ctx.lineTo(w*.45,h*.72);
  ctx.lineTo(w*.35,h*.62);ctx.lineTo(w*.15,h*.62);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#555';ctx.fillRect(w*.75,h*.38,w*.2,h*.14);
  ctx.strokeStyle='#222';ctx.lineWidth=1;
  for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(w*.3+i*8,h*.55);ctx.lineTo(w*.25+i*8,h*.70);ctx.stroke();}
  ctx.strokeStyle='#444';ctx.lineWidth=2;ctx.lineCap='round';
  ctx.beginPath();ctx.arc(w*.38,h*.56,h*.12,-0.3,Math.PI+0.3);ctx.stroke();
  ctx.strokeStyle='#666';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(w*.38,h*.46);ctx.lineTo(w*.38,h*.58);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(w*.15,h*.37,w*.55,h*.06);
  return c;
}

// ── Train ────────────────────────────────────
function drawTrainGfx(gfx, numCars, TRAIN_X, TRAIN_Y, CAR_W, CAR_H, CAR_GAP, LOCO_W){
  const x=TRAIN_X, y=TRAIN_Y;
  const totalW=numCars*(CAR_W+CAR_GAP)+LOCO_W+CAR_GAP;
  gfx.lineStyle(3,0x999999,1);
  gfx.lineBetween(x,y+CAR_H+18,x+totalW+20,y+CAR_H+18);
  gfx.lineBetween(x,y+CAR_H+24,x+totalW+20,y+CAR_H+24);
  gfx.lineStyle(4,0xaa8855,1);
  for(let i=0;i<=Math.ceil((totalW+20)/18);i++)
    gfx.lineBetween(x+10+i*18,y+CAR_H+15,x+10+i*18,y+CAR_H+27);
  for(let i=0;i<numCars;i++){
    const cx=x+8+i*(CAR_W+CAR_GAP), cy=y+10;
    // Side face (oblique depth)
    gfx.fillStyle(0x2255aa,1); gfx.fillRect(cx,cy+CAR_H,CAR_W,10);
    gfx.fillStyle(0x4488cc,1); gfx.fillRoundedRect(cx,cy,CAR_W,CAR_H,8);
    gfx.fillStyle(0x66aaee,1); gfx.fillRect(cx+8,cy+8,CAR_W-16,16);
    gfx.fillStyle(0xddeeff,1);
    gfx.fillRoundedRect(cx+10,cy+9,18,13,2);
    gfx.fillRoundedRect(cx+34,cy+9,18,13,2);
    gfx.fillRoundedRect(cx+58,cy+9,18,13,2);
    gfx.fillStyle(0x336699,1); gfx.fillRect(cx+CAR_W-22,cy,22,CAR_H);
    gfx.lineStyle(1.5,0x88bbdd,1); gfx.strokeRect(cx+CAR_W-22,cy,22,CAR_H);
    gfx.fillStyle(0xffcc44,1); gfx.fillRect(cx+CAR_W-20,cy+CAR_H/2-5,3,10);
    gfx.fillStyle(0x225588,1); gfx.fillRect(cx,cy+CAR_H-8,CAR_W,8);
    gfx.fillStyle(0x333333,1);
    gfx.fillCircle(cx+18,y+CAR_H+21,9); gfx.fillCircle(cx+CAR_W-18,y+CAR_H+21,9);
    gfx.fillStyle(0x888888,1);
    gfx.fillCircle(cx+18,y+CAR_H+21,5); gfx.fillCircle(cx+CAR_W-18,y+CAR_H+21,5);
  }
  const lx=x+8+numCars*(CAR_W+CAR_GAP)+CAR_GAP;
  gfx.fillStyle(0x1a3a77,1); gfx.fillRect(lx,y+10+CAR_H,LOCO_W,10);
  gfx.fillStyle(0x2255aa,1); gfx.fillRoundedRect(lx,y+10,LOCO_W,CAR_H,6);
  gfx.fillStyle(0x1a3a77,1); gfx.fillRect(lx,y+CAR_H-10,LOCO_W,10);
  gfx.fillStyle(0x333333,1); gfx.fillRect(lx+LOCO_W/2-5,y+2,10,10); gfx.fillRect(lx+LOCO_W/2-8,y,16,5);
  gfx.fillStyle(0xcccccc,.6); gfx.fillCircle(lx+LOCO_W/2,y-3,5); gfx.fillCircle(lx+LOCO_W/2+6,y-7,4);
  gfx.fillStyle(0xddeeff,1);
  gfx.fillRoundedRect(lx+8,y+14,16,12,2); gfx.fillRoundedRect(lx+30,y+14,16,12,2);
  gfx.fillStyle(0x333333,1);
  gfx.fillCircle(lx+16,y+CAR_H+21,9); gfx.fillCircle(lx+LOCO_W-14,y+CAR_H+21,9);
  gfx.fillStyle(0x888888,1);
  gfx.fillCircle(lx+16,y+CAR_H+21,5); gfx.fillCircle(lx+LOCO_W-14,y+CAR_H+21,5);
  gfx.lineStyle(3,0x555555,1); gfx.lineBetween(lx+16,y+CAR_H+21,lx+LOCO_W-14,y+CAR_H+21);
}
