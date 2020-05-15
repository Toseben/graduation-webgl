varying vec2 vUv;
uniform sampler2D map;
uniform vec2 lum;
uniform float uHover;
vec4 lumcoeff = vec4(0.299,0.587,0.114,0.);

void main()
{   
	vec4 a = texture2D(map, vUv);

	float ref = a.r;
	if (ref < a.b) ref = a.b;
	float amask = a.g - ref;
	amask = smoothstep(lum.x, lum.y ,amask);
	amask = 1.0 - amask;

	gl_FragColor = vec4(a.rgb, amask * uHover);
	if ( gl_FragColor.a < 0.01 ) discard;
}