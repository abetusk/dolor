


function homeLevel(x,y) {
  x = ((typeof x === "undefined") ? 0 : x);
  y = ((typeof y === "undefined") ? 0 : y);

  this.tilemap = {};
  this.ready = false;
  this.init_flag = false;

  this.tilemap_name = "forrest";

  this.world_w = g_GRIDSIZE;
  this.world_h = g_GRIDSIZE;

  //this.x = -6*32;
  //this.y = -6*32;

  this.x = x;
  this.y = y;

  this.debug=false;

  this.tileid_lookup = {};
  this.tileset = {};
  this.tileset_list = [];

  this.layer_names = [
    "collision.top", "collision.bottom",
    "object",
    "top",
    "height",
    "bottom", "bottom.-1", "bottom.-2" ];
  this.layer_lookup = {};

  this.tile_info = {};
}


homeLevel.prototype.init = function() {
  this.init_flag=true;

  if ("tilesets" in this.tilemap) {
    for (var ind in this.tilemap.tilesets) {
      var tileset = this.tilemap.tilesets[ind];

      this.tileset[ tileset.name ] = {
        "name" : tileset.name,
        "firstgid" : tileset.firstgid,
        "imageheight" : tileset.imageheight,
        "imagewidth" : tileset.imagewidth,
        "tileheight" : tileset.tileheight,
        "tilewidth" : tileset.tilewidth
      };

      this.tileset_list.push( this.tileset[tileset.name] );

    }
  }

  this.tileset_list.sort(function(a,b) { if (Math.floor(a.firstgid)<Math.floor(b.firstgid)) { return -1; } return 1; });

  for (var i=0; i<(this.tileset_list.length-1); i++) {
    this.tileset_list[i].lastgid = Math.floor(this.tileset_list[i+1].firstgid)-1;
  }
  this.tileset_list[this.tileset_list.length-1].lastgid = -1;

  this.layer_name_index_lookup = {};
  this.layer_lookup = {};
  for (var ii=0; ii<this.tilemap.layers.length; ii++) {

    var layer = this.tilemap.layers[ii];
    var w = layer.width;
    var h = layer.height;

    this.layer_name_index_lookup[layer.name] = ii;

    this.layer_lookup[ii] = {};
    if ("data" in layer) {
      for (var jj=0; jj<layer.data.length; jj++) {
        var r = Math.floor(jj / w);
        var c = Math.floor(jj % h);
        if (layer.data[jj] == 0) { continue; }
        this.layer_lookup[ii][Math.floor(r) + ":" + Math.floor(c)] = layer.data[jj];
      }
    }

    for (var jj in layer.data) {
      var dat = layer.data[jj];
      if (dat==0) { continue; }

      if (dat in this.tile_info) { continue; }

      var ind=1;
      for (; ind<this.tileset_list.length; ind++) {
        if (Math.floor(dat) < this.tileset_list[ind].firstgid) { break; }
      }

      ind--;

      var tileinfo = {
        "tileset_name" : this.tileset_list[ind].name,
        "tileset_list_ind" : ind,
        "firstgid" : this.tileset_list[ind].firstgid
      };

      this.tile_info[dat] = tileinfo;

    }

  }

  console.log(this.tile_info);
  console.log("ok");

  console.log(this.layer_name_index_lookup);

}

homeLevel.prototype.bbox = function(r,c) {
  for (var ii=0; ii<this.tilemap.layers.length; ii++) {
    var key = Math.floor(r) +":" + Math.floor(c);
    if (this.layer_lookup[ii][key]) { console.log("bang!", ii, r, c, key); }
  }
}


homeLevel.prototype.update = function() {
  if (!this.ready) { return; }
  if (!this.init_flag) {
    this.init();
  }

  //console.log(">>>");
}

homeLevel.prototype.keyDown = function(code) {
  //console.log(">> homeLevel keyDown", code);

  // 'i' - up
  //
  //if (code == 73) { this.y -= 100; }
 
  // 'j' - left
  //
  //else if (code == 74) { this.x -= 100; }

  // 'k' - down
  //
  //else if (code == 75) { this.y += 100; }

  // 'l' - right
  //
  //else if (code == 76) { this.x += 100; }
}

homeLevel.prototype.event = function(event_type, data) {
  if (!this.ready) { return; }

  if (event_type == "redraw") {
    return;
  }

  if (event_type == "input") {
  }

}

homeLevel.prototype.draw_layer_bottom = function(display_name, cmp_x, cmp_y) {
  if (!this.ready) { return; }

  if (!(display_name in this.layer_name_index_lookup)) { return; }

  var layer_idx = this.layer_name_index_lookup[display_name];
  var layer = this.tilemap.layers[layer_idx];

  var w = layer.width;
  var h = layer.height;

  var count = 0;
  for (var jj=0; jj<layer.data.length; jj++) {
    var r = Math.floor(jj / w);
    var c = Math.floor(jj % h);

    if (layer.data[jj] == 0) { continue; }
    count++;

    var x = this.x + c*this.world_h;
    var y = this.y + r*this.world_w;

    if (y>=cmp_y) { continue; }

    var imx = 0;
    var imy = 0;

    var tile_info = this.tile_info[layer.data[jj]];

    var dat = layer.data[jj]-tile_info.firstgid;
    var tilewidth = 16;

    var tilemap_h = 192;
    var tilemap_w = 192;

    imx = Math.floor((dat*16) % tilemap_w);
    imy = Math.floor((dat*16) / tilemap_w)*tilewidth;

    var ww = Math.floor(this.world_w);
    var hh = Math.floor(this.world_h);

    // wow, firefox is so fucked:
    // http://stackoverflow.com/questions/17725840/canvas-drawimage-visible-edges-of-tiles-in-firefox-opera-ie-not-chrome
    //
    //g_imgcache.draw_s(this.tilemap_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h);
    g_imgcache.draw_s(tile_info.tileset_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h);

    //DEBUG
    if (this.debug) {
      var tbbox = [[x,y],[x+this.world_w,y+this.world_h]];
      var x0 = tbbox[0][0];
      var y0 = tbbox[0][1];
      var x1 = tbbox[1][0];
      var y1 = tbbox[1][1];
      g_painter.drawRectangle(x0,y0, x1-x0, y1-y0, 2, "rgba(255,0,0,0.6)");
    }

  }

}

homeLevel.prototype.draw_layer_top = function(display_name, cmp_x, cmp_y) {
  if (!this.ready) { return; }

  if (!(display_name in this.layer_name_index_lookup)) { return; }

  var layer_idx = this.layer_name_index_lookup[display_name];
  var layer = this.tilemap.layers[layer_idx];

  var w = layer.width;
  var h = layer.height;

  var count = 0;
  for (var jj=0; jj<layer.data.length; jj++) {
    var r = Math.floor(jj / w);
    var c = Math.floor(jj % h);

    if (layer.data[jj] == 0) { continue; }
    count++;

    var x = this.x + c*this.world_h;
    var y = this.y + r*this.world_w;

    if (y<cmp_y) { continue; }

    var imx = 0;
    var imy = 0;

    var tile_info = this.tile_info[layer.data[jj]];

    var dat = layer.data[jj]-tile_info.firstgid;
    var tilewidth = 16;

    var tilemap_h = 192;
    var tilemap_w = 192;

    imx = Math.floor((dat*16) % tilemap_w);
    imy = Math.floor((dat*16) / tilemap_w)*tilewidth;

    var ww = Math.floor(this.world_w);
    var hh = Math.floor(this.world_h);

    // wow, firefox is so fucked:
    // http://stackoverflow.com/questions/17725840/canvas-drawimage-visible-edges-of-tiles-in-firefox-opera-ie-not-chrome
    //
    //g_imgcache.draw_s(this.tilemap_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h);
    g_imgcache.draw_s(tile_info.tileset_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h);

    //DEBUG
    if (this.debug) {
      var tbbox = [[x,y],[x+this.world_w,y+this.world_h]];
      var x0 = tbbox[0][0];
      var y0 = tbbox[0][1];
      var x1 = tbbox[1][0];
      var y1 = tbbox[1][1];
      g_painter.drawRectangle(x0,y0, x1-x0, y1-y0, 2, "rgba(255,0,0,0.6)");
    }

  }

}

homeLevel.prototype.draw_layer = function(display_name) {
  if (!this.ready) { return; }

  if (!(display_name in this.layer_name_index_lookup)) { return; }

  var layer_idx = this.layer_name_index_lookup[display_name];
  var layer = this.tilemap.layers[layer_idx];

  var w = layer.width;
  var h = layer.height;

  var count = 0;
  for (var jj=0; jj<layer.data.length; jj++) {
    var r = Math.floor(jj / w);
    var c = Math.floor(jj % h);

    if (layer.data[jj] == 0) { continue; }
    count++;

    var x = this.x + c*this.world_h;
    var y = this.y + r*this.world_w;

    var imx = 0;
    var imy = 0;

    var tile_info = this.tile_info[layer.data[jj]];

    var dat = layer.data[jj]-tile_info.firstgid;
    var tilewidth = 16;

    var tilemap_h = 192;
    var tilemap_w = 192;

    imx = Math.floor((dat*16) % tilemap_w);
    imy = Math.floor((dat*16) / tilemap_w)*tilewidth;

    var ww = Math.floor(this.world_w);
    var hh = Math.floor(this.world_h);

    // wow, firefox is so fucked:
    // http://stackoverflow.com/questions/17725840/canvas-drawimage-visible-edges-of-tiles-in-firefox-opera-ie-not-chrome
    //
    //g_imgcache.draw_s(this.tilemap_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h);
    g_imgcache.draw_s(tile_info.tileset_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h);

    //DEBUG
    if (this.debug) {
      var tbbox = [[x,y],[x+this.world_w,y+this.world_h]];
      var x0 = tbbox[0][0];
      var y0 = tbbox[0][1];
      var x1 = tbbox[1][0];
      var y1 = tbbox[1][1];
      g_painter.drawRectangle(x0,y0, x1-x0, y1-y0, 2, "rgba(255,0,0,0.6)");
    }

  }



}

homeLevel.prototype.draw = function(display_height, data) {
  if (!this.ready) { return; }

  for (var ii=0; ii<this.tilemap.layers.length; ii++) {
    if (this.tilemap.layers[ii].name == "collision") { continue; }
    if (!("data" in this.tilemap.layers[ii])) { continue; }

    if ((display_height==0) && (this.tilemap.layers[ii].name=="hover")) { continue; }
    if ((display_height==1) && (this.tilemap.layers[ii].name!="hover")) { continue; }

    var layer = this.tilemap.layers[ii];
    var w = layer.width;
    var h = layer.height;

    var first = true;
    var count = 0;

    for (var jj=0; jj<layer.data.length; jj++) {
      var r = Math.floor(jj / w);
      var c = Math.floor(jj % h);

      if (layer.data[jj] == 0) { continue; }
      count++;

      var x = this.x + c*this.world_h;
      var y = this.y + r*this.world_w;

      var imx = 0;
      var imy = 0;

      var dat = layer.data[jj]-1;
      var tilewidth = 16;

      var tilemap_h = 192;
      var tilemap_w = 192;

      imx = Math.floor((dat*16) % tilemap_w);
      imy = Math.floor((dat*16) / tilemap_w)*tilewidth;

      if (first) {
        first = false;
      }

      var ww = Math.floor(this.world_w);
      var hh = Math.floor(this.world_h);

      // wow, firefox is so fucked:
      // http://stackoverflow.com/questions/17725840/canvas-drawimage-visible-edges-of-tiles-in-firefox-opera-ie-not-chrome
      //
      g_imgcache.draw_s(this.tilemap_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h);

      //DEBUG
      if (this.debug) {
        var tbbox = [[x,y],[x+this.world_w,y+this.world_h]];
        var x0 = tbbox[0][0];
        var y0 = tbbox[0][1];
        var x1 = tbbox[1][0];
        var y1 = tbbox[1][1];
        g_painter.drawRectangle(x0,y0, x1-x0, y1-y0, 2, "rgba(255,0,0,0.6)");
      }

    }

  }

}


