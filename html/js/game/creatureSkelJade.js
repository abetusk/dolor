function creatureSkelJade(x,y, init_info) {
  this.x = ((typeof x === "undefined")?0:x);
  this.y = ((typeof y === "undefined")?0:y);
  this.d = "right";

  this.name = "skel_jade";
  this.debug = false;

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

  this.itemx = this.x;
  this.itemy = this.y-32;

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
  this.hit_bounding_box_actual = [[0,0],[0,0]]

  this.actionState = "float_right";

  this.state = "wait";

  this.mirage_delay = 0;
  this.mirage_delay_N = 8*3;
  this.mirage_frameDelay = [8,8,8];
  this.mirage_keyFrame = 1;
  this.mirage_active = false;
  this.mirage_frameRow = 0;

  this.cur_teleport_idx = 0;
  this.fuzz_mirage = false;
  this.fuzz_mirage_idx = 0;
  this.fuzz_counter = 0;
  this.fuzzRow = 0;
  this.fuzz_frame_delay = 4;

  this.fuzz_cool_off = 0;
  this.fuzz_sound_delay = 0;

  this.state_info = {
    "wait" : { "next":"teleport_out" },
    "teleport_out" : {
      "next":"teleport_in",
      "keyFrameN":4,
      "frameDelay" : [8, 8, 8, 8],
      "delay":0,
      "delay_N":8*3
    },
    "teleport_in" : {
      "next":"mirror",
      "keyFrameN":4,
      "frameDelay" : [8, 8, 8],
      "delay":0,
      "delay_N":8*3
    },
    "mirror" : {
      "pos_idx": 7,
      "next": "attack",
      "delay": 0,
      "delay_N": 60*3
    },
    "attack" : {
      "next" : "teleport_out",
      "mirage_delay":0,
      "mirage_keyFrame":1,
      "mirage_delay_N":8*3,
      "delay": 0,
      "delay_N": tot_frame_delay

    },
    "pain" : {
      "next": "teleport_out",
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
      "flashFreq":5,
      "final":true
    }
  };

  this.item_fluff = {
  };

  this.hp = 8*3;
}

creatureSkelJade.prototype.init = function(x,y, d) {
  x = ((typeof x === "undefined") ? this.x : x);
  y = ((typeof y === "undefined") ? this.y : y);
  d = ((typeof d === "undefined") ? this.d : d);

  this.x = x;
  this.y = y;
  this.d = d;

  this.update_dummy_bbox(this.hit_bounding_box);
  this.update_hit_bbox(this.hit_bounding_box_actual, this.x, this.y);
  this.update_bbox(this.bounding_box,this.x,this.y);

  this.d = "right";
  this.frameRow = 0;

  this.update_intent(this.d);
}

creatureSkelJade.prototype.update_dummy_bbox = function(bbox) {

  var mx = this.x;
  var my = this.y;
  var Mx = this.x+16;
  var My = this.y+32;
  for (var i=0; i<this.teleport_schedule.length; i++) {
    var tx = this.teleport_schedule[i].x;
    var ty = this.teleport_schedule[i].y;
    var Tx = tx+16;
    var Ty = ty+32;

    if (mx > tx) { mx=tx; }
    if (my > ty) { my=ty; }
    if (mx > Tx) { mx=Tx; }
    if (my > Ty) { my=Ty; }

    if (Mx < tx) { Mx=tx; }
    if (My < ty) { My=ty; }
    if (Mx < Tx) { Mx=Tx; }
    if (My < Ty) { My=Ty; }
  }

  bbox[0][0] = mx;
  bbox[0][1] = my;
  bbox[1][0] = Mx;
  bbox[1][1] = My;
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

creatureSkelJade.prototype.fuzz_hit = function(bbox) {
  var tbbox = [[0,0],[0,0]];

  if (this.state != "mirror") { return; }

  for (var i=0; i<this.teleport_schedule.length; i++) {
    if (i==this.cur_teleport_idx) { continue; }

    tbbox[0][0] = this.teleport_schedule[i].x;
    tbbox[0][1] = this.teleport_schedule[i].y;
    tbbox[1][0] = this.teleport_schedule[i].x+16;
    tbbox[1][1] = this.teleport_schedule[i].y+32;

    if (box_box_intersect(tbbox, bbox)) {
      this.fuzz_mirage = true;
      this.fuzz_mirage_idx = i;
    }

  }

  if (this.fuzz_mirage && (this.fuzz_counter==0) && (this.fuzz_cool_off==0)) {
    this.fuzz_counter=this.fuzz_frame_delay*3;
    this.fuzz_cool_off = this.fuzz_frame_delay*5;

    if (this.fuzz_sound_delay==0) {
      var n = Math.floor(Math.random()*g_sfx["fuzz"].length);
      g_sfx["fuzz"][n].play();
      this.fuzz_sound_delay = 60;
    }

  }

}


creatureSkelJade.prototype.occupy_hit = function(bbox) {
  this.fuzz_hit(bbox);

  if (this.state == "teleport_in") { return false; }
  else if (this.state == "teleport_out") { return false; }

  if (box_box_intersect(this.hit_bounding_box_actual, bbox)) {
    return true;
  }
  return false;
}

creatureSkelJade.prototype.hit = function(damage, bbox) {

  if (this.state == "teleport_in") { return false; }
  else if (this.state == "teleport_out") { return false; }
  else if (this.state=="pain") { return false; }

  this.fuzz_hit(bbox);

  if (!box_box_intersect(this.hit_bounding_box_actual, bbox)) { return false; }

  this.hp -= damage;
  if (this.hp<=0) {
    this.hp = 0;
    this.state="dead";
    g_sfx["boss-death"][0].play();

    this.frameDelay=8;
    this.keyFrame=7;
    this.frameRow = 2;
    if (this.d=="left") { this.frameRow=3; }
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

  g_sfx["jade-attack"][0].play();
  //g_sfx["teleport"][0].play();

  var mm = this.creature_tele_n;
  if (mm>creature_tele_ind.length) { mm = creature_tele_ind.length; }

  for (var ii=0; ii<mm; ii++) {
    var pos = Math.floor((Math.random()*(creature_tele_ind.length-ii))+ii);

    var t = creature_tele_ind[ii];
    creature_tele_ind[ii] = creature_tele_ind[pos];
    creature_tele_ind[pos] = t;

    var rr = Math.floor(Math.random()*4);
    var idx = creature_tele_ind[ii];

    if ("teleport_intent" in world.enemy[idx]) {
      world.enemy[idx].teleport_intent(world.player.x + rdir[rr].x, world.player.y + rdir[rr].y);
    }

  }

}

creatureSkelJade.prototype.update = function(world) {
  this.frameDelay--;

  this.fuzz_counter--;
  if (this.fuzz_counter<=0) {
    this.fuzz_counter=0;
    this.fuzz_mirage = false;
  } else {
    this.fuzzRow = ((world.player.x < this.x) ? 1 : 0);
  }

  this.fuzz_cool_off--;
  if (this.fuzz_cool_off<=0) { this.fuzz_cool_off=0; }

  this.fuzz_sound_delay--;
  if (this.fuzz_sound_delay<=0) { this.fuzz_sound_delay=0; }

  if (this.state=="wait") {
    if ( (Math.abs(world.player.x-this.x) < this.activate_r) &&
         (Math.abs(world.player.y-this.y) < this.activate_r) )
    {
      this.state = this.state_info.wait.next;
      this.keyFrame=1;
      this.frameDelay=8;
    }
  }

  else if (this.state == "teleport_out") {
    this.state_info.teleport_out.delay++;
    if (this.state_info.teleport_out.delay >= this.state_info.teleport_out.delay_N) {
      this.state_info.teleport_out.delay = 0;
      this.state = this.state_info.teleport_out.next;
      this.keyFrame=2;
      this.frameDelay=8;

    }
  }

  else if (this.state == "teleport_in") {
    this.state_info.teleport_in.delay++;
    if (this.state_info.teleport_in.delay >= this.state_info.teleport_in.delay_N) {
      this.state_info.teleport_in.delay = 0;

      this.state = "mirror";
      this.state_info.mirror.pos_idx++;
      this.state_info.mirror.pos_idx%=8;

      this.x = this.teleport_schedule[this.state_info.mirror.pos_idx].x;
      this.y = this.teleport_schedule[this.state_info.mirror.pos_idx].y;

      this.cur_teleport_idx = this.state_info.mirror.pos_idx;
      this.actionState = "float_right";
      this.keyFrame=0;

    }
  }

  else if (this.state == "mirror") {
    this.state_info.mirror.delay++;
    if (this.state_info.mirror.delay >= this.state_info.mirror.delay_N) {
      this.state_info.mirror.delay = 0;
      this.state = this.state_info.mirror.next;

      this.cur_teleport_idx = this.state_info.mirror.pos_idx;

      //this.state_info.mirror.pos_idx++;
      //this.state_info.mirror.pos_idx%=8;
      this.actionState = "magic_right";
      this.keyFrame=0;

      this.mirage_active = true;
      this.mirage_delay = 0;
      this.mirage_keyFrame = 1;

      g_sfx["jade-attack0"][0].play();

    }
  }

  else if (this.state == "attack") {

    //this.update_mirage();

    this.state_info.attack.delay++;
    if (this.state_info.attack.delay >= this.state_info.attack.delay_N) {
      this.state_info.attack.delay = 0;
      this.state = this.state_info.attack.next;


      /*
      this.x = this.teleport_schedule[this.state_info.mirror.pos_idx].x;
      this.y = this.teleport_schedule[this.state_info.mirror.pos_idx].y;
      */

      this.actionState = "float_right";
      this.keyFrame=1;
      this.attack(world);

      g_sfx["teleport"][0].play();
    }
  }

  else if (this.state == "pain") {

    this.state_info.pain.delay++;
    if (this.state_info.pain.delay>=this.state_info.pain.delay_N) {
      this.state_info.pain.delay = 0;
      this.state = this.state_info.pain.next;

      /*
      this.state_info.mirror.pos_idx++;
      this.state_info.mirror.pos_idx%=8;

      this.cur_teleport_idx = this.state_info.mirror.pos_idx;

      this.x = this.teleport_schedule[this.state_info.mirror.pos_idx].x;
      this.y = this.teleport_schedule[this.state_info.mirror.pos_idx].y;
      */

      this.actionState = "float_right";
      this.keyFrame=1;

    }
  }

  else if (this.state == "dead") {


    if (!this.finished) {
      this.state_info.dead.delay++;
      if (this.state_info.dead.delay == this.state_info.dead.delay_N) {
        this.finished = true;

        // Make the wand appear for player to pickup
        //
        var wandItem = new customWand(this.itemx, this.itemy);
        world.custom.push(wandItem);

      }
    } else {

    }

    // absorbing
    //

  }

  if (this.mirage_active) {
    this.mirage_delay++;
    this.mirage_keyFrame = Math.floor(this.mirage_delay/8)+1;
    if (this.mirage_delay>=24) { this.mirage_active = false; }
    this.mirage_frameRow = ((world.player.x < this.x) ? 1 : 0);
  }



  if (this.state!="dead") {

    if (this.state == "teleport_out") {
      this.frameRow = ((world.player.x < this.x) ? 1 : 0);

      if (this.frameDelay==0) {
        var n = this.state_info.teleport_out.keyFrameN;
        this.keyFrame++;
        if (this.keyFrame >= n) { this.keyFrame = n-1; }
        //this.keyFrame = this.keyFrame % this.state_info.teleport_out.keyFrameN;
        this.frameDelay = this.state_info.teleport_out.frameDelay[this.keyFrame];
      }
    }

    else if (this.state == "teleport_in") {
      this.frameRow = ((world.player.x < this.x) ? 1 : 0);

      if (this.frameDelay==0) {
        this.keyFrame--;
        if (this.keyFrame<=0) { this.keyFrame=0; }

        //var n = this.state_info.teleport_in.keyFrameN;
        //this.keyFrame = (n + this.keyFrame - 1 ) % n;
        this.frameDelay = this.state_info.teleport_in.frameDelay[this.keyFrame];
      }

    }

    else {
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
    }

  } else {
    if (this.frameDelay==0) {
      this.keyFrame--;
      if (this.keyFrame<0) { this.keyFrame=0; }
      this.frameDelay = this.frameDelayN[this.keyFrame];
    }
  }


  this.update_dummy_bbox(this.hit_bounding_box);
  this.update_hit_bbox(this.hit_bounding_box_actual, this.x, this.y);

  //this.update_hit_bbox(this.hit_bounding_box, this.x, this.y);

  this.update_bbox(this.bounding_box, this.x, this.y);
}

creatureSkelJade.prototype.draw = function() {
  var imgx = 16*this.keyFrame;
  var imgy = this.frameRow*32;

  if ((this.state == "wait") || (this.state=="attack")) {
    g_imgcache.draw_s("skel_jade", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);

    if (this.mirage_active) {
      var m_imgx = 24*this.mirage_keyFrame;
      var m_imgy = this.mirage_frameRow*40;
      for (var ii=0; ii<this.teleport_schedule.length; ii++) {
        if (ii==this.cur_teleport_idx) { continue; }
        var mx = this.teleport_schedule[ii].x - 4;
        var my = this.teleport_schedule[ii].y - 4;
        g_imgcache.draw_s("skel_jade_tele", m_imgx, m_imgy, 24, 40, mx, my, 24, 40);
      }
    }


  }

  else if (this.state == "mirror") {

    for (var ii=0; ii<this.teleport_schedule.length; ii++) {
      var mx = this.teleport_schedule[ii].x;
      var my = this.teleport_schedule[ii].y;

      if (this.fuzz_mirage && (this.fuzz_mirage_idx==ii)) {

        var m_imgx = 0;
        var m_f = Math.floor(this.fuzz_counter/(this.fuzz_frame_delay*3));
        if (m_f==0) { m_imgx = 24*1; }
        if (m_f==1) { m_imgx = 24*2; }
        if (m_f==2) { m_imgx = 24*1; }

        var m_imgy = this.fuzzRow * 40;
        g_imgcache.draw_s("skel_jade_tele", m_imgx, m_imgy, 24, 40, mx-4, my-4, 24, 40);

      } else {
        g_imgcache.draw_s("skel_jade", imgx, imgy, 16, 32, mx, my, this.world_w, this.world_h);
      }
    }
  }

  else if (this.state == "pain") {

    if ((Math.floor(this.state_info.pain.delay/this.state_info.pain.flashFreq)%2) == 1) {
      g_imgcache.draw_s("skel_jade", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
    } else {
      g_imgcache.draw_s("skel_mask", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
    }

    if (this.mirage_active) {
      var m_imgx = 24*this.mirage_keyFrame;
      var m_imgy = this.mirage_frameRow*40;
      for (var ii=0; ii<this.teleport_schedule.length; ii++) {
        if (ii==this.cur_teleport_idx) { continue; }
        var mx = this.teleport_schedule[ii].x - 4;
        var my = this.teleport_schedule[ii].y - 4;
        g_imgcache.draw_s("skel_jade_tele", m_imgx, m_imgy, 24, 40, mx, my, 24, 40);
      }
    }

  }

  else if (this.state == "dead") {
    if (!this.finished) {
      if ((Math.floor(this.state_info.dead.delay/this.state_info.dead.flashFreq)%2) == 1) {
        g_imgcache.draw_s("skel_jade", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
      } else {
        g_imgcache.draw_s("skel_mask", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
      }
    } else {
      g_imgcache.draw_s("skel_jade", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
    }

    if (this.mirage_active) {
      var m_imgx = 24*this.mirage_keyFrame;
      var m_imgy = this.mirage_frameRow*40;
      for (var ii=0; ii<this.teleport_schedule.length; ii++) {
        if (ii==this.cur_teleport_idx) { continue; }
        var mx = this.teleport_schedule[ii].x - 4;
        var my = this.teleport_schedule[ii].y - 4;
        g_imgcache.draw_s("skel_jade_tele", m_imgx, m_imgy, 24, 40, mx, my, 24, 40);
      }
    }


  }

  else if (this.state == "teleport_out") {
    imgx = 24*this.keyFrame;
    imgy = this.frameRow*40;
    g_imgcache.draw_s("skel_jade_tele", imgx, imgy, 24, 40, this.x-4, this.y-4, 24, 40);
  }

  //else if ((this.state == "teleport_out") || (this.state == "teleport_in")) {
  else if (this.state == "teleport_in") {
    imgx = 24*this.keyFrame;
    imgy = this.frameRow*40;
    for (var ii=0; ii<this.teleport_schedule.length; ii++) {
      var mx = this.teleport_schedule[ii].x - 4;
      var my = this.teleport_schedule[ii].y - 4;
      g_imgcache.draw_s("skel_jade_tele", imgx, imgy, 24, 40, mx, my, 24, 40);
    }
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
  }

}
