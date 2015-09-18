
function dungeon0() {
  this.tilemap = {};
  this.ready = false;
  
}

dungeon0.prototype.init = function() {
}

dungeon0.prototype.update = function() {
}

dungeon0.prototype.event = function(event_type, data) {

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

    for (var jj=0; jj<layer.data.length; jj++) {
      var r = Math.floor(jj / w);
      var h = Math.floor(jj % h);

      if (layer.data[jj] <= layer.opacity) { continue; }


    }

  }



}


