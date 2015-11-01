/*

    Copyright (C) 2013 Abram Connelly

    This file is part of dolor.

    dolor is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    dolor is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with dolor.  If not, see <http://www.gnu.org/licenses/>.

*/


function toolNav(x, y)
{
  x = ( typeof x !== 'undefined' ? x : 0 );
  y = ( typeof y !== 'undefined' ? y : 0 );

  this.mouse_down = false;
  this.mouse_cur_x = x;
  this.mouse_cur_y = y;

  this.mouse_drag_flag = false;

  this.mouse_world_xy = g_painter.devToWorld(x, y);
}

toolNav.prototype.update = function(x, y)
{
  this.mouse_cur_x = x;
  this.mouse_cur_y = y;

  this.mouse_world_xy = g_painter.devToWorld(x, y);
}


toolNav.prototype.drawOverlay = function() { }

toolNav.prototype.mouseDown = function(button, x, y)
{
  this.mouse_down = true;
  if (button == 3)
  {
    this.mouse_drag_flag = true;
    return;
  }

}

toolNav.prototype.doubleClick = function(button, x, y) { }

toolNav.prototype.mouseUp = function(button, x, y)
{
  this.mouse_down = false;
  if (button == 3) {
    this.mouse_drag_flag = false;
  } else {
    //var world_xy = g_painter.devToWorld( this.mouse_cur_x, this.mouse_cur_y );
    //g_player.x = Math.floor(world_xy.x);
    //g_player.y = Math.floor(world_xy.y);
  }

}

toolNav.prototype.mouseMove = function(x, y)
{
  if ( this.mouse_drag_flag )
  {
    this.mouseDrag(x - this.mouse_cur_x, y - this.mouse_cur_y);
  }


  this.mouse_cur_x = x;
  this.mouse_cur_y = y;

  var world_xy = g_painter.devToWorld( this.mouse_cur_x, this.mouse_cur_y );
  this.mouse_world_xy["x"] = world_xy["x"];
  this.mouse_world_xy["y"] = world_xy["y"];

  var wx = this.mouse_world_xy.x;
  var wy = this.mouse_world_xy.y;


  g_painter.dirty_flag = true;

}

toolNav.prototype.mouseDrag = function(dx, dy)
{
  g_painter.adjustPan(dx, dy);
  g_painter.dirty_flag = true;
}

toolNav.prototype.mouseWheel = function(delta)
{
  g_painter.adjustZoom(this.mouse_cur_x, this.mouse_cur_y, delta);
}



toolNav.prototype.keyDown = function(keycode, ch, ev) {

  if (ch=='T') {

    if (g_debug) {
      // DEBUG
      var world_xy = g_painter.devToWorld( this.mouse_cur_x, this.mouse_cur_y );
      g_player.x = Math.floor(world_xy.x);
      g_player.y = Math.floor(world_xy.y);
    }
  }


}

toolNav.prototype.keyUp = function(keycode, ch, ev) { }
