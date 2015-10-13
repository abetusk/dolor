function mainWorld() {
  this.player = g_player;
  this.level = g_level;
  this.painter = g_painter;

  this.enemy = [];
  this.particle = [];
  this.element = [];
  this.debris = [];

  this.remnants = [];

  this.camshake=[];
  this.orig_dx = 0;
  this.orig_dy = 0;

  this.display_speedup = true;

  this.size = g_GRIDSIZE;

  this.debug = false;
  this.debug_rect = [[0,0],[1,1]];

  this.player_nudge_delay_count = 8;
  this.player_nudge_delay = 8;

  this.rain = [];
  this.rain_flag = false;
  this.rain_ds = 10;
  this.rain_v = 8;
  this.rain_vx = -2;
  this.rain_vy = 4;
  this.rain_N = 50;
  this.rain_max = 100;
  this.rain_dt = 80;

  this.snow = [];
  this.snow_flag = false;
  this.snow_v = 8;
  this.snow_N = 200;
  this.snow_dt = 200;
  this.snow_max = 400;

  this.ticker = 0;
  this.environment_state = "idle";

  //---

  var neko = new creatureNeko();
  neko.x = 16*29;
  neko.y = 16*13;
  this.enemy.push(neko);

  this.collisionNudgeN=1;

  this.init_rain();
  this.init_snow();

  this.ready = false;


  this.player_focus_history_window = 100;
  this.player_focus_history = [];
  this.player_focus_history_pos = 0;
  this.player_focus = [0,0];
  for (var i=0; i<this.focus_history_window; i++) {
    this.player_focus_history.push( [0,0] );
  }

  this.player_focus_v_window = 120;
  this.player_focus_v = [];
  this.player_focus_v_pos = 0;
  for (var i=0; i<this.focus_focus_; i++) {
    this.player_focus_v.push( [0,0] );
  }
  this.player_focus_v_factor = 1.0/4.0;


  this.player_prev_x = 0;
  this.player_prev_y = 0;


  this.camvec = [];
  for (var i=0; i<100; i++) { this.camvec.push(0); }
  this.camvec_pos=0;

  this.level_transition = false;

}

mainWorld.prototype.player_update_focus = function() {
  var x = 0;
  var y = 0;
  for (var i=0; i<this.player_focus_history.length; i++) {
    x += this.player_focus_history[i][0];
    y += this.player_focus_history[i][1];
  }

  this.player_focus[0] = x/this.player_focus_history.length;
  this.player_focus[1] = y/this.player_focus_history.length;

}

mainWorld.prototype.init = function() {
  var x = 0;
  var y = 0;

  if (this.player) {
    x = this.player.x;
    y = this.player.y;

    this.player_prev_x = x;
    this.player_prev_y = y;
  }

  this.player_focus_v_pos = 0;
  this.player_focus_v = [];
  for (var i=0; i<this.player_focus_v_window; i++) {
    this.player_focus_v.push( [0,0] );
  }

  this.player_focus_history = [];
  for (var i=0; i<this.player_focus_history_window; i++) {
    this.player_focus_history.push( [x,y] );
  }
  this.player_update_focus();
}

mainWorld.prototype.player_attack_level_collision = function() {
  if (!this.player) { return false; }
  if (!this.player.sword) { return false; }

  var level = this.level;
  if (!level) { return false; }

  var layers = level.tilemap.layers;

  var sword_bbox = this.player.sword_bbox;

  var layer_idx = level.layer_name_index_lookup["collision.top"];
  var layer = layers[layer_idx];

  var w = layer.width;
  var h = layer.height;

  var level_h = this.size;
  var level_w = this.size;
  var level_x = this.level.x;
  var level_y = this.level.y;

  for (var jj=0; jj<layer.data.length; jj++) {
    if (layer.data[jj]==0) { continue; }

    var r = Math.floor(jj / w);
    var c = Math.floor(jj % h);

    var tile_x = level_x + c*level_h;
    //var tile_y = level_y + r*level_w;
    var tile_y = -level_y + r*level_w;


    var sz = this.size;
    var ti = level.tile_info[layer.data[jj]];
    tile_bbox = this.tile_bbox(layer.data[jj] - ti.firstgid, tile_x, tile_y);

    if (box_box_intersect(sword_bbox, tile_bbox, 0.125)) {

      if (this.debug) {
        this.debug_rect[0][0] = tile_bbox[0][0];
        this.debug_rect[0][1] = tile_bbox[0][1];

        this.debug_rect[1][0] = tile_bbox[1][0];
        this.debug_rect[1][1] = tile_bbox[1][1];
      }

      return true;
    }

  }

  return false;
}

mainWorld.prototype.tile_bbox = function(col_val, tile_x, tile_y) {
  var bbox = [[0,0],[0,0]];

  //col_val -= 145;

  if (col_val==0) {
    bbox[0][0] = tile_x;
    bbox[0][1] = tile_y;

    bbox[1][0] = tile_x + this.size-1;
    bbox[1][1] = tile_y + this.size-1;
  }

  // upper half
  //
  else if (col_val==1) {
    bbox[0][0] = tile_x;
    bbox[0][1] = tile_y;

    bbox[1][0] = tile_x + (this.size)-1;
    bbox[1][1] = tile_y + (this.size/2)-1;
  }

  // left half
  //
  else if (col_val==2) {
    bbox[0][0] = tile_x;
    bbox[0][1] = tile_y;

    bbox[1][0] = tile_x + (this.size/2)-1;
    bbox[1][1] = tile_y + (this.size)-1;
  }

  // lower half
  //
  else if (col_val==3) {
    bbox[0][0] = tile_x;
    bbox[0][1] = tile_y + (this.size/2);

    bbox[1][0] = tile_x + (this.size)-1;
    bbox[1][1] = tile_y + (this.size)-1;
  }

  // right half
  //
  else if (col_val==4) {
    bbox[0][0] = tile_x + (this.size/2);
    bbox[0][1] = tile_y ;

    bbox[1][0] = tile_x + (this.size)-1;
    bbox[1][1] = tile_y + (this.size)-1;
  }

  // upper left
  //
  else if (col_val==5) {
    bbox[0][0] = tile_x ;
    bbox[0][1] = tile_y ;

    bbox[1][0] = tile_x + (this.size/2)-1;
    bbox[1][1] = tile_y + (this.size/2)-1;
  }

  // lower left
  //
  else if (col_val==6) {
    bbox[0][0] = tile_x ;
    bbox[0][1] = tile_y + (this.size/2);

    bbox[1][0] = tile_x + (this.size/2)-1;
    bbox[1][1] = tile_y + (this.size)-1;
  }

  // lower right
  //
  else if (col_val==7) {
    bbox[0][0] = tile_x + (this.size/2);
    bbox[0][1] = tile_y + (this.size/2);

    bbox[1][0] = tile_x + (this.size)-1;
    bbox[1][1] = tile_y + (this.size)-1;
  }

  // upper right
  //
  else if (col_val==8) {
    bbox[0][0] = tile_x + (this.size/2);
    bbox[0][1] = tile_y ;

    bbox[1][0] = tile_x + (this.size)-1;
    bbox[1][1] = tile_y + (this.size/2)-1;
  }

  return bbox;
}

mainWorld.prototype.bbox_level_collision = function(bbox) {
  var level = this.level;
  if (!level) { return false; }

  var layers = level.tilemap.layers;

  var tile_bbox = [[0,0],[0,0]];

  var collision_index = [];
  if ("collision.top" in level.layer_name_index_lookup) {
    collision_index.push( level.layer_name_index_lookup["collision.top"]);
  }

  if ("collision.bottom" in level.layer_name_index_lookup) {
    collision_index.push( level.layer_name_index_lookup["collision.bottom"]);
  }

  var level_x = 0;
  var level_y = 0;
  if (this.level.ready) {
    level_x = this.level.x;
    level_y = this.level.y;
  }


  //var base_c = Math.floor(bbox[0][0]/16);
  //var base_r = Math.floor(bbox[0][1]/16);

  var base_c = Math.floor((bbox[0][0]-level_x)/16);
  var base_r = Math.floor((bbox[0][1]-level_y)/16);

  //console.log(collision_index[0]);

  //console.log(base_c, base_r);

  for (var ind=0; ind<collision_index.length; ind++) {
    for (var cc=-1; cc<2; cc++) {
      for (var rr=-1; rr<2; rr++) {
        var key = (base_r+rr) + ":" + (base_c+cc);

        var z = collision_index[ind];
        if (key in this.level.layer_lookup[z]) {
          //var tile_x = (base_c + cc) * 16;
          //var tile_y = (base_r + rr) * 16;

          var tile_x = level_x + (base_c + cc) * 16;
          var tile_y = level_y + (base_r + rr) * 16;

          var val = this.level.layer_lookup[z][key];

          var ti = level.tile_info[val];

          tile_bbox = this.tile_bbox(val - ti.firstgid, tile_x, tile_y);
          //tile_bbox = this.tile_bbox(val - ti.firstgid, tile_x + level_y, tile_y + level_y);

          //if ((cc==0) && (rr==0)) { console.log(">>>", tile_x, tile_y); }

          if (box_box_intersect(bbox, tile_bbox, .25)) {
            this.debug_rect = tile_bbox;
            return true;
          }

        }
      }
    }
  }

  return false;
}

mainWorld.prototype.line_level_collision = function(l0, l1) {
  var level = this.level;
  if (!level) { return false; }

  var layers = level.tilemap.layers;

  var tile_bbox = [[0,0],[0,0]];

  var collision_index = [];
  if ("collision.top" in level.layer_name_index_lookup) {
    collision_index.push( level.layer_name_index_lookup["collision.top"]);
  }

  for (var ind=0; ind<collision_index.length; ind++) {
    var layer = layers[collision_index[ind]];

    var w = layer.width;
    var h = layer.height;

    var level_h = this.size;
    var level_w = this.size;
    var level_x = this.level.x;
    var level_y = this.level.y;

    for (var jj=0; jj<layer.data.length; jj++) {
      if (layer.data[jj]==0) { continue; }

      var r = Math.floor(jj / w);
      var c = Math.floor(jj % h);

      var tile_x = level_x + c*level_h;
      var tile_y = level_y + r*level_w;

      var sz = this.size;

      var ti = level.tile_info[layer.data[jj]];

      tile_bbox = this.tile_bbox(layer.data[jj]-ti.firstgid, tile_x, tile_y);

      if ((tile_bbox[0][0] == 0) &&
          (tile_bbox[0][1] == 0) &&
          (tile_bbox[1][0] == 0) &&
          (tile_bbox[1][1] == 0)) {
            console.log("????", r, c);
          }

      if (box_line_intersect(tile_bbox, l0, l1, 1)) {
        this.debug_rect = tile_bbox;
        return true;
      }

    }
  }

  return false;
}


var debug_var = 0;
var debug_del = 1;

mainWorld.prototype.draw_level_transition = function() {
  var a = this.level_transition_alpha;

  var r = Math.floor(210*this.level_transition_alpha);
  var g = Math.floor(210*this.level_transition_alpha);
  var b = Math.floor(220*this.level_transition_alpha);
  this.painter.startDrawColor( "rgba(" + r + "," + g + "," + b + ",1.0)" );

  var painter = this.painter;
  var screen0 = { "x": painter.width/2, "y": painter.height/2 };
  var world0 = painter.devToWorld(screen0.x, screen0.y);

  var world_p_x = painter.devToWorld(painter.width, screen0.y);
  var world_p_y = painter.devToWorld(screen0.x, painter.height);

  var tile_dx = Math.floor((Math.abs(world_p_x.x - world0.x)/8)) + 2;
  var tile_dy = Math.floor((Math.abs(world_p_y.y - world0.y)/8)) + 2;

  if (this.level)
  {
    if (this.debris) {
      for (var key in this.debris) {
        this.debris[key].draw(a);
      }
    }

    if (this.display_speedup) {
      this.level.draw_layer_w("bottom.-2", world0.x, world0.y, tile_dx, tile_dy, a);
      this.level.draw_layer_w("bottom.-1", world0.x, world0.y, tile_dx, tile_dy, a);
      this.level.draw_layer_w("bottom", world0.x, world0.y, tile_dx, tile_dy, a);
    } else {
      this.level.draw_layer("bottom", a);
    }

  }


  if (this.enemy) {
    for (var key in this.enemy) {
      if ("state" in this.enemy[key]) {
        if (this.enemy[key].state == "dead") {
          this.enemy[key].draw(a);
        }
      }
    }
  }


  if (this.player) {
    this.level.draw_layer_bottom("height", this.player.x, this.player.y, a);
    this.player.draw(a);
    this.level.draw_layer_top("height", this.player.x, this.player.y, a);
  }

  if (this.element) {
    for (var key in this.element) {
      if ("type" in this.element[key]) {

        if (this.element[key].type == "bomb") {
          if ("intent" in  this.element[key]) {
            if ((this.element[key].intent.type == "explode") ||
                (this.element[key].intent.type == "exploded")) {
              continue;
            }
          }
        }

      }
      this.element[key].draw(a);
    }
  }

  if (this.enemy) {
    for (var key in this.enemy) {
      if ("state" in this.enemy[key]) {
        if (this.enemy[key].state != "dead") {
          this.enemy[key].draw(a);
        }
      } else {
        this.enemy[key].draw(a);
      }
    }
  }

  if (this.level)
  {
    this.level.draw_layer_w("top", world0.x, world0.y, tile_dx, tile_dy, a);
  }

  // Make sure to render the explosion above all else.
  // Might want to convert the explosion into a particle effect...
  //
  if (this.element) {
    for (var key in this.element) {

      if ("type" in this.element[key]) {

        if (this.element[key].type == "bomb") {
          if ("intent" in  this.element[key]) {

            if ((this.element[key].intent.type == "explode") ||
                (this.element[key].intent.type == "exploded")) {
              this.element[key].draw(a);
            }
          }
        }

      }

    }
  }


  if (this.particle) {
    for (var key in this.particle) {
      this.particle[key].draw(a);
    }
  }


  // rain
  //
  if (this.rain_flag) {
    for (var i=0; i<this.rain_N; i++) {
      g_imgcache.draw_s("rain", 0, 0, 5, 10, this.rain[i].x, this.rain[i].y, 5, 10, 0, a);
    }

    for (var i=0; i<this.rain_N; i++) {
      if (this.rain_impact[i].state != "idle") {
        this.rain_impact[i].draw(a);
      }
    }
  }

  // snow
  //
  if (this.snow_flag) {
    for (var i=0; i<this.snow_N; i++) {

      //console.log(">>>", i, this.snow[i]);
      var imx = 4*this.snow[i].frame;
      var imy = 4*this.snow[i].yframe;
      g_imgcache.draw_s("puff", imx, imy, 4, 4, this.snow[i].x, this.snow[i].y, 4, 4, 0, 0.75*a);
    }
  }

  this.painter.endDraw();
}

mainWorld.prototype.draw = function() {

  if (this.level_transition) {
    this.draw_level_transition();
    return;
  }
  this.painter.startDrawColor( "rgba(210,210,220,1.0)" );

  var painter = this.painter;
  var screen0 = { "x": painter.width/2, "y": painter.height/2 };
  var world0 = painter.devToWorld(screen0.x, screen0.y);

  var world_p_x = painter.devToWorld(painter.width, screen0.y);
  var world_p_y = painter.devToWorld(screen0.x, painter.height);

  var tile_dx = Math.floor((Math.abs(world_p_x.x - world0.x)/8)) + 2;
  var tile_dy = Math.floor((Math.abs(world_p_y.y - world0.y)/8)) + 2;

  if (this.level)
  {
    if (this.debris) {
      for (var key in this.debris) {
        this.debris[key].draw();
      }
    }

    if (this.display_speedup) {
      this.level.draw_layer_w("bottom.-2", world0.x, world0.y, tile_dx, tile_dy);
      this.level.draw_layer_w("bottom.-1", world0.x, world0.y, tile_dx, tile_dy);
      this.level.draw_layer_w("bottom", world0.x, world0.y, tile_dx, tile_dy);
    } else {
      this.level.draw_layer("bottom");
    }

  }


  if (this.enemy) {
    for (var key in this.enemy) {
      if ("state" in this.enemy[key]) {
        if (this.enemy[key].state == "dead") {
          this.enemy[key].draw();
        }
      }
    }
  }


  if (this.player) {

    this.level.draw_layer_bottom("height", this.player.x, this.player.y);

    this.player.draw(1);


    if (this.debug) {
      if (this.player.sword) {
        var x0 = this.player.sword_bbox[0][0];
        var y0 = this.player.sword_bbox[0][1];
        var x1 = this.player.sword_bbox[1][0];
        var y1 = this.player.sword_bbox[1][1];
        this.painter.drawRectangle(x0,y0, x1-x0, y1-y0, 1, "rgba(255,0,0,0.6)");
      }
    }

    this.level.draw_layer_top("height", this.player.x, this.player.y);

  } else {
    //this.level.draw_layer("height");
    this.level.draw_layer_w("height", world0.x, world0.y, tile_dx, tile_dy);
  }

  if (this.element) {
    for (var key in this.element) {
      if ("type" in this.element[key]) {

        if (this.element[key].type == "bomb") {
          if ("intent" in  this.element[key]) {
            if ((this.element[key].intent.type == "explode") ||
                (this.element[key].intent.type == "exploded")) {
              continue;
            }
          }
        }

      }
      this.element[key].draw();
    }
  }


  // playing around with a light column
  //
  /*
  debug_var += debug_del;
  if (debug_var < 0) { debug_var = 0; debug_del = 1; }
  if (debug_var > 100) { debug_var = 100; debug_del = -1; }
  var a = (debug_var/100)
  this.painter.drawRectangle(this.player.x, this.player.y-1000, 16, 1000, 0, 0, true, "rgba(255,255,255," + a + ")");
  */

  if (this.enemy) {
    for (var key in this.enemy) {
      if ("state" in this.enemy[key]) {
        if (this.enemy[key].state != "dead") {
          this.enemy[key].draw();
        }
      } else {
        this.enemy[key].draw();
      }
    }
  }

  if (this.level)
  {
    this.level.draw_layer_w("top", world0.x, world0.y, tile_dx, tile_dy);
  }

  // Make sure to render the explosion above all else.
  // Might want to convert the explosion into a particle effect...
  //
  if (this.element) {
    for (var key in this.element) {

      if ("type" in this.element[key]) {

        if (this.element[key].type == "bomb") {
          if ("intent" in  this.element[key]) {

            if ((this.element[key].intent.type == "explode") ||
                (this.element[key].intent.type == "exploded")) {
              this.element[key].draw();
            }
          }
        }

      }

    }
  }


  if (this.particle) {
    for (var key in this.particle) {
      this.particle[key].draw();
    }
  }


  // rain
  //
  if (this.rain_flag) {
    for (var i=0; i<this.rain_N; i++) {
      g_imgcache.draw_s("rain", 0, 0, 5, 10, this.rain[i].x, this.rain[i].y, 5, 10);
    }

    for (var i=0; i<this.rain_N; i++) {
      if (this.rain_impact[i].state != "idle") {
        this.rain_impact[i].draw();
      }
    }
  }

  // snow
  //
  if (this.snow_flag) {
    for (var i=0; i<this.snow_N; i++) {

      //console.log(">>>", i, this.snow[i]);
      var imx = 4*this.snow[i].frame;
      var imy = 4*this.snow[i].yframe;
      g_imgcache.draw_s("puff", imx, imy, 4, 4, this.snow[i].x, this.snow[i].y, 4, 4, 0, 0.75);
    }
  }



  if (this.debug) {
    var x0 = this.debug_rect[0][0];
    var y0 = this.debug_rect[0][1];
    var x1 = this.debug_rect[1][0];
    var y1 = this.debug_rect[1][1];
    g_painter.drawRectangle(x0,y0, Math.abs(x1-x0), Math.abs(y1-y0), 1, "rgba(255,0,0,0.6)");
  }



  this.painter.endDraw();

}

mainWorld.prototype.camera_shake = function() {

  var ds = 10 * this.painter.zoom;
  var ds2 = Math.floor(ds/2);
  for (var i=0; i<5; i++) {
    var dx = Math.floor(Math.random()*ds)-ds2;
    var dy = Math.floor(Math.random()*ds)-ds2;
    this.camshake.push({ "initial_delay": i*4+1, "ttl" : 4, "dx" : dx, "dy" : dy });
  }

  this.orig_dx = 0;
  this.orig_dy = 0;

}

mainWorld.prototype.init_rain = function() {
  this.rain = [];
  this.rain_impact = [];
  var N = this.rain_max;
  var dr = 32*16;
  var dt = this.rain_dt;
  var fudge = Math.floor( (dt/2) );
  n = this.rain.length;

  for (var i=0; i<N; i++) {
    var ttl = Math.floor(Math.random()*dt)+1;

    this.rain.push({ "ttl": ttl, "x": Math.floor(Math.random()*dr)+fudge, "y": Math.floor(Math.random()*dr)-fudge });
    var ri = new rainImpact(this.rain[i].x, this.rain[i].y);
    this.rain_impact.push(ri);
  }

}

mainWorld.prototype.update_rain = function() {
  var dt = this.rain_dt;
  var fudge = Math.floor( (dt/2) );
  var N = this.rain_N;
  //var dr = 32*16;
  var dr = 40*16;

  var center_x = 0;
  var center_y = 0;

  if (this.player) {
    center_x = this.player.x - dr/2;
    center_y = this.player.y - dr/2;
  }

  for (var i=0; i<N; i++) {
    this.rain[i].ttl--;
    this.rain[i].x += this.rain_vx;
    this.rain[i].y += this.rain_vy;
    if (this.rain[i].ttl<=0) {

      this.rain_impact[i].start(this.rain[i].x, this.rain[i].y);

      this.rain[i].ttl = Math.floor(Math.random()*dt)+1;
      this.rain[i].x = Math.floor(Math.random()*dr)+fudge + center_x;
      this.rain[i].y = Math.floor(Math.random()*dr)-fudge + center_y;
    }

    if (this.rain_impact[i].state != "idle") {
      this.rain_impact[i].update();
    }

  }

}

mainWorld.prototype.init_snow = function() {
  this.snow = [];
  for (var i=0; i<this.snow_max; i++) {
    this.snow.push({ "ttl": 0, "x": 0, "y": 0, "frame":0, "yframe":0 });
  }
}

mainWorld.prototype.update_snow = function() {
  var n = this.snow.length;
  var dr = 32*16;
  var N = this.snow_N;
  var dt = this.snow_dt;
  var fudge = 0;

  for (var i=0; i<this.snow_N; i++) {
    this.snow[i].ttl--;

    if (Math.random()<0.08) {
      if (Math.random()<0.8) {
        this.snow[i].x--;
      } else {
        this.snow[i].x++;
      }
    }

    if ((this.snow[i].ttl%3)==0) { this.snow[i].y ++; }

    if (this.snow[i].ttl<0) {
      var f = Math.floor(Math.random()*2) + 2;
      var yf = Math.floor(Math.random()*4);
      var ttl = Math.floor(Math.random()*dt)+1;

      this.snow[i].ttl = ttl;
      this.snow[i].x = Math.floor(Math.random()*dr)+fudge;
      this.snow[i].y = Math.floor(Math.random()*dr)-fudge;
      this.snow[i].frame = f;
      this.snow[i].yframe = yf;

    }

  }

}


mainWorld.prototype.player_attack_enemy = function() {
  var hit_enemy = false;

  if (!this.enemy) { return; }
  if (!this.player) { return; }

  for (var key in this.enemy) {
    if (!("hit_bounding_box" in this.enemy[key])) { continue; }
    if (this.enemy[key].state == "dead") { continue; }

    var en_bbox = this.enemy[key].hit_bounding_box;
    var sword_bbox = this.player.sword_bbox;

    if (box_box_intersect(en_bbox, sword_bbox,.125)) {

      this.enemy[key].hit(this.player.sword_damage);

      var cx = Math.floor((this.player.sword_bbox[1][0] - this.player.sword_bbox[0][0])/2);
      var cy = Math.floor((this.player.sword_bbox[1][1] - this.player.sword_bbox[0][1])/2);
      cx += this.player.sword_bbox[0][0];
      cy += this.player.sword_bbox[0][1];

      var dirxy = this.player.actual_dir_xy();
      var dx = dirxy[0];
      var dy = dirxy[1];

      var p = new particleDebris(cx,cy,dx,dy,1,1,"rgba(255,255,255,0.7)");
      this.particle.push(p);

      hit_enemy=true;
    }
  }

  return hit_enemy;

}

mainWorld.prototype.player_kickback = function() {
  var player = this.player;

  var dirxy = player.actual_dir_xy();
  var dx = dirxy[0];
  var dy = dirxy[1];

  var kickback_pos_x = player.x - Math.floor(Math.random()*dirxy[0]*2);
  var kickback_pos_y = player.y - Math.floor(Math.random()*dirxy[1]*2);

  var tbbox = [[kickback_pos_x,player.y],[kickback_pos_x+player.size-1,player.y+player.size-1]];

  if (!this.bbox_level_collision(tbbox)) {
    player.x = kickback_pos_x;
  }

  tbbox = [[player.x,kickback_pos_y],[player.x+player.size-1,kickback_pos_y+player.size-1]];

  if (!this.bbox_level_collision(tbbox)) {
    player.y = kickback_pos_y;
  }
}

// Pros: has lead
// Cons: 'wobbles' when movement has stopped (because of lead window)
//       'snaps' when direction change
//
mainWorld.prototype.updateCam_lerp_average_lead_window = function() {
  var painter = this.painter;
  var screen0 = { "x": painter.width/2, "y": painter.height/2 };
  var world0 = painter.devToWorld(screen0.x, screen0.y);

  var dest_world = {"x": world0.x, "y": world0.y };
  if (this.player) {

    var dx = this.player.x - this.player_prev_x;
    var dy = this.player.y - this.player_prev_y;
    this.player_prev_x = this.player.x;
    this.player_prev_y = this.player.y;

    var dxy = Math.floor(Math.abs(dx) + Math.abs(dy));

    var dv = 0;
    var p = this.camvec_pos;
    this.camvec[p] = dxy;
    this.camvec_pos = (p+1)%this.camvec.length;
    for (var i=0; i<this.camvec.length; i++) {
      dv += this.camvec[i];
    }

    var player_dir = this.player.dir_xy();

    var vec_dir = { "x" : dv*player_dir[0], "y": dv*player_dir[1]};
    var lead_xy = { "x": this.player.x + vec_dir.x, "y":this.player.y + vec_dir.y};

    var p1 = 1/16;
    var p2 = 1/32;
    var p0 = 1-p1-p2;

    dest_world.x = (p0*world0.x + p1*this.player.x + p2*lead_xy.x);
    dest_world.y = (p0*world0.y + p1*this.player.y + p2*lead_xy.y);

    var dest_screen = painter.worldToDev(dest_world.x, dest_world.y);

    screen_dx = -(dest_screen.x - screen0.x);
    screen_dy = -(dest_screen.y - screen0.y);

    // clamp
    if (screen_dx >= ((painter.width/2)-3))      { screen_dx =   (painter.width/2)-3;   }
    if (screen_dx <= (-((painter.width/2)-3)))   { screen_dx = -((painter.width/2)-3);  }
    if (screen_dy >= ((painter.height/2)-3))     { screen_dy =   (painter.height/2)-3;  }
    if (screen_dy <= (-((painter.height/2)-3)))  { screen_dy = -((painter.height/2)-3); }

    screen_dx = Math.floor(screen_dx);
    screen_dy = Math.floor(screen_dy);

    if (Math.abs(screen_dx) < 1/1024) { scree_dx = 0; }
    if (Math.abs(screen_dy) < 1/1024) { scree_dy = 0; }

    painter.adjustPan(screen_dx,screen_dy);
  }

}

// Pros: simple
// Cons: no lead
//
mainWorld.prototype.updateCam_lerp_position_locking = function() {
  var painter = this.painter;
  var screen0 = { "x": painter.width/2, "y": painter.height/2 };
  var world0 = painter.devToWorld(screen0.x, screen0.y);

  var dest_world = {"x": world0.x, "y": world0.y };
  if (this.player) {

    var p1 = 1/32;
    var p0 = 1-p1;
    dest_world.x = (p0*world0.x + p1*this.player.x);
    dest_world.y = (p0*world0.y + p1*this.player.y);

    var dest_screen = painter.worldToDev(dest_world.x, dest_world.y);

    screen_dx = -(dest_screen.x - screen0.x);
    screen_dy = -(dest_screen.y - screen0.y);

    // clamp
    //
    if (screen_dx >= ((painter.width/2)-3))      { screen_dx =   (painter.width/2)-3;   }
    if (screen_dx <= (-((painter.width/2)-3)))   { screen_dx = -((painter.width/2)-3);  }
    if (screen_dy >= ((painter.height/2)-3))     { screen_dy =   (painter.height/2)-3;  }
    if (screen_dy <= (-((painter.height/2)-3)))  { screen_dy = -((painter.height/2)-3); }

    screen_dx = Math.floor(screen_dx);
    screen_dy = Math.floor(screen_dy);

    //painter.adjustPan(screen_dx,screen_dy);

    //var z = this.get_player_vel_zoom();
    var z = this.get_player_accel_zoom();
    painter.adjustPanZoom(screen_dx,screen_dy,z);
  }
}

// Pros: mostly what I want:
//   - no headache inducing follow cam
//   - camera stays stionary while exploring places of interest
// Cons: hard to get window boundaries right.  Want to
//   'push' on edge to get more of the action area visible.
//   Too often, you get in the boundaries where monsters are
//   and get annoyed.
//   Also when walking for a while the camera sometimes 'bobs'.
//   Also has the same problem as not being able to look ahead.
//
mainWorld.prototype.updateCam_lerp_snap_on_edge = function() {
  var painter = this.painter;
  var screen0 = { "x": painter.width/2, "y": painter.height/2 };
  var world0 = painter.devToWorld(screen0.x, screen0.y);

  if (typeof this.dest_world=== "undefined") {
    this.dest_world = {"x":world0.x, "y": world0.y };
  }

  var cur_dest_world = {"x": world0.x, "y": world0.y };
  if (this.player) {

    var windx = 10*16;
    var windy = 6*16;

    if (Math.abs(this.player.x - world0.x) > windx) {
      this.dest_world.x = 16*Math.floor(this.player.x/16);
    } else if (Math.abs(this.player.y-8 - world0.y) > windy) {
      this.dest_world.y = 16*Math.floor(this.player.y/16);
    }

    var p1 = 1/32;
    var p0 = 1-p1;
    cur_dest_world.x = (p0*world0.x + p1*this.dest_world.x);
    cur_dest_world.y = (p0*world0.y + p1*this.dest_world.y);

    var dest_screen = painter.worldToDev(cur_dest_world.x, cur_dest_world.y);

    screen_dx = -(dest_screen.x - screen0.x);
    screen_dy = -(dest_screen.y - screen0.y);

    // clamp
    //
    if (screen_dx >= ((painter.width/2)-3))      { screen_dx =   (painter.width/2)-3;   }
    if (screen_dx <= (-((painter.width/2)-3)))   { screen_dx = -((painter.width/2)-3);  }
    if (screen_dy >= ((painter.height/2)-3))     { screen_dy =   (painter.height/2)-3;  }
    if (screen_dy <= (-((painter.height/2)-3)))  { screen_dy = -((painter.height/2)-3); }

    screen_dx = Math.floor(screen_dx);
    screen_dy = Math.floor(screen_dy);

    //painter.adjustPan(screen_dx,screen_dy);

    var z = this.get_player_vel_zoom();
    painter.adjustPanZoom(screen_dx,screen_dy,z);

  }
}

// hm, not sure
//
mainWorld.prototype.get_player_accel_zoom = function() {
  //var default_zoom = 3.25;
  //var max_zoom = 2.5;

  var default_zoom = 3;
  var max_zoom = 2;

  if (typeof this.camvec_sum === "undefined") {
    this.camvec_sum = 0;
  }

  this.camvec_sum_max = 256;

  this.camvec_m = 3*this.camvec_sum_max/8;
  this.camvec_M = 5*this.camvec_sum_max/8;

  if (this.player) {

    if (typeof this.player_prev_xx === "undefined") {
      this.player_prev_xx = this.player.x;
      this.player_prev_yy = this.player.y;
    }

    var dx = this.player.x - this.player_prev_x;
    var dy = this.player.y - this.player_prev_y;
    var dxx = this.player_prev_x - this.player_prev_xx;
    var dyy = this.player_prev_y - this.player_prev_yy;
    this.player_prev_xx = this.player_prev_x;
    this.player_prev_yy = this.player_prev_y;
    this.player_prev_x = this.player.x;
    this.player_prev_y = this.player.y;

    if ((Math.abs(dx)<0.125) && (Math.abs(dy)<0.125)) {
      this.camvec_sum-=2;
    } else if ((Math.abs(dx-dxx)<0.125) && (Math.abs(dy-dyy)<0.125)) {
      this.camvec_sum++;
    } else {
      this.camvec_sum-=2;
    }

    if (this.camvec_sum<0) { this.camvec_sum = 0; }
    if (this.camvec_sum>this.camvec_sum_max) { this.camvec_sum = this.camvec_sum_max; }

    var v = this.camvec_sum;
    var m = this.camvec_m;
    var M = this.camvec_M;


    if (v<m) { v=m; }
    if (v>M) { v=M; }

    var r = (v - m)/(M-m);
    return (default_zoom*(1-r)) + (r*max_zoom);

  }

  return default_zoom;
}

mainWorld.prototype.get_player_vel_zoom = function() {
  //var default_zoom = 3.25;
  //var max_zoom = 2.5;

  var default_zoom = 3;
  var max_zoom = 2;

  if (typeof this.camvec_sum === "undefined") {
    this.camvec_sum = 0;
  }
  this.camvec_sum_max = 256;

  this.camvec_m = 3*this.camvec_sum_max/8;
  this.camvec_M = 5*this.camvec_sum_max/8;

  if (this.player) {
    var dx = this.player.x - this.player_prev_x;
    var dy = this.player.y - this.player_prev_y;
    this.player_prev_x = this.player.x;
    this.player_prev_y = this.player.y;

    var dxy = Math.floor(Math.abs(dx) + Math.abs(dy));
    if (dxy<0.125) {
      this.camvec_sum--;
    } else {
      this.camvec_sum++;
    }
    if (this.camvec_sum<0) { this.camvec_sum = 0; }
    if (this.camvec_sum>this.camvec_sum_max) { this.camvec_sum = this.camvec_sum_max; }

    var v = this.camvec_sum;
    var m = this.camvec_m;
    var M = this.camvec_M;


    if (v<m) { v=m; }
    if (v>M) { v=M; }

    var r = (v - m)/(M-m);
    return (default_zoom*(1-r)) + (r*max_zoom);

  }

  return default_zoom;
}

mainWorld.prototype.updateCam = function() {

  this.updateCam_lerp_position_locking();
  //this.updateCam_lerp_average_lead_window();
  //this.updateCam_lerp_snap_on_edge();
  return;

  var painter = this.painter;
  var screen0 = { "x": painter.width/2, "y": painter.height/2 };
  var world0 = painter.devToWorld(screen0.x, screen0.y);

  var dest_world = {"x": world0.x, "y": world0.y };
  if (this.player) {

    var dx = this.player.x - this.player_prev_x;
    var dy = this.player.y - this.player_prev_y;
    this.player_prev_x = this.player.x;
    this.player_prev_y = this.player.y;

    var dxy = Math.floor(Math.abs(dx) + Math.abs(dy));

    var dv = 0;
    var p = this.camvec_pos;
    this.camvec[p] = dxy;
    this.camvec_pos = (p+1)%this.camvec.length;
    for (var i=0; i<this.camvec.length; i++) {
      dv += this.camvec[i];
    }

    //console.log(dxy, dv);

    var player_dir = this.player.dir_xy();

    var vec_dir = { "x" : dv*player_dir[0], "y": dv*player_dir[1]};
    var lead_xy = { "x": this.player.x + vec_dir.x, "y":this.player.y + vec_dir.y};

    //dest_world.x = Math.floor((world0.x + this.player.x + vec_dir.x)/3);
    //dest_world.y = Math.floor(((world0.y + this.player.y + vec_dir.y)/3);

    // attempt 0:
    //
    //var p1 = 1/32;
    //var p0 = 1-p1;
    //dest_world.x = (p0*world0.x + p1*this.player.x);
    //dest_world.y = (p0*world0.y + p1*this.player.y);

    var p1 = 1/16;
    var p2 = 1/32;
    var p0 = 1-p1-p2;

    // interesting artifact...windowing because of the floor
    //
    //dest_world.x = Math.floor(p0*world0.x + p1*this.player.x);
    //dest_world.y = Math.floor(p0*world0.y + p1*this.player.y);

    dest_world.x = (p0*world0.x + p1*this.player.x + p2*lead_xy.x);
    dest_world.y = (p0*world0.y + p1*this.player.y + p2*lead_xy.y);


    var dest_screen = painter.worldToDev(dest_world.x, dest_world.y);

    //screen_dx = -Math.floor(dest_screen.x - screen0.x);
    //screen_dy = -Math.floor(dest_screen.y - screen0.y);

    screen_dx = -(dest_screen.x - screen0.x);
    screen_dy = -(dest_screen.y - screen0.y);

    //console.log(world0.x, world0.y, screen_dx, screen_dy);

    // clamp
    if (screen_dx >= ((painter.width/2)-3))      { screen_dx =   (painter.width/2)-3;   }
    if (screen_dx <= (-((painter.width/2)-3)))   { screen_dx = -((painter.width/2)-3);  }
    if (screen_dy >= ((painter.height/2)-3))     { screen_dy =   (painter.height/2)-3;  }
    if (screen_dy <= (-((painter.height/2)-3)))  { screen_dy = -((painter.height/2)-3); }

    screen_dx = Math.floor(screen_dx);
    screen_dy = Math.floor(screen_dy);

    //screen_dx = (screen_dx);
    //screen_dy = (screen_dy);

    if (Math.abs(screen_dx) < 1/1024) { scree_dx = 0; }
    if (Math.abs(screen_dy) < 1/1024) { scree_dy = 0; }

    //console.log(screen_dx, screen_dy);

    painter.adjustPan(screen_dx,screen_dy);

  }


  //console.log(screen0, world0);
  return;

  var dev_xy = painter.worldToDev(world_x, world_y);
  var x = dev_xy.x;
  var y = dev_xy.y;

  var dx = (painter.width/2) - x;
  var dy = (painter.height/2) - y;


  var dev_xy = painter.worldToDev(world_x, world_y);


  var player_x = 0;
  var player_y = 0;

  var player_vx = 0;
  var player_vy = 0;
  var p=0;

  if (this.player) {

    player_x = this.player.x;
    player_y = this.player.y;

    var dx = this.player.x - this.player_prev_x;
    var dy = this.player.y - this.player_prev_y;

    p = this.player_focus_v_pos;
    this.player_focus_v[p][0] = dx;
    this.player_focus_v[p][1] = dy;
    this.player_focus_v_pos = (p+1)%this.player_focus_v_window;

    dx = 0;
    dy = 0;
    for (var i=0; i<this.player_focus_v_window; i++) {
      dx += this.player_focus_v[i][0];
      dy += this.player_focus_v[i][1];
    }

    player_vx = dx*this.player_focus_v_factor;
    player_vy = dy*this.player_focus_v_factor;

    //var dx = this.player.x - this.player_prev_x;
    //var dy = this.player.y - this.player_prev_y;

    var predict_x = this.player.x + dx;
    var predict_y = this.player.y + dy;

    //var dest_cam_x = (this.player.x + predict_x)/2;
    //var dest_cam_y = (this.player.y + predict_y)/2;

    var dest_cam_x = predict_x;
    var dest_cam_y = predict_y;

    p = this.player_focus_history_pos;
    this.player_focus_history[p][0] = dest_cam_x;
    this.player_focus_history[p][1] = dest_cam_y;
    this.player_focus_history_pos = (p+1)%this.player_focus_history_window;
    this.player_update_focus();

    this.player_prev_x = this.player.x;
    this.player_prev_y = this.player.y;
  }


  //var world_x = this.player_focus[0];
  //var world_y = this.player_focus[1];

  var world_x = player_x + player_vx;
  var world_y = player_y + player_vy;

  var painter = this.painter;

  var dev_xy = painter.worldToDev(world_x, world_y);
  var x = dev_xy.x;
  var y = dev_xy.y;

  var dx = (painter.width/2) - x;
  var dy = (painter.height/2) - y;

  // clamp
  if (dx >= ((painter.width/2)-3))      { dx =   (painter.width/2)-3;   }
  if (dx <= (-((painter.width/2)-3)))   { dx = -((painter.width/2)-3);  }
  if (dy >= ((painter.height/2)-3))     { dy =   (painter.height/2)-3;  }
  if (dy <= (-((painter.height/2)-3)))  { dy = -((painter.height/2)-3); }

  dx = Math.floor(dx);
  dy = Math.floor(dy);

  painter.adjustPan(dx,dy);

}

mainWorld.prototype.update_wave_sfx = function() {
  var max_y = 1952;
  var min_y = 1700;
  var vol_max = 0.5;

  if (!this.player) { return; }
  var py = this.player.y;

  if (typeof this.wave_sound_playing === "undefined") {
    this.wave_sound_playing = false;
  }

  if (this.wave_sound_playing && (py<min_y)) {
    g_sfx["wave"][0].stop();
    this.wave_sound_playing=false;
    return;
  }

  var v = (py - min_y) / (max_y - min_y);
  if (v > 1) { v = 1; }

  if (!this.wave_sound_playing) {
    g_sfx["wave"][0].play();
    this.wave_sound_playing=true;
  }

  if (this.wave_sound_playing) {
    g_sfx["wave"][0].volume(v*vol_max);
  }
}

mainWorld.prototype.update_home_music = function() {
}

mainWorld.prototype.update_rain_sfx = function() {
  // playing around
  //
  if (typeof this.rain_sound_playing === "undefined") {
    this.rain_sound_playing = false;
    this.rain_transition_n = 100;
    this.rain_transition = this.rain_transition_n;
    this.rain_timer_n = 30*20;
    this.rain_timer = this.rain_timer_n;
    this.rain_eo = 0;

    this.rain_ramp_up_n = 100;
    this.rain_ramp_up = 0;

    this.rain_ramp_down_n = 100;
    this.rain_ramp_down = this.rain_ramp_down_n;

    this.rain_max_vol = 0.5;
  }

  if (this.rain_sound_playing) {

    if (this.rain_flag) {

      this.rain_ramp_up++;
      if (this.rain_ramp_up <= this.rain_ramp_up_n) {
        g_sfx["rain"][this.rain_eo].volume(this.rain_max_vol*this.rain_ramp_up/this.rain_ramp_up_n);
      }

      this.rain_timer--;
      if (this.rain_timer<=0) {
        this.rain_transition--;

        var v = this.rain_transition/this.rain_transition_n;
        if (v<0) { v=0; }

        if (this.rain_timer==0) {
          g_sfx["rain"][1-this.rain_eo].play();
        }

        g_sfx["rain"][this.rain_eo].volume(this.rain_max_vol*v);
        g_sfx["rain"][1-this.rain_eo].volume(this.rain_max_vol*(1-v));

        if (this.rain_transition<=0) {
          this.rain_transition= this.rain_transition_n;
          this.rain_timer = this.rain_timer_n;

          g_sfx["rain"][this.rain_eo].stop();

          this.rain_eo = 1-this.rain_eo;
        }
      }
    } else {

      // I think this still jumps around a bit...
      //
      this.rain_ramp_down--;
      if (this.rain_ramp_down == 0) {
        g_sfx["rain"][0].stop();
        g_sfx["rain"][1].stop();
        this.rain_sound_playing=false;
      } else if (this.rain_ramp_down > 0) {
        g_sfx["rain"][this.rain_eo].volume(this.rain_max_vol*this.rain_ramp_down/this.rain_ramp_down_n);
        g_sfx["rain"][1-this.rain_eo].stop();
      }

    }
  }

  if (this.rain_flag) {
    if (!this.rain_sound_playing) {
      this.rain_eo = 0;
      g_sfx["rain"][this.rain_eo].play();
      g_sfx["rain"][this.rain_eo].volume(0);

      this.rain_transition = this.rain_transition_n;
      this.rain_timer = this.rain_timer_n;
      this.rain_sound_playing = true;

      this.rain_ramp_up = 0;
      this.rain_ramp_down = this.rain_ramp_down_n;
    }
  }


}


mainWorld.prototype.level_transition_init = function() {
  this.level_transition_t_N = 30;
  this.level_transition_t = this.level_transition_t_N;
  this.level_transition_completed = false;
  this.level_transition_alpha = 1.0;
}

mainWorld.prototype.update_level_transition = function() {
  if (typeof this.level_transition_t === "undefined") {
    this.level_transition_init();
  }

  this.level_transition_t--;
  if (this.level_transition_t < 0) {
    this.level_transition_completed = true;
    this.level_transition_alpha = 0.0;
  } else {
    this.level_transition_alpha = this.level_transition_t / this.level_transition_t_N;
  }
}

mainWorld.prototype.update = function() {

  if (!this.ready) { return; }

  this.ticker++;

  if (this.level_transition) {
    this.update_level_transition();

    if (this.level_transition_completed) {
      this.level_transition_init();
      //this.level = new dungeonJade();
      this.level = g_level_dungeon_jade;
      this.level.x = g_player.x - 128;
      this.level.y = g_player.y - 128;
      //this.level.x = 0;
      //this.level.y = 0;
      this.level_transition = false;
    }
    return;
  }

  this.update_rain_sfx();
  //this.update_wave_sfx();

  if ((this.ticker%1000)==0) {
    //var s = Math.floor(Math.random()*3);
    var r = Math.random();

    //if (s==0) {
    if (r < 0.1) {
      this.environment_state = "idle";
      this.rain_flag = false;
      this.snow_flag = false;
    //} else if (s==1) {
    } else if (r<.9) {
      this.environment_state = "rain";
      this.rain_flag = true;
      this.snow_flag = false;
    //} else if (s==2) {
    } else {
      this.environment_state = "snow";
      this.rain_flag = false;
      this.snow_flag = true;
    }
  }

  //...

  if (this.rain_flag) { this.update_rain(); }
  if (this.snow_flag) { this.update_snow(); }

  if (this.debris) {
    for (var key in this.debris) {
      this.debris[key].update();
    }
  }

  if (this.player)
  {
    this.player.update();
  }

  this.updateCam();


  // Camera shake for explosions
  //
  // initial_delay gets decremented no matter what.  A 0
  // inidicates a 'start'.
  // ttl to 0 indicates an end.
  //
  // want to have it come after player updates to pick up
  // player camera changes
  //
  var new_camshake_a = [];
  for (var i=0; i<this.camshake.length; i++) {
    this.camshake[i].initial_delay--;

    if (this.camshake[i].initial_delay>0) {
      new_camshake_a.push(this.camshake[i]);
      continue;
    } else if (this.camshake[i].initial_delay==0) {
      this.painter.adjustPan(this.camshake[i].dx, this.camshake[i].dy);
    }

    this.camshake[i].ttl--;
    if (this.camshake[i].ttl<=0) {
      this.painter.adjustPan(-this.camshake[i].dx, -this.camshake[i].dy);
    } else {
      new_camshake_a.push(this.camshake[i]);
    }

  }
  this.camshake = new_camshake_a;



  if (this.level)
    this.level.update();

  if (this.particle) {
    for (var key in this.particle) {
      this.particle[key].update();
    }

    var new_p_a = [];
    for (var key in this.particle) {
      if (this.particle[key].ttl<=0) { continue; }
      new_p_a.push(this.particle[key]);
    }
    this.particle = new_p_a;

  }

  if (this.enemy)
  {
    for (var key in this.enemy) {
      this.enemy[key].update(this);
    }
  }

  if (this.element) {
    var new_ele_a = [];
    for (var key in this.element) {
      this.element[key].update();

      if (this.element[key].type == "bomb") {
        if (this.element[key].intent.type == "explode") {
          this.camera_shake();

          var bg = new bombGrundge(this.element[key].x, this.element[key].y);
          this.debris.push(bg);
        }
      } else if (this.element[key].type == "arrow") {

        var abbox = this.element[key].bbox;
        var cx = abbox[0][0];
        var cy = abbox[0][1];
        var dx = this.element[key].next_x - this.element[key].x;
        var dy = this.element[key].next_y - this.element[key].y;

        var l0 = { "x" : cx, "y" : cy };
        var l1 = { "x" : cx+dx, "y" : cy+dy };

        this.debug_rect[0][0] = l0.x -1;
        this.debug_rect[0][1] = l0.y -1;

        this.debug_rect[1][0] = l1.x +1;
        this.debug_rect[1][1] = l1.y +1;

        if (this.line_level_collision(l0, l1)) {
          this.element[key].ttl = 0;

          var ax = ((dx>0)?1:-1);
          var ay = ((dy>0)?1:-1);

          var arrow_dust2 = new dust();
          arrow_dust2.x = l0.x;
          arrow_dust2.y = l0.y;
          this.particle.push(arrow_dust2);

        }

      }

      if (this.element[key].ttl>0) {
        new_ele_a.push(this.element[key]);
      }


    }
    this.element = new_ele_a;
  }


  var player = this.player;
  if (player) {

    if (player.intent.type != "idle") {

      if (player.intent.type == "walking") {

        var dst_x = player.intent.next.x;
        var dst_y = player.intent.next.y;

        //...

        var align_dx = 0;
        var align_dy = 0;
        var player_dir = player.actualDirection();

        var align_sz = this.size/2;

        var ofx = dst_x % align_sz;
        var ofy = dst_y % align_sz;

        var collision_align_dx = 0;
        var collision_align_dy = 0;

        if (ofx<0) { ofx = (ofx+align_sz)%align_sz; }
        if (ofy<0) { ofy = (ofy+align_sz)%align_sz; }

        ofx = Math.floor(ofx+0.5);
        ofy = Math.floor(ofy+0.5);


        if ((player_dir == "up") || (player_dir == "down")) {
          if (ofx!=0) {
            if (ofx<(align_sz/2)) { collision_align_dx=-1; }
            else { collision_align_dx=1; }
          }
        }

        if ((player_dir == "left") || (player_dir == "right")) {
          if (ofy!=0) {
            if (ofy<(align_sz/2)) { collision_align_dy=-1; }
            else { collision_align_dy=1; }
          }
        }

        var has_collision = false;

        //if (!this.player_level_collision(dst_x, player.y)) {

        var dstx_bbox = [[dst_x, player.y], [dst_x+player.size-1,player.y+player.size-1]];
        var dsty_bbox = [[player.x, dst_y], [player.x+player.size-1,dst_y+player.size-1]];


        if (!this.bbox_level_collision(dstx_bbox)) {
          player.x = dst_x;
        } else { has_collision = true; }

        if (!this.bbox_level_collision(dsty_bbox)) {
          player.y = dst_y;
        } else { has_collision = true; }


        if (has_collision) {

          // 'hug' the wall if you walk into it.
          //
          if (player_dir=="right") {
            var sz = this.size/2;
            var ovf_x = (((dst_x%sz)+sz)%sz);
            var nudge_x = dst_x - ovf_x;

            var tbbox = [[nudge_x,dst_y],[nudge_x+player.size-1,dst_y+player.size-1]];

            if (player.x != nudge_x) {
              if (!this.bbox_level_collision(tbbox)) {
                player.x = nudge_x;
                player.y = dst_y;
              }
            }
          }

          else if (player_dir=="left") {
            var sz = this.size/2;
            var ovf_x = sz - (((dst_x%sz)+sz)%sz);
            var nudge_x = dst_x + ovf_x;

            var tbbox = [[nudge_x,dst_y],[nudge_x+player.size-1,dst_y+player.size-1]];

            if (player.x != nudge_x) {
              if (!this.bbox_level_collision(tbbox)) {
                player.x = nudge_x;
                player.y = dst_y;
              }
            }

          }

          else if (player_dir=="up") {
            var sz = this.size/2;
            var ovf_y = sz - (((dst_y%sz)+sz)%sz);
            var nudge_y = dst_y + ovf_y;

            var tbbox = [[dst_x,nudge_y],[dst_x+player.size-1,nudge_y+player.size-1]];

            if (player.y != nudge_y) {
              if (!this.bbox_level_collision(tbbox)) {
                player.x = dst_x;
                player.y = nudge_y;
              }
            }

          }

          else if (player_dir=="down") {
            var sz = this.size/2;
            var ovf_y = (((dst_y%sz)+sz)%sz);
            var nudge_y = dst_y - ovf_y;

            var tbbox = [[dst_x,nudge_y],[dst_x+player.size-1,nudge_y+player.size-1]];

            if (player.y != nudge_y) {
              if (!this.bbox_level_collision(tbbox)) {
                player.x = dst_x;
                player.y = nudge_y;
              }
            }

          }

        }

        if (this.player_nudge_delay==0) {
          this.player_nudge_delay = this.player_nudge_delay_count;
        }
        this.player_nudge_delay--;

      } else if (player.intent.type == "swordAttack") {

        if (this.player_attack_enemy()) {
          var n = g_sfx["enemy-hit"].length;
          n = Math.floor(Math.random()*n);
          g_sfx["enemy-hit"][n].play();

          this.player_kickback();
        }

        if (this.player_attack_level_collision()) {

          var cx = Math.floor((player.sword_bbox[1][0] - player.sword_bbox[0][0])/2);
          var cy = Math.floor((player.sword_bbox[1][1] - player.sword_bbox[0][1])/2);
          cx += player.sword_bbox[0][0];
          cy += player.sword_bbox[0][1];

          var dirxy = player.actual_dir_xy();
          var dx = dirxy[0];
          var dy = dirxy[1];

          // Create a debris particle
          //
          if (Math.random()<0.7) {
            var p = new particleDebris(cx,cy,dx,dy);
            this.particle.push(p);
          }

          // Playe rkickback
          //
          this.player_kickback();
          
          /*
          var kickback_pos_x = player.x - Math.floor(Math.random()*dirxy[0]*2);
          var kickback_pos_y = player.y - Math.floor(Math.random()*dirxy[1]*2);

          var tbbox = [[kickback_pos_x,player.y],[kickback_pos_x+player.size-1,player.y+player.size-1]];

          if (!this.bbox_level_collision(tbbox)) {
            player.x = kickback_pos_x;
          }

          tbbox = [[player.x,kickback_pos_y],[player.x+player.size-1,kickback_pos_y+player.size-1]];

          if (!this.bbox_level_collision(tbbox)) {
            player.y = kickback_pos_y;
          }
          */


          // sfx
          //
          var x = Math.floor(Math.random()*g_sfx["sword-thud"].length);
          g_sfx["sword-thud"][x].play();

        }
      } else if (player.intent.type == "bombThrow") {

        var tx = player.intent.x;
        var ty = player.intent.y;
        var tdx = player.intent.dx;
        var tdy = player.intent.dy;
        var td = player.intent.d;

        var r = 3;
        var r2 = Math.floor(r/2);
        var fudge_x = Math.floor(Math.random()*r)-r2;
        var fudge_y = Math.floor(Math.random()*r)-r2;

        var bo = new itemBomb(player.intent);
        bo.x = this.player.x + fudge_x;
        bo.y = this.player.y + fudge_y;

        this.element.push(bo);


      } else if (player.intent.type == "particleFirefly") {

        var tx = player.intent.x;
        var ty = player.intent.y;
        var tdx = player.intent.dx;
        var tdy = player.intent.dy;
        var td = player.intent.d;

        var ee = new particleFirefly(tx,ty,tdx,tdy);
        this.particle.push(ee);
      } else if (player.intent.type == "shootArrow") {
        var nt = player.intent;

        var ar = new itemArrow(player.intent);
        this.element.push(ar);

        // sfx
        //
        var x = Math.floor(Math.random()*g_sfx["arrow-shoot"].length);
        g_sfx["arrow-shoot"][x].play();

      } else if (player.intent.type == "teleport") {
        var px = player.intent.dest_x;
        var py = player.intent.dest_y;
        var sz = player.size;

        var dst_bbox = [[px, py], [px+sz-1,py+sz-1]];

        if (!this.bbox_level_collision(dst_bbox)) {
          player.teleport_x = player.intent.dest_x;
          player.teleport_y = player.intent.dest_y;
        } else {
          player.teleport_x = player.x;
          player.teleport_y = player.y;

        }

        player.teleport_dest_ready = true;

      }

      player.intent = { "type" : "idle" };

    }

  }

  if (this.enemy)
  {
    for (var key in this.enemy) {
      if ("intent" in this.enemy[key]) {
        var intent = this.enemy[key].intent;
        var bbox = this.enemy[key].intent.bounding_box;

        if (!this.bbox_level_collision(bbox)) {
          this.enemy[key].realize_intent();
        } else {
          this.enemy[key].world_collision(this);
        }

      }
    }
  }


  if (this.element) {
    for (var key in this.element) {
      //this.element[key].update();

      //if (this.element[key].intent.type == "
    }
  }



}
