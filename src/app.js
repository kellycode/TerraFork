"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var loader_1 = __importDefault(require("./loader"));
var input = __importStar(require("./input"));
var anim = __importStar(require("./anim"));
var fullscreen = __importStar(require("./fullscreen"));
var browser = __importStar(require("./browser"));
var world_1 = __importDefault(require("./world"));
// circa 2016
var CONFIGS = {
    mobile: { blades: 20000, depth: 50.0, antialias: false },
    laptop: { blades: 40000, depth: 65.0, antialias: false },
    desktop: { blades: 84000, depth: 85.0, antialias: true },
    desktop2: { blades: 250000, depth: 125.0, antialias: true },
    gamerig: { blades: 500000, depth: 175.0, antialias: true }
};
/**
 * Create App instance
 */
function App() {
    // DOM element containing canvas
    var container = (0, util_1.$e)('app_canvas_container');
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
        if (!(0, util_1.$e)('app_canvas_container')) {
            console.error("app_canvas_container element not found in page");
            return false;
        }
        if (!(0, util_1.detectWebGL)()) {
            (0, util_1.$e)('loading_text').textContent = "WebGL unavailable.";
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
        var cfgId = browser.isMobile.any ? 'mobile' : 'desktop';
        var cfg = CONFIGS[cfgId];
        var sel = (0, util_1.$i)('sel_devicepower');
        sel.value = cfgId;
        var inp_blades = (0, util_1.$i)('inp_blades');
        inp_blades.value = cfg.blades.toString();
        var inp_depth = (0, util_1.$i)('inp_depth');
        inp_depth.value = cfg.depth.toString();
        (0, util_1.$i)('chk_antialias').checked = cfg.antialias;
        (0, util_1.$i)('chk_fullscreen').checked = false;
        (0, util_1.$i)('chk_fullscreen').onchange = function () {
            fullscreen.toggle((0, util_1.$e)('app_container'));
        };
        sel.onchange = function (e) {
            var cfg = CONFIGS[sel.value];
            var b = cfg.blades.toString();
            var d = cfg.depth.toString();
            inp_blades.value = b;
            inp_depth.value = d;
            (0, util_1.$e)('txt_blades').textContent = b;
            (0, util_1.$e)('txt_depth').textContent = d;
            (0, util_1.$i)('chk_antialias').checked = cfg.antialias;
        };
        (0, util_1.$e)('txt_blades').textContent = cfg.blades.toString();
        (0, util_1.$e)('txt_depth').textContent = cfg.depth.toString();
        inp_blades.onchange = function (e) {
            (0, util_1.$e)('txt_blades').textContent = inp_blades.value;
        };
        inp_depth.onchange = function (e) {
            (0, util_1.$e)('txt_depth').textContent = inp_depth.value;
        };
    }
    function loadAssets() {
        var loader = (0, loader_1.default)();
        loader.load({
            text: [
                { name: 'grass.vert', url: 'shader/grass.vert.glsl' },
                { name: 'grass.frag', url: 'shader/grass.frag.glsl' },
                { name: 'terrain.vert', url: 'shader/terrain.vert.glsl' },
                { name: 'terrain.frag', url: 'shader/terrain.frag.glsl' },
                { name: 'water.vert', url: 'shader/water.vert.glsl' },
                { name: 'water.frag', url: 'shader/water.frag.glsl' }
            ],
            images: [
                { name: 'heightmap', url: 'data/heightmap.jpg' },
                { name: 'noise', url: 'data/noise.jpg' }
            ],
            textures: [
                { name: 'grass', url: 'data/grass.jpg' },
                { name: 'terrain1', url: 'data/terrain1.jpg' },
                { name: 'terrain2', url: 'data/terrain2.jpg' },
                { name: 'skydome', url: 'data/skydome.jpg' },
                { name: 'skyenv', url: 'data/skyenv.jpg' }
            ]
        }, onAssetsLoaded, onAssetsProgress, onAssetsError);
    }
    function onAssetsProgress(p) {
        var pct = Math.floor(p * 90);
        (0, util_1.$e)('loading_bar').style.width = pct + '%';
    }
    function onAssetsError(e) {
        (0, util_1.$e)('loading_text').textContent = e;
    }
    function onAssetsLoaded(a) {
        assets = a;
        (0, util_1.$e)('loading_bar').style.width = '100%';
        (0, util_1.$e)('loading_text').innerHTML = "&nbsp;";
        setTimeout(function () {
            (0, util_1.$e)('loading_bar_outer').style.visibility = 'hidden';
            (0, util_1.$e)('config_block').style.visibility = 'visible';
            (0, util_1.$e)('btn_start').onclick = function () {
                anim.fadeOut((0, util_1.$e)('loading_block'), 80, function () {
                    (0, util_1.$e)('loading_block').style.display = 'none';
                    if (!isFullscreen) {
                        (0, util_1.$e)('title_bar').style.display = 'block';
                    }
                    (0, util_1.$e)('btn_fullscreen').onclick = function () {
                        fullscreen.toggle((0, util_1.$e)('app_container'));
                    };
                    (0, util_1.$e)('btn_restart').onclick = function () {
                        document.location.reload();
                    };
                    start();
                });
            };
        }, 10);
    }
    /**
     *  All stuff loaded, setup event handlers & start the app...
     */
    function start() {
        if ((0, util_1.$i)('chk_audio').checked) {
            var au = (0, util_1.$e)('chopin');
            au.loop = true;
            au.play();
        }
        input.init();
        // Get detail settings from UI inputs
        var numGrassBlades = +((0, util_1.$i)('inp_blades').value);
        var grassPatchRadius = +((0, util_1.$i)('inp_depth').value);
        var antialias = !!((0, util_1.$i)('chk_antialias').checked);
        // Create an instance of the world
        world = (0, world_1.default)(assets, numGrassBlades, grassPatchRadius, displayWidth, displayHeight, antialias);
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
        }
        else {
            var canvas = (0, util_1.$e)('app_canvas');
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }
        // Seems to be a good place to check for fullscreen toggle.
        var fs = fullscreen.is();
        if (fs !== isFullscreen) {
            // Show/hide the UI when switching windowed/FS mode.
            (0, util_1.$e)('title_bar').style.display = fs ? 'none' : 'block';
            isFullscreen = fs;
        }
    }
    //  Return public interface
    return {
        run: run
    };
}
exports.default = App;
