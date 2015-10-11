function creatureNeko(name, gridsize, tilesize, nframe) {
  name = ((typeof name === "undefined") ? "cat" : name);
  gridsize = ((typeof gridsize === "undefined") ? g_GRIDSIZE : gridsize);
  tilesize = ((typeof tilesize === "undefined") ? g_GRIDSIZE : tilesize);
  nframe = ((typeof nframe === "undefined") ? 4 : nframe);

  this.x = 0;
  this.y = 0;

  this.name = name;

  this.world_w = gridsize;
  this.world_h = gridsize;

  this.crit_w = tilesize;
  this.crit_h = tilesize;

  this.keyFrame = 0;
  this.keyFrameN = ((typeof nframe === "undefined") ? 4 : nframe);

  //this.frameDelayN = [ 8, 8, 8, 8 ];
  this.frameDelayN = [];
  for (var i=0; i<this.keyFrameN; i++ ) {
    this.frameDelayN.push(8);
  }

  this.frameDelay = this.frameDelayN[0];

  this.frameRow = 0;
  this.frameRowN = 4;

  this.state = "idle";

  this.message_bubble = new messageBubble({
    x:this.x,
    y:this.y-16,
    easeIn: "fade",
    easeOut: "fade",
    origin: "lower_left",
    style: "center",
    //message:"It's dangereous and\nyou are alone"
    //message:"It's dangereous and\nyou are alone"
    message:"Happy birthday Heather!!!\n"
  });

}

creatureNeko.prototype.update = function(world_state) {

  this.frameDelay--;
  
  if (this.frameDelay==0) {
    this.keyFrame++;
    this.keyFrame = this.keyFrame % this.keyFrameN;
    this.frameDelay = this.frameDelayN[this.keyFrame];

    if (this.keyFrame==0) {

      if (this.state == "idle") {
        this.frameRow++;
        this.frameRow = this.frameRow % this.frameRowN;
      } else if (this.state=="speak") {

        if (Math.random()<0.9) {
          this.frameRow = 0;
        } else {
          this.frameRow = 1;
        }
      }
    }
  }

  if ("player" in world_state) {
    var player = world_state.player;

    if ( (Math.abs(player.x - this.x)<(2*16)) &&
         (Math.abs(player.y - this.y)<(2*16)) ) {

      if (this.state == "idle") {
        //this.message_bubble.x = this.x;
        //this.message_bubble.y = this.y;
        this.message_bubble.start({x:this.x, y:this.y});

        //var n = g_sfx["purr"].length;
        //n = Math.floor(Math.random()*n);
        //g_sfx["purr"][n].play();
      } else if (this.message_bubble) {
      }

      this.state = "speak";
      this.message = "hello, friend";
    } else {

      if (this.message_bubble.state != "hidden") {
        this.message_bubble.stop();
      }

      this.state = "idle";
    }
  }

  this.message_bubble.update();
}

creatureNeko.prototype.draw = function() {

  var imgx = this.crit_w*this.keyFrame;
  var imgy = this.crit_h*this.frameRow;

  g_imgcache.draw_s(this.name, imgx, imgy, this.crit_w, this.crit_h, this.x, this.y, this.world_w, this.world_h);

  //if (this.state == "speak") {
  if (this.message_bubble.state != "hidden") {
    if (this.message_bubble) {
      this.message_bubble.draw();
    }
  }
}
