function creatureSkelBlood(x,y, init_info) {
  this.x = ((typeof x === "undefined")?0:x);
  this.y = ((typeof y === "undefined")?0:y);
  this.d = "right";

  this.name = "skel_blood";

  this.debug = false;

  this.finished = false;

  this.waypoint = [];
  if ("waypoint" in init_info) {
    if (init_info.waypoint.length>0) {
      var xy = {"x": init_info.waypoint[0].x, "y":init_info.waypoint[0].y};
      this.waypoint.push(xy);
      this.cx = xy.x;
      this.cy = xy.y;
    }
  }

  this.ellipse_x = 8*16;
  this.ellipse_y = 6*16;
  this.v = 2;

  this.fx = this.cx;
  this.fy = this.cy;
  this.x = this.cx;
  this.y = this.cy;

  this.item_alpha_delay = 0;
  this.item_alpha_delay_max = 100;
  this.item_alpha = 0.0;

  this.itemx = this.cx;
  this.itemy = this.cy;

  this.creature_tele_n = 2;

  this.world_w = g_GRIDSIZE;
  this.world_h = g_GRIDSIZE*2;

  this.keyFrame = 0;
  this.keyFrameN = 8;

  this.activate_r = 16*16;

  this.frameDelayN = [ 16, 8, 8, 16, 8, 8, 8, 8 ];
  this.frameDelay = this.frameDelayN[0];

  var tot_frame_delay = 0;
  for (var ii=0; ii<this.frameDelayN.length; ii++) {
    tot_frame_delay += this.frameDelayN[ii];
  }

  this.frameRow = 0;
  this.frameRowN = 6;

  this.actionRow = {
    "right":0,
    "left":1,
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

  this.state = "wait";

  this.start_x = 0;
  this.start_y = 0;
  this.end_x = 0;
  this.end_y = 0;


  this.state_info = {
    "wait" : { "next":"prepare" },
    "prepare" : {
      "next":"position",
      "delay":0,
      "delay_N":30
    },
    "position" : {
      "next":"shoot",
      "delay":0,
      "delay_N":60
    },
    "shoot" : {
      "next":"prepare",
      "delay":0,
      "delay_N":tot_frame_delay
    },
    "pain" : {
      "next": "prepare",
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

  this.drop_delay = 0;
  this.drop_delay_N = 20;

  this.hp = 8*3;

  this.debug_line=[];
}

creatureSkelBlood.prototype.init = function(x,y, d) {
  x = ((typeof x === "undefined") ? this.x : x);
  y = ((typeof y === "undefined") ? this.y : y);
  d = ((typeof d === "undefined") ? this.d : d);

  this.x = x;
  this.y = y;
  this.d = d;

  this.update_hit_bbox(this.hit_bounding_box,this.x,this.y);
  this.update_bbox(this.bounding_box,this.x,this.y);

  this.d = "right";
  this.frameRow = 0;

  this.update_intent(this.d);
}

creatureSkelBlood.prototype.update_hit_bbox = function(bbox,x,y) {
  bbox[0][0] = x + 2;
  bbox[0][1] = y + 0;

  bbox[1][0] = x + 14;
  bbox[1][1] = y + 31;
}

creatureSkelBlood.prototype.update_bbox = function(bbox,x,y) {
  bbox[0][0] = x;
  bbox[0][1] = y;

  bbox[1][0] = x + 15;
  bbox[1][1] = y + 31;
}


creatureSkelBlood.prototype.occupy_hit = function(bbox) {

  if (this.state == "pain") { return false; }
  if (box_box_intersect(this.hit_bounding_box, bbox)) {
    return true;
  }

  return false;
}

creatureSkelBlood.prototype.update_position_perim  = function(world) {
}

creatureSkelBlood.prototype.update_position = function(world) {

  var dvx = this.cx - world.player.x;
  var dvy = this.cy - world.player.y;

  var mind=4;

  if ((Math.abs(dvx)<mind) && (Math.abs(dvy)<mind)) {
    dvx = this.x - this.cx;
    dvy = this.y - this.cy;
  }

  if ((Math.abs(dvx)<1) && (Math.abs(dvy)<1)) {
    dvx = 0;
    dvy = 1;
  }

  this.debug_line = [];
  //this.debug_line.push([dvx,dvy, "rbga(0,0,255,0.5)"]);


  var a = Math.atan2(dvy, dvx);

  var dstx = this.ellipse_x * Math.cos(a);
  var dsty = this.ellipse_y * Math.sin(a);

  var dstl = Math.sqrt(dstx*dstx + dsty*dsty);
  dstx += this.cx;
  dsty += this.cy;

  dvx = dstx - this.fx;
  dvy = dsty - this.fy;

  if ((Math.abs(dvx)<=1) && (Math.abs(dvy)<=1)) {
    return;
  }


  //this.debug_line.push([dvx, dvy, "rgba(0,255,0,0.5)"]);

  var r = Math.sqrt(dvx*dvx + dvy*dvy);

  var v = this.v;

  if (r<2) { v = 1; }

  this.fx += (v * dvx / r);
  this.fy += (v * dvy / r);

  this.x = Math.floor(this.fx);
  this.y = Math.floor(this.fy);

  this.debug_line.push([Math.floor(this.v * dvx / r),Math.floor(this.v * dvy / r), "rgba(255,0,255,0.5)"]);

  return;

  var dx = this.x - this.cx;
  var dy = this.y - this.cy;

  var posl = Math.sqrt(dx*dx + dy*dy);

  if (posl>dstl) {
    this.x = Math.floor(dstx);
    this.y = Math.floor(dsty);
  }

}

creatureSkelBlood.prototype.player_angle_step = function(world) {
  var dx = world.player.x - this.x;
  var dy = world.player.y - this.y;
  var a = -Math.atan2(dy, dx);

  a += Math.PI*2.0;
  return Math.floor( Math.floor((32*a/(2.0*Math.PI)) + 0.5) % 32 );
}

creatureSkelBlood.prototype.hit = function(damage, bbox) {

  if (this.state=="pain") { return false; }

  if (!box_box_intersect(this.hit_bounding_box, bbox)) { return false; }

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

creatureSkelBlood.prototype.update = function(world) {
  this.frameDelay--;

  if (this.state=="wait") {
    if ( (Math.abs(world.player.x-this.x) < this.activate_r) &&
         (Math.abs(world.player.y-this.y) < this.activate_r) )
    {

      this.state = this.state_info.wait.next;
      this.keyFrame=1;
      this.frameDelay=8;
      this.state_info[this.state].delay = 0;

    }
    this.update_position(world);
  }

  else if (this.state == "prepare") {
    this.update_position(world);

    var prepare = this.state_info.prepare;
    prepare.delay++;
    if (prepare.delay >= prepare.delay_N) {
      prepare.delay=0;
      this.state = prepare.next;
      this.state_info[this.state].delay = 0;
    }

  }

  else if (this.state == "position") {

    this.update_position(world);

    var position = this.state_info.position;
    position.delay++;
    if (position.delay >= position.delay_N) {
      position.delay=0;
      this.state = position.next;
      this.state_info[this.state].delay = 0;

      //this.frameRow = 1;
    }

  }

  else if (this.state == "shoot") {

    this.update_position(world);

    var shoot = this.state_info.shoot;
    shoot.delay++;
    if (shoot.delay >= shoot.delay_N) {
      shoot.delay=0;
      this.state = shoot.next;
      this.state_info[this.state].delay = 0;



      this.arrow_intent  = { "type" : "shootArrow",
        "x" : this.x,
        "y" : this.y,
        "dx" : 0,
        "dy" : 1,
        "a_step" : this.player_angle_step(world),
        "a_step_n" : 32,
        "a" : 2.0*Math.PI*(0/32),
        "d" : "up" };
      var arrow = new itemArrow(this.arrow_intent);

      world.element.push(arrow);

    }

  }

  else if (this.state == "pain") {

    var pain = this.state_info.pain;

    pain.delay++;
    if (pain.delay >= pain.delay_N) {
      pain.delay = 0;
      this.state = pain.next;
      this.state_info[this.state].delay = 0;

      this.actionState = "float_right";
      this.keyFrame=1;

    }
  }

  else if (this.state == "dead") {

    var dead = this.state_info.dead;

    if (!this.finished) {
      dead.delay++;
      if (dead.delay == dead.delay_N) {
        this.finished = true;

        // Make the wand appear for player to pickup
        //
        var cb = function() {
          g_player.item_bow = true;

          var item_count=0;
          if (g_player.item_shield) { item_count++; }
          if (g_player.item_wand) { item_count++; }
          if (g_player.item_bow) { item_count++; }
          if (g_player.item_bomb) { item_count++; }

          var song_name = "item-" + item_count;
          g_music[song_name].volume(1);
          g_music[song_name].play();
        };

        var bowItem = new customItemAppear(this.itemx, this.itemy, {"name":"bow", "callback":cb});
        bowItem.add_item({"name":"arrow"});
        world.custom.push(bowItem);

      }
    } else {

    }

    // absorbing
    //

  }



  if (this.state!="dead") {

    this.d = ((world.player.x < this.x) ? "left" : "right");

    if (this.state == "shoot") {
      this.frameRow = this.actionRow["magic_" + this.d];
    } else {
      this.frameRow = this.actionRow[this.d];
    }

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

creatureSkelBlood.prototype.draw = function() {
  var imgx = 16*this.keyFrame;
  var imgy = this.frameRow*32;

  if ((this.state == "wait") || (this.state=="position") || (this.state=="prepare") || (this.state=="shoot")) {
    g_imgcache.draw_s("skel_blood", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
  }

  else if (this.state == "pain") {

    if ((Math.floor(this.state_info.pain.delay/this.state_info.pain.flashFreq)%2) == 1) {
      g_imgcache.draw_s("skel_blood", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
    } else {
      g_imgcache.draw_s("skel_mask", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
    }

  }

  else if (this.state == "dead") {
    if (!this.finished) {
      if ((Math.floor(this.state_info.dead.delay/this.state_info.dead.flashFreq)%2) == 1) {
        g_imgcache.draw_s("skel_blood", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
      } else {
        g_imgcache.draw_s("skel_mask", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
      }
    } else {
      g_imgcache.draw_s("skel_blood", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
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

    for (var i=0; i<this.debug_line.length; i++) {
      var v = this.debug_line[i];
      g_painter.line(this.x, this.y, this.x + v[0], this.y + v[1], v[2], 1);
    }
  }

}
