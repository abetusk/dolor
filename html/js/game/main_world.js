function mainWorld() {
  this.player = g_player;
  this.level = g_level;
  this.painter = g_painter;

  this.enemy = [];
  this.particle = [];
  this.element = [];

  //this.size = 32;
  this.size = g_GRIDSIZE;

  this.debug = false;
  this.debug_rect = [[0,0],[1,1]];

  this.player_nudge_delay_count = 8;
  this.player_nudge_delay = 8;

  var ee = new creatureSkel();
  this.enemy.push(ee);

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

  //var c7 = new itemBomb("bomb_explosion", g_GRIDSIZE*2, 32);
  var c7 = new debugSpriteAnimator("bomb_explosion", g_GRIDSIZE*2, 32, 8, 3);
  this.enemy.push(c7);
  c7.x +=16*9;

  var c8 = new creatureCritter("critter_chicken_black", g_GRIDSIZE, 16, 8);
  this.enemy.push(c8);
  c8.x +=16*12;

  var c9 = new debugSpriteAnimator("bomb_explosion2", g_GRIDSIZE*2, 32, 8, 3);
  this.enemy.push(c9);
  c9.x +=16*13;

  var c19 = new debugSpriteAnimator("rotbow_w_string", 20, 20, 4, 4);
  this.enemy.push(c19);
  c19.x +=16*15;

  var c19 = new debugSpriteAnimator("rotbow", 20, 20, 8, 4);
  this.enemy.push(c19);
  c19.x +=16*16;

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

  for (var ii=0; ii<layers.length; ii++) {
    if (layers[ii].name != "collision") { continue; }

    var layer = layers[ii];

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
  }

  return false;

}

mainWorld.prototype.tile_bbox = function(col_val, tile_x, tile_y) {
  var bbox = [[0,0],[0,0]];

  col_val -= 145;

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

mainWorld.prototype.player_level_collision = function(player_x, player_y) {
  var level = this.level;
  if (!level) { return false; }

  var layers = level.tilemap.layers;

  var player_bbox = [[0,0],[0,0]];
  var tile_bbox = [[0,0],[0,0]];

  player_bbox[0][0] = player_x;
  player_bbox[0][1] = player_y;

  player_bbox[1][0] = player_x + this.player.size-1;
  player_bbox[1][1] = player_y + this.player.size-1;

  for (var ii=0; ii<layers.length; ii++) {
    if (layers[ii].name != "collision") { continue; }

    var layer = layers[ii];

    var w = layer.width;
    var h = layer.height;

    //var level_h = 32;
    //var level_w = 32;
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

      tile_bbox = this.tile_bbox(layer.data[jj], tile_x, tile_y);

      if ((tile_bbox[0][0] == 0) &&
          (tile_bbox[0][1] == 0) &&
          (tile_bbox[1][0] == 0) &&
          (tile_bbox[1][1] == 0)) {
            console.log("????", r, c);
          }
      /*
      tile_bbox[0][0] = tile_x;
      tile_bbox[0][1] = tile_y;

      tile_bbox[1][0] = tile_x + this.size-1;
      tile_bbox[1][1] = tile_y + this.size-1;
      */


      if (box_box_intersect(player_bbox, tile_bbox)) {

        this.debug_rect = tile_bbox;

        return true;
      }

      /*
      if ( ((player_x - tile_x) < sz) && ((player_x - tile_x) > -sz)  &&
           ((player_y - tile_y) < sz) && ((player_y - tile_y) > -sz)
         )
      {
        return true;
      }
      */


    }
  }

  return false;
}


var debug_var = 0;
var debug_del = 1;

mainWorld.prototype.draw = function() {
  this.painter.startDrawColor( "rgba(210,210,220,1.0)" );

  if (this.level)
    this.level.draw(0);

  if (this.player) {
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


  }

  if (this.element) {
    for (var key in this.element) {
      this.element[key].draw();
    }
  }

  if (this.particle) {
    for (var key in this.particle) {
      this.particle[key].draw();
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
    this.level.draw(1);



  /*
  var x0 = this.debug_rect[0][0];
  var y0 = this.debug_rect[0][1];
  var x1 = this.debug_rect[1][0];
  var y1 = this.debug_rect[1][1];
  g_painter.drawRectangle(x0,y0, x1-x0, y1-y0, 1, "rgba(255,0,0,0.6)");
  */



  this.painter.endDraw();
}

mainWorld.prototype.update = function() {

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
      this.enemy[key].update();
    }
  }

  if (this.element) {
    for (var key in this.element) {
      this.element[key].update();
    }
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

        if (!this.player_level_collision(dst_x, player.y)) {
          player.x = dst_x;
        } else { has_collision = true; }

        if (!this.player_level_collision(player.x, dst_y)) {
          player.y = dst_y;
        } else { has_collision = true; }


        if (has_collision) {

          // 'hug' the wall if you walk into it.
          //
          if (player_dir=="right") {
            var sz = this.size/2;
            var ovf_x = (((dst_x%sz)+sz)%sz);
            var nudge_x = dst_x - ovf_x;

            if (player.x != nudge_x) {
              if (!this.player_level_collision(nudge_x, dst_y)) {
                player.x = nudge_x;
                player.y = dst_y;
              }
            }
          }

          else if (player_dir=="left") {
            var sz = this.size/2;
            var ovf_x = sz - (((dst_x%sz)+sz)%sz);
            var nudge_x = dst_x + ovf_x;

            if (player.x != nudge_x) {
              if (!this.player_level_collision(nudge_x, dst_y)) {
                player.x = nudge_x;
                player.y = dst_y;
              }
            }

          }

          else if (player_dir=="up") {
            var sz = this.size/2;
            var ovf_y = sz - (((dst_y%sz)+sz)%sz);
            var nudge_y = dst_y + ovf_y;

            if (player.y != nudge_y) {
              if (!this.player_level_collision(dst_x, nudge_y)) {
                player.x = dst_x;
                player.y = nudge_y;
              }
            }

          }

          else if (player_dir=="down") {
            var sz = this.size/2;
            var ovf_y = (((dst_y%sz)+sz)%sz);
            var nudge_y = dst_y - ovf_y;

            if (player.y != nudge_y) {
              if (!this.player_level_collision(dst_x, nudge_y)) {
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

          if (!this.player_level_collision(kickback_pos_x, player.y)) {
            player.x = kickback_pos_x;
          }

          if (!this.player_level_collision(player.x, kickback_pos_y)) {
            player.y = kickback_pos_y;
          }


          // sfx
          //
          var x = Math.floor(Math.random()*g_sfx["sword-thud"].length);
          g_sfx["sword-thud"][x].play();



        }
      } else if (player.intent.type == "throwBomb") {

        var tx = player.intent.x;
        var ty = player.intent.y;
        var tdx = player.intent.dx;
        var tdy = player.intent.dy;
        var td = player.intent.d;

        var bo = new itemBomb("bomb_explosion", g_GRIDSIZE*2, 32);
        bo.x = this.player.x;
        bo.y = this.player.y;

        this.element.push(bo);


      } else if (player.intent.type == "particleFirefly") {

        var tx = player.intent.x;
        var ty = player.intent.y;
        var tdx = player.intent.dx;
        var tdy = player.intent.dy;
        var td = player.intent.d;

        var ee = new particleFirefly(tx,ty,tdx,tdy);
        this.particle.push(ee);
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
