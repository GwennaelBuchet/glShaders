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

function _handleLoadedTexture(t) {
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function _loadTexture(url) {
    return new Promise(function (resolve, reject) {

        let name = couple[Object.keys(couple)[0]];
        let url = couple[Object.keys(couple)[1]];

        texture = gl.createTexture();
        texture.image = new Image();
        texture.image.onload = function () {
            _handleLoadedTexture(texture);
            resolve(name, texture);
        };

        texture.image.src = url;

        resolve();
    });
}

/**
 *
 * @param urls {Array} of objects with 1 attribute : {name : url}
 * @returns {Promise}
 */
function initTexture(urls) {
    return new Promise(function (resolve, reject) {

        let u = [];
        urls.forEach(function (couple) {
            u.push(new _loadTexture(couple));
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

function createShaderProgram(gl, programName, vertexShader, fragmentShader) {
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

    shaderPrograms[programName] = shaderProgram;
}

/**
 * 'Shaders' global attribute contains VS abd FS in the same order [vs, fs, vs, fs, vs, fs, ...].
 * Programs will be created with the pairs of shaders.
 * @param shaders
 * @returns {Promise}
 */
function initPrograms(shaders) {
    return new Promise(function (resolve, reject) {

        for (let i = 0, len = shaders.length; i < len; i += 2) {
            let vertexShader = shaders[i];
            let fragmentShader = shaders[i + 1];

            createShaderProgram(gl, "program_" + i, vertexShader, fragmentShader);
        }

        params.currentShaderProgram = shaderPrograms["program_0"];

        resolve();
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////:
// Loading and creating shaders

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

function _loadShaders(shadersSource) {

    return new Promise(function (resolve, reject) {
        for (let i = 0, len = shadersSource.length; i < len; i += 2) {
            let vertexShader = _createShader(gl, shadersSource[i], "vs");
            let fragmentShader = _createShader(gl, shadersSource[i + 1], "fs");

            shaders.push(vertexShader);
            shaders.push(fragmentShader);
        }

        resolve();
    });
}

function _loadShaderFiles(urls) {

    return new Promise(function (resolve, reject) {
        let u = [];
        urls.forEach(function (url) {
            u.push(new LoadFile(url));
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

function loadShaders() {
    return new Promise(function (resolve, reject) {
        _loadShaderFiles(["js/shaders/vs/simple.glsl", "js/shaders/fs/monochrome.glsl"])
            .then(function (shadersSource) {
                    return _loadShaders(shadersSource);
                }
            )
            .then(function () {
                resolve();
            })

            .catch(
                function (error) {
                    reject(error);
                });
    });
}
