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
  this.teleport = false;

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
  this.sword_damage = 8;

  this.speaking = false;
  this.text = "";

  this.displayq = [];
  this.walkq = [];
  this.walkFlag = {
    "left" : false, "right" : false, "up":false, "down":false,
    "leftq":0, "rightq":0, "upq":0, "downq":0
  };
  this.walkKey = ["up", "right", "down", "left"];
  this.walkLookup = { "up" : 0, "right" : 1, "down":2, "left":3 };

  this.walkTransitionDelay = 6;

  this.walkDisplayQ = [];

  this.dx = g_GRIDSIZE/8;
  this.dy = g_GRIDSIZE/8;


  this.img_w = 16;
  this.img_h = 16;
  this.img_x = 0;
  this.img_y = 0;

  this.world_w = g_GRIDSIZE;
  this.world_h = g_GRIDSIZE;
  this.size = g_GRIDSIZE;

  this.bowReady = true;

  this.swordKeyState = "idle"; // "fire", "warm"
  this.bombKeyState = "idle"; // "fire", "warm"
  this.bowKeyState = "idle"; // "fire", "warm"

  this.swordKeyEvent = false;
  this.swordDelayN = 8;
  this.swordDelay = 0;

  this.bombEvent = false;
  this.bombDelay = 0;
  this.bombDelayN = 10;
  this.bombKeyUp = true;;

  this.bowDelayN = 10;
  this.bowDelay = 0;

  // 0 is right.  past StepN/2 is below
  // so ccw
  //
  this.bowStep = 0;
  this.bowStepN = 32;

  this.bowActive = false;
  this.bowEvent = "idle";
  this.bowTurnDelay = 0;
  this.bowTurnDelayN = 1;

  this.bowInitialDelayN = 10;
  this.bowInitialDelay = this.bowInitialDelayN;


  this.displayq.push({ "d":"down", "t":-1 });
  this.walkq.push({ "d":"down", "t":-1 });

  this.inputEvent = {};
  this.state = "idle";

  //SWORD STATE
  this.swordKeyUp = true;

  this.swordJitterX = 0;
  this.swordJitterY = 0;

  this.bowAim = {
    "frame_right" : 4,
    "a" : 0,

    "a_step" : 0,
    "a_step_n" : 32,
    "a_step_delay" : 0,
    "a_step_delay_n" : 0,

    "bow_knock_state" : 0,
    "bow_knock_delay" : 0,
    "bow_knock_delay_n" : 8
  };

  this.intent = { "type":"idle" };

  // puff frequency
  //
  this.puffDelayN = 13;
  this.puffDelay = this.puffDelayN;
  this.puffDelayR = 2;  // random delta range

  // Persistence before resizing
  //
  this.puffObjectDelayN = 6;
  this.puffObjectDelay = this.puffObjectDelayN;

  // Maximum point size
  //
  this.puffSizeMax = 3;

  this.puffObject = {
    "pos" : [],
    "psize" : [],
    "dpsize" : [],
    "ttl" : [],
    "alpha" : [],
    "dalpha" : []
  };

  this.puffSizeDelayN = 8;
  this.puffTTL = 15;
  this.puffAngleRange = 16;
  this.puff = {
    "d" : [],
    "ttl" : [],
    "pos" : [],
    "dpos" : [],
    "delayN" : [],
    "delay" : [],
    "alpha" : [],
    "dalpha": []
  };

  this.teleportAnimDelayN = 4;
  this.teleportAnimDelay = this.teleportAnimDelayN;
  this.teleportFrame = 0;
  this.teleportFrameN = 4;

  this.teleport_x = 0;
  this.teleport_y = 0;

  this.teleport_ttl_N = this.teleportFrameN*this.teleportAnimDelayN;
  this.teleport_ttl = this.teleport_ttl_N;

  this.teleport_dest_ready = false;

  /*
  this.focus_history_window = 100;
  this.focus_history = [];
  this.focus_history_pos = 0;
  this.focus = [this.x, this.y];
  for (var i=0; i<this.focus_history_window; i++) {
    this.focus_history.push( [this.x,this.y] );
  }

  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", this.focus);
  */

}

mainPlayer.prototype.init = function(x, y, d) {
  this.x = x;
  this.y = y;
  this.d = d;

  /*
  this.focus_history = [];
  for (var i=0; i<this.focus_history_window; i++) {
    this.focus_history[i].push( [this.x,this.y] );
  }
  this.update_focus();
  */

}


/*
mainPlayer.prototype.update_focus = function() {
  var x = 0;
  var y = 0;
  for (var i=0; i<this.focus_history.length; i++) {
    x += this.focus_history[i][0];
    y += this.focus_history[i][1];
  }

  this.focus[0] = x/this.focus_history.length;
  this.focus[1] = y/this.focus_history.length;
}
*/

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

mainPlayer.prototype.resetWalkq = function(d) {
  d = ((typeof d === "undefined") ? this.actualDirection() : d);
  this.walkq = [{ "d":d, "t":-1 }];
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

mainPlayer.prototype.shootArrow = function() {
  this.bow = false;
  this.bowDelay = this.bowDelayN;

  var di = this.actualDirection();
  var bxy = this.dir_xy();
  this.state = "shootArrow";

  this.intent  = { "type" : "shootArrow",
    "x" : this.x,
    "y" : this.y,
    "dx" : bxy[0],
    "dy" : bxy[1],
    "a_step" : this.bowAim.a_step,
    "a_step_n" : this.bowAim.a_step_n,
    "a" : 2.0*Math.PI*(this.bowAim.a_step/this.bowAim.a_step_n),
    "d" : di };
}

mainPlayer.prototype.bombThrow = function() {
  this.bomb = false;
  this.bombDelay = this.bombDelayN;

  var di = this.currentDisplayDirection();
  var bxy = this.dir_xy();
  this.state = "bombThrow";

  var r = 5;
  var r2 = Math.floor(r/2);

  var fudge_x = Math.floor(Math.random()*r)-r2;
  var fudge_y = Math.floor(Math.random()*r)-r2;

  this.intent  = { "type" : "bombThrow",
    "x" : this.x + fudge_x,
    "y" : this.y + fudge_y,
    "dx" : bxy[0],
    "dy" : bxy[1],
    "d" : di };
}

mainPlayer.prototype.teleportIntent = function(dest_x, dest_y) {
  var di = this.currentDisplayDirection();
  var bxy = this.dir_xy();

  this.intent = { "type" : "teleport",
    "x" : this.x,
    "y" : this.y,
    "dest_x" : dest_x,
    "dest_y" : dest_y,
    "dx" : bxy[0],
    "dy" : bxy[1],
    "d" : di };
}

mainPlayer.prototype.teleportStart = function(dest_x, dest_y) {
  var di = this.currentDisplayDirection();
  var bxy = this.dir_xy();

  this.intent = { "type" : "teleport",
    "x" : this.x,
    "y" : this.y,
    "dx" : bxy[0],
    "dy" : bxy[1],
    "d" : di };
}

mainPlayer.prototype.flyStart = function(dest_x, dest_y) {
  var di = this.currentDisplayDirection();
  var bxy = this.dir_xy();

  this.intent = { "type" : "fly",
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
  this.updatePuffs();


  // update focus
  //
  /*
  var p = this.focus_history_pos;
  this.focus_history[p][0] = this.x;
  this.focus_history[p][1] = this.y;
  this.focus_history_pos = (p+1)%this.focus_history_window;
  this.update_focus();
  */

  for (var ev in this.inputEvent) {

    if (ev == "bowKeyDown") {
      //BOW DRAW

      if (this.state == "swordAttack") { continue; }
      if (this.state == "teleport") { continue; }


      if (!this.bow) {
        this.bow = true;
        this.state = "bow";
        this.bowInitialDelay = this.bowInitialDelayN;

        var curdir = this.actualDirection();
        this.resetDisplayDirection(curdir);
        if (curdir == "right") {
          this.bowAim.a_step = 0;
        } else if (curdir == "up") {
          this.bowAim.a_step = this.bowAim.a_step_n/4;
        } else if (curdir == "left") {
          this.bowAim.a_step = this.bowAim.a_step_n/2;
        } else if (curdir == "down") {
          this.bowAim.a_step = 3*this.bowAim.a_step_n/4;
        }

        this.bowAim.a = 2.0*Math.PI*(this.bowAim.a_step/this.bowAim.a_step_n);

        //this.bowAim.a_step_delay_n = 10;
        this.bowAim.a_step_delay_n = 2;

        this.bowAim.a_step_delay = this.bowAim.a_step_delay_n;

        //this.bowAim.bow_knock_delay_n = 5;
        this.bowAim.bow_knock_state = 2;
        this.bowAim.bow_knock_delay = this.bowAim.bow_knock_delay_n;

      }

      continue;
    } else if (ev == "bowKeyUp") {

      if (this.bow) {
        this.shootArrow();
        //var curdir = this.actualDirection();
        //this.resetDisplayDirection(curdir);
        //this.resetWalkq();
        //this.setBowToDirection();

        continue;
      }

      this.bow = false;
      continue;
    }

    if (ev == "debugKeyDown") {
      this.debugEvent();
      continue;
    }

    if (ev == "swordKeyDown") {

      if (this.state == "teleport") { continue; }

      if (this.bow) {
        this.shootArrow();
        continue;
      }

      if (this.bomb) {
        this.bombThrow();
        continue;
      }

      if ((this.state == "swordAttack") ||
          (this.state == "bow")) { continue; }
      if (!this.swordReady()) { continue; }
      if (!this.swordKeyUp) { continue; }

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

      /*
      if (this.bomb) {
        this.bombThrow();
        continue;
      }
      */

      if ((this.state == "swordAttack") ||
          (this.state == "bow")) { continue; }
      if (this.state == "teleport") { continue; }
      if (!this.bombReady()) { continue; }
      if (!this.bombKeyUp) { continue; }

      //this.prepBomb();
      this.bombThrow();

      continue;
    }

    if (ev == "bombKeyUp") {
      continue;
    }

    if (ev == "teleportKeyDown") {
      // could hold down to "charge"
      continue;
    }

    if (ev == "teleportKeyUp") {

      if (this.state == "swordAttack") { continue; }
      if (this.state == "bow") { continue; }
      if (this.state == "teleport") { continue; }

      if ((this.state == "swordAttack") || (this.state == "bow")) {
        continue;
      }

      this.state = "teleport";
      this.teleport = true;

      this.teleport_ttl = this.teleport_ttl_N;
      this.teleportFrame = 0;

      var ds = 16*2;
      var dxdy = { "up": [0,-ds], "right" : [ds,0], "left":[-ds,0], "down":[0,ds], "none":[0,0] };
      var curdir = this.actualDirection();

      this.teleport_dest_ready = false;
      //this.teleport_x = this.x + dxdy[curdir][0];
      //this.teleport_y = this.y + dxdy[curdir][1];

      var n = g_sfx["teleport"].length;
      var x = Math.floor(Math.random()*n);
      g_sfx["teleport"][x].play();

      this.teleportIntent(this.x + dxdy[curdir][0], this.y + dxdy[curdir][1]);

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



  this.inputEvent = {};

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

    var drpuff = Math.floor(Math.random()*this.puffDelayR)+1;
    this.puffDelay-=drpuff;

    if (this.puffDelay<=0) {
      this.puffDelay = this.puffDelayN;
      this.addPuffs();
    }
   
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
  } else if (this.state == "bombThrow") {
    if (this.bombDelay==0) {

      if (this.walkFlag["up"] || this.walkFlag["down"] || this.walkFlag["left"] || this.walkFlag["right"]) {
        this.state = "walking";
        this._updateWalkQueue();

      } else {
        this.state = "idle";
      }

    } else {
      this.bombDelay--;
    }

    this.setBowToDirection();
    return;
  } else if (this.state == "bow") {

    var a_n = this.bowAim.a_step_n;
    var a_step = this.bowAim.a_step;
    if ((a_step < (a_n/8)) || (a_step > (7*a_n/8))) {
      //this.resetDisplayDirection("right");
    }
    
    else if ((a_step <= (3*a_n/8)) && (a_step >= (a_n/8))) {
      //this.resetDisplayDirection("up");
    }

    else if ((a_step < (5*a_n/8)) && (a_step > (3*a_n/8))) {
      //this.resetDisplayDirection("left");
    }

    //else if ((a_step <= (5*a_n/8)) && (a_step > (3*a_n/8))) {
    else {
      //this.resetDisplayDirection("down");
    }

    if (this.bowAim.bow_knock_state>0) {
      if (this.bowAim.bow_knock_delay==0) {
        this.bowAim.bow_knock_delay = this.bowAim.bow_knock_delay_n;
        this.bowAim.bow_knock_state--;
      }
      this.bowAim.bow_knock_delay--;
    }

    if (this.bowAim.a_step_delay>0) {
      this.bowAim.a_step_delay--;
    }

    // Pause before allowing to draw fully.  This
    // also allows walking and shooting without it
    // pointing down when walking left and right.
    //
    if (this.bowInitialDelay>0) {
      this.bowInitialDelay--;
    } else {

      if (this.walkFlag["left"] || this.walkFlag["right"]) {
        if (this.bowAim.a_step_delay==0) {

          var da = 0;
          if (this.walkFlag["left"]) { da ++; }
          if (this.walkFlag["right"]) { da += this.bowAim.a_step_n-1; }
          this.bowAim.a_step = (this.bowAim.a_step + da) % this.bowAim.a_step_n;

          this.bowAim.a_step_delay=this.bowAim.a_step_delay_n;
        }
      }

    }

  } else if (this.state == "shootArrow") {

    // If we have no walkin gkey pending, force the direction to be the one we're facing.
    //
    if (!this.walkFlag["up"] && !this.walkFlag["down"] && !this.walkFlag["left"] && !this.walkFlag["right"]) {
      var a_n = this.bowAim.a_step_n;
      var a_step = this.bowAim.a_step;
      var curdir = "none";
      if ((a_step < (a_n/8)) || (a_step > (7*a_n/8))) {
        curdir = "right";
      }
      else if ((a_step <= (3*a_n/8)) && (a_step >= (a_n/8))) {
        curdir = "up";
      }
      else if ((a_step < (5*a_n/8)) && (a_step > (3*a_n/8))) {
        curdir = "left";
      }
      else {
        curdir = "down";
      }

      this.resetDisplayDirection(curdir);
      this.setBowToDirection();
      this.resetWalkq(curdir);

    }

    if (this.bowDelay==0) {
      if (this.walkFlag["up"] || this.walkFlag["down"] || this.walkFlag["left"] || this.walkFlag["right"]) {
        this.state = "walking";
        this._updateWalkQueue();
        this.setBowToDirection();

        //this._updateWalkQueue();

        //var curdir = this.actualDirection();
        //this.resetDisplayDirection(curdir);
        //this.setBowToDirection();

      } else {
        this.state = "idle";

      }

    } else {
      this.bowDelay--;
    }

  } else if (this.state == "teleport") {

    // TELEPORT STATE

    this.teleport_ttl--;

    if (this.teleport_ttl<=0) {
      this.x = this.teleport_x;
      this.y = this.teleport_y;
      this.state = "idle";
      this.teleport = false;
      this.keyFrame = 3;
    } else {

      this.teleportAnimDelay--;
      if (this.teleportAnimDelay<=0) {
        this.teleportAnimDelay = this.teleportAnimDelayN;
        this.teleportFrame++;
        if (this.teleportFrame >= this.teleportFrameN) {
          this.teleportFrame = this.teleportFrameN-1;
        }
      }
    }
  }

}

mainPlayer.prototype.addPuffs = function() {
  var di = this.currentDisplayDirection();

  var dr = Math.random();
  var ang = (Math.floor(Math.random()*this.puffAngleRange)/this.puffAngleRange)*2.0*Math.PI;

  var dx = dr*Math.cos(ang);
  var dy = dr*Math.sin(ang);
  var x = this.x ;
  var y = this.y ;

  var s = this.size;
  var s2 = Math.floor(this.size/2);

  if (di=="down") {
    x += s2;
    y -= 2;
    y -= Math.floor(Math.random()*2)
  } else {
    x += s2;
    y += s;
    y -= Math.floor(Math.random()*2)
  }

      /*
  if (di == "left") {
    x += s2;
    y += s-3;
    y -= Math.floor(Math.random()*2)
  } else if (di == "right") {
    x += s2;
    y += s-3;
    y -= Math.floor(Math.random()*2)
  } else if (di == "up") {
  }
  */

  this.puff.d.push( Math.floor(4*Math.random()) );
  this.puff.ttl.push(this.puffTTL);
  this.puff.pos.push([x,y]);
  this.puff.dpos.push([dx,dy]);
  this.puff.delayN.push(this.puffSizeDelayN);
  this.puff.delay.push(this.puffSizeDelayN);
  this.puff.alpha.push(0.6);
  this.puff.dalpha.push(0);

  return;


  var ttl = 50;
  var psize = 2;
  var alpha = 0.6;
  var dalpha = 0.01;

  var p2 = Math.floor(psize/2);
  // n0, n1, dx0, dy0, dx1, dy1
  //
  var vec = [0,0,0,0,0,0];
  var s = this.size;
  var s2 = Math.floor(s/2);
  var rr = 8;
  var r2 = Math.floor(rr/2);

  var dn = Math.floor(Math.random()*2);
  if (di == "left") {
    //     n0  n1  dx0   dy0      dx1   dy1
    vec = [2-dn,1, s-s2, s-p2-r2+2, s-s2, s-p2-r2+2];
  } else if (di == "right") {
    //     n0  n1   dx0   dy0    dx1   dy1
    vec = [1, 2-dn, s2, s-p2-r2+2, s2, s-p2-r2+2];
  }

  for (var i=0; i<vec[0]; i++) {

    var rx = Math.floor(Math.random()*rr)-r2;
    //var ry = Math.floor(Math.random()*rr)-r2;
    var ry = Math.floor(Math.random()*3)-1;

    var x = this.x + vec[2] + rx;
    var y = this.y + vec[3] + ry;
    this.puffObject.pos.push([x, y]);
    this.puffObject.psize.push(psize);
    this.puffObject.dpsize.push(1);
    this.puffObject.ttl.push(ttl);
    this.puffObject.alpha.push(alpha);
    this.puffObject.dalpha.push(dalpha);


  }

  for (var i=0; i<vec[1]; i++) {
    var x = this.x + vec[4];
    var y = this.y + vec[5];
    this.puffObject.pos.push([x, y]);
    this.puffObject.psize.push(psize);
    this.puffObject.dpsize.push(1);
    this.puffObject.ttl.push(ttl);
    this.puffObject.alpha.push(alpha);
    this.puffObject.dalpha.push(dalpha);
  }


}


mainPlayer.prototype.updatePuffs = function() {

  var newobj = { "pos":[], "dpos":[], "ttl":[], "alpha": [],  "dalpha":[], "delay" : [], "delayN": [], "d":[] };
  var n = this.puff.pos.length;
  for (var i=0; i<n; i++) {
    this.puff.delay[i]--;
    if (this.puff.delay[i]<=0) {
      this.puff.delay[i]=this.puff.delayN[i];
      newobj.d.push(this.puff.d[i]);
      newobj.ttl.push(this.puff.ttl[i]);
      newobj.pos.push(this.puff.pos[i]);
      newobj.dpos.push(this.puff.dpos[i]);
      newobj.alpha.push(this.puff.alpha[i]);
      newobj.dalpha.push(this.puff.dalpha[i]);
      newobj.delay.push(this.puff.delay[i]);
      newobj.delayN.push(this.puff.delayN[i]);
      continue;
    }

    this.puff.pos[i][0] += this.puff.dpos[i][0];
    this.puff.pos[i][1] += this.puff.dpos[i][1];
    this.puff.alpha[i] += this.puff.dalpha[i];

    this.puff.ttl[i]--;
    if (this.puff.ttl[i]>0) {
      newobj.d.push(this.puff.d[i]);
      newobj.ttl.push(this.puff.ttl[i]);
      newobj.pos.push(this.puff.pos[i]);
      newobj.dpos.push(this.puff.dpos[i]);
      newobj.alpha.push(this.puff.alpha[i]);
      newobj.dalpha.push(this.puff.dalpha[i]);
      newobj.delay.push(this.puff.delay[i]);
      newobj.delayN.push(this.puff.delayN[i]);
    }

  }

  this.puff = newobj;
}


mainPlayer.prototype.swordAttack = function() {
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

  // v
  else if (code == 86) { this.inputEvent["teleportKeyDown"] = true; }

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

  // v
  else if (code == 86) { this.inputEvent["teleportKeyUp"] = true; }
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

  if ((this.state == "idle") || (this.state == "walking") || (this.state=="bombThrow") || (this.state=="shootArrow")) {

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

  if (this.teleport) {
    var curdir = this.currentDisplayDirection();

    var tele_col = { "up":0, "right":1, "down":2, "left":3, "none":0 };

    var tele_imx = this.teleportFrame*24;
    var tele_imy = tele_col[curdir]*24;

    var dst_tele_imx = (3-this.teleportFrame)*24;

    g_imgcache.draw_s("tele", tele_imx, tele_imy, 24, 24, this.x-4, this.y-4, 24, 24);

    if (this.teleport_dest_ready) {
      g_imgcache.draw_s("tele", dst_tele_imx, tele_imy, 24, 24, this.teleport_x-4, this.teleport_y-4, 24, 24);
    }
  }

  if (this.bow) {

    //override noether direction
    //
    var t_imgx = 0;
    var t_imgy = 0;
    var a_n = this.bowAim.a_step_n;
    var a_step = this.bowAim.a_step;
    var curdir = "none";

    // arrow offset
    var ax = 0;
    var ay = 0;
    var ks = this.bowAim.bow_knock_state;


    if ((a_step < (a_n/8)) || (a_step > (7*a_n/8))) {
      t_imgy = 16;
      curdir = "right";
      ax=(2-ks);
    }

    else if ((a_step <= (3*a_n/8)) && (a_step >= (a_n/8))) {
      t_imgy = 0;
      curdir = "up";
      ay=-(2-ks);
    }

    else if ((a_step < (5*a_n/8)) && (a_step > (3*a_n/8))) {
      t_imgy = 16*3;
      curdir = "left";
      ax=-(2-ks);
    }

    else {
      t_imgy = 16*2;
      curdir = "down";
      ay=(2-ks);
    }

    if (this.bowAim.bow_knock_state==0) {
      ax=0; ay=0;
    }

    var bow_ontop = true;
    if (a_step<=a_n/2) { bow_ontop = false; }


    var a_step = (this.bowAim.a_step + this.bowAim.frame_right)%this.bowAim.a_step_n;
    var a_r = Math.floor(a_step/8);
    var a_c = a_step%8;
    var a_imx = 16*a_c;
    var a_imy = 16*a_r;

    var rb_imx = 20*a_c;
    var rb_imy = 20*a_r;

    rb_imy += 80*(2-this.bowAim.bow_knock_state);

    //if (curdir == "down") {
    if (bow_ontop) {
      g_imgcache.draw_s("noether", t_imgx, t_imgy, 16, 16, this.x, this.y, this.world_w, this.world_h);
      //g_imgcache.draw_s("rotbow", rb_imx, rb_imy, 20, 20, this.x-2, this.y-2, 20, 20);
      //g_imgcache.draw_s("rotbow_fulldraw", rb_imx, rb_imy, 20, 20, this.x-2, this.y-2, 20, 20);
      g_imgcache.draw_s("rotbow_fulldraw_w_string", rb_imx, rb_imy, 20, 20, this.x-2, this.y-2, 20, 20);
    } else {
      //g_imgcache.draw_s("rotbow", rb_imx, rb_imy, 20, 20, this.x-2, this.y-2, 20, 20);
      //g_imgcache.draw_s("rotbow_fulldraw", rb_imx, rb_imy, 20, 20, this.x-2, this.y-2, 20, 20);
      g_imgcache.draw_s("rotbow_fulldraw_w_string", rb_imx, rb_imy, 20, 20, this.x-2, this.y-2, 20, 20);
      g_imgcache.draw_s("noether", t_imgx, t_imgy, 16, 16, this.x, this.y, this.world_w, this.world_h);
    }



    g_imgcache.draw_s("arrow", a_imx, a_imy, 16, 16, this.x+ax, this.y+ay, this.world_w, this.world_h);

  }

  if (this.debug_flag) {
    var x0 = this.player_bbox[0][0];
    var y0 = this.player_bbox[0][1];
    var x1 = this.player_bbox[1][0];
    var y1 = this.player_bbox[1][1];
    g_painter.drawRectangle(x0,y0, x1-x0, y1-y0, 1, "rgba(255,0,0,0.6)");

  }

  for (var i=0; i<this.puff.pos.length; i++) {
    var s = Math.floor( 4*this.puff.ttl[i]/this.puffTTL ) + 1;

    var x = Math.floor(this.puff.pos[i][0] - s/2);
    var y = Math.floor(this.puff.pos[i][1] - s/2);

    var a = this.puff.alpha[i];
    //var c = "rgba(0,0,0," + a +")";
    //var c = "rgba(158,158,158," + a +")";
    var c = "rgba(250,250,250," + a +")";
    //g_painter.drawPoint(x, y, c, s);

    var puff_frame = Math.floor( 4*(this.puffTTL - this.puff.ttl[i])/this.puffTTL );
    if (puff_frame==4) { continue; }
    var imx = 4*puff_frame;
    var imy = 4*this.puff.d[i];
    g_imgcache.draw_s("puff", imx, imy, 4, 4, x, y, 4, 4, 0, a);
  }

  /*
  for (var i=0; i<this.puffObject.pos.length; i++) {
    var x = this.puffObject.pos[i][0];
    var y = this.puffObject.pos[i][1];
    var s = this.puffObject.psize[i];
    var a = this.puffObject.alpha[i];
    //var c = "rgba(0,0,0," + a +")";
    //var c = "rgba(158,158,158," + a +")";
    var c = "rgba(250,250,250," + a +")";
    g_painter.drawPoint(x, y, c, s);
  }
  */

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

