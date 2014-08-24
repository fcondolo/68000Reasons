/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  LeavingBars_Vert() {
	var t = this;
	t.elapsed = 0.0;
	t.entered = false;
	t.exited = false;
}

LeavingBars_Vert.prototype = {
	preloadResources : function() {
		var t = this;
		t.sparkTexture = resman.prefetchTexture("data/spark.png", true);
	},
	
	endOfClosingDoors : function() {
		var t = this;
		t. fadeStarted = true;
		for ( var i = 0; i < t.count; i++) {
			engine.text2d.addRectangle(t.bars[i]);
		}
		t.closingBars[0].alpha = 0.01;
		t.closingBars[0].fadeOut = 0.07;
		t.closingBars[1].alpha = 0.01;
		t.closingBars[1].fadeOut = 0.07;
		for ( var i = 0; i < t.particleCount; i++) {
			engine.text2d.addRectangle(t.particles[i]);
		}
	},
	
	tick : function(time) {
		var t = this;

		if (!t.fadeStarted && t.elapsed <= 0.9) {
			var w = Math.min(t.elapsed * 2.75, 0.5);
			var a = Math.min(w * 2.0, 1.0);
			t.closingBars[0].w = w;
			t.closingBars[0].a = a;
			t.closingBars[0].alpha = a;
			t.closingBars[1].x = 1.0-w;
			t.closingBars[1].w = w;
			t.closingBars[1].a = a;
			t.closingBars[1].alpha = a;
			if (w >= 0.49999999)
				t.endOfClosingDoors();
		}	
		else if (!t.fadeStarted)
			t.endOfClosingDoors();
		
		t.elapsed += engine.deltaTime;
		
		var pTime = engine.deltaTime * 2.0;
		if (t.fadeStarted){
			for ( var i = 0; i < t.particleCount; i++) {
				t.particles[i].x += t.particles[i].spdx * pTime;
				t.particles[i].y -= t.particles[i].spdy * pTime*0.5;
				t.particles[i].spdx *= 0.98; 
				t.particles[i].spdy = t.particles[i].spdy * 0.98 - pTime * 2.0; 
				t.particles[i].alpha = 0.5; 
			}
		}
		

		for ( var i = 0; i < t.count; i++) {
			if (t.elapsed < i * 0.05)
				break;
			if (null == t.bars[i].fadeOut) {
				t.bars[i].alpha = 1.0;
				t.bars[i].fadeOut = 0.5;
			}
			var newW = t.bars[i].w * (1.0-engine.deltaTime*9.0);
			newW =  Math.max(newW, 0.0);
			var deltaW = t.bars[i].w - newW;
			t.bars[i].w = newW;
			t.bars[i].x += deltaW * 0.5;
		//	t.bars[i].y = 1.0-t.bars[i].h*2.0;
		}
		if (t.elapsed < 5.0)
			return false;
		t.exit();
			return true;
	},

	enter : function() {
		var t = this;
		t.entered = true;
		engine.addCanvasClient(engine.frontCanvas);
		t.waitDone = false;
		t.elapsed = 0.0;
		t.bars = new Array();
		t.closingBars = [];
		t.count = 20;
		t.barWidth = 1.0/t.count + 0.01;
		t.fadeStarted = false;
		for ( var i = 0; i < t.count; i++) {
			t.bars.push({x: i * t.barWidth, y: 0.0, w: t.barWidth, h:1.0, a:1.0, spd:0, done:false, fillStyle:"#000000"});
		}
		t.particles = [];
		t.particleCount = 40.0;
		var partSlope = 1.0/t.particleCount;
		for ( var i = 0; i < t.particleCount; i++) {
			t.particles.push({x: 0.5, y: i*partSlope+Math.random()*partSlope, 
				w: 0.005, h:0.005*engine.canvas.width/engine.canvas.height,
				a: 0.5, spdx:Math.random()-0.5, spdy:0.5+0.5*Math.random(),
				u0: 0.0, v0: 0.0,
				u1: t.sparkTexture.width, v1: t.sparkTexture.height,
				img:t.sparkTexture.texture.image
			});
		}
		t.closingBars.push({x: 0.0, y: 0.0, w: 0.0, h:1.0, fillStyle:"#000000", done:false});
		t.closingBars.push({x: 1.0, y: 0.0, w: 0.0, h:1.0, fillStyle:"#000000", done:false});
		engine.text2d.addRectangle(t.closingBars[0]);
		engine.text2d.addRectangle(t.closingBars[1]);
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

