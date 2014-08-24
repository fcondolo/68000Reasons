/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  FourBars_Vert() {
	var t = this;
	t.elapsed = 0.0;
	t.entered = false;
	t.exited = false;
}

FourBars_Vert.prototype = {
	preloadResources : function() {
		var t = this;
	},
	
	
	tick : function(time) {
		var t = this;
		if (!t.entered)
			t.enter();

		if (t.elapsed > 2.0) {
			t.exit();
			return true;
		}
		t.elapsed += engine.deltaTime;			

		var newX = Math.floor(t.elapsed * 4.0)/4.0; 
		if (t.bar.x != newX) {
			t.bar.alpha = 0.8;
			t.bar.a = 0.8;
			t.bar.fadeOut = 0.9;
		}
		t.bar.x = newX;
		return false;
	},

	enter : function() {
		var t = this;
		t.entered = true;
		engine.addCanvasClient(engine.frontCanvas);
		t.elapsed = 0.0;
		t.bar = {x: 0.0, y: 0.0, w: 1.0/4.0, h:1.0, a:1.0, alpha:1.0, done:false, fillStyle:"#AA5533"};
		engine.text2d.addRectangle(t.bar);
	},	

	exit : function() {
		var t = this;
		if (t.exited)
			return;
		t.entered = false;
		t.exited = true;
		engine.text2d.clearAllRectangles();
		engine.removeCanvasClient(engine.frontCanvas);
	},
	
	createFX : function(gl, hideText) {
	}
}

