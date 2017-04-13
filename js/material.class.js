/**
 * Created by gwennael.buchet on 13/04/17.
 */

class Material {

	constructor() {
		this.ambiant  = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
		this.diffuse  = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
		this.specular = vec4.fromValues(1.0, 1.0, 1.0, 1.0);

		this.shininess = 200.0;

		this.textures = [];
	}

	setToProgram(program) {
		gl.uniform4fv(program.uMaterialAmbient, this.ambiant);
		gl.uniform4fv(program.uMaterialDiffuse, this.diffuse);
		gl.uniform4fv(program.uMaterialSpecular, this.specular);
		gl.uniform1f(program.uShininess, this.shininess);

		//todo : texture
	}
}
