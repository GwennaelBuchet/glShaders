/**
 * Created by gwennael.buchet on 13/04/17.
 */

class Mesh {

	constructor() {

		this.material = new Material();

		this.mvMatrix = mat4.create();
		this.nMatrix  = mat4.create();

		this.normalBuffer  = null;
		this.textureBuffer = null;
		this.vertexBuffer  = null;
		this.indexBuffer   = null;
	}

	setToProgram(program) {
		gl.uniformMatrix4fv(program.uMVMatrix, false, this.mvMatrix);
		gl.uniformMatrix4fv(program.nMatrix, false, this.nMatrix);

		this.material.setToProgram(program);
	}
}