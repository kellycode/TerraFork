"use strict";
// LICENSE: MIT
// Copyright (c) 2016 by Mike Linkovich
Object.defineProperty(exports, "__esModule", { value: true });
exports.is = exports.toggle = void 0;
function toggle(el) {
    if (!is()) {
        /*if (document.mozFullscreenEnabled === false) {
            console.warn("Fullscreen may not be available")
        }*/
        if (el.requestFullscreen) {
            el.requestFullscreen();
        }
        else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
        }
        else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        }
        else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        }
    }
    else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}
exports.toggle = toggle;
function is() {
    return !!document.fullscreenElement || !!document.mozFullScreenElement ||
        !!document.webkitFullscreenElement || !!document.msFullscreenElement;
}
exports.is = is;
