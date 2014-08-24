/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  LeavingBars() {
	var t = this;
}

LeavingBars.prototype = {
	preloadResources : function() {
		var t = this;
	},
	
	tick : function(time) {
		var t = this;

		t.elapsed += engine.deltaTime;

		for ( i = 0; i < t.count; i++) {
			if (t.elapsed < i * 0.15)
				break;
			if (null == t.bars[i].fadeOut) {
				t.bars[i].alpha = 1.0;
				t.bars[i].fadeOut = 1.0;
			}
			var newW = t.bars[i].w * (1.0-engine.deltaTime*6.0);
			newW =  Math.max(newW, 0.0);
			var deltaW = t.bars[i].w - newW;
			t.bars[i].w = newW;
			t.bars[i].x += deltaW * 0.5;
		//	t.bars[i].y = 1.0-t.bars[i].h*2.0;
		}
		return false;
	},

	enter : function() {
		var t = this;
		t.waitDone = false;
		t.elapsed = 0;
		t.bars = new Array();
		t.count = 20;
		t.barWidth = 1.0/t.count + 0.01;
		for ( i = 0; i < t.count; i++) {
			t.bars.push({x: i * t.barWidth, y: 0.0, w: t.barWidth, h:1.0, a:1.0, spd:0, done:false, fillStyle:"#FFFFFF"});
			engine.text2d.addRectangle(t.bars[i]);
		}
	},	

	exit : function() {
		engine.text2d.clearAllRectangles();
	},
	
	createFX : function(gl, hideText) {
	}
}

