/**
 * Created by gwennael.buchet on 04/04/17.
 */

let gl;
const canvas        = document.getElementById("scene");
let canvasDimension = {};

let mvMatrix = mat4.create();
let pMatrix  = mat4.create();
let nMatrix  = mat4.create();

let sceneTranslation = vec3.fromValues(0.0, 0.0, -10.0);
let sceneRotation    = mat4.create();

let programsSources = [
	{"name": "white", "vs": "shaders/flat/vs_simple.glsl", "fs": "shaders/flat/fs_simple.glsl"},
	//{"name": "phong", "vs": "shaders/phong/vs_phong.glsl", "fs": "shaders/phong/fs_phong.glsl"}
];
let shaderPrograms  = {};

let meshSources = {
	/*'Bootle'  : 'models/bottle.obj',
	'Driver'  : 'models/driver.obj',
	'Mei'     : 'models/mei.obj',
	'Skelout' : 'models/internal_skelout_full.obj',
	'SpeedCar': 'models/SpeedCar.obj',*/
	'Teapot'  : 'models/teapot.obj',
	/*'Teddy'   : 'models/teddy.obj',
	'Tuna'    : 'models/tuna.obj',
	'Vi'      : 'models/vi.obj',
	'X-Wing'  : 'models/x-wing.obj'*/
};
let meshes      = [];

let texturesURLs = [
	{"zenika_beach": "img/zenika_beach.jpg"}
];
let textures     = {};

let params = {
	currentShaderProgram: null,
	currentMesh         : null,

	isAnimated   : true,
	renderingMode: null
};

let animatedLoader = new AnimatedLoader("animatedLoader");


