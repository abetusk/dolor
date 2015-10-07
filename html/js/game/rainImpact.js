function rainImpact(x,y) {

  this.keyFrame = 0;
  this.keyFrameN = 4;

  this.frameDelayN = 3;
  this.frameDelay = this.frameDelayN;
  this.ttl_orig = this.frameDelayN*this.keyFrameN;
  this.ttl = this.ttl_orig;

  this.name = "rain_impact";

  this.x = x;
  this.y = y;

  this.size_x = 7;
  this.size_y = 7;

  this.state = "idle";
}

rainImpact.prototype.start = function(x,y) {
  this.keyFrame = 0;
  this.frameDelay = this.frameDelayN;
  this.ttl = this.ttl_orig;
  this.x = x;
  this.y = y;

  this.state = "active";


}

rainImpact.prototype.update = function() {
  this.ttl--;

  this.frameDelay--;
  if (this.frameDelay<=0) {
    this.keyFrame  = (this.keyFrame+1)%this.keyFrameN;
    this.frameDelay=this.frameDelayN;
  }

  if (this.ttl<=0) {
    this.state = "idle";
  }

}

rainImpact.prototype.draw = function() {
  if (this.ttl<0) { return; }

  var imx = this.size_x*this.keyFrame;
  var imy = 0;
  g_imgcache.draw_s(this.name, imx, imy, this.size_x, this.size_y, this.x, this.y, this.size_x, this.size_y);
}
