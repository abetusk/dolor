function dungeonJade(x,y) {
  x = ((typeof x === "undefined") ? 0 : x);
  y = ((typeof y === "undefined") ? 0 : y);

  this.tilemap = {};
  this.ready = false;
  this.init_flag = false;

  this.tilemap_name = "dungeon";

  this.world_w = g_GRIDSIZE;
  this.world_h = g_GRIDSIZE;

  this.x = x;
  this.y = y;

  this.debug=false;

  this.name = "jade";

  this.tileid_lookup = {};
  this.tileset = {};
  this.tileset_list = [];

  this.layer_names = [
    "collision.top", "collision.bottom",
    "top",
    "height",
    "bottom" ];
  this.layer_lookup = {};

  this.tile_info = {};

  this.portal = {};
}

dungeonJade.prototype.init = function() {
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
        var c = Math.floor(jj % w);
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

      if (layer.name == "meta") {
        var r = Math.floor(jj / w);
        var c = Math.floor(jj % w);

        var eff_val = dat - this.tileset_list[ind].firstgid;

        if (eff_val == 40) {
          this.portal[0] = { "portal":0, "level":"overworld", "x":16*(c), "y":16*(r) };
        }
        if (eff_val == 41) {
          this.portal[0] = { "portal":0, "level":"overworld", "x":16*(c), "y":16*(r) };
        }
        else if (eff_val == 42) {
          this.portal[0] = { "portal":0, "level":"overworld", "x":16*(c), "y":16*(r) };
        }

        else if (eff_val == 43) {
          this.portal[0] = { "portal":0, "level":"overworld", "x":16*(c), "y":16*(r) };
        }

      }



    }

  }

}


dungeonJade.prototype.meta_map = function(ele_to_map, func_to_call) {

  if ("meta" in this.layer_name_index_lookup) {
    var meta_ind = this.layer_name_index_lookup["meta"];
    for (var pos_key in this.layer_lookup[meta_ind]) {
      var xy = pos_key.split(":");
      var x = parseInt(xy[1])*16 + this.x;
      var y = parseInt(xy[0])*16 + this.y;

      var dat = this.layer_lookup[meta_ind][pos_key];
      var ti = this.tile_info[dat];

      if ((dat-ti.firstgid) == ele_to_map) {
        func_to_call(dat-ti.firstgid, x, y);
      }

    }
  }


}

dungeonJade.prototype.bbox = function(r,c) {
  for (var ii=0; ii<this.tilemap.layers.length; ii++) {
    var key = Math.floor(r) +":" + Math.floor(c);
    if (this.layer_lookup[ii][key]) { console.log("bang!", ii, r, c, key); }
  }
}


dungeonJade.prototype.update = function() {
  if (!this.ready) { return; }
  if (!this.init_flag) { this.init(); }

  //console.log(">>>");
}

dungeonJade.prototype.keyDown = function(code) {
  //console.log(">> dungeonJade keyDown", code);

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

dungeonJade.prototype.event = function(event_type, data) {
  if (!this.ready) { return; }

  if (event_type == "redraw") {
    return;
  }

  if (event_type == "input") {
  }

}

dungeonJade.prototype.draw_layer_bottom = function(display_name, cmp_x, cmp_y) {
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

    var tilemap_h = this.tileset[tile_info.tileset_name].imageheight;
    var tilemap_w = this.tileset[tile_info.tileset_name].imagewidth;

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
      g_painter.drawRectangle(x0,y0, x1-x0, y1-y0, 1, "rgba(255,0,0,0.6)");
    }

  }

  //console.log(">>>", count);

}

dungeonJade.prototype.draw_layer_top = function(display_name, cmp_x, cmp_y) {
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

    var tilemap_h = this.tileset[tile_info.tileset_name].imageheight;
    var tilemap_w = this.tileset[tile_info.tileset_name].imagewidth;

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
      g_painter.drawRectangle(x0,y0, x1-x0, y1-y0, 1, "rgba(255,0,0,0.6)");
    }

  }

}

dungeonJade.prototype.draw_layer_w = function(display_name, anchor_x, anchor_y, window_r, window_c, alpha) {
  alpha = ((typeof alpha === "undefined") ? 1.0 : alpha);
  if (!this.ready) { return; }

  if (!(display_name in this.layer_name_index_lookup)) { return; }

  var layer_idx = this.layer_name_index_lookup[display_name];
  var layer = this.tilemap.layers[layer_idx];

  var w = layer.width;
  var h = layer.height;

  var anchor_c = Math.floor((anchor_x - this.x)/16)
  var anchor_r = Math.floor((anchor_y - this.y)/16)

  //var anchor_r = anchor_y;
  //var anchor_c = anchor_x;
  var data_ind = 0;

  var count=0;

  for (var r = (anchor_r-window_r); r<(anchor_r+window_r); r++) {
    if (r<0) { continue; }
    if (r>=w) { continue; }

    for (var c= (anchor_c-window_c); c<(anchor_c+window_c); c++) {
      if (c<0) { continue; }
      if (c>=h) { continue; }

      data_ind = (r*w) + c;

      if (data_ind < 0) { continue; }
      if (data_ind >= (w*h)) { continue; }
      if (layer.data[data_ind] == 0) { continue; }

      count++;

      var x = this.x + c*this.world_h;
      var y = this.y + r*this.world_w;

      var tile_info = this.tile_info[layer.data[data_ind]];

      var dat = layer.data[data_ind]-tile_info.firstgid;
      var tilewidth = 16;

      var tilemap_h = this.tileset[tile_info.tileset_name].imageheight;
      var tilemap_w = this.tileset[tile_info.tileset_name].imagewidth;

      imx = Math.floor((dat*16) % tilemap_w);
      imy = Math.floor((dat*16) / tilemap_w)*tilewidth;

      var ww = Math.floor(this.world_w);
      var hh = Math.floor(this.world_h);

      // wow, firefox is so fucked:
      // http://stackoverflow.com/questions/17725840/canvas-drawimage-visible-edges-of-tiles-in-firefox-opera-ie-not-chrome
      //
      //g_imgcache.draw_s(this.tilemap_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h);
      g_imgcache.draw_s(tile_info.tileset_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h, 0, alpha);

      //DEBUG
      if (this.debug) {
        var tbbox = [[x,y],[x+this.world_w,y+this.world_h]];
        var x0 = tbbox[0][0];
        var y0 = tbbox[0][1];
        var x1 = tbbox[1][0];
        var y1 = tbbox[1][1];
        g_painter.drawRectangle(x0,y0, x1-x0, y1-y0, 1, "rgba(255,0,0,0.6)");
      }

    }
  }

  //console.log(count);
}

dungeonJade.prototype.draw_layer = function(display_name) {
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

    var tilemap_h = this.tileset[tile_info.tileset_name].imageheight;
    var tilemap_w = this.tileset[tile_info.tileset_name].imagewidth;

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
      g_painter.drawRectangle(x0,y0, x1-x0, y1-y0, 1, "rgba(255,0,0,0.6)");
    }

  }

}

dungeonJade.prototype.draw = function(display_height, data) {
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

      var tilemap_h = this.tileset[tile_info.tileset_name].imageheight;
      var tilemap_w = this.tileset[tile_info.tileset_name].imagewidth;

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
        g_painter.drawRectangle(x0,y0, x1-x0, y1-y0, 1, "rgba(255,0,0,0.6)");
      }

    }

  }

}
