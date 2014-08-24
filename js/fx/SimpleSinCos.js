/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  SimpleSinCos() {
	var t = this;
	engine.pushContext(webgl_2d_raymarch, "SimpleSinCos Constructor");
		t.texturesPath = "data/";
		t.shadersPath = "shaders/";
		t.vertexShader = [t.shadersPath + "engine/vertex.vs"];
		t.fragmentShader = [t.shadersPath + "fx/SimpleSinCos.fs"];
		t.quad = new QuadMesh();
	engine.popContext();
}

SimpleSinCos.prototype = {
	preloadResources : function() {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "SimpleSinCos preloadResources");
			t.shaders = resman.prefetchShaderFiles(t.vertexShader, t.fragmentShader);		
		engine.popContext();
	},

	enter : function() {
		var t = this;
		engine.addCanvasClient(engine.canvases[webgl_2d_raymarch]);
	},

	exit : function() {
		var t = this;
		engine.removeCanvasClient(engine.canvases[webgl_2d_raymarch]);
	},
	
	tick : function(time, _gl, remainingTime) {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "SimpleSinCos tick");
			var gl = engine.gl;
			engine.useProgram(t.program);
			t.quad.draw(gl, t.program);
		engine.popContext();
	},

	createFX : function(_gl) {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "SimpleSinCos preloadResources");
			var gl = engine.gl;
			t.program = engine.createProgramFromPrefetch(t.shaders);
			t.quad.create(gl, -1.0, -1.0, 2.0, 2.0);
		engine.popContext();
}
}


