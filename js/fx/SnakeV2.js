/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  SnakeV2(isSubFX) {
	var t = this;
	engine.pushContext(webgl_2d_raymarch, "SnakeV2 Constructor");
	t.maxCentersCount = 16;
	var scale = 0.6 * t.maxCentersCount / 6.0;
	
	t.texturesPath = "data/";
	t.shadersPath = "shaders/";
	t.vertexShader = [t.shadersPath + "engine/vertex.vs"];
	t.fragmentShader = [t.shadersPath + "fx/snakeV2.fs"];
	t.quad = new QuadMesh();
	t.colors = new Array();
	t.elapsed = 0;
	t.shape1 = new PointsMover(0, t.maxCentersCount, scale);
	t.shape2 = new PointsMover(2, t.maxCentersCount, scale);

	t.isSubFX = isSubFX;
	if (!t.isSubFX) {
		t.transitionFX = null;//new LeavingBars_Vert();
		t.transitionOUT = new FallingBars();
		t.transitionOn = false;
	}
	engine.popContext();
}

SnakeV2.prototype = {
	preloadResources : function() {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "SnakeV2 preloadResources");
		t.shaders = resman.prefetchShaderFiles(t.vertexShader, t.fragmentShader);
		if (!t.isSubFX) {
			if (t.transitionOUT)
				t.transitionOUT.preloadResources();
		}
		engine.popContext();
	},
	
	getTransitionDuration : function() {
		return 6.0;
	},

	tick : function(_time, _gl, remainingTime) {
		var t = this;
		t.elapsed += engine.deltaTime * 0.25;
		var time = t.elapsed + 5.0;
		engine.pushContext(webgl_2d_raymarch, "SnakeV2 tick");
		var gl = engine.gl;
		var scale = 0.4 + 0.4*beatHandler.beatBarFader;
		var count = 0;

		t.elapsed += engine.deltaTime;
		t.shape1.update(time);
		t.shape2.update(time);
		t.shape1.rotateX(time);
		t.shape2.rotateZ(time*0.2);
		var qv1 = 0.0*Math.abs(Math.cos(time * 0.05));
		var qv2 = 1.0-qv1;
		var zscale = 1.001;
		for (i = 0; i < t.maxCentersCount; i++) {
			t.colors[i*3] = Math.abs(Math.cos(i * 3.14159/t.maxCentersCount + time * 0.25));
			t.colors[i*3+1] = Math.abs(Math.sin(i * 3.14159/t.maxCentersCount + time * 0.15));
			t.colors[i*3+2] = Math.abs(Math.cos(i * 3.14159/t.maxCentersCount + time * 0.35));
			t.shape1.rotated[i*3+0] = qv1 * t.shape1.rotated[i*3+0] + qv2 * t.shape2.rotated[i*3+0];
			t.shape1.rotated[i*3+1] = qv1 * t.shape1.rotated[i*3+1] + qv2 * t.shape2.rotated[i*3+1];
			t.shape1.rotated[i*3+2] = 1.0 + 2.0*Math.abs(Math.cos(time*0.5)) + Math.abs(zscale * qv1 * t.shape1.rotated[i*3+2]) + Math.abs(zscale * qv2 * t.shape2.rotated[i*3+2]);
			if (t.shape1.rotated[i*3+2] == 0.0) {
				t.shape1.rotated[i*3+2] = 0.001;
			}
		}
	
		engine.useProgram(t.program);
		gl.uniform3fv(t.program.centers, t.shape1.rotated);
		gl.uniform3fv(t.program.colors, t.colors);
		gl.uniform1f(t.program.iGlobalTime, time);
		t.quad.draw(gl, t.program);

		if (t.transitionFX) 
			t.transitionFX.tick(time, remainingTime);
		if (t.transitionOn) {
			engine.passfx = t.transitionOUT;
			t.transitionOUT.tick(time, remainingTime);
		}


		if (!t.isSubFX) {	
			var startLogoAnimAt = 3.0;

			if (remainingTime < t.getTransitionDuration()) {
				if (t.transitionOUT != null && !t.transitionOn) {
					if (t.transitionFX) 
						t.transitionFX.exit(); // in case previous transition not over
					t.transitionOn = true;
					t.transitionOUT.enter();
				}
			}
		}
		engine.popContext(webgl_2d_raymarch);
	},


	enter : function() {
		var t = this;
		if (t.transitionFX)
			t.transitionFX.enter();
		t.tileStep = 0;
		t.elapsed = 0;
		engine.addCanvasClient(engine.canvases[webgl_2d_raymarch]);
		engine.addCanvasClient(engine.frontCanvas);
		engine.text2d.addRectangle({x: 0.0, y: 0.0, w:1.0, h:1.0, a:0.6, alpha:0.6, done:false, fillStyle:"#FFFFFF", fadeOut:0.7});
		engine.text2d.closeAllIn(1.0);
	},

	exit : function() {
		var t = this;
		if (t.transitionFX)
			t.transitionFX.exit();
		if (!t.isSubFX) {
			t.transitionOUT.startLeave();
		}
		engine.removeCanvasClient(engine.canvases[webgl_2d_raymarch]);
	},


	createFX : function(_gl, hideText) {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "SnakeV2 createFX");
		var gl = engine.gl;
		t.hideText = hideText;
		t.quad.create(gl, -1.0, -1.0, 2.0, 2.0);
		t.program = engine.createProgramFromPrefetch(t.shaders);
		t.program.centers = gl.getUniformLocation(t.program, "centers");
		t.program.colors = gl.getUniformLocation(t.program, "colors");
		t.program.iGlobalTime = gl.getUniformLocation(t.program, "iGlobalTime");
		if (t.transitionFX)
			t.transitionFX.createFX(gl, hideText);
		if (t.transitionOUT)
			t.transitionOUT.createFX(gl, hideText);
		engine.popContext();
	}
}
