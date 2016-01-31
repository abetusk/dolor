function customCredit(info) {
  var default_info = {
    "ttl" : 20,
    "name": "puff",
    "frame" : 0,
    "frame_n" : 4,
    "delay" : 20,
    "delayN" : 20,
    "x" : 0,
    "y" : 0,
    "w" : 4,
    "h" : 4,
    "action" : "once" // loop, etc.
  };

  this.info = ((typeof info === "undefined") ? default_info : info);

  this.ttl = this.info.ttl;
  this.x = this.info.x;
  this.y = this.info.y;


  this.credit_text = [];
  this.credit_idx = 0;

  var msg = [
    "Main overworld tileset by ...\n" +
    "   interdimensional\n",
    "Main dungeon tileset by ...\n" +
    "   Buch\n",
    "Music by ...\n" +
    "   Airglow\n",
    "Programming by ...\n" +
    "   abetusk",
    "All code under agpl",
    "All art under\n" +
    "  cc by, cc by sa\n" + 
    "  or cc zero\n",
    "All music under cc by sa",
    "See credits.txt for\n" +
    " full list of credits",
    "dolor",
  ];


  for (var i=0; i<msg.length; i++) {
    this.credit_text.push( new messageBubble({
      x:this.x,
      y:this.y-16,
      easeIn: "fade",
      easeOut: "fade",
      origin: "lower_left",
      style: "center",
      message: msg[i]
    }) );
    this.credit_text[0].text_src_y = 6;
  }

  this.delay = 0;
  this.delay_state = -1;
  this.delayTrigger = [60, 240, 120];


}

customCredit.prototype.update = function() {
  if (this.ttl<=0) { return; }

  var x = 100;
  var y = 200;
  var scale = 12;

  if (this.delay_state == -1) {
    this.delay_state = 0;
    this.credit_text[0].start({x:x, y:y, bubble_type:"none", scale:scale});
    this.credit_text[0].text_src_y = 6;
  }

  this.delay++;
  if (this.delay >= this.delayTrigger[this.delay_state]) {
    this.delay_state = (this.delay_state + 1)%3;
    if (this.delay_state == 0) {
      this.credit_idx++;
      if (this.credit_idx >= this.credit_text.length) {
        this.credit_idx = 0;
        this.ttl=0;
      }

      this.credit_text[this.credit_idx].start({x:x, y:y, bubble_type:"none", scale:scale});
      this.credit_text[this.credit_idx].text_src_y = 6;

    } else if (this.delay_state==2) {
      this.credit_text[this.credit_idx].stop();
    }

    this.delay=0;
  }

  this.credit_text[this.credit_idx].update();
}

customCredit.prototype.draw = function() {
  if (this.ttl<=0) { return; }

  this.credit_text[this.credit_idx].draw();
}
