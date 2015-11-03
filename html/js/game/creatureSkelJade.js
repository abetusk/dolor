function creatureSkelJade(x,y, init_info) {
  this.x = ((typeof x === "undefined")?0:x);
  this.y = ((typeof y === "undefined")?0:y);
  this.d = "right";

  this.debug = true;

  var cx = 0;
  var cy = 0;

  this.teleport_schedule = [];
  for (var i=0; i<init_info.teleport_schedule.length; i++) {
    var ele = init_info.teleport_schedule[i];
    var tele_ele = {};
    tele_ele["x"] = ele.x;
    tele_ele["y"] = ele.y;
    this.teleport_schedule.push(tele_ele);

    cx += ele.x;
    cy += ele.y;
  }

  cx /= this.teleport_schedule.length;
  cy /= this.teleport_schedule.length;

  this.finished = false;
  this.x = Math.floor(cx/16)*16;
  this.y = Math.floor(cy/16)*16;


  this.item_alpha_delay = 0;
  this.item_alpha_delay_max = 100;
  this.item_alpha = 0.0;

  this.item_visible = false;
  this.itemx = this.x;
  this.itemy = this.y-32;
  this.item_bounding_box = [[this.itemx, this.itemy],[this.itemx+16,this.itemy+16]];

  this.creature_tele_n = 2;

  this.world_w = g_GRIDSIZE;
  this.world_h = g_GRIDSIZE*2;

  this.keyFrame = 0;
  this.keyFrameN = 8;

  this.activate_r = 4*16;

  this.frameDelayN = [ 16, 8, 8, 16, 8, 8, 8, 8 ];
  this.frameDelay = this.frameDelayN[0];

  var tot_frame_delay = 0;
  for (var ii=0; ii<this.frameDelayN.length; ii++) {
    tot_frame_delay += this.frameDelayN[ii];
  }

  this.frameRow = 0;
  this.frameRowN = 6;

  this.actionRow = {
    "float_right": 0,
    "float_left": 1,
    "rise_right":2,
    "rise_left":3,
    "magic_right":4,
    "magic_left":5
  };

  this.bounding_box = [[0,0],[0,0]]
  this.hit_bounding_box = [[0,0],[0,0]]

  this.actionState = "float_right";

  // "wait", "mirror", "attack", "dead"
  this.state = "wait";

  //DEBUG
  //this.state = "mirror";

  this.state_info = {
    "wait" : { "next":"mirror" },
    "mirror" : {
      "pos_idx": 0,
      "next": "attack",
      "delay": 0,
      "delay_N": 60*3
    },
    "attack" : {
      "next" : "mirror",
      "delay": 0,
      "delay_N": tot_frame_delay
    },
    "pain" : {
      "next": "mirror",
      "frameDelayN":[16,16,16],
      "framePos":[7,6,5],
      "flashFreq":5,
      "delay": 0,
      "delay_N": 16*3
    },
    "dead" : {
      "next":"dead",
      "delay": 0,
      "delay_N": tot_frame_delay,
      "final":true
    }
  };

  this.item_fluff = {
  };

  console.log("skel");

  this.hp = 8*3;
}

creatureSkelJade.prototype.init = function(x,y, d) {
  x = ((typeof x === "undefined") ? this.x : x);
  y = ((typeof y === "undefined") ? this.y : y);
  d = ((typeof d === "undefined") ? this.d : d);

  this.x = x;
  this.y = y;
  this.d = d;

  this.update_hit_bbox(this.hit_bounding_box, this.x, this.y);
  this.update_bbox(this.bounding_box,this.x,this.y);

  this.d = "right";
  this.frameRow = 0;

  this.update_intent(this.d);
}

creatureSkelJade.prototype.update_hit_bbox = function(bbox,x,y) {
  bbox[0][0] = x + 2;
  bbox[0][1] = y + 0;

  bbox[1][0] = x + 14;
  bbox[1][1] = y + 31;
}

creatureSkelJade.prototype.update_bbox = function(bbox,x,y) {
  bbox[0][0] = x;
  bbox[0][1] = y;

  bbox[1][0] = x + 15;
  bbox[1][1] = y + 31;
}

creatureSkelJade.prototype.hit = function(damage) {

  if (this.state=="pain") { return false; }

  this.hp -= damage;
  if (this.hp<=0) {
    this.hp = 0;
    this.state="dead";
    g_sfx["boss-death"][0].play();

    this.frameDelay=8;
    this.keyFrame=7;
    this.frameRow = 2;
    if (this.d=="left") { this.frameRow=3; }

    this.item_visible=true;

    // add a halo to item that just appeard
    //
    var halo = new particleRising(this.itemx, this.itemy);
    g_world.particle.push(halo);


  }

  else {

    this.state = "pain";
    this.state_info.pain.delay = 0;
    g_sfx["boss-pain"][0].play();

  }


  this.state_modifier = "ouch";

  return true;
}

creatureSkelJade.prototype.attack = function(world) {
  var rdir = [
    { "x":-32, "y":  0 },
    { "x": 32, "y":  0 },
    { "x":  0, "y": 32 },
    { "x":  0, "y":-32 }
  ];
  var creature_tele_ind = [];

  for (var ii=0; ii<world.enemy.length; ii++) {
    if ((world.enemy[ii].name=="knight") || (world.enemy[ii].name=="floatskull")) {
      creature_tele_ind.push(ii);
    }
  }


  var mm = this.creature_tele_n;
  if (mm>creature_tele_ind.length) { mm = creature_tele_ind.length; }

  for (var ii=0; ii<mm; ii++) {
    var pos = Math.floor((Math.random()*(creature_tele_ind.length-ii))+ii);

    var t = creature_tele_ind[ii];
    creature_tele_ind[ii] = creature_tele_ind[pos];
    creature_tele_ind[pos] = t;

    var rr = Math.floor(Math.random()*4);
    var idx = creature_tele_ind[ii];

    world.enemy[idx].set_intent(world.player.x + rdir[rr].x, world.player.y + rdir[rr].y)
    world.enemy[idx].skip_intent = true;  // little bit of a misnomer, skip 'update_intent'
  }

}

creatureSkelJade.prototype.update = function(world) {
  this.frameDelay--;
  
  if (this.state=="wait") {
    if ( (Math.abs(world.player.x-this.x) < this.activate_r) &&
         (Math.abs(world.player.y-this.y) < this.activate_r) )
    {
      this.state = "mirror";
      this.x = this.teleport_schedule[this.state_info.mirror.pos_idx].x;
      this.y = this.teleport_schedule[this.state_info.mirror.pos_idx].y;
      this.actionState = "float_right";
      this.keyFrame=0;
    }
  } else if (this.state == "mirror") {
    this.state_info.mirror.delay++;
    if (this.state_info.mirror.delay >= this.state_info.mirror.delay_N) {
      this.state_info.mirror.delay = 0;
      this.state = this.state_info.mirror.next;
      this.state_info.mirror.pos_idx++;
      this.state_info.mirror.pos_idx%=8;
      this.actionState = "magic_right";
      this.keyFrame=0;
    }
  } else if (this.state == "attack") {
    this.state_info.attack.delay++;
    if (this.state_info.attack.delay >= this.state_info.attack.delay_N) {
      this.state_info.attack.delay = 0;
      this.state = this.state_info.attack.next;


      this.x = this.teleport_schedule[this.state_info.mirror.pos_idx].x;
      this.y = this.teleport_schedule[this.state_info.mirror.pos_idx].y;

      this.actionState = "float_right";
      this.keyFrame=0;
      this.attack(world);

    }
  } else if (this.state == "pain") {
    this.state_info.pain.delay++;
    if (this.state_info.pain.delay>=this.state_info.pain.delay_N) {
      this.state_info.pain.delay = 0;
      this.state = this.state_info.pain.next;

      this.state_info.mirror.pos_idx++;
      this.state_info.mirror.pos_idx%=8;

      this.x = this.teleport_schedule[this.state_info.mirror.pos_idx].x;
      this.y = this.teleport_schedule[this.state_info.mirror.pos_idx].y;

      this.actionState = "float_right";
      this.keyFrame=0;

    }
  } else if (this.state == "dead") {


    if (!this.finished) {
      this.state_info.dead.delay++;
      if (this.state_info.dead.delay == this.state_info.dead.delay_N) {
        this.finished = true;

        g_sfx["item-appear"][0].play();
      }
    } else {

      if (this.item_visible) {

        this.item_alpha_delay++;
        if (this.item_alpha_delay>this.item_alpha_delay_max) {
          this.item_alpha_delay = this.item_alpha_delay_max;
        }
        this.item_alpha = this.item_alpha_delay/this.item_alpha_delay_max;

        var player_bbox = world.player.playerBBox();
        if (box_box_intersect(this.item_bounding_box, player_bbox)) {
          g_sfx["powerup"][0].play();

          this.item_visible=false;
          world.player.item_wand = true;

        }
      }
    }

    // absorbing
    //

  }

  if (this.state!="dead") {
    var parts = this.actionState.split("_");
    if (world.player.x < this.x) {
      this.actionState = parts[0] + "_left";
      this.d = "left";
    } else {
      this.actionState = parts[0] + "_right";
      this.d = "right";
    }
    this.frameRow = this.actionRow[this.actionState];

    if (this.frameDelay==0) {
      this.keyFrame++;
      this.keyFrame = this.keyFrame % this.keyFrameN;
      this.frameDelay = this.frameDelayN[this.keyFrame];
    }
  } else {
    if (this.frameDelay==0) {
      this.keyFrame--;
      if (this.keyFrame<0) { this.keyFrame=0; }
      this.frameDelay = this.frameDelayN[this.keyFrame];
    }
  }


  this.update_hit_bbox(this.hit_bounding_box, this.x, this.y);
  this.update_bbox(this.bounding_box, this.x, this.y);
}

creatureSkelJade.prototype.draw = function() {
  var imgx = 16*this.keyFrame;
  var imgy = this.frameRow*32;

  if ((this.state == "wait") || (this.state=="dead") || (this.state=="attack")) {
    g_imgcache.draw_s("skel_jade", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
  } else if (this.state == "mirror") {

    for (var ii=0; ii<this.teleport_schedule.length; ii++) {
      var mx = this.teleport_schedule[ii].x;
      var my = this.teleport_schedule[ii].y;
      g_imgcache.draw_s("skel_jade", imgx, imgy, 16, 32, mx, my, this.world_w, this.world_h);
    }
  } else if (this.state == "pain") {

    if ((Math.floor(this.state_info.pain.delay/this.state_info.pain.flashFreq)%2) == 1) {
      g_imgcache.draw_s("skel_jade", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
    } else {
      g_imgcache.draw_s("skel_mask", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
    }
  }

  if (this.item_visible) {
    g_imgcache.draw_s("item", 0, 16, 16, 16, this.itemx, this.itemy, 16, 16, -Math.PI/2.0, this.item_alpha);
  }


  if (this.debug) {
    var x0 = this.bounding_box[0][0];
    var y0 = this.bounding_box[0][1];
    var x1 = this.bounding_box[1][0];
    var y1 = this.bounding_box[1][1];

    g_painter.drawRectangle(x0,y0, x1-x0, y1-y0, 1, "rgba(255,0,0,0.6)");

    x0 = this.hit_bounding_box[0][0];
    y0 = this.hit_bounding_box[0][1];
    x1 = this.hit_bounding_box[1][0];
    y1 = this.hit_bounding_box[1][1];

    g_painter.drawRectangle(x0,y0, x1-x0, y1-y0, 1, "rgba(255,0,0,0.6)");

    x0 = this.item_bounding_box[0][0];
    y0 = this.item_bounding_box[0][1];
    x1 = this.item_bounding_box[1][0];
    y1 = this.item_bounding_box[1][1];

    g_painter.drawRectangle(x0,y0, x1-x0, y1-y0, 1, "rgba(255,255,0,0.6)");
  }

}
