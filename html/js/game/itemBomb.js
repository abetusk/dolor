function itemBomb(name, intent) {

  this.dt = 1.0/50.0;

  this.sprite_bomb = {
    "name" : "item",
    "keyFrame" : 0,
    "keyFrameN" : 2,
    "frameDelay" : 4,
    "frameDelayN" : 4,
    "frameInfo" : [[80, 16], [96,16]],
    "world_w" : g_GRIDSIZE,
    "world_h" : g_GRIDSIZE,
    "tile_w" : 16,
    "tile_h" : 16
  };
    

  this.sprite_explosion = {
    "name" : "bomb_explosion",
    "keyFrame" : 0,
    "keyFrameN" : 4,
    "keyFrameDelay" : 4,
    "keyFrameDelayN" : 4,
    "keyFrameInfo" : [[0, 0], [32,0], [64,0], [96,0]],
    "world_w" : 2*g_GRIDSIZE,
    "world_h" : 2*g_GRIDSIZE,
    "tile_w" : 32,
    "tile_h" : 32
  };

  this.orig = {
    "x" : intent.x,
    "y" : intent.y,
    "dx" : intent.dx,
    "dy" : intent.dy,
    "d" : intent.d
  };

  this.type = "bomb";
  this.ttl = 60*3;
  this.state = "fuse"; // explode, dead
  this.x = intent.x;
  this.y = intent.y;
  this.vx = -1;
  this.vy = 0.5;
  this.ax = 0;
  this.ay = -2;


  console.log("bomb", this.name);
}

itemBomb.prototype.update = function() {

  if (this.state == "fuse") {

    this.ttl--;

    console.log("fuse", this.ttl);

    this.sprite_bomb.frameDelay--;
    if (this.sprite_bomb.frameDelay==0) {
      this.sprite_bomb.keyFrame++;
      this.sprite_bomb.keyFrame = this.sprite_bomb.keyFrame % this.sprite_bomb.keyFrameN;
      this.sprite_bomb.frameDelay = this.sprite_bomb.frameDelayN[this.sprite_bomb.keyFrame];
    }

    this.x += this.vx*this.dt;
    this.y += this.vy*this.dt;

    this.vx += this.ax*this.dt;
    this.vy += this.ay*this.dt;

    if (this.ttl==0) {
      this.intent = {
        "type" : "explode",
        "x" : this.x,
        "y" : this.y,
        "r" : 16
      };
      this.state = "explode";
    }
  }

}

itemBomb.prototype.draw = function() {

  var name = this.sprite_bomb.name;
  var kf = this.sprite_bomb.keyFrame;
  var tile_w = this.sprite_bomb.tile_w;
  var tile_h = this.sprite_bomb.tile_h;
  var world_w = this.sprite_bomb.world_w;
  var world_h = this.sprite_bomb.world_h;
  var imgx = this.sprite_bomb.frameInfo[kf][0];
  var imgy = this.sprite_bomb.frameInfo[kf][1];

  g_imgcache.draw_s(name, imgx, imgy, tile_w, tile_h, this.x, this.y, world_w, world_h);
}
