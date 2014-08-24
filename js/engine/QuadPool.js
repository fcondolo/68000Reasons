/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function QuadPool() {
	var t = this;	
	t.nextFreeIndex = 0;
	t.updateNeeded = false;
	t.quadsCount = 0;
	t.transfo = {x:0.0, y:0.0, rot:0.0};
	t.scale = {x:1.0, y:1.0};
}

QuadPool.prototype = {
	
	setQuadData : function(index, x1, y1, x2, y2, u1, v1, u2, v2) {
		var t = this;
		var ofs = index * t.itemSize * 6; // 6 points per quad
		t.vertices[ofs + 0] = x1;
		t.vertices[ofs + 1] = y1;
		t.vertices[ofs + 2] = u1;
		t.vertices[ofs + 3] = v1;
		
		t.vertices[ofs + 4] = x2;
		t.vertices[ofs + 5] = y1;
		t.vertices[ofs + 6] = u2;
		t.vertices[ofs + 7] = v1;

		t.vertices[ofs + 8] = x2;
		t.vertices[ofs + 9] = y2;
		t.vertices[ofs + 10] = u2;
		t.vertices[ofs + 11] = v2;

		t.vertices[ofs + 12] = x1;
		t.vertices[ofs + 13] = y1;
		t.vertices[ofs + 14] = u1;
		t.vertices[ofs + 15] = v1;

		t.vertices[ofs + 16] = x2;
		t.vertices[ofs + 17] = y2;
		t.vertices[ofs + 18] = u2;
		t.vertices[ofs + 19] = v2;

		t.vertices[ofs + 20] = x1;
		t.vertices[ofs + 21] = y2;
		t.vertices[ofs + 22] = u1;
		t.vertices[ofs + 23] = v2;
		
		t.numItems = Math.max(t.numItems, (index+1) * 6);
		t.updateNeeded = true;
		},
		
	create : function(gl, texture, quadsCount) {
		var t = this;
		t.tex = texture;
		t.quadsCount = quadsCount;
		var x = -1;
		var y = -1;
		var width = 2;
		var height = 2;
		var u0 = 0.0;
		var v0 = 0.0;
		var uSize = 1.0;
		var vSize = 1.0;
		var u1 = u0 + uSize;
		var v1 = v0 + vSize;

		t.itemSize = 4;	// number of floats that compose 1 vertex
		var oneQuadVertices = new Float32Array([
			x, y, u0, v0, 	// x2d, y2d, u, v
			x+width, y, u1, v0,
			x+width, y+height, u1, v1,
			x, y, u0, v0,
			x+width, y+height, u1, v1,
			x,y+height, u0, v1
			]);
		
		t.vertices = new Float32Array(quadsCount * t.itemSize * 6);
		var ofs = 0;
		for (var i = 0; i < quadsCount; i++){
			for (var j = 0; j < oneQuadVertices.length; j++, ofs++) {
				t.vertices[ofs] = oneQuadVertices[j];
			}
		}
		t.nextFreeIndex	= 0;
		t.vbuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, t.vbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, t.vertices, gl.STATIC_DRAW);
		t.updateNeeded = false;
		t.numItems = 0;
		},
	

	draw : function(gl, program) {
		var t = this;
		if (t.updateNeeded) {
			gl.bindBuffer(gl.ARRAY_BUFFER, t.vbuffer);
			gl.bufferData(gl.ARRAY_BUFFER, t.vertices, gl.STATIC_DRAW);
		}
		gl.enableVertexAttribArray(program.vertexData);
		gl.vertexAttribPointer(program.vertexData, t.itemSize, gl.FLOAT, false, 0, 0);
		gl.uniform3fv(program.transfo2D, [t.transfo.x, t.transfo.y, t.transfo.rot]);
		gl.uniform2fv(program.scale2D, [t.scale.x, t.scale.y]);
		engine.setTexture(t.tex, 0);
		gl.drawArrays(gl.TRIANGLES, 0, t.numItems);
		t.numItems = 0;
	}
}