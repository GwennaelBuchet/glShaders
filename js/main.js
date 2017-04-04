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

    shaderPrograms.simple = shaderProgram;

    params.currentShaderProgram = shaderPrograms.simple;
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

    //for (let property in meshes) {
    //    if (meshes.hasOwnProperty(property)) {

    //        let mesh = meshes[property];

    let mesh = params.currentMesh;
    let program = params.currentShaderProgram;

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, vec3.fromValues(0, 0, -10));
    mat4.multiply(mvMatrix, mvMatrix, sceneRotationMatrix);

    gl.uniformMatrix4fv(program.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, mvMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
    gl.vertexAttribPointer(program.vertexPositionAttribute, mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    if (!mesh.textures.length) {
        gl.disableVertexAttribArray(program.textureCoordAttribute);
    }
    else {
        // if the texture vertexAttribArray has been previously
        // disabled, then it needs to be re-enabled
        gl.enableVertexAttribArray(program.textureCoordAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
        gl.vertexAttribPointer(program.textureCoordAttribute, mesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
    gl.vertexAttribPointer(program.vertexNormalAttribute, mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    gl.drawElements(params.renderingMode, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    //    }
    //}
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
                params.isAnimated = !params.isAnimated;
                break;
            case "Enter" :
                mat4.identity(sceneRotationMatrix);
                break;
            case "w" :
                params.renderingMode = gl.LINES;
                break;
            case "t" :
                params.renderingMode = gl.TRIANGLE_STRIP;
                break;
            case "f":
                toggleFullscreen(canvas, gl, canvasDimension);
                break;

            default:
                return; // Quit when this doesn't handle the key event.
        }

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

function initMenu() {

    let _m = [];
    for (let property in meshes) {
        if (meshes.hasOwnProperty(property)) {
            _m.push(property)
        }
    }


    let gui = new dat.gui.GUI();
    let ctrlMesh = gui.add(params, 'currentMesh', _m).name("Model");
    ctrlMesh.onFinishChange(function(value) {
        params.currentMesh = meshes[value];
    });

    gui.add(params, 'isAnimated').name('Animation');

    let f1 = gui.addFolder('Rendering');
    f1.add(params, 'currentShaderProgram', shaderPrograms);
    f1.add(params, 'renderingMode', {
        Points: gl.POINTS,
        Wire: gl.LINES,
        Triangles: gl.TRIANGLES
    }).name("Rendering Mode");
}

/**
 * Entry point for our application
 */
function main(models) {
    const canvas = document.getElementById("scene");

    initGL(canvas);
    initShaders();
    initTexture();

    params.currentMesh = models['Teapot'];
    params.renderingMode = gl.TRIANGLES;
    meshes = models;

    initKeyboard();
    initMouse();
    initMenu();

    if (gl) {
        // initialize the VBOs
        for (let property in meshes) {
            if (meshes.hasOwnProperty(property)) {
                OBJ.initMeshBuffers(gl, meshes[property]);
            }
        }

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
            'Teapot': 'models/teapot.obj',
            'Tuna': 'models/tuna.obj',
            'X-Wing': 'models/x-wing.obj',
            'SpeedCar': 'models/SpeedCar.obj',
            'Bootle': 'models/bottle.obj',
            'Cube': 'models/cube.obj',

        },
        main
    );
}
