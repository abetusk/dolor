function particleCloud(x,y) {
  //this.ttl_max = 1000;
  this.ttl_max = 3000;
  this.ttl = this.ttl_max;
  this.pos = [];
  this.dpos = [];
  this.color = [];
  this.psize = [];

  this.n = 1;

  //this.base_psize = 100;
  this.base_psize = 150;

  this.alpha = [];
  this.dalpha = [];
  this.alpha_store = [];

  this.pic = [];
  this.pic_size = [];
  this.pic_disp_size = [];

  //this.alpha_del = 0.01 + Math.random()*0.001;
  //this.alpha_del = 0.005 + Math.random()*0.001;
  this.alpha_del = 1/(1024*1024);

  //this.alpha_min = 0.05;
  //this.alpha_max = 0.1;

  this.alpha_min = 0.05;
  this.alpha_max = 0.1;

  this.delayN = 10 + Math.floor(Math.random()*10);
  this.delay = this.delayN-1;

  this.fadein_delay_N = 400;
  this.fadein_delay = 0;
  this.fadein_alpha = this.alpha_min;

  this.fadeout_delay = 400;

  this.init(x,y);
}

particleCloud.prototype.init = function(x,y) {
  x = ((typeof x === "undefined")?0:x);
  y = ((typeof y === "undefined")?0:y);

  //this.fadein_alpha = Math.random()*(this.alpha_max - this.alpha_min) + this.alpha_min;
  this.fadein_alpha = this.alpha_min;

  //this.ttl = this.ttl_max - Math.floor(Math.random()*this.ttl_max/3);
  this.ttl = this.ttl_max;

  var dR = 10;
  var dS = 10;
  var a =  this.alpha_min;
  for (var i=0; i<this.n; i++) {
    var rx = Math.floor(Math.random()*dR);
    var ry = Math.floor(Math.random()*dR);
    this.pos.push([x+rx,y+ry]);
    this.psize.push(10 + Math.floor(Math.random()*dS));

    this.alpha.push(a);
    this.alpha_store.push(a);
    this.dalpha.push(this.alpha_del);
    this.color.push("rgba(255,255,255," + a + ")");

    var r = Math.floor(Math.random()*2);
    if (r==0) {
      var pic = "big_cloud" + r;
      this.pic.push("big_cloud0");
      this.pic_size.push([58,62]);
      this.pic_disp_size.push([3*58,3*62]);
    } else {
      this.pic.push("big_cloud1");
      this.pic_size.push([128,92]);
      this.pic_disp_size.push([128*2, 92*2]);
    }
  }

}

particleCloud.prototype.reset = function(x,y) {
  x = ((typeof x === "undefined")?0:x);
  y = ((typeof y === "undefined")?0:y);

  //this.fadein_alpha = Math.random()*(this.alpha_max - this.alpha_min) + this.alpha_min;
  this.fadein_alpha = this.alpha_min;
  //this.ttl = this.ttl_max - Math.floor(Math.random()*this.ttl_max/3);
  this.ttl = this.ttl_max;

  var dS = 10;
  var a =  this.alpha_min;
  for (var i=0; i<this.n; i++) {
    var rx = Math.floor(Math.random()*10);
    var ry = Math.floor(Math.random()*10);
    this.pos[i][0] = x+rx;
    this.pos[i][1] = y+ry;
    this.psize[i] = this.base_psize + Math.floor(Math.random()*dS);

    //this.alpha[i] = (a);
    this.alpha[i] = 0;
    this.alpha_store[i] = (a);
    this.dalpha[i] = this.alpha_del;
    this.color[i] = "rgba(255,255,255," + a + ")";

  }


  this.fadein_delay = 0;

}


particleCloud.prototype.update = function() {
  this.ttl--;

  this.fadein_delay++;
  if (this.fadein_delay >= this.fadein_delay_N) {
    this.fadein_delay = this.fadein_delay_N;
  }

  var n = this.pos.length;
  for (var i=0; i<n; i++) {
    if (this.fadein_delay < this.fadein_delay_N) {
      this.alpha[i] = this.alpha_store[i] * this.fadein_delay / this.fadein_delay_N;
    }
    else if (this.ttl<this.fadeout_delay) {
      this.alpha[i] = this.alpha_store[i] * this.ttl/this.fadeout_delay;
    }
    else {
      this.alpha[i] += this.dalpha[i];
      if (this.alpha[i]>=this.alpha_max) {
        this.alpha[i] = this.alpha_max;
        this.dalpha[i] = -this.alpha_del;
      }
      if (this.alpha[i]<=this.alpha_min) {
        this.alpha[i] = this.alpha_min;
        this.dalpha[i] = this.alpha_del;
      }
      this.alpha_store[i] = this.alpha[i];
    }

    this.color[i] = "rgba(255,255,255," + this.alpha[i] + ")";

  }

  this.delay--;
  if (this.delay>0) { return; }
  this.delay = this.delayN;

  var dv=1;

  for (var i=0; i<n; i++) {
    if (Math.random() < 0.3) {
      this.pos[i][0] -= dv;
      this.pos[i][1] -= dv;
    }
  }

}

particleCloud.prototype.draw = function() {
  if (this.ttl<=0) { return; }
  var n = this.pos.length;
  for (var i=0; i<n; i++) {
    if (this.alpha[i]==0) { continue; }
    if (this.alpha[i]<1/255) { continue; }
    g_painter.drawPoint(this.pos[i][0], this.pos[i][1], this.color[i], this.psize[i]);
    //g_imgcache.draw_s("puff", 0, 0, 4, 4, this.pos[i][0], this.pos[i][1], this.psize[i], this.psize[i], 0, this.alpha[i]);
    //g_imgcache.draw_s("big_cloud0", 0, 0, 58, 62, this.pos[i][0], this.pos[i][1], 58, 62, 0, this.alpha[i]);
    //g_imgcache.draw_s("big_cloud0", 0, 0, 58, 62, this.pos[i][0], this.pos[i][1], 58*3, 62*3, 0, this.alpha[i]);
    //g_imgcache.draw_s("big_cloud1", 0, 0, 58, 62, this.pos[i][0], this.pos[i][1], 58*3, 62*3, 0, this.alpha[i]);
    //g_imgcache.draw_s(this.pic[i], 0, 0, this.pic_size[i][0], this.pic_size[i][1], this.pos[i][0], this.pos[i][1],
    //     this.pic_disp_size[i][0], this.pic_disp_size[i][1], 0, this.alpha[i]);
  }
}
