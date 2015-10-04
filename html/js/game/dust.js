function dust(info) {
  var default_info = {
    "ttl" : -1,
    "name": "dust",
    "frame" : 0,
    "frame_n" : 10,
    "delay" : -1,
    "delayN" : 1,
    "x" : 0,
    "y" : 0,
    "w" : 6,
    "h" : 6,
    "moveDelay" : -1,
    "moveDelayN" : 2,
    "rowFrame" : 0,
    "action" : "once" // loop, etc.
  };

  this.info = ((typeof info === "undefined") ? default_info : info);

  //DEBUG
  this.info.ttl = this.info.delayN * this.info.frame_n;
  this.info.delay = this.info.delayN;
  this.moveDelay = this.moveDelayN;

  this.ttl = this.info.ttl;
  this.x = this.info.x;
  this.y = this.info.y;
}

dust.prototype.update = function() {
  this.info.ttl--;

  this.info.delay--;
  if (this.info.delay==0) {
    this.info.delay = this.info.delayN;
    this.info.frame = (this.info.frame+1) % this.info.frame_n;
  }

  this.info.moveDelay--;
  if (this.info.moveDelay<=0) {
    this.x--;
    this.y--;
    this.info.moveDelay=this.info.moveDelayN;
  }

  if (this.info.ttl<0) { this.info.ttl = 0; }
  this.ttl = this.info.ttl;
}

dust.prototype.draw = function() {
  if (this.ttl<0) { return; }

  var a = 0.5;
  var imx = this.info.w*this.info.frame;
  var imy = this.info.h*this.info.rowFrame;
  g_imgcache.draw_s(this.info.name, imx, imy, this.info.w, this.info.h, this.x, this.y, this.info.w, this.info.h, 0, a);

}
