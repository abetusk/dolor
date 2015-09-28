function itemBomb(name, gridsize, tilesize) {
  this.ttl = 60*3;
  this.x = 0;
  this.y = 0;

  this.name = name;

  this.world_w = gridsize;
  this.world_h = gridsize;

  this.tile_w = tilesize;
  this.tile_h = tilesize;

  this.keyFrame = 0;
  this.keyFrameN = 6;

  this.frameDelayN = [ 4, 2, 3, 3, 3, 16 ];
  this.frameDelay = this.frameDelayN[0];

  this.frameRow = 0;
  this.frameRowN = 2;

  console.log("bomb", this.name);
}

itemBomb.prototype.update = function() {
  this.ttl--;

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
}

itemBomb.prototype.draw = function() {

  var imgx = this.tile_w*this.keyFrame;
  var imgy = this.tile_h*this.frameRow;

  g_imgcache.draw_s(this.name, imgx, imgy, this.tile_w, this.tile_h, this.x, this.y, this.world_w, this.world_h);
}
