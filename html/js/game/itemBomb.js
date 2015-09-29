function itemBomb(intent) {

  this.dt = 1.0/50.0;

  this.sprite_bomb = {
    "name" : "item",
    "mask_name" : "item_mask",
    "keyFrame" : 0,
    "keyFrameN" : 3,
    "frameDelay" : 4,
    "frameDelayN" : 20,
    "maskDelayN" : 10,
    "frameInfo" : [[80, 16], [96,16]],
    "maskInfo" : [80,16],
    "maskFrame" : 3,
    "world_w" : g_GRIDSIZE,
    "world_h" : g_GRIDSIZE,
    "tile_w" : 16,
    "tile_h" : 16
  };
    

  this.sprite_explosion = {
    "initial_delay": 0,
    "finished": false,
    "name" : "bomb_explosion",
    "keyFrame" : 0,
    "keyFrameN" : 4,
    "frameDelay" : 4,
    "frameDelayN" : 4,
    "frameInfo" : [[0, 0], [32,0], [64,0], [96,0]],
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
  this.fuse_ttl = 60*3 + 30;
  this.state = "fuse"; // explode, dead
  this.x = intent.x;
  this.y = intent.y;
  this.vx = -1;
  this.vy = 0.5;
  this.ax = 0;
  this.ay = -2;

  this.explode_ttl = 10;

  this.ttl = this.fuse_ttl + this.explode_ttl;

  this.explosion = [];

  console.log("bomb", intent);
}

itemBomb.prototype.update = function() {

  if (this.state == "fuse") {

    this.fuse_ttl--;

    this.intent = { "type" : "fuse" };

    this.sprite_bomb.frameDelay--;
    if (this.sprite_bomb.frameDelay==0) {
      this.sprite_bomb.keyFrame++;
      this.sprite_bomb.keyFrame = this.sprite_bomb.keyFrame % this.sprite_bomb.keyFrameN;
      //this.sprite_bomb.frameDelay = this.sprite_bomb.frameDelayN[this.sprite_bomb.keyFrame];

      if (this.sprite_bomb.keyFrame==2) {
        this.sprite_bomb.frameDelay = this.sprite_bomb.maskDelayN;
      } else {
        this.sprite_bomb.frameDelay = this.sprite_bomb.frameDelayN;
      }

      this.sprite_bomb.frameDelayN-=1;
      if (this.sprite_bomb.frameDelayN<2) { this.sprite_bomb.frameDelayN=2; }

      this.sprite_bomb.maskDelayN-=1;
      if (this.sprite_bomb.maskDelayN<6) { this.sprite_bomb.maskDelayN=6; }

    }

    if (this.fuse_ttl==0) {

      var se = this.sprite_explosion;

      this.intent = {
        "type" : "explode",
        "x" : se.x - 8,
        "y" : se.y - 8,
        "r" : 16
      };
      this.state = "explode";


      var of = [];
      for (var i=0; i<3; i++) {
        var dx = Math.floor(Math.random()*8)-4;
        var dy = Math.floor(Math.random()*8)-4;
        dx -= 8;
        dy -= 8;
        of.push([dx,dy]);
      }

      for (var i=0; i<3; i++) {
        var x = simplecopy(this.sprite_explosion);
        x.dx = of[i][0];
        x.dy = of[i][1];
        x.initial_delay = i*5;
        this.explosion.push(x);
      }

    }
  } else if (this.state == "explode") {

    this.intent = { "type" : "exploded" };

    var explode_finish_count=0;


    var n = this.explosion.length;

    for (var i=0; i<n; i++) {
      if (this.explosion[i].finished) {
        explode_finish_count++;
      }
    }

    if (explode_finish_count<3) {

      for (var i=0; i<n; i++) {
        var z = this.explosion[i];

        if (z.initial_delay>0) {
          z.initial_delay--;
          continue;
        }

        z.frameDelay--;
        if (z.frameDelay==0) {
          z.keyFrame++;
          z.keyFrame = z.keyFrame % z.keyFrameN;
          z.frameDelay = z.frameDelayN;

          // finished explosion animation
          //
          if (z.keyFrame==0) {
            z.finished = true;
          }
        }

      }

    } else {
      this.state = "dead";
      this.ttl = 0;
    }

  }

}

itemBomb.prototype.draw = function() {

  if (this.state == "fuse") {

    var kf = this.sprite_bomb.keyFrame;

    if (kf<2) {
      var name = this.sprite_bomb.name;
      var tile_w = this.sprite_bomb.tile_w;
      var tile_h = this.sprite_bomb.tile_h;
      var world_w = this.sprite_bomb.world_w;
      var world_h = this.sprite_bomb.world_h;
      var imgx = this.sprite_bomb.frameInfo[kf][0];
      var imgy = this.sprite_bomb.frameInfo[kf][1];
      g_imgcache.draw_s(name, imgx, imgy, tile_w, tile_h, this.x, this.y, world_w, world_h);
    } else {
      var name = this.sprite_bomb.mask_name;
      var tile_w = this.sprite_bomb.tile_w;
      var tile_h = this.sprite_bomb.tile_h;
      var world_w = this.sprite_bomb.world_w;
      var world_h = this.sprite_bomb.world_h;
      var imgx = this.sprite_bomb.maskInfo[0];
      var imgy = this.sprite_bomb.maskInfo[1];
      g_imgcache.draw_s(name, imgx, imgy, tile_w, tile_h, this.x, this.y, world_w, world_h);
    }


  } else if (this.state == "explode") {

    var n = this.explosion.length;
    for (var i=0; i<n; i++) {
      var z = this.explosion[i];
      if (z.finished) { continue; }
      if (z.initial_delay>0) { continue; }

      var name = z.name;
      var kf = z.keyFrame;
      var tile_w = z.tile_w;
      var tile_h = z.tile_h;
      var world_w = z.world_w;
      var world_h = z.world_h;
      var imgx = z.frameInfo[kf][0];
      var imgy = z.frameInfo[kf][1];

      var dx = z.dx;
      var dy = z.dy;

      g_imgcache.draw_s(name, imgx, imgy, tile_w, tile_h, this.x + dx, this.y + dy, world_w, world_h);

    }
  }
}
