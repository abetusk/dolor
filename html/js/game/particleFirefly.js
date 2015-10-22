function particleFirefly(x,y) {
  this.ttl_max = 3000;
  this.ttl = this.ttl_max;
  this.pos = [];
  this.dpos = [];
  this.accel = [];
  this.color = [];
  this.psize = [];

  this.ang_rad = [];
  this.ang_c = [];
  this.dang_c = [];
  this.r = [];
  this.ang_c_N = 30;
  this.eff_pos = [];


  this.n = 5;
  this.alpha = [];
  this.dalpha = [];

  //this.alpha_del = 0.01 + Math.random()*0.001;
  this.alpha_del = 0.005 + Math.random()*0.001;

  this.alpha_min = 0.1;
  //this.alpha_max = 0.5;
  this.alpha_max = 0.8;

  this.delayN = 10 + Math.floor(Math.random()*10);
  this.delay = this.delayN-1;

  this.fadein_delay_N = 100;
  this.fadein_delay = 0;
  this.fadein_alpha = this.alpha_max;

  this.init(x,y);
}

particleFirefly.prototype.init = function(x,y) {
  x = ((typeof x === "undefined")?0:x);
  y = ((typeof y === "undefined")?0:y);

  this.fadein_alpha = Math.random()*(this.alpha_max - this.alpha_min) + this.alpha_min;

  this.ttl = this.ttl_max - Math.floor(Math.random()*this.ttl_max/3);
  var a = Math.random()*(this.alpha_max - this.alpha_min) + this.alpha_min;

  for (var i=0; i<this.n; i++) {
    var rx = Math.floor(Math.random()*10);
    var ry = Math.floor(Math.random()*10);
    this.pos.push([x+rx,y+ry]);
    this.psize.push(1 + Math.floor(Math.random()*10));

    this.r.push(3);
    this.ang_rad.push(0);
    this.ang_c.push(Math.floor(Math.random()*this.ang_c_N));

    if (Math.random() < 0.5) {
      this.dang_c.push(Math.floor(Math.random()*2)+1);
    } else {
      this.dang_c.push(-Math.floor(Math.random()*2)+1);
    }

    this.eff_pos.push([0,0]);

    //var a = Math.random()/(this.alpha_max - this.alpha_min) + this.alpha_min;
    this.alpha.push(a);
    this.dalpha.push(0.1);
    this.color.push("rgba(255,255,255," + a + ")");
  }

}

particleFirefly.prototype.reset = function(x,y) {
  x = ((typeof x === "undefined")?0:x);
  y = ((typeof y === "undefined")?0:y);

  this.fadein_alpha = Math.random()*(this.alpha_max - this.alpha_min) + this.alpha_min;
  this.ttl = this.ttl_max - Math.floor(Math.random()*this.ttl_max/3);
  var dalpha = ((Math.random()<0.5) ? -0.125 : 0.125);

  var a = Math.random()*(this.alpha_max - this.alpha_min) + this.alpha_min;
  for (var i=0; i<this.n; i++) {
    var rx = Math.floor(Math.random()*10);
    var ry = Math.floor(Math.random()*10);
    this.pos[i][0] = x+rx;
    this.pos[i][1] = y+ry;
    //this.psize[i] = 1 + Math.floor(Math.random()*1);
    //this.psize[i] = 1;
    this.psize[i] = 2;

    this.r[i] = 3;
    this.ang_c[i] = (Math.floor(Math.random()*this.ang_c_N));

    if (Math.random() < 0.5) {
      this.dang_c[i] = (Math.floor(Math.random()*2)+1);
    } else {
      this.dang_c[i] = (-Math.floor(Math.random()*2)+1);
    }

    this.eff_pos[i][0] = 0;
    this.eff_pos[i][1] = 0;

    //var a = Math.random()/(this.alpha_max - this.alpha_min) + this.alpha_min;
    this.alpha[i] = (a);

    //this.dalpha[i] = (0.1);
    this.dalpha[i] = dalpha;

    this.color[i] = "rgba(255,255,255," + a + ")";
  }

  this.fadein_delay = 0;

}

particleFirefly.prototype.update = function() {
  this.ttl--;

  this.fadein_delay++;
  if (this.fadein_delay >= this.fadein_delay_N) {
    this.fadein_delay = this.fadein_delay_N;
  }

  var n = this.pos.length;
  for (var i=0; i<n; i++) {
    this.alpha[i] += this.dalpha[i];
    if (this.alpha[i]>=this.alpha_max) {
      this.alpha[i] = this.alpha_max;
      this.dalpha[i] = -this.alpha_del;
    }
    if (this.alpha[i]<=this.alpha_min) {
      this.alpha[i] = this.alpha_min;
      this.dalpha[i] = this.alpha_del;
    }

    if (this.fadein_delay < this.fadein_delay_N) {
      this.alpha[i] = this.fadein_alpha * this.fadein_delay / this.fadein_delay_N;
    }

    if (this.ttl<60) { this.alpha[i] = this.ttl/60; }

    this.color[i] = "rgba(255,255,255," + this.alpha[i] + ")";
  }



  this.delay--;
  if (this.delay>0) { return; }
  this.delay = this.delayN;

  for (var i=0; i<n; i++) {

    if (Math.random() < 0.3) {
      this.pos[i][0] += Math.floor(Math.random()*3) -1;
      this.pos[i][1] += Math.floor(Math.random()*3) -1;
    }

    if (Math.random() < 0.5) {
      this.ang_rad[i] = 2.0*Math.PI * this.ang_c[i] / this.ang_c_N;
      this.ang_c[i] += this.dang_c[i] + this.ang_c_N;
      this.ang_c[i] %= this.ang_c_N;
    }

    var r = this.r[i];
    this.eff_pos[i][0] = Math.floor(this.pos[i][0] + r*Math.cos(this.ang_rad[i]));
    this.eff_pos[i][1] = Math.floor(this.pos[i][1] + r*Math.sin(this.ang_rad[i]));
  }

}

particleFirefly.prototype.draw = function() {
  if (this.ttl<0) { return; }

  var n = this.pos.length;
  for (var i=0; i<n; i++) {
    //g_painter.drawPoint(this.pos[i][0], this.pos[i][1], this.color[i], this.psize[i]);
    g_painter.drawPoint(this.eff_pos[i][0], this.eff_pos[i][1], this.color[i], this.psize[i]);
  }
}
