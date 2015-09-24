function mainWorld() {
  this.player = g_player;
  this.level = g_level;
  this.painter = g_painter;

  this.enemy = null;
  this.particle = [];

  this.size = 32;

  this.debug = false;

  this.player_nudge_delay_count = 8;
  this.player_nudge_delay = 8;
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

mainWorld.prototype.player_level_collision = function(player_x, player_y) {
  var level = this.level;
  if (!level) { return false; }

  var layers = level.tilemap.layers;

  for (var ii=0; ii<layers.length; ii++) {
    if (layers[ii].name != "collision") { continue; }

    var layer = layers[ii];

    var w = layer.width;
    var h = layer.height;

    var level_h = 32;
    var level_w = 32;
    var level_x = this.level.x;
    var level_y = this.level.y;

    for (var jj=0; jj<layer.data.length; jj++) {
      if (layer.data[jj]==0) { continue; }

      var r = Math.floor(jj / w);
      var c = Math.floor(jj % h);

      var tile_x = level_x + c*level_h;
      var tile_y = level_y + r*level_w;

      var sz = this.size;
      if ( ((player_x - tile_x) < sz) && ((player_x - tile_x) > -sz)  &&
           ((player_y - tile_y) < sz) && ((player_y - tile_y) > -sz)
         )
      {
        return true;
      }


    }
  }

  return false;
}



mainWorld.prototype.draw = function() {
  this.painter.startDrawColor();

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


  if (this.particle) {
    for (var key in this.particle) {
      this.particle[key].draw();
    }
  }

  if (this.enemy) {
    for (var key in this.enemy) {
      this.enemy[key].draw();
    }
  }

  if (this.level)
    this.level.draw(1);

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


  var player = this.player;
  if (player) {

    if (player.intent.type != "idle") {

      if (player.intent.type == "walking") {

        var dst_x = player.intent.next.x;
        var dst_y = player.intent.next.y;

        //...

        var align_dx = 0;
        var align_dy = 0;

        if (this.player_nudge_delay==0) {

          var align_sz = this.size;

          var ofx = dst_x % align_sz;
          var ofy = dst_y % align_sz;

          if (ofx<0) { ofx = (ofx+align_sz)%align_sz; }
          if (ofy<0) { ofy = (ofy+align_sz)%align_sz; }

          // Align to grid
          //
          var player_dir = player.actualDirection();

          if ((player_dir == "up") || (player_dir == "down")) {
            if (ofx!=0) {
              if (ofx<(align_sz/2)) { dst_x--; align_dx=-1; }
              else { dst_x++; align_dx=1; }
            }
          }

          if ((player_dir == "left") || (player_dir == "right")) {
            if (ofy!=0) {
              if (ofy<(align_sz/2)) { dst_y--; align_dy=-1; }
              else { dst_y++; align_dy=1; }
            }
          }

        }

        if (!this.player_level_collision(dst_x, dst_y)) {
          player.x = dst_x;
          player.y = dst_y;
        } else {


          if (this.player_nudge_delay==0) {

            // We have a collision but we still want to update character grid
            // alignment
            //
            if (!this.player_level_collision(player.x+align_dx,player.y)) {
              player.x += align_dx;
            }

            if (!this.player_level_collision(player.x,player.y+align_dy)) {
              player.y += align_dy;
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
          player.x -= Math.floor(Math.random()*dirxy[0]*2);
          player.y -= Math.floor(Math.random()*dirxy[1]*2);

        }
      }

      player.intent = { "type" : "idle" };

    }
  }

}
