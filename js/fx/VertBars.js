/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/
var engine = new Engine();
var resman = new ResourceManager();

/**
 * @constructor
 */
function  TestRaymarch() {
	var t = this;

	t.texturesPath = "data/";
	t.shadersPath = "shaders/";
	t.vertexShader = [t.shadersPath + "engine/vertex.vs"];
	t.fragmentShader = [t.shadersPath + "engine/RayMarchBaseHeader.fs", t.shadersPath + "fx/VertBars.fs", t.shadersPath + "engine/RayMarchBaseFooter2.fs"];
	t.quad = new QuadMesh();
	t.tex = new Texture();
}

TestRaymarch.prototype = {
	preloadResources : function() {
		var t = this;
		t.shaders = resman.prefetchShaderFiles(t.vertexShader, t.fragmentShader);
		t.tex = resman.prefetchTexture(t.texturesPath + "DISCO1.jpg");
	},
	
	tick : function(time, gl) {
		var t = this;
		engine.useProgram(t.program);
		engine.setTexture(t.tex, 0);
		var slowTime = time*0.1;
		engine.gl.uniform3fv(t.program.iCameraUpVector, [Math.cos(slowTime*1.3), Math.sin(slowTime*2.0), -Math.sin(slowTime)]);
		engine.gl.uniform3fv(t.program.iCameraTranslation, [slowTime, slowTime*0.5, slowTime*2.0]);
		engine.gl.uniform1f(t.program.RaymarchMinDistDistortion, 20.0*Math.sin(slowTime));		
		engine.gl.uniform1f(t.program.iMyTime, slowTime);		
		engine.gl.uniform1f(t.program.RaymarchRayModulus, 5.0*Math.abs(Math.sin(slowTime*0.1)));

		t.quad.draw(gl, t.program);
	},

	createFX : function(gl) {
		var t = this;

		t.program = engine.createProgramFromPrefetch(t.shaders);
		t.quad.create(gl, -1.0, -1.0, 2.0, 2.0);
		t.program.iCameraTranslation = gl.getUniformLocation(t.program, "iCameraTranslation");
		t.program.iCameraUpVector = gl.getUniformLocation(t.program, "iCameraUpVector");
		t.program.iMyTime = gl.getUniformLocation(t.program, "iMyTime");
		t.program.RaymarchRayModulus = gl.getUniformLocation(t.program, "RaymarchRayModulus");
	}
}


var test = new TestRaymarch();


var initDone = false;


function  update(time, deltaTime) {
	if (!initDone) {
		if (resman.isReady()) {
			initDone = true;
			test.createFX(engine.gl);
		}
	}
	else
		test.tick(time, engine.gl);
}


function demoInit(){
	engine.init(30.0, null);
	test.preloadResources();
	engine.globalUpdate = update;
}
