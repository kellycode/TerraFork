"use strict";
// LICENSE: MIT
// Copyright (c) 2016 by Mike Linkovich
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="types/three-global.d.ts" />
var vec_1 = require("./vec");
// Terrain uses a custom shader so that we can apply the same
// type of fog as is applied to the grass. This way they both
// blend to green first, then blend to atmosphere color in the
// distance.
// Uses terrain shaders (see: shader/terrain.*.glsl)
var MAX_INDICES = 262144; // 65536
var TEX_SCALE = 1.0 / 6.0; // texture scale per quad
function Terrain(opts) {
    // max square x,y divisions that will fit in max indices
    var xCellCount = Math.floor(Math.sqrt(MAX_INDICES / (3 * 2)));
    var yCellCount = xCellCount;
    var cellSize = 1.0 / opts.heightMapScale.x / xCellCount;
    return {
        cellSize: cellSize,
        xCellCount: xCellCount,
        yCellCount: yCellCount,
        xSize: xCellCount * cellSize,
        ySize: yCellCount * cellSize,
        mesh: createMesh(opts)
    };
}
(function (Terrain) {
    function update(t, x, y) {
        var ix = Math.floor(x / t.cellSize);
        var iy = Math.floor(y / t.cellSize);
        var ox = ix * t.cellSize;
        var oy = iy * t.cellSize;
        var mat = t.mesh.material;
        var p = mat.uniforms['offset'].value;
        p[0] = ox;
        p[1] = oy;
        p = mat.uniforms['uvOffset'].value;
        p[0] = iy * TEX_SCALE; // not sure why x,y need to be swapped here...
        p[1] = ix * TEX_SCALE;
    }
    Terrain.update = update;
})(Terrain || (Terrain = {}));
exports.default = Terrain;
// Internal helpers...
/** Creates a textured plane larger than the viewer will ever travel */
function createMesh(opts) {
    // max x,y divisions that will fit 65536 indices
    var xCellCount = Math.floor(Math.sqrt(MAX_INDICES / (3 * 2)));
    var yCellCount = xCellCount;
    var cellSize = 1.0 / opts.heightMapScale.x / xCellCount;
    var texs = opts.textures;
    texs.forEach(function (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.anisotropy = 9;
    });
    var htex = opts.heightMap;
    htex.wrapS = htex.wrapT = THREE.RepeatWrapping;
    var vtxBufs = createVtxBuffers(cellSize, xCellCount + 1, yCellCount + 1);
    var idBuf = createIdBuffer(xCellCount + 1, yCellCount + 1);
    var geo = new THREE.BufferGeometry();
    geo.addAttribute('position', new THREE.BufferAttribute(vtxBufs.position, 3));
    geo.addAttribute('uv', new THREE.BufferAttribute(vtxBufs.uv, 2));
    geo.setIndex(new THREE.BufferAttribute(idBuf, 1));
    var hscale = opts.heightMapScale;
    var fragScript = opts.fragScript.replace('%%TRANSITION_LOW%%', opts.transitionLow.toString()).replace('%%TRANSITION_HIGH%%', opts.transitionHigh.toString());
    var mat = new THREE.RawShaderMaterial({
        uniforms: {
            offset: { type: '2f', value: [0.0, 0.0] },
            uvOffset: { type: '2f', value: [0.0, 0.0] },
            map1: { type: 't', value: texs[0] },
            map2: { type: 't', value: texs[1] },
            heightMap: { type: 't', value: htex },
            heightMapScale: { type: '3f', value: [hscale.x, hscale.y, hscale.z] },
            fogColor: { type: '3f', value: vec_1.Color.toArray(opts.fogColor) },
            fogNear: { type: 'f', value: 1.0 },
            fogFar: { type: 'f', value: opts.fogFar },
            grassFogFar: { type: 'f', value: opts.grassFogFar }
        },
        vertexShader: opts.vertScript,
        fragmentShader: fragScript
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    return mesh;
}
/**
 * @param cellSize Size of each mesh cell (quad)
 * @param xcount X vertex count
 * @param ycount Y vertex count
 */
function createVtxBuffers(cellSize, xcount, ycount) {
    var pos = new Float32Array(xcount * ycount * 3);
    var uv = new Float32Array(xcount * ycount * 2);
    var ix, iy;
    var x, y;
    var u, v;
    var i = 0;
    var j = 0;
    for (iy = 0; iy < ycount; ++iy) {
        y = (iy - ycount / 2.0) * cellSize;
        u = iy;
        for (ix = 0; ix < xcount; ++ix) {
            x = (ix - xcount / 2.0) * cellSize;
            v = ix;
            pos[i++] = x;
            pos[i++] = y;
            pos[i++] = 4.0 * Math.cos(ix * 1.0) + 4.0 * Math.sin(iy * 1.0);
            uv[j++] = u * TEX_SCALE;
            uv[j++] = v * TEX_SCALE;
        }
    }
    return { position: pos, uv: uv };
}
/**
 * @param xcount X vertex count
 * @param ycount Y vertex count
 */
function createIdBuffer(xcount, ycount) {
    var idSize = (xcount - 1) * (ycount - 1) * 3 * 2;
    var id;
    if (idSize <= 65536) {
        id = new Uint16Array(idSize);
    }
    else {
        id = new Uint32Array(idSize);
    }
    var xc = xcount - 1;
    var yc = ycount - 1;
    var x, y;
    for (y = 0; y < yc; ++y) {
        for (x = 0; x < xc; ++x) {
            var i = 6 * (y * xc + x);
            // tri 1
            id[i + 0] = (y + 0) * xcount + (x + 0);
            id[i + 1] = (y + 0) * xcount + (x + 1);
            id[i + 2] = (y + 1) * xcount + (x + 1);
            // tri 2
            id[i + 3] = (y + 1) * xcount + (x + 1);
            id[i + 4] = (y + 1) * xcount + (x + 0);
            id[i + 5] = (y + 0) * xcount + (x + 0);
        }
    }
    return id;
}