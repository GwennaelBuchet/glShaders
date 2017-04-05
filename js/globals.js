/**
 * Created by gwennael.buchet on 04/04/17.
 */

let gl;
const canvas = document.getElementById("scene");
let canvasDimension = {};

let mvMatrix = mat4.create();
let pMatrix = mat4.create();

let sceneTranslation = vec3.fromValues(0.0, 0.0, -10.0);
let sceneRotation = mat4.create();

let programsSources = [
    {"name": "yellow", "vs": "js/shaders/flat/vs_simple.glsl", "fs": "js/shaders/flat/fs_simple.glsl"},
    {"name": "white", "vs": "js/shaders/flat2/vs_simple.glsl", "fs": "js/shaders/flat2/fs_simple.glsl"}
];
let shaderPrograms = {};
let meshes = {};

let params = {
    currentShaderProgram: null,
    currentMesh: null,

    isAnimated: true,
    renderingMode: null
};

let animatedLoader = new AnimatedLoader("animatedLoader");


