#ifdef GL_ES
precision highp float;
#endif

#define CENTERS_COUNT 16
#define BEAM_RAD 1.5	// smaller values for bigger rad

// CONSTANT NAMES SECTION (EXPECTED BY ENGINE)
uniform vec3 iResolution;
uniform float iGlobalTime;
uniform float beatBarFader;

// FREE NAMES SECTION
uniform vec3 centers[CENTERS_COUNT];
uniform vec3 colors[CENTERS_COUNT];

vec2 frag;

vec2 rotateZ(vec2 v, float a)
{
	return vec2(cos(a) * v.x - sin(a) * v.y, sin(a) * v.x + cos(a) * v.y);
}			

vec4 main2(void){
	vec4 ret = vec4(0.0, 0.0, 0.0, 1.0);
	vec2 coord = vec2(gl_FragCoord.xy/iResolution.xy)- 0.5;
	frag = rotateZ(coord, 2.0*sin(iGlobalTime*0.08)*length(gl_FragCoord.xy/iResolution.xy));
	//frag = coord;
	float fi = 1.0;
	float maxdist = 0.5; // half of the screen
	vec3 smallColor;
	float totalWeight = 0.0;
	float smalldist = length(centers[0].xy - frag.xy) / centers[0].z;
	float prevsmalldist = smalldist;
	smallColor = colors[0];
//	float maxlen = 5.0*sin(iGlobalTime*0.25);
	// VORONOI POINTS
	for (int i = 0; i<CENTERS_COUNT; i++) {
		totalWeight += centers[i].z;
//		float len = max(2.0*length(centers[i].xy - frag.xy) / centers[i].z, maxlen);
		float len = length(centers[i].xy - frag.xy) / centers[i].z;
		if (len < smalldist+abs(coord.x)*0.04) {
			prevsmalldist = smalldist;
			smalldist = len;
			smallColor = colors[i];
		}
		fi += 1.0;
	}
	// FINAL COLOR
	float avgWeight = clamp(totalWeight / fi, 0.01, 1.0);
//	float gradient = pow(clamp(1.0 - (8.0 * smalldist / (maxdist * avgWeight)), 0.0, 10.0), 3.0);
	float gradient = pow(clamp(1.0 - (BEAM_RAD * smalldist / (maxdist * avgWeight)), 0.0, 10.0), 2.0);
//	float value = sqrt((prevsmalldist-smalldist) * avgWeight);
	float value = 3.5*sqrt((prevsmalldist-smalldist) * avgWeight);
	vec3 v3 = vec3(value, value, value);
//	ret.xyz  = gradient*2.0*(1.0+beatBarFader) + v3 * smallColor.xyz;
	ret.xyz  = v3* smallColor.xyz;
	return ret;
}			

void main() {
	gl_FragColor = main2();
}
