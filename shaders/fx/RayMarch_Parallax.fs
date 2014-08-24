#define	RAYMARCH_ITERATION_HOP		s += f*0.003;
#define	RAYMARCH_STEP_SCALE			0.999
#define RAYMARCH_EPSILON 			0.01
#define	RAYMARCH_MAX_ITER 			100
#define	RAYMARCH_MAX_DIST			40.0

#define RAYMARCH_OVERLOAD_COMPUTE_COLOR
#define RAYMARCH_OVERLOAD_COMPUTE_NORMAL
#define RAYMARCH_COMPUTE_PHONG

const vec3 modulus = vec3 (5.0,5.0,5.0);
const float sphRad = 3.5;

uniform float	iTex0Ratio;
uniform float	iTex1Ratio;
uniform float 	beatBarFader;
uniform float 	xofs;


vec2 rotateZ(vec2 v, float a)
{
	return vec2(cos(a) * v.x - sin(a) * v.y, sin(a) * v.x + cos(a) * v.y);
}

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

//Object
float obj(in vec3 p, in float f)
{ 	
	vec3 q = mod(p,modulus)-0.5*modulus;
	return sdSphere(q, sphRad + f*0.01*(20.5+21.0*sin(iGlobalTime*1.0)));
}

vec3 computeColor(in vec3 p, in vec3 n, in float iter, in float dist, in vec3 phg) {
	vec4 tex = texture2D(uSampler0, n.xy) * iTex0Ratio + texture2D(uSampler1, n.xy) * iTex1Ratio;
	tex *= texture2D(uSampler2, abs(n.xy));
	float fog = beatBarFader * (abs(dist)*0.25);
	return tex.xyz * (phg + (0.3 + n.y * 0.7)) + fog * vec3(0.5, 0.3, 0.2);
}

vec3 normal(in vec3 p, in float f)
{
	vec3 q = mod(p,modulus)-0.5*modulus;
	return normalize(q);
}
