/**
 * Created by gwennael.buchet on 04/04/17.
 */

let gl;
let canvas;
let canvasDimension = {};

let mvMatrix = mat4.create();
let pMatrix = mat4.create();

let shaderPrograms = {};
let meshes = {};

let params = {
    currentShaderProgram: null,
    currentMesh: null,

    isAnimated: true,
    renderingMode: null
};
