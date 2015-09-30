
    var g_GRIDSIZE = 16;

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

    var g_music = null;
    var g_sfx = null;

    var g_canvas = "canvas";
    var g_context = null;

    var g_show_fps = false;

    function canvasFocus()
    {
      var c = document.getElementById("canvas");
      c.focus();
    }

    function new_sound_object(path, volume) {
      volume = ((typeof volume === "undefined") ? 1 : volume);
      var snd = new Howl({
          urls: [path],
          volume: volume,
          onened: function() { console.log("finish music"); }
      });
      return snd;
    }


    var lastUpdateTime = new Date();
    var updateThreshold = 15;
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
      //g_level = new dungeon0();
      g_level = new homeLevel();
      g_world = new mainWorld();

      // setup image cache and preload some generic items
      //
      var img_base = "assets";
      g_imgcache = new imageCache();

      g_imgcache.add("noether", img_base + "/noether.png");
      //g_imgcache.add("item", img_base + "/items_11.png");
      g_imgcache.add("item", img_base + "/items_11.a.png");
      g_imgcache.add("item_mask", img_base + "/items_mask.png");

      //g_imgcache.add("rotbow", img_base + "/rotbow3.png");
      //g_imgcache.add("dungeon0", img_base + "/dungeon_sheet_0.png");
      g_imgcache.add("dungeon0", img_base + "/sheet_17.png");
      g_imgcache.add("forrest", img_base + "/forrestup_0.png");

      //g_imgcache.add("skel_jade", img_base + "/float_skel_white.png");
      //g_imgcache.add("skel_jade", img_base + "/float_skel_purple.png");
      //g_imgcache.add("skel_jade", img_base + "/float_skel_blue.png");
      //g_imgcache.add("skel_jade", img_base + "/float_skel_green.png");
      //g_imgcache.add("skel_jade", img_base + "/float_skel_red.png");
      g_imgcache.add("skel_jade", img_base + "/float_skel_jade.png");

      //g_imgcache.add("critter_bunny", img_base + "/critter_bunny.png");
      g_imgcache.add("critter_bunny", img_base + "/critter_bunny2.png");
      g_imgcache.add("critter_chick", img_base + "/critter_chick.png");

      g_imgcache.add("critter_rat", img_base + "/critter_rat.png");
      g_imgcache.add("critter_bat", img_base + "/critter_bat.png");
      g_imgcache.add("critter_spider", img_base + "/critter_spider.png");
      g_imgcache.add("critter_chicken", img_base + "/critter_chicken.png");
      g_imgcache.add("critter_chicken_black", img_base + "/critter_chicken_black.png");
      g_imgcache.add("critter_turtle", img_base + "/critter_turtle.png");

      //g_imgcache.add("bomb_explosion", img_base + "/explosion_wip1.png");
      g_imgcache.add("bomb_explosion", img_base + "/explosion_wip1.png");
      g_imgcache.add("bomb_explosion2", img_base + "/explosion_2.png");

      //g_imgcache.add("rotbow_w_string", img_base + "/rotbow_w_string_18x18.png");
      g_imgcache.add("rotbow_w_string", img_base + "/rotbow_w_string_20x20.png");
      //g_imgcache.add("rotbow", img_base + "/rotbow_20x20.png");
      //g_imgcache.add("rotbow", img_base + "/rotbow32_20x20.png");
      g_imgcache.add("rotbow", img_base + "/rotbow32_20x20_2.png");
      g_imgcache.add("rotbow_fulldraw", img_base + "/rotbow_fulldraw_nostring2.png");
      g_imgcache.add("arrow", img_base + "/arrow32.png");
      //g_imgcache.add("rotstring", img_base + "/rotstring_20x20.png");
      //g_imgcache.add("rotstring", img_base + "/rotstring_a2_20x20.png");

      g_imgcache.add("puff", img_base + "/puff.png");

      g_imgcache.add("bones", img_base + "/bones3.png");
      g_imgcache.add("horns", img_base + "/horns.png");
      g_imgcache.add("knight", img_base + "/lattice_knight2.png");

      g_imgcache.add("floatskull", img_base + "/floatskull.png");

      var welcome_music = new Howl({
          urls: ['assets/music/mark.nine-the-little-things-02-devil-you-know.mp3'],
          //autoplay: true,
          onened: function() { console.log("finish music"); }
      });

      g_sfx = {};
      g_sfx["sword-swing"] = [];
      //g_sfx["sword-swing"].push( new_sound_object("assets/sfx/49673__ejfortin__energy-short-sword-2.ogg") );
      //g_sfx["sword-swing"].push( new_sound_object("assets/sfx/49676__ejfortin__energy-short-sword-5.ogg") );
      //g_sfx["sword-swing"].push( new_sound_object("assets/sfx/49677__ejfortin__energy-short-sword-6.ogg") );
      //g_sfx["sword-swing"].push( new_sound_object("assets/sfx/49693__ejfortin__energy-gloves.ogg") );

      g_sfx["sword-swing"].push( new_sound_object("assets/sfx/ee3.ogg", 0.15) );
      g_sfx["sword-swing"].push( new_sound_object("assets/sfx/sword-2.ogg", 0.15) );
      g_sfx["sword-swing"].push( new_sound_object("assets/sfx/sword-5.ogg", 0.15) );
      g_sfx["sword-swing"].push( new_sound_object("assets/sfx/sword-6.ogg", 0.15) );

      g_sfx["sword-thud"] = [];
      g_sfx["sword-thud"].push( new_sound_object("assets/sfx/sword-thud/214215__taira-komori__damage6.mp3", 0.15) );
      g_sfx["sword-thud"].push( new_sound_object("assets/sfx/sword-thud/270332__littlerobotsoundfactory__hit-03.ogg", 0.15) );
      g_sfx["sword-thud"].push( new_sound_object("assets/sfx/sword-thud/318969__dewaholic__kick-hard-8-bit.ogg", 0.15) );
      g_sfx["sword-thud"].push( new_sound_object("assets/sfx/sword-thud/34551__corsica-s__4-bit-bounce.ogg", 0.15) );
      g_sfx["sword-thud"].push( new_sound_object("assets/sfx/sword-thud/39294__stickman__hacked.ogg", 0.15) );
      g_sfx["sword-thud"].push( new_sound_object("assets/sfx/sword-thud/49693__ejfortin__energy-gloves.ogg", 0.15) );

      g_sfx["enemy-hit"] = [];
      g_sfx["enemy-hit"].push( new_sound_object("assets/sfx/49680__ejfortin__nano-blade-1.ogg") );
      g_sfx["enemy-hit"].push( new_sound_object("assets/sfx/49681__ejfortin__nano-blade-2.ogg") );
      g_sfx["enemy-hit"].push( new_sound_object("assets/sfx/49682__ejfortin__nano-blade-3.ogg") );
      g_sfx["enemy-hit"].push( new_sound_object("assets/sfx/49683__ejfortin__nano-blade-4.ogg") );
      g_sfx["enemy-hit"].push( new_sound_object("assets/sfx/49684__ejfortin__nano-blade-5.ogg") );

      g_sfx["explosion"] = [];
      g_sfx["explosion"].push( new_sound_object("assets/sfx/259962__thehorriblejoke__8-bit-explosion.ogg") );
      g_sfx["explosion"].push( new_sound_object("assets/sfx/170146__timgormly__8-bit-explosion.ogg") );
      g_sfx["explosion"].push( new_sound_object("assets/sfx/170144__timgormly__8-bit-explosion2.ogg") );

      g_music = {};
      g_music["home"] = new_sound_object("assets/music/mark.nine-the-little-things-02-devil-you-know.mp3");
      g_music["home-ambient"] = new_sound_object("assets/music/317363__frankum__ambient-electronic-loop-001.mp3");
      g_music["disturbance"] = new_sound_object("assets/music/131005__reacthor__the-emperor-s-starfleet.ogg");

      //welcome_music.play();


      $.ajax({
        //url: "assets/dolor_room_test.json",
        //url: "assets/tele_room.json",
        //url: "assets/home.json",
        url: "assets/overworld_test.json",
        dataType:"json",
        success: function(a,b,c) {
          console.log("!!!", a,b,c);

          //g_data["dungeon0"] = a;
          g_data["homeArea"] = a;
          g_level.tilemap = a;
          g_level.ready = true;
          g_level.init();
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
      g_painter.setView(0, 0, 1.5);

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
