function messageBubble(x,y,message,msg_type) {

  x = ((typeof x === "undefined") ? 0 : x);
  y = ((typeof y === "undefined") ? 0 : y);
  message = ((typeof message == "undefined") ? "hello, friend" : message);
  msg_type = ((typeof msg_type == "undefined") ? "speak" : msg_type);

  this.type = msg_type;
  this.message = message;

  this.img_font = "font";
  this.img_speak = "bubble";

  this.x = x;
  this.y = y;

  this.name = name;

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

}

messageBubble.prototype.update = function(world_state) {

  this.delay--;
  
  if (this.delay==0) {
    // do something here

    this.delay = this.delayN;
  }

}

messageBubble.prototype.draw = function() {

  if (this.type == "speak") {

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

      g_imgcache.draw_s("font", txt_x, txt_y, dtxt, this.font_y, disp_x, disp_y, dtxt, this.font_y);

      disp_x += dtxt;

      /*
      var ch = this.message.charCodeAt(i);
      if (ch==32) { disp_x += 4; continue; }

      var z = this.message.charCodeAt(i) - a_p;

      if ((z<0) || (z>26)) { continue; }

      var txt_x = 4*z;
      var txt_y = 0;

      var dtxt = 4;

      g_imgcache.draw_s("font", txt_x, txt_y, dtxt, this.small_font_y, disp_x, disp_y, dtxt, this.small_font_y);
      disp_x += dtxt;
      */
    }
    /*
    for (var i=0; i<this.message.length; i++) {
      var ch = this.message.charCodeAt(i);
      if (ch==32) { disp_x += 5; continue; }

      var z = this.message.charCodeAt(i) - a_p;

      if ((z<0) || (z>this.small_font.length)) { continue; }

      var txt_x = this.small_font[z];
      var txt_y = 0;

      var dtxt = this.small_font[z+1] - this.small_font[z];

      g_imgcache.draw_s("font", txt_x, txt_y, dtxt, this.small_font_y, disp_x, disp_y, dtxt, this.small_font_y);
      disp_x += dtxt;
    }
    */


  } else if (this.type == "thought") {
  }

  //var imgx = this.crit_w*this.keyFrame;
  //var imgy = this.crit_h*this.frameRow;

  //g_imgcache.draw_s(this.name, imgx, imgy, this.crit_w, this.crit_h, this.x, this.y, this.world_w, this.world_h);

  if (this.state == "speak") {
    //g_imgcache.draw_s("bubble", imgx, imgy, this.crit_w, this.crit_h, this.x, this.y, this.world_w, this.world_h);
  }
}
