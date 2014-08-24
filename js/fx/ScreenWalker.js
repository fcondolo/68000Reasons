/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  ScreenWalker(fromX, fromY, toX, toY, sizeX, sizeY, duration) {
	var t = this;
	t.elapsed = 0.0;
	t.entered = false;
	t.exited = false;
	t.fromX = fromX;
	t.fromY = fromY;
	t.curX = fromX;
	t.curY = fromY;
	t.toX = toX;
	t.toY = toY;
	t.duration = duration;
	t.slopeX = (t.toX - t.fromX) / t.duration;
	t.slopeY = (t.toY - t.fromY) / t.duration;
	t.sizeX = sizeX;
	t.sizeY = sizeY;
	t.col = ["#E31AE5", "#1AC6E5", "#DDDDDD"];
}

ScreenWalker.prototype = {
	preloadResources : function() {
	},
	
	
	tick : function(time) {
		var t = this;
		if (!t.entered)
			t.enter();
		
		t.elapsed += engine.deltaTime;
		
		var x = t.curX + (Math.random()*2.0-1.0)*t.sizeX;
		var y = t.curY + (Math.random()*2.0-1.0)*t.sizeY;
		var style = t.col[Math.floor(Math.random()*30.0)%t.col.length];
		engine.text2d.addRectangle({
			x: x-(x%t.sizeX),
			y: y-(y%t.sizeY),
			w: t.sizeX, h: t.sizeY, alpha:0.5, fadeOut: 0.8, fillStyle:style});
		t.curX += t.slopeX * engine.deltaTime;
		t.curY += t.slopeY * engine.deltaTime;
		t.duration -= engine.deltaTime;
		
		if (t.duration > 0.0)
			return false;
		t.exit();
		return true;
	},

	enter : function() {
		var t = this;
		t.entered = true;
		engine.addCanvasClient(engine.frontCanvas);
		t.elapsed = 0.0;
	},	

	exit : function() {
		var t = this;
		if (t.exited)
			return;
		t.entered = false;
		t.exited = true;
		engine.removeCanvasClient(engine.frontCanvas);
	},
	
	create : function() {
	}
}

