"use strict";

let NTS_LOGGER = {
    
    visible: false,

    setText: function (txt) {
        NTS_UTIL.$e('logger').textContent = txt;
    },

    setHtml: function (html) {
        NTS_UTIL.$e('logger').innerHTML = html;
    },

    toggle: function () {
        const el = NTS_UTIL.$e('logger');
        this.visible = !this.visible;
        if (this.visible) {
            el.style.display = 'inline-block';
        } else {
            el.style.display = 'none';
        }
    },

    hide: function () {
        NTS_UTIL.$e('logger').style.display = 'none';
        this.visible = false;
    },

    show: function () {
        NTS_UTIL.$e('logger').style.display = 'inline-block';
        this.visible = true;
    },

    isVisible: function () {
        return this.visible;
    }
};
