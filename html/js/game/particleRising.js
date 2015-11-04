function particleRising(x,y) {
  this.ttl_max = 3000;
  this.ttl_finish = 100;
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


  this.n = 15;
  this.alpha = [];
  this.dalpha = [];

  this.alpha_del = 0.005 + Math.random()*0.001;

  this.alpha_min = 0.1;
  this.alpha_max = 0.8;

  this.delayN = 10 + Math.floor(Math.random()*10);
  this.delay = this.delayN-1;

  this.fadein_delay_N = 100;
  this.fadein_delay = 0;
  this.fadein_alpha = this.alpha_max;

  this.particle = [];

  this.x = x+8;
  this.y = y+8;

  this.particle_ttl_max = 300;

  this.max_a = 0.5;

  this.light_column = true;

  this.init(this.x,this.y);
}

particleRising.prototype.rand_particle = function(p,x,y) {
  var dsx = 11;
  var dsy = 13;
  var dsx2 = Math.floor(dsx/2)
  var dsy2 = Math.floor(dsy/2)

  var drx = Math.floor(Math.random()*dsx)-dsx2;
  var dry = Math.floor(Math.random()*dsy)-dsy2;

  var vx = (Math.random()-0.5)/100;
  var vy = -Math.random()/5 - .20;

  p.x = x+drx;
  p.y = y+dry;
  p.a = 0;
  p.ttl = this.particle_ttl_max;
  p.vx = vx;
  p.vy = vy;
  p.idelay=Math.floor(Math.random()*this.particle_ttl_max*2);

}

particleRising.prototype.init = function(x,y) {
  x = ((typeof x === "undefined")?0:x);
  y = ((typeof y === "undefined")?0:y);

  this.particle = [];
  for (var i=0; i<this.n; i++) {
    var p = {};
    this.rand_particle(p,x,y);
    this.particle.push(p);
  }

}

particleRising.prototype.finish = function() {
  this.ttl = this.ttl_finish;
}

particleRising.prototype.update = function() {
  this.ttl--;

  for (var i=0; i<this.n; i++) {

    if (this.particle[i].idelay>0)  {
      this.particle[i].idelay--;
      continue;
    }

    this.particle[i].ttl--;
    if (this.particle[i].ttl<=0) {
      this.particle[i].ttl=0;
      this.rand_particle(this.particle[i], this.x, this.y);
      continue;
    }

    this.particle[i].x += this.particle[i].vx;
    this.particle[i].y += this.particle[i].vy;
    if (this.particle[i].ttl > (.9*this.particle_ttl_max)) {
      this.particle[i].a = (this.particle_ttl_max - this.particle[i].ttl)/(this.particle_ttl_max*.1);
      this.particle[i].a *= this.max_a;
    } else {
      this.particle[i].a = this.particle[i].ttl/(.9*this.particle_ttl_max);
      this.particle[i].a *= this.max_a;
    }
  }

}

particleRising.prototype.draw = function() {
  if (this.ttl<0) { return; }

  for (var i=0; i<this.n; i++) {
    if (this.particle[i].ttl <= 0) { continue; }
    var x = Math.floor(this.particle[i].x);
    var y = Math.floor(this.particle[i].y);
    var a = this.particle[i].a;
    if (this.ttl<100) { a *= this.ttl/100; }
    var c = "rgba(255,255,255," + a + ")";
    g_painter.drawPoint(x,y,c,2);
  }

  if (this.light_column) {
    var a = 1.0;
    if (this.ttl<this.ttl_finish) { a *= this.ttl/this.ttl_finish; }
    if (this.ttl>(this.ttl_max-100)) { a *= (this.ttl_max-this.ttl)/100; }
    g_painter.drawGradientLine(this.x, this.y-500, this.x, this.y, 16, "rgba(255,255,255,0.0)", "rgba(255,255,255," + a +")", 0.65);
  }

}
