/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/


/**
 * @constructor
 */
function  Circles(isSubFX) {
	var t = this;
	
	engine.pushContext(webgl_2d_raymarch, "Circles Constructor");
	t.isSubFX = isSubFX;
	t.shadersPath = "shaders/";
	t.vertexShader = [t.shadersPath + "engine/vertex.vs"];
	t.fragmentShader = [t.shadersPath + "fx/circles2.fs"];
	if (engine.autoFrameRate && !t.isSubFX) {
		t.blitVS = [t.shadersPath + "engine/diffuseTexture2d.vs"];
		t.blitFS = [t.shadersPath + "engine/lod.fs"];
	}
	t.quad = new QuadMesh();
	t.centersCount = 8;
	t.centers = new Array();
	t.colors = new Array();
	t.movingSystem = 0.0;
	t.elapsed = 0;
	t.endingFX = new LeavingBars_Vert();
	t.flashDone = false;

	if (!t.isSubFX) {
		engine.pushContext(webgl_2d_frontSprites, "Circles Constructor2");
			t.dbg = new DebugDraw(null, ["shaders/fx/MosaicBlendAlpha.fs"]);
		engine.popContext();
//		t.transitionIN = new ZoomOut();//ExplodingScreen(); XPlosion2D()
	}	
	engine.popContext();
}

Circles.prototype = {
	
	preloadResources : function() {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "Circles preloadResources");
		t.shaders = resman.prefetchShaderFiles(t.vertexShader, t.fragmentShader);
		if (!t.isSubFX) {
			if (engine.autoFrameRate  && !t.isSubFX) {
				t.blitShaders = resman.prefetchShaderFiles(t.blitVS, t.blitFS);
			}
			engine.pushContext(webgl_2d_frontSprites, "Circles preloadResources 2");
				t.dbgTex = resman.prefetchTexture("data/logo_plasma1.png");
//				t.dbgTex = resman.prefetchTexture("data/dsr_wilde_stylo.png");				
			engine.popContext();
			t.endingFX.preloadResources();
			//t.transitionIN.preloadResources();
		}
		engine.popContext();
	},

	enter : function(_lastTickFx) {
		var t = this;
		t.last = null;//lastTickFx;
		engine.addCanvasClient(engine.canvases[webgl_2d_raymarch]);
		if (!t.isSubFX)
			engine.addCanvasClient(engine.canvases[webgl_2d_frontSprites]);
		engine.pushContext(webgl_2d_raymarch, "Circles enter");
		t.elapsed = 0;
		t.ambient = 0;
		t.tileStep = 0;
		t.flashDone = false;
		//if (t.transitionIN)
			//t.transitionIN.enter();
		engine.popContext();
	},
	
	exit : function() {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "Circles exit");
		if (!t.isSubFX) {
			engine.pushContext(webgl_2d_frontSprites, "Circles exit 2");
				engine.clearContext(0, 0, 0, 0); // alpha to 0 to guarantee transparent front canvas
			engine.popContext();
			//t.transitionIN.exit();
			engine.removeCanvasClient(engine.frontCanvas);
		}
		engine.popContext();
		engine.removeCanvasClient(engine.canvases[webgl_2d_raymarch]);
		if (!t.isSubFX)
			engine.removeCanvasClient(engine.canvases[webgl_2d_frontSprites]);
	},

	getTransitionDuration : function() {
		return 1.0;
	},
	
	tick : function(_time, _gl, remainingTime) {
		var timeOfs = 58;
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "Circles tick");
		var gl = engine.gl;
		t.elapsed += engine.deltaTime;
		var startLogoAnimAt = 3.0;
		
		if (t.elapsed < 2.0) {
			t.ambient = -2.0+t.elapsed;
		}

		if (t.isSubFX)
			timeOfs -= 5.0;
			
		var localtime = t.elapsed + timeOfs
		
		t.movingSystem = Math.abs(Math.sin(localtime * 0.01));
		{
			var animTime = -28.0 + localtime * 0.4;
			for (i = 0; i < t.centersCount; i++) {
				t.centers[i*3] = t.movingSystem * (0.45 * Math.cos(i*0.7+animTime*0.2));				// pos X
				t.centers[i*3+1] = t.movingSystem * (0.85 * Math.sin(i*0.7+animTime*0.1) + 0.35);				// pos Y
				t.centers[i*3+2] = t.movingSystem * (Math.abs(Math.cos(localtime*0.1 + i*0.9)) * (3.0 + Math.abs(Math.sin(i * 1.75 + animTime * 0.1))));		// weight
			}
		}
		{
			var animTime = 30.0 + localtime * 1.8;
			for (i = 0; i < t.centersCount; i++) {
				t.centers[i*3] += (1.0-t.movingSystem) * (0.85 * Math.cos(i*0.7+animTime*0.1) - 0.5);				// pos X
				t.centers[i*3+1] += (1.0-t.movingSystem) * (0.25 * Math.cos(i*0.7+animTime*0.2));				// pos Y
				t.centers[i*3+2] += (1.0-t.movingSystem) * (Math.abs(Math.cos(localtime*0.1 + i*0.9)) * (3.0 + Math.abs(Math.sin(i * 1.75 + animTime * 0.1))));		// weight
			}
		}

		for (i = 0; i < t.centersCount; i++) {
			t.colors[i*3] = Math.abs(Math.cos(i * 0.3));
			t.colors[i*3+1] = Math.abs(Math.sin(i * 0.3));
			t.colors[i*3+2] = Math.abs(Math.cos(i * 0.5));
		}


		if (engine.autoFrameRateTex && !t.isSubFX)
			engine.enterRenderTexture(engine.autoFrameRateTex);
		engine.useProgram(t.program);
		
		if (!t.isSubFX && engine.time >= (68.52-engine.deltaTime) && !t.flashDone) {
//			alert("ben la...");
			t.flashDone = true;
			engine.addCanvasClient(engine.frontCanvas);
			engine.text2d.addRectangle({x: 0.0, y: 0.0, w:1.0, h:1.0, a:0.6, alpha:0.6, done:false, fillStyle:"#FFFFFF", fadeOut:0.7});
		}
		
		if (!t.isSubFX && engine.time >= 69.52) {//(remainingTime < t.getTransitionDuration()) {
	//	if (!t.isSubFX && remainingTime < 2.0) {
			if (!t.endingFX.entered) {
				engine.forceLOD(4.0);
				t.endingFX.enter();
			}
			if (t.endingFX.tick(remainingTime))
				t.endingFX = null;
			engine.passfx = t.endingFX;
//			t.ambient = 4.0;//Math.min(2.0-remainingTime, 2.0);
		}
		gl.uniform1f(t.program.ambient, t.ambient);
		gl.uniform1f(t.program.iGlobalTime, localtime);
		gl.uniform3fv(t.program.centers, t.centers);
		gl.uniform3fv(t.program.colors, t.colors);
		var devStart = 58.02;
		var devDuration = 0.7;
		if (engine.time >= devStart && engine.time <= devStart + devDuration) {
			var devamount = 0.09*Math.sin((engine.time-devStart)*3.14159/devDuration);
			gl.uniform1f(t.program.deviation, devamount);
		}
		else
			gl.uniform1f(t.program.deviation, 0.0);
			
		if (engine.autoFrameRateTex && !t.isSubFX)
			gl.uniform3fv(t.program.iResolution, [engine.autoFrameRateTex.width, engine.autoFrameRateTex.height, 1.0]);
			
			
		if (!t.isSubFX && engine.time >= 66.5) {
			if (!t.walked) {
				t.walked = true;
				engine.text2d.addFX(new ScreenWalker(0.15, 1.0, 0.15, -1.0, 0.02, 0.02*window.innerWidth/window.innerHeight, 2.5));
				engine.text2d.addFX(new ScreenWalker(0.85, 0.0, 0.85, 2.0, 0.02, 0.02*window.innerWidth/window.innerHeight, 2.5));
			}
//			var val = Math.sin(Math.min(Math.max((engine.time-66.0)*1.0, 0.0), 3.14159)) * 0.02;
//			gl.uniform1f(t.program.deviation, val);
		}
			
		t.quad.draw(gl, t.program);		
		if (engine.autoFrameRateTex && !t.isSubFX) {
			engine.exitRenderTexture();
			engine.useProgram(t.blitProgram);
			engine.setTexture(engine.autoFrameRateTex, 0);
			t.quad.draw(engine.gl, t.blitProgram);
		}
	
		if (!t.isSubFX) {
			engine.pushContext(webgl_2d_frontSprites, "Circles tick2");			
			var gl2 = engine.gl;
//				gl2.blendFunc(gl2.SRC_ALPHA, gl2.ONE);
//				gl2.enable(gl2.BLEND);
//				gl2.disable(gl2.DEPTH_TEST);
			
				if (t.elapsed >= startLogoAnimAt && t.dbg.tryBuild(gl2, t.dbgTex)) {
					if (!t.ColorFader)
						t.ColorFader = gl2.getUniformLocation(t.dbg.program, "ColorFader");					
					t.dbg.sprite.setScale(0.2, 0.2*engine.canvas.width/engine.canvas.height);
//					t.dbg.sprite.setScale(256.0/engine.canvas.width, 128.0/engine.canvas.height);
					t.dbg.sprite.setTransfo(0.75, 0.75, 0.0);
					if (!t.tile_num)
						t.tile_num = gl2.getUniformLocation(t.dbg.program, "tilenum");
					if (!t.alphamult)
						t.alphamult = gl2.getUniformLocation(t.dbg.program, "alphamult");
					if (!t.addColor)
						t.addColor = gl2.getUniformLocation(t.dbg.program, "addColor");
					engine.useProgram(t.dbg.program);
					gl2.uniform1f(t.ColorFader, 0.0);
					gl2.uniform1f(t.alphamult, 0.75);
					gl2.uniform1f(t.addColor, 0.0);
					if (t.tileStep == 0) {
						var sinval = 50.0*(t.elapsed-startLogoAnimAt);
						if (sinval < 64.0)
							gl2.uniform1f(t.tile_num, sinval);
						else {
							gl2.uniform1f(t.tile_num, 10000.0);
							t.tileStep = 1;
						}
					} else if (remainingTime < t.getTransitionDuration()*0.25) {
						gl2.uniform1f(t.tile_num, 50.0-20.0*(t.getTransitionDuration()*0.25 - remainingTime));
					}

					gl2.enable(gl2.BLEND);
					gl2.blendFunc(gl2.SRC_ALPHA, gl2.ONE_MINUS_SRC_ALPHA);
					t.dbg.draw(gl2, t.dbgTex);
					gl2.disable(gl2.BLEND);
				}
//				gl2.enable(gl2.DEPTH_TEST);
//				gl2.disable(gl2.BLEND);
			engine.popContext();
		}
		if (t.last) {
			if (t.last.explosionStarted == 0.0)
				t.last.explosionStarted = engine.deltaTime;
			if (t.last.tick(_time, gl, remainingTime))
				t.last = null;
		}
		engine.popContext(webgl_2d_raymarch);
	},

	createFX : function(_gl, hideText) {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "Circles createFX");
		var gl = engine.gl;
		t.quad.create(gl, -1.0, -1.0, 2.0, 2.0);
		t.program = engine.createProgramFromPrefetch(t.shaders);
		t.program.centers = gl.getUniformLocation(t.program, "centers");
		t.program.colors = gl.getUniformLocation(t.program, "colors");
		t.program.ambient = gl.getUniformLocation(t.program, "iAmbient");
		t.program.iGlobalTime = gl.getUniformLocation(t.program, "iGlobalTime");
		t.program.deviation = gl.getUniformLocation(t.program, "deviation");
		if (engine.autoFrameRate && !t.isSubFX)
			t.blitProgram = engine.createProgramFromPrefetch(t.blitShaders);
		t.hideText = hideText;
		t.elapsed = 0;
//		if (t.transitionIN)
	//		t.transitionIN.createFX(gl, hideText);
		engine.popContext();
	}
}
