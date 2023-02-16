"use strict";
// LICENSE: MIT
// Copyright (c) 2016 by Mike Linkovich
Object.defineProperty(exports, "__esModule", { value: true });
exports.setKeyPressListener = exports.getKeyState = exports.init = exports.state = void 0;
exports.state = {
    up: 0,
    down: 0,
    left: 0,
    right: 0,
    forward: 0,
    back: 0,
    pitchup: 0,
    pitchdown: 0
};
var keyStates = new Array(256).map(function (b) { return false; });
// Any listeners the app has set up
var keyPressListeners = {};
function setState(k, s) {
    var cs = exports.state;
    // arrow keys L/R/F/B
    if (k === 37)
        cs.left = s;
    else if (k === 39)
        cs.right = s;
    else if (k === 38)
        cs.forward = s;
    else if (k === 40)
        cs.back = s;
    else if (k === 87) // W
        cs.up = s;
    else if (k === 83) // S
        cs.down = s;
    else if (k === 81) // Q
        cs.pitchup = s;
    else if (k === 65) // A
        cs.pitchdown = s;
}
function onKeyDown(ev) {
    if (!keyStates[ev.keyCode]) {
        setState(ev.keyCode, 1.0);
        keyStates[ev.keyCode] = true;
        var codeStr = ev.keyCode.toString();
        if (typeof keyPressListeners[codeStr] === 'function') {
            keyPressListeners[codeStr]();
        }
    }
}
function onKeyUp(ev) {
    if (keyStates[ev.keyCode]) {
        keyStates[ev.keyCode] = false;
        setState(ev.keyCode, 0.0);
    }
}
var initialized = false;
function init() {
    if (initialized)
        return;
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('keyup', onKeyUp, true);
    initialized = true;
}
exports.init = init;
function getKeyState(code) {
    return keyStates[code];
}
exports.getKeyState = getKeyState;
function setKeyPressListener(code, fn) {
    keyPressListeners[code.toString()] = fn;
}
exports.setKeyPressListener = setKeyPressListener;
