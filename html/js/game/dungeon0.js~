
function dungeon0() {
  this.tilemap = {};
  this.ready = false;

  this.tilemap_name = "dungeon0";

  this.world_w = 64;
  this.world_h = 64;

  this.x = -1000;
  this.y = -1000;
  
}

dungeon0.prototype.init = function() {
}

dungeon0.prototype.update = function() {
  if (!this.ready) { return; }

  //console.log(">>>");
}

dungeon0.prototype.event = function(event_type, data) {
  if (!this.ready) { return; }

  if (event_type == "redraw") {
    return;
  }

  if (event_type == "input") {
  }

}

dungeon0.prototype.draw = function() {
  if (!this.ready) { return; }


  //var w = this.tilemap.width;
  //var h = this.tilemap.height;
  //for (var ii=0; ii<this.tilemap.layers.length; ii++) {
  for (var ii=2; ii<3; ii++) {

    var layer = this.tilemap.layers[ii];
    var w = layer.width;
    var h = layer.height;

    var first = true;

    for (var jj=0; jj<layer.data.length; jj++) {
      var r = Math.floor(jj / w);
      var c = Math.floor(jj % h);

      if (layer.data[jj] <= layer.opacity) { continue; }

      var x = this.x + r*this.world_w;
      var y = this.y + c*this.world_h;

      var imx = 0;
      var imy = 0;

      var dat = layer.data[jj];

      imx = Math.floor(dat*16 % 384);
      imy = Math.floor(dat*16 / 384);


      if (first) {
        //console.log(layer.data[jj]);

        //tm_r = Math.floor(layer.data[jj] / this.tilemap.tilewidth);
        //tm_c = Math.floor(layer.data[jj] % this.tilemap.tilewidth);

        first = false;
      }

      g_imgcache.draw_s(this.tilemap_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h);



    }

  }



}


