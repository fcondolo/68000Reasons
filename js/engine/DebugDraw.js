/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function DebugDraw(vs, fs) {
	var t = this;
	t.shadersPath = "shaders/engine/";
	
	t.vertexShader = vs || [t.shadersPath + "diffuseTexture2d.vs"];
	t.fragmentShader = fs || [t.shadersPath + "diffuseTexture2dAlpha.fs"];
	t.sprite = new Sprite();
	var t = this;
	t.shaders = resman.prefetchShaderFiles(t.vertexShader, t.fragmentShader);
	t.built = false;
	t.tex = null;
}

DebugDraw.prototype = {
	draw : function(gl, tex) {
		var t = this;
		if (!t.tryBuild(gl, tex))
			return;
		t.sprite.tex = tex;
		engine.useProgram(t.program);
		t.sprite.draw(gl, t.program);
	},
	
	tryBuild : function(gl, tex) {
		var t = this;
		if (t.built)
			return true;
		if (!tex || !tex.loaded)
			return false;
		if (!t.shaders[0].loaded || !t.shaders[1].loaded)
			return false;
		t.program = engine.createProgramFromPrefetch(t.shaders);
		t.sprite.create(gl, tex);
		t.built = true;
		return true;
	}
}