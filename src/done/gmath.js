"use strict";
// LICENSE: MIT
// Copyright (c) 2016 by Mike Linkovich
Object.defineProperty(exports, "__esModule", { value: true });
exports.dot = exports.difAngle = exports.angle = exports.nrand = exports.pmod = exports.clamp = exports.roundFrac = exports.sign = exports.PI2 = void 0;
exports.PI2 = Math.PI * 2.0;
function sign(n) {
    return (n > 0 ? 1 : n < 0 ? -1 : 0);
}
exports.sign = sign;
function roundFrac(n, places) {
    var d = Math.pow(10, places);
    return Math.round((n + 0.000000001) * d) / d;
}
exports.roundFrac = roundFrac;
function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
}
exports.clamp = clamp;
/**  Always positive modulus */
function pmod(n, m) {
    return ((n % m + m) % m);
}
exports.pmod = pmod;
/** A random number from -1.0 to 1.0 */
function nrand() {
    return Math.random() * 2.0 - 1.0;
}
exports.nrand = nrand;
function angle(x, y) {
    return pmod(Math.atan2(y, x), exports.PI2);
}
exports.angle = angle;
function difAngle(a0, a1) {
    var r = pmod(a1, exports.PI2) - pmod(a0, exports.PI2);
    return Math.abs(r) < Math.PI ? r : r - exports.PI2 * sign(r);
}
exports.difAngle = difAngle;
function dot(x0, y0, x1, y1) {
    return (x0 * x1 + y0 * y1);
}
exports.dot = dot;
