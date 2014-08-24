/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  BootBlock() {
	/*var t = this;
	engine.pushContext(webgl_3d_objects, "BootBlock Constructor");
		t.shadersPath = "shaders/engine/";
		t.vertexShader = [t.shadersPath + "diffuseTexture2d.vs"];
		t.fragmentShader = [t.shadersPath + "diffuseTexture2d.fs"];
		t.texturesPath = "data/";
		t.tex = new Texture();
		t.quad = new QuadMesh();
	engine.popContext();
*/
}

BootBlock.prototype = {
	preloadResources : function() {
	/*	var t = this;
		engine.pushContext(webgl_3d_objects, "BootBlock preloadResources");
			t.tex = resman.prefetchTexture(t.texturesPath + "amiga/novirus.jpg");
			t.shaders = resman.prefetchShaderFiles(t.vertexShader, t.fragmentShader);
		engine.popContext();*/
	},
	
	tick : function(time, _gl) {
/*		var t = this;
		engine.pushContext(webgl_3d_objects, "BootBlock tick");
		var gl = engine.gl;
			engine.useProgram(t.program);
			engine.setTexture(t.tex, 0);
			t.quad.draw(gl, t.program);
		engine.popContext();*/
	},

	createFX : function(_gl) {
/*		var t = this;

		engine.pushContext(webgl_3d_objects, "BootBlock createFX");
			var gl = engine.gl;
			t.quad.create(gl, -1.0, -1.0, 2.0, 2.0);
			t.program = engine.createProgramFromPrefetch(t.shaders);
		engine.popContext();
		*/
	}
}
