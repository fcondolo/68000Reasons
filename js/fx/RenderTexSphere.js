/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  RenderTexSphere() {
	var t = this;

	engine.pushContext(webgl_2d_raymarch, "RenderTexSphere Constructor");

	t.shadersPath = "shaders/";
	t.vertexShader = [t.shadersPath + "engine/vertex.vs"];
	t.fragmentShader = [t.shadersPath + "engine/RayMarchBaseHeader.fs", t.shadersPath + "fx/RenderTexSphere.fs", t.shadersPath + "engine/RayMarchBaseFooter.fs"];
	if (engine.autoFrameRate) {
		t.blitVS = [t.shadersPath + "engine/diffuseTexture2d.vs"];
		t.blitFS = [t.shadersPath + "engine/lod.fs"];
		t.blitFSMosaic = [t.shadersPath + "fx/MosaicAlpha.fs"];
	}
	t.quad = new QuadMesh();
	t.rendertex = new Texture();
	t.rasterfx = new Circles(true);
	t.insidefx = new ComicStrip2();

	engine.popContext();
}

RenderTexSphere.prototype = {
	
	preloadResources : function() {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "RenderTexSphere preloadResources");
		t.shaders = resman.prefetchShaderFiles(t.vertexShader, t.fragmentShader);
		if (engine.autoFrameRate) {
			t.blitShaders = resman.prefetchShaderFiles(t.blitVS, t.blitFS);
			t.blitShadersMosaic = resman.prefetchShaderFiles(t.blitVS, t.blitFSMosaic);
		}
		t.rasterfx.preloadResources();
		engine.popContext();
	},

	exit : function() {
		var t = this;
		if (t.insidefx)
			t.insidefx.exit();
		engine.pushContext(webgl_2d_raymarch, "RenderTexSphere exit");
		if (t.text)
			t.text.fadeOut = 0.5;
		t.rasterfx.exit();
		engine.popContext();
	},

	enter : function() {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "RenderTexSphere enter");
		if (!t.hideText) {
			t.text = {x:0.05, y:0.95, string:"Liquid Plasma", fillStyle:"#FFFFFF", alpha: 0.0, fadeIn: 1.0};
			engine.text2d.addEntry(t.text);
		}
		t.rasterfx.enter();
		t.rasterfx.elapsed = 30.0;
		engine.popContext();
		t.elapsed = 0;
		t.endingStarted = -1.0;
		t.mosaicAmount = 164.0;
		t.preExitflashDone = false;

		engine.addCanvasClient(engine.frontCanvas);
		engine.text2d.addRectangle({x: 0.0, y: 0.0, w:1.0, h:1.0, a:0.6, alpha:0.6, done:false, fillStyle:"#FFFFFF", fadeOut:0.7});
		engine.text2d.closeAllIn(1.0);
	},
	
	tick : function(time, _gl, remaining) {
		var t = this;

		if (engine.time >= 115.25 && t.insidefx) {
			if (t.insidefx.tick()) {
				t.insidefx = null;
				t.rasterfx.elapsed = 30.0;
			}
		}

		if (engine.time >= 129.75 && !t.preExitflashDone) {
			t.preExitflashDone = true;
			engine.addCanvasClient(engine.frontCanvas);
			engine.text2d.addRectangle({x: 0.0, y: 0.0, w:1.0, h:1.0, a:0.6, alpha:0.6, done:false, fillStyle:"#FFFFFF", fadeOut:0.7});
			engine.text2d.closeAllIn(1.0);
		}
		
		var saveTime = engine.time;
		if (!t.preExitflashDone)
			t.elapsed += engine.deltaTime;
		else
			t.elapsed += 0.0;
		engine.time = t.elapsed;
		engine.pushContext(webgl_2d_raymarch, "RenderTexSphere tick");
		var gl = engine.gl;
		engine.enterRenderTexture(t.rendertex);
		var savedt = engine.deltaTime;
		engine.deltaTime *= 1.2;
		t.rasterfx.tick(time,gl);
		engine.deltaTime = savedt;
		engine.exitRenderTexture();
		if (engine.autoFrameRateTex)
			engine.enterRenderTexture(engine.autoFrameRateTex);
		engine.useProgram(t.program);
//		gl.uniform3fv(t.program.iCameraTranslation, [5.0*Math.cos(time*0.05), 5.0*Math.sin(time*0.06), 2+2.2*Math.sin(time*0.05)]);
		if (t.insidefx) {
			gl.uniform1f(t.program.waveAmpl, 0.5*Math.sin(t.elapsed*0.25));
			gl.uniform1f(t.program.iGlobalTime, t.elapsed);
			gl.uniform3fv(t.program.iCameraTranslation, [2.8+0.5*Math.sin(time*0.19), 1.7+0.5*Math.cos(time*0.13), 3.0+2.0*Math.cos(time*0.37)]);
			var angle = 0.0;//time*0.025;
			gl.uniform3fv(t.program.iCameraUpVector, [-Math.sin(angle), Math.cos(angle), 0.0]);
		} else {
			t.rasterfx.elapsed += engine.deltaTime;
			gl.uniform1f(t.program.waveAmpl, (0.25*beatHandler.beatBarFader+0.5)*Math.sin(t.elapsed*0.5));
			gl.uniform1f(t.program.iGlobalTime, t.elapsed * 1.0);
			gl.uniform3fv(t.program.iCameraTranslation, [1.8+ 1.5*beatHandler.beatBarFader, 1.0+2.7 * Math.abs(Math.cos(t.elapsed)), 1.0+3.0 * Math.abs(Math.sin(t.elapsed)) + 1.0* beatHandler.beatBarFader]);
			var angle = time*0.75;
			if (t.endingStarted) {				
				gl.uniform1f(t.program.waveAmpl, 0.5);
		//		gl.uniform3fv(t.program.iCameraTranslation, [5.5+3.75*Math.abs(Math.sin(time*0.69)), 1.7+0.75*Math.cos(time*0.7), 0.0+2.0*Math.cos(time*1.9)]);
			}
			gl.uniform3fv(t.program.iCameraUpVector, [-Math.sin(angle), Math.cos(angle), 0.0]);
		}
		engine.setTexture(t.rendertex, 0);
		if (engine.autoFrameRateTex)
			gl.uniform3fv(t.program.iResolution, [engine.autoFrameRateTex.width, engine.autoFrameRateTex.height, 1.0]);
		t.quad.draw(gl, t.program);
		if (engine.autoFrameRateTex) {
			var progForBlit;
			engine.exitRenderTexture();
			if (t.endingStarted >= 0.0) {
				//if (beatHandler.lastGetDataIsBeat != 0)
					//t.mosaicAmount *= 0.25;
				t.mosaicAmount = 64.0 - 60.0 * beatHandler.beatBarFader;
				engine.useProgram(t.blitProgramMosaic);
				progForBlit = t.blitProgramMosaic;
				if (!t.tile_num)
					t.tile_num = gl.getUniformLocation(t.blitProgramMosaic, "tilenum");
				gl.uniform1f(t.tile_num, t.mosaicAmount);				
			}
			else {
				engine.useProgram(t.blitProgram);
				progForBlit = t.blitProgram;
			}
			engine.setTexture(engine.autoFrameRateTex, 0);
			t.quad.draw(engine.gl, progForBlit);
		}
		
		if (engine.passfx) {			
			engine.passfx.tick(time, gl);
			if (!engine.passfx.created)
				engine.passfx = null;
		}
		engine.popContext();
		engine.time = saveTime;
		if ((remaining <= 3.0) && (t.endingStarted < 0.0) && t.preExitflashDone) {
			t.endingStarted = t.elapsed;
			t.elapsed = 0.0
			engine.forceLOD(4.0);
		}
	},

	createFX : function(_gl, hideText) {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "RenderTexSphere createFX");
		var gl = engine.gl;
		t.hideText = hideText;
		t.program = engine.createProgramFromPrefetch(t.shaders);
		if (engine.autoFrameRate) {
			t.blitProgram = engine.createProgramFromPrefetch(t.blitShaders);
			t.blitProgramMosaic = engine.createProgramFromPrefetch(t.blitShadersMosaic);
		}
		t.quad.create(gl, -1.0, -1.0, 2.0, 2.0);
		t.program.iCameraTranslation = gl.getUniformLocation(t.program, "iCameraTranslation");
		t.program.iCameraUpVector = gl.getUniformLocation(t.program, "iCameraUpVector");
		t.program.waveAmpl = gl.getUniformLocation(t.program, "waveAmpl");
		t.rasterfx.createFX(gl, true);
		t.rendertex.createRenderTexture(gl, 512, 512, {wrap : engine.gl.REPEAT});
		engine.popContext();
	}
}
