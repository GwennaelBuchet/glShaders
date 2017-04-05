/**
 * Created by gwennael.buchet on 04/04/17.
 */

function initGL() {
    return new Promise(function (resolve, reject) {
        try {
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
            canvasDimension.w = canvas.width;
            canvasDimension.h = canvas.height;
            resolve();
        } catch (e) {
            reject(Error("Could not initialise WebGL, sorry :-("));
        }

        if (!gl) {
            reject(Error("Could not initialise WebGL, sorry :-("));
        }
    });
}

function initLights() {
    /*gl.uniform3f(prg.uLightDirection, 0.0, -1.0, -1.0);
     gl.uniform4fv(prg.uLightAmbient, [0.03, 0.03, 0.03, 1.0]);
     gl.uniform4fv(prg.uLightDiffuse, [1.0, 1.0, 1.0, 1.0]);
     gl.uniform4fv(prg.uLightSpecular, [1.0, 1.0, 1.0, 1.0]);
     gl.uniform4fv(prg.uMaterialAmbient, [1.0, 1.0, 1.0, 1.0]);
     gl.uniform4fv(prg.uMaterialDiffuse, [0.5, 0.8, 0.1, 1.0]);
     gl.uniform4fv(prg.uMaterialSpecular, [1.0, 1.0, 1.0, 1.0]);
     gl.uniform1f(prg.uShininess, 230.0);*/
}

function _handleLoadedTexture(t) {
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function LoadTexture(couple) {
    return new Promise(function (resolve, reject) {

        let name = Object.keys(couple)[0];
        let url = couple[name];

        texture = gl.createTexture();
        texture.image = new Image();
        texture.image.onload = function () {
            _handleLoadedTexture(texture);

            textures[name] = texture;

            resolve();
        };

        texture.image.src = url;
    });
}

/**
 *
 * @param urls {Array} of objects with 1 attribute : {name : url}
 * @returns {Promise}
 */
function LoadTextures(urls) {
    return new Promise(function (resolve, reject) {

        let u = [];
        urls.forEach(function (couple) {
            u.push(new LoadTexture(couple));
        });

        Promise
            .all(u)
            .then(() => {
                resolve();
            }, reason => {
                reject(reason);
            });
    });
}


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

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

    gl.useProgram(null);

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
                    let vertexShader = _createShader(gl, shadersSource[0], "vs");
                    let fragmentShader = _createShader(gl, shadersSource[1], "fs");

                    //create shader program from shaders
                    shaderPrograms[program.name] = createShaderProgram(gl, vertexShader, fragmentShader);

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
