/** 
	WebGL engine by Soundy / NGC a.k.a Frederic Condolo
**/

/**
 * @constructor
 */
function  ExplodingScreen() {
	var t = this;
}

ExplodingScreen.prototype = {
	preloadResources : function() {
		var t = this;
	},
	
	tick : function(time) {
		var t = this;

		t.elapsed += engine.deltaTime;
		if (t.elapsed > 20.0) {
			t.exit();
			return true;
		}
//		engine.text2d.rotation = t.elapsed*0.8;
		for ( i = 0; i < t.count; i++) {
			if (t.elapsed < i * 0.04)
				break;
			if (null == t.bars[i].fadeOut) {
				t.bars[i].alpha = 1.0;
				t.bars[i].fadeOut = 0.2;
				t.bars[i].fillStyle = "#FFAAFF";
			}
			
/*			var newW = t.bars[i].w * 0.99;
			var deltaW = newW - t.bars[i].w;
			t.bars[i].w -= deltaW * 0.5;
			t.bars[i].x += deltaW * 0.5;
			var newH = t.bars[i].h * 0.99;
			var deltaH = newH - t.bars[i].h;
			t.bars[i].h -= deltaH * 0.5;
			t.bars[i].y += deltaH * 0.5;*/
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
		t.xcount = 2;
		t.ycount = 2;
		t.barWidth = 1.0/t.xcount;
		t.barHeight = 1.0/t.ycount;
		t.count = 0;
		for (var yy = 0; yy < t.ycount; yy++) {
			for (var xx = 0; xx < t.xcount; xx++, t.count++) {
				t.bars.push({x: xx * t.barWidth, y: yy * t.barHeight, w: t.barWidth + 0.00001, h: t.barHeight + 0.00001, a:1.0, spd:0, done:false, fillStyle:"#FFFFFF"});
				engine.text2d.addRectangle(t.bars[t.count]);
			}
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

