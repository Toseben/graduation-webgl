uniform mat4 textureMatrix;
varying vec4 vUv;
varying vec2 vUv2;
varying vec3 vPosition;

void main() {
	vUv = textureMatrix * vec4( position, 1.0 );
	vUv2 = uv;
	vPosition = position;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}