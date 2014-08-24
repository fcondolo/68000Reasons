/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  ComicStrip2() {
	var t = this;
	t.elapsed = 0.0;
	t.entered = false;
	t.exited = false;
	var mid = 1.0/8.0;
	var step = 1.0/4.0;
	t.text = [
	{x:mid-mid*0.4, y:0.5, string:"Gimme", fillStyle:"#FFFFFF", fadeOut:1.0, font:50},
	{x:mid-mid*0.4+1.0*step, y:0.5, string:"moar", fillStyle:"#FFFFFF", fadeOut:1.0, font:50},
	{x:mid-mid*0.4+2.0*step, y:0.5, string:"plazma", fillStyle:"#FFFFFF", fadeOut:1.0, font:50},
	{x:mid+3.0*step, y:0.5, string:"!", fillStyle:"#FFFFFF", fadeOut:1.0, font:50}
	];
	t.bar = {x: 0.0, y: 0.0, w: engine.frontCanvas.width, h:engine.frontCanvas.height, alpha:1.0, fillStyle:"#FFFFFF", fadeOut:10.5};
	t.flashed = false;
}

ComicStrip2.prototype = {
	preloadResources : function() {
		var t = this;
	},
	
	
	tick : function(time) {
		var t = this;
		if (!t.entered)
			t.enter();

		if (engine.time >= 116.5 && !t.flashed) {
				t.flashed  = true;
				t.exit();
				engine.addCanvasClient(engine.frontCanvas);
				engine.text2d.addRectangle(t.bar);
				engine.text2d.closeAllIn(1.0);
				return true;
		}

		t.elapsed += engine.deltaTime;			

		var index = Math.floor(t.elapsed * 4.0);
		
		if (index+3 >= t.bars.length) {
			/*for (var i = 0; i < t.bars.length; i++) {
				if (null == t.bars[i].fadeOut)
					t.bars[i].fadeOut = 0.7;
			}*/
		} else if (t.bars[index+3].canBeAdded) {
			t.bars[0].w = 1.0/4.0*(index+1);
			t.bars[1].w = 1.0/4.0*(index+1);
//			engine.text2d.addRectangle(t.bars[index+3]);
			t.bars[index+3].canBeAdded = false;
			engine.text2d.addEntry(t.text[index]);
		}
		return false;
	},

	enter : function() {
		var t = this;
		t.flashed = false;
		t.entered = true;
		engine.addCanvasClient(engine.frontCanvas);
		t.elapsed = 0.0;
		t.bars = [];
		var size = 1.0/20.0;
		t.bars.push({x: 0.0, y: 0.0, w: 1.0/4.0, h:size, a:1.0, alpha:1.0, done:false, fillStyle:"#000000"}); // top
		t.bars.push({x: 0.0, y: 1.0-size, w: 1.0/4.0, h:size, a:1.0, alpha:1.0, done:false, fillStyle:"#000000"}); // bottom
		t.bars.push({x: 0.0, y: 0.0, w: size, h:1.0, a:1.0, alpha:1.0, done:false, fillStyle:"#000000"}); // left
		t.bars.push({x: 1.0/4.0-size*0.5, y: 0.0, w: size, h:1.0, a:1.0, alpha:1.0, done:false, fillStyle:"#000000"});
		t.bars.push({x: 2.0/4.0-size*0.5, y: 0.0, w: size, h:1.0, a:1.0, alpha:1.0, done:false, fillStyle:"#000000"});
		t.bars.push({x: 3.0/4.0-size*0.5, y: 0.0, w: size, h:1.0, a:1.0, alpha:1.0, done:false, fillStyle:"#000000"});
		t.bars.push({x: 1.0-size*0.5, y: 0.0, w: size, h:1.0, a:1.0, alpha:1.0, done:false, fillStyle:"#000000"});
		for (var i = 3; i < t.bars.length; i++)
			t.bars[i].canBeAdded = true;
		engine.text2d.addRectangle(t.bars[0]);
		engine.text2d.addRectangle(t.bars[1]);
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
				t.bars[i].fadeOut = 0.7;
		}
	},
	
	createFX : function(gl, hideText) {
	}
}

