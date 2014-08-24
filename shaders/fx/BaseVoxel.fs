#ifdef GL_ES
precision highp float;
#endif


uniform vec3 iResolution;
uniform vec3 backColor;
uniform float iGlobalTime;
uniform float tex1ratio;
uniform float tex2ratio;
uniform float prevtexratio;
uniform float curtexratio;
uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform sampler2D uSampler2;
uniform sampler2D uSampler3;
uniform float beatBarFader;

const int MAX_RAY_STEPS = 128;
const int MIN_ITER = 32;
vec2 frag;
vec4 texdata;
vec4 texpixdata;


bool getVoxel(ivec3 c, float fi) {
	vec3 p = vec3(c) + vec3(0.5);
	float z = mod(0.007*(p.z- 80.5), 1.0);
	vec2 p2 = p.xy * 0.01 + 0.5;
	vec4 col1 = texture2D(uSampler0, p2);
	texdata = col1 * tex1ratio + texture2D(uSampler1, p2) * tex2ratio;
	texpixdata = col1 * curtexratio + texture2D(uSampler2, p2) * prevtexratio;
	return texdata.a*z > 0.5;
}

vec2 rotate2d(vec2 v, float a) {
	float sinA = sin(a);
	float cosA = cos(a);
	return vec2(v.x * cosA - v.y * sinA, v.y * cosA + v.x * sinA);	
}

void main(void)
{
	float gtime = iGlobalTime*0.75;//3.141459*0.25*sin(iGlobalTime*0.5);
	frag = vec2(gl_FragCoord.xy/iResolution.xy) - 0.5;
	float rayZ = -35.0 + 5.0*beatBarFader*cos((frag.x*4.0+beatBarFader*2.0)*3.14129);
	float rayX = 0.0;
	float rayY = 40.0*iGlobalTime;
	vec3 cameraDir = vec3(0.0, 0.1, 0.8);
	vec3 cameraPlaneU = vec3(1.0, 0.0, 0.0);
	vec3 cameraPlaneV = vec3(0.0, 1.0, 0.0) * iResolution.y / iResolution.x;
	vec3 rayDir = cameraDir + (frag.x * cameraPlaneU + frag.y * cameraPlaneV)*4.0;
//	vec3 rayPos = vec3(0.0, 2.0 * sin(gtime * 2.7), -0.0);
	vec3 rayPos = vec3(rayX, rayY, rayZ);
	rayPos.xz = rotate2d(rayPos.xz, gtime);
	rayDir.xz = rotate2d(rayDir.xz, gtime);
	
	ivec3 mapPos = ivec3(floor(rayPos + 0.));

	vec3 deltaDist = abs(vec3(length(rayDir)) / rayDir);
	
	ivec3 rayStep = ivec3(sign(rayDir));

	vec3 sideDist = (sign(rayDir) * (vec3(mapPos) - rayPos) + (sign(rayDir) * 0.5) + 0.5) * deltaDist; 

	bvec3 mask;
	float fi = 1.0;
	for (int i = 0; i < MIN_ITER; i++) {
		bvec3 b1 = lessThan(sideDist.xyz, sideDist.yzx);
		bvec3 b2 = lessThanEqual(sideDist.xyz, sideDist.zxy);
		mask.x = b1.x && b2.x;
		mask.y = b1.y && b2.y;
		mask.z = b1.z && b2.z;		
		sideDist += vec3(mask) * deltaDist;
		mapPos += ivec3(mask) * rayStep;
		fi *= 1.04;
	}
	for (int i = MIN_ITER; i < MAX_RAY_STEPS; i++) {
		if (getVoxel(mapPos, fi)) break;
		bvec3 b1 = lessThan(sideDist.xyz, sideDist.yzx);
		bvec3 b2 = lessThanEqual(sideDist.xyz, sideDist.zxy);
		mask.x = b1.x && b2.x;
		mask.y = b1.y && b2.y;
		mask.z = b1.z && b2.z;
		
		sideDist += vec3(mask) * deltaDist;
		mapPos += ivec3(mask) * rayStep;
		fi *= 1.05;
	}

	vec3 color;

	color = vec3(float(mask.x) * 0.2 + float(mask.y) * 0.3 + float(mask.z) * 0.5);// * vec3(0.9, 0.9, 1.0);

	gl_FragColor.rgb = texdata.a * color * texpixdata.rgb *  2.0;//min(float(MAX_RAY_STEPS)/fi,2.0);
	gl_FragColor.rgb += abs(sin(float(mapPos.y)*0.5)* 0.2) * backColor * (1.0+beatBarFader*1.5);

	vec2 vignxy = vec2(clamp((frag.x - 0.3) * 5.0, 0.0, 1.0), clamp((frag.y+0.5) * 5.0, 0.0, 1.0));
	vec4 px = texture2D(uSampler0, vignxy);
	vec4 px2 = texture2D(uSampler1, vignxy);

	gl_FragColor.rgb += (0.5 + 3.0*max(beatBarFader-0.5, 0.0)) * (px.rgb * px.a * tex1ratio + px2.rgb * px2.a * tex2ratio);
	gl_FragColor.a = 1.0;
}