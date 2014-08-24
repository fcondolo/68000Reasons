attribute vec4 vertexData;
uniform vec3 transfo2D;
uniform vec2 scale2D;
varying vec2 vTextureCoord;

vec2 rotate2D(vec2 v, float a)
{
	return vec2(cos(a) * v.x - sin(a) * v.y, sin(a) * v.x + cos(a) * v.y);
}	

void main() {
	gl_Position = vec4(rotate2D(vertexData.xy * scale2D, transfo2D.z)  + transfo2D.xy, 0.0, 1.0);
	vTextureCoord = vertexData.zw;
}			
