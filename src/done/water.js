"use strict";
//
// Water mesh
// A flat plane extending to frustum depth that follows
// viewer position horizontally.
// Shader does environmental mapping to reflect skydome,
// blend with water colour, and apply fog in distance.
//
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.createMesh = void 0;
// Uses water shaders (see: shader/water.*.glsl)
// LICENSE: MIT
// Copyright (c) 2016 by Mike Linkovich
/// <reference path="types/three-global.d.ts" />
var vec_1 = require("./vec");
var _time = 0;
/** Create Water Mesh */
function createMesh(opts) {
    opts.envMap.wrapS = opts.envMap.wrapT = THREE.RepeatWrapping;
    opts.envMap.minFilter = opts.envMap.magFilter = THREE.LinearFilter;
    opts.envMap.generateMipmaps = false;
    var mat = new THREE.RawShaderMaterial({
        uniforms: {
            time: { type: '1f', value: 0.0 },
            viewPos: { type: '3f', value: [0.0, 0.0, 10.0] },
            map: { type: 't', value: opts.envMap },
            waterLevel: { type: '1f', value: opts.waterLevel },
            waterColor: { type: '3f', value: vec_1.Color.toArray(opts.waterColor) },
            fogColor: { type: '3f', value: vec_1.Color.toArray(opts.fogColor) },
            fogNear: { type: 'f', value: 1.0 },
            fogFar: { type: 'f', value: opts.fogFar * 1.5 },
        },
        vertexShader: opts.vertScript,
        fragmentShader: opts.fragScript
    });
    var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000.0, 2000.0), mat);
    mesh.frustumCulled = false;
    _time = Date.now();
    return mesh;
}
exports.createMesh = createMesh;
function update(mesh, viewPos) {
    mesh.position.x = viewPos.x;
    mesh.position.y = viewPos.y;
    var mat = mesh.material;
    var vp = mat.uniforms['viewPos'].value;
    vp[0] = viewPos.x;
    vp[1] = viewPos.y;
    vp[2] = viewPos.z;
    mat.uniforms['time'].value = (Date.now() - _time) / 250.0;
}
exports.update = update;
