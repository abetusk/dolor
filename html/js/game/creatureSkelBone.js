function creatureSkelBone(x,y, init_info) {
  this.x = ((typeof x === "undefined")?0:x);
  this.y = ((typeof y === "undefined")?0:y);
  this.d = "right";

  this.name = "skel_bone";

  this.debug = false;

  var cx = 0;
  var cy = 0;

  this.finished = false;

  this.waypoint = [];
  if ("waypoint" in init_info) {
    for (var i=0; i<init_info.waypoint.length; i++) {
      var xy = {"x": init_info.waypoint[i].x, "y":init_info.waypoint[i].y};
      this.waypoint.push(xy);
      
      cx += xy.x;
      cy += xy.y;

      if (i==0) {
        this.x = xy.x;
        this.y = xy.y;
      } else {
        if ((xy.x <= this.x) && (xy.y <= this.y)) {
          this.x = xy.x;
          this.y = xy.y;
        }
      }
    }
  }

  this.waypoint_idx=0;
  this.waypoint_n = 1;
  if (this.waypoint.length > 0) {
    this.waypoint_n = this.waypoint.length;
  }

  if (this.waypoint.length>0) {
    cx /= this.waypoint.length;
    cy /= this.waypoint.length;
  }

  cx = Math.floor(cx/16)*16;
  cy = Math.floor(cy/16)*16;

  this.item_alpha_delay = 0;
  this.item_alpha_delay_max = 100;
  this.item_alpha = 0.0;

  this.cx = cx;
  this.cy = cy;

  this.itemx = cx;
  this.itemy = cy;

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
      "next":"bomber",
      "delay":0,
      "delay_N":60
    },
    "bomber" : {
      "next":"prepare",
      "delay":0,
      "delay_N":120
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
}

creatureSkelBone.prototype.init = function(x,y, d) {
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

creatureSkelBone.prototype.update_hit_bbox = function(bbox,x,y) {
  bbox[0][0] = x + 2;
  bbox[0][1] = y + 0;

  bbox[1][0] = x + 14;
  bbox[1][1] = y + 31;
}

creatureSkelBone.prototype.update_bbox = function(bbox,x,y) {
  bbox[0][0] = x;
  bbox[0][1] = y;

  bbox[1][0] = x + 15;
  bbox[1][1] = y + 31;
}


creatureSkelBone.prototype.occupy_hit = function(bbox) {

  if (this.state == "pain") { return false; }
  if (box_box_intersect(this.hit_bounding_box, bbox)) {
    return true;
  }

  return false;
}

creatureSkelBone.prototype.setup_bomber = function() {
  if (this.waypoint.length==0) { return; }

  //var p = Math.floor(Math.random()*this.waypoint.length);
  var p = (this.waypoint_idx+1)%this.waypoint_n;

  this.start_x = this.x;
  this.start_y = this.y;

  this.end_x = this.waypoint[p].x;
  this.end_y = this.waypoint[p].y;

  this.waypoint_idx=p;
}

creatureSkelBone.prototype.hit = function(damage, bbox) {

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

creatureSkelBone.prototype.update = function(world) {
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
  }

  else if (this.state == "prepare") {

    var prepare = this.state_info.prepare;
    prepare.delay++;
    if (prepare.delay >= prepare.delay_N) {
      prepare.delay=0;
      this.state = prepare.next;
      this.state_info[this.state].delay = 0;

      this.setup_bomber();
    }

  }

  else if (this.state == "bomber") {

    var bomber = this.state_info.bomber;
    bomber.delay++;
    if (bomber.delay >= bomber.delay_N) {
      bomber.delay = 0;
      this.x = this.end_x;
      this.y = this.end_y;
      this.state = bomber.next;

    } else {
      var t = bomber.delay / bomber.delay_N;
      this.x = Math.floor(this.start_x + (this.end_x - this.start_x)*t);
      this.y = Math.floor(this.start_y + (this.end_y - this.start_y)*t);
    }

    this.drop_delay++;
    if (this.drop_delay >= this.drop_delay_N) {
      this.drop_delay=0;
      
      var tbbox = [[0,0],[0,0]];
      tbbox[0][0] = this.x;
      tbbox[0][1] = this.y+16;
      tbbox[1][0] = this.x+16;
      tbbox[1][1] = this.y+32;

      if (!world.bbox_level_collision(tbbox)) {
        var bo = new itemBomb({"x": this.x, "y":this.y+16, "dx":0, "dy":0, "d":"none"});
        bo.x = this.x;
        bo.y = this.y+16;
        world.element.push(bo);
      }

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
        var cb = function() { g_player.item_bomb = true; }
        var bombItem = new customItemAppear(this.itemx, this.itemy, {"name":"bomb", "callback":cb});
        world.custom.push(bombItem);

      }
    } else {

    }

    // absorbing
    //

  }



  if (this.state!="dead") {

    if (this.state == "bomber") {
      this.d = (((this.end_x - this.x)>0) ? "right" : "left");
    } else {
      this.d = (((this.cx - this.x)>0) ? "right" : "left");
    }
    this.frameRow = this.actionRow[this.d];

    /*
    var parts = this.actionState.split("_");
    if (world.player.x < this.x) {
      this.actionState = parts[0] + "_left";
      this.d = "left";
    } else {
      this.actionState = parts[0] + "_right";
      this.d = "right";
    }
    */

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

creatureSkelBone.prototype.draw = function() {
  var imgx = 16*this.keyFrame;
  var imgy = this.frameRow*32;

  if ((this.state == "wait") || (this.state=="bomber") || (this.state=="prepare")) {
    g_imgcache.draw_s("skel_bone", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
  }

  else if (this.state == "pain") {

    if ((Math.floor(this.state_info.pain.delay/this.state_info.pain.flashFreq)%2) == 1) {
      g_imgcache.draw_s("skel_bone", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
    } else {
      g_imgcache.draw_s("skel_mask", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
    }

  }

  else if (this.state == "dead") {
    if (!this.finished) {
      if ((Math.floor(this.state_info.dead.delay/this.state_info.dead.flashFreq)%2) == 1) {
        g_imgcache.draw_s("skel_bone", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
      } else {
        g_imgcache.draw_s("skel_mask", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
      }
    } else {
      g_imgcache.draw_s("skel_bone", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
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
