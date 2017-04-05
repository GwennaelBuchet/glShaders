/**
 * Created by gwennael.buchet on 04/04/17.
 */

function initGL() {
    return new Promise(function (resolve, reject) {
        try {
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
            canvasDimension.w = canvas.width;
            canvasDimension.h = canvas.height;
            resolve();
        } catch (e) {
            reject(Error("Could not initialise WebGL, sorry :-("));
        }

        if (!gl) {
            reject(Error("Could not initialise WebGL, sorry :-("));
        }
    });
}

function initLights() {
    /*gl.uniform3f(prg.uLightDirection, 0.0, -1.0, -1.0);
     gl.uniform4fv(prg.uLightAmbient, [0.03, 0.03, 0.03, 1.0]);
     gl.uniform4fv(prg.uLightDiffuse, [1.0, 1.0, 1.0, 1.0]);
     gl.uniform4fv(prg.uLightSpecular, [1.0, 1.0, 1.0, 1.0]);
     gl.uniform4fv(prg.uMaterialAmbient, [1.0, 1.0, 1.0, 1.0]);
     gl.uniform4fv(prg.uMaterialDiffuse, [0.5, 0.8, 0.1, 1.0]);
     gl.uniform4fv(prg.uMaterialSpecular, [1.0, 1.0, 1.0, 1.0]);
     gl.uniform1f(prg.uShininess, 230.0);*/
}
