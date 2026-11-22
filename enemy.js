// ═══════════════════════════════════════════════
// enemy.js — zombies, train, hunt/safe phases, being caught, shooting
// Extends GameScene (scene.js) via mixin.
// ═══════════════════════════════════════════════

// ── Enemy / train constants ──
const ENEMY_SPEED=110;
const FIRST_SAFE=5, SAFE_DURATION=30, HUNT_DURATION=15, COUNTDOWN_SECS=5;
const MAX_TRAIN_CARS=5;
const TRAIN_X=10, TRAIN_Y=10;
const CAR_W=108, CAR_H=52, CAR_GAP=4, LOCO_W=62;
function doorX(i){return TRAIN_X+8+i*(CAR_W+CAR_GAP)+CAR_W-22;}
const DOOR_Y=TRAIN_Y+10;

Object.assign(GameScene.prototype,{
  _preloadEnemy(){
    this.textures.addCanvas('enemy',   drawZombie(48));
  },

  // Train graphics + enemy group + colliders. Called from create() after player & walls exist.
  _initEnemies(){
    this._numCars=1; this._tg=this.add.graphics().setDepth(1);
    drawTrainGfx(this._tg,this._numCars,TRAIN_X,TRAIN_Y,CAR_W,CAR_H,CAR_GAP,LOCO_W);
    this.enemies=this.physics.add.group();
    this._zCount=1;this._spawnZ(0);
    this.physics.add.collider(this.enemies,this.walls);
    this._setCatchEnabled(true);
  },

  // Player↔enemy overlap (disabled while the cat is mid-jump)
  _setCatchEnabled(on){
    if(on) this._zOvlp=this.physics.add.overlap(this.player,this.enemies,this._caught_cb,null,this);
    else   this.physics.world.removeCollider(this._zOvlp);
  },

  // Safe / pre-hunt / hunt timer state machine
  _updatePhase(dt){
    this._pt-=dt;this._hudUpdate();

    if(this._state==='safe'&&this._pt<=0){this._enterPreHunt();}
    else if(this._state==='pre_hunt'){
      const r=Math.ceil(Math.max(0,this._pt));
      this._showOv(`<span style="font-size:86px;color:#e63946;">${r}</span>`,'殭屍即將衝出！');
      if(this._pt<=0)this._enterHunt();
    } else if(this._state==='hunt'&&this._pt<=0){this._enterSafe();}
  },

  _updateVirtualShoot(){
    // Virtual shoot (nearest enemy)
    if(_vbShoot&&!this._vbShootWas){
      let tx=this.player.x+100,ty=this.player.y,minD=Infinity;
      this.enemies.getChildren().forEach(z=>{
        const d=Phaser.Math.Distance.Between(this.player.x,this.player.y,z.x,z.y);
        if(d<minD){minD=d;tx=z.x;ty=z.y;}
      });
      this._shootAt(tx,ty);
    }
    this._vbShootWas=_vbShoot;
  },

  _updateEnemies(px,py){
    // Enemy AI
    this.enemies.getChildren().forEach(z=>{
      if(z._ret){
        const hx=z._hx||doorX(0),hy=z._hy||DOOR_Y+20;
        const d=Phaser.Math.Distance.Between(z.x,z.y,hx,hy);
        if(d>5){const a=Phaser.Math.Angle.Between(z.x,z.y,hx,hy);z.setVelocity(Math.cos(a)*ENEMY_SPEED*.8,Math.sin(a)*ENEMY_SPEED*.8);z.setFlipX(Math.cos(a)<0);}
        else{z.setVelocity(0,0);z.setPosition(hx,hy);}
      } else if(this._state==='hunt'){
        if(!this._hiding){const a=Phaser.Math.Angle.Between(z.x,z.y,px,py);z.setVelocity(Math.cos(a)*ENEMY_SPEED,Math.sin(a)*ENEMY_SPEED);z.setFlipX(Math.cos(a)<0);}
        else{z.setVelocity(z.body.velocity.x*.92,z.body.velocity.y*.92);}
      } else if(this._state==='pre_hunt'){z.setVelocity(z.body.velocity.x*.8,z.body.velocity.y*.8);}
      else{z.setVelocity(z.body.velocity.x*.9,z.body.velocity.y*.9);}
    });
  },

  _begin(){
    if(this._state!=='waiting')return;
    this._startTime=Date.now();
    this._enterSafe();
  },

  _enterSafe(){
    this._state='safe';this._pt=this._firstSafe?FIRST_SAFE:SAFE_DURATION;
    this._firstSafe=false;this._recallZ();this._hideOv();this._hudUpdate();
  },

  _enterPreHunt(){
    this._state='pre_hunt';this._pt=COUNTDOWN_SECS;
    if(this._numCars<MAX_TRAIN_CARS){
      this._numCars++;this._tg.clear();
      drawTrainGfx(this._tg,this._numCars,TRAIN_X,TRAIN_Y,CAR_W,CAR_H,CAR_GAP,LOCO_W);
    }
    this._zCount++;this._spawnZ(this._numCars-1);
    this.enemies.getChildren().forEach(z=>{z._ret=false;});
    this._hudUpdate();
  },

  _enterHunt(){this._state='hunt';this._pt=HUNT_DURATION;this._hideOv();this._hudUpdate();},

  _spawnZ(ci){
    const z=this.enemies.create(doorX(Math.min(ci,this._numCars-1)),DOOR_Y+20,'enemy');
    z.setDisplaySize(40,67).setCollideWorldBounds(true).setDepth(5);
    z.body.setSize(18,18);z.body.setOffset(15,15);
    z.body.setMaxVelocity(ENEMY_SPEED,ENEMY_SPEED);
    z._ret=false;z._ci=ci;return z;
  },

  _recallZ(){
    this.enemies.getChildren().forEach((z,i)=>{
      z._ret=true;z._hx=doorX(Math.min(z._ci||0,this._numCars-1));z._hy=DOOR_Y+20+i*4;
    });
  },

  _caught_cb(){
    if(this._hiding||this._caught||this._won||this._state!=='hunt')return;
    this._caught=true;this.physics.pause();
    this._showOv('😱','被抓了！<br><br><button onclick="resetGame()" style="margin-top:10px;padding:7px 18px;background:#c0392b;color:#fff;border:none;border-radius:8px;font-family:\'Courier New\',monospace;font-size:14px;cursor:pointer;">🔄 重置</button>');
    this._ov.style.pointerEvents='auto';
  },

  _shootAt(wx,wy){
    if(!this._hasGun||this._gunUsed||this._hiding)return;
    this._gunUsed=true;this._itemHUD();
    const px=this.player.x,py=this.player.y;
    const ang=Math.atan2(wy-py,wx-px),spd=700,dist=900;
    const bul=this.add.graphics().setDepth(8);
    bul.fillStyle(0xffee33,1);bul.fillCircle(0,0,5);bul.x=px;bul.y=py;
    const fl=this.add.graphics().setDepth(9);
    fl.fillStyle(0xffffff,1);fl.fillCircle(px,py,11);
    this.time.delayedCall(55,()=>fl.destroy());
    this.tweens.add({targets:bul,x:px+Math.cos(ang)*dist,y:py+Math.sin(ang)*dist,duration:(dist/spd)*1000,
      onUpdate:()=>{
        this.enemies.getChildren().forEach(z=>{
          if(!z.active)return;
          if(Phaser.Math.Distance.Between(bul.x,bul.y,z.x,z.y)<22){
            z._ret=true;z._hx=doorX(Math.min(z._ci||0,this._numCars-1));z._hy=DOOR_Y+20;
            const h=this.add.text(z.x,z.y-18,'💥',{fontSize:'22px'}).setOrigin(0.5).setDepth(8);
            this.tweens.add({targets:h,y:z.y-50,alpha:0,duration:700,onComplete:()=>h.destroy()});
            if(bul.active)bul.destroy();
          }
        });
      },
      onComplete:()=>{if(bul.active)bul.destroy();}
    });
  }
});
