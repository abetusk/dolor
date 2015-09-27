function itemBomb(name, gridsize, tilesize) {
  this.x = 0;
  this.y = 0;

  this.name = name;

  this.world_w = gridsize;
  this.world_h = gridsize;

  this.crit_w = tilesize;
  this.crit_h = tilesize;

  this.keyFrame = 0;
  this.keyFrameN = 6;

  this.frameDelayN = [ 4, 2, 3, 3, 3, 16 ];
  this.frameDelay = this.frameDelayN[0];

  this.frameRow = 0;
  this.frameRowN = 2;

  console.log("critter", this.name);
}

itemBomb.prototype.update = function() {

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

  var imgx = this.crit_w*this.keyFrame;
  var imgy = this.crit_h*this.frameRow;

  g_imgcache.draw_s(this.name, imgx, imgy, this.crit_w, this.crit_h, this.x, this.y, this.world_w, this.world_h);
}
