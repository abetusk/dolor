function creatureSkel(x,y, init_info) {
  this.x = ((typeof x === "undefined")?0:x);
  this.y = ((typeof y === "undefined")?0:y);
  this.d = "right";

  this.debug = true;

  this.world_w = g_GRIDSIZE;
  this.world_h = g_GRIDSIZE*2;

  this.keyFrame = 0;
  this.keyFrameN = 8;

  this.frameDelayN = [ 16, 8, 8, 16, 8, 8, 8, 8 ];
  this.frameDelay = this.frameDelayN[0];

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

  console.log("skel");

  this.hp = 16*3;
}

creatureSkel.prototype.init = function(x,y, d) {
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

creatureSkel.prototype.update_hit_bbox = function(bbox,x,y) {
  bbox[0][0] = x + 2;
  bbox[0][1] = y + 0;

  bbox[1][0] = x + 14;
  bbox[1][1] = y + 31;
}

creatureSkel.prototype.update_bbox = function(bbox,x,y) {
  bbox[0][0] = x;
  bbox[0][1] = y;

  bbox[1][0] = x + 15;
  bbox[1][1] = y + 31;
}

creatureSkel.prototype.hit = function(damage) {

  this.hp -= damage;
  if (this.hp<0) { this.hp = 0; }

  if (this.hp<=0) {

/*
    this.frameRowDead = 0;
    if (this.d == "left") { this.frameRowDead = 1; }

    this.keyFrameDead = 0;
    this.frameDelay = this.frameDelayN[this.keyFrameDead];
    this.state = "dead";
*/
  }

  this.state_modifier = "ouch";
  //this.ouch_delay = this.ouch_delay_n;
  //this.hp_refresh_delay = 0;

}


creatureSkel.prototype.update = function() {
  this.frameDelay--;
  
  if (this.frameDelay==0) {
    this.keyFrame++;
    this.keyFrame = this.keyFrame % this.keyFrameN;
    this.frameDelay = this.frameDelayN[this.keyFrame];

    if (this.keyFrame==0) {
      this.frameRow = this.actionRow[this.actionState];
    }
  }

  this.update_hit_bbox(this.hit_bounding_box, this.x, this.y);
  this.update_bbox(this.bounding_box, this.x, this.y);
}

creatureSkel.prototype.draw = function() {
  var imgx = 16*this.keyFrame;
  var imgy = this.frameRow*32;

  g_imgcache.draw_s("skel_jade", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);


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
