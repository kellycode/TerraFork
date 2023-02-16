"use strict";
// Vector Math with library-agnostic interface types.
// i.e. Any object with matching property names will work,
// whether three.js, cannon.js, etc.
//
// LICENSE: MIT
// Copyright (c) 2016 by Mike Linkovich
Object.defineProperty(exports, "__esModule", { value: true });
exports.Color = exports.Vec3 = exports.Vec2 = void 0;
/**
 * 3D Vector functions
 */
var Vec2;
(function (Vec2) {
    function create(x, y) {
        return {
            x: (typeof x === 'number') ? x : 0.0,
            y: (typeof y === 'number') ? y : 0.0
        };
    }
    Vec2.create = create;
    function clone(v) {
        return create(v.x, v.y);
    }
    Vec2.clone = clone;
    function set(v, x, y) {
        v.x = x;
        v.y = y;
    }
    Vec2.set = set;
    function copy(src, out) {
        out.x = src.x;
        out.y = src.y;
    }
    Vec2.copy = copy;
    function length(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }
    Vec2.length = length;
    function setLength(v, l, out) {
        var s = length(v);
        if (s > 0.0) {
            s = l / s;
            out.x = v.x * s;
            out.y = v.y * s;
        }
        else {
            out.x = l;
            out.y = 0.0;
        }
    }
    Vec2.setLength = setLength;
    function dist(v0, v1) {
        var dx = v1.x - v0.x;
        var dy = v1.y - v0.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    Vec2.dist = dist;
    function normalize(v, out) {
        setLength(v, 1.0, out);
    }
    Vec2.normalize = normalize;
    function dot(v0, v1) {
        return (v0.x * v1.x + v0.y * v1.y);
    }
    Vec2.dot = dot;
    function det(v0, v1) {
        return (v0.x * v1.y - v0.y * v1.x);
    }
    Vec2.det = det;
    /** Rotate v by r radians, result in out. (v and out can reference the same Vec2 object) */
    function rotate(v, r, out) {
        var c = Math.cos(r), s = Math.sin(r), x = v.x, y = v.y;
        out.x = x * c - y * s;
        out.y = x * s + y * c;
    }
    Vec2.rotate = rotate;
    /** Uses pre-computed cos & sin values of rotation angle */
    function rotateCS(v, c, s, out) {
        var x = v.x, y = v.y;
        out.x = x * c - y * s;
        out.y = x * s + y * c;
    }
    Vec2.rotateCS = rotateCS;
    /** nx,ny should be normalized; vx,vy length will be preserved */
    function reflect(v, n, out) {
        var d = dot(n, v);
        out.x = v.x - 2.0 * d * n.x;
        out.y = v.y - 2.0 * d * n.y;
    }
    Vec2.reflect = reflect;
    function toArray(v) {
        return [v.x, v.y];
    }
    Vec2.toArray = toArray;
})(Vec2 = exports.Vec2 || (exports.Vec2 = {}));
/**
 * 3D Vector functions
 */
var Vec3;
(function (Vec3) {
    function create(x, y, z) {
        return {
            x: (typeof x === 'number') ? x : 0.0,
            y: (typeof y === 'number') ? y : 0.0,
            z: (typeof z === 'number') ? z : 0.0
        };
    }
    Vec3.create = create;
    function clone(v) {
        return create(v.x, v.y, v.z);
    }
    Vec3.clone = clone;
    function set(v, x, y, z) {
        v.x = x;
        v.y = y;
        v.z = z;
    }
    Vec3.set = set;
    function copy(src, out) {
        out.x = src.x;
        out.y = src.y;
        out.z = src.z;
    }
    Vec3.copy = copy;
    function length(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }
    Vec3.length = length;
    function setLength(v, l, out) {
        var s = length(v);
        if (s > 0.0) {
            s = l / s;
            out.x = v.x * s;
            out.y = v.y * s;
            out.z = v.z * s;
        }
        else {
            out.x = l;
            out.y = 0.0;
            out.z = 0.0;
        }
    }
    Vec3.setLength = setLength;
    function dist(v0, v1) {
        var dx = v1.x - v0.x;
        var dy = v1.y - v0.y;
        var dz = v1.z - v0.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    Vec3.dist = dist;
    function normalize(v, out) {
        Vec3.setLength(v, 1.0, out);
    }
    Vec3.normalize = normalize;
    function dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }
    Vec3.dot = dot;
    function cross(a, b, out) {
        var ax = a.x, ay = a.y, az = a.z, bx = b.x, by = b.y, bz = b.z;
        out.x = ay * bz - az * by;
        out.y = az * bx - ax * bz;
        out.z = ax * by - ay * bx;
    }
    Vec3.cross = cross;
    function toArray(v) {
        return [v.x, v.y, v.z];
    }
    Vec3.toArray = toArray;
})(Vec3 = exports.Vec3 || (exports.Vec3 = {}));
/**
 * RGB Color functions
 */
var Color;
(function (Color) {
    function create(r, g, b) {
        return {
            r: (typeof r === 'number') ? r : 0.0,
            g: (typeof g === 'number') ? g : 0.0,
            b: (typeof b === 'number') ? b : 0.0
        };
    }
    Color.create = create;
    function toArray(c) {
        return [c.r, c.g, c.b];
    }
    Color.toArray = toArray;
    function to24bit(c) {
        return (c.r * 255) << 16 ^ (c.g * 255) << 8 ^ (c.b * 255) << 0;
    }
    Color.to24bit = to24bit;
})(Color = exports.Color || (exports.Color = {}));
