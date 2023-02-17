/*player.js*/
"use strict";
// Copyright (c) 2016 by Mike Linkovich


//Tools -> Options -> Editor -> Code Completion -> Auto popup documentation window


// Creates a Player instance
// (User first person camera)
class Player {

    constructor(heightField, waterHeight) {

        this.HEIGHTFIELD = heightField;
        this.WATERHEIGHT = waterHeight;

        this.DEFAULT_HEIGHT = 0.0;
        this.MIN_HEIGHT = 2.5;
        this.MAX_HEIGHT = 275.0;
        this.FLOAT_VEL = 0.75;
        this.BOB_RANGE = 16.0;
        this.DEFAULT_PITCH = -0.325;
        this.MOVE_RANGE = 1500.0;
        this.ACCEL = 90.0; // forward accel
        this.DRAG = 0.1;
        this.VACCEL = 60.0; // vertical accel
        this.VDRAG = 5.0;
        this.YAW_ACCEL = 4.0; // angular accel (yaw)
        this.YAW_DRAG = 2.0;
        this.PITCH_ACCEL = 4.0;
        this.PITCH_RESIST = 16.0;
        this.PITCH_FRIC = 8.0;
        this.ROLL_ACCEL = 2.0;
        this.ROLL_RESIST = 10.0;
        this.ROLL_FRIC = 8.0;
        this.MAN_VEL = 40.0;
        this.MAN_ZVEL = 10.0;
        this.MAN_YAWVEL = 0.5;
        this.MAN_PITCHVEL = 0.5;
        this.MAN_MAXPITCH = Math.PI / 4.0;
        this.MODE_AUTO = 0;
        this.MODE_FLY = 1;
        this.MODE_MAN = 2;
        this.NUM_MODES = 3;

        //let autoplay = true
        this.mode = MODE_FLY;
        this.curT = 0;
        this.state = {
            pos: NTS_VEC.Vec3.create(0.0, 0.0, this.DEFAULT_HEIGHT),
            vel: NTS_VEC.Vec3.create(0.0, 0.0, 0.0),
            dir: NTS_VEC.Vec3.create(1.0, 0.0, 0.0),
            yaw: 0.0,
            yawVel: 0.0,
            pitch: 0.0,
            pitchVel: 0.0,
            roll: 0.0,
            rollVel: 0.0,
            floatHeight: 0.0
        };

        NTS_INPUT.setKeyPressListener(13, function () {
            nextMode();
            if (this.mode === this.MODE_AUTO) {
                NTS_LOGGER.hide();
                NTS_NOTIFICATION.notify('Press ENTER to change camera');
            } else if (this.mode === this.MODE_FLY) {
                NTS_NOTIFICATION.notify('ARROWS drive, W/S move up/down.');
            } else if (this.mode === this.MODE_MAN) {
                NTS_LOGGER.show();
                NTS_NOTIFICATION.notify('ARROWS move, W/S move up/down, Q/A look up/down');
            }
        });

        // scratchpad vectors
        this._a = NTS_VEC.Vec3.create();
        this._d = NTS_VEC.Vec3.create();
        this._p1 = NTS_VEC.Vec3.create();
        this._p2 = NTS_VEC.Vec3.create();
        this._p3 = NTS_VEC.Vec3.create();
    }

    // @param dt Delta time in ms
    update(dt) {
        this.curT += dt;
        // Update auto or manual
        if (this.mode === this.MODE_AUTO) {
            this.updateAuto(curT / 1000.0, dt);
        } else if (this.mode === this.MODE_FLY) {
            this.updateDrone(NTS_INPUT.state, dt);
        } else if (this.mode === this.MODE_MAN) {
            this.updateManual(NTS_INPUT.state, dt);
        }
        // Calc cam look direction vector
        var d = this.state.dir;
        d.z = Math.sin(this.state.pitch);
        var s = (1.0 - Math.abs(d.z));
        d.x = Math.cos(this.state.yaw) * s;
        d.y = Math.sin(this.state.yaw) * s;
    }

    nextMode() {
        this.mode = (this.mode + 1) % this.NUM_MODES;
        if (this.mode === this.MODE_MAN) {
            this.state.roll = 0;
            this.state.rollVel = 0;
            this.state.pitchVel = 0;
            this.state.yawVel = 0;
        }
    }

    getMode() {
        return this.mode;
    }

    /**
     * Update autoplay camera
     * @param time Time in seconds
     *
     * @param {Number} time
     * @param {Number} dt
     * @returns {null}
     */
    updateAuto(time, dt) {
        var ft = dt / 1000.0;

        // Remember last frame values
        NTS_VEC.Vec3.copy(this.state.pos, this._a);

        var yaw0 = this.state.yaw;
        var pitch0 = this.state.pitch;

        // Follow a nice curvy path...
        //state.pos.x = Math.cos(r) * MOVE_RANGE + Math.sin(r) * MOVE_RANGE * 2.0
        //state.pos.y = Math.sin(r) * MOVE_RANGE + Math.cos(r) * MOVE_RANGE * 2.0

        this.autoPos(time * 0.01, this.state.pos);

        // Look ahead a few steps so we can see if there are
        // sudden height increases to look for
        this.autoPos((time + 1.0) * 0.01, this._p1);
        this.autoPos((time + 2.0) * 0.01, this._p2);
        this.autoPos((time + 3.0) * 0.01, this._p3);

        // Move up & down smoothly
        var a = time * 0.3;
        this.state.pos.z = this.BOB_RANGE + Math.cos(a) * this.BOB_RANGE;

        // Look up & down depending on height
        this.state.pitch = this.DEFAULT_PITCH - 0.25 * Math.sin(a + Math.PI * 0.5);

        // Turn left & right smoothly over time
        this.state.yaw = Math.sin(time * 0.04) * Math.PI * 2.0 + Math.PI * 0.5;

        // Actual height at camera
        var groundHeight = Math.max(NTS_HEIGHTFIELD.heightAt(this.HEIGHTFIELD, this.state.pos.x, this.state.pos.y, true), this.WATERHEIGHT);

        // Look ahead heights
        var h1 = Math.max(NTS_HEIGHTFIELD.heightAt(this.HEIGHTFIELD, this._p1.x, this._p1.y, true), this.WATERHEIGHT);
        var h2 = Math.max(NTS_HEIGHTFIELD.heightAt(this.HEIGHTFIELD, this._p2.x, this._p2.y, true), this.WATERHEIGHT);
        var h3 = Math.max(NTS_HEIGHTFIELD.heightAt(this.HEIGHTFIELD, this._p3.x, this._p3.y, true), this.WATERHEIGHT);
        
        //let minHeight = (groundHeight + h1 + h2 + h3) / 4.0
        var minHeight = Math.max(Math.max(Math.max(groundHeight, h1), h2), h3);
        
        var floatVel = (this.state.floatHeight < minHeight) ?
              (minHeight - this.state.floatHeight) : (groundHeight - this.state.floatHeight);
              
        if (floatVel < 0) {
            floatVel *= 0.25; // can sink more slowly
        }
        
        this.state.floatHeight += floatVel * this.FLOAT_VEL * ft;
        
        // Make absolutely sure we're above ground
        if (this.state.floatHeight < groundHeight) {
            this.state.floatHeight = groundHeight;
        }
            
        
        this.state.pos.z += this.state.floatHeight + this.MIN_HEIGHT;
        
        // Calc velocities based on difs from prev frame
        this._d.x = this.state.pos.x - this._a.x;
        this._d.y = this.state.pos.y - this._a.y;
        this._d.z = this.state.pos.z - this._a.z;
        this.state.vel.x = this._d.x / ft;
        this.state.vel.y = this._d.y / ft;
        
        this.state.vel.z = this._d.z / ft;
        var dyaw = this.state.yaw - yaw0;
        this.state.yawVel = dyaw / ft;
        var dpitch = this.state.pitch - pitch0;
        this.state.pitchVel = dpitch / ft;
    }

    autoPos(r, p) {
        p.x = Math.cos(r) * this.MOVE_RANGE + Math.sin(r) * this.MOVE_RANGE * 2.0;
        p.y = Math.sin(r) * this.MOVE_RANGE + Math.cos(r) * this.MOVE_RANGE * 2.0;
    }

    // Drone-like physics
    updateDrone(i, dt) {
        // Delta time in seconds
        var ft = dt / 1000.0;
        // calc roll accel
        var ra = 0;
        
        if (i.left > 0) {
            ra = -this.ROLL_ACCEL;
        } else if (i.right > 0) {
            ra = this.ROLL_ACCEL;
        }
        
        // calc roll resist forces
        var rr = -this.state.roll * this.ROLL_RESIST;
        var rf = -NTS_GMATH.sign(this.state.rollVel) * this.ROLL_FRIC * Math.abs(this.state.rollVel);
        
        // total roll accel
        ra = ra + rr + rf;
        this.state.rollVel += ra * ft;
        this.state.roll += this.state.rollVel * ft;
        
        // Calc yaw accel
        var ya = -this.state.roll * this.YAW_ACCEL;
        
        // yaw drag
        var yd = -NTS_GMATH.sign(this.state.yawVel) * Math.abs(Math.pow(this.state.yawVel, 3.0)) * this.YAW_DRAG;
        
        // update yaw
        this.state.yawVel += (ya + yd) * ft;
        this.state.yaw += this.state.yawVel * ft;
        
        // Calc pitch accel
        var pa = 0;
        if (i.forward > 0) {
            pa = -this.PITCH_ACCEL;
        } else if (i.back > 0) {
            pa = this.PITCH_ACCEL * 0.5;
        }
        // Calc pitch resist forces
        var pr = -this.state.pitch * this.PITCH_RESIST;
        var pf = -NTS_GMATH.sign(this.state.pitchVel) * this.PITCH_FRIC * Math.abs(this.state.pitchVel);
        // total pitch accel
        pa = pa + pr + pf;
        state.pitchVel += pa * ft;
        state.pitch += state.pitchVel * ft;
        // Calc accel vector
        NTS_VEC.Vec3.set(_a, 0, 0, 0);
        _a.x = -state.pitch * ACCEL * Math.cos(state.yaw);
        _a.y = -state.pitch * ACCEL * Math.sin(state.yaw);
        // Calc drag vector (horizontal)
        var absVel = NTS_VEC.Vec2.length(state.vel); // state.vel.length()
        _d.x = -state.vel.x;
        _d.y = -state.vel.y;
        NTS_VEC.Vec2.setLength(_d, absVel * DRAG, _d);
        // Calc vertical accel
        if (i.up > 0 && state.pos.z < MAX_HEIGHT - 2.0) {
            _a.z = VACCEL;
        } else if (i.down > 0 && state.pos.z > MIN_HEIGHT) {
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
        var groundHeight = Math.max(NTS_HEIGHTFIELD.heightAt(this.HEIGHTFIELD, state.pos.x, state.pos.y, true), this.WATERHEIGHT);
        if (state.pos.z < groundHeight + MIN_HEIGHT) {
            state.pos.z = groundHeight + MIN_HEIGHT;
        } else if (state.pos.z > MAX_HEIGHT) {
            state.pos.z = MAX_HEIGHT;
        }
    }

    // Manual movement
    updateManual(i, dt) {
        var ft = dt / 1000.0;
        state.yawVel = 0;
        if (i.left) {
            state.yawVel = MAN_YAWVEL;
        } else if (i.right) {
            state.yawVel = -MAN_YAWVEL;
        }
        state.yaw += state.yawVel * ft;
        state.pitchVel = 0;
        if (i.pitchup) {
            state.pitchVel = MAN_PITCHVEL;
        } else if (i.pitchdown) {
            state.pitchVel = -MAN_PITCHVEL;
        }
        state.pitch += state.pitchVel * ft;
        state.pitch = NTS_GMATH.clamp(state.pitch, -MAN_MAXPITCH, MAN_MAXPITCH);
        NTS_VEC.Vec3.set(state.vel, 0, 0, 0);
        if (i.forward) {
            state.vel.x = MAN_VEL * Math.cos(state.yaw);
            state.vel.y = MAN_VEL * Math.sin(state.yaw);
        } else if (i.back) {
            state.vel.x = -MAN_VEL * Math.cos(state.yaw);
            state.vel.y = -MAN_VEL * Math.sin(state.yaw);
        }
        state.pos.x += state.vel.x * ft;
        state.pos.y += state.vel.y * ft;
        if (i.up) {
            state.vel.z = MAN_ZVEL;
        } else if (i.down) {
            state.vel.z = -MAN_ZVEL;
        }
        state.pos.z += state.vel.z * ft;
        var groundHeight = Math.max(NTS_HEIGHTFIELD.heightAt(this.HEIGHTFIELD, state.pos.x, state.pos.y, true), this.WATERHEIGHT);
        if (state.pos.z < groundHeight + MIN_HEIGHT) {
            state.pos.z = groundHeight + MIN_HEIGHT;
        } else if (state.pos.z > MAX_HEIGHT) {
            state.pos.z = MAX_HEIGHT;
        }
    }

    /*
     return {
     update: update,
     state: state,
     getMode: getMode,
     nextMode: nextMode
     };
     */

}


              