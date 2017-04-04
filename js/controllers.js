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
                mat4.identity(sceneRotation);
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

    mat4.multiply(sceneRotation, newRotationMatrix, sceneRotation);

    lastMouseX = newX;
    lastMouseY = newY;
}

function handleMouseWheel(event) {
    sceneTranslation[2] += event.deltaY / 50.0;
}

function initMouse() {
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    let mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel"; //FF doesn't recognize mousewheel as of FF3.x
    if (document.attachEvent) //if IE (and Opera depending on user setting)
        document.attachEvent("on" + mousewheelevt, handleMouseWheel);
    else if (document.addEventListener) //WC3 browsers
        document.addEventListener(mousewheelevt, handleMouseWheel, false);
}

function initMenu() {
    let _m = [];
    for (let property in meshes) {
        if (meshes.hasOwnProperty(property)) {
            _m.push(property)
        }
    }

    let gui = new dat.gui.GUI();
    let ctrlMesh = gui.add(params, 'currentMeshName', _m).name("Model");
    ctrlMesh.onFinishChange(function (value) {
        params.currentMeshName = meshes[value];
    });

    gui.add(params, 'isAnimated').name('Animation');

    let f1 = gui.addFolder('Rendering');
    f1.add(params, 'currentShaderProgramName', shaderPrograms);
    f1.add(params, 'renderingMode', {
        Points: gl.POINTS,
        Wire: gl.LINES,
        Triangles: gl.TRIANGLES
    }).name("Rendering Mode");
}

