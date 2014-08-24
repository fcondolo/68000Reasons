/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  LeavingBars_Rot() {
	var t = this;
}

LeavingBars_Rot.prototype = {
	preloadResources : function() {
		var t = this;
	},
	
	tick : function(time) {
		var t = this;
		var dt = engine.deltaTime * 2.0;
		if (beatHandler.lastGetDataIsBeat == 2)
			dt *= 3.0;

		t.elapsed += dt;
		if (t.elapsed > 0.5 && !t.bars[0].fadeOut) {
			for ( i = 0; i < t.count; i++)
				t.bars[i].fadeOut = 3.0;
		}
		if (t.elapsed > 6.0) {
			t.exit();
			return true;
		}
		engine.text2d.rotation += dt*0.8;
		for ( i = 0; i < t.count; i++) {
			if (t.elapsed < i * 0.15)
				break;
			if (null == t.bars[i].fadeOut) {
				t.bars[i].alpha = 1.0;
				t.bars[i].fillStyle = "#FFFFFF";
			}
			
			if (i&1 == 1) {
				var newH = t.bars[i].h * (1.0-dt*0.4);
				newH =  Math.max(newH, 0.0);
				var deltaH = t.bars[i].h - newH;
				t.bars[i].h = newH;
			} else {
				var newY = t.bars[i].y + dt*1.5;
				t.bars[i].y = newY;
			}
		}
		return false;
	},

	enter : function() {
		var t = this;
		engine.addCanvasClient(engine.frontCanvas);
		t.waitDone = false;
		t.elapsed = 0;
		t.exited = null;
		t.bars = new Array();
		t.count = 8;
		t.barWidth = 1.0/t.count;
		for ( var i = 0; i < t.count; i++) {
			t.bars.push({x: i * t.barWidth, y: -2.0, w: t.barWidth + 0.001, h:3.0, a:1.0, spd:0, done:false, fillStyle:"#FFFFFF"});
			engine.text2d.addRectangle(t.bars[i]);
			i++;
			t.bars.push({x: i * t.barWidth, y: -2.0, w: t.barWidth + 0.001, h:3.0, a:1.0, spd:0, done:false, fillStyle:"#FFFFFF"});
			engine.text2d.addRectangle(t.bars[i]);
		}
	},	

	exit : function() {
		var t = this;
		if (null == t.exited) {
			t.exited = true;
			engine.text2d.clearAllRectangles();
			engine.text2d.clearRotation();
			engine.removeCanvasClient(engine.frontCanvas);
		}
	},
	
	createFX : function(gl, hideText) {
	}
}

