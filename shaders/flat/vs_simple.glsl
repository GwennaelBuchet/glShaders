attribute vec3 aVertexPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

void main(void) {
    vec4 vertex = uMVMatrix * vec4(aVertexPosition, 1.0);

     vNormal = vec3(uNMatrix * vec4(aVertexNormal, 1.0));

    vEyeVec = -vec3(vertex.xyz);

    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}