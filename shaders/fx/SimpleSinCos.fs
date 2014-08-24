#ifdef GL_ES
precision highp float;
#endif

// CONSTANT NAMES SECTION (EXPECTED BY ENGINE)
uniform vec3 iResolution;
uniform float iGlobalTime;
uniform float beatBarFader;


void main(void)
{
	vec2 uv = gl_FragCoord.xy;
	uv /= iResolution.xy; 
	
	//vert bars
	float val = max(0.0, (beatBarFader+0.5+abs(cos(iGlobalTime)))*sin(uv.x * 20.457 + 5.0*iGlobalTime));
	float val2 = max(0.0, 0.8*sin(1.5 + uv.x * (30.457 + 10.0*abs(sin(uv.x*6.0+iGlobalTime))) + 4.5*iGlobalTime));
	float val3 = max(0.0, 0.6*sin(3.5 + uv.x * 80.457 + 4.25*iGlobalTime));
	float val4 = max(0.0, 0.4*sin(5.5 + uv.x * 160.457 + 4.0*iGlobalTime));
	
	// particles
//	float deltaY = max(0.0, 1.0 - min(0.001, abs(uv.y - mod(-iGlobalTime * 0.25 + cos(uv.x * 346487.8375), 1.0))) * 1000.0);
	
	float sum = (val+val2+val3+val4);
	val = sum;
	val *= 1.0-abs(0.5-uv.y);
	vec3 col1 = vec3(231.0/255.0, 88.0/255.0, 18.0/255.0);
	vec3 col2 = vec3(179.0/255.0, 38.0/255.0, 5.0/255.0);
	gl_FragColor.rgb = (col1*beatBarFader) * val + (col2*(1.0-beatBarFader)) * val;
	gl_FragColor.a = 1.0;
}