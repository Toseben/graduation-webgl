uniform vec3 color;
uniform sampler2D tDiffuse;
varying vec4 vUv;

float blendOverlay( float base, float blend ) {
	return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );
}

vec3 blendOverlay( vec3 base, vec3 blend ) {
	return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );
}

void main() {
	vec4 base = texture2DProj( tDiffuse, vUv);
	gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );
	gl_FragColor.rgb += max(gl_FragColor.rgb, 0.15);
	// gl_FragColor = vec4( vUv.x, vUv.y, 0.0, 1.0 );
}