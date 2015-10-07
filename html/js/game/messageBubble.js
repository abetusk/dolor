function messageBubble(info) {

  this.x = 0;
  this.y = 0;

  this.info = {};
  this.default_info = {
    x:this.x,y:this.y,
    origin:"lower_left",
    style:"center",
    easeIn:"abrupt",
    easeOut:"abrupt",
    message:"hello, friend"
  };

  this.init();
  this.setup_info(info);
  //this.setup_info(this.default_info);

  /*
  var default_info = {
    x:0,y:0,
    origin:"lower_left",
    style:"center",
    easeIn:"abrupt",
    easeOut:"abrupt",
    message:"hello, friend"
  };

  info = ((typeof info === "undefined") ? default_info : info);

  this.info = {};
  this.info.x = ((typeof info.x === "undefined") ? default_info.x : info.x );
  this.info.y = ((typeof info.y === "undefined") ? default_info.y : info.y );
  this.info.origin = ((typeof info.origin === "undefined") ? default_info.origin : info.origin );
  this.info.style = ((typeof info.style === "undefined") ? default_info.style : info.style );
  this.info.easeIn = ((typeof info.easeIn === "undefined") ? default_info.easeIn : info.easeIn );
  this.info.easeOut = ((typeof info.easeOut === "undefined") ? default_info.easeOut : info.easeOut );
  this.info.message = ((typeof info.message === "undefined") ? default_info.message : info.message );

  this.type = "speak";
  this.bubble_type = "speech";
  this.message = info.message;
  */


  this.img_font = "font";
  this.img_speak = "bubble";

  this.x = this.info.x;
  this.y = this.info.y;

  this.dy=0;

  this.name = "font";

  this.font_w = 5;
  this.font_y = 7;

  this.speak_w = 8;
  this.speak_h = 8;

  this.keyFrame = 0;
  this.keyFrameN = ((typeof nframe === "undefined") ? 4 : nframe);

  this.delayN = 5;
  this.delay = this.delayN;

  this.state = "hidden";  // show, fadein, fadeout

  this.small_font =
  //a  b  c   d   e   f   g   h   i   j   k   l   m   n   o  p   q     r    s    t    u   v     w    x    y    z    endpoint
  [ 0, 7, 14, 21, 28, 36, 39, 46, 53, 55, 62, 67, 69, 76, 83, 90, 97,  104, 110, 118, 124, 131, 138, 145, 152, 160, 166 ];

  //this.small_font_y = 11;

  this.ttl = 1;

  this.font_y = 6;
  this.font_spacing = {
    " " : 144,
    "!" : 148,
    "?" : 152,
    "," : 156,
    "." : 160,
    "'" : 164
  };

  var a_p = "a".charCodeAt(0);
  var A_p = "A".charCodeAt(0);
  for (var i=0; i<26; i++) {
    var ch = String.fromCharCode(a_p+i);
    this.font_spacing[ch] = 4*i;

    ch = String.fromCharCode(A_p+i);
    this.font_spacing[ch] = 4*i;
  }

  this.fade_step = 0;
  this.fade_step_N = 5;

}


messageBubble.prototype.init = function() {
  for (var k in this.default_info) {
    this.info[k] = this.default_info[k];
  }

  this.x = this.info.x;
  this.y = this.info.y;

  this.type = "speak";
  this.bubble_type = "speech";
  this.message = this.info.message;
}

messageBubble.prototype.calc_helper = function() {
  var z = this.message_dim(this.message);

  //var helper = {};
  //helper["dy"] = z.height;

  this.dy = z.height;
}

messageBubble.prototype.setup_info = function(info) {

  info = ((typeof info === "undefined") ? this.info : info);
  this.info.x = ((typeof info.x === "undefined") ? this.info.x : info.x );
  this.info.y = ((typeof info.y === "undefined") ? this.info.y : info.y );
  this.info.origin = ((typeof info.origin === "undefined") ? this.info.origin : info.origin );
  this.info.style = ((typeof info.style === "undefined") ? this.info.style : info.style );
  this.info.easeIn = ((typeof info.easeIn === "undefined") ? this.info.easeIn : info.easeIn );
  this.info.easeOut = ((typeof info.easeOut === "undefined") ? this.info.easeOut : info.easeOut );
  this.info.message = ((typeof info.message === "undefined") ? this.info.message : info.message );

  console.log(">>>", this.info);

  this.x = this.info.x;
  this.y = this.info.y;

  this.type = "speak";
  this.bubble_type = "speech";
  this.message = this.info.message;

  this.calc_helper();
}



messageBubble.prototype.start = function(info) {
  this.setup_info(info);

  if (this.info.easeIn == "abrupt") {
    this.state = "show";
    this.fade_step = this.fade_step_N;
  } else if (this.info.easeIn == "fade") {
    this.state = "fadeIn";
    this.delay = this.delayN;
    this.fade_step = 1;
  }
}

messageBubble.prototype.stop = function(world_state) {
  if (this.info.easeOut == "abrupt") {
    this.state = "hidden";
    this.fade_step = 0;
  } else if (this.info.easeOut == "fade") {

    // If we're not alrady hidden and not already fading out
    //
    if ((this.state != "hidden") && (this.state != "fadeOut")) {
      this.state = "fadeOut";
      this.delay = this.delayN;
      //this.fade_step = this.fade_step_N-1;
    }
  }
}

messageBubble.prototype.update = function(world_state) {

  this.delay--;
  
  if (this.delay<=0) {
    this.delay = this.delayN;
    
    if (this.state == "fadeIn") {
      this.fade_step++;

      if (this.fade_step >= this.fade_step_N) {
        this.state = "show";
      }
    } else if (this.state == "fadeOut") {
      this.fade_step--;
      if (this.fade_step <= 0) {
        this.state = "hidden";
      }
    }
  }

}

messageBubble.prototype.message_dim = function(msg) {
  var disp_y = 6;
  var disp_x = 0;
  var max_x = 0;

  for (var i=0; i<this.message.length; i++) {
    if (this.message[i] == "\n") {
      disp_y += this.font_y;
      disp_x = 0;
      continue;
    }
    disp_x += 4;
    if (max_x < disp_x) { max_x = disp_x; }
  }

  return {"height":disp_y, "max_x":max_x};
}

messageBubble.prototype.draw = function() {

  if (this.state != "hidden") {

    if (this.bubble_type == "speech") {

      var disp_x = this.x;
      var disp_y = this.y;

      var orig_x = this.x;

      var a_p = "a".charCodeAt(0);

      for (var i=0; i<this.message.length; i++) {

        if (this.message[i] == "\n") {
          disp_y += this.font_y;
          disp_x = orig_x;
          continue;
        }

        if (!(this.message[i] in this.font_spacing)) { continue; }

        var txt_x = this.font_spacing[this.message[i]];
        var txt_y = 0;
        var dtxt = 4;


        var font_a = this.fade_step / this.fade_step_N;

        g_imgcache.draw_s("font", txt_x, txt_y, dtxt, this.font_y, disp_x, disp_y-this.dy, dtxt, this.font_y, 0, font_a);

        disp_x += dtxt;

      }

    }

  } else if (this.type == "thought") {

  }

}
