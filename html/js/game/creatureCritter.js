function creatureCritter(name, gridsize, tilesize, nframe) {
  this.x = 0;
  this.y = 0;

  this.name = name;

  this.world_w = gridsize;
  this.world_h = gridsize;

  this.crit_w = tilesize;
  this.crit_h = tilesize;

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

creatureCritter.prototype.update = function() {

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

creatureCritter.prototype.draw = function() {

  var imgx = this.crit_w*this.keyFrame;
  var imgy = this.crit_h*this.frameRow;

  g_imgcache.draw_s(this.name, imgx, imgy, this.crit_w, this.crit_h, this.x, this.y, this.world_w, this.world_h);
}
