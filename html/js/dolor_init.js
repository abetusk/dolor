
    var g_GRIDSIZE = 16;

    var drawing = true,
      running = true,
      mouseDown = false,
      visible = true;

    // DEVELOPMENT
    // DEBUG
    //var g_debug = true;

    // turns on mouse 't' teleport
    //
    var g_debug = false;

    var g_painter = null;
    var g_message = null;

    var g_game_controller = null;

    var g_imgcache = null;
    var g_data = {};
    var g_player = null;
    //var g_level = null;

    var g_level_overworld = null;

    var g_level_library = null;
    var g_level_dolor = null;
    var g_level_alpha = null;
    var g_level_beta = null;
    var g_level_gamma = null;
    var g_level_delta = null;

    var g_level_dungeon_jade = null;
    var g_level_dungeon_blood = null;
    var g_level_dungeon_bone = null;
    var g_level_dungeon_aqua = null;

    var g_world = null;

    var g_level_cache = {};

    var g_music = null;
    var g_sfx = null;

    var g_canvas = "canvas";
    var g_context = null;

    var g_show_fps = false;

    var g_register_load = {};
    function register_load(map_name) {
      g_register_load[map_name] = true;

      if (g_register_load["overworld"] && g_register_load["dolor"]) {

        g_world.ready = true;

        g_level_overworld.meta_map(27, function(dat, x, y) {
          g_level_dolor.x = x - g_level_dolor.portal[0].x;
          g_level_dolor.y = y - g_level_dolor.portal[0].y;
        });

        g_level_dolor.meta_map(27, function(dat, x, y) {
          g_player.x = x;
          g_player.y = y;
          g_painter.setView(x, y, 2);
        });

        /*
        var c = [];
        c.push( new debugSpriteAnimator("bones", 16, 16, 4, 4, 10) );
        c.push( new debugSpriteAnimator("dead_bones", 16, 16, 4, 2, 10) );
        c.push( new debugSpriteAnimator("bone_minion", 16, 16, 4, 4, 10) );
        c.push( new debugSpriteAnimator("dead_bone_minion", 16, 16, 4, 2, 10) );
        c.push( new debugSpriteAnimator("dead_horns", 16, 16, 4, 2, 10) );
        c.push( new debugSpriteAnimator("knight", 16, 16, 4, 4, 10) );
        c.push( new debugSpriteAnimator("dead_knight", 16, 16, 4, 2, 10) );
        c.push( new debugSpriteAnimator("noether", 16, 16, 4, 5, 10) );
        c.push( new debugSpriteAnimator("noether_fox_shield", 16, 16, 4, 5, 10) );

        var zcol = 4;

        for (var ind=0; ind<c.length; ind++) {
          var rr = Math.floor(ind/zcol);
          var cc = ind%zcol;
          c[ind].x = g_player.x + cc*16;
          c[ind].y = g_player.y + rr*16;
          g_world.particle.push(c[ind]);
          console.log("???", g_world.particle);
        }

        console.log(">>>", g_player.x, g_player.y);
        */

      }

    }

    function canvasFocus()
    {
      var c = document.getElementById("canvas");
      c.focus();
    }

    function new_sound_object(path, volume, loop) {
      loop = ((typeof loop === "undefined")? false : loop);
      volume = ((typeof volume === "undefined") ? 1 : volume);
      var snd = new Howl({
          urls: [path],
          volume: volume,
          loop: loop,
          onened: function() { console.log("finish music"); }
      });
      return snd;
    }


    var lastUpdateTime = new Date();
    //var updateThreshold = 16;
    var updateThreshold = Math.floor(1000/60);

    var msec = 0;
    var frame = 0;
    var lastTime = new Date();

    var __g_last_date=0, __g_date, __dt;
    var __update = false;
    var __frame = 0;
    var __msec = 0;
    var __frame_counter = 0;
    var __fps_last_date = 0;

    function loop() {

      __update = false;
      __g_date = Date.now();
      __dt = __g_date - __g_last_date;

      if (__dt > updateThreshold) {
        __g_last_date = __g_date;
        __update = true;
      }

      __frame = __frame+1;
      if (__frame >= 30) {
        __msec = (__g_date - __fps_last_date)/__frame;
        __frame=0;
        __fps_last_date = __g_date;

        if (g_show_fps) {
          if ((__msec>1) && ((__frame_counter%30)==0)){
            console.log("fps:", 1000.0/__msec);
          } else {
            console.log(">>", __msec, __frame_counter);
          }
        }

      }

      if (__update) { g_world.update(); }

      g_painter.dirty_flag = true;
      if (g_painter.dirty_flag) { g_world.draw(); }

      requestAnimationFrame(loop, 1);
    }

    $(document).ready( function() {

      var cvs = document.getElementById('canvas');
      cvs.onselectstart = function() { return false; }

      g_painter = new bleepsixRender( "canvas" );
      g_painter.setGrid(0);

      g_player = new mainPlayer();
      g_world = new mainWorld();

      //g_level = new homeLevel();

      g_level_dolor = new levelDolor();
      g_level_library = new levelLibrary();

      g_level_dungeon_jade = new dungeonJade();
      g_level_dungeon_blood = new dungeonBlood();
      g_level_dungeon_bone = new dungeonBone();
      g_level_dungeon_aqua = new dungeonAqua();

      // setup image cache and preload some generic items
      //
      var img_base = "assets";
      g_imgcache = new imageCache();

      g_imgcache.add("noether", img_base + "/noether.png");
      g_imgcache.add("noether_mask", img_base + "/noether_mask.png");

      g_imgcache.add("noether_fox_shield", img_base + "/noether_foxshield.png");
      g_imgcache.add("noether_fox_shield_mask", img_base + "/noether_foxshield_mask.png");

      //g_imgcache.add("heart", img_base + "/heart.png");
      //g_imgcache.add("heart", img_base + "/heart_xpr.png");
      g_imgcache.add("heart", img_base + "/heart_xpr2.png");

      //g_imgcache.add("item", img_base + "/items_11.png");
      //g_imgcache.add("item", img_base + "/items_11.a.png");
      g_imgcache.add("item", img_base + "/items_11.b.png");
      g_imgcache.add("item_mask", img_base + "/items_mask.png");

      g_imgcache.add("item_key", img_base + "/item_key.png");

      //g_imgcache.add("rotbow", img_base + "/rotbow3.png");
      //g_imgcache.add("dungeon0", img_base + "/dungeon_sheet_0.png");
      //g_imgcache.add("dungeon0", img_base + "/sheet_17.png");
      //g_imgcache.add("dungeon", img_base + "/sheet_17.png");
      g_imgcache.add("dungeon", img_base + "/sheet_17.b.png");
      //g_imgcache.add("sheet_17", img_base + "/sheet_17.png");
      //g_imgcache.add("sheet_17", img_base + "/sheet_17.a.png");
      g_imgcache.add("sheet_17", img_base + "/sheet_17.b.png");
      //g_imgcache.add("forrest", img_base + "/forrestup_0.png");
      //g_imgcache.add("forrest", img_base + "/forrestup_1.png");
      g_imgcache.add("forrest", img_base + "/forrestup_3.png");
      //g_imgcache.add("forrestup_0", img_base + "/forrestup_0.png");
      //g_imgcache.add("forrestup_0", img_base + "/forrestup_1.png");
      //g_imgcache.add("forrestup_0", img_base + "/forrestup_3.png");
      g_imgcache.add("forrestup_0", img_base + "/forrestup_4.png");

      g_imgcache.add("tree_anim", img_base + "/tree_wave_anim.png");
      g_imgcache.add("bush_anim", img_base + "/bush_anim2.png");
      g_imgcache.add("wind", img_base + "/wind.png");

      //g_imgcache.add("skel_jade", img_base + "/float_skel_white.png");
      //g_imgcache.add("skel_jade", img_base + "/float_skel_purple.png");
      //g_imgcache.add("skel_jade", img_base + "/float_skel_blue.png");
      //g_imgcache.add("skel_jade", img_base + "/float_skel_green.png");
      //g_imgcache.add("skel_jade", img_base + "/float_skel_red.png");
      g_imgcache.add("skel_jade", img_base + "/float_skel_jade.png");
      g_imgcache.add("skel_jade_tele", img_base + "/float_skel_jade_tele.png");

      //g_imgcache.add("skel_bone", img_base + "/float_skel_white.png");
      //g_imgcache.add("skel_bone", img_base + "/float_skel_red.png");
      g_imgcache.add("skel_bone", img_base + "/float_skel_purple.png");

      g_imgcache.add("skel_blood", img_base + "/float_skel_green.png");
      //g_imgcache.add("skel_aqua", img_base + "/float_skel_blue.png");
      g_imgcache.add("skel_aqua", img_base + "/float_skel_purple.png");

      g_imgcache.add("skel_mask", img_base + "/float_skel_jade_mask.png");

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
      //g_imgcache.add("rotbow_fulldraw", img_base + "/rotbow_fulldraw_nostring2.png");
      g_imgcache.add("rotbow_fulldraw", img_base + "/rotbow_fulldraw_nostring3.png");
      g_imgcache.add("rotbow_fulldraw_w_string", img_base + "/rotbow_fulldraw_w_string2.png");
      g_imgcache.add("arrow", img_base + "/arrow32.png");
      //g_imgcache.add("rotstring", img_base + "/rotstring_20x20.png");
      //g_imgcache.add("rotstring", img_base + "/rotstring_a2_20x20.png");

      g_imgcache.add("waterfall", img_base + "/waterfall_wip.png");
      g_imgcache.add("flame", img_base + "/small_flame.png");

      g_imgcache.add("overworld_extra", img_base + "/overworld_extra_wip5.png");

      g_imgcache.add("puff", img_base + "/puff.png");

      g_imgcache.add("shadow", img_base + "/shadow16x16.png");

      g_imgcache.add("bones", img_base + "/bones3.png");
      g_imgcache.add("dead_bones", img_base + "/dead_bones.png");
      g_imgcache.add("mask_bones", img_base + "/mask_bones.png");
      g_imgcache.add("mask_dead_bones", img_base + "/mask_dead_bones.png");

      g_imgcache.add("bone_minion", img_base + "/bone_minion.png");
      g_imgcache.add("dead_bone_minion", img_base + "/dead_bone_minion.png");
      g_imgcache.add("mask_bone_minion", img_base + "/bone_minion_mask.png");
      g_imgcache.add("mask_dead_bone_minion", img_base + "/dead_bone_minion_mask.png");

      g_imgcache.add("horns", img_base + "/horns.png");
      g_imgcache.add("dead_horns", img_base + "/dead_horns.png");
      g_imgcache.add("mask_horns", img_base + "/mask_horns.png");
      g_imgcache.add("mask_dead_horns", img_base + "/mask_dead_horns.png");

      g_imgcache.add("knight", img_base + "/lattice_knight2.png");
      g_imgcache.add("knight_tele", img_base + "/lattice_knight_tele.png");

      g_imgcache.add("mask_knight", img_base + "/lattice_knight2_mask.png");
      g_imgcache.add("dead_knight", img_base + "/dead_lattice_knight2.png");
      g_imgcache.add("mask_dead_knight", img_base + "/dead_lattice_knight2_mask.png");

      g_imgcache.add("lancer", img_base + "/armor_lancer.png");
      g_imgcache.add("mask_lancer", img_base + "/armor_lancer_mask.png");

      g_imgcache.add("floatskull", img_base + "/floatskull.png");
      g_imgcache.add("floatskull_tele", img_base + "/floatskull_tele.png");

      //g_imgcache.add("tele", img_base + "/tests/tele_test0.png");
      //g_imgcache.add("tele", img_base + "/tests/tele_test1.png");
      //g_imgcache.add("tele", img_base + "/tests/tele_test2.png");
      g_imgcache.add("tele", img_base + "/noether_tele.png");


      //g_imgcache.add("breath", img_base + "/breath.png");
      //g_imgcache.add("breath", img_base + "/breath2.png");

      g_imgcache.add("dust", img_base + "/dust_black.png");
      g_imgcache.add("grundge", img_base + "/grundge.png");
      g_imgcache.add("rain", img_base + "/rain8.png");
      g_imgcache.add("rain_impact", img_base + "/rain_impact.png");

      g_imgcache.add("big_cloud0", img_base + "/big_cloud0.png");
      g_imgcache.add("big_cloud1", img_base + "/big_cloud0.png");

      g_imgcache.add("cat", img_base + "/catxperiment2.png");

      g_imgcache.add("bubble", img_base + "/speech_thought_bubble8.png");
      //g_imgcache.add("font", img_base + "/font_attempt3.png");
      g_imgcache.add("font", img_base + "/font_attempt4.png");

      /*
      var welcome_music = new Howl({
          urls: ['assets/music/mark.nine-the-little-things-02-devil-you-know.ogg'],
          //autoplay: true,
          onened: function() { console.log("finish music"); }
      });
      */

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

      g_sfx["player-hit"] = [];
      g_sfx["player-hit"].push( new_sound_object("assets/sfx/215496__spankmyfilth__28-blips-trails-spankmyfilth.ogg") );
      g_sfx["player-hit"].push( new_sound_object("assets/sfx/215486__spankmyfilth__47-blips-trails-spankmyfilth.ogg") );
      g_sfx["player-hit"].push( new_sound_object("assets/sfx/215497__spankmyfilth__29-blips-trails-spankmyfilth.ogg") );
      g_sfx["player-hit"].push( new_sound_object("assets/sfx/215510__spankmyfilth__53-blips-trails-spankmyfilth.ogg") );

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

      g_sfx["arrow-shoot"] = [];
      g_sfx["arrow-shoot"].push( new_sound_object("assets/sfx/49664__ejfortin__dual-energy-daggers-1.s.ogg") );
      g_sfx["arrow-shoot"].push( new_sound_object("assets/sfx/49663__ejfortin__dual-energy-daggers-4.s.ogg") );
      g_sfx["arrow-shoot"].push( new_sound_object("assets/sfx/49666__ejfortin__dual-energy-daggers-3.s.ogg") );
      g_sfx["arrow-shoot"].push( new_sound_object("assets/sfx/49669__ejfortin__dual-energy-daggers-7.s.ogg") );
      g_sfx["arrow-shoot"].push( new_sound_object("assets/sfx/49667__ejfortin__dual-energy-daggers-5.s.ogg") );
      g_sfx["arrow-shoot"].push( new_sound_object("assets/sfx/49665__ejfortin__dual-energy-daggers-2.s.ogg") );
      g_sfx["arrow-shoot"].push( new_sound_object("assets/sfx/49668__ejfortin__dual-energy-daggers-6.s.ogg") );

      g_sfx["shield-hit"] = [];
      g_sfx["shield-hit"].push( new_sound_object("assets/sfx/164245__soniktec__metallic-sound-pack-1.ogg") );
      g_sfx["shield-hit"].push( new_sound_object("assets/sfx/164250__soniktec__metallic-sound-pack-16.ogg") );
      g_sfx["shield-hit"].push( new_sound_object("assets/sfx/164257__soniktec__metallic-sound-pack-19.ogg") );
      g_sfx["shield-hit"].push( new_sound_object("assets/sfx/164248__soniktec__metallic-sound-pack-12.ogg") );
      g_sfx["shield-hit"].push( new_sound_object("assets/sfx/164255__soniktec__metallic-sound-pack-7.ogg") );
      g_sfx["shield-hit"].push( new_sound_object("assets/sfx/164261__soniktec__metallic-sound-pack-22.ogg") );

      g_sfx["teleport"] = [];
      //g_sfx["teleport"].push( new_sound_object("assets/sfx/133279__fins__game-teleport.s.ogg", 0.25) );
      //g_sfx["teleport"].push( new_sound_object("assets/sfx/172206__fins__teleport.s.ogg", 0.25) );
      g_sfx["teleport"].push( new_sound_object("assets/sfx/51465__smcameron__flak-gun-sound.ogg", 0.75) );
      //g_sfx["teleport"].push( new_sound_object("assets/sfx/96556__robinhood76__01667-slow-laser-shot.ogg", 0.25));

      g_sfx["purr"] = [];

      setTimeout( function() {
        g_sfx["purr"].push( new_sound_object("assets/sfx/51810__kyles__kitten-meow-not-cute-purr.ogg", 0.75) );
        g_sfx["purr"].push( new_sound_object("assets/sfx/220949__islabonita__cat-purring.ogg", 0.75) );
      }, 10*1000);

      g_sfx["rain"] = [];
      g_sfx["rain"].push( new_sound_object("assets/sfx/157433__timgormly__medium-rain.ogg", 0.75, true) );
      g_sfx["rain"].push( new_sound_object("assets/sfx/157433__timgormly__medium-rain.ogg", 0.75, true) );

      g_sfx["wind"] = [];
      //g_sfx["wind"].push(  new_sound_object("assets/sfx/106134__j1987__windynight.ogg") );
      g_sfx["wind"].push(  new_sound_object("assets/sfx/106134__j1987__windynight_clipped_s6.ogg", 0.75) );

      g_sfx["wave"] = [];
      setTimeout( function() { g_sfx["wave"].push( new_sound_object("assets/sfx/254857__afeeto__waves-against-shore.ogg", 0.75, true) ); }, 10*1000 );
      //g_sfx["wave"].push( new_sound_object("assets/sfx/254857__afeeto__waves-against-shore.ogg", 0.5, true) );

      g_sfx["boss-pain"] = [];
      g_sfx["boss-pain"].push( new_sound_object("assets/sfx/36588__kathakaku__mike-gabber-intro.ogg") );

      g_sfx["boss-death"] = [];
      g_sfx["boss-death"].push( new_sound_object("assets/sfx/215507__spankmyfilth__67-blips-trails-spankmyfilth.ogg") );

      g_sfx["fuzz"] = [];
      //g_sfx["fuzz"].push( new_sound_object("assets/sfx/85282__blackie666__bd-8-bits-16.ogg", 0.5));
      g_sfx["fuzz"].push( new_sound_object("assets/sfx/85284__blackie666__bd-8-bits-3.ogg", 0.5));
      g_sfx["fuzz"].push( new_sound_object("assets/sfx/85285__blackie666__bd-8-bits-4.ogg", 0.5));
      g_sfx["fuzz"].push( new_sound_object("assets/sfx/85286__blackie666__bd-8-bits-5.ogg", 0.5));
      g_sfx["fuzz"].push( new_sound_object("assets/sfx/85287__blackie666__bd-8-bits-6.ogg", 0.5));
      g_sfx["fuzz"].push( new_sound_object("assets/sfx/85289__blackie666__bd-8-bits-8.ogg", 0.5));
      g_sfx["fuzz"].push( new_sound_object("assets/sfx/85290__blackie666__bd-8-bits-9.ogg", 0.5));


      g_sfx["jade-attack"] = [];
      g_sfx["jade-attack"].push( new_sound_object("assets/sfx/277214__thedweebman__8-bit-powerup-get-something-big.ogg"));

      g_sfx["jade-attack0"] = [];
      g_sfx["jade-attack0"].push( new_sound_object("assets/sfx/187406__mazk1985__laser-active-small.ogg", 0.25));


      g_sfx["item-appear"] = [];
      g_sfx["item-appear"].push( new_sound_object("assets/sfx/216864__goac0re1__0003-2-audio-1.ogg") );

      g_sfx["powerup"] = [];
      g_sfx["powerup"].push( new_sound_object("assets/sfx/277214__thedweebman__8-bit-powerup-get-something-big.ogg") );

      g_sfx["breath"] = [];
      g_sfx["breath"].push( new_sound_object("assets/sfx/60571__gabemiller74__breathofdeath.ogg") );

      g_sfx["magic"] = [];
      g_sfx["magic"].push( new_sound_object("assets/sfx/115141__v0idation__fx-time-freeze.ogg") );
      g_sfx["magic"].push( new_sound_object("assets/sfx/151257__michael-kur95__strange.ogg") );




      g_music = {};
      //g_music["home"] = new_sound_object("assets/music/mark.nine-the-little-things-02-devil-you-know.mp3");
      //g_music["home-ambient"] = new_sound_object("assets/music/317363__frankum__ambient-electronic-loop-001.mp3");
      //g_music["disturbance"] = new_sound_object("assets/music/131005__reacthor__the-emperor-s-starfleet.ogg");
      //g_music["dolor-ambient"] = new_sound_object("assets/music/Graham_Bole_-_05_-_Sunset_At_Goat_Fell.ogg");
      //g_music["dolor-ambient"] = new_sound_object("assets/music/317363__frankum__ambient-electronic-loop-001.ogg");
      //g_music["start-ambient"] = new_sound_object("assets/music/Mark.Nine_The_Little_Things_01_Lighthouse_District.ogg");


      setTimeout( function() { console.log("A"); g_music["item-1"] = new_sound_object("assets/music/Airglow_-_04_-_Blueshift.mp3"); }, 1000*30 );
      setTimeout( function() { console.log("B"); g_music["item-2"] = new_sound_object("assets/music/Airglow_-_06_-_Lisa.mp3"); }, 1000*60 );
      setTimeout( function() { console.log("C"); g_music["item-3"] = new_sound_object("assets/music/Airglow_-_07_-_New_Touch.mp3"); }, 1000*90 );
      setTimeout( function() { console.log("D"); g_music["item-4"] = new_sound_object("assets/music/Airglow_-_09_-_Innermission.mp3"); }, 1000*120 );

      /*
      setTimeout( function() { g_music["item-1"] = new_sound_object("assets/music/Airglow_-_04_-_Blueshift.mp3"); }, 1000*30 );
      setTimeout( function() { g_music["item-2"] = new_sound_object("assets/music/Airglow_-_06_-_Lisa.mp3"); }, 1000*60 );
      setTimeout( function() { g_music["item-3"] = new_sound_object("assets/music/Airglow_-_07_-_New_Touch.mp3"); }, 1000*90 );
      setTimeout( function() { g_music["item-4"] = new_sound_object("assets/music/Airglow_-_09_-_Innermission.mp3"); }, 1000*120 );
      */


      //welcome_music.play();

      $.ajax({
        url: "assets/dungeon_jade.json",
        dataType:"json",
        success: function(a,b,c) {
          g_data["dungeonJade"] = a;

          g_level_dungeon_jade.tilemap = a;
          g_level_dungeon_jade.ready = true;
          g_level_dungeon_jade.init();

          g_level_cache["dungeon_jade"] = g_level_dungeon_jade;
        },
        error: function(e) {
          console.log("err", e);
        }
      });

      $.ajax({
        url: "assets/dungeon_aqua.json",
        dataType:"json",
        success: function(a,b,c) {
          g_data["dungeonAqua"] = a;

          g_level_dungeon_aqua.tilemap = a;
          g_level_dungeon_aqua.ready = true;
          g_level_dungeon_aqua.init();

          g_level_cache["dungeon_aqua"] = g_level_dungeon_aqua;
        },
        error: function(e) {
          console.log("err", e);
        }
      });

      $.ajax({
        url: "assets/dungeon_bone.json",
        dataType:"json",
        success: function(a,b,c) {
          g_data["dungeonBone"] = a;

          g_level_dungeon_bone.tilemap = a;
          g_level_dungeon_bone.ready = true;
          g_level_dungeon_bone.init();

          g_level_cache["dungeon_bone"] = g_level_dungeon_bone;
        },
        error: function(e) {
          console.log("err", e);
        }
      });

      $.ajax({
        url: "assets/dungeon_blood.json",
        dataType:"json",
        success: function(a,b,c) {
          g_data["dungeonBlood"] = a;

          g_level_dungeon_blood.tilemap = a;
          g_level_dungeon_blood.ready = true;
          g_level_dungeon_blood.init();

          g_level_cache["dungeon_blood"] = g_level_dungeon_blood;
        },
        error: function(e) {
          console.log("err", e);
        }
      });

      $.ajax({
        url: "assets/dolor.json",
        //url: "assets/dolor_beg.json",
        dataType:"json",
        success: function(a,b,c) {
          g_data["dolor"] = a;

          g_level_dolor.tilemap = a;
          g_level_dolor.ready = true;
          g_level_dolor.init();

          g_level_cache["dolor"] = g_level_dolor;

          //g_world.ready = true;
          g_world.level = g_level_dolor;

          g_world.init();

          register_load("dolor");
        },
        error: function(e) { console.log("err", e); }
      });

      $.ajax({
        url: "assets/level_library.json",
        dataType:"json",
        success: function(a,b,c) {
          g_data["level_library"] = a;

          g_level_library.tilemap = a;
          g_level_library.ready = true;
          g_level_library.init();

          g_level_cache["level_library"] = g_level_library;
        },
        error: function(e) { console.log("err", e); }
      });

      g_level_alpha = new levelAlpha();
      $.ajax({
        url: "assets/level_alpha.json",
        dataType:"json",
        success: function(a,b,c) {
          g_data["level_alpha"] = a;

          g_level_alpha.tilemap = a;
          g_level_alpha.ready = true;
          g_level_alpha.init();

          g_level_cache["level_alpha"] = g_level_alpha;
        },
        error: function(e) { console.log("err", e); }
      });

      g_level_beta = new levelBeta();
      $.ajax({
        url: "assets/level_beta.json",
        dataType:"json",
        success: function(a,b,c) {
          g_data["level_beta"] = a;

          g_level_beta.tilemap = a;
          g_level_beta.ready = true;
          g_level_beta.init();

          g_level_cache["level_beta"] = g_level_beta;
        },
        error: function(e) { console.log("err", e); }
      });


      g_level_gamma = new levelGamma();
      $.ajax({
        url: "assets/level_gamma.json",
        dataType:"json",
        success: function(a,b,c) {
          g_data["level_gamma"] = a;

          g_level_gamma.tilemap = a;
          g_level_gamma.ready = true;
          g_level_gamma.init();

          g_level_cache["level_gamma"] = g_level_gamma;
        },
        error: function(e) { console.log("err", e); }
      });

      g_level_delta = new levelDelta();
      $.ajax({
        url: "assets/level_delta.json",
        dataType:"json",
        success: function(a,b,c) {
          g_data["level_delta"] = a;

          g_level_delta.tilemap = a;
          g_level_delta.ready = true;
          g_level_delta.init();

          g_level_cache["level_delta"] = g_level_delta;
        },
        error: function(e) { console.log("err", e); }
      });


      g_level_overworld = new homeLevel();
      $.ajax({
        url: "assets/exia_overworld.json",
        dataType:"json",
        success: function(a,b,c) {
          g_data["homeArea"] = a;

          g_level_overworld.tilemap = a;
          g_level_overworld.ready = true;
          g_level_overworld.init();

          g_level_cache["overworld"] = g_level_overworld;

          g_level_overworld.meta_map(28, function(dat, x, y) {
            //var neko = new creatureNeko();
            //neko.init(x,y);
          });

          register_load("overworld");


          /*
          g_world.ready = true;
          g_world.level = g_level_overworld;

          g_level_overworld.meta_map(0, function(dat, x, y) {
            var bones = new creatureBones();
            bones.init(x,y);
            g_world.enemy.push(bones);
          });

          g_level_overworld.meta_map(1, function(dat, x, y) {
            var horns = new creatureHorns();
            horns.init(x,y);
            g_world.enemy.push(horns);
          });

          g_level_overworld.meta_map(27, function(dat, x, y) {
            g_player.x = x;
            g_player.y = y;
          });

          g_world.init();
          */
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
      //g_game_controller.level = g_level;
      g_game_controller.level = g_level_overworld;
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
