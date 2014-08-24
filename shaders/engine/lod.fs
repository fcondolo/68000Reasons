#ifdef GL_ES
precision highp float;
#endif

// CONSTANT NAMES SECTION (EXPECTED BY ENGINE)
uniform vec3 iResolution;
uniform float iGlobalTime;
uniform sampler2D uSampler0;
varying vec2   vTextureCoord;

void main() {
	vec2 frag = vec2(gl_FragCoord.xy/iResolution.xy);
	gl_FragColor = texture2D(uSampler0, frag);
}
