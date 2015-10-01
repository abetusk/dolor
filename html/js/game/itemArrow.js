function itemArrow(intent) {

  this.dt = 1.0/50.0;

  var fpos = (intent.a_step +4)%32;

  this.sprite_arrow = {
    "name" : "arrow",
    "world_w" : g_GRIDSIZE,
    "world_h" : g_GRIDSIZE,
    "keyFrameRow" : Math.floor(fpos/8),
    "keyFrameCol" : Math.floor(fpos%8),
    "tile_w" : 16,
    "tile_h" : 16
  };
    

  this.sprite_crumble = {
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
    "a_step" : intent.a_step,
    "a_step_n" : intent.a_step_n,
    "a" : intent.a,
    "d" : intent.d
  };


  this.type = "arrow";
  this.state = "flight"; // crumble
  this.x = intent.x;
  this.y = intent.y;
  this.a = 2.0*Math.PI*intent.a_step/intent.a_step_n;
  this.dv = 9;
  this.vx = this.dv * Math.cos(this.a);
  this.vy = this.dv * Math.sin(-this.a);
  this.next_x = this.x + this.vx;
  this.next_y = this.y + this.vy;

  // step position once
  this.x = this.next_x;
  this.y = this.next_y;
  this.next_x = this.x + this.vx;
  this.next_y = this.y + this.vy;


  this.ttl = 200;

  console.log("arrow", intent);
  console.log(this.x, this.y, this.dv, this.vx, this.vy, this.next_x, this.next_y);
}

itemArrow.prototype.update = function() {

  if (this.state == "flight") {
    this.x = this.next_x;
    this.y = this.next_y;
    this.next_x = this.x + this.vx;
    this.next_y = this.y + this.vy;
  }
  
  this.ttl--;
  if (this.ttl<0) { this.ttl = 0; }

}

itemArrow.prototype.draw = function() {

  if (this.state == "flight") {

    var ix = Math.floor(this.x);
    var iy = Math.floor(this.y);

    var imgx = this.sprite_arrow.keyFrameCol * 16;
    var imgy = this.sprite_arrow.keyFrameRow * 16;

    var name = this.sprite_arrow.name;
    var tile_w = this.sprite_arrow.tile_w;
    var tile_h = this.sprite_arrow.tile_h;
    var world_w = this.sprite_arrow.world_w;
    var world_h = this.sprite_arrow.world_h;
    g_imgcache.draw_s(name, imgx, imgy, tile_w, tile_h, ix, iy, world_w, world_h);


  } else if (this.state == "crumble") {

  }

}
