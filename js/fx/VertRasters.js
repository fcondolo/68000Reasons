/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  VertRasters() {
	var t = this;
	t.pts = [];
	t.pts2 = [];
}

VertRasters.prototype = {
	preloadResources : function() {
		var t = this;
		t.tex = resman.prefetchTexture("data/logongc.png", true);
	},
	
	tick : function(_time, _gl, remainingTime) {
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

		ctx.fillStyle = "#999999";
		for (var i = 0; i < 100; i++){
			ctx.fillRect(t.pts2[i].x, t.pts2[i].y, 3, 2);
			t.pts2[i].x -= 3;
			if (t.pts2[i].x < 0)
				t.pts2[i].x = w;
		}
		
		ctx.fillStyle = "#FFFFFF";
		for (var i = 0; i < 100; i++){
			ctx.fillRect(t.pts[i].x, t.pts[i].y, 4, 2);
			t.pts[i].x -= 5;
			if (t.pts[i].x < 0)
				t.pts[i].x = w;
		}

		for (var i = 0; i < 12 ; i++) {
			var y = h*0.5+h*0.25*Math.sin(t.elapsed*4.0+i*0.3);
			var my_gradient=ctx.createLinearGradient(0,y,0,y+h*0.09);
			my_gradient.addColorStop(0.0,"#00DDBB");
			my_gradient.addColorStop(0.5,"#FFFFFF");
			my_gradient.addColorStop(1.0,"#DD8800");
			ctx.fillStyle=my_gradient;
			ctx.fillRect(0,y,w,h*0.09);
		}
		
		var xsize = 0.3;
		ctx.drawImage(t.tex.texture.image, 0.0, 0.0, t.tex.width, t.tex.height, (0.5-xsize*0.5+0.1*Math.sin(t.elapsed*4.0))*w, 0.1*h, w*xsize, w*xsize*t.tex.height/t.tex.width);
		
		return false;
	},

	enter : function() {
		var t = this;
		engine.addCanvasClient(engine.frontCanvas, "VertRasters enter");
		engine.text2d.clearAll();
		engine.text2d.hijacked = true;
		t.elapsed = 0;
		var cvs = engine.frontCanvas;
		var w = cvs.width;
		var h = cvs.height;
		for (var i = 0; i < 50; i++){
			t.pts[i] = {x:Math.random() * w, y:Math.random() * h*0.3};
			t.pts2[i] = {x:Math.random() * w, y:Math.random() * h*0.3};
		}
		for (var i = 50; i < 100; i++){
			t.pts[i] = {x:Math.random() * w, y:h-Math.random() * h*0.3};
			t.pts2[i] = {x:Math.random() * w, y:h-Math.random() * h*0.3};
		}
	},	

	exit : function() {
		var t = this;
		engine.text2d.clearAll();
		engine.text2d.hijacked = false;			
		engine.removeCanvasClient(engine.frontCanvas, "VertRasters exit");
	},
	
	createFX : function(gl, hideText) {
	}
}

