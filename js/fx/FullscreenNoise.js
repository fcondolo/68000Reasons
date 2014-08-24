/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  FullscreenNoise() {
	var t = this;
	
	engine.pushContext(webgl_2d_raymarch, "FullscreenNoise Constructor");
	t.shadersPath = "shaders/";
	t.vertexShader = [t.shadersPath + "engine/vertex.vs"];
	t.fragmentShader = [t.shadersPath + "fx/tvnoise.fs"];
	t.quad = new QuadMesh();
	t.elapsed = 0;

	engine.popContext();
}

FullscreenNoise.prototype = {
	
	preloadResources : function() {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "FullscreenNoise preloadResources");
			t.shaders = resman.prefetchShaderFiles(t.vertexShader, t.fragmentShader);
		engine.popContext();
	},

	enter : function(_lastTickFx) {
		var t = this;
		engine.addCanvasClient(engine.canvases[webgl_2d_raymarch], "FullscreenNoise enter");
		engine.addCanvasClient(engine.frontCanvas, "FullscreenNoise enter");
		engine.pushContext(webgl_2d_raymarch, "FullscreenNoise enter");
			t.elapsed = 0;
		engine.popContext();
		engine.text2d.clearAll();
		engine.text2d.hijacked = true;
	},
	
	exit : function() {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "FullscreenNoise exit");
		engine.removeCanvasClient(engine.frontCanvas, "FullscreenNoise exit");
		engine.removeCanvasClient(engine.canvases[webgl_2d_raymarch], "FullscreenNoise exit");
		engine.text2d.hijacked = false;
		engine.popContext();
	},

	tick : function(_time, _gl, remainingTime) {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "FullscreenNoise tick");
			var gl = engine.gl;
			t.elapsed += engine.deltaTime;
			engine.useProgram(t.program);
			gl.uniform1f(t.program.iGlobalTime, t.elapsed);
			t.quad.draw(gl, t.program);		
		engine.popContext();

		var cvs = engine.frontCanvas;
		var w = cvs.width;
		var h = cvs.height;
		var centerX = w * 0.5;
		var centerY = h * 0.5;
		var ctx = engine.frontContext;
		
		ctx.globalAlpha = 1.0;
		ctx.fillStyle = "#00FF00";
		for (var i = 0; i < Math.floor(engine.time * 3.0); i++)
			ctx.fillRect(w * 0.02 * (i + 2.0), h * 0.9, w * 0.01, h* 0.05);
	},

	createFX : function(_gl, hideText) {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "FullscreenNoise createFX");
			var gl = engine.gl;
			t.quad.create(gl, -1.0, -1.0, 2.0, 2.0);
			t.program = engine.createProgramFromPrefetch(t.shaders);
			t.program.iGlobalTime = gl.getUniformLocation(t.program, "iGlobalTime");
		engine.popContext();
	}
}
