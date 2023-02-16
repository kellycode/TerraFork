"use strict";
// LICENSE: MIT
// Copyright (c) 2016 by Mike Linkovich
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMobile = exports.isStandalone = void 0;
/** Try to determine if was launched from homescreen/desktop app launcher */
exports.isStandalone = (function () {
    // iOS
    if (navigator.standalone !== undefined)
        return !!navigator.standalone;
    // Windows Mobile
    if (window.external && window.external.msIsSiteMode)
        return !!window.external.msIsSiteMode();
    // Chrome
    return window.matchMedia('(display-mode: standalone)').matches;
}());
exports.isMobile = (function () {
    var a = !!navigator.userAgent.match(/Android/i);
    var bb = !!navigator.userAgent.match(/BlackBerry/i);
    var ios = !!navigator.userAgent.match(/iPhone|iPad|iPod/i);
    var o = !!navigator.userAgent.match(/Opera Mini/i);
    var w = !!navigator.userAgent.match(/IEMobile/i);
    var ff = !!navigator.userAgent.match(/\(Mobile/i);
    var any = (a || bb || ios || o || w || ff);
    return {
        Android: a,
        BlackBerry: bb,
        iOS: ios,
        Opera: o,
        Windows: w,
        FireFox: ff,
        any: any
    };
}());
