function drawMesh(mesh, program) {

	//todo : to have 2 mvMatrix : 1 global + 1 per mesh
	mat4.identity(mesh.mvMatrix);
	mat4.translate(mesh.mvMatrix, mesh.mvMatrix, sceneTranslation);
	mat4.multiply(mesh.mvMatrix, mesh.mvMatrix, sceneRotation);

	gl.useProgram(program);

	gl.uniformMatrix4fv(program.uPMatrix, false, pMatrix);

	lights.forEach(function (light) {
		light.setToProgram(program);
	});

	mesh.setToProgram(program);


	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
	gl.vertexAttribPointer(program.aVertexPosition, mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	//if (program.aTextureCoord >= 0) {
	if (!mesh.material.textures.length) {
		gl.disableVertexAttribArray(program.aTextureCoord);
	}
	else {
		gl.enableVertexAttribArray(program.aTextureCoord);
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
		gl.vertexAttribPointer(program.aTextureCoord, mesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	}
	//}

	//if (program.aVertexNormal >= 0) {
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
	gl.vertexAttribPointer(program.aVertexNormal, mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	//}

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
	gl.drawElements(params.renderingMode, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

	gl.useProgram(null);
}

function drawScene() {

	//gl.clearColor(1, 1, 1, 1);
	//gl.colorMask(false, false, false, true);
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 500.0);

	//for (let property in meshes) {
	//    if (meshes.hasOwnProperty(property)) {
	//        let mesh = meshes[property];
	let mesh    = params.currentMesh;
	let program = params.currentShaderProgram;

	drawMesh(mesh, program);
}

function animate() {

}

/**
 * Main rendering loop
 */
function renderLoop() {
	requestAnimFrame(renderLoop);
	drawScene();

	if (params.isAnimated)
		animate();
}

/**
 * Entry point for our application
 */
function main() {
	animatedLoader.setText("Loading Meshes ...");

	animatedLoader.setText("Initializing GL Scene ...");
	initGL()
		.then(function () {
			return OBJ.downloadMeshes(meshSources);
		})
		.then(function (m) {
			animatedLoader.setText("Initializing VBOs ...");
			// initialize the VBOs

			m.forEach(function (mesh) {
				OBJ.initMeshBuffers(gl, mesh);

				let newMesh = new Mesh();

				newMesh.indexBuffer   = mesh.indexBuffer;
				newMesh.vertexBuffer  = mesh.vertexBuffer;
				newMesh.textureBuffer = mesh.textureBuffer;
				newMesh.normalBuffer  = mesh.normalBuffer;

				newMesh.material.textures = mesh.textures;

				meshes.push(newMesh);
			});
			params.currentMesh = meshes[0];

			animatedLoader.setText("Loading SL Programs ...");
			return loadPrograms();
		})
		.then(function () {
			animatedLoader.setText("Loading Textures ...");
			return LoadTextures();
		})
		.then(function () {
			params.renderingMode = gl.TRIANGLES;

			animatedLoader.setText("Initializing Lights");
			initLights();

			animatedLoader.setText("Initializing Controllers and Menu ...");
			initKeyboard();
			initMouse();
			initMenu();

			if (gl) {

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

				renderLoop();
			}
		});
}
