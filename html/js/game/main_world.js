function mainWorld() {
  this.player = g_player;
  this.level = g_level;
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

      if ( ((player_x - tile_x) < 32) && ((player_x - tile_x) >= -32)  &&
           ((player_y - tile_y) < 32) && ((player_y - tile_y) >= -32)
         )

      //if ( ((player_x - tile_x) < 32) && ((player_x - tile_x) >= 0) &&
      //     ((player_y - tile_y) > -32) && ((player_y - tile_y) <= 0)
      //   )
      {
        console.log("bang!!! (", r, c, ")", player_x, player_y, tile_x, tile_y);
        return true;
      }


    }
  }

  return false;
}

mainWorld.prototype.update = function() {

  var player = this.player;
  if (player) {

    if (player.intent.type != "idle") {

      if (player.intent.type == "walking") {

        var dst_x = player.intent.next.x;
        var dst_y = player.intent.next.y;


        if (!this.player_level_collision(dst_x, dst_y)) {
          player.x = player.intent.next.x;
          player.y = player.intent.next.y;
        }
      }
      player.intent = { "type" : "idle" };

    }

  }

}
