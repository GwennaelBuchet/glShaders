let gl;
let canvas;
let canvasDimension = {};

let shaderPrograms = [];
let currentShaderProgram = null;
let mvMatrix = mat4.create();
let pMatrix = mat4.create();

let meshes = {};
let currentMesh = null;

let isAnimated = true;
let renderingModes = null;

function initGL(canvasElt) {
    try {
        gl = canvasElt.getContext("webgl") || canvasElt.getContext("experimental-webgl");
        gl.viewportWidth = canvasElt.width;
        gl.viewportHeight = canvasElt.height;
        canvasDimension.w = canvasElt.width;
        canvasDimension.h = canvasElt.height;
        canvas = canvasElt;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

function _loadShader(gl, id) {
    let shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    let source = "";
    let k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType === 3) {
            source += k.textContent;
        }
        k = k.nextSibling;
    }

    let shader;
    if (shaderScript.type === "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type === "x-shader/x-vertex") {
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

function initShaders() {
    let fragmentShader = _loadShader(gl, "fs-monochrome");
    let vertexShader = _loadShader(gl, "vs-simple");

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
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

    shaderPrograms["simple"] = shaderProgram;

    currentShaderProgram = shaderPrograms["simple"];
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

function renderScene() {

    //Object.keys(meshes)

    for (let property in meshes) {
        if (meshes.hasOwnProperty(property)) {

            let mesh = meshes[property];

            mat4.identity(mvMatrix);
            mat4.translate(mvMatrix, mvMatrix, vec3.fromValues(0, 0, -10));
            mat4.multiply(mvMatrix, mvMatrix, sceneRotationMatrix);

            gl.uniformMatrix4fv(currentShaderProgram.pMatrixUniform, false, pMatrix);
            gl.uniformMatrix4fv(currentShaderProgram.mvMatrixUniform, false, mvMatrix);

            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
            gl.vertexAttribPointer(currentShaderProgram.vertexPositionAttribute, mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

            if (!mesh.textures.length) {
                gl.disableVertexAttribArray(currentShaderProgram.textureCoordAttribute);
            }
            else {
                // if the texture vertexAttribArray has been previously
                // disabled, then it needs to be re-enabled
                gl.enableVertexAttribArray(currentShaderProgram.textureCoordAttribute);
                gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
                gl.vertexAttribPointer(currentShaderProgram.textureCoordAttribute, mesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
            gl.vertexAttribPointer(currentShaderProgram.vertexNormalAttribute, mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
            gl.drawElements(gl.TRIANGLES, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }
    }

    /*
     gl.uniform1f(shaderProgram.alphaUniform, square.alpha);

     gl.activeTexture(gl.TEXTURE0);
     gl.bindTexture(gl.TEXTURE_2D, texture);
     gl.uniform1i(shaderProgram.samplerUniform, 0);
     */
}


/**
 * Main rendering loop
 */
function render() {
    requestAnimFrame(render);

    //gl.clearColor(1, 1, 1, 1);
    //gl.colorMask(false, false, false, true);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    renderScene();
}

function initKeyboard() {
    window.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }

        switch (event.key) {
            case " " :
                isAnimated = !isAnimated;
                break;
            case "Enter" :
                mat4.identity(sceneRotationMatrix);
                break;
            case "w" :
                renderingModes = gl.LINES;
                break;
            case "t" :
                renderingModes = gl.TRIANGLE_STRIP;
                break;
            case "f":
                toggleFullscreen(canvas, gl, canvasDimension);
                break;

            default:
                return; // Quit when this doesn't handle the key event.
        }

        console.log("deltaZ = " + deltaZ);

        event.preventDefault();
    }, true);
}

let mouseDown = false;
let lastMouseX = null;
let lastMouseY = null;
let sceneRotationMatrix = mat4.create();
function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {
    if (!mouseDown) {
        return;
    }
    let newX = event.clientX;
    let newY = event.clientY;

    let deltaX = newX - lastMouseX;
    let newRotationMatrix = mat4.create();
    mat4.identity(newRotationMatrix);
    mat4.rotate(newRotationMatrix, newRotationMatrix, degToRad(deltaX / 10), vec3.fromValues(0, 1, 0));

    let deltaY = newY - lastMouseY;
    mat4.rotate(newRotationMatrix, newRotationMatrix, degToRad(deltaY / 10), vec3.fromValues(1, 0, 0));

    mat4.multiply(sceneRotationMatrix, newRotationMatrix, sceneRotationMatrix);

    lastMouseX = newX;
    lastMouseY = newY;
}

function initMouse() {
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
}

/**
 * Entry point for our application
 */
function main(models) {
    const canvas = document.getElementById("scene");

    initGL(canvas);
    initShaders();
    renderingModes = gl.TRIANGLE_STRIP;

    initKeyboard();
    initMouse();

    initTexture();

    if (gl) {
        meshes = models;
        // initialize the VBOs
        OBJ.initMeshBuffers(gl, meshes.teapot);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        render();
    }
}

function loadMeshes() {
    OBJ.downloadMeshes({
            'teapot': 'models/teapot.obj'
        },
        main
    );
}
