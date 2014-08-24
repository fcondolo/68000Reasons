/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  LinesTunnel() {
}

LinesTunnel.prototype = {
	preloadResources : function() {
	},
	
	tick : function(_time, gl, remainingTime) {
		var t = this;
		t.elapsed += engine.deltaTime;
		
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

		ctx.globalAlpha = 0.7;
		ctx.strokeStyle = "#FFFFFF";
		ctx.lineWidth = 1.0;

		ctx.translate(engine.frontCanvas.width * 0.5, engine.frontCanvas.height * 0.5);
		ctx.translate(-engine.frontCanvas.width * 0.5, -engine.frontCanvas.height * 0.5);
		
		var len = 400.0;
		var CameraZ = t.elapsed * 0.05;
		var ZSpacing = 0.005;
		var startZ = CameraZ - (CameraZ % ZSpacing);
		var endZ = startZ + ZSpacing * len;
		var Z = startZ;
		var angleIncr = 1.6;
		var ret = null;
		while (Z < endZ) {
			var localZ = (Z - CameraZ) * 0.05;
			var angle = localZ * 200.0 * Math.sin(t.elapsed * 0.2) * angleIncr + t.elapsed * 0.5;
			if (localZ > 0.0) {	
				ctx.globalAlpha = 0.7-(Math.min(localZ*10.0, 0.7));
				if (ctx.globalAlpha < 0.1)
					break;
				var nbAdd = 6;
				ctx.beginPath();
				for (addAng = 0; addAng < nbAdd; addAng++){
					var curAngle = (angle + addAng * 3.14159*3.0/nbAdd);
					var xx1 = Math.cos(curAngle);
					var yy1 = Math.sin(curAngle);
					var xofs = w * 0.3 * (0.91+localZ) * Math.cos(t.elapsed + (15.0 + localZ * 55.4) * 0.5);
					var yofs = h * 0.3 * (0.91+localZ) * Math.sin(t.elapsed * 1.2 + (15.0 + localZ * 55.4) * 0.5);
					var x2d = xx1 / localZ + centerX + xofs;
					var y2d = yy1 / localZ + centerY + yofs;
					if (addAng & 1 == 0)
						ctx.moveTo(x2d, y2d);
					else
						ctx.lineTo(x2d, y2d);
					if (null == ret)
						ret = {x:xofs/w, y:yofs/h};
				}
				ctx.stroke();
			}
			Z += ZSpacing;
		}
		return ret;
	},

	enter : function() {
		var t = this;
		engine.addCanvasClient(engine.frontCanvas, "LinesTunnel enter");
		t.elapsed = 0.0;
		t.exited = null;
		engine.text2d.hijacked = true;
		engine.setCanvasZIndex("spritesCanvas", 6);
		engine.setCanvasZIndex("canvas3d", 5);
		},	

	exit : function() {
		var t = this;
		if (null == t.exited) {
			engine.text2d.hijacked = false;
			t.exited = true;
			engine.text2d.clearAll();
			engine.setCanvasZIndex("spritesCanvas", 3);
			engine.setCanvasZIndex("canvas3d", 1);
			engine.removeCanvasClient(engine.frontCanvas, "LinesTunnel exit");
		}
	},
	
	createFX : function(gl, hideText) {
	}
}

