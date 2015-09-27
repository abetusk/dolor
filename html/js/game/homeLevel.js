


function homeLevel() {
  this.tilemap = {};
  this.ready = false;
  this.init_flag = false;

  //this.tilemap_name = "homeLevel";
  this.tilemap_name = "forrest";

  //this.world_w = 64;
  //this.world_h = 64;

  //this.world_w = 32;
  //this.world_h = 32;

  this.world_w = g_GRIDSIZE;
  this.world_h = g_GRIDSIZE;

  //this.x = -1000;
  //this.y = -1000;

  //this.x = -100;
  //this.y = -100;

  this.x = -6*32;
  this.y = -6*32;

  this.debug=false;
}


homeLevel.prototype.init = function() {
  this.init_flag=true;

  this.layer_lookup = {};
  for (var ii=0; ii<this.tilemap.layers.length; ii++) {

    var layer = this.tilemap.layers[ii];
    var w = layer.width;
    var h = layer.height;

    this.layer_lookup[ii] = {};
    if ("data" in layer) {
      for (var jj=0; jj<layer.data.length; jj++) {
        var r = Math.floor(jj / w);
        var c = Math.floor(jj % h);
        //if (layer.data[jj] <= layer.opacity) { continue; }
        if (layer.data[jj] == 0) { continue; }
        this.layer_lookup[ii][Math.floor(r) + ":" + Math.floor(c)] = layer.data[jj];
      }
    }

  }

  console.log("ok");

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

var g_wtf = {};

homeLevel.prototype.draw = function(display_height) {
  if (!this.ready) { return; }

  //if (display_height!=0) { return; }
  //if (display_height==0) { return; }

  //var w = this.tilemap.width;
  //var h = this.tilemap.height;
  for (var ii=0; ii<this.tilemap.layers.length; ii++) {
    if (this.tilemap.layers[ii].name == "collision") { continue; }
    if (!("data" in this.tilemap.layers[ii])) { continue; }

    if ((display_height==0) && (this.tilemap.layers[ii].name=="hover")) { continue; }
    if ((display_height==1) && (this.tilemap.layers[ii].name!="hover")) { continue; }

    //console.log("???", display_height, this.tilemap.layers[ii].name);

    var layer = this.tilemap.layers[ii];
    var w = layer.width;
    var h = layer.height;

    var first = true;
    var count = 0;

    for (var jj=0; jj<layer.data.length; jj++) {
      var r = Math.floor(jj / w);
      var c = Math.floor(jj % h);

      if (layer.data[jj] == 0) { continue; }
      //if (layer.data[jj] <= layer.opacity) { continue; }
      count++;

      //var x = this.x + r*this.world_w;
      //var y = this.y + c*this.world_h;

      var x = this.x + c*this.world_h;
      var y = this.y + r*this.world_w;

      var imx = 0;
      var imy = 0;

      //var dat = layer.data[jj]-10;
      var dat = layer.data[jj]-1;
      var tilewidth = 16;

      //imx = Math.floor(dat*16 / 384)*tilewidth;
      //imy = Math.floor(dat*16 % 384)*tilewidth;

      g_wtf[dat] = true;
      //dat = 101;


      //var tilemap_h = 208;
      //var tilemap_w = 304;

      var tilemap_h = 192;
      var tilemap_w = 192;

      imx = Math.floor((dat*16) % tilemap_w);
      imy = Math.floor((dat*16) / tilemap_w)*tilewidth;

      if (first) {
        //console.log(layer.data[jj]);
        //tm_r = Math.floor(layer.data[jj] / this.tilemap.tilewidth);
        //tm_c = Math.floor(layer.data[jj] % this.tilemap.tilewidth);

        first = false;
      }

      var ww = Math.floor(this.world_w);
      var hh = Math.floor(this.world_h);

      // wow, firefox is so fucked:
      // http://stackoverflow.com/questions/17725840/canvas-drawimage-visible-edges-of-tiles-in-firefox-opera-ie-not-chrome
      //
      g_imgcache.draw_s(this.tilemap_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h);
      //g_imgcache.draw_s(this.tilemap_name, imx, imy, 15, 15, x, y, 15, 15);

      //g_imgcache.draw_s(this.tilemap_name, Math.floor(imx)+0.1, Math.floor(imy)+0.1, 15.5, 15.5, Math.floor(x), Math.floor(y), ww,hh);

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


