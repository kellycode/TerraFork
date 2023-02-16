"use strict";
// LICENSE: MIT
// Copyright (c) 2016 by Mike Linkovich
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVisible = exports.show = exports.hide = exports.toggle = exports.setHtml = exports.setText = void 0;
var util_1 = require("./util");
var visible = false;
function setText(txt) {
    (0, util_1.$e)('logger').textContent = txt;
}
exports.setText = setText;
function setHtml(html) {
    (0, util_1.$e)('logger').innerHTML = html;
}
exports.setHtml = setHtml;
function toggle() {
    var el = (0, util_1.$e)('logger');
    visible = !visible;
    if (visible) {
        el.style.display = 'inline-block';
    }
    else {
        el.style.display = 'none';
    }
}
exports.toggle = toggle;
function hide() {
    (0, util_1.$e)('logger').style.display = 'none';
    visible = false;
}
exports.hide = hide;
function show() {
    (0, util_1.$e)('logger').style.display = 'inline-block';
    visible = true;
}
exports.show = show;
function isVisible() {
    return visible;
}
exports.isVisible = isVisible;
