/**
 * Created by gwennael.buchet on 04/04/17.
 */


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
