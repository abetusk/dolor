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

  //this.size = 32;
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
  this.rain_dt = 80;

  this.snow = [];
  this.snow_flag = false;
  this.snow_v = 8;
  this.snow_N = 200;
  this.snow_dt = 200;


  // enemy creatures
  //
  //var ee = new creatureSkel();
  //this.enemy.push(ee);

  //var bones0 = new creatureBones();
  //this.enemy.push(bones0);
  //bones0.x -=16;


  //---

  //var c0 = new creatureCritter("critter_bunny", g_GRIDSIZE/2, 8);
  //var c0 = new creatureCritter("cat", g_GRIDSIZE, 16);
  //this.enemy.push(c0);
  //c0.x = 112;
  //c0.y = 304;

  var neko = new creatureNeko();
  neko.x = 112;
  neko.y = 304;
  this.enemy.push(neko);

  /*
  //var c0 = new creatureCritter("critter_bunny", g_GRIDSIZE/2, 8);
  var c0 = new creatureCritter("critter_bunny", g_GRIDSIZE, 16);
  this.enemy.push(c0);
  c0.x +=16;

  var c1 = new creatureCritter("critter_rat", g_GRIDSIZE/2, 8);
  this.enemy.push(c1);
  c1.x +=16*2;

  var c2 = new creatureCritter("critter_spider", g_GRIDSIZE/2, 8);
  this.enemy.push(c2);
  c2.x +=16*3;

  var c3 = new creatureCritter("critter_chicken", g_GRIDSIZE/2, 8);
  this.enemy.push(c3);
  c3.x +=16*4;

  var c4 = new creatureCritter("critter_turtle", g_GRIDSIZE, 16);
  this.enemy.push(c4);
  c4.x +=16*5;

  var c5 = new creatureCritter("critter_chick", g_GRIDSIZE, 16);
  this.enemy.push(c5);
  c5.x +=16*6;

  var c6 = new creatureCritter("critter_bat", g_GRIDSIZE/2, 8);
  this.enemy.push(c6);
  c6.x +=16*7;
  */

  //var c7 = new itemBomb("bomb_explosion", g_GRIDSIZE*2, 32);
  //var c7 = new debugSpriteAnimator("bomb_explosion", g_GRIDSIZE*2, 32, 8, 3);
  //this.enemy.push(c7);
  //c7.x +=16*9;

  //var c8 = new creatureCritter("critter_chicken_black", g_GRIDSIZE, 16, 8);
  //this.enemy.push(c8);
  //c8.x +=16*12;

  //var c9 = new debugSpriteAnimator("bomb_explosion2", g_GRIDSIZE*2, 32, 8, 3);
  //this.enemy.push(c9);
  //c9.x +=16*13;

  //var c19 = new debugSpriteAnimator("rotbow_w_string", 20, 20, 4, 4);
  //this.enemy.push(c19);
  //c19.x +=16*15;

  /*
  var c19 = new debugSpriteAnimator("rotbow", 20, 20, 8, 4);
  this.enemy.push(c19);
  c19.x +=16*16;


  var c20 = new debugSpriteAnimator("horns", 16, 16, 4, 4, 10)
  this.enemy.push(c20);
  c20.x +=16*17;

  var c21 = new debugSpriteAnimator("knight", 16, 16, 4, 4, 10);
  this.enemy.push(c21);
  c21.x +=16*18;

  var c22 = new debugSpriteAnimatorRotbow("rotbow_fulldraw", 20, 20, 8, 12);
  this.enemy.push(c22);
  c22.x +=16*19;

  var c22 = new debugSpriteAnimator("arrow", 16, 16, 8, 4);
  this.enemy.push(c22);
  c22.x +=16*21;

  //var c23 = new debugSpriteAnimator("tele", 20, 20, 4, 1);
  var c23 = new debugSpriteAnimator("tele", 24, 24, 4, 4);
  this.enemy.push(c23);
  c23.x +=16*19;
  c23.y += 24;
  */

  this.collisionNudgeN=1;
  //this.collisionNudgeN=0;
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
  //for (var ii=0; ii<layers.length; ii++) {
    //if (layers[ii].name != "collision") { continue; }

    //var layer = layers[ii];

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
      var tile_bbox = [[tile_x, tile_y], [tile_x+sz,tile_y+sz]];
      if (box_box_intersect(sword_bbox, tile_bbox)) {
        return true;
      }

    }

  //}

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

      var ti = level.tile_info[layer.data[jj]];

      var sz = this.size;
      tile_bbox = this.tile_bbox(layer.data[jj] - ti.firstgid, tile_x, tile_y);

      if ((tile_bbox[0][0] == 0) &&
          (tile_bbox[0][1] == 0) &&
          (tile_bbox[1][0] == 0) &&
          (tile_bbox[1][1] == 0)) {
            console.log("????", r, c);
          }

      if (box_box_intersect(bbox, tile_bbox)) {
        this.debug_rect = tile_bbox;
        return true;
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

mainWorld.prototype.draw = function() {
  this.painter.startDrawColor( "rgba(210,210,220,1.0)" );

  if (this.level)
  {
    this.level.draw_layer("bottom.-2");
    this.level.draw_layer("bottom.-1");

    if (this.debris) {
      for (var key in this.debris) {
        this.debris[key].draw();
      }
    }

    this.level.draw_layer("bottom");
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
    this.level.draw_layer("height");
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
      this.enemy[key].draw();
    }
  }

  if (this.level)
  {
    this.level.draw_layer("top");
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
    for (var i=0; i<this.rain.length; i++) {
      g_imgcache.draw_s("rain", 0, 0, 5, 10, this.rain[i].x, this.rain[i].y, 5, 10);
    }
  }

  // snow
  //
  if (this.snow_flag) {
    for (var i=0; i<this.snow.length; i++) {
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

mainWorld.prototype.update = function() {

  //...

  if (this.rain_flag) {
    var n = this.rain.length;
    var dr = 32*16;
    var N = this.rain_N;
    var dt = this.rain_dt;
    var fudge = Math.floor( (dt/2) );
    for (var i=0; i<N-n; i++) {
      var ttl = Math.floor(Math.random()*dt)+1;

      this.rain.push({ "ttl": ttl, "x": Math.floor(Math.random()*dr)+fudge, "y": Math.floor(Math.random()*dr)-fudge });
    }

    n = this.rain.length;

    var new_rain = [];
    for (var i=0; i<n; i++) {
      this.rain[i].ttl--;
      this.rain[i].x += this.rain_vx;
      this.rain[i].y += this.rain_vy;
      if (this.rain[i].ttl>0) {
        new_rain.push(this.rain[i]);
      } else {

        var ri = new rainImpact(this.rain[i].x, this.rain[i].y);
        this.particle.push(ri);
      }
    }

    this.rain = new_rain;

  }

  if (this.snow_flag) {
    var n = this.snow.length;
    var dr = 32*16;
    var N = this.snow_N;
    var dt = this.snow_dt;
    //var fudge = Math.floor( (dt/2) );
    var fudge = 0;
    for (var i=0; i<N-n; i++) {
      var f = Math.floor(Math.random()*2) + 2;
      var yf = Math.floor(Math.random()*4);
      var ttl = Math.floor(Math.random()*dt)+1;

      this.snow.push({ "ttl": ttl, "x": Math.floor(Math.random()*dr)+fudge, "y": Math.floor(Math.random()*dr)-fudge, "frame":f, "yframe":yf });
    }

    n = this.snow.length;

    var new_snow = [];
    for (var i=0; i<n; i++) {
      this.snow[i].ttl--;

      if (Math.random()<0.08) {
        if (Math.random()<0.8) {
          this.snow[i].x--;
        } else {
          this.snow[i].x++;
        }
      }


      //if ((this.snow[i].ttl%19)==0) { this.snow[i].x--; }
      //if ((this.snow[i].ttl%29)==0) { this.snow[i].x++; }

      if ((this.snow[i].ttl%3)==0) { this.snow[i].y ++; }


      if (this.snow[i].ttl>0) {
        new_snow.push(this.snow[i]);
      } else {

        //var ri = new snowImpact(this.snow[i].x, this.snow[i].y);
        //this.particle.push(ri);
      }
    }

    this.snow = new_snow;

  }


  // Camera shake for explosions
  //
  // initial_delay gets decremented no matter what.  A 0
  // inidicates a 'start'.
  // ttl to 0 indicates an end.
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

  if (this.debris) {
    for (var key in this.debris) {
      this.debris[key].update();
    }
  }

  if (this.player)
    this.player.update();

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

  if (this.element) {
    for (var key in this.element) {
      //this.element[key].update();

      //if (this.element[key].intent.type == "
    }
  }



}
