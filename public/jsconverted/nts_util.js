"use strict";

let NTS_UTIL = {
    $e: function(id) {
        return document.getElementById(id);
    },

    $i: function(id) {
        return document.getElementById(id);
    },

    detectWebGL: function() {
        try {
            var canvas = document.createElement('canvas');
            return (!!canvas.getContext('webgl') || !!canvas.getContext('experimental-webgl'));
        } catch (e) {
            return null;
        }
    }
}

