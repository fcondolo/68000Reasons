/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  XPlosion2D() {
	var t = this;
	t.keepGrid = false;
}

XPlosion2D.prototype = {
	preloadResources : function() {
		var t = this;
	},
	
	tick : function(time) {
		var t = this;

		t.elapsed += engine.deltaTime;
		if (t.elapsed > 8.0) {
			t.exit();
			return true;
		}
		for ( i = 0; i < t.count; i++) {
			if (null == t.bars[i].fadeOut) {
				t.bars[i].alpha = 1.0;
				t.bars[i].fadeOut = 2.0 + Math.random() * 2.0;
				t.bars[i].fillStyle = "#FFFFFF";
			}
			
			t.bars[i].x += t.spd[i].x;
			t.bars[i].y += t.spd[i].y;
			t.spd[i].y += 0.0025; // gravity;
			t.spd[i].x *= 0.99;
		}

			
		return false;
	},

	updateGrid : function(owner) {
		var cvs = engine.frontCanvas;
		var w = cvs.width;
		var h = cvs.height;
		var G = engine.frontContext;
		var xcount = Math.floor(10.0);
		var ycount = Math.floor(10.0*h/w);
		var barWidth = w/xcount;
		var barHeight = h/ycount;
		var count = 0;
		G.strokeStyle = "#000000";
		G.lineWidth = 1.0;
		G.globalAlpha = 1.0;
		if (owner.elapsed > 3.0) {
			G.translate(w * 0.5, h * 0.5);
			G.rotate(owner.elapsed - 3.0);
			G.translate(-w * 0.5, -h * 0.5);
		}
		for (var yy = 0; yy < ycount; yy++) {
			var ye = yy * barHeight;
			G.beginPath();
			G.moveTo(0, ye);
			G.lineTo(w, ye);
			G.stroke();
		}
		for (var xx = 0; xx < xcount; xx++, count++) {
			var xe = xx * barWidth;
			G.moveTo(xe, 0);
			G.lineTo(xe, h);
			G.stroke();
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
		t.spd = [];
		t.xcount = Math.floor(6.0);
		t.ycount = Math.floor(6.0*engine.frontCanvas.height/engine.frontCanvas.width);
		t.barWidth = 1.0/t.xcount;
		t.barHeight = 1.0/t.ycount;
		t.count = 0;
		var max_x_spread = 0.02;
		var max_y_spread = -0.05;
		for (var yy = 0; yy < t.ycount; yy++) {
			for (var xx = 0; xx < t.xcount; xx++, t.count++) {
				t.bars.push({x: xx * t.barWidth, y: yy * t.barHeight, w: t.barWidth + 0.00001, h: t.barHeight + 0.00001, a:1.0, spd:0, done:false, fillStyle:"#FFFFFF"});
				engine.text2d.addRectangle(t.bars[t.count]);
				t.spd.push({x: Math.random() * max_x_spread - max_x_spread * 0.5, y: Math.random() * max_y_spread});
			}
		}
		
		if (t.keepGrid)
			engine.text2d.postRenderCallbacks.push({func:t.updateGrid, p1:t});
	},	

	exit : function() {		
		var t = this;
		if (null == t.exited) {
			t.exited = true;
			engine.text2d.clearAll();
			engine.removeCanvasClient(engine.frontCanvas);
		}
	},
	
	createFX : function(gl, hideText) {
	}
}

