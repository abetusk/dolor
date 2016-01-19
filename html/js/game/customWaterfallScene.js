function customWaterfallScene(x,y, init_info) {
  this.x = ((typeof x === "undefined")?0:x);
  this.y = ((typeof y === "undefined")?0:y);

  this.waterfall_height = 16*4;
  this.waterfall_width = 16*4;

  this.debug=false;

  var h = this.waterfall_height;
  var wh = this.waterfall_height/2;
  var ww = this.waterfall_width/2;

  var spray_fudge = 15;
  this.waterfall = new customWaterfall(this.x - ww, this.y - h);
  this.spray = new particleSpray(this.x, this.y + spray_fudge);

  this.ttl = 1;
  this.base_state = "full-";
  //this.state = "full-0";
  this.state = this.base_state + "0";
  this.state_n = 0;

  this.state_delay = 0;
  this.state_delay_N = 20;

  this.bounding_box = [[0,0],[0,0]];
  this.update_bbox(this.bounding_box, this.x, this.y);

  this.flame_count=2;

  //this.level = g_level_dolor;

  console.log(">>>>", this.bounding_box[0], this.bounding_box[1]);
}

customWaterfallScene.prototype.add_item = function(info) {
  info = ((typeof info ==="undefined")?{}:info);

  if ((!("sprite_x" in init_info)) || (!("sprite_y" in init_info))) {
    init_info.sprite_x = 0;
    init_info.sprite_y = 0;

    if (!("angle" in init_info)) {
      init_info.angle = 0;
    }
  }

  this.sprite.push({"x":info.sprite_x, "y":info.sprite_y, "a":info.angle})
}



customWaterfallScene.prototype.init = function(x,y) { }

customWaterfallScene.prototype.finish_callback = function() {
  console.log(">>> finish");
  g_world.level.meta_map(23, function(dat, x, y) {
    console.log(">>> 23", dat, x, y);
    g_world.remove_tile(x,y);
  });
}

customWaterfallScene.prototype.flame_callback = function(x,y,z) {

  this.flame_count--;

  if (this.flame_count==1) {
    this.base_state = "half-";
  }
  if (this.flame_count==0)  {
    this.base_state = "none-";
    this.finish_callback();
    this.ttl=0;
  }
}

customWaterfallScene.prototype.update_bbox = function(bbox,x,y) {
  bbox[0][0] = x;
  bbox[0][1] = y;

  bbox[1][0] = x + 16;
  bbox[1][1] = y + 16;
}


customWaterfallScene.prototype.update = function(world) {

  this.waterfall.update();
  this.spray.update();

  this.state_delay++;
  if (this.state_delay >= this.state_delay_N) {
    this.state_delay = 0;
    this.state_n = 1-this.state_n;

    //this.state = "full-" + this.state_n;
    this.state = this.base_state + this.state_n;
  }

  this.update_bbox(this.bounding_box, this.x, this.y);
}

customWaterfallScene.prototype.draw = function() {
  if (this.ttl<=0) { return; }

  var sprite_x = 0;
  var sprite_y = 6*16;
  var sprite_w = 6*16;
  var sprite_h = 2*16;

  var tx = this.x - this.waterfall_width/2 - 16*1;
  var ty = this.y - this.waterfall_height - 16*2;

  g_imgcache.draw_s("overworld_extra",
      sprite_x, sprite_y, sprite_w, sprite_h,
      tx, ty, sprite_w, sprite_h, 0, 1.0);

  sprite_x = 6*16;

  var skip = false;
  if (this.state == "full-0") {
    sprite_y = 8*16;
  } else if (this.state == "full-1") {
    sprite_y = 10*16;
  } else if (this.state == "half-0") {
    sprite_y = 4*16;
  } else if (this.state == "half-1") {
    sprite_y = 6*16;
  } else if (this.state == "none-0") {
    skip = true;
  } else if (this.state == "none-1") {
    skip = true;
  }

  if (!skip) {
    g_imgcache.draw_s("overworld_extra",
        sprite_x, sprite_y, sprite_w, sprite_h,
        tx, ty, sprite_w, sprite_h, 0, 1.0);

    this.waterfall.draw();
    this.spray.draw();
  }

  if (this.debug) {
    var x0 = this.bounding_box[0][0];
    var y0 = this.bounding_box[0][1];
    var x1 = this.bounding_box[1][0];
    var y1 = this.bounding_box[1][1];
    g_painter.drawRectangle(x0,y0, x1-x0, y1-y0, 1, "rgba(255,0,0,0.6)");
  }
}
