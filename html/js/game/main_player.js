function mainPlayer(x,y,game) {
  this.game = game;

  this.debug_flag = false;

  this.x = 64;
  this.y = 32*6;

  this.d = "u"; // "d", "l", "r", and combinations?

  this.sword = false;
  this.walking = false;
  this.bomb = false;
  this.bow = false;

  this.bowItem = true;
  this.bowSword = true;
  this.bowBomb = true;


  this.player_bbox = [[0,0],[0,0]];
  this.sword_bbox = [[0,0],[0,0]];

  this.keyFrameRow = 0;
  this.keyFrame = 0;
  this.keyFrameN = 4;
  this.updateFrameN = 5;
  this.updateFrameDelay = 0;

  this.swordType = "eagle";

  this.speaking = false;
  this.text = "";

  this.displayq = [];
  this.walkq = [];
  //this.walkQueue = 0;
  this.walkFlag = {
    "left" : false, "right" : false, "up":false, "down":false,
    "leftq":0, "rightq":0, "upq":0, "downq":0
  };
  this.walkKey = ["up", "right", "down", "left"];
  this.walkLookup = { "up" : 0, "right" : 1, "down":2, "left":3 };

  //this.walkTransitionDelay = 2;
  this.walkTransitionDelay = 6;
  //this.walkTransitionDelay = 10;

  this.walkDisplayQ = [];

  // for 64
  //this.dx = 12;
  //this.dy = 12;

  // for 32
  //this.dx = 8;
  //this.dy = 8;
  //this.dx = 6;
  //this.dy = 6;

  //this.dx = 8;
  //this.dy = 8;

  this.dx = g_GRIDSIZE/8;
  this.dy = g_GRIDSIZE/8;


  this.img_w = 16;
  this.img_h = 16;
  this.img_x = 0;
  this.img_y = 0;

  //this.world_w = 64;
  //this.world_h = 64;

  //this.world_w = 32;
  //this.world_h = 32;

  this.world_w = g_GRIDSIZE;
  this.world_h = g_GRIDSIZE;
  this.size = g_GRIDSIZE;


  //this.swordReady = true;
  //this.bombReady = true;
  this.bowReady = true;

  this.swordKeyState = "idle"; // "fire", "warm"
  this.bombKeyState = "idle"; // "fire", "warm"
  this.bowKeyState = "idle"; // "fire", "warm"

  this.swordKeyEvent = false;
  //this.swordDelayN = 3;
  this.swordDelayN = 8;
  this.swordDelay = 0;

  this.bombEvent = false;
  this.bombDelay = 0;
  this.bombDelayN = 10;
  this.bombKeyUp = true;;

  // 0 is right.  past StepN/2 is below
  // so ccw
  //
  this.bowStep = 0;
  //this.bowStepN = 32;
  //this.bowStepN = 16;
  this.bowStepN = 32;

  this.bowActive = false;
  this.bowEvent = "idle";
  this.bowTurnDelay = 0;
  this.bowTurnDelayN = 1;


  this.displayq.push({ "d":"down", "t":-1 });
  this.walkq.push({ "d":"down", "t":-1 });

  this.inputEvent = {};
  this.state = "idle";

  //SWORD STATE
  this.swordKeyUp = true;

  this.swordJitterX = 0;
  this.swordJitterY = 0;


  this.intent = { "type":"idle" };

}

mainPlayer.prototype.init = function(x, y, d) {
  this.x = x;
  this.y = y;
  this.d = d;
}

mainPlayer.prototype.actualDirection = function() {
  var n = this.displayq.length;
  return this.displayq[n-1].d;
}


mainPlayer.prototype.resetDisplayDirection = function(d) {
  this.displayq = [{"d":d, "t": this.walkTransitionDelay }];
  //this.displayq = [{"d":d, "t":5 }];
}

mainPlayer.prototype.addToWalkq = function(d) {
  for (var i=0; i<this.walkq.length; i++) {
    if (this.walkq.d == d) { return; }
  }
  this.walkq.push({ "d":d, "t":5 });
}


mainPlayer.prototype.alignBowToDirection = function() {
  var curdir = this.currentDisplayDirection();
  //var lookup = { "right":0, "up":this.bowStepN/4, "left":this.bowStepN/2, "down":Math.floor(3*this.bowStepN/4) };
  //var lookup = { "right":9, "up":13, "left":1, "down":5 };
  //var lookup = { "right":8, "up":12, "left":0, "down":4 };
  //var lookup = { "right":16, "up":24, "left":0, "down":8 };
  var lookup = { "right":8, "up":0, "left":0, "down":8 };
  var dest = lookup[curdir];

  if (dest == this.bowStep) { return; }

  var z = this.bowStep;
  if (Math.abs(this.bowStep - dest) >= (this.bowStepN/2)) {

    if (this.bowStep < (this.bowStepN/2)) {
      z = this.bowStepN - this.bowStep;
    } else {
      z = this.bowStep - this.bowStepN;
    }
  }

  if ((dest-z) > 0) {
    //this.bowStep ++;
    this.bowStep += 2 ;
  } else {
    //this.bowStep --;
    this.bowStep -= 2 ;
  }

  if (this.bowStep<0) { this.bowStep += this.bowStepN; }
  this.bowStep = this.bowStep % this.bowStepN;
}

mainPlayer.prototype.setBowToDirection = function() {
  var curdir = this.actualDirection();
  //var lookup = { "right":0, "up":8, "left":16, "down":24 };
  //var lookup = { "right":16, "up":24, "left":0, "down":8 };
  var lookup = { "right":8, "up":0, "left":0, "down":8 };
  var x = lookup[curdir];
  this.bowStep = x;
}

mainPlayer.prototype.displayDirectionTick = function() {
  var tf = false;
  if (this.displayq.length>1) {
    this.displayq[0].t--;
    if (this.displayq[0].t<0) { this.displayq.shift(); }
    tf = true;
  }
  return tf;
}

mainPlayer.prototype.updateDisplayDirection = function() {
  var curdir = this.currentWalkDirection();

  if (curdir == "stop") {
    this.displayDirectionTick();
    return false;
  }

  var tf = false;

  var n = this.displayq.length;
  if (curdir != this.displayq[n-1].d) {

    var old_dir = this.displayq[n-1].d;
    this.displayq = [];

    var dl = this.walkTransitionDelay;

    // 'up' just looks better to me, don't know why...
    //
    if ((old_dir == "left") && (curdir == "right")) {
      //this.displayq.push({ "d":"up", "t":dl });
      this.displayq.push({ "d":"down", "t":dl });
    }
    else if ((old_dir == "right") && (curdir == "left")) {
      //this.displayq.push({ "d":"up", "t":dl });
      this.displayq.push({ "d":"down", "t":dl });
    }
    else if ((old_dir == "up") && (curdir == "down")) {
      this.displayq.push({ "d":"right", "t":dl });
    }
    else if ((old_dir == "down") && (curdir == "up")) {
      this.displayq.push({ "d":"left", "t":dl });
    }
    this.displayq.push({ "d":curdir, "t":-1 });

    tf = true;
  }

  if (this.displayDirectionTick()) { return true; }
  return tf;
}

mainPlayer.prototype.updateWalkingFrame = function() {
  if (this.updateFrameDelay==0) {
    this.keyFrame++;
    if (this.keyFrame >= this.keyFrameN) { this.keyFrame=0; }
    this.updateFrameDelay = this.updateFrameN-1;
  } else {
    this.updateFrameDelay--;
  }
}

mainPlayer.prototype.prepBomb = function() {
  console.log("bomb throw!");
  this.bomb = true;
}

mainPlayer.prototype.dir_xy = function() {
  var di = this.currentDisplayDirection();
  var bxy = [0, 0];
  if (di == "up") { bxy = [0, -1]; }
  else if (di == "left") { bxy = [-1, 0]; }
  else if (di == "right") { bxy = [1, 0]; }
  else if (di == "down") { bxy = [0, 1]; }
  return bxy;
}

mainPlayer.prototype.actual_dir_xy = function() {
  var di = this.actualDirection();
  var bxy = [0, 0];
  if (di == "up") { bxy = [0, -1]; }
  else if (di == "left") { bxy = [-1, 0]; }
  else if (di == "right") { bxy = [1, 0]; }
  else if (di == "down") { bxy = [0, 1]; }
  return bxy;
}

mainPlayer.prototype.throwBomb = function() {
  console.log("bomb throw!");
  this.bomb = false;
  this.bombDelay = this.bombDelayN;

  var di = this.currentDisplayDirection();
  var bxy = this.dir_xy();

  this.intent  = { "type" : "throwBomb",
    "x" : this.x,
    "y" : this.y,
    "dx" : bxy[0],
    "dy" : bxy[1],
    "d" : di };
}

mainPlayer.prototype.debugEvent = function() {
  var di = this.currentDisplayDirection();
  var bxy = this.dir_xy();

  this.intent = { "type" : "particleFirefly",
    "x" : this.x,
    "y" : this.y,
    "dx" : bxy[0],
    "dy" : bxy[1],
    "d" : di };
}

// walking, bow and sword are mutually exclusive
// bomb is a modifier to walking.
//
mainPlayer.prototype.update = function() {
  g_painter.dirty_flag = true;

  this.playerBBox();

  for (var ev in this.inputEvent) {
    //if (!this.inputEvent[ev]) { continue; }

    //DEBUG
    if (ev == "bowKeyDown") {
      this.bow = true;
      continue;
    } else if (ev == "bowKeyUp") {
      this.bow = false;
      continue;
    }

    if (ev == "debugKeyDown") {
      this.debugEvent();
      continue;
    }

    if (ev == "swordKeyDown") {

      if (this.bomb) {
        this.throwBomb();
        continue;
      }

      if ((this.state == "swordAttack") ||
          (this.state == "bow")) { continue; }
      if (!this.swordReady()) { continue; }
      if (!this.swordKeyUp) { continue; }

      console.log("attack!");

      this.swordAttack();

      //var curdir = this.currentWalkDirection();
      var curdir = this.actualDirection();
      this.resetDisplayDirection(curdir);
      this.setBowToDirection();

      continue;
    }

    if (ev == "swordKeyUp") {
      this.swordKeyUp = true;
      continue;
    }

    if (ev == "bombKeyDown") {

      if (this.bomb) {
        this.throwBomb();
        continue;
      }

      if ((this.state == "swordAttack") ||
          (this.state == "bow")) { continue; }
      if (!this.bombReady()) { continue; }
      if (!this.bombKeyUp) { continue; }

      console.log("bomb!");

      this.prepBomb();
      continue;
    }

    if (ev == "bombKeyUp") {

      continue;
    }

    if (ev == "upKeyDown") {
      if (!this.walkFlag["up"]) { this.addToWalkq("up"); }
      this.walkFlag["up"] = true;
      continue;
    }
    if (ev == "upKeyUp")   {
      this.walkFlag["up"] = false;
      continue;
    }

    if (ev == "downKeyDown") {
      if (!this.walkFlag["down"]) { this.addToWalkq("down"); }
      this.walkFlag["down"] = true;
      continue;
    }
    if (ev == "downKeyUp")   {
      this.walkFlag["down"] = false;
      continue;
    }

    if (ev == "leftKeyDown") {
      if (!this.walkFlag["left"]) { this.addToWalkq("left"); }
      this.walkFlag["left"] = true;
      continue;
    }
    if (ev == "leftKeyUp")   {
      this.walkFlag["left"] = false;
      continue;
    }

    if (ev == "rightKeyDown") {
      if (!this.walkFlag["right"]) { this.addToWalkq("right"); }
      this.walkFlag["right"] = true;
      continue;
    }
    if (ev == "rightKeyUp")   {
      this.walkFlag["right"] = false;
      continue;
    }


    console.log("ev", ev);
  }

  //console.log("state:", this.state);

  this.inputEvent = {};

  //if (this.state!="idle") { console.log(this.state); }

  // initial processing of input is done.
  //

  if (this.bombDelay > 0) { this.bombDelay--; }

  if (this.state == "idle") {

    if (this.walkFlag["up"] || this.walkFlag["down"] || this.walkFlag["left"] || this.walkFlag["right"]) {
      this.state = "walking";
      this._updateWalkQueue();
      this.updateWalkingFrame();
      //this.alignBowToDirection();
    }


    if (this.updateDisplayDirection()) {
      this.alignBowToDirection();
    }
    return;
  }

  if (this.state == "walking") {

    var xy = this.dxdy();
    //this.x += xy[0];
    //this.y += xy[1];

    // Intent
    this.intent = { "type" : "walking",
      "prev" : { "x" : this.x, "y": this.y },
      "next" : { "x" : this.x+xy[0], "y" : this.y+xy[1] }
    };

    this.updateWalkingFrame();

    if (this.walkFlag["up"] || this.walkFlag["down"] || this.walkFlag["left"] || this.walkFlag["right"]) {
      this.state = "walking";
      this._updateWalkQueue();
    } else {
      this.state = "idle";
    }

    this.updateDisplayDirection();

    if (this.bowTurnDelay==0) {
      this.alignBowToDirection();
      this.bowTurnDelay = this.bowTurnDelayN;
    }
    this.bowTurnDelay--;

    return;
  }

  if (this.state == "swordAttack") {
    if (this.swordDelay==0) {
      this.swordRetract();

      if (this.walkFlag["up"] || this.walkFlag["down"] || this.walkFlag["left"] || this.walkFlag["right"]) {
        this.state = "walking";
        this._updateWalkQueue();

      } else {
        this.state = "idle";
      }

    } else {
      this.swordDelay--;
    }

    this.setBowToDirection();

    return;
  }

}

mainPlayer.prototype.swordAttack = function() {

  //DEBUG
  console.log("sword attack");

  this.sword = true;
  this.swordDelay = this.swordDelayN-1;
  this.state = "swordAttack";

  this.swordKeyUp = false;

  var jx = 2;
  var jy = 2;

  var curdir = this.actualDirection();

  if        (curdir == "up") {
    this.swordJitterX = Math.floor((Math.random()-0.15)*jx);
    this.swordJitterY = Math.floor((Math.random()+1)*jy - 1);
  } else if (curdir == "down") {
    this.swordJitterX = Math.floor((Math.random()-0.25)*jx);
    this.swordJitterY = Math.floor((Math.random()-1)*jy + 1);
  } else if (curdir == "right") {
    this.swordJitterX = Math.floor((Math.random()-1)*jx + 1);
    this.swordJitterY = Math.floor((Math.random()-0.25)*jy);
  } else if (curdir == "left") {
    this.swordJitterX = Math.floor((Math.random()+1)*jx - 1);
    this.swordJitterY = Math.floor((Math.random()-0.25)*jy);
  }

  var di = this.currentDisplayDirection();
  var jitxy = this.sword_dxdy();
  var bxy = this.dir_xy();

  this.sword_bbox = this.swordBBox(jitxy[0], jitxy[1]);

  this.intent  = { "type" : "swordAttack",
    "x" : this.x + jitxy[0],
    "y" : this.y + jitxy[1],
    "dx" : bxy[0],
    "dy" : bxy[1],
    "d" : di };


  // swing sfx
  //
  var n = g_sfx["sword-swing"].length;
  var x = Math.floor(Math.random()*n);
  g_sfx["sword-swing"][x].play();
}

mainPlayer.prototype.playerBBox= function() {
  var bbox = this.player_bbox;

  bbox[0][0] = this.x;
  bbox[0][1] = this.y;
  bbox[1][0] = this.x + this.size-1;
  bbox[1][1] = this.y + this.size-1;

  this.player_bbox = bbox;

  return bbox;
}

mainPlayer.prototype.swordBBox= function(dx, dy) {

  var sword_w2 = 1;
  var sword_h2 = 12;

  var curdir = this.actualDirection();
  var bbox = [[0,0],[0,0]];
  var ofx  = this.world_w/2;
  var ofy  = this.world_h/2;

  if        (curdir == "up") {

    bbox[0][0] = this.x + dx - sword_w2;
    bbox[0][1] = this.y + dy - sword_h2*2;
    bbox[1][0] = this.x + dx + sword_w2;
    bbox[1][1] = this.y + dy ;


  } else if (curdir == "down") {

    bbox[0][0] = this.x + dx - sword_w2;
    bbox[0][1] = this.y + dy ;
    bbox[1][0] = this.x + dx + sword_w2;
    bbox[1][1] = this.y + dy + sword_h2*2;

  } else if (curdir == "right") {

    bbox[0][0] = this.x + dx;
    bbox[0][1] = this.y + dy - sword_w2;
    bbox[1][0] = this.x + dx + sword_h2*2;
    bbox[1][1] = this.y + dy + sword_w2;

  } else if (curdir == "left") {

    bbox[0][0] = this.x + dx - sword_h2*2;
    bbox[0][1] = this.y + dy - sword_w2;
    bbox[1][0] = this.x + dx ;
    bbox[1][1] = this.y + dy + sword_w2;

  }

  bbox[0][0] += ofx;
  bbox[0][1] += ofy;
  bbox[1][0] += ofx;
  bbox[1][1] += ofy;

  return bbox;
}


mainPlayer.prototype.swordRetract = function() {
  this.sword = false;
}

mainPlayer.prototype.bombPrepare = function() {
  console.log("bomb prepare");
  this.bomb = true;
}

mainPlayer.prototype.bombThrow = function() {
  console.log("bomb throw");
  this.bomb = false;
}

mainPlayer.prototype.keyDownTransition = function(s) {
  if (s == "idle") { return "fire"; }
  if (s == "fire") { return "warm"; }
  if (s == "warm") { return "warm"; }
  return "fire";
}

// keyDown events only set flags that will be polled
// by the 'update' function.  No state other than
// setting the flags should happen here.
//
mainPlayer.prototype.keyDown = function(code) {

  // 'z', bomb
  //
  if (code == 90) { this.inputEvent["bombKeyDown"] = true; }

  // 'x', sword
  //
  if (code == 88) { this.inputEvent["swordKeyDown"] = true; }

  // 'c', bow
  //
  if (code == 67) { this.inputEvent["bowKeyDown"] = true; }

  // left
  //
  if (code==37) { this.inputEvent["leftKeyDown"] = true; }

  // up
  //
  else if (code == 38) { this.inputEvent["upKeyDown"] = true; }

  // right
  //
  else if (code == 39) { this.inputEvent["rightKeyDown"] = true; }

  // down
  //
  else if (code == 40) { this.inputEvent["downKeyDown"] = true; } 

  // y
  //
  else if (code == 89) { this.inputEvent["debugKeyDown"] = true; } 

}

// keyUp events only set flags that will be polled
// by the 'update' function.  No state other than
// setting the flags should happen here.
//
mainPlayer.prototype.keyUp = function(code) {

  // 'x', sword
  //
  if (code == 88) { this.inputEvent["swordKeyUp"] = true; }

  // 'z', bomb
  //
  if (code == 90) { this.inputEvent["bombKeyUp"] = true; }

  // 'c', bow
  //
  if (code == 67) { this.inputEvent["bowKeyUp"] = true; }

  // left
  //
  if (code==37) { this.inputEvent["leftKeyUp"] = true; }

  // up
  //
  else if (code == 38) { this.inputEvent["upKeyUp"] = true; }

  // right
  //
  else if (code == 39) { this.inputEvent["rightKeyUp"] = true; }

  // down
  //
  else if (code == 40) { this.inputEvent["downKeyUp"] = true; }

}


mainPlayer.prototype._updateWalkQueue= function() {
  var newq = [];
  for (var i=0; i<this.walkq.length; i++) {
    var key = this.walkq[i].d;
    if (this.walkFlag[key]) { newq.push(this.walkq[i]); }
  }
  this.walkq = newq;
}


// returns text direction
//
mainPlayer.prototype.currentWalkDirection = function() {
  var kr = -1;
  var n = this.walkq.length-1;
  if (n>=0) {
    kr = this.walkLookup[this.walkq[n].d];
  }
  if (kr<0) { return "stop"; }

  return this.walkKey[kr];
}

// returns text direction
//
mainPlayer.prototype.dxdy = function() {
  var dx = this.dx;
  var dy = this.dy;
  var xy = { "up":[0,-dy], "right":[dx,0], "down":[0,dy], "left":[-dx,0], "stop":[0,0]  };
  var d = this.currentWalkDirection();

  var r = xy[d];

  if ((d=="right") || (d=="left")) {
    var gridsize = Math.floor((this.world_h/2) + 0.5);
    var g2 = Math.floor((gridsize/2)+0.5);
    var ofy = this.y % gridsize;
    ofy = (ofy + gridsize)%gridsize;

    if (ofy<g2) {
      r[1] = -ofy;
    } else {
      r[1] = gridsize-ofy;
    }

  } else if ((d=="up") || (d=="down")) {
    var gridsize = Math.floor((this.world_w/2) + 0.5);
    var g2 = Math.floor((gridsize/2)+0.5);
    var ofx = this.x % gridsize;
    ofx = (ofx + gridsize)%gridsize;


    if (ofx<g2) {
      r[0] = -ofx;
    } else {
      r[0] = gridsize-ofx;
    }

  }

  //console.log(d, r);

  return r;
  //return xy[d];
}

// returns text direction
//
mainPlayer.prototype.sword_dxdy = function() {
  var dx = this.swordJitterX;
  var dy = this.swordJitterY;

  return [dx,dy];

  var xy = { "up":[dx,-dy], "right":[dx,dy], "down":[dx,dy], "left":[-dx,dy], "stop":[0,0]  };
  var d = this.currentWalkDirection();
  return xy[d];
}

mainPlayer.prototype.stopWalking = function() {
  this.walking = false;
}

mainPlayer.prototype.swordReady = function() {
  if (this.swordDelay==0) {return true; }
  return false;
}

mainPlayer.prototype.swordUpdate = function() {
  if (this.swordDelay>0) {
    this.swordDelay--;
  } else {
    this.swordDelay=0;
  }
}

mainPlayer.prototype.bombReady = function() {
  if (this.bombDelay==0) { return true; }
  return false;
}

mainPlayer.prototype.currentDisplayDirection = function() {
  var a = "up";
  if (this.displayq.length>0) { a = this.displayq[0].d; }
  return a;
}

mainPlayer.prototype.draw = function() {

  var kf = this.keyFrame;

  var d = this.currentDisplayDirection();
  var kr = this.walkLookup[d];

  var imgx = kf*16;
  var imgy = kr*16;

  if (this.sword) {
    imgy = 4*16;
    imgx = kr*16;
  }

  if (!this.bow) {
    //g_imgcache.draw_s("noether", imgx, imgy, 16, 16, this.x, this.y, this.world_w, this.world_h);
  }

  var ff = 1.3;

  if ((this.state == "idle") || (this.state == "walking")) {

    //if (d == "up") {
    if (d == "wat") {
      g_imgcache.draw_s("noether", imgx, imgy, 16, 16, this.x, this.y, this.world_w, this.world_h);

      //var bow_imx = this.bowStep*2*16;
      var bow_imx = this.bowStep*16;
      //g_imgcache.draw_s("rotbow", bow_imx, 0, 16, 16, this.x, this.y, ff*this.world_w, ff*this.world_h);
    } else {
      var bow_jit_x = kf%2;
      var bow_jit_y = 0;

      if ((d == "right") || (d=="left")) {
        bow_jit_y = (kf%2)*3;
      }

      //var bow_imx = this.bowStep*2*16;
      var bow_imx = this.bowStep*16;
      //g_imgcache.draw_s("rotbow", bow_imx, 0, 16, 16, this.x, this.y + bow_jit_y, ff*this.world_w, ff*this.world_h);


      var imx = (this.bowStep % (this.bowStepN/4))*20;
      var imy = Math.floor(this.bowStep / 8)*20;

      // bow fudge
      var bf_x = -2;
      var bf_y = -3;

      //if ((d=="right") || (d=="left")) {
        if ((kf%2)==1) {
          bf_y++;
        }
      //}

      if (d=="up") {
        //g_imgcache.draw_s("rotstring", imx, imy, 20, 20, this.x+bf_x, this.y+bf_y, 20, 20);
        g_imgcache.draw_s("noether", imgx, imgy, 16, 16, this.x, this.y, this.world_w, this.world_h);
        g_imgcache.draw_s("rotbow", imx, imy, 20, 20, this.x+bf_x, this.y+bf_y, 20, 20);

        //g_imgcache.draw_s("rotbow_w_string", imx, imy, 20, 20, this.x+bf_x, this.y+bf_y, 20, 20);
      } else {
        //g_imgcache.draw_s("rotbow_w_string", imx, imy, 20, 20, this.x+bf_x, this.y+bf_y, 20, 20);

        g_imgcache.draw_s("rotbow", imx, imy, 20, 20, this.x+bf_x, this.y+bf_y, 20, 20);
        g_imgcache.draw_s("noether", imgx, imgy, 16, 16, this.x, this.y, this.world_w, this.world_h);
        //g_imgcache.draw_s("rotstring", imx, imy, 20, 20, this.x+bf_x, this.y+bf_y, 20, 20);
      }


    }

  }




  if (this.sword) {
    var a = 0.0;
    var ix = 0;
    var iy = 0;

    var ds = Math.floor((this.size/2)+0.5);

    var di = this.currentDisplayDirection();
    if (di == "up") {
      a = -Math.PI/2.0;
      iy=-ds;
    }
    else if (di == "right") {
      a = 0.0;
      ix = ds;
    }
    else if (di == "down") {
      a = Math.PI/2.0;
      iy = ds;
      //ix = 16;
    }
    else if (di == "left") {
      a = Math.PI;
      ix = -ds;
    }
    //ix *= 4;
    //iy *= 4;

    ix *= 2;
    iy *= 2;

    var s_dxy = this.sword_dxdy();
    ix += s_dxy[0];
    iy += s_dxy[1];

    // tree sword
    //g_imgcache.draw_s("item", 0, 0, 16, 16, this.x+ix, this.y+iy, this.world_w, this.world_h, a);

    // zephyr sword
    //g_imgcache.draw_s("item", 16, 0, 16, 16, this.x+ix, this.y+iy, this.world_w, this.world_h, a);

    // falcon sword
    //g_imgcache.draw_s("item", 32, 0, 16, 16, this.x+ix, this.y+iy, this.world_w, this.world_h, a);

    // eagle sword
    g_imgcache.draw_s("item", 48, 0, 16, 16, this.x+ix, this.y+iy, this.world_w, this.world_h, a);

    // hammer
    //g_imgcache.draw_s("item", 64 , 0, 16, 16, this.x+ix, this.y+iy, this.world_w, this.world_h, a);

    // amythist wand
    //g_imgcache.draw_s("item", 112, 0, 16, 16, this.x+ix, this.y+iy, this.world_w, this.world_h, a);

    // emerald wand
    //g_imgcache.draw_s("item", 0, 16, 16, 16, this.x+ix, this.y+iy, this.world_w, this.world_h, a);

    // ank wand
    //g_imgcache.draw_s("item", 16, 16, 16, 16, this.x+ix, this.y+iy, this.world_w, this.world_h, a);

    // bomb
    //ix = 0;
    //iy = -4*8;
    //a = 0;
    //g_imgcache.draw_s("item", 80, 16, 16, 16, this.x+ix, this.y+iy, this.world_w, this.world_h, a);


    if (this.bowItem) {

      var imx = ((this.bowStep+1) % (this.bowStepN/4))*20;
      var imy = Math.floor((this.bowStep+1) / 8)*20;

      var bf_x = -2;
      var bf_y = -2;

      if (di == "up") {
        g_imgcache.draw_s("noether", imgx, imgy, 16, 16, this.x, this.y, this.world_w, this.world_h);
        g_imgcache.draw_s("rotbow", imx, imy, 20, 20, this.x+bf_x, this.y+bf_y, 20, 20);
      } else {
        g_imgcache.draw_s("rotbow", imx, imy, 20, 20, this.x+bf_x, this.y+bf_y, 20, 20);
        g_imgcache.draw_s("noether", imgx, imgy, 16, 16, this.x, this.y, this.world_w, this.world_h);
      }

    } else {
      g_imgcache.draw_s("noether", imgx, imgy, 16, 16, this.x, this.y, this.world_w, this.world_h);
    }
  }

  if (this.bomb) {
    var ix = 0, iy = -8;

    var ds = Math.floor(this.size+0.5);

    var di = this.currentDisplayDirection();
    if (di == "up") {
      ix = 0;
      //iy = -8;
      //iy = -(Math.floor(ds/2) + Math.floor(ds/16));
      iy = -(Math.floor(ds/2));

    }
    else if (di == "right") {
      ix = -2;
    }
    else if (di == "down") {
      ix = -1;
      //iy = -10;
      iy = -(Math.floor(ds/2) + Math.floor(ds/8));
    }
    else if (di == "left") {
      ix = 2;
    }
    //ix *= 4;
    //iy *= 4;

    //ix *= 2;
    //iy *= 2;

    g_imgcache.draw_s("item", 80, 16, 16, 16, this.x+ix, this.y+iy, this.world_w, this.world_h);
  }

  if (this.debug_flag) {
    var x0 = this.player_bbox[0][0];
    var y0 = this.player_bbox[0][1];
    var x1 = this.player_bbox[1][0];
    var y1 = this.player_bbox[1][1];
    g_painter.drawRectangle(x0,y0, x1-x0, y1-y0, 1, "rgba(255,0,0,0.6)");

  }

  /*
  if (this.bow) {
    //var imx = this.bowStep*2*16;
    //g_imgcache.draw_s("rotbow", imx, 0, 16, 16, this.x, this.y, this.world_w, this.world_h);

    var imx = (this.bowStep % (this.bowStepN/4))*20;
    var imy = Math.floor(this.bowStep / 4)*20;
    //g_imgcache.draw_s("rotbow_w_string", imx, imy, 20, 20, this.x-2, this.y-2, 20, 20);
  } else {
    //var imx = kr *8 *16;
    //g_imgcache.draw_s("rotbow", imx, 0, 16, 16, this.x, this.y, this.world_w, this.world_h);
  }
  */

}

