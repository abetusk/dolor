function bombGrundge(x,y) {
  this.ttl_orig = 10000;
  this.ttl = this.ttl_orig;

  this.name = "grundge";

  this.x = x;
  this.y = y;
  this.keyFrame = Math.floor(Math.random()*6);

  this.size = 16;
  this.state = "fresh";
}

bombGrundge.prototype.update = function() {
  this.ttl--;

  if (this.state == "fresh") {
    if (this.ttl < (this.ttl_orig/4)) {
      this.keyFrame = Math.floor(Math.random()*2)+6;
      this.state = "stale";
    }
  }

}

bombGrundge.prototype.draw = function() {
  if (this.ttl<0) { return; }
  var imx = this.size*this.keyFrame;
  var imy = 0;
  g_imgcache.draw_s(this.name, imx, imy, this.size, this.size, this.x, this.y, this.size, this.size);
}
