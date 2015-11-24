function customWaterfall(x,y, init_info) {
  this.x = ((typeof x === "undefined")?0:x);
  this.y = ((typeof y === "undefined")?0:y);
  this.ttl = 1;

  this.alpha = 1.0;

  init_info = ((typeof init_info ==="undefined")?{}:init_info);
  if (!("name" in init_info)) {
    init_info.name = "overworld_extra";
  }

  this.song_playing = false;
  this.song = null;
  if ("song" in init_info) { this.song = init_info.song; }

  this.callback_fire_count=0;
  this.callback_fire_once = true;
  this.callback = null;
  if ("callback" in init_info) {
    this.callback = init_info.callback;
  }

  this.name = init_info.name;
  this.debug = true;

  this.world_w = g_GRIDSIZE;
  this.world_h = g_GRIDSIZE*2;

  this.item_bounding_box = [[this.x, this.y],[this.x+16,this.y+16]];
  this.bounding_box = [[this.x, this.y],[this.x+16,this.y+16]];

  this.spray = [];
  this.spray_N = 10;

  this.init(x,y);

  this.item_visible = false;
  this.appear_sound_playing = false;
  this.pickup_sound_playing = false;

  this.halo = null;

  this.waterfall_height = 4;
  this.waterfall_width = 4;

  this.waterfall = [];
  var H = this.waterfall_height;
  var W = this.waterfall_width;
  for (var i=0; i<H; i++) {
    for (var j=0; j<W; j++) {
      var fr = 3;
      var state = "middle-0";
      if (j==0) { fr=0; state = "left"; }
      else if (j==(W-1)) { fr=1; state="right"; }

      //var wf = {"x": this.x + 16*j, "y": this.y + i*16, "fc":0, "fC":4, "fr":fr, "fR":4, "delay":0, "delay_N":11 };
      var wf = {
        "x": this.x + 16*j, "y": this.y + i*16,
        "fc":8, "fC":4,
        "fr":fr, "fR":4,
        "delay":0, "delay_N":11,
        "col_offset":8,
        "state" : state
      };
      this.waterfall.push(wf);
    }
  }

}

customWaterfall.prototype.init = function(x,y) {
  this.x = ((typeof x === "undefined") ? this.x : x);
  this.y = ((typeof y === "undefined") ? this.y : y);
}

customWaterfall.prototype.update_bbox = function(bbox,x,y) {
  bbox[0][0] = x;
  bbox[0][1] = y;

  bbox[1][0] = x + 16;
  bbox[1][1] = y + 16;
}


customWaterfall.prototype.update = function(world) {

  for (var i=0; i<this.waterfall_height; i++) {
    for (var j=0; j<this.waterfall_width; j++) {
      var ind = i*this.waterfall_width + j;

      this.waterfall[ind].delay++;
      if (this.waterfall[ind].delay >= this.waterfall[ind].delay_N) {
        this.waterfall[ind].delay=0;

        var cur_state = this.waterfall[ind].state;

        var fc = this.waterfall[ind].fc;

        if (((fc+1)%this.waterfall[ind].fC)==0) {

          if ((cur_state == "left") || (cur_state == "right")) {
          } else {
            var r = Math.random();

            var new_state_n = 0;
            if (r<0.03) {
              new_state_n = 1;
            } else if (r<0.06) {
              new_state_n = 2;
            }

            this.waterfall[ind].state = "middle-" + new_state_n;
          }
        }

        if (this.waterfall[ind].state == "middle-0") {
          this.waterfall[ind].fr = 0;
          this.waterfall[ind].fc = 7;
        } else if (this.waterfall[ind].state == "middle-1") {
          this.waterfall[ind].fr = 2;
          this.waterfall[ind].fc = (fc+1)%this.waterfall[ind].fC + 8;
        } else if (this.waterfall[ind].state == "middle-2") {
          this.waterfall[ind].fr = 3;
          this.waterfall[ind].fc = (fc+1)%this.waterfall[ind].fC + 8;
        } else if (this.waterfall[ind].state == "left") {
          this.waterfall[ind].fr = 0;
          this.waterfall[ind].fc = (fc+1)%this.waterfall[ind].fC + 8;
        } else if (this.waterfall[ind].state == "right") {
          this.waterfall[ind].fr = 1;
          this.waterfall[ind].fc = (fc+1)%this.waterfall[ind].fC + 8;
        }

        //console.log(this.waterfall[ind].state);

      }
    }
  }

}

customWaterfall.prototype.draw = function() {
  if (this.ttl<=0) { return; }

  for (var i=0; i<this.waterfall_height; i++) {
    for (var j=0; j<this.waterfall_width; j++) {
      var ind = i*this.waterfall_width + j;
      var wf = this.waterfall[ind];

      var imgx = 16*wf.fc;
      var imgy = 16*wf.fr;

      g_imgcache.draw_s(this.name, imgx, imgy, 16, 16, wf.x, wf.y, 16, 16, 0, this.alpha);
    }
  }

}
