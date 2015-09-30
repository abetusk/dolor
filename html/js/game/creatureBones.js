function creatureBones() {
  this.x = 0;
  this.y = 0;

  this.name = "bones";

  this.world_w = g_GRIDSIZE;
  this.world_h = g_GRIDSIZE;

  this.crit_w = g_GRIDSIZE;
  this.crit_h = g_GRIDSIZE;

  this.keyFrame = 0;
  this.keyFrameN = ((typeof nframe === "undefined") ? 4 : nframe);

  //this.frameDelayN = [ 8, 8, 8, 8 ];
  this.frameDelayN = [];
  for (var i=0; i<this.keyFrameN; i++ ) {
    this.frameDelayN.push(8);
  }

  this.frameDelay = this.frameDelayN[0];

  this.frameRow = 0;
  this.frameRowN = 4;

  console.log("critter", this.name);
}

creatureBones.prototype.update = function() {

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

creatureBones.prototype.draw = function() {

  var imgx = this.crit_w*this.keyFrame;
  var imgy = this.crit_h*this.frameRow;

  g_imgcache.draw_s(this.name, imgx, imgy, this.crit_w, this.crit_h, this.x, this.y, this.world_w, this.world_h);
}
