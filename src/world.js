"use strict";
// Copyright (c) 2016 by Mike Linkovich
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
/// <reference path="types/three-global.d.ts" />
var util_1 = require("./util");
var gmath_1 = require("./gmath");
var vec_1 = require("./vec");
var logger = __importStar(require("./logger"));
var input = __importStar(require("./input"));
var skydome = __importStar(require("./skydome"));
var heightfield_1 = __importStar(require("./heightfield"));
var grass = __importStar(require("./grass"));
var terrain_1 = __importDefault(require("./terrain"));
var terramap = __importStar(require("./terramap"));
var water = __importStar(require("./water"));
var player_1 = __importDefault(require("./player"));
var fps_1 = __importDefault(require("./fps"));
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
///////////////////////////////////////////////////////////////////////
/**
 * Create a World instance
 */
function World(assets, numGrassBlades, grassPatchRadius, displayWidth, displayHeight, antialias) {
    var canvas = (0, util_1.$e)('app_canvas');
    // Make canvas transparent so it isn't rendered as black for 1 frame at startup
    var renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: antialias,
        clearColor: 0xFFFFFF, clearAlpha: 1, alpha: true
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
    var heightField = (0, heightfield_1.default)({
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
    var terra = (0, terrain_1.default)({
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
    var player = (0, player_1.default)(heightField, WATER_LEVEL);
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
    var fpsMon = (0, fps_1.default)();
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
    var _hinfo = (0, heightfield_1.HInfo)();
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
        heightfield_1.default.infoAt(heightField, ppos.x, ppos.y, true, _hinfo);
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
        terrain_1.default.update(terra, ppos.x, ppos.y);
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
        var dy = Math.abs((0, gmath_1.difAngle)(GLARE_YAW, player.state.yaw));
        var dp = Math.abs((0, gmath_1.difAngle)(GLARE_PITCH, player.state.pitch)) * 1.75;
        var sunVisAngle = Math.sqrt(dy * dy + dp * dp);
        if (sunVisAngle < GLARE_RANGE) {
            var glare = MAX_GLARE * Math.pow((GLARE_RANGE - sunVisAngle) / (1.0 + MAX_GLARE), 0.75);
            meshes.sunFlare.material.opacity = Math.max(0.0, glare);
            meshes.sunFlare.visible = true;
        }
        else {
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
        }
        else {
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
