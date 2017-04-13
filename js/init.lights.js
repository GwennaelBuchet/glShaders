/**
 * Created by gwennael.buchet on 05/04/17.
 */

function initLights() {
	for (let i = 0; i < NB_LIGHT; i++) {
		let light = new Light();

		lights.push(light);
	}
}
