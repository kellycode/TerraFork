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
var gmath_1 = require("./gmath");
var vec_1 = require("./vec");
var input = __importStar(require("./input"));
var notification_1 = __importDefault(require("./notification"));
var heightfield_1 = __importDefault(require("./heightfield"));
var log = __importStar(require("./logger"));
var DEFAULT_HEIGHT = 0.0;
var MIN_HEIGHT = 2.5;
var MAX_HEIGHT = 275.0;
var FLOAT_VEL = 0.75;
var BOB_RANGE = 16.0;
var DEFAULT_PITCH = -0.325;
var MOVE_RANGE = 1500.0;
var ACCEL = 90.0; // forward accel
var DRAG = 0.1;
var VACCEL = 60.0; // vertical accel
var VDRAG = 5.0;
var YAW_ACCEL = 4.0; // angular accel (yaw)
var YAW_DRAG = 2.0;
var PITCH_ACCEL = 4.0;
var PITCH_RESIST = 16.0;
var PITCH_FRIC = 8.0;
var ROLL_ACCEL = 2.0;
var ROLL_RESIST = 10.0;
var ROLL_FRIC = 8.0;
var MAN_VEL = 40.0;
var MAN_ZVEL = 10.0;
var MAN_YAWVEL = 0.5;
var MAN_PITCHVEL = 0.5;
var MAN_MAXPITCH = Math.PI / 4.0;
var MODE_AUTO = 0;
var MODE_FLY = 1;
var MODE_MAN = 2;
var NUM_MODES = 3;
/** Creates a Player instance (User first person camera) */
function Player(heightField, waterHeight) {
    //let autoplay = true
    var mode = MODE_AUTO;
    var curT = 0;
    var state = {
        pos: vec_1.Vec3.create(0.0, 0.0, DEFAULT_HEIGHT),
        vel: vec_1.Vec3.create(0.0, 0.0, 0.0),
        dir: vec_1.Vec3.create(1.0, 0.0, 0.0),
        yaw: 0.0,
        yawVel: 0.0,
        pitch: 0.0,
        pitchVel: 0.0,
        roll: 0.0,
        rollVel: 0.0,
        floatHeight: 0.0
    };
    input.setKeyPressListener(13, function () {
        nextMode();
        if (mode === MODE_AUTO) {
            log.hide();
            (0, notification_1.default)('Press ENTER to change camera');
        }
        else if (mode === MODE_FLY) {
            (0, notification_1.default)('ARROWS drive, W/S move up/down.');
        }
        else if (mode === MODE_MAN) {
            log.show();
            (0, notification_1.default)('ARROWS move, W/S move up/down, Q/A look up/down');
        }
    });
    // scratchpad vectors
    var _a = vec_1.Vec3.create();
    var _d = vec_1.Vec3.create();
    var _p1 = vec_1.Vec3.create();
    var _p2 = vec_1.Vec3.create();
    var _p3 = vec_1.Vec3.create();
    /**
     * @param dt Delta time in ms
     */
    function update(dt) {
        curT += dt;
        // Update auto or manual
        if (mode === MODE_AUTO) {
            updateAuto(curT / 1000.0, dt);
        }
        else if (mode === MODE_FLY) {
            updateDrone(input.state, dt);
        }
        else if (mode === MODE_MAN) {
            updateManual(input.state, dt);
        }
        // Calc cam look direction vector
        var d = state.dir;
        d.z = Math.sin(state.pitch);
        var s = (1.0 - Math.abs(d.z));
        d.x = Math.cos(state.yaw) * s;
        d.y = Math.sin(state.yaw) * s;
    }
    function nextMode() {
        mode = (mode + 1) % NUM_MODES;
        if (mode === MODE_MAN) {
            state.roll = 0;
            state.rollVel = 0;
            state.pitchVel = 0;
            state.yawVel = 0;
        }
    }
    function getMode() {
        return mode;
    }
    /**
     * Update autoplay camera
     * @param time Time in seconds
     */
    function updateAuto(time, dt) {
        var ft = dt / 1000.0;
        // Remember last frame values
        vec_1.Vec3.copy(state.pos, _a);
        var yaw0 = state.yaw;
        var pitch0 = state.pitch;
        // Follow a nice curvy path...
        //state.pos.x = Math.cos(r) * MOVE_RANGE + Math.sin(r) * MOVE_RANGE * 2.0
        //state.pos.y = Math.sin(r) * MOVE_RANGE + Math.cos(r) * MOVE_RANGE * 2.0
        autoPos(time * 0.01, state.pos);
        // Look ahead a few steps so we can see if there are
        // sudden height increases to look for
        autoPos((time + 1.0) * 0.01, _p1);
        autoPos((time + 2.0) * 0.01, _p2);
        autoPos((time + 3.0) * 0.01, _p3);
        // Move up & down smoothly
        var a = time * 0.3;
        state.pos.z = BOB_RANGE + Math.cos(a) * BOB_RANGE;
        // Look up & down depending on height
        state.pitch = DEFAULT_PITCH - 0.25 * Math.sin(a + Math.PI * 0.5);
        // Turn left & right smoothly over time
        state.yaw = Math.sin(time * 0.04) * Math.PI * 2.0 + Math.PI * 0.5;
        // Actual height at camera
        var groundHeight = Math.max(heightfield_1.default.heightAt(heightField, state.pos.x, state.pos.y, true), waterHeight);
        // Look ahead heights
        var h1 = Math.max(heightfield_1.default.heightAt(heightField, _p1.x, _p1.y, true), waterHeight);
        var h2 = Math.max(heightfield_1.default.heightAt(heightField, _p2.x, _p2.y, true), waterHeight);
        var h3 = Math.max(heightfield_1.default.heightAt(heightField, _p3.x, _p3.y, true), waterHeight);
        //let minHeight = (groundHeight + h1 + h2 + h3) / 4.0
        var minHeight = Math.max(Math.max(Math.max(groundHeight, h1), h2), h3);
        var floatVel = (state.floatHeight < minHeight) ?
            (minHeight - state.floatHeight) : (groundHeight - state.floatHeight);
        if (floatVel < 0) {
            floatVel *= 0.25; // can sink more slowly
        }
        state.floatHeight += floatVel * FLOAT_VEL * ft;
        // Make absolutely sure we're above ground
        if (state.floatHeight < groundHeight)
            state.floatHeight = groundHeight;
        state.pos.z += state.floatHeight + MIN_HEIGHT;
        // Calc velocities based on difs from prev frame
        _d.x = state.pos.x - _a.x;
        _d.y = state.pos.y - _a.y;
        _d.z = state.pos.z - _a.z;
        state.vel.x = _d.x / ft;
        state.vel.y = _d.y / ft;
        state.vel.z = _d.z / ft;
        var dyaw = state.yaw - yaw0;
        state.yawVel = dyaw / ft;
        var dpitch = state.pitch - pitch0;
        state.pitchVel = dpitch / ft;
    }
    function autoPos(r, p) {
        p.x = Math.cos(r) * MOVE_RANGE + Math.sin(r) * MOVE_RANGE * 2.0;
        p.y = Math.sin(r) * MOVE_RANGE + Math.cos(r) * MOVE_RANGE * 2.0;
    }
    /**
     * Drone-like physics
     */
    function updateDrone(i, dt) {
        // Delta time in seconds
        var ft = dt / 1000.0;
        // calc roll accel
        var ra = 0;
        if (i.left > 0) {
            ra = -ROLL_ACCEL;
        }
        else if (i.right > 0) {
            ra = ROLL_ACCEL;
        }
        // calc roll resist forces
        var rr = -state.roll * ROLL_RESIST;
        var rf = -(0, gmath_1.sign)(state.rollVel) * ROLL_FRIC * Math.abs(state.rollVel);
        // total roll accel
        ra = ra + rr + rf;
        state.rollVel += ra * ft;
        state.roll += state.rollVel * ft;
        // Calc yaw accel
        var ya = -state.roll * YAW_ACCEL;
        // yaw drag
        var yd = -(0, gmath_1.sign)(state.yawVel) * Math.abs(Math.pow(state.yawVel, 3.0)) * YAW_DRAG;
        // update yaw
        state.yawVel += (ya + yd) * ft;
        state.yaw += state.yawVel * ft;
        // Calc pitch accel
        var pa = 0;
        if (i.forward > 0) {
            pa = -PITCH_ACCEL;
        }
        else if (i.back > 0) {
            pa = PITCH_ACCEL * 0.5;
        }
        // Calc pitch resist forces
        var pr = -state.pitch * PITCH_RESIST;
        var pf = -(0, gmath_1.sign)(state.pitchVel) * PITCH_FRIC * Math.abs(state.pitchVel);
        // total pitch accel
        pa = pa + pr + pf;
        state.pitchVel += pa * ft;
        state.pitch += state.pitchVel * ft;
        // Calc accel vector
        vec_1.Vec3.set(_a, 0, 0, 0);
        _a.x = -state.pitch * ACCEL * Math.cos(state.yaw);
        _a.y = -state.pitch * ACCEL * Math.sin(state.yaw);
        // Calc drag vector (horizontal)
        var absVel = vec_1.Vec2.length(state.vel); // state.vel.length()
        _d.x = -state.vel.x;
        _d.y = -state.vel.y;
        vec_1.Vec2.setLength(_d, absVel * DRAG, _d);
        // Calc vertical accel
        if (i.up > 0 && state.pos.z < MAX_HEIGHT - 2.0) {
            _a.z = VACCEL;
        }
        else if (i.down > 0 && state.pos.z > MIN_HEIGHT) {
            _a.z = -VACCEL;
        }
        _d.z = -state.vel.z * VDRAG;
        // update vel
        state.vel.x += (_a.x + _d.x) * ft;
        state.vel.y += (_a.y + _d.y) * ft;
        state.vel.z += (_a.z + _d.z) * ft;
        // update pos
        state.pos.x += state.vel.x * ft;
        state.pos.y += state.vel.y * ft;
        state.pos.z += state.vel.z * ft;
        var groundHeight = Math.max(heightfield_1.default.heightAt(heightField, state.pos.x, state.pos.y, true), waterHeight);
        if (state.pos.z < groundHeight + MIN_HEIGHT) {
            state.pos.z = groundHeight + MIN_HEIGHT;
        }
        else if (state.pos.z > MAX_HEIGHT) {
            state.pos.z = MAX_HEIGHT;
        }
    }
    /**
     * Manual movement
     */
    function updateManual(i, dt) {
        var ft = dt / 1000.0;
        state.yawVel = 0;
        if (i.left) {
            state.yawVel = MAN_YAWVEL;
        }
        else if (i.right) {
            state.yawVel = -MAN_YAWVEL;
        }
        state.yaw += state.yawVel * ft;
        state.pitchVel = 0;
        if (i.pitchup) {
            state.pitchVel = MAN_PITCHVEL;
        }
        else if (i.pitchdown) {
            state.pitchVel = -MAN_PITCHVEL;
        }
        state.pitch += state.pitchVel * ft;
        state.pitch = (0, gmath_1.clamp)(state.pitch, -MAN_MAXPITCH, MAN_MAXPITCH);
        vec_1.Vec3.set(state.vel, 0, 0, 0);
        if (i.forward) {
            state.vel.x = MAN_VEL * Math.cos(state.yaw);
            state.vel.y = MAN_VEL * Math.sin(state.yaw);
        }
        else if (i.back) {
            state.vel.x = -MAN_VEL * Math.cos(state.yaw);
            state.vel.y = -MAN_VEL * Math.sin(state.yaw);
        }
        state.pos.x += state.vel.x * ft;
        state.pos.y += state.vel.y * ft;
        if (i.up) {
            state.vel.z = MAN_ZVEL;
        }
        else if (i.down) {
            state.vel.z = -MAN_ZVEL;
        }
        state.pos.z += state.vel.z * ft;
        var groundHeight = Math.max(heightfield_1.default.heightAt(heightField, state.pos.x, state.pos.y, true), waterHeight);
        if (state.pos.z < groundHeight + MIN_HEIGHT) {
            state.pos.z = groundHeight + MIN_HEIGHT;
        }
        else if (state.pos.z > MAX_HEIGHT) {
            state.pos.z = MAX_HEIGHT;
        }
    }
    /**
     * Public interface
     */
    return {
        update: update,
        state: state,
        getMode: getMode,
        nextMode: nextMode
    };
}
exports.default = Player;
