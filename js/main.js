function renderScene() {

    //for (let property in meshes) {
    //    if (meshes.hasOwnProperty(property)) {

    //        let mesh = meshes[property];

    let mesh = params.currentMesh;
    let program = params.currentShaderProgram;

    gl.useProgram(program);

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

    gl.useProgram(null);
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
    mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 500.0);

    renderScene();
}

/**
 * Entry point for our application
 */
function main() {
    animatedLoader.setText("Loading Meshes ...");

    OBJ.downloadMeshes(meshSources)
        .then(function (m) {
            meshes = m;
            params.currentMesh = meshes[Object.keys(meshes)[0]];

            animatedLoader.setText("Initializing GL Scene ...");
            initGL();
        })
        .then(function () {
            animatedLoader.setText("Loading SL Programs ...");
            return loadPrograms();
        })
        .then(function () {
            animatedLoader.setText("Loading Textures ...");
            return LoadTextures(texturesURLs);
        })
        .then(function () {

            animatedLoader.setText("Initializing Lights ...");
            initLights();

            params.renderingMode = gl.TRIANGLES;

            animatedLoader.setText("Initializing Controllers and Menu ...");
            initKeyboard();
            initMouse();
            initMenu();

            if (gl) {
                animatedLoader.setText("Initializing VBOs ...");
                // initialize the VBOs
                for (let property in meshes) {
                    if (meshes.hasOwnProperty(property)) {
                        OBJ.initMeshBuffers(gl, meshes[property]);
                    }
                }

                animatedLoader.setText("Initializing Rendering ...");
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                gl.enable(gl.BLEND);
                gl.disable(gl.DEPTH_TEST);

                animatedLoader.setText("Start Rendering ...");
                animatedLoader.destroy(canvas);

                render();
            }
        });
}

