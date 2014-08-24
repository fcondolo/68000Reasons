#ifndef RAYMARCH_ITERATION_HOP
	#define	RAYMARCH_ITERATION_HOP s += f*0.003;
#endif

#ifndef RAYMARCH_STEP_SCALE
	#define	RAYMARCH_STEP_SCALE 0.95
#endif

#ifndef RAYMARCH_EPSILON
	#define RAYMARCH_EPSILON 0.001
#endif

#ifndef RAYMARCH_MAX_ITER
	#define	RAYMARCH_MAX_ITER 256
#endif

#ifndef RAYMARCH_MAX_DIST
	#define	RAYMARCH_MAX_DIST 50.0
#endif

#ifndef RAYMARCH_RAY_START_MIN_DIST
	#define	RAYMARCH_RAY_START_MIN_DIST 0.1
#endif

uniform float RaymarchMinDistDistortion;
uniform float RaymarchRayModulus;


#ifndef RAYMARCH_OVERLOAD_COMPUTE_COLOR
	vec3 computeColor(in vec3 p, in vec3 n, in float iter, in float dist, in vec3 phg) {
		return n;
	}
#endif


#ifdef RAYMARCH_COMPUTE_PHONG
	const vec3 ambLight = vec3(0.1, 0.1, 0.1);
	const vec3 spotLightColor = vec3(1.0, 0.8, 0.3);
	const float spec=8.0;
	vec3 phong(
	  in vec3 pt,
	  in vec3 prp,
	  in vec3 normal,
	  in vec3 light,
	  in vec3 color,
	  in float spec,
	  in vec3 ambLight)
	{
	   vec3 lightv=normalize(light-pt);
	   float diffuse=dot(normal,lightv);
	   vec3 refl=-reflect(lightv,normal);
	   vec3 viewv=normalize(prp-pt);
	   float specular=pow(max(dot(refl,viewv),0.0),spec);
	   return (max(diffuse,0.0)+ambLight)*color+specular;
	}
#endif

#ifndef RAYMARCH_OVERLOAD_COMPUTE_NORMAL
	vec3 normal(in vec3 p, in float f)
	{
	  //tetrahedron normal
	  const float n_er=0.01;
	  float v1=obj(vec3(p.x+n_er,p.y-n_er,p.z-n_er), f);
	  float v2=obj(vec3(p.x-n_er,p.y-n_er,p.z+n_er), f);
	  float v3=obj(vec3(p.x-n_er,p.y+n_er,p.z-n_er), f);
	  float v4=obj(vec3(p.x+n_er,p.y+n_er,p.z+n_er), f);
	  return normalize(vec3(v4+v1-v3-v2,v3+v4-v1-v2,v2+v4-v3-v1));
	}
#endif

float raymarching(
  in vec3 prp,
  in vec3 scp,
  in float precis,
  in float startf,
  in float maxd,
  out int objfound,
  out float iterCount)
{ 
  const vec3 e=vec3(0.1,0,0.0);
  float s=startf;
  vec3 c,p,n;
  float f=startf;
  objfound=1;
  iterCount = 0.0;
  p = prp + RaymarchMinDistDistortion * scp * cos(iGlobalTime*0.2 + 4.0*prp.x);
  float eps = precis;
  for(int i=0;i<RAYMARCH_MAX_ITER;i++){
	if (abs(s)<eps||f>maxd) break;
	f+=s;
	p+=s*scp;
	s = RAYMARCH_STEP_SCALE * obj(p, f);
	iterCount += 1.0;
	RAYMARCH_ITERATION_HOP
  }
  if (f>maxd)
	objfound=-1;

	f = f*cos(f+iGlobalTime);
	// f = f-mod(f,RaymarchRayModulus); try this for music synchro
  return f;
}

vec3 camera(
  in vec3 prp,
  in float vpd)
{
  vec2 vPos=-1.0+2.0*frag;
  vec3 vpn=normalize(-prp);
  vec3 u=normalize(cross(iCameraUpVector, vpn));
  vec3 v=cross(vpn,u);
  vec3 scrCoord=prp+vpn*vpd+vPos.x*u*iResolution.x/iResolution.y+vPos.y*v;
  return normalize(scrCoord-prp);
}


vec3 render(
  in vec3 prp,
  in vec3 scp,
  in float precis,
  in float startf,
  in float maxd,
  in vec3 background,
  out vec3 n,
  out vec3 p,
  out float f,
  out int objfound)
{ 
  objfound=-1;
  float iterCount;
  f=raymarching(prp,scp,precis,startf,maxd,objfound, iterCount);
  if (objfound>0){
		vec3 phg = vec3(1.0,1.0,1.0);
		p=prp+scp*f;
		n=normal(p, f);
		#ifdef RAYMARCH_COMPUTE_PHONG
			vec3 spotLight=prp+vec3(5.0*cos(iGlobalTime),0,5.0*sin(iGlobalTime));
			phg=phong(p,prp,n,spotLight,spotLightColor,spec,ambLight);
		#endif
		return computeColor(p,n, iterCount, f, phg);
  }
  f=maxd;
  return vec3(0.0,0.0,0.0);//(background); //background color
}

void main(){
 frag = vec2(gl_FragCoord.xy/iResolution.xy);
  //Camera animation
			  
  vec3 scp=camera(iCameraTranslation,1.5);
  vec3 n,p;
  float f;
  int o;
  const float startf=RAYMARCH_RAY_START_MIN_DIST;
  const vec3 backc=vec3(0.8,0.9,1.0);
  
  vec3 c1=render(iCameraTranslation,scp,RAYMARCH_EPSILON,startf,RAYMARCH_MAX_DIST,backc,n,p,f,o);
  gl_FragColor = vec4(c1.xyz,1.0);				
}			

