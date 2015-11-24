function customWaterfallScene(x,y, init_info) {
  this.x = ((typeof x === "undefined")?0:x);
  this.y = ((typeof y === "undefined")?0:y);

  this.waterfall_height = 16*4;
  this.waterfall_width = 16*4;

  var h = this.waterfall_height;
  var wh = this.waterfall_height/2;
  var ww = this.waterfall_width/2;

  this.waterfall = new customWaterfall(this.x - ww, this.y - h);
  this.spray = new particleSpray(this.x, this.y);

  this.ttl = 1;

  this.state = "full-0";

  this.state_n = 0;

  this.state_delay = 0;
  this.state_delay_N = 20;


  return;

  //g_world.push(this.waterfall);


  init_info = ((typeof init_info ==="undefined")?{}:init_info);

  if ((!("sprite_x" in init_info)) || (!("sprite_y" in init_info))) {
    init_info.sprite_x = 0;
    init_info.sprite_y = 0;

    if (!("angle" in init_info)) {
      init_info.angle = 0;
    }
  }

  this.song_playing = false;
  this.song = null;
  if ("song" in init_info) { this.song = init_info.song; }

  this.sprite = [];

  this.callback_fire_count=0;
  this.callback_fire_once = true;
  this.callback = null;
  if ("callback" in init_info) {
    this.callback = init_info.callback;
  }

  this.name = init_info.name;
  this.sprite.push({"x":init_info.sprite_x, "y":init_info.sprite_y, "a":init_info.angle})
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
  this.start();

}

customWaterfallScene.prototype.add_item = function(info) {
  info = ((typeof info ==="undefined")?{}:info);

  if ((!("sprite_x" in init_info)) || (!("sprite_y" in init_info))) {
    init_info.sprite_x = 0;
    init_info.sprite_y = 0;

    if (!("angle" in init_info)) {
      init_info.angle = 0;
    }
  }

  this.sprite.push({"x":info.sprite_x, "y":info.sprite_y, "a":info.angle})
}



customWaterfallScene.prototype.init = function(x,y) {
  return;

  this.x = ((typeof x === "undefined") ? this.x : x);
  this.y = ((typeof y === "undefined") ? this.y : y);

  this.spray_N = 10;

  this.spray = [];
  for (var i=0; i<this.spray_N; i++) {
    var spray = {};
    this._random_spray(spray);
    this.spray.push(spray);
  }

  this.state_info = {
    "start" : {
      "delay":60*1,
      "delay_N":60*3,
      "next":"init"
    },
    "init" :{
      "delay":1,
      "next":"fade_in"
    },
    "fade_in" :{
      "delay":60*3,
      "delay_N":60*3,
      "next":"wait"
    },
    "wait" : {
      "delay":-1,
      "next":"fade_out"
    },
    "fade_out":{
      "delay":60*3,
      "delay_N":60*3,
      "next":"final"
    },
    "final":{
      "delay":0,
      "delay_N":1,
      "next":"final"
    }
  };

  this.state = "start";
  this.ttl = 1;
  this.update_bbox(this.bounding_box);
  this.update_bbox(this.item_bounding_box);

  this.item_alpha = 0.0;
}

customWaterfallScene.prototype.update_bbox = function(bbox,x,y) {
  bbox[0][0] = x;
  bbox[0][1] = y;

  bbox[1][0] = x + 16;
  bbox[1][1] = y + 16;
}


customWaterfallScene.prototype.update = function(world) {

  this.waterfall.update();
  this.spray.update();

  this.state_delay++;
  if (this.state_delay >= this.state_delay_N) {
    this.state_delay = 0;
    this.state_n = 1-this.state_n;

    this.state = "full-" + this.state_n;

    //console.log(">>>", this.state);
  }

  return;

  var n = this.spray.length;
  for (var i=0; i<n; i++) {
    if (this.spray[i].pause>0) {
      this.spray[i].pause--;
      continue;
    }
    this.spray[i].tick_delay++;
    if (this.spray[i].tick_delay < this.spray[i].tick_delay_N) {
      continue;
    }
    this.spray[i].tick_delay = 0;

    this.spray[i].delay++;
    if (this.spray[i].delay >= this.spray[i].delay_N) {
      this.spray[i].delay = 0;
      this.spray[i].angle = 0;

      this._random_spray(this.spray[i]);
    }

    var t = this.spray[i].delay / this.spray[i].delay_N;

    this.spray[i].alpha = 0.3*Math.sin(Math.PI * t);
    this.spray[i].angle = this.spray[i].max_angle*(t);


    this.spray[i].w = Math.floor((1-t)*this.spray[i].orig_w + t*this.spray[i].max_w);
    this.spray[i].h = Math.floor((1-t)*this.spray[i].orig_h + t*this.spray[i].max_h);
  }


  return;

  var state_info = this.state_info[this.state];

  if (state_info.delay>0) {
    state_info.delay--;
    if (state_info.delay==0) {
      if (this.state=="final") {
        this.ttl=0;
      } else {
        this.state = state_info.next;
      }
    }
  } else if (state_info.delay==0) {
    if (this.state == "fade_out") {
      this.state = "final";
    }
  }

  var state_info = this.state_info[this.state];
  if (this.state == "init") {
    this.halo = new particleRising(this.x, this.y);
    g_world.particle.push(this.halo);

    if (!this.appear_sound_playing) {
      g_sfx["item-appear"][0].play();
    }
    this.appear_sound_playing = true;
  }
  else if (this.state == "fade_in") {
    this.item_alpha = 1 - (state_info.delay / state_info.delay_N);
    this.item_visible = true;
  }
  else if (this.state == "fade_out") {
    this.item_alpha = (state_info.delay / state_info.delay_N);
  }
  else if (this.state == "final") {
    this.ttl=0;
  }
  else if (this.state == "wait") {
    this.item_alpha = 1;

    var player_bbox = world.player.playerBBox();
    if (box_box_intersect(this.item_bounding_box, player_bbox)) {

      if (!this.pickup_sound_playing) {
        g_sfx["powerup"][0].play();
      }
      this.pickup_sound_playing = true;

      if (this.song && !this.song_playing) {
        g_music[this.song].play();
        this.song_playing=true;
      }

      this.item_visible=false;

      if (this.callback != null) {
        if (this.callback_fire_once && (this.callback_fire_count==0))
        {
          this.callback();
          this.callback_fire_count=1;
        }
      }

      if (this.halo.ttl>this.halo.ttl_finish) {
        this.halo.finish();
      }

    }

    if (!this.item_visible && (this.halo.ttl<=0)) {
      this.state = "final";
      this.ttl=0;
    }

  }

  this.update_bbox(this.bounding_box, this.x, this.y);
  this.update_bbox(this.item_bounding_box, this.x, this.y);
}

customWaterfallScene.prototype.draw = function() {
  if (this.ttl<=0) { return; }

  var sprite_x = 0;
  var sprite_y = 6*16;
  var sprite_w = 6*16;
  var sprite_h = 2*16;

  var tx = this.x - this.waterfall_width/2 - 16*1;
  var ty = this.y - this.waterfall_height - 16*2;

  g_imgcache.draw_s("overworld_extra",
      sprite_x, sprite_y, sprite_w, sprite_h,
      tx, ty, sprite_w, sprite_h, 0, 1.0);

  sprite_x = 6*16;

  if (this.state == "full-0") {
    sprite_y = 8*16;
  } else if (this.state == "full-1") {
    sprite_y = 10*16;
  } else if (this.state == "half-0") {
    sprite_y = 4*16;
  } else if (this.state == "half-1") {
    sprite_y = 6*16;
  }


  g_imgcache.draw_s("overworld_extra",
      sprite_x, sprite_y, sprite_w, sprite_h,
      tx, ty, sprite_w, sprite_h, 0, 1.0);

  this.waterfall.draw();
  this.spray.draw();

  return;


  var n = this.spray.length;
  for (var i=0; i<n; i++) {

    var ang = this.spray[i].angle;
    if (this.spray[i].dir<0) { ang = Math.PI - ang; }

    var x = this.spray[i].x + this.spray[i].r * Math.cos(ang);
    var y = this.spray[i].y - this.spray[i].r * Math.sin(ang);
    x = Math.floor(x);
    y = Math.floor(y);

    var w = Math.floor(this.spray[i].w);
    var h = Math.floor(this.spray[i].h);

    var a = this.spray[i].alpha;
    //g_painter.drawPoint(x,y, "rgba(255,255,255," + a + ")", this.spray[i].s);

    var h2 = Math.floor(h/2);
    var w2 = Math.floor(w/2);
    g_painter.drawRectangle(x-w2,y-h2, w,h, 0, "rgba(255,255,255,0)", true, "rgba(255,255,255," + a + ")");



  }


  return; 

  var imgx = 16*this.keyFrame;
  var imgy = this.frameRow*32;


  if (this.item_visible) {
    for (var i=0; i<this.sprite.length; i++) {
      g_imgcache.draw_s("item", this.sprite[i].x, this.sprite[i].y, 16, 16, this.x, this.y, 16, 16, this.sprite[i].a, this.item_alpha);
    }
  }

}
