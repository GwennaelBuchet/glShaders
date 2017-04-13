/**
 * Created by gwennael.buchet on 13/04/17.
 */

class Mesh {

	constructor() {
		this.mvMatrix = mat4.create();
		this.pMatrix  = mat4.create();

		this.normalBuffer  = null;
		this.textureBuffer = null;
		this.vertexBuffer  = null;
		this.indexBuffer   = null;

		this.vertices      = [];
		this.vertexNormals = [];
		this.textures      = [];
		this.indices       = [];
	}

	initMeshBuffers(gl) {
		this.normalBuffer  = Mesh._buildBuffer(gl, gl.ARRAY_BUFFER, this.vertexNormals, 3);
		this.textureBuffer = Mesh._buildBuffer(gl, gl.ARRAY_BUFFER, this.textures, 2);
		this.vertexBuffer  = Mesh._buildBuffer(gl, gl.ARRAY_BUFFER, this.vertices, 3);
		this.indexBuffer   = Mesh._buildBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, this.indices, 1);
	}

	deleteMeshBuffers(gl) {
		gl.deleteBuffer(this.normalBuffer);
		gl.deleteBuffer(this.textureBuffer);
		gl.deleteBuffer(this.vertexBuffer);
		gl.deleteBuffer(this.indexBuffer);
	}

	static _buildBuffer(gl, type, data, itemSize) {
		let buffer    = gl.createBuffer();
		let arrayView = type === gl.ARRAY_BUFFER ? Float32Array : Uint16Array;
		gl.bindBuffer(type, buffer);
		gl.bufferData(type, new arrayView(data), gl.STATIC_DRAW);
		buffer.itemSize = itemSize;
		buffer.numItems = data.length / itemSize;
		return buffer;
	}
}