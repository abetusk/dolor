function particleFirefly(x,y,dx,dy) {
  this.ttl = 3000;
  this.pos = [];
  this.dpos = [];
  this.accel = [];
  this.color = [];
  this.psize = [];

  this.n = 5;
  this.alpha = [];
  this.dalpha = [];

  this.alpha_del = 0.01;

  this.alpha_min = 0.2;
  this.alpha_max = 0.8;

  this.delayN = 10;
  this.delay = this.delayN-1;
  
  var a = Math.random()/(this.alpha_max - this.alpha_min) + this.alpha_min;

  for (var i=0; i<this.n; i++) {
    var rx = Math.floor(Math.random()*10);
    var ry = Math.floor(Math.random()*10);
    this.pos.push([x+rx,y+ry]);
    this.psize.push(1);

    //var a = Math.random()/(this.alpha_max - this.alpha_min) + this.alpha_min;
    this.alpha.push(a);
    this.dalpha.push(0.1);
    this.color.push("rgba(255,255,255," + a + ")");
  }

}

particleFirefly.prototype.update = function() {
  this.ttl--;

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

    this.color[i] = "rgba(255,255,255," + this.alpha[i] + ")";
  }

  this.delay--;
  if (this.delay>0) { return; }
  this.delay = this.delayN;

  for (var i=0; i<n; i++) {
    this.pos[i][0] += Math.floor(Math.random()*3) -1;
    this.pos[i][1] += Math.floor(Math.random()*3) -1;
  }

}

particleFirefly.prototype.draw = function() {
  if (this.ttl<0) { return; }

  var n = this.pos.length;
  for (var i=0; i<n; i++) {
    g_painter.drawPoint(this.pos[i][0], this.pos[i][1], this.color[i], this.psize[i]);
  }
}
