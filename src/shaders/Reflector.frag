#pragma glslify: blur = require('glsl-fast-gaussian-blur/9')

uniform vec3 color;
uniform sampler2D tDiffuse;
uniform sampler2D map;
varying vec4 vUv;
varying vec2 vUv2;
varying vec3 vPosition;

float blendOverlay( float base, float blend ) {
	return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );
}

vec3 blendOverlay( vec3 base, vec3 blend ) {
	return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );
}

const int samples = 16;
void main() {
	vec2 unproj2D = vec2 (vUv.s / vUv.q,
												vUv.t / vUv.q);

	float noise = texture2D(map, vUv2 * 3.0).r;
	float blurSize = 0.01;
	vec4 base = vec4(0.0);
	for (int i = 1; i < samples; i++) {
		base += texture2D(tDiffuse, unproj2D + vec2(0.0, float(i) * -blurSize) + vec2(noise * 0.01, noise * 10.0 * 0.01));
	}

	base /= float(samples);
			
	// gl_FragColor = vec4( blendOverlay( base.rgb * 1.0, color ), 1.0 );
	float dist = length(vPosition);
	gl_FragColor.rgb = max(base.rgb, 0.05);
	gl_FragColor.rgb += vec3((1.0 - smoothstep(0.0, 8.0, dist)) * noise * 0.1);

	gl_FragColor.a = 1.0;
	gl_FragColor.a *= 1.0 - smoothstep(4.5, 8.0, dist);
	// gl_FragColor.rgb = vec3(smoothstep(4.5, 7.5, length(vPosition)));
}