/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  FallingBars() {
	var t = this;
	t.created = false;
}

FallingBars.prototype = {
	preloadResources : function() {
		var t = this;
		t.tex = resman.prefetchTexture("data/Made_MoltenCore.jpg", true);
	},
	
	tick : function(time, remainingTime) {
		var t = this;
		t.elapsed += engine.deltaTime;
		if (t.elapsed > 15.0) {
			t.exit();
			return true;
		}
		var reboundStrength = -0.2;
		engine.text2d.clearRotation();
		if (t.state == 2) {
			return true;
		}
		if (t.state == 1) {
			done = 0;			
			for ( i = 0; i <= t.count; i++) {
				var b = t.bars[i];
				rebound = false;
				
				if (!b.done) {
					b.y += b.spd;
					b.spd += t.gravity;
					
					if (b.y + t.barHeight > 1.0) {
						b.spd *= Math.max(reboundStrength - i * 0.07, reboundStrength*2.0);
						b.y = 1.0-t.barHeight;
						rebound = true;
					}
					
					if (i > 0 && b.y + t.barHeight > t.bars[i-1].y) {
						b.y = t.bars[i-1].y-t.barHeight;
						b.spd *= Math.max(reboundStrength - i * 0.07, reboundStrength*2.0);
						rebound = true;
					}
					
					if (Math.abs(b.y-b.maxy) < t.barHeight) {
						if (rebound && Math.abs(b.spd) <= 0.001) {
							b.spd = 0;
							b.done=true;
							rebound = false;
							b.y = b.maxy;
						} else if (!rebound){
							b.y += (b.maxy - b.y) * 0.2;
						}
					}
				}
				else {
					done++;
					b.y = b.maxy;
				}
			}
			if (done >= t.count && remainingTime < 0.5) {
				for ( i = 0 ; i <= t.count; i++) {
					var b = t.bars[i];
				//	b.fadeOut = 1.0 + remainingTime + i/2.0;
					b.y = b.maxy;
				}
				t.state = 2;
			}
		}
		return false;
	},

	createFX : function() {
		this.create();
	},

	enter : function() {
		var t = this;
		if (t.created)
			return;
		engine.addCanvasClient(engine.frontCanvas);
		t.elapsed = 0;
		t.created = true;
		t.state = 1;
		t.bars = new Array();
		t.count = 6;
		t.barHeight = 1.0/t.count;
		t.gravity = 1.0/2048.0;
		for ( i = 0; i <= t.count; i++) {
			var vv = t.tex.height-(i * t.barHeight * t.tex.height);
			vv = Math.max(vv, 0.0);
			vv = Math.min(vv, t.tex.height-0.000001);
			t.bars.push({
				x: 0.0, y: -i * t.barHeight, 
				w: 1.0, h:t.barHeight, 
				a:1.0, spd:0.0, fadeIn: 1.0, done:false, fillStyle:"#000000",
				u0: 0.0, v0: vv,
				u1: t.tex.width, v1: t.barHeight * t.tex.height,
				img:t.tex.texture.image,
				maxy: 1.0-((i+0) * t.barHeight)
				});
			engine.text2d.addRectangle(t.bars[i]);
		}
	},
	
	startLeave : function() {
		var t = this;
		if (!t.created)
			return;

		if (t.state != 2) {
			for ( i = 0 ; i <= t.count; i++) {
				var b = t.bars[i];
				//b.fadeOut = 4.0 + i/2.0;
				b.y = b.maxy;
			}
			t.state = 2;
		}
	},

	exit : function() {
		var t = this;
		if (!t.created)
			return;
			
		t.created = false;
		t.bars = [];
		engine.text2d.clearAll();
		engine.removeCanvasClient(engine.frontCanvas);
	},

	create : function() {
	}
}