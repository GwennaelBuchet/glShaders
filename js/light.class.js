/**
 * Created by gwennael.buchet on 13/04/17.
 */

class Light {

	constructor() {
		this.position = vec3.create();

		this.ambiant = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
		this.diffuse = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
		this.specular = vec4.fromValues(1.0, 1.0, 1.0, 1.0);

	}
}