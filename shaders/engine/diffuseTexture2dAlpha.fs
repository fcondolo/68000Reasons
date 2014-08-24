#ifdef GL_ES
precision highp float;
#endif

// CONSTANT NAMES SECTION (EXPECTED BY ENGINE)
uniform vec3 iResolution;
uniform float iGlobalTime;
uniform sampler2D uSampler0;
varying vec2   vTextureCoord;

void main() {
	vec4 col = texture2D(uSampler0, vTextureCoord);
	if (col.a < 0.5) 
		discard;	
	gl_FragColor = col;
}
