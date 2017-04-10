/**
 * Created by gwennael.buchet on 05/04/17.
 */

/**
 *
 * @param gl {WebGLRenderingContext} Global webgl context of the application
 * @param source {String} Source code for the shader to create
 * @param type {String} "fs" || "x-shader/x-fragment" || "vs" || "x-shader/x-vertex"
 * @returns {WebGLShader || null}
 * @private
 */
function _createShader(gl, source, type) {
	let shader;
	if (type === "fs" || type === "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (type === "vs" || type === "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

function _setUniform(gl, program, uniform) {
	let uniformLocation = gl.getUniformLocation(program, uniform);
	if (uniformLocation !== null)
		program[uniform] = uniformLocation;
}

function createShaderProgram(gl, vertexShader, fragmentShader) {
	let shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
	if (shaderProgram.vertexNormalAttribute >= 0)
		gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	if (shaderProgram.textureCoordAttribute >= 0)
		gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

	_setUniform(gl, shaderProgram, "uPMatrix");
	_setUniform(gl, shaderProgram, "uMVMatrix");
	_setUniform(gl, shaderProgram, "uNMatrix");
	_setUniform(gl, shaderProgram, "uMaterialAmbient");
	_setUniform(gl, shaderProgram, "uMaterialDiffuse");
	_setUniform(gl, shaderProgram, "uMaterialSpecular");
	_setUniform(gl, shaderProgram, "uShininess");
	_setUniform(gl, shaderProgram, "uLightAmbient");
	_setUniform(gl, shaderProgram, "uLightDiffuse");
	_setUniform(gl, shaderProgram, "uLightSpecular");
	_setUniform(gl, shaderProgram, "uLightDirection");

	return shaderProgram;
}

/**
 *
 * @param program
 * @returns {Promise}
 * @constructor
 */
function LoadProgram(program) {
	return new Promise(function (resolve, reject) {
		//load files content for the couple vs/fs
		_loadShaderFilesContent([program.vs, program.fs])

			.then(function (shadersSource) {
					//create vs and fs shaders from the contents previously loaded
					let vertexShader   = _createShader(gl, shadersSource[0], "vs");
					let fragmentShader = _createShader(gl, shadersSource[1], "fs");

					//create shader program from shaders
					let p                        = createShaderProgram(gl, vertexShader, fragmentShader);
					p.name                       = program.name;
					shaderPrograms[program.name] = p;

					resolve();
				}
			)
	});
}

/**
 * Load all shader programs for the applications
 * @returns {Promise}
 */
function loadPrograms() {
	return new Promise(function (resolve, reject) {

		//For each program :
		//  - load vs & fs content from files
		//  - create vs and fs shader from contents
		//  - create shader program from vs and fs

		let p = [];
		programsSources.forEach(function (program) {
			p.push(new LoadProgram(program));
		});

		Promise
			.all(p)
			.then(() => {
				//set the first program as the current one
				params.currentShaderProgram = shaderPrograms[programsSources[0].name];

				resolve();
			}, reason => {
				reject(reason);
			});
	});
}

/**
 * Load files content
 * @param shaderFiles {Array} of filenames
 * @returns {Promise}
 * @private
 */
function _loadShaderFilesContent(shaderFiles) {

	return new Promise(function (resolve, reject) {
		let u = [];
		shaderFiles.forEach(function (shaderFile) {
			u.push(new LoadFile(shaderFile));
		});

		Promise
			.all(u)
			.then(values => {
				resolve(values);
			}, reason => {
				reject(reason);
			});
	});
}