#ifdef HOVER
	#define SILHOUETTE true
#endif

#ifndef HOVER
	#define SILHOUETTE false
#endif

varying vec2 vUv;
varying float vHover;

uniform sampler2D map;
uniform vec2 lum;
uniform float uHover;
vec4 lumcoeff = vec4(0.299,0.587,0.114,0.);

void main()
{   
	//punktfarbe in variable a speichern
	vec4 a = texture2D(map, vUv);

	//float ref = (a.r + a.b) / 2.0;
	float ref = a.r;
	if(ref < a.b) ref = a.b;
	float amask = a.g - ref;
	//amask = step(0.15,amask);
	amask = smoothstep(lum.x, lum.y ,amask);//low high value
	float vertMask = smoothstep(0.0,0.25,vUv.y);

	//invert the key
	amask = 1.0 - amask;
	// amask *= vertMask;

	// output texture with alpha-mask
	if (SILHOUETTE) {
		gl_FragColor = vec4(a.rgb * 0.0, amask * vHover);
	} else {
		gl_FragColor = vec4(a.rgb, amask * uHover);
	}
	if ( gl_FragColor.a < 0.01 ) discard;
}