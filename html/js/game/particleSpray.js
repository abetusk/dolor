function particleSpray(x,y, init_info) {
  this.x = ((typeof x === "undefined")?0:x);
  this.y = ((typeof y === "undefined")?0:y);

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

particleSpray.prototype.add_item = function(info) {
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

particleSpray.prototype.start = function() {
  this.state = "start";
}


particleSpray.prototype._random_spray_big = function(spray) {
  var tick_delay_N = 2;
  var delay_N = 100;
  var X = 16*4;
  var Y = 5;
  var R = 3;
  var S = 10;
  //var S = 20;

  var W = 50;
  var H = 1;

  var dx = Math.floor(Math.random()*X);
  var dy = Math.floor(Math.random()*Y);
  var a = Math.floor(Math.random()*delay_N);
  var r = Math.floor(Math.random()*R)+7;
  var s = Math.floor(Math.random()*S)+15;
  //var s = Math.floor(Math.random()*S)+3;
  var dir = ((Math.random()<0.5) ? -1 : 1);
  spray.x = this.x + dx - X/2;
  spray.y = this.y + dy - Y/2;
  spray.delay = 0;
  spray.delay_N = delay_N;
  spray.angle = 0;
  spray.max_angle = Math.PI;
  spray.max_alpha = 0.5;
  spray.alpha = 0;
  spray.dir = dir;
  spray.r = r;
  spray.s = s;
  spray.orig_w = s;
  spray.orig_h = s;
  spray.w = s;
  spray.h = s;
  spray.max_w = s + Math.floor(Math.random()*W);
  spray.max_h = s + Math.floor(Math.random()*H);

  spray.pause = Math.floor(Math.random()*delay_N*tick_delay_N);

  spray.tick_delay = 0;
  spray.tick_delay_N = tick_delay_N;
}


particleSpray.prototype._random_spray_small = function(spray) {
  var tick_delay_N = 1;
  var delay_N = 30;
  var X = 16*4;
  var Y = 15;
  var R = 20;
  var S = 3;

  var W = 1;
  var H = 1;

  var dx = Math.floor(Math.random()*X);
  var dy = Math.floor(Math.random()*Y);
  var a = Math.floor(Math.random()*delay_N);
  var r = Math.floor(Math.random()*R)+7;
  var s = Math.floor(Math.random()*S)+2;
  var dir = ((Math.random()<0.5) ? -1 : 1);
  spray.x = this.x + dx - X/2;
  spray.y = this.y + dy - Y/2;
  spray.delay = 0;
  spray.delay_N = delay_N;
  spray.angle = 0;
  spray.max_angle = Math.PI/2;
  spray.max_alpha = 0.5;
  spray.alpha = 0;
  spray.dir = dir;
  spray.r = r;
  spray.s = s;
  spray.orig_w = s;
  spray.orig_h = s;
  spray.w = s;
  spray.h = s;
  spray.max_w = s + Math.floor(Math.random()*W);
  spray.max_h = s + Math.floor(Math.random()*H);

  spray.pause = Math.floor(Math.random()*delay_N*tick_delay_N);

  spray.tick_delay = 0;
  spray.tick_delay_N = tick_delay_N;
}

particleSpray.prototype._random_spray = function(spray) {
  var p0 = 0.5;

  if (Math.random()<p0) {
    this._random_spray_small(spray);
  } else {
    this._random_spray_big(spray);
  }
}



particleSpray.prototype.init = function(x,y) {
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

particleSpray.prototype.update_bbox = function(bbox,x,y) {
  bbox[0][0] = x;
  bbox[0][1] = y;

  bbox[1][0] = x + 16;
  bbox[1][1] = y + 16;
}


particleSpray.prototype.update = function(world) {

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

    this.spray[i].alpha = this.spray[i].max_alpha*Math.sin(Math.PI * t);
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

particleSpray.prototype.draw = function() {
  if (this.ttl<=0) { return; }


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
