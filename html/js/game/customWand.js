function customWand(x,y, init_info) {
  this.x = ((typeof x === "undefined")?0:x);
  this.y = ((typeof y === "undefined")?0:y);

  this.name = "wand";
  this.debug = true;

  this.world_w = g_GRIDSIZE;
  this.world_h = g_GRIDSIZE*2;

  this.item_bounding_box = [[this.x, this.y],[this.x+16,this.y+16]];
  this.bounding_box = [[this.x, this.y],[this.x+16,this.y+16]];

  this.init(x,y);

  this.item_visible = false;
  this.appear_sound_playing = false;
  this.pickup_sound_playing = false;

  console.log(">>>> customWand");

  this.halo = null;

  this.start();
}

customWand.prototype.start = function() {
  this.state = "start";
}

customWand.prototype.init = function(x,y) {
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
    }
  };

  this.state = "start";
  this.ttl = 1;
  this.update_bbox(this.bounding_box);
  this.update_bbox(this.item_bounding_box);

  this.item_alpha = 0.0;
}

customWand.prototype.update_bbox = function(bbox,x,y) {
  bbox[0][0] = x;
  bbox[0][1] = y;

  bbox[1][0] = x + 16;
  bbox[1][1] = y + 16;
}


customWand.prototype.update = function(world) {

  var state_info = this.state_info[this.state];
  if (state_info.delay>0) {
    state_info.delay--;
    if (state_info.delay==0) {
      if (this.state=="final") {
        this.ttl=0;
      } else {
        this.state = state_info.next;

        console.log(">>>> customWand state:", this.state);
      }
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
  else if (this.state == "wait") {
    this.item_alpha = 1;

    var player_bbox = world.player.playerBBox();
    if (box_box_intersect(this.item_bounding_box, player_bbox)) {

      if (!this.pickup_sound_playing) {
        g_sfx["powerup"][0].play();
      }
      this.pickup_sound_playing = true;

      this.item_visible=false;
      world.player.item_wand = true;

      if (this.halo.ttl>this.halo.ttl_finish) {
        this.halo.finish();
      }
    }

  }

  this.update_bbox(this.bounding_box, this.x, this.y);
  this.update_bbox(this.item_bounding_box, this.x, this.y);
}

customWand.prototype.draw = function() {
  if (this.ttl<=0) { return; }

  var imgx = 16*this.keyFrame;
  var imgy = this.frameRow*32;


  if (this.item_visible) {
    g_imgcache.draw_s("item", 0, 16, 16, 16, this.x, this.y, 16, 16, -Math.PI/2.0, this.item_alpha);
  }

}
