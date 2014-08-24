/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  StarfieldLogo() {
	var t = this;
	engine.pushContext(webgl_2d_frontSprites, "StarfieldLogo Constructor");
		t.dbg = new DebugDraw(null, ["shaders/fx/MosaicBlendAlpha.fs"]);
	engine.popContext();
	t.referenceZ = 0.025 + (1/25 * 2);
}


StarfieldLogo.prototype = {
	preloadResources : function() {
		var t = this;
		engine.pushContext(webgl_2d_frontSprites, "StarfieldLogo preloadResources");
			t.dbgTex = resman.prefetchTexture("data/title.png");
		engine.popContext();
		t.bobTex = resman.prefetchTexture("data/bob.png", true);
	},
	
	getTransitionDuration_IN : function() {
		return 1.0;
	},

	getTransitionDuration_OUT : function() {
		return 2.0;
	},
	

	drawLineGrid : function(G) {
		var xcount = Math.floor(10.0);
		var ycount = Math.floor(10.0*engine.frontCanvas.height/engine.frontCanvas.width);
		var w = engine.frontCanvas.width;
		var h = engine.frontCanvas.height;
		var barWidth = w/xcount;
		var barHeight = h/ycount;
		var count = 0;
		G.strokeStyle = "#000000";
		G.lineWidth = 1.0;
		var ratio = G.globalAlpha;
		G.globalAlpha = Math.min(G.globalAlpha + 0.25, 1.0);
		for (var yy = 0; yy < ycount; yy++) {
			var ye = yy * barHeight;
			var len =  Math.min(ratio * (8.0 + yy), 1.0);
			G.beginPath();
			G.moveTo(0, ye);
			G.lineTo(w * len, ye);
			G.stroke();
		}
		for (var xx = 0; xx < xcount; xx++, count++) {
			var xe = xx * barWidth;
			var len =  Math.min(ratio * (8.0 + xx), 1.0);
			G.beginPath();
			G.moveTo(xe, 0);
			G.lineTo(xe, h * len);
			G.stroke();
		}
	},
	
	
	tick : function(_time, _gl, remainingTime) {
		var t = this;
		t.elapsed += engine.deltaTime;
		var startLogoAnimAt = 3.0;

		t.width = window.innerWidth;
		t.height = window.innerHeight;
		var	mousex = t.width/2 + Math.min(1.0,  t.elapsed * 0.1) * (t.width*0.12*Math.cos(t.elapsed*0.4));
		var mousey = t.height/2 + Math.min(1.0,  t.elapsed * 0.1) * (t.height*0.12*Math.sin(t.elapsed*0.4));
		if (t.transitionOutStarted > 0.0) {
			mousex = t.width/2;
			mousey = t.height/2;
		}
		
		var G=engine.frontContext;
		G.globalAlpha=0.25;
		var Rnd = Math.random;
		var	Sin = Math.sin;
		var	Floor = Math.floor;

		G.fillStyle = "#000";
		G.fillRect(0, 0, t.width, t.height);

		var cx = (mousex - t.width / 2) + (t.width / 2);
		var cy = (mousey - t.height / 2) + (t.height / 2);

	   
	   var sat = Floor(t.Z * 500);
	   if (sat > 100) sat = 100;
	   for (var i=0; i<t.units; i++)
	   {
		  var n = t.stars[i],
			  xx = n.x / n.z,
			  yy = n.y / n.z,
			  e = (1.0 / n.z + 1) * 2;
		  
		  if (n.px !== 0)
		  {
			if ((i & 15) == 0) {
				G.drawImage(t.bobTex.texture.image, xx + cx, yy + cy, t.bobTex.texture.image.width / n.z, t.bobTex.texture.image.height / n.z);

			} else {
				 G.strokeStyle = "#FFFFFF";
				 G.lineWidth = e;
				 G.beginPath();
				 G.moveTo(xx + cx, yy + cy);
				 G.lineTo(n.px + cx, n.py + cy);
				 G.stroke();
			}
		  }
		  
		  n.px = xx;
		  n.py = yy;
		  n.z -= t.Z;
		  
		  if (n.z < t.Z || n.px > t.width || n.py > t.height)
			 t.resetstar(n);
	   }
	   
		if (t.elapsed < t.getTransitionDuration_IN()) {
			G.fillStyle = "#000000";
			G.globalAlpha = (t.getTransitionDuration_IN()-t.elapsed)/t.getTransitionDuration_IN();
			G.fillRect(0.0, 0.0, engine.frontCanvas.width, engine.frontCanvas.height);
			G.globalAlpha=0.25;
		}
   
		// UPDATE LOGO
			var noiseScale = 1.0;
			engine.pushContext(webgl_2d_frontSprites, "StarfieldLogo update");
			var gl2 = engine.gl;
			gl2.enable(gl2.BLEND);
			gl2.blendFunc(gl2.SRC_ALPHA, gl2.ONE_MINUS_SRC_ALPHA);
			var startTRansitionOutAt = 22.5-0.2;
				if (t.elapsed >= startLogoAnimAt && t.dbg.tryBuild(gl2, t.dbgTex)) {
					if (!t.torsion)
						t.torsion = gl2.getUniformLocation(t.dbg.program, "torsion");
					t.dbg.sprite.setScale(0.7, 0.7*engine.canvas.width/engine.canvas.height);
					if (!t.tile_num)
						t.tile_num = gl2.getUniformLocation(t.dbg.program, "tilenum");
					if (!t.alphamult)
						t.alphamult = gl2.getUniformLocation(t.dbg.program, "alphamult");
					if (!t.addColor)
						t.addColor = gl2.getUniformLocation(t.dbg.program, "addColor");
					engine.useProgram(t.dbg.program);
					gl2.uniform1f(t.alphamult, 1.0);
					gl2.uniform1f(t.torsion, 0.0);
					if (Math.floor(beatHandler.lastBarIndex) == 15)
						gl2.uniform1f(t.addColor, beatHandler.beatBarFader);
					else {
						if (Math.floor(beatHandler.lastBarIndex) > 15)
							gl2.uniform1f(t.addColor, beatHandler.beatBarFader * 0.1);
						else
							gl2.uniform1f(t.addColor, 0.0);
					}
					if (t.tileStep == 0) {
						var sinval = 30.0*(t.elapsed*1.1-startLogoAnimAt);
						if (sinval < 130.0) {
							gl2.uniform1f(t.tile_num, sinval);
						}
						else {
							gl2.uniform1f(t.tile_num, 1000.0);
							t.tileStep = 1;
						}
					} else if (engine.time >= startTRansitionOutAt) {//(remainingTime < t.getTransitionDuration_OUT()) {
						t.transitionOutStarted += engine.deltaTime;
						noiseScale = (t.getTransitionDuration_OUT()-remainingTime)/(t.getTransitionDuration_OUT());
						if (t.Z < t.referenceZ * 10.0) {
							t.Z *= 2.0 + engine.deltaTime * 2.0 * noiseScale;
							if (t.Z > t.referenceZ * 10.0)
								t.Z = t.referenceZ * 10.0;
						}
						t.dbg.sprite.setTransfo(
						0.1 * noiseScale * PerlinNoise.noise(t.elapsed*49.0, t.dbg.sprite.quad.transfo.x*512.0, t.dbg.sprite.quad.transfo.y*547.0),
						0.1 * noiseScale * PerlinNoise.noise(t.elapsed*49.0, t.dbg.sprite.quad.transfo.y*612.0, t.dbg.sprite.quad.transfo.x*447.0),
						0.0);
						var vval = Math.max(t.transitionOutStarted-1.0, 0.0) * 3.0;
						gl2.uniform1f(t.torsion, vval);
						t.dbg.sprite.setScale(0.7+vval, (0.7+vval)*engine.canvas.width/engine.canvas.height);
					}

					t.dbg.draw(gl2, t.dbgTex);
				}
				
			gl2.disable(gl2.BLEND);
			engine.popContext();

		if (t.text1 && remainingTime < 5.0 && engine.time < 22.08) {
			if (Math.floor(remainingTime * 4.0) & 1 == 1)
				engine.draw2dText(t.text1);
		}
		return false;
	},

	enter : function() {
		var t = this;
		engine.addCanvasClient(engine.frontCanvas);
		engine.addCanvasClient(engine.canvases[webgl_2d_frontSprites]);
		t.elapsed = 0;
		t.transitionOutStarted = 0;
		t.exited = null;
		t.width = window.innerWidth;
		t.height = window.innerHeight;
		t.Z = t.referenceZ;
		engine.text2d.hijacked = true;
		engine.setCanvasZIndex("spritesCanvas", 5);
//		for (var i = 0; i < 200; i++)
	//		t.tick(0.0, engine.frontContext, 50.0); // pre-feed with stars
		t.elapsed = 0;	// reset time after pre-feed
		engine.pushContext(webgl_2d_frontSprites, "StarfieldLogo tick");
			engine.clearContext(0, 0, 0, 0); // alpha to 0 to guarantee transparent front canvas
		engine.popContext();
		t.tileStep = 0;
		t.text1 = {x:0.37, y:0.85, string:"Press fire...", fillStyle:"#FFFFFF", font: 30, fadeIn:2.0};
	},	

	exit : function() {
		var t = this;
		if (null == t.exited) {
			t.exited = true;
			engine.text2d.hijacked = false;
			engine.frontContext.globalAlpha = 1.0;
			engine.text2d.clearAllRectangles();
			engine.text2d.rotation = null;
			engine.setCanvasZIndex("spritesCanvas", 3);
			engine.pushContext(webgl_2d_frontSprites, "StarfieldLogo exit");
				engine.clearContext(0, 0, 0, 0); // alpha to 0 to guarantee transparent front canvas
			engine.popContext();
			engine.removeCanvasClient(engine.frontCanvas);
			engine.removeCanvasClient(engine.canvases[webgl_2d_frontSprites]);
		}
		engine.text2d.clearAllTexts();
	},
	
	resetstar : function(a)
	{
		var t = this;
	   a.x = (Math.random() * t.width - (t.width * 0.5)) * t.warpZ;
	   a.y = (Math.random() * t.height - (t.height * 0.5)) * t.warpZ;
	   a.z = t.warpZ;
	   a.px = 0;
	   a.py = 0;
	},

	createFX : function(_gl, hideText) {
		var t = this;
	// constants and storage for objects that represent star positions
		t.warpZ = 12;
		t.units = 500;
		t.stars = [];
		t.Z = t.referenceZ;
		// initial star setup
		for (var i=0, n; i<t.units; i++)
		{
		   n = {};
		   t.resetstar(n);
		   t.stars.push(n);
		}
		for (var i = 0; i < 200; i++)
			t.tick(0.0, engine.frontContext, 50.0); // pre-feed with stars
	}
}

