varying vec2 vUv;
uniform sampler2D map;
uniform vec2 lum;
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
	amask *= vertMask;

	// output texture with alpha-mask
	gl_FragColor = vec4(a.rgb,amask);
	// if ( gl_FragColor.a < 0.25 ) discard;
}