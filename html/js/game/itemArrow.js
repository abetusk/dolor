function itemArrow(intent) {

  this.dt = 1.0/50.0;
  this.draw_bbox = false;

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

  this.arrow_bbox = {
    "7" : { "row" : 0, "col" : 7, "bounding_box" : [[14,12],[15,13]] },
    "6" : { "row" : 0, "col" : 6, "bounding_box" : [[15,11],[16,12]] },
    "5" : { "row" : 0, "col" : 5, "bounding_box" : [[15,9],[16,10]] },
    "4" : { "row" : 0, "col" : 4, "bounding_box" : [[15,7],[16,8]] },
    "3" : { "row" : 0, "col" : 3, "bounding_box" : [[15,6],[16,7]] },
    "2" : { "row" : 0, "col" : 2, "bounding_box" : [[15,4],[16,5]] },
    "1" : { "row" : 0, "col" : 1, "bounding_box" : [[14,3],[15,4]] },
    "0" : { "row" : 0, "col" : 0, "bounding_box" : [[14,1],[15,2]] },
    "10" : { "row" : 1, "col" : 2, "bounding_box" : [[11,15],[12,16]] },
    "11" : { "row" : 1, "col" : 3, "bounding_box" : [[9,15],[10,16]] },
    "12" : { "row" : 1, "col" : 4, "bounding_box" : [[8,15],[9,16]] },
    "13" : { "row" : 1, "col" : 5, "bounding_box" : [[6,15],[7,16]] },
    "14" : { "row" : 1, "col" : 6, "bounding_box" : [[4,15],[5,16]] },
    "8" : { "row" : 1, "col" : 0, "bounding_box" : [[14,14],[15,15]] },
    "9" : { "row" : 1, "col" : 1, "bounding_box" : [[12,14],[13,15]] },
    "15" : { "row" : 1, "col" : 7, "bounding_box" : [[3,14],[4,15]] },
    "16" : { "row" : 2, "col" : 0, "bounding_box" : [[1,14],[2,15]] },
    "17" : { "row" : 2, "col" : 1, "bounding_box" : [[1,12],[2,13]] },
    "18" : { "row" : 2, "col" : 2, "bounding_box" : [[0,11],[1,12]] },
    "19" : { "row" : 2, "col" : 3, "bounding_box" : [[0,9],[1,10]] },
    "20" : { "row" : 2, "col" : 4, "bounding_box" : [[0,8],[1,9]] },
    "21" : { "row" : 2, "col" : 5, "bounding_box" : [[0,6],[1,7]] },
    "22" : { "row" : 2, "col" : 6, "bounding_box" : [[0,4],[1,5]] },
    "23" : { "row" : 2, "col" : 7, "bounding_box" : [[1,3],[2,4]] },
    "24" : { "row" : 3, "col" : 0, "bounding_box" : [[1,1],[2,2]] },
    "25" : { "row" : 3, "col" : 1, "bounding_box" : [[3,1],[4,2]] },
    "31" : { "row" : 3, "col" : 7, "bounding_box" : [[12,1],[13,2]] },
    "26" : { "row" : 3, "col" : 2, "bounding_box" : [[4,0],[5,1]] },
    "27" : { "row" : 3, "col" : 3, "bounding_box" : [[6,0],[7,1]] },
    "28" : { "row" : 3, "col" : 4, "bounding_box" : [[7,0],[8,1]] },
    "29" : { "row" : 3, "col" : 5, "bounding_box" : [[9,0],[10,1]] },
    "30" : { "row" : 3, "col" : 6, "bounding_box" : [[11,0],[12,1]] }
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

  this.a_step = intent.a_step;
  this.a_step_n = intent.a_step_n;

  // step position once
  this.x = this.next_x;
  this.y = this.next_y;
  this.next_x = this.x + this.vx;
  this.next_y = this.y + this.vy;

  this.fpos = fpos;

  this.bbox = [[0,0],[0,0]];
  var abbox = this.arrow_bbox[fpos].bounding_box;

  this.bbox[0][0] = abbox[0][0] + this.x;
  this.bbox[0][1] = (16-abbox[1][1]) + this.y;

  this.bbox[1][0] = abbox[1][0] + this.x;
  this.bbox[1][1] = (16-abbox[0][1]) + this.y;

  this.ttl = 200;

  //console.log("arrow", intent);
  //console.log(this.x, this.y, this.dv, this.vx, this.vy, this.next_x, this.next_y);
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

  var abbox = this.arrow_bbox[ this.fpos ].bounding_box;

  this.bbox[0][0] = abbox[0][0] + this.x;
  this.bbox[0][1] = (16-abbox[1][1]) + this.y;

  this.bbox[1][0] = abbox[1][0] + this.x;
  this.bbox[1][1] = (16-abbox[0][1]) + this.y;



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

    if (this.draw_bbox) {
      g_painter.drawRectangle(this.bbox[0][0], this.bbox[0][1], 1,1,
          1, "rgb(255,0,0)");
    }


  } else if (this.state == "crumble") {

  }

}
