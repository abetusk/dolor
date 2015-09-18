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

  this.dx = 12;
  this.dy = 12;


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
  //this.bowStepN = 32;
  this.bowStepN = 16;
  this.bow_da = 2.0*Math.PI/this.bowStepN;

  this.bowActive = false;
  this.bowEvent = "idle";
  this.bowTurnDelay = 0;
  this.bowTurnDelayN = 1;

}

mainPlayer.prototype.init = function(x, y, d) {
  this.x = x;
  this.y = y;
  this.d = d;
}

// walking, bow and sword are mutually exclusive
// bomb is a modifier to walking.
//
mainPlayer.prototype.update = function() {
  g_painter.dirty_flag = true;

  this.processInput();

  //if (this.walking && (!this.sword) && (!this.bow)) {
  if (this.walking) {
    var xy = this.dxdy();
    this.x += xy[0];
    this.y += xy[1];
  //}



  //if (this.walking && (!this.bow)) {
  //if (this.walking) {
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

// keyDown events only set flags that will be polled
// by the 'update' function.  No state other than
// setting the flags should happen here.
//
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
    this.bowActive = true;
  }

  if (this.bowActive) {
    if (code == 37) {
      this.bowEvent = "left";
    } else if (code == 38) {
      this.bowEvent = "quickfire";
    } else if (code == 39) {
      this.bowEvent = "right";
    } else if (code == 40) {
      this.bowEvent = "draw";
    } else {
      this.bowEvent = "idle";
    }
  }

  // left
  //
  if (code==37) {
    //this.walking = true;
    //this.keyFrameRow = 3;

    if (!this.walkFlag["left"]) {
      this.walkq.push({ "d": "left", "t" : 5 });
    }

    this.walkFlag["left"] = true;
  }

  // up
  //
  else if (code == 38) {
    //this.walking = true;
    //this.keyFrameRow = 0;

    if (!this.walkFlag["up"]) {
      this.walkq.push({ "d":"up", "t":5 });
    }

    this.walkFlag["up"] = true;
  }

  // right
  //
  else if (code == 39) {
    //this.walking = true;
    //this.keyFrameRow = 1;

    if (!this.walkFlag["right"]) {
      this.walkq.push({ "d":"right", "t":5 });

    }

    this.walkFlag["right"] = true;
  }

  // down
  //
  else if (code == 40) {
    //this.walking = true;
    //this.keyFrameRow = 2;

    if (!this.walkFlag["down"]) {
      this.walkq.push({ "d":"down", "t":5 });
    }

    this.walkFlag["down"] = true;
  }

}

// keyUp events only set flags that will be polled
// by the 'update' function.  No state other than
// setting the flags should happen here.
//
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

  if (code == 67) {
    this.bowActive = false;
  }

  if (this.bowActive) {
    if (code == 37) {
      this.bowEvent = "idle";
    } else if (code == 38) {
      //this.bowEvent = "quickfire";
    } else if (code == 39) {
      this.bowEvent = "idle";
    } else if (code == 40) {
      this.bowEvent = "release";
    } else {
      this.bowEvent = "idle";
    }
  }



  // left
  if (code==37) {
    //this.d = "l";
    //this.keyFrameRow = 3;
    this.walkFlag["left"] = false;
  }

  // up
  //
  else if (code == 38) {
    //this.d = "u";
    //this.keyFrameRow = 0;
    this.walkFlag["up"] = false;
  }

  // right
  //
  else if (code == 39) {
    //this.d = "r";
    //this.keyFrameRow = 1;
    this.walkFlag["right"] = false;
  }

  // down
  //
  else if (code == 40) {
    //this.d = "d";
    //this.keyFrameRow = 2;
    this.walkFlag["down"] = false;
  }


  /*
  this.walking = false;
  if (this.walkFlag["up"] || this.walkFlag["left"] || this.walkFlag["right"] || this.walkFlag["down"]) {
    this.walking = true;
    this._updateWalkQueue();
  } else {
    this.walkq = [];
  }
  */

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
mainPlayer.prototype.currentDirection = function() {
  var kr = -1;
  var n = this.walkq.length-1;
  if (n>=0) {
    kr = this.walkLookup[this.walkq[n].d];
  }
  if (kr<0) { kr = this.keyFrameRow; }

  return this.walkKey[kr];
}

// returns text direction
//
mainPlayer.prototype.dxdy = function() {
  //var dx = 16;
  //var dy = 16;
  var dx = this.dx;
  var dy = this.dy;
  var xy = { "up":[0,-dy], "right":[dx,0], "down":[0,dy], "left":[-dx,0] };
  var d = this.currentDirection();
  return xy[d];
}


// There are three main states:
//   - player is idle (with no weapon)
//   - player is walking (with no weapon)
//   - player is attacking with a sword
//   - player has a bomb ready
//   - player has the bow out
//
mainPlayer.prototype.processInput = function() {

  this.walking = false;
  if (this.walkFlag["up"] || this.walkFlag["left"] || this.walkFlag["right"] || this.walkFlag["down"]) {
    this.walking = true;
    this._updateWalkQueue();
  } else {
    this.walkq = [];
  }



  // sword
  //88 x
  if (this.swordEvent) {

    if (!this.bomb) {
      this.walking = false;
      this.swordAttack();
      this.swordDelay = this.swordDelayN-1;
    } else {
      this.bombThrow();
    }
    this.swordEvent=false;

  } else {

    if (this.sword) {
      //this.walking = false;

      if (this.swordDelay==0) {
        this.swordRetract();
      } else {
        this.swordDelay--;
      }

    }
  }

  if (this.sword) {
    this.walking = false;
    this.walkq = [];
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

  if (this.bowActive) {
    this.bow = true;
    this.walking = false;

    if (this.bowEvent == "idle") {
    } else if (this.bowEvent == "left") {

      if (this.bowTurnDelay<=0) {
        this.bowStep = (this.bowStepN + this.bowStep - 1)%this.bowStepN;
        this.bowTurnDelay = this.bowTurnDelayN-1;
      } else {
        this.bowTurnDelay--;
      }
    } else if (this.bowEvent == "right") {
      if (this.bowTurnDelay<=0) {
        this.bowStep = (this.bowStep + 1)%this.bowStepN;
        this.bowTurnDelay = this.bowTurnDelayN-1;
      } else {
        this.bowTurnDelay--;
        console.log(">>>", this.bowTurnDelay);
      }
    } 
  } else {
    this.bow = false;
  }


  if (this.walking) {
    if (this.updateFrameDelay==0) {
      this.keyFrame++;
      if (this.keyFrame >= this.keyFrameN) { this.keyFrame=0; }
      this.updateFrameDelay = this.updateFrameN-1;
    } else {
      this.updateFrameDelay--;
    }
  } else {
    this.walkq = [];
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
    var d = this.currentDisplayDirection();
    kr = this.walkLookup[d];
  }

  if (kr<0) { kr = this.keyFrameRow; }

  //var s = "";
  //for (var i=0; i<this.walkq.length; i++) { s += " " + this.walkq[i].d; }

  var imgx = kf*16;
  var imgy = kr*16;

  if (this.sword) {
    imgy = 4*16;
    imgx = kr*16;
  }

  if (!this.bow) {
    g_imgcache.draw_s("noether", imgx, imgy, 16, 16, this.x, this.y, this.world_w, this.world_h);
  }



  if (this.sword) {
    var a = 0.0;
    var ix = 0;
    var iy = 0;

    var di = this.currentDisplayDirection();
    if (di == "up") {
      a = -Math.PI/2.0;
      iy=-16;
    }
    else if (di == "right") {
      a = 0.0;
      ix = 16;
    }
    else if (di == "down") {
      a = Math.PI/2.0;
      iy = 16;
      //ix = 16;
    }
    else if (di == "left") {
      a = Math.PI;
      ix = -16;
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
      ix = -2;
    }
    else if (di == "down") {
      ix = -1;
      iy = -10;
    }
    else if (di == "left") {
      ix = 2;
    }
    ix *= 4;
    iy *= 4;

    g_imgcache.draw_s("item", 80, 16, 16, 16, this.x+ix, this.y+iy, this.world_w, this.world_h);
  }

  if (this.bow) {
    var imx = this.bowStep*2*16;
    g_imgcache.draw_s("rotbow", imx, 0, 16, 16, this.x, this.y, this.world_w, this.world_h);
  }

  /*
  if (this.bow) {
    var di = this.currentDisplayDirection();
    var a = 0.0;

    var ia = 0;
    if (di == "up") {
      a = -Math.PI/2.0;
      ia = 8;
    }
    else if (di == "right") {
      a = 0.0;
      ia = 0;
    }
    else if (di == "down") {
      a = Math.PI/2.0;
      ia = 24;
    }
    else if (di == "left") {
      a = Math.PI;
      ia = 16;
    }

    ia = this.bowStep;
    a = this.bowStep * 2.0 * Math.PI / this.bowStepN;

    console.log(this.bowStep, ia, a );

    var shifty = 0;
    var ofdx = 32;
    var ofdy = 25;
    var ofx = Math.cos(a)*ofdx;
    var ofy = Math.sin(a)*ofdy - shifty;


    if ((ia>=0) && (ia<=(this.bowStepN/2))) {
      g_imgcache.draw_s("noether", imgx, imgy, 16, 16, this.x, this.y, this.world_w, this.world_h);
    }

    var f = 1.0;
    var imx = 16*5;
    g_imgcache.draw_s("item", imx, 0, 16, 16, this.x+ofx, this.y+ofy, f*this.world_w, f*this.world_h, a);

    var fq = 0.7;
    var imqx = 16*5;
    var imqy = 16*3;
    g_imgcache.draw_s("item", imqx, imqy, 16, 16, this.x+ofx, this.y+ofy, fq*this.world_w, fq*this.world_h, a);

    if ((ia>(this.bowStepN/2)) && (ia<this.bowStepN)) {
      g_imgcache.draw_s("noether", imgx, imgy, 16, 16, this.x, this.y, this.world_w, this.world_h);
    }


  }
  */

}

