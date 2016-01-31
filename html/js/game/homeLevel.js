


function homeLevel(x,y) {
  x = ((typeof x === "undefined") ? 0 : x);
  y = ((typeof y === "undefined") ? 0 : y);

  this.tilemap = {};
  this.ready = false;
  this.init_flag = false;

  this.name = "overworld";

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

  this.max_w = 0;
  this.max_h = 0;
  this.bounding_box = [[0,0],[0,0]];

  this.portal = {};
  this.bush_lookup = {};

  this.bush_wind_delay = 0;
  this.bush_wind_delay_N = 60*60*1;
  this.bush_wind_sweeping = false;
  this.bush_wind_sweep_x = 0;

  this.bush_wind_sweep_delay = 0;
  this.bush_wind_sweep_delay_N = 3;

  this.bush_wind_loop = 5;

  this.wind = [];

  for (var i=0; i<100; i++) {
    this.wind.push({"x":0, "y":0, "delay":0, "delayN":[5,5,5,5,5,5], "keyFrame":0, "active":false})
  }

  this.wind_sfx = false;


  this.firefly = [];
  this.firefly_max = 10;
  this.firefly_flag = true;

  this.wave_flag = true;
  this.wave_info = {
    "max_y" : 4,
    "cycle_delay":300,
  };
  this.wave_tile = {};


  this.canvas = null;
  this.ctx = null;

}


homeLevel.prototype.init_wave = function() {
  var water_tilename = {
    "75":true,
    "87":true,
    "99":true,
    "111":true,
    "123":true
    /*
    "32":true,
    "33":true,
    "34":true,
    "44":true,
    "45":true
    */
  };


  var ind = this.layer_name_index_lookup["bottom"];
  var layer = this.tilemap.layers[ind];

  var w = layer.width;
  var h = layer.height;

  var T = this.wave_info.cycle_delay;

  for (var jj in layer.data) {
    var dat = layer.data[jj];
    if (dat==0) { continue; }

    if (dat in this.tile_info) {
      if (layer.name == "bottom") {
        var r = Math.floor(jj / w);
        var c = Math.floor(jj % w);

        var tileid = dat - this.tile_info[dat].firstgid;

        if (tileid in water_tilename) {
          var wave_info = { "dx":0, "dy":0, "t": (r*17 + Math.floor(Math.random()*10))%T };
          this.wave_tile[jj] = wave_info;
        }
      }
    }

  }

}

homeLevel.prototype.init_firefly = function() {
  var N = this.firefly_max;

  var dsx = 512;
  var dsy = 256;
  this.firefly = [];
  for (var i=0; i<N; i++) {
    this.firefly[i] = new particleFirefly(0,0);
    this.firefly[i].ttl = 0;
  }

}


homeLevel.prototype.init = function() {
  this.init_flag=true;

  this.canvas = document.createElement("canvas");
  this.canvas.width = g_painter.width;
  this.canvas.height = g_painter.height;
  this.ctx = this.canvas.getContext("2d");


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

  this.max_w = 0;
  this.max_h = 0;

  var bd = 7;

  this.layer_name_index_lookup = {};
  this.layer_lookup = {};
  for (var ii=0; ii<this.tilemap.layers.length; ii++) {

    var layer = this.tilemap.layers[ii];
    var w = layer.width;
    var h = layer.height;

    if (this.max_w < w) { this.max_w = w; }
    if (this.max_h < h) { this.max_h = h; }

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

      if (dat in this.tile_info) {
        if (layer.name == "bottom") {
          var tileid = dat - this.tile_info[dat].firstgid;
          if (tileid == 0) {
            var bush_info = {"idle":true, "t":"b", "keyFrame":0, "delay":0, "loop":this.bush_wind_loop, "loopStart": 1, "delayN":[45,bd,bd,bd,bd,bd]};
            this.bush_lookup[jj] = bush_info;
          } else if ((tileid==1)||(tileid==2)||(tileid==13)||(tileid==14)) {
            var offset = tileid-1;
            if (offset>2) { offset = tileid - 13 + 6; }
            var tree_info = {"idle":true,
                             "t":"t",
                             "keyFrame":0,
                             "keyFrameOffset":offset,
                             "delay":0,
                             "loop":this.bush_wind_loop,
                             "loopStart":1,
                             "delayN":[bd,bd,bd,bd,bd,bd,bd,bd,bd]};
            this.bush_lookup[jj] = tree_info;
          }
        }
        continue;
      }

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

      if (layer.name == "bottom") {
        var tileid = dat - tileinfo.firstgid;
        if (tileid == 0) {
          var bush_info = {"idle":true, "t":"b", "keyFrame":0, "delay":0, "loop": this.bush_wind_loop, "loopStart": 1, "delayN":[45,bd,bd,bd,bd,bd]};
          this.bush_lookup[jj] = bush_info;
        } else if ((tileid==1)||(tileid==2)||(tileid==13)||(tileid==14)) {
          var offset = tileid-1;
          if (offset>2) { offset = tileid - 13 + 6; }
          var tree_info = {"idle":true,
                           "t":"t",
                           "keyFrame":0,
                           "keyFrameOffset":offset,
                           "delay":0,
                           "loop":this.bush_wind_loop,
                           "loopStart":1,
                           "delayN":[bd,bd,bd,bd,bd,bd,bd,bd,bd]};
          this.bush_lookup[jj] = tree_info;
        }
      }

      if (layer.name == "meta") {
        var r = Math.floor(jj / w);
        var c = Math.floor(jj % w);

        var eff_val = dat - this.tileset_list[ind].firstgid;

        if (eff_val == 40) {
          this.portal[0] = { "portal":0, "level":"dungeon_jade", "x":16*c, "y":16*r };
        } else if (eff_val == 44) {
          this.portal[1] = { "portal":1, "level":"dungeon_bone", "x":16*c, "y":16*r };
        } else if (eff_val == 48) {
          this.portal[2] = { "portal":2, "level":"dungeon_aqua", "x":16*c + 8 , "y":16*r + 8 };
        } else if (eff_val == 52) {
          this.portal[3] = { "portal":3, "level":"dungeon_blood", "x":16*c+8, "y":16*r+8 };
        } else if (eff_val == 56) {
          this.portal[4] = { "portal":4, "level":"level_library", "x":16*c+8, "y":16*r+8 };
        }

        else if (eff_val == 32) {
          this.portal[7] = { "portal":7, "level":"dungeon_alpha", "x":16*c, "y":16*r };
        } else if (eff_val == 33) {
          this.portal[8] = { "portal":8, "level":"dungeon_beta", "x":16*c, "y":16*r };
        } else if (eff_val == 36) {
          this.portal[9] = { "portal":9, "level":"dungeon_gamma", "x":16*c, "y":16*r };
        } else if (eff_val == 37) {
          this.portal[10] = { "portal":10, "level":"dungeon_delta", "x":16*c, "y":16*r };
        }

      }

    }

  }

  this.init_firefly();
  this.init_wave();

  this.updateBoundingBox();
}

homeLevel.prototype.cleanup= function() {
}

homeLevel.prototype.meta_map = function(ele_to_map, func_to_call) {

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

homeLevel.prototype.bbox = function(r,c) {
  for (var ii=0; ii<this.tilemap.layers.length; ii++) {
    var key = Math.floor(r) +":" + Math.floor(c);
    if (this.layer_lookup[ii][key]) { console.log("bang!", ii, r, c, key); }
  }
}

homeLevel.prototype.updateBoundingBox = function() {
  this.bounding_box[0][0] = this.x;
  this.bounding_box[0][1] = this.y;

  this.bounding_box[1][0] = this.x + this.max_w*16;
  this.bounding_box[1][1] = this.x + this.max_h*16;
}

homeLevel.prototype.update_wave = function() {
  var wave = this.wave_tile;

  var N = this.wave_info.cycle_delay+1;
  var Y = this.wave_info.max_y;

  for (var ind in wave) {
    wave[ind].t = (wave[ind].t+1)%this.wave_info.cycle_delay;
    wave[ind].dy = Math.floor(Y*Math.sin(2*Math.PI*wave[ind].t/N));
  }
}

homeLevel.prototype.update_firefly = function() {
  var N = this.firefly.length;
  var dsx = 512;
  var dsy = 256;
  for (var i=0; i<N; i++) {
    this.firefly[i].update();

    if (this.firefly[i].ttl<=0) {
      var dx = Math.floor(Math.random()*dsx) - (dsx/2);
      var dy = Math.floor(Math.random()*dsy) - (dsy/2);
      this.firefly[i].reset(g_player.x + dx, g_player.y + dy);
    }
  }
}


homeLevel.prototype.update = function() {
  if (!this.ready) { return; }
  if (!this.init_flag) { this.init(); }

  this.updateBoundingBox();

  if (this.firefly_flag) {
    this.update_firefly()
  }

  if (this.wave_flag) {
    this.update_wave();
  }

  if (this.bush_wind_delay >= this.bush_wind_delay_N) {
    this.bush_wind_delay = Math.floor(Math.random()*this.bush_wind_delay_N/2);
    this.bush_wind_sweeping = true;
    this.bush_wind_sweep_x = this.max_w;

  }


  if (this.bush_wind_sweeping) {
    var z = ((this.max_w==0) ? 1 : this.max_w);

    for (var ind in this.bush_lookup) {
      if ((ind % z)==this.bush_wind_sweep_x) {
        if (this.bush_lookup[ind].idle) {

          if (this.bush_lookup[ind].t == "b") {
            this.bush_lookup[ind].idle = false;
            this.bush_lookup[ind].delay = Math.floor(Math.random()*30);
            this.bush_lookup[ind].keyFrame = 0;
            this.bush_lookup[ind].loop = this.bush_wind_loop;
          } else if (this.bush_lookup[ind].t=="t") {

            var ofs = this.bush_lookup[ind].keyFrameOffset;

            if ((ofs == 1) || (ofs == 7)) { continue; }

            var indpp = parseInt(ind)+1;

            this.bush_lookup[ind].idle = false;
            this.bush_lookup[ind].delay = 0;
            this.bush_lookup[ind].keyFrame = 0;
            this.bush_lookup[ind].loop = this.bush_wind_loop;

            if (indpp in this.bush_lookup) {
              this.bush_lookup[indpp].idle = false;
              this.bush_lookup[indpp].delay = 0;
              this.bush_lookup[indpp].keyFrame = 0;
              this.bush_lookup[indpp].loop = this.bush_wind_loop;
            } else {
              console.log(">>> indpp", indpp, "not in bush_lookup (but", ind, "is)")
            }

          }

        }
      } else if (this.bush_lookup[ind].idle) {

        if (this.bush_lookup[ind].t == "b") {
          if ( (Math.abs( (ind%z) - this.bush_wind_sweep_x ) < 3) && (Math.random()< 0.25) ) {
            this.bush_lookup[ind].idle = false;
            this.bush_lookup[ind].delay = Math.floor(Math.random()*30);
            this.bush_lookup[ind].keyFrame = 0;
            this.bush_lookup[ind].loop = this.bush_wind_loop;
          }
        }

      }

    }

    var wi_rx = 128;

    for (var i=0; i<10; i++) {
      if (Math.random() < 0.3) {
        for (var j=0; j<this.wind.length; j++) {
          if (!this.wind[j].active) {
            this.wind[j].active = true;
            this.wind[j].x = 16*this.bush_wind_sweep_x + Math.floor(Math.random()*wi_rx) - (wi_rx/2);
            this.wind[j].y = 16*Math.floor(Math.random()*this.max_h) + Math.floor(Math.random()*16);
            this.wind[j].keyFrame = 0;
            this.wind[j].delay = 0;
            break;
          }
        }
      }
    }

    if ( Math.abs(g_player.x - 16*this.bush_wind_sweep_x) < 128 ) {
      if (!this.wind_sfx) {
        this.wind_sfx = true;
        g_sfx["wind"][0].play();
      }
    }
  }

  this.bush_wind_sweep_delay++;
  if (this.bush_wind_sweep_delay >= this.bush_wind_sweep_delay_N) {
    this.bush_wind_sweep_delay=0;
    this.bush_wind_sweep_x--;
    if (this.bush_wind_sweep_x < 0) {
      this.bush_wind_sweeping=false;
      this.bush_wind_sweep_x = -1;
      this.wind_sfx = false;
    }
  }

  for (var ind in this.bush_lookup) {
    var b = this.bush_lookup[ind];
    if (!b.idle) {
      b.delay++;
      if (b.delay >= b.delayN[b.keyFrame]) {
        b.keyFrame++;
        b.delay = 0;
        if (b.keyFrame >= b.delayN.length) {
          b.keyFrame = b.loopStart;
          b.loop--;
          if (b.loop<=0) { b.idle = true; }
        }
      }
    }
  }

  for (var i=0; i<this.wind.length; i++) {
    if (this.wind[i].active) {
      this.wind[i].delay++;
      if (this.wind[i].delay >= this.wind[i].delayN[this.wind[i].keyFrame]) {
        this.wind[i].delay = 0;
        this.wind[i].keyFrame++;

        if (this.wind[i].keyFrame >= this.wind[i].delayN.length) {
          this.wind[i].active = false;
        }
      }
    }
  }

  this.bush_wind_delay++;
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

homeLevel.prototype.draw_layer_bottom = function(display_name, cmp_x, cmp_y, a) {
  a = ((typeof a === "undefined") ? 1.0 : a);
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
    g_imgcache.draw_s(tile_info.tileset_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h, 0, a);

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

homeLevel.prototype.draw_layer_top = function(display_name, cmp_x, cmp_y, a) {
  a = ((typeof a === "undefined") ? 1.0 : a);
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
    g_imgcache.draw_s(tile_info.tileset_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h, 0, a);

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


homeLevel.prototype.draw_layer_w = function(display_name, anchor_x, anchor_y, window_c, window_r, alpha) {
  alpha = ((typeof alpha === "undefined") ? 1.0 : alpha);
  if (!this.ready) { return; }

  if (!(display_name in this.layer_name_index_lookup)) { return; }

  var layer_idx = this.layer_name_index_lookup[display_name];
  var layer = this.tilemap.layers[layer_idx];

  var w = layer.width;
  var h = layer.height;

  var anchor_c = Math.floor((anchor_x - this.x)/16)
  var anchor_r = Math.floor((anchor_y - this.y)/16)

  var data_ind = 0;

  if ((display_name == "top") && (this.firefly_flag)) {
    this.draw_firefly();
  }

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

      var x = this.x + c*this.world_w;
      var y = this.y + r*this.world_h;

      var tile_info = this.tile_info[layer.data[data_ind]];

      var dat = layer.data[data_ind]-tile_info.firstgid;
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
      //g_imgcache.draw_s(tile_info.tileset_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h);

      if (data_ind in this.wave_tile) {
        var dy = this.wave_tile[data_ind].dy;
        var dy2 = Math.floor(dy/2);

        g_imgcache.draw_s(tile_info.tileset_name, imx, imy+dy, 16, 16, x, y, this.world_w, this.world_h, 0, alpha);
        //g_imgcache.cdraw_s(this.ctx, tile_info.tileset_name, imx, imy+dy, 16, 16, x, y, this.world_w, this.world_h, 0, alpha);

      } else if (data_ind in this.bush_lookup) {
        
        if (this.bush_lookup[data_ind].idle) {
          g_imgcache.draw_s(tile_info.tileset_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h, 0, alpha);
          //g_imgcache.cdraw_s(this.ctx, tile_info.tileset_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h, 0, alpha);
        } else {

          if (this.bush_lookup[data_ind].t=="b") {  // bush
            var ix = 16*this.bush_lookup[data_ind].keyFrame;
            var iy = 0;
            g_imgcache.draw_s("bush_anim", ix, iy, 16, 16, x, y, this.world_w, this.world_h, 0, alpha);
            //g_imgcache.cdraw_s(this.ctx, "bush_anim", ix, iy, 16, 16, x, y, this.world_w, this.world_h, 0, alpha);
          } else if (this.bush_lookup[data_ind].t=="t") {  //tree
            var ofs = this.bush_lookup[data_ind].keyFrameOffset;
            var idx=0, idy=0;
            if      (ofs==1) { idx=16; idy= 0; }
            else if (ofs==6) { idx= 0; idy=16; }
            else if (ofs==7) { idx=16; idy=16; }
            var ix = 32*(this.bush_lookup[data_ind].keyFrame%3) + idx;
            var iy = idy;
            g_imgcache.draw_s("tree_anim", ix, iy, 16, 16, x, y, this.world_w, this.world_h, 0, alpha);
            //g_imgcache.cdraw_s(this.ctx, "tree_anim", ix, iy, 16, 16, x, y, this.world_w, this.world_h, 0, alpha);
          }
        }

      } else {
        g_imgcache.draw_s(tile_info.tileset_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h, 0, alpha);
        //g_imgcache.cdraw_s(this.ctx, tile_info.tileset_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h, 0, alpha);
      }

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

  // TESTING
  for (var i=0; i<this.wind.length; i++) {
    if (!this.wind[i].active) { continue; }
    var ix = this.wind[i].keyFrame*16;
    var iy = 0;
    var ta = 0.6;
    g_imgcache.draw_s("wind", ix, iy, 16, 16, this.wind[i].x, this.wind[i].y, this.world_w, this.world_h, 0, ta);
  }


  /*
  g_painter.drawSubImage(this.canvas,
                         0, 0, this.canvas.width, this.canvas.height,
                         0, 0, this.canvas.width, this.canvas.height);
                         */

}

homeLevel.prototype.draw_layer = function(display_name, alpha) {
  alpha = ((typeof alpha === "undefined") ? 1.0 : alpha);
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
    //g_imgcache.draw_s(tile_info.tileset_name, imx, imy, 16, 16, x, y, this.world_w, this.world_h);
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

homeLevel.prototype.draw_firefly = function(display_height, data) {

  if (this.firefly_flag)  {
    for (var i=0; i<this.firefly.length; i++) {
      if (this.firefly[i].ttl>0) {
        this.firefly[i].draw();
      }
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
        g_painter.drawRectangle(x0,y0, x1-x0, y1-y0, 1, "rgba(255,0,0,0.6)");
      }

    }

  }

}


