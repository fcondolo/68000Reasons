/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function Sprite() {
	var t = this;
}

Sprite.prototype = {
	create : function(gl, texture) {
		var t = this;
		t.tex = texture;
		t.quad = new QuadMesh();

		t.quad.create(gl, -1.0, -1.0, 2.0, 2.0);
		},
	
	draw : function(gl, program) {
		var t = this;
		if (!t.quad)
			return; // may not be created yet
		engine.setTexture(t.tex, 0);
		t.quad.draw(gl, program);
	},
	
	setScale : function(x, y) {
		var t = this;
		if (!t.quad)
			return; // may not be created yet
		t.quad.scale.x = x;
		t.quad.scale.y = y;
	},

	setTransfo : function(x, y, rot) {
		var t = this;
		if (!t.quad)
			return; // may not be created yet
		t.quad.transfo.x = x;
		t.quad.transfo.y = y;
		t.quad.transfo.rot = rot;
	}
}