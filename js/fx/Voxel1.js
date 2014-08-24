/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
	BEWARE: TEXTURES MUST HAVE WHITE COLOR FOR TRANSPARENT PIXELS!
	In other terms: If alpha is null, then RGB must be to 1
**/

/**
 * @constructor
 */
function  Voxel1() {
	var t = this;

	engine.pushContext(webgl_2d_raymarch, "Voxel1 Constructor");

	t.texturesPath = "data/";
	t.shadersPath = "shaders/";
	t.vertexShader = [t.shadersPath + "engine/vertex.vs"];
	t.fragmentShader = [t.shadersPath + "fx/BaseVoxel.fs"];
	t.quad = new QuadMesh();
	t.tex1 = new Texture();
	t.tex2 = new Texture();	

	if (engine.autoFrameRate) {
		t.blitVS = [t.shadersPath + "engine/diffuseTexture2d.vs"];
		t.blitFS = [t.shadersPath + "engine/lod.fs"];
	}
/*	
	engine.pushContext(webgl_2d_frontSprites, "Voxel1 Constructor");
		t.dbg = new DebugDraw(null, ["shaders/fx/MosaicAlpha.fs"]);
	engine.popContext();
	*/

	t.elapsed = 0.0;
	engine.popContext();
}

Voxel1.prototype = {
	preloadResources : function() {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "Voxel1 preloadResources");
		t.shaders = resman.prefetchShaderFiles(t.vertexShader, t.fragmentShader);
		if (engine.autoFrameRate) {
			t.blitShaders = resman.prefetchShaderFiles(t.blitVS, t.blitFS);
		}
/*
		engine.pushContext(webgl_2d_frontSprites, "Circles preloadResources 2");
			t.dbgTex = resman.prefetchTexture("data/greetz_68000.png");
		engine.popContext();
	*/	
		t.textures = [		
		resman.prefetchTexture(t.texturesPath + "3rdparty/greets_pha.png"),
		resman.prefetchTexture(t.texturesPath + "3rdparty/greets_silents2.png"),
		resman.prefetchTexture(t.texturesPath + "3rdparty/greets_razor.png"),
		resman.prefetchTexture(t.texturesPath + "3rdparty/greets_trsi2.png"),
		resman.prefetchTexture(t.texturesPath + "3rdparty/greets_scoopex.png"),
		resman.prefetchTexture(t.texturesPath + "3rdparty/greets_anarchy2.png")
		];

		t.colors = [
		{r:119.0, g:68.0, b:189.0},		// phenomena
		{r:0.0, g:114.0, b:255.0},	// silents
		{r:85.0, g:110.0, b:193.0},		// razor
		{r:213.0, g:8.0, b:12.0},		// trsi
		{r:177.0, g:33.0, b:32.0},		// scoopex
		{r:173.0, g:101.0, b:99.0}		// anarchy
		];
		
		engine.popContext();
	},

	enter : function() {
		var t = this;
		beatHandler.scaleBar(2.0);
		engine.addCanvasClient(engine.canvases[webgl_2d_raymarch]);
	//	engine.addCanvasClient(engine.canvases[webgl_2d_frontSprites]);
		t.elapsed = 0.0;
		t.changeTextureTimer = 0.0;
		t.curTexture = 0;
		t.prevTexture = 0;
		t.prevTexRatio = 1.0;
		t.prevTexTimer = -1.0;
		t.prevTexWait = 0.0;
//		engine.setCanvasZIndex("spritesCanvas", 16);
		t.bar = {x: 0.0, y: 0.0, w: engine.frontCanvas.width, h:engine.frontCanvas.height, alpha:1.0, fillStyle:"#9B59F6", fadeOut:2.0};
//FourBars_Vert()
		engine.addCanvasClient(engine.frontCanvas);
		engine.text2d.addRectangle(t.bar);
		engine.text2d.closeAllIn(2.5);
	},

	exit : function() {
		var t = this;
	//	engine.removeCanvasClient(engine.canvases[webgl_2d_frontSprites]);
		engine.removeCanvasClient(engine.canvases[webgl_2d_raymarch]);
	},

	getTransitionDuration : function() {
		return 1.0;
	},
	
	tick : function(time, _gl, remainingTime) {
		var t = this;
		var changeTexEvery = 8.0;
		t.elapsed += engine.deltaTime;
		
		engine.pushContext(webgl_2d_raymarch, "Voxel1 tick");
		var gl = engine.gl;
		
		if (engine.autoFrameRateTex)
			engine.enterRenderTexture(engine.autoFrameRateTex);
		engine.useProgram(t.program);
		
		t.changeTextureTimer += engine.deltaTime;
		var deltaToChangeTex = changeTexEvery - t.changeTextureTimer;
		var tex1Ratio = 1.0;
		var transitionDuration = 1.0;
		if (deltaToChangeTex < transitionDuration) {
			deltaToChangeTex = Math.min(Math.max(deltaToChangeTex/transitionDuration, 0.0), 1.0);
			tex1Ratio = deltaToChangeTex;
			if (t.changeTextureTimer >= changeTexEvery) {
				t.changeTextureTimer -= changeTexEvery;
				t.prevTexture = t.curTexture;
				t.curTexture = (t.curTexture + 1) % t.textures.length;
				tex1Ratio = 1.0;
				t.prevTexTimer = 1.0;
				t.prevTexRatio = 1.0;
				t.prevTexWait = 0.5;
			}
		}
		
		if (t.prevTexWait > 0.0) {
			t.prevTexWait -= engine.deltaTime;
		} 
		else if (t.prevTexTimer > 0.0) {
			t.prevTexRatio = t.prevTexTimer;
			t.prevTexTimer -= engine.deltaTime;
			if (t.prevTexTimer <= 0.0) {
				t.prevTexRatio = 0.0;
			//	t.tex1PixSlope *= -1.0;
			}
		}

		var nextindex = (t.curTexture+1) % t.textures.length;

		gl.uniform1f(t.program.tex1ratio, tex1Ratio);
		gl.uniform1f(t.program.tex2ratio, 1.0-tex1Ratio);
		gl.uniform1f(t.program.prevTexRatio, t.prevTexRatio);
		gl.uniform1f(t.program.curTexRatio, 1.0-t.prevTexRatio);
		var cr = (t.colors[t.curTexture].r * tex1Ratio + t.colors[nextindex].r * (1.0 - tex1Ratio)) / 256.0;
		var cg = (t.colors[t.curTexture].g * tex1Ratio + t.colors[nextindex].g * (1.0 - tex1Ratio)) / 256.0;
		var cb = (t.colors[t.curTexture].b * tex1Ratio + t.colors[nextindex].b * (1.0 - tex1Ratio)) / 256.0;
		gl.uniform3fv(t.program.backColor, [cr, cg, cb]);
		
		engine.setTexture(t.textures[t.curTexture], 0);
		engine.setTexture(t.textures[nextindex], 1);
		engine.setTexture(t.textures[t.prevTexture], 2);		

		if (engine.autoFrameRateTex)
			gl.uniform3fv(t.program.iResolution, [engine.autoFrameRateTex.width, engine.autoFrameRateTex.height, 1.0]);
		gl.uniform1f(t.program.iGlobalTime, t.elapsed);
		t.quad.draw(gl, t.program);
		if (engine.autoFrameRateTex) {
			engine.exitRenderTexture();
			engine.useProgram(t.blitProgram);
			engine.setTexture(engine.autoFrameRateTex, 0);
			t.quad.draw(engine.gl, t.blitProgram);
		}
		engine.popContext();
/*		
		engine.pushContext(webgl_2d_frontSprites, "Voxel1 tick2");
		var gl2 = engine.gl;
		var startLogoAnimAt = 3.0;
		if (t.dbg.tryBuild(gl2, t.dbgTex)) {
			t.dbg.draw(gl2, t.dbgTex);
			if (!t.ColorFader)
				t.ColorFader = gl2.getUniformLocation(t.dbg.program, "ColorFader");					
				t.dbg.sprite.setScale(0.16, 0.16*engine.canvas.width/engine.canvas.height);
				t.dbg.sprite.setTransfo(-0.6, -0.6, 0.0);
				if (!t.tile_num)
					t.tile_num = gl2.getUniformLocation(t.dbg.program, "tilenum");
				gl2.uniform1f(t.tile_num, 10000.0);
				gl2.uniform1f(t.ColorFader, 0.0);
		}
		engine.popContext();
		*/
	},

	createFX : function(_gl) {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "Voxel1 createFX");
		var gl = engine.gl;
		t.program = engine.createProgramFromPrefetch(t.shaders);
		t.program.tex1ratio = gl.getUniformLocation(t.program, "tex1ratio");
		t.program.tex2ratio = gl.getUniformLocation(t.program, "tex2ratio");
		t.program.prevTexRatio = gl.getUniformLocation(t.program, "prevtexratio");
		t.program.curTexRatio = gl.getUniformLocation(t.program, "curtexratio");
		t.program.backColor = gl.getUniformLocation(t.program, "backColor");
		t.quad.create(gl, -1.0, -1.0, 2.0, 2.0);
		if (engine.autoFrameRate)
			t.blitProgram = engine.createProgramFromPrefetch(t.blitShaders);

		engine.popContext();
	}
}


