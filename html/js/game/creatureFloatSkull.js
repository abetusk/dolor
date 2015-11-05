function creatureFloatSkull() {
  this.x = 0;
  this.y = 0;
  this.d = "down";

  this.skull_type = "yellow"; // "tiel", "purple"
  this.skull_damage_type = "weapon_stun"; // "stun", "damage"

  this.name = "floatskull";
  this.dead_name = "dead_floatskull";

  this.mask_dead_name = "mask_dead_floatskull";
  this.mask_name = "mask_floatskull";

  this.teleport_name = "floatskull_tele";

  this.world_w = g_GRIDSIZE;
  this.world_h = g_GRIDSIZE;

  this.crit_w = g_GRIDSIZE;
  this.crit_h = g_GRIDSIZE;

  this.keyFrame = 0;
  this.keyFrameN = ((typeof nframe === "undefined") ? 3 : nframe);

  this.frameRowDead = 0;
  this.keyFrameDead = 0;
  this.keyFrameDeadN = 6;

  //this.frameDelayN = [ 8, 8, 8, 8 ];
  this.frameDelayN = [];
  for (var i=0; i<2*this.keyFrameN; i++ ) {
    //this.frameDelayN.push(8);
    this.frameDelayN.push(9);
  }

  this.frameDelay = this.frameDelayN[0];

  this.frameRow = 0;
  this.frameRowN = 1;

  this.teleport_delay = 0;
  this.teleport_delay_N = 8*3;
  this.teleport_x = 0;
  this.teleport_y = 0;

  this.debug = false;

  this.choice_delay = 300;
  this.choice_delay_n = 300;

  this.d_lookup = {0:"down", 1:"right", 2:"left", 3:"up"};
  this.frame_lookup = {"down":0, "right":0, "left":0, "up":0};

  this.death_ttl_n = 1000;
  this.death_ttl = this.death_ttl_n;

  this.v = 1;
  this.delay_v_n = 1;
  this.delay_v = this.delay_v_n;

  this.size_x = 12;
  this.size_y = 14;

  this.bounding_box = [[0,0],[0,0]];
  this.hit_bounding_box = [[0,0],[0,0]];
  this.intent = { "d": "down", "x" : this.x, "y" : this.y, "bounding_box":[[0,0],[0,0]], "state":"alive" }
  this.skip_intent = false;

  this.state = "alive";
  this.state_modifier = "ok";

  this.dead_fudge_x = Math.floor(Math.random()*3)+1;
  this.dead_fudge_y = Math.floor(Math.random()*3)-3;

  this.update_intent(this.d);

}

creatureFloatSkull.prototype.init = function(x,y, d) {
  x = ((typeof x === "undefined") ? this.x : x);
  y = ((typeof y === "undefined") ? this.y : y);
  d = ((typeof d === "undefined") ? this.d : d);

  this.x = x;
  this.y = y;
  this.d = d;

  this.update_hit_bbox(this.hit_bounding_box, this.x, this.y);
  this.update_bbox(this.bounding_box,this.x,this.y);

  this.d = "down";
  this.frameRow = 0;

  this.update_intent(this.d);
}

creatureFloatSkull.prototype.update_hit_bbox = function(bbox,x,y) {
  bbox[0][0] = x + 2;
  bbox[0][1] = y + 0;

  bbox[1][0] = x + 14;
  bbox[1][1] = y + 15;
}

creatureFloatSkull.prototype.update_bbox = function(bbox,x,y) {
  bbox[0][0] = x;
  bbox[0][1] = y;

  bbox[1][0] = x + 15;
  bbox[1][1] = y + 15;
}

creatureFloatSkull.prototype.hit = function(damage) {
  return false;
}

creatureFloatSkull.prototype.world_collision = function(world) {
  var d = this.d;
  var new_d = d;

  for (var i=0; i<30; i++) {
    new_d = this.d_lookup[ Math.floor(Math.random()*4) ];
    if (new_d!=d) { break; }
  }

  this.update_intent(new_d);
  this.skip_intent = true;
}

creatureFloatSkull.prototype.set_intent = function(x,y,d) {
  x = ((typeof x === "undefined") ? this.x : x);
  y = ((typeof y === "undefined") ? this.y : y);
  d = ((typeof d === "undefined") ? this.d : d);

  var v = 0;

  this.delay_v--;
  if (this.delay_v <= 0) {
    v = this.v;
    this.delay_v = this.delay_v_n;
  }

  this.intent.x = x;
  this.intent.y = y;
  this.intent.d = d;

  this.update_bbox(this.intent.bounding_box,this.intent.x,this.intent.y);
  this.update_bbox(this.bounding_box,this.x, this.y);
  this.update_hit_bbox(this.hit_bounding_box, this.x, this.y);
}



creatureFloatSkull.prototype.update_intent = function(d) {
  this.intent.d = d;
  this.intent.x = this.x;
  this.intent.y = this.y;

  var v = 0;

  this.delay_v--;
  if (this.delay_v <= 0) {
    v = this.v;
    this.delay_v = this.delay_v_n;
  }


  if (d == "up") {
    this.intent.y = this.y - v;
  } else if (d == "down") {
    this.intent.y = this.y + v;
  } else if (d == "right") {
    this.intent.x = this.x + v;
  } else if (d == "left") {
    this.intent.x = this.x - v;
  }

  this.update_bbox(this.intent.bounding_box,this.intent.x,this.intent.y);
  this.update_bbox(this.bounding_box,this.x, this.y);
  this.update_hit_bbox(this.hit_bounding_box, this.x, this.y);
}

creatureFloatSkull.prototype.realize_intent = function() {

  if (this.state != "teleport") {
    if (this.intent.state == "teleport") {
      this.state = "teleport";
      this.teleport_delay = 0;
      this.teleport_x = this.intent.x;
      this.teleport_y = this.intent.y;

      this.intent.state = "alive";
      return;
    }
  } else if (this.state == "teleport") {
    return;
  }

  this.x = this.intent.x;
  this.y = this.intent.y;
  this.d = this.intent.d;

  this.frameRow = this.frame_lookup[this.d];

  this.update_bbox(this.intent.bounding_box,this.intent.x,this.intent.y);
  this.update_bbox(this.bounding_box,this.intent.x,this.intent.y);
  this.update_hit_bbox(this.hit_bounding_box, this.x, this.y);
}

creatureFloatSkull.prototype.teleport_intent = function(to_x, to_y) {

  this.intent.state = "teleport";
  this.intent.x = to_x;
  this.intent.y = to_y;

  this.update_bbox(this.intent.bounding_box,this.intent.x,this.intent.y);

  /*
  this.teleport_delay = 0;
  this.teleport_x = to_x;
  this.teleport_y = to_y;
  console.log(">>>> teleport floatskull", this.state, this.teleport_delay, this.teleport_x, this.teleport_y);
  */

}

creatureFloatSkull.prototype.update = function(world) {
  var intent_d = this.d;

  if (this.state == "teleport") {
    this.teleport_delay++;
    if (this.teleport_delay >= this.teleport_delay_N) {
      this.teleport_delay = 0;
      this.state = "alive";

      this.x = this.teleport_x;
      this.y = this.teleport_y;

      this.intent.x = this.teleport_x;
      this.intent.y = this.teleport_y;
      this.intent.d = this.d;

      this.keyFrame=0;
    }
    return;
  }

  this.frameDelay--;
  if (this.frameDelay<=0) {
    this.keyFrame++;
    this.keyFrame = this.keyFrame % this.keyFrameN;
    this.frameDelay = this.frameDelayN[this.keyFrame];
  }

  this.choice_delay = (this.choice_delay+1)%(this.choice_delay_n);
  if (this.choice_delay==0) {
    this.frameRow = Math.floor(Math.random()*4);
    intent_d = this.d_lookup[ this.frameRow ];
  }


  if (!this.skip_intent) {
    this.update_intent(intent_d);
  }
  this.skip_intent = false;

  this.update_hit_bbox(this.hit_bounding_box, this.x, this.y);
  this.update_bbox(this.bounding_box,this.x,this.y);
}

creatureFloatSkull.prototype.draw = function() {

  var imgx = this.crit_w*this.keyFrame;
  var imgy = this.crit_h*this.frameRow;
  var mask_alpha = 0.8;

  if (this.state != "teleport") {
    g_imgcache.draw_s(this.name, imgx, imgy, this.crit_w, this.crit_h, this.x, this.y, this.world_w, this.world_h);
  } else if (this.state == "teleport") {
    var k = Math.floor(this.teleport_delay/8)+1;
    var timgx = k*24;
    var timgy = 0;

    var to_timgx = (4-k)*24;
    var to_timgy = 0;

    g_imgcache.draw_s(this.teleport_name, timgx, timgy, 24,24, this.x-4, this.y-4, 24,24);
    g_imgcache.draw_s(this.teleport_name, to_timgx, to_timgy, 24,24, this.teleport_x-4, this.teleport_y-4, 24,24);
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
