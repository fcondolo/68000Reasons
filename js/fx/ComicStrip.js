/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  ComicStrip() {
	var t = this;
	t.elapsed = 0.0;
	t.entered = false;
	t.exited = false;
	t.count = 16.0;
}

ComicStrip.prototype = {
	preloadResources : function() {
		var t = this;
		t.img = resman.prefetchTexture("data/MIFB.PNG", true);
	},
	
	
	tick : function(time) {
		var t = this;
		if (!t.entered)
			t.enter();

		if (engine.time >= 85.0 && !t.flashed2) {
				t.flashed2  = true;
		}
		if (engine.time >= 85.5 && !t.flashed) {
				t.flashed  = true;
		//		engine.text2d.clearAllRectangles();
				engine.addCanvasClient(engine.frontCanvas);
				t.exit();
				engine.text2d.addRectangle(t.bar);
				engine.text2d.closeAllIn(2.0);
				return true;
		}

		t.elapsed += engine.deltaTime;			

		var index = Math.floor(t.elapsed * t.count);
		if (index >= t.bars.length) {
		} else if (t.bars[index].added < 0.0) {
			t.bars[index].fadeOut = 300.0;
			engine.text2d.addRectangle(t.bars[index]);
			t.bars[index].added = t.elapsed * 0.25;
		}
		
		for (var i = 0; i < t.bars.length; i++) {
			if (t.bars[i].added >= 0.0) {
				var newW = t.sw * Math.abs(Math.sin((t.elapsed-t.bars[i].added) * t.count * 0.15));
				var deltaW = newW - t.sw;
				t.bars[i].a = 0.5 + newW/t.sw;
				t.bars[i].w = newW;
				t.bars[i].x = i * t.step - deltaW * 0.5;
				t.bars[i].fadeOut = 2.0;
			}
		}
		return false;
	},

	enter : function() {
		var t = this;
		t.flashed = false;
		t.flashed2  = false;

		t.entered = true;
		engine.addCanvasClient(engine.frontCanvas);
		t.elapsed = 0.0;
		t.step = 1.0/t.count;
		t.sw = t.step;
		var sh = 1.0;
		var su1 = 1024.0/t.count
		t.bars = [];
		for (var i = 0; i < t.count; i++)
		 t.bars.push({img: t.img.texture.image, x:i*t.step, y:0.0, w: t.sw, h:sh, a:1.0, done:false, fillStyle:"#FFFFFF", added:-1.0, u0:su1*i, v0:0.0, u1:su1, v1:576});
		t.bar = {x: 0.0, y: 0.0, w: 1.0, h:1.0, alpha:1.0, fillStyle:"#FFFFFF", fadeOut:1.5};
	},	

	exit : function() {
		var t = this;
		if (t.exited)
			return;
		t.entered = false;
		t.exited = true;
		engine.removeCanvasClient(engine.frontCanvas);
		for (var i = 0; i < t.bars.length; i++) {
			if (null == t.bars[i].fadeOut)
				t.bars[i].fadeOut = 10.7;
		}
	},
	
	createFX : function(gl, hideText) {
	}
}

