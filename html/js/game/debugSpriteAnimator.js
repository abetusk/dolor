function debugSpriteAnimator(name, gridsize, tilesize, n, m, default_delay) {
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

  console.log("debugSprintAnimator", this.name);
}

debugSpriteAnimator.prototype.update = function() {

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

debugSpriteAnimator.prototype.draw = function() {

  var imgx = this.sprite_w*this.keyFrame;
  var imgy = this.sprite_h*this.frameRow;

  g_imgcache.draw_s(this.name, imgx, imgy, this.sprite_w, this.sprite_h, this.x, this.y, this.world_w, this.world_h, 0, this.alpha);
}
