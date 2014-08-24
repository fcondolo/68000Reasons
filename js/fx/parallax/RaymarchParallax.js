/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function RaymarchParallax() {
	var t = this;
	t.showRenderTexture = false;
	engine.pushContext(webgl_2d_raymarch, "RaymarchParallax Constructor");
	
	t.rendertex = new Texture();

	t.texturesPath = "data/";
	t.shadersPath = "shaders/";
	t.vertexShader = [t.shadersPath + "engine/vertex.vs"];
	t.fragmentShader = [
		t.shadersPath + "engine/RayMarchBaseHeader.fs",
		t.shadersPath + "fx/RayMarch_Parallax.fs",
		t.shadersPath + "engine/RayMarchBaseFooter.fs"];
	
	t.renderTexVertexShader = [t.shadersPath + "engine/vertex.vs"];
	t.renderTexFragmentShader = [t.shadersPath + "fx/Zygo.fs"];

	if (engine.autoFrameRate) {
		t.blitVS = [t.shadersPath + "engine/diffuseTexture2d.vs"];
		t.blitFS = [t.shadersPath + "engine/lod.fs"];
		t.blitFSMosaic = [t.shadersPath + "fx/MosaicAlpha.fs"];
//		t.blitFSKalei = [t.shadersPath + "fx/transitionZygo.fs"];
	}

	t.changeTextureTimer = 0.0;
	t.curTexture = 0;

	t.interp = new InterpolatorList();
	t.interp.addInterpolatorList(RayMParlxInt);
	t.camAngle = t.interp.getIndexByName("CamAngle");
	t.camX = t.interp.getIndexByName("CamX");
	t.camY = t.interp.getIndexByName("CamY");
	t.camZ = t.interp.getIndexByName("CamZ");
	t.zCoord = 20.0;
	t.quad = new QuadMesh();

	t.insidefx = new ComicStrip();
	t.comicStripTimeJump = 0.0;
	t.saveGlobalTime = 0.0;
	t.pixelswitch = false;
	engine.popContext();	
}

RaymarchParallax.prototype = {
	preloadResources : function() {
		var t = this;

		engine.pushContext(webgl_2d_raymarch, "RaymarchParallax preloadResources");
		
		if (engine.autoFrameRate) {
			t.blitShaders = resman.prefetchShaderFiles(t.blitVS, t.blitFS);
//			t.blitShadersKalei = resman.prefetchShaderFiles(t.blitVS, t.blitFSKalei);
			t.blitShadersMosaic = resman.prefetchShaderFiles(t.blitVS, t.blitFSMosaic);
		}
		
		t.textures1 = [
		resman.prefetchTexture(t.texturesPath + "3rdparty/metal.png"),
		resman.prefetchTexture(t.texturesPath + "3rdparty/DISCO1.jpg"),
		resman.prefetchTexture(t.texturesPath + "3rdparty/DISCO2.jpg"),
		];

		t.textures2 = [
		resman.prefetchTexture(t.texturesPath + "3rdparty/PIXEL6.JPG"),
		resman.prefetchTexture(t.texturesPath + "3rdparty/PIXEL2.JPG"),
		resman.prefetchTexture(t.texturesPath + "3rdparty/PIXEL7.JPG")
		];

		t.textures = t.textures1;
		
		t.shaders = resman.prefetchShaderFiles(t.vertexShader, t.fragmentShader);
		t.rtshaders = resman.prefetchShaderFiles(t.renderTexVertexShader, t.renderTexFragmentShader);
		t.insidefx.preloadResources();
		engine.popContext();

	},

	exit : function() {
		var t = this;
		if (t.insidefx)
			t.insidefx.exit();
		if (t.text)
			t.text.fadeOut = 0.5;
		engine.removeCanvasClient(engine.canvases[webgl_2d_raymarch]);
		engine.doPauseBeat(false);
	},

	enter : function() {
		var t = this;
		if (!t.hideText) {
			t.text = {x:0.05, y:0.95, string:"Morph Tunnel", fillStyle:"#FFFFFF", alpha: 0.0, fadeIn: 1.0};
			engine.text2d.addEntry(t.text);
		}
		engine.addCanvasClient(engine.canvases[webgl_2d_raymarch]);
		t.comicStripTimeJump = 0.0;
		t.textures = t.textures1;
		t.saveGlobalTime = 0.0;
		t.pixelswitch = false;
		t.endingStarted = -1.0;
		t.elapsed = 0.0;
		t.lum = 1.0;
	},
	
	
	tick : function(time, _gl, remaining) {	
		var t = this;
		if (engine.passfx)
			if (engine.passfx.tick(time))
				engine.passfx = null;
				
		t.elapsed += engine.deltaTime;
		engine.pushContext(webgl_2d_raymarch, "RaymarchParallax tick");
		var gl = engine.gl;
		var shaderTime = engine.time;
		var pauseShaderValues = false;
		var fixTextures = false;
		var progForBlit = null;
		if (engine.time >= 83.5 && t.insidefx) { // 84
			engine.forceLOD(5.5);
			progForBlit = t.blitProgramMosaic;
			if (!t.tile_num)
				t.tile_num = gl.getUniformLocation(t.blitProgramMosaic, "tilenum");
		}
		if (engine.time >= 84.0 && t.insidefx) { //84.52
			if (t.saveGlobalTime == 0.0)
				t.saveGlobalTime = engine.time;
			shaderTime = t.saveGlobalTime;
			fixTextures = true;
			t.curTexture = 0;
			t.changeTextureTimer = 0.0;
			//pauseShaderValues = true;
			t.pixelswitch = true;
			//engine.doPauseBeat(true);
			if (t.insidefx.tick()) {
				t.insidefx = null;
				t.textures = t.textures2;
			} else {
			}
		}
		
		t.interp.update(time + t.comicStripTimeJump);
		
		// should be consts but JS optimizers hate consts
		var changeTexEvery = 5.0;		
		var halfPI = Math.PI * 0.5;

		if (!t.showRenderTexture)
			engine.enterRenderTexture(t.rendertex);
		engine.useProgram(t.renderTexProgram);
		gl.uniform1f(t.renderTexProgram.lum, t.lum);
		t.quad.draw(gl, t.renderTexProgram);
		
		if (!t.showRenderTexture) {
			engine.exitRenderTexture();
			if (engine.autoFrameRateTex)
				engine.enterRenderTexture(engine.autoFrameRateTex);

			engine.useProgram(t.program);
			
			t.changeTextureTimer += 1.0/30.0;
			if (t.changeTextureTimer >= changeTexEvery) {
				t.changeTextureTimer -= changeTexEvery;
				t.curTexture = (t.curTexture + 1) % t.textures.length;
			}
			
			t.zCoord += t.interp.getByIndex(t.camZ).interpolator.getValueAt(time);
			
			var angle = t.interp.getByIndex(t.camAngle).interpolator.getValueAt(time);
			
			var nextindex = (t.curTexture+1) % t.textures.length;
			
			
			// USE INTERPOLLATOR INSTEAD
			var tex1Ratio = 12.0*t.changeTextureTimer/changeTexEvery - 6.0;
			var tex2Ratio = 1.0/(1.0+Math.pow(Math.E, -tex1Ratio));
			if (fixTextures) {
				t.curTexture = 0;
				nextindex = 1;
				tex1Ratio = 1.0;
				tex2Ratio = 0.0;
			}
			gl.uniform1f(t.program.iGlobalTime, shaderTime);			
			if (!pauseShaderValues) {
				gl.uniform1f(t.program.iTex0Ratio, 1.0-tex2Ratio);
				gl.uniform1f(t.program.iTex1Ratio, tex2Ratio);
				gl.uniform3fv(t.program.iCameraTranslation, [t.interp.getByIndex(t.camX).interpolator.getValueAt(time), t.interp.getByIndex(t.camX).interpolator.getValueAt(time), t.zCoord]);
				gl.uniform3fv(t.program.iCameraUpVector, [-Math.sin(angle), Math.cos(angle), 0.0]);
			}
//			if (t.pixelswitch){
//				gl.uniform1f(program.beatBarFader, 0.0); // avoid fog while in 8 bit sequence
//			}
			
			engine.setTexture(t.textures[t.curTexture], 0);
			engine.setTexture(t.textures[nextindex], 1);
			engine.setTexture(t.rendertex, 2);
			if (engine.autoFrameRateTex) {
	//			engine.gl.enable(engine.gl.SCISSOR_TEST);
				gl.uniform3fv(t.program.iResolution, [engine.autoFrameRateTex.width, engine.autoFrameRateTex.height, 1.0]);
			}
			t.quad.draw(gl, t.program);
//			engine.gl.scissor(0.0, 0.0, engine.canvas.width, engine.canvas.height);
//			engine.gl.disable(engine.gl.SCISSOR_TEST);
			if (engine.autoFrameRateTex) {
				engine.exitRenderTexture();
				
				if (t.endingStarted >= 0.0) {
					t.lum = Math.max(0.0, t.lum - engine.deltaTime);
					
//					engine.useProgram(t.blitProgramKalei);
//					progForBlit = t.blitProgramKalei;					
//					engine.gl.uniform1f(t.blitProgramKalei.lum, t.lum);
				}
				if (progForBlit != null) {
					engine.useProgram(progForBlit);
					gl.uniform1f(t.tile_num, Math.max(1.0, 40.0-(engine.time - 84.0)*10.0));
				}
				else {
					engine.useProgram(t.blitProgram);
					progForBlit = t.blitProgram;
				}
				engine.setTexture(engine.autoFrameRateTex, 0);
				t.quad.draw(engine.gl, progForBlit);
			}
		}
		engine.popContext();
		if ((remaining <= 2.0) && (t.endingStarted < 0.0)) {
			t.endingStarted = t.elapsed;
			engine.doPauseBeat(true);
		}
		return false;
	},

	createFX : function(_gl, hideText) {
		var t = this;

		engine.pushContext(webgl_2d_raymarch, "RaymarchParallax createFX");
		var gl = engine.gl;
		t.hideText = hideText;
		t.quad.create(gl, -1.0, -1.0, 2.0, 2.0);
		t.program = engine.createProgramFromPrefetch(t.shaders);
		t.program.iTex0Ratio = gl.getUniformLocation(t.program, "iTex0Ratio");
		t.program.iTex1Ratio = gl.getUniformLocation(t.program, "iTex1Ratio");
		t.program.iCameraTranslation = gl.getUniformLocation(t.program, "iCameraTranslation");
		t.program.iCameraUpVector = gl.getUniformLocation(t.program, "iCameraUpVector");
			
		t.renderTexProgram = engine.createProgramFromPrefetch(t.rtshaders);
		t.renderTexProgram.lum = engine.gl.getUniformLocation(t.renderTexProgram, "lum");

		if (engine.autoFrameRate) {
			t.blitProgram = engine.createProgramFromPrefetch(t.blitShaders);
			t.blitProgramMosaic = engine.createProgramFromPrefetch(t.blitShadersMosaic);
//			t.blitProgramKalei = engine.createProgramFromPrefetch(t.blitShadersKalei);
//			t.blitProgramKalei.lum = engine.gl.getUniformLocation(t.blitProgramKalei, "lum");
		}
						
		var options = {};
		options.wrap = engine.gl.REPEAT;
		t.rendertex.createRenderTexture(gl, 512, 512, options);

		engine.popContext();
	}
}
