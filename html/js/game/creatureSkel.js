function creatureSkel() {
  this.x = 0;
  this.y = 0;

  //this.world_w = 32;
  //this.world_h = 64;

  this.world_w = 16;
  this.world_h = 32;

  this.keyFrame = 0;
  this.keyFrameN = 8;

  this.frameDelayN = [ 16, 8, 8, 16, 8, 8, 8, 8 ];
  this.frameDelay = this.frameDelayN[0];

  console.log("skel");
}

creatureSkel.prototype.update = function() {

  this.frameDelay--;
  
  if (this.frameDelay==0) {
    this.keyFrame++;
    this.keyFrame = this.keyFrame % this.keyFrameN;
    this.frameDelay = this.frameDelayN[this.keyFrame];
  }
}

creatureSkel.prototype.draw = function() {

  var imgx = 16*this.keyFrame;

  // right face float
  var imgy = 0;

  // left face float
  //var imgy = 32;

  // right face rise
  //var imgy = 64;

  // left face rise
  //var imgy = 96;

  //g_imgcache.draw_s("skel_blue", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
  g_imgcache.draw_s("skel_jade", imgx, imgy, 16, 32, this.x, this.y, this.world_w, this.world_h);
}
