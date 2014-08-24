/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  TransitionCube() {
	var t = this;
	t.screenFitscale = 1.0;

	t.cube = new makeMonitor( {
		vertexShader	: "diffuseTexture3d.vs",
		fragmentShader	: "diffuseTexture3d.fs",
		initialTrans	: {x:0.0, y:0.0, z:0.0}
	}, false
	);
}

TransitionCube.prototype = {
	preloadResources : function() {
		engine.pushContext(webgl_3d_objects, "TransitionCube Constructor");
			var t = this;
			t.cubeTexture = resman.prefetchTexture("data/xmas.jpg");
			t.cube.preloadResources();
		engine.popContext();
	},
	
	enter : function() {
		this.cube.enter();
		this.elapsed = 0;
	},

	exit : function() {
		this.cube.exit();
	},

	tick : function(time, _gl) {
		var t = this;
		if (!t.cube.loaded)
			return;
		engine.pushContext(webgl_3d_objects, "TransitionCube tick");
		var gl = engine.gl;
		gl.clearColor(0.0,0.0,0.4,1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		t.elapsed += engine.deltaTime;
		t.cube.tick(time, gl, t.cubeTexture);
		var angle = t.elapsed * 30;
		t.cube.lightDir.x = Math.cos(t.elapsed);
		t.cube.lightDir.y = Math.sin(t.elapsed);
		t.cube.lightDir.z = Math.sin(t.elapsed)+Math.cos(t.elapsed*1.5);
        t.cube.rotate(angle, angle*2.5 , angle*3.0);
		//t.cube.setScale(t.screenFitscale * engine.canvas.width/engine.canvas.height, t.screenFitscale, t.screenFitscale * 0.5);
		engine.popContext();
	},

	createFX : function(_gl) {
		var t = this;
		engine.pushContext(webgl_3d_objects, "TransitionCube createFX");
		var gl = engine.gl;
		t.cube.createFX(gl);
		//t.cube.setScale(t.screenFitscale * engine.canvas.width/engine.canvas.height, t.screenFitscale, t.screenFitscale * 0.5);
		engine.popContext();
	}
}
