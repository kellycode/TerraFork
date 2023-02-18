/* global NTS_GMATH */

// require
(function () {
    function r(e, n, t) {
        function o(i, f) {
            if (!n[i]) {
                if (!e[i]) {
                    var c = "function" === typeof require && require;
                    if (!f && c)
                        return c(i, !0);
                    if (u)
                        return u(i, !0);
                    var a = new Error("Cannot find module '" + i + "'");
                    throw a.code = "MODULE_NOT_FOUND", a
                }
                var p = n[i] = {exports: {}};
                e[i][0].call(p.exports, function (r) {
                    var n = e[i][1][r];
                    return o(n || r)
                }, p, p.exports, r, e, n, t)
            }
            return n[i].exports
        }
        for (var u = "function" == typeof require && require, i = 0; i < t.length; i++)
            o(t[i]);
        return o
    }
    return r
})()


      ({
          1: [function (require, module, exports) {/*anim.js*/
              }, {}],

          2: [function (require, module, exports) {/*app.js*/
                  "use strict";
                  var __importDefault = (this && this.__importDefault) || function (mod) {
                      return (mod && mod.__esModule) ? mod : {"default": mod};
                  };
                  var __importStar = (this && this.__importStar) || function (mod) {
                      if (mod && mod.__esModule)
                          return mod;
                      var result = {};
                      if (mod != null)
                          for (var k in mod)
                              if (Object.hasOwnProperty.call(mod, k))
                                  result[k] = mod[k];
                      result["default"] = mod;
                      return result;
                  };
                  Object.defineProperty(exports, "__esModule", {value: true});
                  var util_1 = NTS_UTIL;
                  var loader_1 = NTS_LOADER;
                  var input = NTS_INPUT;
                  var anim = NTS_ANIM;
                  var fullscreen = NTS_FULLSCREEN;//__importStar(require("./fullscreen"));
                  var world_1 = __importDefault(require("./world"));
// circa 2016
                  var CONFIGS = {
                      mobile: {blades: 20000, depth: 50.0, antialias: false},
                      laptop: {blades: 40000, depth: 65.0, antialias: false},
                      desktop: {blades: 84000, depth: 85.0, antialias: true},
                      desktop2: {blades: 250000, depth: 125.0, antialias: true},
                      gamerig: {blades: 500000, depth: 175.0, antialias: true}
                  };
                  /**
                   * Create App instance
                   */
                  function App() {
                      // DOM element containing canvas
                      var container = util_1.$e('app_canvas_container');
                      // Will be set correctly later
                      var displayWidth = 640;
                      var displayHeight = 480;
                      var assets;
                      var world;
                      var isFullscreen = fullscreen.is();
                      /**
                       *  Call this when HTML page elements are loaded & ready
                       */
                      function run() {
                          if (!util_1.$e('app_canvas_container')) {
                              console.error("app_canvas_container element not found in page");
                              return false;
                          }
                          if (!util_1.detectWebGL()) {
                              util_1.$e('loading_text').textContent = "WebGL unavailable.";
                              return false;
                          }
                          resize();
                          loadAssets();
                          configUI();
                          window.addEventListener('resize', resize, false);
                          return true;
                      }
                      /**
                       * Configuration UI input handlers
                       */
                      function configUI() {
                          // Select a config roughly based on device type
                          var cfgId = NTS_BROWSER.isMobile.any ? 'mobile' : 'desktop';
                          var cfg = CONFIGS[cfgId];
                          var sel = util_1.$i('sel_devicepower');
                          sel.value = cfgId;
                          var inp_blades = util_1.$i('inp_blades');
                          inp_blades.value = cfg.blades.toString();
                          var inp_depth = util_1.$i('inp_depth');
                          inp_depth.value = cfg.depth.toString();
                          util_1.$i('chk_antialias').checked = cfg.antialias;
                          util_1.$i('chk_fullscreen').checked = false;
                          util_1.$i('chk_fullscreen').onchange = function () {
                              fullscreen.toggle(util_1.$e('app_container'));
                          };
                          sel.onchange = function (e) {
                              var cfg = CONFIGS[sel.value];
                              var b = cfg.blades.toString();
                              var d = cfg.depth.toString();
                              inp_blades.value = b;
                              inp_depth.value = d;
                              util_1.$e('txt_blades').textContent = b;
                              util_1.$e('txt_depth').textContent = d;
                              util_1.$i('chk_antialias').checked = cfg.antialias;
                          };
                          util_1.$e('txt_blades').textContent = cfg.blades.toString();
                          util_1.$e('txt_depth').textContent = cfg.depth.toString();
                          inp_blades.onchange = function (e) {
                              util_1.$e('txt_blades').textContent = inp_blades.value;
                          };
                          inp_depth.onchange = function (e) {
                              util_1.$e('txt_depth').textContent = inp_depth.value;
                          };
                      }
                      function loadAssets() {

                          let onAssetsDone = function () {
                              //console.log('onAssetsDone called or, have we, as \'twere with a defeated joy loaded all assets');
                          };

                          let onAssetsProgress = function (p) {
                              //console.log('onAssetsProgress');
                              var pct = Math.floor(p * 90);
                              util_1.$e('loading_bar').style.width = pct + '%';
                          };

                          let onAssetsError = function (e) {
                              //console.log('onAssetsError');
                              util_1.$e('loading_text').textContent = e;
                          };

                          let onAssetsLoaded = function (a) {
                              //console.log('onAssetsLoaded');
                              assets = a;
                              util_1.$e('loading_bar').style.width = '100%';
                              util_1.$e('loading_text').innerHTML = "&nbsp;";
                              setTimeout(function () {
                                  util_1.$e('loading_bar_outer').style.visibility = 'hidden';
                                  util_1.$e('config_block').style.visibility = 'visible';
                                  util_1.$e('btn_start').onclick = function () {
                                      anim.fadeOut(util_1.$e('loading_block'), 80, function () {
                                          util_1.$e('loading_block').style.display = 'none';
                                          util_1.$e('app_ui_container').style.backgroundColor = 'transparent';
                                          if (!isFullscreen) {
                                              util_1.$e('title_bar').style.display = 'block';
                                          }
                                          util_1.$e('btn_fullscreen').onclick = function () {
                                              fullscreen.toggle(util_1.$e('app_container'));
                                          };
                                          util_1.$e('btn_restart').onclick = function () {
                                              document.location.reload();
                                          };
                                          start();
                                      });
                                  };
                              }, 10);
                          };

                          loader_1.load({
                              text: [
                                  {name: 'grass.vert', url: 'shader/grass.vert.glsl'},
                                  {name: 'grass.frag', url: 'shader/grass.frag.glsl'},
                                  {name: 'terrain.vert', url: 'shader/terrain.vert.glsl'},
                                  {name: 'terrain.frag', url: 'shader/terrain.frag.glsl'},
                                  {name: 'water.vert', url: 'shader/water.vert.glsl'},
                                  {name: 'water.frag', url: 'shader/water.frag.glsl'}
                              ],
                              images: [
                                  {name: 'heightmap', url: 'data/heightmap.jpg'},
                                  {name: 'noise', url: 'data/noise.jpg'}
                              ],
                              textures: [
                                  {name: 'grass', url: 'data/grass.jpg'},
                                  {name: 'terrain1', url: 'data/terrain1.jpg'},
                                  {name: 'terrain2', url: 'data/terrain2.jpg'},
                                  {name: 'skydome', url: 'data/skydome.jpg'},
                                  {name: 'skyenv', url: 'data/skyenv.jpg'}
                              ]
                          }, onAssetsLoaded, onAssetsProgress, onAssetsError, onAssetsDone);
                      }

                      /**
                       *  All stuff loaded, setup event handlers & start the app...
                       */
                      function start() {
                          if (util_1.$i('chk_audio').checked) {
                              var au = util_1.$e('chopin');
                              au.loop = true;
                              au.play();
                          }
                          input.init();
                          // Get detail settings from UI inputs
                          var numGrassBlades = +(util_1.$i('inp_blades').value);
                          var grassPatchRadius = +(util_1.$i('inp_depth').value);
                          var antialias = !!(util_1.$i('chk_antialias').checked);
                          // Create an instance of the world
                          world = world_1.default(assets, numGrassBlades, grassPatchRadius, displayWidth, displayHeight, antialias);
                          // Start our animation loop
                          doFrame();
                      }
                      function doFrame() {
                          // keep animation loop running
                          world.doFrame();
                          requestAnimationFrame(doFrame);
                      }
                      /** Handle window resize events */
                      function resize() {
                          displayWidth = container.clientWidth;
                          displayHeight = container.clientHeight;
                          if (world) {
                              world.resize(displayWidth, displayHeight);
                          } else {
                              var canvas = util_1.$e('app_canvas');
                              canvas.width = displayWidth;
                              canvas.height = displayHeight;
                          }
                          // Seems to be a good place to check for fullscreen toggle.
                          var fs = fullscreen.is();
                          if (fs !== isFullscreen) {
                              // Show/hide the UI when switching windowed/FS mode.
                              util_1.$e('title_bar').style.display = fs ? 'none' : 'block';
                              isFullscreen = fs;
                          }
                      }
                      //  Return public interface
                      return {
                          run: run
                      };
                  }
                  exports.default = App;

              }, {"./fullscreen": 5, "./world": 22}],

          3: [function (require, module, exports) {/*browser.js*/
              }, {}],

          4: [function (require, module, exports) {/*fps.js*/
              }, {}],

          5: [function (require, module, exports) {/*fullscreen.js*/
              }, {}],

          6: [function (require, module, exports) {/*gmath.js*/
              }, {}],

          7: [function (require, module, exports) {/*grass.js*/
              }, {}],

          8: [function (require, module, exports) {/*heightfield.js*/
              }, {}],

          9: [function (require, module, exports) {/*input.js*/
              }, {}],

          10: [function (require, module, exports) {/*loader.js*/
              }, {}],

          11: [function (require, module, exports) {/*logger.js*/
              }, {}],

          12: [function (require, module, exports) {/*main.js*/
                  "use strict";
                  var __importDefault = (this && this.__importDefault) || function (mod) {
                      return (mod && mod.__esModule) ? mod : {"default": mod};
                  };
                  Object.defineProperty(exports, "__esModule", {value: true});
                  var app_1 = __importDefault(require("./app"));
                  app_1.default().run();

              }, {"./app": 2}],

          13: [function (require, module, exports) {/*notification.js*/
              }, {}],

          14: [function (require, module, exports) {/*player.js*/}, {}],

          15: [function (require, module, exports) {/*simplex.js*/
              }, {}],

          16: [function (require, module, exports) {/*skydome.js*/
              }, {}],

          17: [function (require, module, exports) {/*terrain.js*/}, {}],

          18: [function (require, module, exports) {/*terramap.js*/
              }, {}],

          19: [function () {/*util.js*/
              }, {}],

          20: [function (require, module, exports) {/*vec.js*/
              }, {}],

          21: [function (require, module, exports) {/*water.js*/
              }, {}],

          22: [function (require, module, exports) {/*world.js*/
                  "use strict";
                  // Copyright (c) 2016 by Mike Linkovich
                  var __importStar = (this && this.__importStar) || function (mod) {
                      if (mod && mod.__esModule)
                          return mod;
                      var result = {};
                      if (mod != null)
                          for (var k in mod)
                              if (Object.hasOwnProperty.call(mod, k))
                                  result[k] = mod[k];
                      result["default"] = mod;
                      return result;
                  };
                  var __importDefault = (this && this.__importDefault) || function (mod) {
                      return (mod && mod.__esModule) ? mod : {"default": mod};
                  };
                  Object.defineProperty(exports, "__esModule", {value: true});
                  /// <reference path="types/three-global.d.ts" />
                  var util_1 = NTS_UTIL;
                  var gmath_1 = NTS_GMATH;
                  var vec_1 = NTS_VEC;
                  var logger = NTS_LOGGER;
                  var input = NTS_INPUT;
                  var skydome = NTS_SKYDOME;
                  var heightfield_2 = NTS_HEIGHTFIELD;
                  var grass = NTS_GRASS.init();
                  var terrain_1 = NTS_TERRAIN;
                  var terramap = NTS_TERRAMAP;
                  var water = NTS_WATER;
                  //var player_1 = __importDefault(require("./player"));
                  var fps_1 = NTS_FPS;
                  var VIEW_DEPTH = 2000.0;
                  var MAX_TIMESTEP = 67; // max 67 ms/frame
                  var HEIGHTFIELD_SIZE = 3072.0;
                  var HEIGHTFIELD_HEIGHT = 180.0;
                  var WATER_LEVEL = HEIGHTFIELD_HEIGHT * 0.305556; // 55.0
                  var BEACH_TRANSITION_LOW = 0.31;
                  var BEACH_TRANSITION_HIGH = 0.36;
                  var LIGHT_DIR = vec_1.Vec3.create(0.0, 1.0, -1.0);
                  vec_1.Vec3.normalize(LIGHT_DIR, LIGHT_DIR);
                  var FOG_COLOR = vec_1.Color.create(0.74, 0.77, 0.91);
                  var GRASS_COLOR = vec_1.Color.create(0.45, 0.46, 0.19);
                  var WATER_COLOR = vec_1.Color.create(0.6, 0.7, 0.85);
                  var WIND_DEFAULT = 1.5;
                  var WIND_MAX = 3.0;
                  var MAX_GLARE = 0.25; // max glare effect amount
                  var GLARE_RANGE = 1.1; // angular range of effect
                  var GLARE_YAW = Math.PI * 1.5; // yaw angle when looking directly at sun
                  var GLARE_PITCH = 0.2; // pitch angle looking at sun
                  var GLARE_COLOR = vec_1.Color.create(1.0, 0.8, 0.4);
                  var INTRO_FADE_DUR = 2000;

                  /**
                   * Create a World instance
                   */
                  function World(assets, numGrassBlades, grassPatchRadius, displayWidth, displayHeight, antialias) {
                      var canvas = util_1.$e('app_canvas');
                      // Make canvas transparent so it isn't rendered as black for 1 frame at startup
                      var renderer = new THREE.WebGLRenderer({
                          canvas: canvas, antialias: antialias, clearColor: 0xFFFFFF, clearAlpha: 1, alpha: true
                      });
                      if (!renderer) {
                          throw new Error("Failed to create THREE.WebGLRenderer");
                      }
                      // Setup some render values based on provided configs
                      var fogDist = grassPatchRadius * 20.0;
                      var grassFogDist = grassPatchRadius * 2.0;
                      var camera = new THREE.PerspectiveCamera(45, displayWidth / displayHeight, 1.0, VIEW_DEPTH);
                      var meshes = {
                          terrain: null, grass: null, sky: null, water: null, sunFlare: null, fade: null
                      };
                      var scene = new THREE.Scene();
                      scene.fog = new THREE.Fog(vec_1.Color.to24bit(FOG_COLOR), 0.1, fogDist);
                      // Setup the camera so Z is up.
                      // Then we have cartesian X,Y coordinates along ground plane.
                      camera.rotation.order = "ZXY";
                      camera.rotation.x = Math.PI * 0.5;
                      camera.rotation.y = Math.PI * 0.5;
                      camera.rotation.z = Math.PI;
                      camera.up.set(0.0, 0.0, 1.0);
                      // Put camera in an object so we can transform it normally
                      var camHolder = new THREE.Object3D();
                      camHolder.rotation.order = "ZYX";
                      camHolder.add(camera);
                      scene.add(camHolder);
                      // Setup heightfield
                      var hfImg = assets.images['heightmap'];
                      var hfCellSize = HEIGHTFIELD_SIZE / hfImg.width;
                      var heightMapScale = vec_1.Vec3.create(1.0 / HEIGHTFIELD_SIZE, 1.0 / HEIGHTFIELD_SIZE, HEIGHTFIELD_HEIGHT);
                      var heightField = heightfield_2.Heightfield({
                          cellSize: hfCellSize,
                          minHeight: 0.0,
                          maxHeight: heightMapScale.z,
                          image: hfImg
                      });
                      hfImg = undefined;
                      var terraMap = terramap.createTexture(heightField, LIGHT_DIR, assets.images['noise']);
                      var windIntensity = WIND_DEFAULT;
                      // Create a large patch of grass to fill the foreground
                      meshes.grass = grass.createMesh({
                          lightDir: LIGHT_DIR,
                          numBlades: numGrassBlades,
                          radius: grassPatchRadius,
                          texture: assets.textures['grass'],
                          vertScript: assets.text['grass.vert'],
                          fragScript: assets.text['grass.frag'],
                          heightMap: terraMap,
                          heightMapScale: heightMapScale,
                          fogColor: FOG_COLOR,
                          fogFar: fogDist,
                          grassFogFar: grassFogDist,
                          grassColor: GRASS_COLOR,
                          transitionLow: BEACH_TRANSITION_LOW,
                          transitionHigh: BEACH_TRANSITION_HIGH,
                          windIntensity: windIntensity
                      });
                      // Set a specific render order - don't let three.js sort things for us.
                      meshes.grass.renderOrder = 10;
                      scene.add(meshes.grass);
                      // Terrain mesh
                      var terra = terrain_1.Terrain({
                          textures: [assets.textures['terrain1'], assets.textures['terrain2']],
                          vertScript: assets.text['terrain.vert'],
                          fragScript: assets.text['terrain.frag'],
                          heightMap: terraMap,
                          heightMapScale: heightMapScale,
                          fogColor: FOG_COLOR,
                          fogFar: fogDist,
                          grassFogFar: grassFogDist,
                          transitionLow: BEACH_TRANSITION_LOW,
                          transitionHigh: BEACH_TRANSITION_HIGH
                      });
                      meshes.terrain = terra.mesh;
                      meshes.terrain.renderOrder = 20;
                      scene.add(meshes.terrain);
                      // Skydome
                      meshes.sky = skydome.createMesh(assets.textures['skydome'], VIEW_DEPTH * 0.95);
                      meshes.sky.renderOrder = 30;
                      scene.add(meshes.sky);
                      meshes.sky.position.z = -25.0;
                      meshes.water = water.createMesh({
                          envMap: assets.textures['skyenv'],
                          vertScript: assets.text['water.vert'],
                          fragScript: assets.text['water.frag'],
                          waterLevel: WATER_LEVEL,
                          waterColor: WATER_COLOR,
                          fogColor: FOG_COLOR,
                          fogNear: 1.0,
                          fogFar: fogDist
                      });
                      meshes.water.renderOrder = 40;
                      scene.add(meshes.water);
                      meshes.water.position.z = WATER_LEVEL;
                      // White plane to cover screen for fullscreen fade-in from white
                      meshes.fade = new THREE.Mesh(new THREE.PlaneBufferGeometry(6.0, 4.0, 1, 1), new THREE.MeshBasicMaterial({
                          color: 0xFFFFFF, fog: false, transparent: true, opacity: 1.0,
                          depthTest: false, depthWrite: false
                      }));
                      meshes.fade.position.x = 2.0; // place directly in front of camera
                      meshes.fade.rotation.y = Math.PI * 1.5;
                      meshes.fade.renderOrder = 10;
                      camHolder.add(meshes.fade);
                      camHolder.renderOrder = 100;
                      // Bright yellow plane for sun glare using additive blending
                      // to blow out the colours
                      meshes.sunFlare = new THREE.Mesh(new THREE.PlaneBufferGeometry(6.0, 4.0, 1, 1), new THREE.MeshBasicMaterial({
                          color: vec_1.Color.to24bit(GLARE_COLOR), fog: false, transparent: true, opacity: 0.0,
                          depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending
                      }));
                      meshes.sunFlare.position.x = 2.05;
                      meshes.sunFlare.rotation.y = Math.PI * 1.5;
                      meshes.sunFlare.visible = false;
                      meshes.sunFlare.renderOrder = 20;
                      camHolder.add(meshes.sunFlare);
                      // Create a Player instance
                      var player = new NTS_PLAYER_C(heightField, WATER_LEVEL);
                      // For timing
                      var prevT = Date.now(); // prev frame time (ms)
                      var simT = 0; // total running time (ms)
                      resize(displayWidth, displayHeight);
                      // toggle logger on ` press
                      input.setKeyPressListener(192, function () {
                          logger.toggle();
                      });
                      input.setKeyPressListener('O'.charCodeAt(0), function () {
                          player.state.pos.x = 0;
                          player.state.pos.y = 0;
                      });
                      input.setKeyPressListener('F'.charCodeAt(0), function () {
                          windIntensity = Math.max(windIntensity - 0.1, 0);
                          var mat = meshes.grass.material;
                          mat.uniforms['windIntensity'].value = windIntensity;
                      });
                      input.setKeyPressListener('G'.charCodeAt(0), function () {
                          windIntensity = Math.min(windIntensity + 0.1, WIND_MAX);
                          var mat = meshes.grass.material;
                          mat.uniforms['windIntensity'].value = windIntensity;
                      });
                      var fpsMon = fps_1.FPSMonitor();
                      ///////////////////////////////////////////////////////////////////
                      // Public World instance methods
                      /**
                       * Call every frame
                       */
                      function doFrame() {
                          var curT = Date.now();
                          var dt = curT - prevT;
                          fpsMon.update(dt);
                          if (dt > 0) {
                              // only do computations if time elapsed
                              if (dt > MAX_TIMESTEP) {
                                  // don't exceed max timestep
                                  dt = MAX_TIMESTEP;
                                  prevT = curT - MAX_TIMESTEP;
                              }
                              // update sim
                              update(dt);
                              // render it
                              render();
                              // remember prev frame time
                              prevT = curT;
                          }
                      }
                      /** Handle window resize events */
                      function resize(w, h) {
                          displayWidth = w;
                          displayHeight = h;
                          renderer.setSize(displayWidth, displayHeight);
                          camera.aspect = displayWidth / displayHeight;
                          camera.updateProjectionMatrix();
                      }
                      ///////////////////////////////////////////////////////////////////
                      // Private instance methods
                      var _hinfo = heightfield_2.HInfo();
                      var _v = vec_1.Vec2.create(0.0, 0.0);
                      /**
                       * Logic update
                       */
                      function update(dt) {
                          // Intro fade from white
                          if (simT < INTRO_FADE_DUR) {
                              updateFade(dt);
                          }
                          simT += dt;
                          var t = simT * 0.001;
                          // Move player (viewer)
                          player.update(dt);
                          var ppos = player.state.pos;
                          var pdir = player.state.dir;
                          var pyaw = player.state.yaw;
                          var ppitch = player.state.pitch;
                          var proll = player.state.roll;
                          heightfield_2.infoAt(heightField, ppos.x, ppos.y, true, _hinfo);
                          var groundHeight = _hinfo.z;
                          if (logger.isVisible()) {
                              logger.setText("x:" + ppos.x.toFixed(4) +
                                    " y:" + ppos.y.toFixed(4) +
                                    " z:" + ppos.z.toFixed(4) +
                                    " dx:" + pdir.x.toFixed(4) +
                                    " dy:" + pdir.y.toFixed(4) +
                                    " dz:" + pdir.z.toFixed(4) +
                                    " height:" + groundHeight.toFixed(4) +
                                    " i:" + _hinfo.i +
                                    " fps:" + fpsMon.fps());
                          }
                          // Move skydome with player
                          meshes.sky.position.x = ppos.x;
                          meshes.sky.position.y = ppos.y;
                          // Update grass.
                          // Here we specify the centre position of the square patch to
                          // be drawn. That would be directly in front of the camera, the
                          // distance from centre to edge of the patch.
                          var drawPos = _v;
                          vec_1.Vec2.set(drawPos, ppos.x + Math.cos(pyaw) * grassPatchRadius, ppos.y + Math.sin(pyaw) * grassPatchRadius);
                          grass.update(meshes.grass, t, ppos, pdir, drawPos);
                          terrain_1.update(terra, ppos.x, ppos.y);
                          water.update(meshes.water, ppos);
                          // Update camera location/orientation
                          vec_1.Vec3.copy(ppos, camHolder.position);
                          //camHolder.position.z = ppos.z + groundHeight
                          camHolder.rotation.z = pyaw;
                          // Player considers 'up' pitch positive, but cam pitch (about Y) is reversed
                          camHolder.rotation.y = -ppitch;
                          camHolder.rotation.x = proll;
                          // Update sun glare effect
                          updateGlare();
                      }
                      /** Update how much glare effect by how much we're looking at the sun */
                      function updateGlare() {
                          var dy = Math.abs(gmath_1.difAngle(GLARE_YAW, player.state.yaw));
                          var dp = Math.abs(gmath_1.difAngle(GLARE_PITCH, player.state.pitch)) * 1.75;
                          var sunVisAngle = Math.sqrt(dy * dy + dp * dp);
                          if (sunVisAngle < GLARE_RANGE) {
                              var glare = MAX_GLARE * Math.pow((GLARE_RANGE - sunVisAngle) / (1.0 + MAX_GLARE), 0.75);
                              meshes.sunFlare.material.opacity = Math.max(0.0, glare);
                              meshes.sunFlare.visible = true;
                          } else {
                              meshes.sunFlare.visible = false;
                          }
                      }
                      /** Update intro fullscreen fade from white */
                      function updateFade(dt) {
                          var mat = meshes.fade.material;
                          if (simT + dt >= INTRO_FADE_DUR) {
                              // fade is complete - hide cover
                              mat.opacity = 0.0;
                              meshes.fade.visible = false;
                          } else {
                              // update fade opacity
                              mat.opacity = 1.0 - Math.pow(simT / INTRO_FADE_DUR, 2.0);
                          }
                      }
                      function render() {
                          renderer.render(scene, camera);
                      }
                      ///////////////////////////////////////////////////////////////////
                      // Return public interface
                      return {
                          doFrame: doFrame,
                          resize: resize
                      };
                  }
                  exports.default = World;

              }, {}]}, {}, [12]);
