/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  PointsMover(_mode, _count, _scale) {
	var t = this;
	t.mode = _mode;
	t.scale = _scale;
	t.count = _count;
	t.coord = [];
	t.rotated = [];
	for (var i = 0; i < t.count; i++) {
		switch(t.mode) {
			case 0 :	// Line
				t.coord.push((i - t.count * 0.5) / t.count);
				t.coord.push(0.0);
				t.coord.push(0.0);
			break;
			case 1 :	// XY Circle
				t.coord.push(Math.cos(i * 3.14159 * 2.0 / t.count));
				t.coord.push(Math.sin(i * 3.14159 * 2.0 / t.count));
				t.coord.push(0.0);
			break;
			case 2 :	// Cross
				if (i <= t.count * 0.5) {
					t.coord.push((i - t.count * 0.25) / (t.count * 0.05));
					t.coord.push(0.0);
				} else {
					t.coord.push(0.0);
					t.coord.push((i*0.5 - t.count * 0.25) / (t.count * 0.05));
				}
				t.coord.push(0.0);
			break;
			case 3 :	// Spriral
				t.coord.push(Math.cos(i * 3.14159 * 2.0 / t.count));
				t.coord.push(Math.sin(i * 3.14159 * 2.0 / t.count));
				t.coord.push(i);
			break;
		}
	}
	for (var i = 0; i < t.coord.length; i++)
		t.coord[i] *= t.scale;
}

PointsMover.prototype = {

	update : function(time) {
		var t = this;
		t.coord = [];
		t.rotated = [];
		for (var i = 0; i < t.count; i++) {
			var i2 = (i+time)%t.count;
			var i3 = time*0.1+i;
			switch(t.mode) {
				case 0 :	// Line
					t.coord.push((i2 - t.count * 0.5) / t.count);
					t.coord.push(0.0);
					t.coord.push(0.0);
				break;
				case 1 :	// XY Circle
					t.coord.push(0.25*Math.cos(i3 * 3.14159 * 2.0 / t.count));
					t.coord.push(0.25*Math.sin(i3 * 3.14159 * 2.0 / t.count));
					t.coord.push(0.0);
				break;
				case 2 :	// Cross
					t.coord.push(0.0);
					t.coord.push(((2.0*time + i3)%(1.1*t.count) - t.count * 0.5) / t.count);
					t.coord.push(0.0);
				break;
				case 3 :	// Spriral
					t.coord.push(0.15*Math.cos(i3 * 3.14159 * 0.3 / t.count));
					t.coord.push(0.15*Math.sin(i3 * 3.14159 * 0.3 / t.count));
					t.coord.push(Math.abs(Math.sin(i*2.02+time*0.05)));
				break;
			}
		}
		for (var i = 0; i < t.coord.length; i++)
			t.coord[i] *= 2.0+2.0*Math.abs(Math.sin(i*(2.0 + 0.1*Math.cos(time*0.25))+time*0.25));
	},

	rotateZ : function(angle) {
		var t = this;
		var ccos = Math.cos(angle);
		var ssin = Math.sin(angle);
		for (var i = 0; i < t.coord.length; i++) {
			var px = t.coord[i*3];
			var py = t.coord[i*3+1];
			var pz = t.coord[i*3+2];
			t.rotated[i*3] =  px * ccos - py * ssin;
			t.rotated[i*3+1] = py * ccos + px * ssin;
			t.rotated[i*3+2] = pz;
		}
	},
	
	rotateX : function(angle) {
		var t = this;
		var ccos = Math.cos(angle);
		var ssin = Math.sin(angle);
		for (var i = 0; i < t.coord.length; i++) {
			var px = t.coord[i*3];
			var py = t.coord[i*3+1];
			var pz = t.coord[i*3+2];
			t.rotated[i*3] =  px;
			t.rotated[i*3+1] = py * ccos - pz * ssin;
			t.rotated[i*3+2] = py * ssin + pz * ccos;
		}
	},
	
	rotateY : function(angle) {
		var t = this;
		var ccos = Math.cos(angle);
		var ssin = Math.sin(angle);
		for (var i = 0; i < t.coord.length; i++) {
			var px = t.coord[i*3];
			var py = t.coord[i*3+1];
			var pz = t.coord[i*3+2];
			t.rotated[i*3] =  px * ccos + pz * ssin
			t.rotated[i*3+1] = py;
			t.rotated[i*3+2] = -px * ssin + pz * ccos;
		}
	}

}
