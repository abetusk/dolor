
function mainController() {
  this.canvas = null;
  this.context = null;
  this.capState = "unknown";

  this.player = null;
  this.level = null;
  this.tool = null;
}

// update 'model' state
mainController.prototype.update = function() {
}

mainController.prototype.canvas_coords_from_global = function(x, y)
{
  var rect = this.canvas.getBoundingClientRect();
  var rl = rect.left;
  var rt = rect.top;

  var scrollx = window.scrollX;
  var scrolly = window.scrollY;

  return [ x - rl - scrollx, y - rt - scrolly ];
}

mainController.prototype.keyUp = function(code, ch, e) {
  //console.log("keyUp:", code);
  if (this.player) { this.player.keyUp(code); }
}

mainController.prototype.keyDown = function(code, ch, e) {
  //console.log("keyDown:", code);
  //if (this.player) { this.player.input[code] = 1; }

  var key_processed = false;

  // 'i' - up
  if (code == 73) {
    g_painter.adjustPan(0, -10);
    key_processed = true;
  }

  // 'j' - left
  else if (code == 74) {
    g_painter.adjustPan(-10, 0);
    key_processed = true;
  }

  // 'k' - down
  else if (code == 75) {
    g_painter.adjustPan(0, 10);
    key_processed = true;
  }

  // 'l' - rightc
  else if (code == 76) {
    g_painter.adjustPan(10, 0);
    key_processed = true;
  }


  else if (code == 221) {
    g_painter.adjustZoom(100, 100, 1);
  }

  else if (code == 219) {
    g_painter.adjustZoom(100, 100, -1);
  }

  //console.log(">>>", code);


  if (!key_processed) {
    if (this.player) { this.player.keyDown(code); }
    if (this.level) { this.level.keyDown(code); }
  }
}

mainController.prototype.keyPress = function(key, ch, e) {
  //console.log("keyPress:", key);
  //if (this.player) { this.player.key.push(key); }
}


mainController.prototype.init = function(canvas_id) {
  this.canvas = $("#" + canvas_id)[0];
  this.context = this.canvas.getContext('2d');

  var controller = this;
  this.tool = new toolNav();

  $(canvas_id).focus( function(ev) {
  });

  $(canvas_id).mouseup( function(e) {
    var xy = controller.canvas_coords_from_global( e.pageX, e.pageY );
    //controller.mouseUp( e.which , xy[0], xy[1] );

    if (controller.tool)
      controller.tool.mouseUp(e.which, xy[0], xy[1]);
  });

  $(canvas_id).mousedown( function(e) {
    var xy = controller.canvas_coords_from_global( e.pageX, e.pageY );
    //controller.mouseDown( e.which, xy[0], xy[1] );
    if (controller.tool)
      controller.tool.mouseDown(e.which, xy[0], xy[1]);
  });

  $(canvas_id).mouseover( function(e) {
  });

  $(canvas_id).mouseenter( function(e) {
    var xy = controller.canvas_coords_from_global( e.pageX, e.pageY );
    //controller.mouseEnter( xy[0], xy[1] );
  });

  $(canvas_id).mouseleave( function(e) {
    var xy = controller.canvas_coords_from_global( e.pageX, e.pageY );
    //controller.mouseLeave( xy[0], xy[1] );
  });

  $(canvas_id).mousemove( function(e) {
    var xy = controller.canvas_coords_from_global(e.pageX, e.pageY);
    //controller.mouseMove( xy[0], xy[1] );

    if (controller.tool)
      controller.tool.mouseMove(xy[0], xy[1]);
  });

  $(canvas_id).mousewheel( function(e, delta, detlax, deltay) {
    //controller.mouseWheel( delta );
    if (controller.tool)
      controller.tool.mouseWheel(delta);
    return false;
  });

  $(canvas_id).click( function(e) {
  });

  $(canvas_id).dblclick( function(e) {
    //controller.doubleClick(e);
  });

  $(canvas_id).keydown( function(e) {
    var key = ( e.which ? e.which : e.keyCode );
    var ch = String.fromCharCode(key);

    this.capState = $(window).capslockstate("state");

    return controller.keyDown( e.keyCode, ch, e );
  });

  $(canvas_id).keyup( function(e) {
    var key = e.which;
    var ch = String.fromCharCode(key);
    controller.keyUp(key, ch, e);
  });

  $(canvas_id).resize( function(e) {
    console.log("resize");
    console.log(e);
  });

  $(canvas_id).keypress( function(e) {
    var key = e.which;
    var ch = String.fromCharCode(key);
    controller.keyPress( key, ch, e );
  });


  $(window).bind("capsOn", function(e) {
    controller.capState = "on";
  });

  $(window).bind("capsOff", function(e) {
    controller.capState = "off";
  });

  $(window).bind("capsUnknown", function(e) {
    controller.capState = "unknown";
  });

  $(window).capslockstate();

  // get rid of right click menu popup
  $(document).bind("contextmenu", function(e) { return false; });

  // put focus on the canvas
  $(canvas_id).focus();

  // do first draw  
  g_painter.dirty_flag = true;

}
