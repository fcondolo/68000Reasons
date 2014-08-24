#ifdef GL_ES
precision highp float;
#endif

#define CENTERS_COUNT 4

uniform vec3 iResolution;
uniform float iGlobalTime;
uniform sampler2D uSampler0;
uniform vec2 centers[CENTERS_COUNT];
uniform float cosAmount;
uniform float amb;

const float PI = 3.14159265359;
float time = -iGlobalTime*7.0;

const vec3 eps = vec3(0.01, 0.0, 0.0);

vec2 rotateZ(vec2 v, float a)
{
	return vec2(cos(a) * v.x - sin(a) * v.y, sin(a) * v.x + cos(a) * v.y);
}	

float hash( vec2 p )
{
	float h = dot(p,vec2(127.1,311.7));
	
    return -1.0 + 2.0*fract(sin(h)*4378.5453123);
}

float noise( in vec2 p )
{
    vec2 i = floor( p );
    vec2 f = fract( p );
	
	vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( hash( i + vec2(0.0,0.0) ), 
                     hash( i + vec2(1.0,0.0) ), u.x),
                mix( hash( i + vec2(0.0,1.0) ), 
                     hash( i + vec2(1.0,1.0) ), u.x), u.y);
}

float shape(float len, float rad)
{
	float wave = sin((10.0 + 5.0 * (1.0-rad)) * PI * len + time);
	wave = (wave + 1.0) * 0.5; // <0 ; 1>
	wave -= 0.3;
	wave *= wave * wave;
//	wave = pow(wave,4.0);
	return wave;
}

void main(void)
{
	vec2 uv = (gl_FragCoord.xy / iResolution.xy);
	float uvl = clamp(1.0-length(uv-0.5)*2.0, 0.0, 1.0) * 0.15 * min(1.0, iGlobalTime * 0.1);
	float ratio = iResolution.x / iResolution.y;
	uv.x *= ratio;
	uv.x += (1.0-ratio)*0.5;

	vec2 pos2n;
	//uv.x *= iResolution.xy.x / iResolution.xy.y;
	vec4 final = vec4(1.0, 1.0, 1.0, 1.0);
	for (int i = 0; i<CENTERS_COUNT; i++) {
		vec2 pos2 = vec2(uv - centers[i]);
		pos2n = normalize(pos2);
		float len = length(pos2) * 2.25;
		float wave = shape(len, 1.0);
		vec2 uv2 = -pos2n * wave/(1.0 + 3.0 * len);
		vec4 col = texture2D(uSampler0, uv + uv2/(10.0*len+0.0001)) * (1.0+wave*uvl);
		//col.rgb *= 0.9;
		float m = min(1.0, max(0.0,1.0-(length(uv - 0.5))*1.0)); // default ambient near center
		m += 1.0/(8.8*len+0.0001); // circle
		col.rgb = (col.rgb + m * 0.5) * 0.7;
		final.rgb *= col.rgb;
	}
	
	float redplus = max(1.0-iGlobalTime*1.75, 0.0) * length(uv+0.5);
	float zoomer = abs(cos(iGlobalTime * 0.25)) * 0.2;
	uv *= 1.0-zoomer;
	vec2 uvprtcl = rotateZ(uv, iGlobalTime*0.2+uv.y);
	uvprtcl.y -= iGlobalTime * 0.2;
	uvprtcl.x += cos((iGlobalTime * 0.1 + uv.y) * 44.0) * 0.005 * sin(iGlobalTime * 0.25 + uv.x * 3.14);
	float prtcl = noise(uvprtcl * 80.0) - 0.65;
	prtcl = max(0.0, prtcl);
	final.rgb -= prtcl*0.25;
	final.r		*= 1.0+redplus;
	final.gb	*= 1.0-final.r*redplus;
	final.rgb *= amb;
	gl_FragColor = final;
}