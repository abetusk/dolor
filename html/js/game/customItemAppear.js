function customItemAppear(x,y, init_info) {
  this.x = ((typeof x === "undefined")?0:x);
  this.y = ((typeof y === "undefined")?0:y);

  this.sprite_lookup = {
    "wand": {"r":1*16, "c":0*16, "a":-Math.PI/2},
    "shield": {"r":4*16, "c":3*16, "a":0},
    "bomb": {"r":1*16, "c":5*16, "a":0},
    "bow": {"r":0*16, "c":5*16, "a":0},
    "arrow": {"r":3*16, "c":5*16, "a":0}
  };


  var default_init = {
    "name": "wand",
    "sprite_x" : 0,
    "sprite_y" : 16,
    "angle" : -Math.PI/2
  };

  init_info = ((typeof init_info ==="undefined")?default_init:init_info);

  if ((!("sprite_x" in init_info)) || (!("sprite_y" in init_info))) {
    init_info.sprite_x = 0;
    init_info.sprite_y = 0;
    init_info.angle = 0;

    if (init_info.name in this.sprite_lookup) {
      init_info.sprite_x = this.sprite_lookup[init_info.name].c;
      init_info.sprite_y = this.sprite_lookup[init_info.name].r;
      init_info.angle = this.sprite_lookup[init_info.name].a;
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

  this.init(x,y);

  this.item_visible = false;
  this.appear_sound_playing = false;
  this.pickup_sound_playing = false;

  this.halo = null;
  this.start();
}

customItemAppear.prototype.add_item = function(info) {
  info = ((typeof info ==="undefined")?default_init:info);

  if ((!("sprite_x" in info)) || (!("sprite_y" in info))) {
    info.sprite_x = 0;
    info.sprite_y = 0;
    info.angle = 0;

    if (info.name in this.sprite_lookup) {
      info.sprite_x = this.sprite_lookup[info.name].c;
      info.sprite_y = this.sprite_lookup[info.name].r;
      info.angle = this.sprite_lookup[info.name].a;
    }

  }

  this.sprite.push({"x":info.sprite_x, "y":info.sprite_y, "a":info.angle})
}

customItemAppear.prototype.start = function() {
  this.state = "start";
}

customItemAppear.prototype.init = function(x,y) {
  this.x = ((typeof x === "undefined") ? this.x : x);
  this.y = ((typeof y === "undefined") ? this.y : y);

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

customItemAppear.prototype.update_bbox = function(bbox,x,y) {
  bbox[0][0] = x;
  bbox[0][1] = y;

  bbox[1][0] = x + 16;
  bbox[1][1] = y + 16;
}


customItemAppear.prototype.update = function(world) {

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

customItemAppear.prototype.draw = function() {
  if (this.ttl<=0) { return; }

  var imgx = 16*this.keyFrame;
  var imgy = this.frameRow*32;


  if (this.item_visible) {
    for (var i=0; i<this.sprite.length; i++) {
      g_imgcache.draw_s("item", this.sprite[i].x, this.sprite[i].y, 16, 16, this.x, this.y, 16, 16, this.sprite[i].a, this.item_alpha);
    }
  }

}
