function mainPlayer() {
  this.x = 100;
  this.y = 200;

  this.d = "u"; // "d", "l", "r", and combinations?

  this.sword = false;
  this.walking = false;
  this.bomb = false;
  this.bow = false;

  this.keyFrameRow = 0;
  this.keyFrame = 0;
  this.keyFrameN = 4;
  this.updateFrameN = 2;
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

  this.walkTransitionDelay = 2;

  this.walkDisplayQ = [];


  this.img_w = 16;
  this.img_h = 16;
  this.img_x = 0;
  this.img_y = 0;

  this.world_w = 64;
  this.world_h = 64;


  this.swordReady = true;
  this.bombReady = true;
  this.bowReady = true;

  this.swordEvent = false;
  this.swordDelayN = 4;
  this.swordDelay = 0;

  this.bombEvent = false;

  // 0 is right.  past StepN/2 is below
  // so ccw
  //
  this.bowStep = 0;
  this.bowStepN = 32;
  this.bow_da = 2.0*Math.PI/this.bowStepN;

  this.bowEvent = false;

}

mainPlayer.prototype.init = function(x, y, d) {
  this.x = x;
  this.y = y;
  this.d = d;
}

mainPlayer.prototype.update = function() {

  this.processInput();

  //if (this.walking) {
  if (this.walking && (!this.sword)) {
    var xy = this.dxdy();
    this.x += xy[0];
    this.y += xy[1];
  }

  g_painter.dirty_flag = true;

  var curdir = this.currentDirection();
  if (this.displayq.length==0) {
    this.displayq.push({ "d":curdir, "t":-1 });
  } else {

    var n = this.displayq.length;
    if (curdir != this.displayq[n-1].d) {

      var old_dir = this.displayq[n-1].d;
      this.displayq = [];

      var dl = this.walkTransitionDelay;

      // 'up' just looks better to me, don't know why...
      //
      if ((old_dir == "left") && (curdir == "right")) {
        this.displayq.push({ "d":"up", "t":dl });
      }
      else if ((old_dir == "right") && (curdir == "left")) {
        this.displayq.push({ "d":"up", "t":dl });
      }
      else if ((old_dir == "up") && (curdir == "down")) {
        this.displayq.push({ "d":"right", "t":dl });
      }
      else if ((old_dir == "down") && (curdir == "up")) {
        this.displayq.push({ "d":"left", "t":dl });
      }
      this.displayq.push({ "d":curdir, "t":-1 });

    }


  }

  if (this.displayq.length>1) {
    this.displayq[0].t--;
    if (this.displayq[0].t<0) { this.displayq.shift(); }
  }

  //DEBUG
  var s = "";
  for (var ii=0; ii<this.displayq.length; ii++) {
    s += " " + this.displayq[ii].d + ":" + this.displayq[ii].t;
  }

}

mainPlayer.prototype.swordAttack = function() {
  console.log("sword attack");
  this.sword = true;
}

mainPlayer.prototype.swordRetract = function() {
  //console.log("sword retract");
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

mainPlayer.prototype.keyDown = function(code) {

  // 'z', bomb
  if (code == 90) {
    if (this.bombReady) {
      this.bombReady = false;
      this.bombEvent = true;
    }
  }

  // 'x', sword
  if (code == 88) {
    if (this.swordReady) {
      this.swordReady = false;
      this.swordEvent = true;
    }
  }

  // 'c', bow
  if (code == 67) {
    if (this.bowReady) {
      this.bowReady = false;
      this.bombReady = false;
      this.swordReady = false;
    }
  }

  //left
  if (code==37) {
    this.walking = true;
    this.keyFrameRow = 3;

    if (!this.walkFlag["left"]) {
      //this.walkFlag["leftq"] = this.walkQueue;
      //this.walkQueue++;
      //if (this.walkQueue>3) { this.walkQueue=3; }

      //this.walkq.push("left");
      this.walkq.push({ "d": "left", "t" : 5 });
    }

    this.walkFlag["left"] = true;
  }

  //up
  else if (code == 38) {
    this.walking = true;
    this.keyFrameRow = 0;

    if (!this.walkFlag["up"]) {
      //this.walkFlag["upq"] = this.walkQueue;
      //this.walkQueue++;
      //if (this.walkQueue>3) { this.walkQueue=3; }

      //this.walkq.push("up");
      this.walkq.push({ "d":"up", "t":5 });

    }

    this.walkFlag["up"] = true;
  }

  //right
  else if (code == 39) {
    this.walking = true;
    this.keyFrameRow = 1;

    if (!this.walkFlag["right"]) {
      //this.walkFlag["rightq"] = this.walkQueue;
      //this.walkQueue++;
      //if (this.walkQueue>3) { this.walkQueue=3; }

      //this.walkq.push("right");
      this.walkq.push({ "d":"right", "t":5 });

    }

    this.walkFlag["right"] = true;
  }

  //down
  else if (code == 40) {
    this.walking = true;
    this.keyFrameRow = 2;

    if (!this.walkFlag["down"]) {
      //this.walkFlag["downq"] = this.walkQueue;
      //this.walkQueue++;
      //if (this.walkQueue>3) { this.walkQueue=3; }

      //this.walkq.push("down");
      this.walkq.push({ "d":"down", "t":5 });
    }

    this.walkFlag["down"] = true;
  }

  //DEBUG
  //console.log(">> player key up, swordReady:", this.swordReady, "swordEvent:", this.swordEvent, "bombReady:", this.bombReady, "swordEvent:", this.swordEvent);
}

mainPlayer.prototype._updateWalkQueue= function() {
  var newq = [];
  for (var i=0; i<this.walkq.length; i++) {
    //var key = this.walkq[i];
    //if (this.walkFlag[key]) { newq.push(key); }
    var key = this.walkq[i].d;
    if (this.walkFlag[key]) { newq.push(this.walkq[i]); }
  }
  this.walkq = newq;
}


// returns text direction
//
mainPlayer.prototype.currentDirection = function() {
  var kr = -1;
  var n = this.walkq.length-1;
  if (n>=0) {
    //kr = this.walkLookup[this.walkq[n]];
    kr = this.walkLookup[this.walkq[n].d];
  }
  if (kr<0) { kr = this.keyFrameRow; }

  return this.walkKey[kr];
}

// returns text direction
//
mainPlayer.prototype.dxdy = function() {
  var dx = 16;
  var dy = 16;
  var xy = { "up":[0,-dy], "right":[dx,0], "down":[0,dy], "left":[-dx,0] };
  var d = this.currentDirection();
  return xy[d];
}


mainPlayer.prototype.keyUp = function(code) {
  if (code == 88) {
    this.swordReady = true;
    this.swordEvent = false;
    this.sword = false;
  }

  if (code == 90) {
    this.bombReady = true;
    this.bombEvent = false;
  }

  //left
  if (code==37) {
    //this.walking = false;
    this.d = "l";
    this.keyFrameRow = 3;
    this.walkFlag["left"] = false;

    //this.walkQueue--;
    //if (this.walkQueue<0) { this.walkQueue=0; }
  }

  //up
  else if (code == 38) {
    //this.walking = false;
    this.d = "u";
    this.keyFrameRow = 0;
    this.walkFlag["up"] = false;

    //this.walkQueue--;
    //if (this.walkQueue<0) { this.walkQueue=0; }
  }

  //right
  else if (code == 39) {
    //this.walking = false;
    this.d = "r";
    this.keyFrameRow = 1;
    this.walkFlag["right"] = false;

    //this.walkQueue--;
    //if (this.walkQueue<0) { this.walkQueue=0; }
  }

  //down
  else if (code == 40) {
    //this.walking = false;
    this.d = "d";
    this.keyFrameRow = 2;
    this.walkFlag["down"] = false;

    //this.walkQueue--;
    //if (this.walkQueue<0) { this.walkQueue=0; }
  }


  this.walking = false;
  if (this.walkFlag["up"] || this.walkFlag["left"] || this.walkFlag["right"] || this.walkFlag["down"]) {
    this.walking = true;
    this._updateWalkQueue();
  } else {
    //this.walkQueue = 0;
    this.walkq = [];
  }

  //DEBUG
  //console.log(">> player key up, sword:", this.swordReady, "bombRead:", this.bombReady);
}

mainPlayer.prototype.processInput = function() {

  // sword
  //88 x
  if (this.swordEvent) {

    if (!this.bomb) {
      this.swordAttack();
      this.swordDelay = this.swordDelayN-1;
    } else {
      this.bombThrow();
    }
    this.swordEvent=false;

  } else {

    if (this.sword) {

      if (this.swordDelay==0) {
        this.swordRetract();
      } else {
        this.swordDelay--;
      }

    }
  }

  // bomb
  //90 z
  if (this.bombEvent) {

    if (!this.sword) {
      if (this.bomb) {
        this.bombThrow();
      } else {
        this.bombPrepare();
      }
    }
    this.bombEvent=false;

  }


  if (this.walking) {
    if (this.updateFrameDelay==0) {
      this.keyFrame++;
      if (this.keyFrame >= this.keyFrameN) { this.keyFrame=0; }
      this.updateFrameDelay = this.updateFrameN-1;
    } else {
      this.updateFrameDelay--;
    }
  }

}

mainPlayer.prototype.currentDisplayDirection = function() {

  var a = "up";
  if (this.displayq.length>0) { a = this.displayq[0].d; }
  return a;
}

mainPlayer.prototype.draw = function() {

  var kf = this.keyFrame;
  var kr = -1;

  var n = this.walkq.length-1;
  if (n>=0) {
    //kr = this.walkLookup[this.walkq[n]];
    //kr = this.walkLookup[this.walkq[n].d];
    var d = this.currentDisplayDirection();
    kr = this.walkLookup[d];
  }

  if (kr<0) { kr = this.keyFrameRow; }

  var s = "";
  for (var i=0; i<this.walkq.length; i++) {
    //s += " " + this.walkq[i];
    s += " " + this.walkq[i].d;
  }

  var imgx = kf*16;
  var imgy = kr*16;

  if (this.sword) {
    imgy = 4*16;
    imgx = kr*16;
  }

  g_imgcache.draw_s("noether", imgx, imgy, 16, 16, this.x, this.y, this.world_w, this.world_h);



  if (this.sword) {
    var a = 0.0;
    var ix = 0;
    var iy = 0;

    var di = this.currentDisplayDirection();
    if (di == "up") {
      a = -Math.PI/2.0;
    }
    else if (di == "right") {
      a = 0.0;
      ix = 16;
    }
    else if (di == "down") {
      a = Math.PI/2.0;
      iy = 16;
      ix = 16;
    }
    else if (di == "left") {
      a = Math.PI;
      ix = 0;
      iy = 16;
    }
    ix *= 4;
    iy *= 4;

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
  }

  if (this.bomb) {
    var ix = 0, iy = -8;
    var di = this.currentDisplayDirection();
    if (di == "up") {
      ix = 0;
      iy = -8;

    }
    else if (di == "right") {
      a = 0.0;
      ix = -2;
    }
    else if (di == "down") {
      a = Math.PI/2.0;
      ix = -1;
      iy = -10;
    }
    else if (di == "left") {
      a = Math.PI;
      ix = 2;
    }
    ix *= 4;
    iy *= 4;

    g_imgcache.draw_s("item", 80, 16, 16, 16, this.x+ix, this.y+iy, this.world_w, this.world_h);
  }

  if (this.bow) {
    var ix = 0, iy = -8;
    var di = this.currentDisplayDirection();
    if (di == "up") {
      ix = 0;
      iy = -8;

    }
    else if (di == "right") {
      a = 0.0;
      ix = -2;
    }
    else if (di == "down") {
      a = Math.PI/2.0;
      ix = -1;
      iy = -10;
    }
    else if (di == "left") {
      a = Math.PI;
      ix = 2;
    }
    ix *= 4;
    iy *= 4;

    var imx = 16*6;

    g_imgcache.draw_s("item", imx, 0, 16, 16, this.x+ix, this.y+iy, this.world_w, this.world_h);

  }

}

