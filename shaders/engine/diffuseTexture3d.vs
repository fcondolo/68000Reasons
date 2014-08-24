uniform mat4 u_modelViewProjMatrix;
uniform mat4 u_normalMatrix;
uniform vec3 u_lightDir;

attribute vec2 vTexCoord;
attribute vec3 vNormal;
attribute vec3 vPosition;

varying float v_Dot;
varying vec2 v_texCoord;

void main()
{
	gl_Position = u_modelViewProjMatrix * vec4(vPosition, 1);
	v_texCoord = vTexCoord;
	vec4 transNormal = u_normalMatrix * vec4(vPosition, 1);
	v_Dot = max(dot(transNormal.xyz, u_lightDir), 0.0);
}