#define	RAYMARCH_ITERATION_HOP			s += f*0.003;
#define	RAYMARCH_STEP_SCALE			0.99
#define RAYMARCH_EPSILON 			0.01
#define	RAYMARCH_MAX_ITER 			100
#define	RAYMARCH_MAX_DIST			40.0

#define RAYMARCH_OVERLOAD_COMPUTE_COLOR
#define RAYMARCH_OVERLOAD_COMPUTE_NORMAL

const float sphRad = 8.0;

uniform float waveAmpl;

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

//Object
float obj(in vec3 p, in float f)
{ 	
	  vec4 tex = texture2D(uSampler0, abs(p.xy)*0.1);
	 p+= tex.xyz*waveAmpl;
	return sdSphere(p, sphRad);
}

vec3 computeColor(in vec3 p, in vec3 n, in float iter, in float dist, in vec3 phg) {
	//return n;
	vec4 tex = texture2D(uSampler0, n.xy);
	vec4 tex2 = texture2D(uSampler0, n.yz);
	return (tex.yxz * tex2.xyz);
//	return (tex.xyz + tex2.xyz)*0.7;// + vec3(abs(n.y)) * 0.5;
}

vec3 normal(in vec3 p, in float f)
{
    vec4 tex = texture2D(uSampler0, abs(p.xy*0.1));
	p+= tex.xyz*waveAmpl;
	return normalize(p);
}

