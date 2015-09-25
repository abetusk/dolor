function particleDebris(x,y,dx,dy) {
  this.ttl = 12;
  this.pos = [];
  this.dpos = [];
  this.accel = [];
  this.color = [];
  this.psize = [];

  this.dampen = 0.6;

  this.x = x;
  this.y = y;

  var pdx = -dy;
  var pdy =  dx;

  var opdx = dy;
  var opdy =-dx;

  //this.accel = [0,1];
  //this.accel = [dx,dy];
  //this.accel = [-dx/5.0, -dy/5.0];

  var rho = 0;
       if (dy>0.5)  { rho=Math.PI/2; }
  else if (dx<-.05) { rho=Math.PI; }
  else if (dy<-.05) { rho=3*Math.PI/2; }

  var theta = [ 2*Math.PI/3, 4*Math.PI/3, 2*Math.PI/3.3, 4*Math.PI/2.7];

  var n = Math.floor(Math.random()*theta.length)+1;
  if (n<=0) { n=1; }
  else if (n>4) { n=4; }

  for (var i=0; i<n; i++) {

    var xx = dx*10;
    var yy = dy*10;
    var tx = Math.floor((Math.random()-0.5)*2);
    var ty = Math.floor((Math.random()-0.5)*2);
    this.pos.push([x+tx+xx,y+ty+yy]);

    var dtheta = (Math.random()-0.5)*Math.PI/6;
    var vx = Math.cos(theta[i] + dtheta + rho);
    var vy = Math.sin(theta[i] + dtheta + rho);

    this.dpos.push([vx*2,vy*2]);
    this.accel.push([vx/10,vy/10]);

    this.color.push( "rgba( 88, 52, 40,1)" );

    var s = Math.floor(Math.random()*2) + 1;
    this.psize.push(s);
  }
  return;

}

particleDebris.prototype.update = function() {
  this.ttl--;

  var n = this.pos.length;
  for (var i=0; i<n; i++) {
    this.pos[i][0] += this.dpos[i][0];
    this.pos[i][1] += this.dpos[i][1];

    this.pos[i][0] = Math.floor(this.pos[i][0]);
    this.pos[i][1] = Math.floor(this.pos[i][1]);

    this.dpos[i][0] += this.accel[i][0];
    this.dpos[i][1] += this.accel[i][1];

    this.accel[i][0] *= this.dampen;
    this.accel[i][1] *= this.dampen;
  }

}

particleDebris.prototype.draw = function() {
  if (this.ttl<0) { return; }

  var n = this.pos.length;
  for (var i=0; i<n; i++) {
    //g_painter.drawRectangle(this.pos[i][0], this.pos[i][1], 1, 1, 1, "rgba(255,0,0,0.5)");
    g_painter.drawPoint(this.pos[i][0], this.pos[i][1], this.color[i], this.psize[i]);
  }
}
