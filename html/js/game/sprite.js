function sprite(info) {
  var default_info = {
    "ttl" : 20,
    "name": "puff",
    "frame" : 0,
    "frame_n" : 4,
    "delay" : 20,
    "delayN" : 20,
    "x" : 0,
    "y" : 0,
    "w" : 4,
    "h" : 4,
    "action" : "once" // loop, etc.
  };

  this.info = ((typeof info === "undefined") ? default_info : info);

  this.ttl = this.info.ttl;
  this.x = this.info.x;
  this.y = this.info.y;
}

sprite.prototype.update = function() {
  this.info.ttl--;

  this.info.delay--;
  if (this.info.delay==0) {
    this.info.delay = this.info.delayN;
    this.info.frame = (this.info.frame+1) % this.info.frame_n;
  }

  if (this.info.ttl<0) { this.info.ttl = 0; }
  this.ttl = this.info.ttl;
}

sprite.prototype.draw = function() {
  if (this.ttl<0) { return; }

  var a = 0.5;
  var imx = 4*this.info.frame;
  var imy = 0;
  g_imgcache.draw_s(this.info.name, imx, imy, this.info.w, this.info.h, this.x, this.y, this.info.w, this.info.h, 0, a);

}
