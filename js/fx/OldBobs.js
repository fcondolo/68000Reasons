/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  OldBobs() {
	var t = this;
	}

OldBobs.prototype = {
	preloadResources : function() {
		var t = this;
		t.tex = resman.prefetchTexture("data/bob.png", true);
	},
	
	tick : function(_time, _gl, remainingTime) {
		var t = this;

		
		t.elapsed += engine.deltaTime;
		var beat = beatHandler.beatBarFader;
		var cvs = engine.frontCanvas;
		var w = cvs.width;
		var h = cvs.height;
		var centerX = w * 0.5;
		var centerY = h * 0.5;
		var ctx = engine.frontContext;
			
		// cls
		ctx.globalAlpha = 1.0;
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, w, h);

		ctx.fillStyle = "#DDDDDD";
		return false;
	},

	enter : function() {
		var t = this;
		engine.addCanvasClient(engine.frontCanvas);
		engine.text2d.hijacked = true;
		t.elapsed = 0;
	},	

	exit : function() {
		var t = this;
		engine.text2d.clearAll();
		engine.text2d.hijacked = false;			
		engine.removeCanvasClient(engine.frontCanvas);
	},
	
	createFX : function(gl, hideText) {
	}
}

