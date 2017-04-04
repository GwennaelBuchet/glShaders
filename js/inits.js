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

function _loadShader(gl, source, type) {
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

function initShader(gl, programName, vertexShader, fragmentShader) {
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

function handleLoadedTexture(t) {
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function initTexture() {
    /*texture = gl.createTexture();
     texture.image = new Image();
     texture.image.onload = function () {
     handleLoadedTexture(texture)
     };

     texture.image.src = "../img/zenika_1.jpg";*/
}

function LoadFile(url) {
    return new Promise(function (resolve, reject) {
        const req = new XMLHttpRequest();

        req.onload = function () {
            if (this.status === 200) {
                resolve(req.responseText);
            } else {
                reject(Error("Unable to load '" + url + "' file: " + req.statusText));
            }
        };
        req.onerror = function () {
            reject(Error('There was a network error.'));
        };

        req.open('GET', url, true);
        req.send(null);
    });
}

function loadShaderFiles(urls) {

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
