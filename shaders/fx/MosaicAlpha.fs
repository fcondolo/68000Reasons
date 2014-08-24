#ifdef GL_ES
precision highp float;
#endif

// CONSTANT NAMES SECTION (EXPECTED BY ENGINE)
uniform vec3 iResolution;
uniform float iGlobalTime;
uniform sampler2D uSampler0;
uniform float tilenum;
uniform float ColorFader;
uniform float beatBarFader;
varying vec2   vTextureCoord;

void main() {
	float dx = abs(vTextureCoord.x - beatBarFader * 0.5);
	float tn = tilenum;// - tilenum / (tilenum*(1.1+dx)*0.15);
	vec2 uv = floor(vTextureCoord*tn)/tn;
	uv.x -= 0.5;
	uv.y -= 0.5;
	uv.x *= 1.0+0.08*dx;
	uv.y *= 1.0+0.08*dx;
	uv.x += 0.5;
	uv.y += 0.5;
	uv.x = clamp(uv.x, 0.0, 0.99999);
	uv.y = clamp(uv.y, 0.0, 0.99999);
	vec4 col = texture2D(uSampler0, uv);
	if (col.a < 0.8) 
		discard;	
	col.rgb += ColorFader + beatBarFader * 0.08;
	//col.a = 0.1;
	gl_FragColor = col;
}

