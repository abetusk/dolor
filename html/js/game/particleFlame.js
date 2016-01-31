function particleFlame(name, gridsize, tilesize, n, m, default_delay) {
  this.debug=false;

  this.x = 0;
  this.y = 0;

  this.ttl = 1;

  default_delay = ((typeof default_delay === "undefined") ? 4 : default_delay);

  this.name = name;

  this.world_w = gridsize;
  this.world_h = gridsize;

  this.sprite_w = tilesize;
  this.sprite_h = tilesize;

  this.keyFrame = 0;
  this.keyFrameN = ((typeof n === "undefined") ? 1 : n);

  this.frameDelayN = [];
  for (var i=0; i<this.keyFrameN; i++) {
    this.frameDelayN.push(default_delay);
  }

  this.frameDelay = this.frameDelayN[0];

  this.frameRow = 0;
  this.frameRowN = ((typeof m === "undefined") ? 1 : m);

  this.alpha = 1;

  this.bounding_box = [[this.x, this.y],[this.x+16,this.y+16]];
  this.hit_bounding_box = [[this.x, this.y],[this.x+16,this.y+16]];

  this.hit_callback=null;

}

particleFlame.prototype.update_bbox = function(bbox,x,y) {
  bbox[0][0] = x;
  bbox[0][1] = y;

  bbox[1][0] = x+16;
  bbox[1][1] = y+16;
}

particleFlame.prototype.hit = function(damage, bbox) {

  console.log("!!!");
  console.log(">>>hit!");

  if (this.hit_callback) {

    console.log(">>> callback!");

    this.hit_callback(this,damage,bbox);
  }

  console.log("???", this.ttl);
  this.ttl=0;
  console.log("???", this.ttl);
}

particleFlame.prototype.update = function() {

  this.frameDelay--;
  
  if (this.frameDelay==0) {
    this.keyFrame++;
    this.keyFrame = this.keyFrame % this.keyFrameN;
    this.frameDelay = this.frameDelayN[this.keyFrame];

    if (this.keyFrame==0) {
      this.frameRow++;
      this.frameRow = this.frameRow % this.frameRowN;
    }
  }

  this.update_bbox(this.bounding_box, this.x, this.y);
  this.update_bbox(this.hit_bounding_box, this.x, this.y);
}

particleFlame.prototype.draw = function() {

  var imgx = this.sprite_w*this.keyFrame;
  var imgy = this.sprite_h*this.frameRow;

  g_imgcache.draw_s(this.name, imgx, imgy, this.sprite_w, this.sprite_h, this.x, this.y, this.world_w, this.world_h, 0, this.alpha);


  g_imgcache.draw_s(this.name, imgx, imgy, this.sprite_w, this.sprite_h, this.x+1, this.y, this.world_w, this.world_h, 0, this.alpha);
  g_imgcache.draw_s(this.name, imgx, imgy, this.sprite_w, this.sprite_h, this.x, this.y+2, this.world_w, this.world_h, 0, this.alpha);
  g_imgcache.draw_s(this.name, imgx, imgy, this.sprite_w, this.sprite_h, this.x-3, this.y-1, this.world_w, this.world_h, 0, this.alpha);
  g_imgcache.draw_s(this.name, imgx, imgy, this.sprite_w, this.sprite_h, this.x-2, this.y+1, this.world_w, this.world_h, 0, this.alpha);
  g_imgcache.draw_s(this.name, imgx, imgy, this.sprite_w, this.sprite_h, this.x-3, this.y-1, this.world_w, this.world_h, 0, this.alpha);
  g_imgcache.draw_s(this.name, imgx, imgy, this.sprite_w, this.sprite_h, this.x+2, this.y+1, this.world_w, this.world_h, 0, this.alpha);

  if (this.debug) {
    var x0 = this.bounding_box[0][0];
    var y0 = this.bounding_box[0][1];
    var x1 = this.bounding_box[1][0];
    var y1 = this.bounding_box[1][1];
    g_painter.drawRectangle(x0,y0, x1-x0, y1-y0, 1, "rgba(255,0,0,0.6)");
  }
}
