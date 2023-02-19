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
                  var fullscreen = NTS_FULLSCREEN;
                  var WORLD = NTS_WORLD_C;
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
                          world = new WORLD(assets, numGrassBlades, grassPatchRadius, displayWidth, displayHeight, antialias);
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

              }, {}],

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
                  var app_1 = new NTS_APP_C();//__importDefault(require("./app"));
                  app_1.run();

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

          22: [function (require, module, exports) {/*world.js*/}, {}]}, {}, [12]);
