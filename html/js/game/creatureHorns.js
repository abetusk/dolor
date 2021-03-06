function creatureHorns() {
  this.x = 0;
  this.y = 0;
  this.d = "down";

  this.name = "horns";
  this.dead_name = "dead_horns";

  this.mask_dead_name = "mask_dead_horns";
  this.mask_name = "mask_horns";

  this.world_w = g_GRIDSIZE;
  this.world_h = g_GRIDSIZE;

  this.crit_w = g_GRIDSIZE;
  this.crit_h = g_GRIDSIZE;

  this.keyFrame = 0;
  this.keyFrameN = ((typeof nframe === "undefined") ? 4 : nframe);

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
  this.frameRowN = 4;

  this.debug = false;

  this.choice_delay = 300;
  this.choice_delay_n = 300;

  this.d_lookup = {0:"down", 1:"right", 2:"left", 3:"up"};
  this.frame_lookup = {"down":0, "right":1, "left":2, "up":3};

  this.v = 1;
  this.delay_v_n = 2;
  this.delay_v = this.delay_v_n;

  this.size_x = 12;
  this.size_y = 14;

  this.bounding_box = [[0,0],[0,0]];
  this.hit_bounding_box = [[0,0],[0,0]];
  this.intent = { "d": "down", "x" : this.x, "y" : this.y, "bounding_box":[[0,0],[0,0]] }
  this.skip_intent = false;

  this.hp_max = 16;
  this.hp = this.hp_max;
  this.hp_refresh_rate = 16;
  this.hp_refresh_delay_n = 1000;
  this.hp_refresh_delay = 0;

  this.state = "alive";
  this.state_modifier = "ok";

  this.dead_fudge_x = Math.floor(Math.random()*3)+1;
  this.dead_fudge_y = Math.floor(Math.random()*3)-3;

  this.update_intent(this.d);

  this.ouch_delay_n = 10;
  this.ouch_delay = this.ouch_delay_n;
}

creatureHorns.prototype.init = function(x,y, d) {
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

creatureHorns.prototype.update_hit_bbox = function(bbox,x,y) {
  bbox[0][0] = x + 0;
  bbox[0][1] = y + 0;

  bbox[1][0] = x + 16;
  bbox[1][1] = y + 16;
}

creatureHorns.prototype.update_bbox = function(bbox,x,y) {
  bbox[0][0] = x;
  bbox[0][1] = y;

  bbox[1][0] = x + 15;
  bbox[1][1] = y + 15;
}

creatureHorns.prototype.hit = function(damage) {

  this.hp -= damage;
  if (this.hp<0) { this.hp = 0; }

  if (this.hp<=0) {

    this.frameRowDead = 0;
    if (this.d == "left") { this.frameRowDead = 1; }

    this.keyFrameDead = 0;
    this.frameDelay = this.frameDelayN[this.keyFrameDead];
    this.state = "dead";
  }

  this.state_modifier = "ouch";
  this.ouch_delay = this.ouch_delay_n;
  this.hp_refresh_delay = 0;

  return true;
}

creatureHorns.prototype.world_collision = function(world) {
  var d = this.d;
  var new_d = d;

  for (var i=0; i<30; i++) {
    new_d = this.d_lookup[ Math.floor(Math.random()*4) ];
    if (new_d!=d) { break; }
  }

  this.update_intent(new_d);
  this.skip_intent = true;
}

creatureHorns.prototype.update_intent = function(d) {
  this.intent.d = d;
  this.intent.x = this.x;
  this.intent.y = this.y;

  var v = 0;

  this.delay_v--;
  if (this.ouch_delay == 0) {
    if (this.delay_v <= 0) {
      v = this.v;
      this.delay_v = this.delay_v_n;
    }
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

creatureHorns.prototype.realize_intent = function() {
  this.x = this.intent.x;
  this.y = this.intent.y;
  this.d = this.intent.d;

  this.frameRow = this.frame_lookup[this.d];

  this.update_bbox(this.intent.bounding_box,this.intent.x,this.intent.y);
  this.update_bbox(this.bounding_box,this.intent.x,this.intent.y);
  this.update_hit_bbox(this.hit_bounding_box, this.x, this.y);
}

creatureHorns.prototype.update = function(world) {
  var intent_d = this.d;

  if (this.ouch_delay>0) { this.ouch_delay--; }
  else { this.state_modifier = "ok"; }

  this.hp_refresh_delay = (this.hp_refresh_delay+1)%this.hp_refresh_delay_n;
  if (this.hp_refresh_delay==0) {
    if (this.hp==0) {
      this.state = "summon";
      this.keyFrameDead = 2;
    }

    this.hp += this.hp_refresh_rate;
    if (this.hp >= this.hp_max) {
      this.hp = this.hp_max;
    }

  }


  if (this.state=="dead") {


    /*
    if (this.hp>0) {
      this.state = "alive";
      this.keyFrame = 0;
      this.frameDelay = this.frameDelayN[0];
    }
    else {
    */

      this.frameDelay--;
      if (this.frameDelay<=0) {
        this.keyFrameDead++;
        if (this.keyFrameDead>=this.keyFrameDeadN) { this.keyFrameDead = this.keyFrameDeadN-1; }

        //this.keyFrame = this.keyFrame % this.keyFrameN;
        this.frameDelay = this.frameDelayN[this.keyFrameDead];
      }

    //}


    return;
  } else if (this.state == "summon") {

    this.frameDelay--;
    if (this.frameDelay<=0) {
      this.keyFrameDead--;
      if (this.keyFrameDead<0) {
        this.state = "alive";
        this.keyFrame = 0;
        this.frameDelay = this.frameDelayN[0];
      }
      this.keyFrameDead = 0;
      this.frameDelay = this.frameDelayN[this.keyFrame];
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

  //console.log(this.intent.x, this.intent.y, this.intent.bounding_box[0], this.intent.bounding_box[1], this.v);

  this.update_hit_bbox(this.hit_bounding_box, this.x, this.y);
  this.update_bbox(this.bounding_box,this.x,this.y);

}

creatureHorns.prototype.draw = function() {

  var imgx = this.crit_w*this.keyFrame;
  var imgy = this.crit_h*this.frameRow;
  var mask_alpha = 0.8;

  if ((this.state == "dead") || (this.state == "summon")) {
    imgx = this.crit_w*this.keyFrameDead;
    imgy = this.crit_h*this.frameRowDead;

    if (this.state_modifier == "ok") {
      g_imgcache.draw_s(this.dead_name,
          imgx, imgy,
          this.crit_w, this.crit_h,
          this.x + this.dead_fudge_x, this.y + this.dead_fudge_y,
          this.world_w, this.world_h);
    } else {
    //if (this.state_modifier != "ok") {
      g_imgcache.draw_s(this.mask_dead_name,
          imgx, imgy,
          this.crit_w, this.crit_h,
          this.x + this.dead_fudge_x, this.y + this.dead_fudge_y,
          this.world_w, this.world_h,
          0, mask_alpha);
    }
  } else if (this.state != "dead") {

    if (this.state_modifier == "ok") {
    g_imgcache.draw_s(this.name, imgx, imgy, this.crit_w, this.crit_h, this.x, this.y, this.world_w, this.world_h);
    } else {
    //if (this.state_modifier != "ok")  {
      g_imgcache.draw_s(this.mask_name,
          imgx, imgy, this.crit_w, this.crit_h,
          this.x, this.y, this.world_w, this.world_h,
          0, mask_alpha);
    }
  } else {
    //g_imgcache.draw_s(this.dead_name, imgx, imgy, this.crit_w, this.crit_h, this.x, this.y, this.world_w, this.world_h);
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
