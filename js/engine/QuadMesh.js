/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function QuadMesh() {
	var t = this;	
	t.transfo = {x:0.0, y:0.0, rot:0.0};
	t.scale = {x:1.0, y:1.0};
}

QuadMesh.prototype = {
	create : function(gl,x,y,width,height, u0, v0, uSize, vSize) {
		var t = this;
		u0 = u0 || 0.0;
		v0 = v0 || 0.0;
		uSize = uSize || 1.0;
		vSize = vSize || 1.0;
		var u1 = u0 + uSize;
		var v1 = v0 + vSize;
		
		t.vertices = new Float32Array([
			x, y, u0, v0, 	// x2d, y2d, u, v
			x+width, y, u1, v0,
			x+width, y+height, u1, v1,
			x, y, u0, v0,
			x+width, y+height, u1, v1,
			x,y+height, u0, v1
			]);
		
		t.itemSize = 4;	// number of floats that compose 1 vertex
		t.vbuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, t.vbuffer);					
		gl.bufferData(gl.ARRAY_BUFFER, t.vertices, gl.STATIC_DRAW);
		t.numItems = t.vertices.length / t.itemSize;
		},
	
	update : function(gl,x,y,width,height, u0, v0, uSize, vSize) {
		var t = this;
		u0 = u0 || 0.0;
		v0 = v0 || 0.0;
		uSize = uSize || 1.0;
		vSize = vSize || 1.0;
		var u1 = u0 + uSize;
		var v1 = v0 + vSize;
		
		t.vertices = new Float32Array([
			x, y, u0, v0, 	// x2d, y2d, u, v
			x+width, y, u1, v0,
			x+width, y+height, u1, v1,
			x, y, u0, v0,
			x+width, y+height, u1, v1,
			x,y+height, u0, v1
			]);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, t.vbuffer);					
		gl.bufferData(gl.ARRAY_BUFFER, t.vertices, gl.STATIC_DRAW);
		},

	draw : function(gl, program) {
		var t = this;
		gl.bindBuffer(gl.ARRAY_BUFFER, t.vbuffer);					
		gl.enableVertexAttribArray(program.vertexData);
		gl.vertexAttribPointer(program.vertexData, t.itemSize, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(program.vertexData);
		gl.vertexAttribPointer(program.vertexData, t.itemSize, gl.FLOAT, false, 0, 0);
		gl.uniform3fv(program.transfo2D, [t.transfo.x, t.transfo.y, t.transfo.rot]);
		gl.uniform2fv(program.scale2D, [t.scale.x, t.scale.y]);
		gl.drawArrays(gl.TRIANGLES, 0, t.numItems);	
	}
}