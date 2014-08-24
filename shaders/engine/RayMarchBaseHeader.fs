#ifdef GL_ES
precision highp float;
#endif


uniform vec3 iResolution;
uniform vec3 iCameraTranslation;
uniform vec3 iCameraUpVector;
uniform float iGlobalTime;
uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform sampler2D uSampler2;


vec2 frag;

