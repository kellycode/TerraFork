"use strict";
// LICENSE: MIT
// Copyright (c) 2016 by Mike Linkovich
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectWebGL = exports.$i = exports.$e = void 0;
function $e(id) {
    return document.getElementById(id);
}
exports.$e = $e;
function $i(id) {
    return document.getElementById(id);
}
exports.$i = $i;
function detectWebGL() {
    try {
        var canvas = document.createElement('canvas');
        return (!!canvas.getContext('webgl') || !!canvas.getContext('experimental-webgl'));
    }
    catch (e) {
        return null;
    }
}
exports.detectWebGL = detectWebGL;
