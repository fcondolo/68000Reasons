/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/
 
alert("NOT USED ERROR");

NOT USED ERROR

/**
 * @constructor
 */
function  Diskette() {
	var t = this;
	engine.pushContext(webgl_3d_objects, "Diskette Constructor");
	
	t.cube = new Cube( {
			shadersPath		: "shaders/engine/",
			vertexShader	: ["diffuseTexture3d.vs"],
			fragmentShader	: ["diffuseTexture3d.fs"],
			initialScale	: {x:0.8, y:1.0, z:0.02},
			initialTrans	: {x:0.0, y:0.5, z:0.0},
			initialRot		: {x:330.0, y:0.0, z:0.0}
		}, "diskette"
		);
/*
		// create quad to display "Loading" sprite
		t.loadingTextVS = ["shaders/engine/diffuseTexture2d.vs"];
		t.loadingTextFS = ["shaders/engine/diffuseTexture2d.fs"];
		t.loadingTextQuad = new QuadMesh();*/
	engine.popContext();
}

Diskette.prototype = {
	preloadResources : function() {
		engine.pushContext(webgl_3d_objects, "Diskette Constructor");
			var t = this;
			t.cubeTexture = resman.prefetchTexture("data/amiga/floppy.png");
			t.cube.preloadResources();
		engine.popContext();
	},
	
	enter : function() {
		console.log("START ENTER LOADING");
		engine.addCanvasClient(engine.canvases[webgl_3d_objects]);
		engine.pushContext(webgl_3d_objects, "Diskette enter");
			this.cube.enter();
		engine.popContext();
		console.log("END ENTER LOADING");
	},

	exit : function() {
		console.log("START EXIT LOADING");
		engine.pushContext(webgl_3d_objects, "Diskette exit");
			this.cube.exit();
			engine.clearContext();
		engine.popContext();
		engine.removeCanvasClient(engine.canvases[webgl_3d_objects]);
		console.log("END EXIT LOADING");
	},

	tick : function(time, _gl) {
		var t = this;

		engine.pushContext(webgl_3d_objects, "Diskette tick");
			var gl = engine.gl;
			engine.clearContext(0,0,0,1);
			t.cube.tick(time, gl, t.cubeTexture);
			t.cube.rotate(null, t.cube.rot.y + 0.75, null);
			/*engine.useProgram(t.loadingTextShasders);
			t.loadingTextQuad.update(gl, 1.0-(time*0.1)%3.0, -0.75, 0.5,0.5,0.0,0.0,1.0,1.0);
			engine.setTexture(t.loadingTextTexture, 0);
			t.loadingTextQuad.draw(gl, t.loadingTextShasders);					*/
			gl.flush();
		engine.popContext();
	},

	createFX : function(_gl) {
		var t = this;
		engine.pushContext(webgl_3d_objects, "Diskette createFX");
			gl = engine.gl;
			t.cube.createFX(gl);

		//	t.loadingTextShasders = engine.createProgramFromPrefetch(t.loadingTextShaders);
		//	t.loadingTextQuad.create(gl, -1.0, -1.0, 2.0, 2.0);		
		engine.popContext();
	}
}
