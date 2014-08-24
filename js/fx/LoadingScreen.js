/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  LoadingScreen(makeMonitor) {
	var t = this;
	engine.pushContext(webgl_3d_objects, "LoadingScreen Constructor");
	
	t.cube = new Cube( {
			initialScale	: {x:1.0, y:2.0, z:1.0},
			initialTrans	: {x:-1.2, y:0.1, z:2.0},
			initialRot		: {x:0.0, y:0.0, z:0.0}
		}, "monitor"
		);
/*
		// create quad to display "Loading" sprite
		t.loadingTextVS = ["shaders/engine/diffuseTexture2d.vs"];
		t.loadingTextFS = ["shaders/engine/diffuseTexture2d.fs"];
		t.loadingTextQuad = new QuadMesh();*/
	engine.popContext();
}

LoadingScreen.prototype = {
	preloadResources : function() {
		engine.pushContext(webgl_3d_objects, "LoadingScreen Constructor");
			var t = this;
			t.cubeTexture = resman.prefetchTexture("data/Made_MoltenCore_2.jpg");
			t.cube.preloadResources();
		engine.popContext();
	},
	
	enter : function() {
		console.log("START ENTER LOADING");
		engine.addCanvasClient(engine.canvases[webgl_3d_objects]);
		engine.pushContext(webgl_3d_objects, "LoadingScreen enter");
			this.cube.enter();
		engine.popContext();
		console.log("END ENTER LOADING");
	},

	exit : function() {
		console.log("START EXIT LOADING");
		engine.pushContext(webgl_3d_objects, "LoadingScreen exit");
			this.cube.exit();
			engine.clearContext();
		engine.popContext();
		engine.removeCanvasClient(engine.canvases[webgl_3d_objects]);
		console.log("END EXIT LOADING");
	},

	tick : function(time, _gl) {
		var t = this;

		engine.pushContext(webgl_3d_objects, "LoadingScreen tick");
			var gl = engine.gl;
			t.cube.tick(time, gl, t.cubeTexture);
//			t.cube.rotate(t.cube.rot.x + engine.deltaTime * 20.0, t.cube.rot.y + engine.deltaTime * 40.0, null);
//			t.cube.trans.z = 1.5*Math.abs(Math.cos(engine.time*0.8));
			/*engine.useProgram(t.loadingTextShasders);
			t.loadingTextQuad.update(gl, 1.0-(time*0.1)%3.0, -0.75, 0.5,0.5,0.0,0.0,1.0,1.0);
			engine.setTexture(t.loadingTextTexture, 0);
			t.loadingTextQuad.draw(gl, t.loadingTextShasders);					*/
			gl.flush();
		engine.popContext();
	},

	createFX : function(_gl) {
		var t = this;
		engine.pushContext(webgl_3d_objects, "LoadingScreen createFX");
			gl = engine.gl;
			t.cube.createFX(gl);

		//	t.loadingTextShasders = engine.createProgramFromPrefetch(t.loadingTextShaders);
		//	t.loadingTextQuad.create(gl, -1.0, -1.0, 2.0, 2.0);		
		engine.popContext();
	}
}
