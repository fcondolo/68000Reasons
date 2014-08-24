#ifdef GL_ES
precision highp float;
#endif

#define CENTERS_COUNT 8

// CONSTANT NAMES SECTION (EXPECTED BY ENGINE)
uniform vec3 iResolution;
uniform float iGlobalTime;
uniform float iAmbient;

// FREE NAMES SECTION
uniform vec3 centers[CENTERS_COUNT];
uniform vec3 colors[CENTERS_COUNT];
uniform float beatBarFader;
uniform float deviation;

vec2 frag;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(4.9898,27.233))) * (2563628.5453));
}
float rand2(float y){
    return sin(y * 3.456897);
}

vec2 rotateZ(vec2 v, float a)
{
	return vec2(cos(a) * v.x - sin(a) * v.y, sin(a) * v.x + cos(a) * v.y);
}	

void main(void){
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	
	frag = vec2(gl_FragCoord.xy/iResolution.xy) - 0.5;
	frag.x += 2.0*deviation*rand(vec2(0.0, frag.y));
	frag.y += 4.0*deviation*cos(frag.x * 6.14159 +iGlobalTime);
	
	float fi = 1.0;
	float totalWeight = 0.0;
	float prcaSin = sin(iGlobalTime*0.05)*30.0;
	float sinTime = -abs(sin(10.0*prcaSin*(frag.x * 10.0)));
	float cosTime = -abs(cos(10.0*prcaSin*(frag.y * 10.0))  + sin(iGlobalTime * 0.1 + frag.x * frag.y * 10.0));
	float boost = 5.0+3.0*sinTime;
	
	// VORONOI POINTS
	vec2 distortcoord = vec2(
	frag.x + abs(prcaSin*0.02)*cos(iGlobalTime*0.15+frag.y*7.0)*cos(prcaSin*frag.y),
	frag.y + abs(prcaSin*0.02)*sin(iGlobalTime*0.25+frag.x*6.0)*sin(prcaSin*frag.x)); // plasma!

	distortcoord = rotateZ(distortcoord, prcaSin*(length(frag)-iGlobalTime*0.07));
	for (int i = 0; i<CENTERS_COUNT; i++) {
		float len = 2.0*length(centers[i].xy - distortcoord.xy) / centers[i].z;
		
		float smallAngle = abs(atan(cosTime*iGlobalTime + (frag.x - centers[i].x) * 800.0*sinTime*cos(iGlobalTime+fi+len*prcaSin), sinTime*iGlobalTime + (frag.y - centers[i].y) * abs(sin(iGlobalTime+fi+len*prcaSin)))) *  (5.0 + 4.0*sin(fi+len+iGlobalTime)) + boost;
		float gradient = pow(max(1.0 - (2.1 * len), 0.0), 3.0);
		gl_FragColor.xyz  += gradient * smallAngle * colors[i] * (1.0+beatBarFader);
		
		fi += 1.0;
	}

					
	// FINAL COLOR
	gl_FragColor.xyz  /= (fi-1.0);
	gl_FragColor.xyz  += iAmbient;	
}			

