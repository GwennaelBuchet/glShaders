function renderScene() {

    //for (let property in meshes) {
    //    if (meshes.hasOwnProperty(property)) {

    //        let mesh = meshes[property];

    let mesh = params.currentMesh;
    let program = params.currentShaderProgram;

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, sceneTranslation);
    mat4.multiply(mvMatrix, mvMatrix, sceneRotation);

    gl.uniformMatrix4fv(program.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, mvMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
    gl.vertexAttribPointer(program.vertexPositionAttribute, mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    if (program.textureCoordAttribute >= 0) {
        if (!mesh.textures.length) {
            gl.disableVertexAttribArray(program.textureCoordAttribute);
        }
        else {
            gl.enableVertexAttribArray(program.textureCoordAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
            gl.vertexAttribPointer(program.textureCoordAttribute, mesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
        }
    }

    if (program.vertexNormalAttribute >= 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
        gl.vertexAttribPointer(program.vertexNormalAttribute, mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    }

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

function hideLoader(canvas) {
    canvas.style.display = "block";

    let loader = document.getElementById("loader");
    loader.parentNode.removeChild(loader);
}

/**
 * Entry point for our application
 */
function main(models) {
    hideLoader(canvas);

    initGL()
        .then(function () {
            //initShaders();
            return loadShaders();
        })
        .then(function (shadersSource) {
            return initPrograms(shadersSource);
        })
        .then(function () {

            initTexture();

            meshes = models;

            params.currentMesh = meshes[Object.keys(meshes)[0]];
            params.renderingMode = gl.TRIANGLES;

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
        });
}

function initPrograms(shadersSource) {
    return new Promise(function (resolve, reject) {

        for (let i = 0, len = shadersSource.length; i < len; i += 2) {
            let vertexSource = _loadShader(gl, shadersSource[i], "vs");
            let fragmentSource = _loadShader(gl, shadersSource[i + 1], "fs");

            initShader(gl, "program_" + i, vertexSource, fragmentSource);
        }

        params.currentShaderProgram = shaderPrograms["program_0"];

        resolve();
    });
}

function loadShaders() {
    return new Promise(function (resolve, reject) {
        loadShaderFiles(["js/shaders/vs/simple.glsl", "js/shaders/fs/monochrome.glsl"])
            .then(
                function (shadersSource) {
                    resolve(shadersSource);
                }
            ).catch(
            function (error) {
                reject(error);
            });
    });
}

function loadMeshes() {
    OBJ.downloadMeshes({
            'Bootle': 'models/bottle.obj',
            'Driver': 'models/driver.obj',
            'Mei': 'models/mei.obj',
            'Skelout': 'models/internal_skelout_full.obj',
            'SpeedCar': 'models/SpeedCar.obj',
            'Teapot': 'models/teapot.obj',
            'Teddy': 'models/teddy.obj',
            'Tuna': 'models/tuna.obj',
            'Vi': 'models/vi.obj',
            'X-Wing': 'models/x-wing.obj'
        },
        main
    );
}
