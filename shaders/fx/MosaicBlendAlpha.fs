#ifdef GL_ES
precision highp float;
#endif

// CONSTANT NAMES SECTION (EXPECTED BY ENGINE)
uniform vec3 iResolution;
uniform float iGlobalTime;
uniform sampler2D uSampler0;
uniform float tilenum;
uniform float beatBarFader;
uniform float torsion;
uniform float alphamult;
uniform float addColor;
varying vec2   vTextureCoord;

void main() {
	float dx = abs(vTextureCoord.x - beatBarFader * 0.5);
	float tn = tilenum/(1.0+torsion*20.0);// - tilenum / (tilenum*(1.1+dx)*0.15);
	vec2 uv = floor(vTextureCoord*tn)/tn;
	uv.x -= 0.5;
	uv.y -= 0.5;
	uv.x *= 1.0+0.08*dx;
	uv.y *= 1.0+0.08*dx;
	//uv.y *= 1.0 + vTextureCoord.x * 3.5 * torsion;
	//uv.x *= 1.0 + torsion * 3.5;
	uv.x += 0.5;
	uv.y += 0.5;
	uv.x = clamp(uv.x, 0.0, 0.99999);
	uv.y = clamp(uv.y, 0.0, 0.99999);
	vec4 col = texture2D(uSampler0, uv);
	col.rgb += beatBarFader * 0.08 + addColor;
	col.a *= alphamult;
	gl_FragColor = col;
}
