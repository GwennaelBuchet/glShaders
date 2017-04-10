/**
 * Created by gwennael.buchet on 05/04/17.
 */
function _handleLoadedTexture(t) {
	gl.bindTexture(gl.TEXTURE_2D, t);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

function LoadTexture(couple) {
	return new Promise(function (resolve, reject) {

		let name = Object.keys(couple)[0];
		let url  = couple[name];

		texture              = gl.createTexture();
		texture.image        = new Image();
		texture.image.onload = function () {
			_handleLoadedTexture(texture);

			textures[name] = texture;

			resolve();
		};

		texture.image.src = url;
	});
}

/**
 *
 * @param urls {Array} of objects with 1 attribute : {name : url}
 * @returns {Promise}
 */
function LoadTextures(urls) {
	return new Promise(function (resolve, reject) {

		let u = [];
		urls.forEach(function (couple) {
			u.push(new LoadTexture(couple));
		});

		Promise
			.all(u)
			.then(() => {
				resolve();
			}, reason => {
				reject(reason);
			});
	});
}