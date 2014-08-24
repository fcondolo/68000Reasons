#ifdef GL_ES
precision highp float;
#endif

// CONSTANT NAMES SECTION (EXPECTED BY ENGINE)
uniform vec3 iResolution;
uniform float iGlobalTime;
uniform float beatBarFader;

float rand(vec2 co){
//    return fract(sin(dot(co.xy ,vec2(4.9898,27.233))) * (2563628.5453));
    return fract(sin(dot(co.xy/(1.0+iGlobalTime*10.0) ,vec2(4.9898,27.233))) * (2563628.5453));
}

void main(void)
{
	vec2 uv = gl_FragCoord.xy;
	uv.x += iGlobalTime*200.56;
	uv /= iResolution.xy; 

	float flicker = 10.0;
		
	float freq = sin(pow(mod(iGlobalTime, flicker)+flicker, 1.9));
	
	float col = 0.5*(rand(uv+mod(iGlobalTime, freq)) + rand(uv+mod(iGlobalTime+.1, freq)));

	uv = gl_FragCoord.xy;
	uv.x += iGlobalTime*200.56+1.0;
	uv /= iResolution.xy; 
	col += 0.5*(rand(uv+mod(iGlobalTime, freq)) + rand(uv+mod(iGlobalTime+.1, freq)));

	uv = gl_FragCoord.xy;
	uv.x += iGlobalTime*200.56-1.0;
	uv /= iResolution.xy; 
	col += 0.5*(rand(uv+mod(iGlobalTime, freq)) + rand(uv+mod(iGlobalTime+.1, freq)));
	
	col *= 0.3;
	
	gl_FragColor = vec4(col,col,col,1.0);
}