"use strict";
// Simple CSS animations
//
// LICENSE: MIT
// Copyright (c) 2016 by Mike Linkovich
Object.defineProperty(exports, "__esModule", { value: true });
exports.fadeOut = exports.fadeIn = exports.fade = void 0;
var gmath_1 = require("./gmath");
var PRECISION = 5;
/**
 * Fades element from o0 opacity to o1 opacity in dur milliseconds.
 * Invokes complete callback when done.
 */
function fade(el, o0, o1, dur, complete) {
    var startT = Date.now();
    var prevO = (0, gmath_1.roundFrac)(o0, PRECISION).toString();
    el.style.opacity = prevO;
    function fadeLoop() {
        var t = Date.now() - startT;
        if (t >= dur) {
            el.style.opacity = (0, gmath_1.roundFrac)(o1, PRECISION).toString();
            if (complete)
                complete();
        }
        else {
            // round off so style value isn't too weird
            var o = (0, gmath_1.roundFrac)(o0 + t / dur * (o1 - o0), PRECISION).toString();
            if (o !== prevO) {
                // only update style if value has changed
                el.style.opacity = o;
                prevO = o;
            }
            requestAnimationFrame(fadeLoop);
        }
    }
    requestAnimationFrame(fadeLoop);
}
exports.fade = fade;
/**
 * Go from 0 opacity to 1 in dur milliseconds.
 * @param el Element to fade
 * @param dur Fade duration in ms
 * @param complete Callback on complete
 */
function fadeIn(el, dur, complete) {
    fade(el, 0, 1, dur, complete);
}
exports.fadeIn = fadeIn;
/**
 * Go from 1 opacity to 0 in dur milliseconds.
 * @param el Element to fade
 * @param dur Fade duration in ms
 * @param complete Callback on complete
 */
function fadeOut(el, dur, complete) {
    fade(el, 1, 0, dur, complete);
}
exports.fadeOut = fadeOut;
