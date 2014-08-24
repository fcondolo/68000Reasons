/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function PrisonBox() {
	var t = this;
	t.vlines = new Array();
	t.hlines = new Array();
	t.linesMultweight = 0.0;
	t.texturesPath = "data/";
}

PrisonBox.prototype = {
	
	init : function(program, gl) {
		program.vlines = gl.getUniformLocation(program, "vlines");
		program.hlines = gl.getUniformLocation(program, "hlines");
		program.linescolors = gl.getUniformLocation(program, "linescolors");
	},

	preloadResources : function() {
		var t = this;
		t.tex = resman.prefetchTexture(t.texturesPath + "metalblur.png");
	},
				
	calLineWeight : function(time, offset) {
		return linesMultweight * (0.3 + 4.0 * Math.abs(Math.cos(time*0.15+ Math.PI*offset/4.0)));
	},

	tick : function(time, gl, program) {
		var t = this;
		linesMultweight = Math.abs(0.01*Math.cos(time * 0.025));
		t.vlines[0] = -0.5;
		t.vlines[1] = t.calLineWeight(time, 1.0);
		t.vlines[2] = 0.5;
		t.vlines[3] = t.calLineWeight(time, 2.0);
		t.hlines[0] = -0.5;
		t.hlines[1] = t.calLineWeight(time, 3.0);
		t.hlines[2] = 0.5;
		t.hlines[3] = t.calLineWeight(time, 4.0);
		
		gl.uniform2fv(program.vlines, t.vlines);
		gl.uniform2fv(program.hlines, t.hlines);
		gl.uniform3fv(program.linescolors, [1,1,1]);
		engine.setTexture(t.tex, 0);
	}
}


