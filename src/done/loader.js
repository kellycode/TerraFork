"use strict";
// Loader that provides a dictionary of named assets
// LICENSE: MIT
// Copyright (c) 2016 by Mike Linkovich
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="types/three-global.d.ts" />
/**
 * Create a Loader instance
 */
function Loader() {
    var isLoading = false;
    var totalToLoad = 0;
    var numLoaded = 0;
    var numFailed = 0;
    var success_cb;
    var progress_cb;
    var error_cb;
    var done_cb;
    var assets = { images: {}, text: {}, textures: {} };
    /**
     * Start loading a list of assets
     */
    function load(assetList, success, progress, error, done) {
        success_cb = success;
        progress_cb = progress;
        error_cb = error;
        done_cb = done;
        totalToLoad = 0;
        numLoaded = 0;
        numFailed = 0;
        isLoading = true;
        if (assetList.text) {
            totalToLoad += assetList.text.length;
            for (var i = 0; i < assetList.text.length; ++i) {
                loadText(assetList.text[i]);
            }
        }
        if (assetList.images) {
            totalToLoad += assetList.images.length;
            for (var i = 0; i < assetList.images.length; ++i) {
                loadImage(assetList.images[i]);
            }
        }
        if (assetList.textures) {
            totalToLoad += assetList.textures.length;
            for (var i = 0; i < assetList.textures.length; ++i) {
                loadTexture(assetList.textures[i]);
            }
        }
    }
    function loadText(ad) {
        console.log('loading ' + ad.url);
        var req = new XMLHttpRequest();
        req.overrideMimeType('*/*');
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    assets.text[ad.name] = req.responseText;
                    console.log('loaded ' + ad.name);
                    doProgress();
                }
                else {
                    doError("Error " + req.status + " loading " + ad.url);
                }
            }
        };
        req.open('GET', ad.url);
        req.send();
    }
    function loadImage(ad) {
        var img = new Image();
        assets.images[ad.name] = img;
        img.onload = doProgress;
        img.onerror = doError;
        img.src = ad.url;
    }
    function loadTexture(ad) {
        assets.textures[ad.name] = new THREE.TextureLoader().load(ad.url, doProgress);
    }
    function doProgress() {
        numLoaded += 1;
        progress_cb && progress_cb(numLoaded / totalToLoad);
        tryDone();
    }
    function doError(e) {
        error_cb && error_cb(e);
        numFailed += 1;
        tryDone();
    }
    function tryDone() {
        if (!isLoading)
            return true;
        if (numLoaded + numFailed >= totalToLoad) {
            var ok = !numFailed;
            if (ok && success_cb)
                success_cb(assets);
            done_cb && done_cb(ok);
            isLoading = false;
        }
        return !isLoading;
    }
    /**
     *  Public interface
     */
    return {
        load: load,
        getAssets: function () { return assets; }
    };
} // end Loader
exports.default = Loader;
