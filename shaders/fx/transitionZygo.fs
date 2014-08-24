#ifdef GL_ES
precision highp float;
#endif


uniform vec3 iResolution;
uniform float iGlobalTime;
uniform sampler2D uSampler0;
uniform float lum;


void main(void){
  vec2 pos = vec2(gl_FragCoord.xy/iResolution.xy) * 0.5 + 0.25;
  vec4 col = texture2D(uSampler0, pos);
  float li = abs(2.0*cos(pos.x * 20.0+10.0*iGlobalTime)+4.0*sin(pos.y*20.0*cos(iGlobalTime)+5.0*iGlobalTime))/8.0;
  col.rgb -= li * lum * 2.0;
  gl_FragColor = col;
}
