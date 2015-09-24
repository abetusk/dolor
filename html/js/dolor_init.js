    var drawing = true,
      running = true,
      mouseDown = false,
      visible = true;

    var msec = 0;
    var frame = 0;
    var lastTime = new Date();

    var g_painter = null;

    var g_game_controller = null;

    var g_imgcache = null;
    var g_data = {};
    var g_player = null;
    var g_level = null;
    var g_world = null;


    var g_canvas = "canvas";
    var g_context = null;

    var g_show_fps = false;

    function canvasFocus()
    {
      var c = document.getElementById("canvas");
      c.focus();
    }


    var lastUpdateTime = new Date();
    var updateThreshold = 33;
    function loop() {
      var d = new Date();
      var update = false;
      var dt = d.getTime() - lastUpdateTime.getTime();

      if (dt > updateThreshold) {
        lastUpdateTime = d;
        update = true;
      }

      frame = frame + 1;
      if ( frame >= 30 ) {
        msec = (d.getTime() - lastTime ) / frame;
        lastTime = d;
        frame = 0;

      }

      if (g_show_fps) 
      {
        //var container = document.querySelector( 'section' );
        //container.innerHTML = "FPS: " + (1000.0/msec);
        console.log("fps:", 1000.0/msec);
      }

      requestAnimationFrame(loop, 1);



      if (update) {
        //g_game_controller.update();
        g_world.update();

        /*
        g_painter.clear();
        g_player.update();
        g_level.update();

        g_world.update();
        */

        /*
        if (g_player.intent.type != "idle") {

          if (g_player.intent.type == "walking") {
            g_player.x = g_player.intent.next.x;
            g_player.y = g_player.intent.next.y;
          }
          g_player.intent = { "type" : "idle" };
        }
        */
      }

      g_painter.dirty_flag = true;
      if (g_painter.dirty_flag) {
        g_world.draw();

        /*
        g_painter.startDrawColor();
        g_level.draw();
        g_player.draw();
        g_painter.endDraw();
        */
      }

    }

    $(document).ready( function() {

      var cvs = document.getElementById('canvas');
      cvs.onselectstart = function() { return false; }

      g_painter = new bleepsixRender( "canvas" );
      g_painter.setGrid(0);

      g_player = new mainPlayer();
      g_level = new dungeon0();
      g_world = new mainWorld();

      // setup image cache and preload some generic items
      //
      var img_base = "assets";
      g_imgcache = new imageCache();

      g_imgcache.add("noether", img_base + "/noether.png");
      //g_imgcache.add("item", img_base + "/items_11.png");
      g_imgcache.add("item", img_base + "/items_11.a.png");
      g_imgcache.add("rotbow", img_base + "/rotbow3.png");
      //g_imgcache.add("dungeon0", img_base + "/dungeon_sheet_0.png");
      g_imgcache.add("dungeon0", img_base + "/sheet_17.png");

      g_imgcache.add("skel_blue", img_base + "/jade_skel_float_wip2.png");

      $.ajax({
        //url: "assets/dolor_room_test.json",
        url: "assets/tele_room.json",
        dataType:"json",
        success: function(a,b,c) {
          console.log("!!!", a,b,c);

          g_data["dungeon0"] = a;
          g_level.tilemap = a;
          g_level.ready = true;
        },
        error: function(e) {
          console.log("err", e);
        }
      });

      //g_imgcache.add( "cursor:wire", img_base + "/cursor_custom_wire_s24.png" );

      requestAnimationFrame(loop, 1);

      canvasFocus();

      var w = $(window).width();
      var h = $(window).height();
      var canv = document.getElementById('canvas');
      canv.width = w;
      canv.height = h;
      g_painter.setWidthHeight( w, h );

      $(window).resize( function(ee) {
        var w = $(window).width();
        var h = $(window).height();
        var canv = document.getElementById('canvas');
        canv.width = w;
        canv.height = h;
        g_painter.setWidthHeight( w, h );
      });


      g_game_controller = new mainController();
      g_game_controller.init("canvas");
      g_game_controller.player = g_player;
      g_game_controller.level = g_level;
      g_game_controller.world = g_world;


      // INIT
      g_painter.setView(0, 0, 0.8);

      /*
      for (var ii=0; ii<16; ii++)  {
        g_painter.adjustZoom(0, 0, 1);
      }
      //g_painter.adjustPan(-1700, 300);
      //g_painter.adjustPan(-1800, 200);
      g_painter.adjustPan(-2500, -1800);
      */

    });

    if ( !window.requestAnimationFrame ) {
        window.requestAnimationFrame = ( function() {
          return window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function( callback, element ) {
            window.setTimeout( callback, 1000 );
          };
        } )();
    }
