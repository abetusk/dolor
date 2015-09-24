function particleDebris(x,y,dx,dy) {
  this.ttl = 8;
  this.pos = [];
  this.dpos = [];
  this.accel = [];
  this.color = [];
  this.psize = [];

  this.dampen = 0.4;

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

    this.dpos.push([vx*5,vy*5]);
    this.accel.push([vx/10,vy/10]);

    this.color.push( "rgba( 88, 52, 40,1)" );

    var s = Math.floor(Math.random()*3) + 2;
    this.psize.push(s);
  }
  return;

  var acount = 0;
  var bcount = 0;
  var n=3;
  for (var i=0; i<n; i++) {
    var xx = dx*10;
    var yy = dy*10;
    var tx = Math.floor((Math.random()-0.5)*2);
    var ty = Math.floor((Math.random()-0.5)*2);
    this.pos.push([tx+xx,ty+yy]);

    var fudgex = dx/2;
    var fudgey = dy/2;

    var vx = Math.floor((Math.random()-0.5)*8);
    var vy = Math.floor((Math.random()-0.5)*8);
    this.dpos.push([vx,vy]);

    console.log(".", i, acount, bcount);

    //if ((i==(n-1)) && (acount==(n-2))) {
    //  this.accel.push([opdx+fudgex,opdy+fudgey]);
    //} else if ((i==(n-1)) && (bcount==(n-2))) {
    //  this.accel.push([pdx+fudgex,pdy+fudgey]);
    //} else {

      if (Math.random()<0.5) {
        acount++;
        this.accel.push([pdx+fudgex,pdy+fudgey]);
      } else {
        bcount++;
        this.accel.push([opdx+fudgex,opdy+fudgey]);
      }

    //}

  }

  //this.pos.push([0,0]);
  //this.pos.push([0,0]);
  //this.pos.push([0,0]);
  //this.pos.push([0,0]);
  //this.pos.push([0,0]);

  var rx0 = Math.floor(dx+pdx);
  var ry0 = Math.floor(dy+pdy);

  var rx1 = Math.floor(dx+opdx);
  var ry1 = Math.floor(dy+opdy);

  //this.dpos.push([  dx,  dy]);
  //this.dpos.push([ pdx, pdy]);
  //this.dpos.push([opdx,opdy]);
  //this.dpos.push([ rx0, ry0]);
  //this.dpos.push([ rx1, ry1]);

  for (var i=0; i<this.dpos.length; i++) {
    this.dpos[i][0] = Math.floor((Math.random()-0.5)*3);
    this.dpos[i][1] = Math.floor((Math.random()-0.5)*3);
  }


  /*
  this.dpos.push([-1,0]);
  this.dpos.push([ 1,0]);
  this.dpos.push([-1,1]);
  this.dpos.push([ 1,1]);
  this.dpos.push([ 0,1]);
  */

  for (var i=0; i<this.pos.length; i++) {
    this.pos[i][0] += this.x;
    this.pos[i][1] += this.y;
    //this.dpos[i][0] *= 10;
    //this.dpos[i][1] *= 10;
  }

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
