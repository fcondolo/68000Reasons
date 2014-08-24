#ifdef GL_ES
precision highp float;
#endif

uniform vec3 iResolution;
uniform float iGlobalTime;
uniform float beatBarFader;
uniform float lum;

vec2 frag;


void main(){
	//float i = 0.5 + 0.5 * beatBarFader;
	frag = vec2(gl_FragCoord.xy/iResolution.xy) - 0.5;
	float v = abs(cos(iGlobalTime + frag.x * 30.0 * beatBarFader)) * lum;
	//v += abs(sin(iGlobalTime + frag.y * 30.0 * beatBarFader));
	gl_FragColor =  vec4(v,v,v, 1.0);
}			

