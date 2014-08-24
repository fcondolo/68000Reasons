/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  RubberCube2() {
	var t = this;
	engine.pushContext(webgl_3d_objects, "RubberCube2 Constructor");
		t.shadersPath = "shaders/";
		t.vertexShader = [t.shadersPath + "engine/diffuseTexture3d.vs"];
		t.fragmentShader = [t.shadersPath + "fx/rubbercube2.fs"];
		t.currentAngle = 0.0;
		t.curtexIndex = 0;
		t.sessions = 0;
		t.elapsed = 0;
		t.rendertex = new Texture();
	engine.popContext();
	t.background = new SimpleSinCos();
	t.rasterfx = new LoadingScreen(false);//TransitionCube(true);
	t.introDuration = 3.82;
}

RubberCube2.prototype = {
	preloadResources : function() {
		var t = this;
		engine.pushContext(webgl_3d_objects, "RubberCube2 preloadResources");
			t.tex = resman.prefetchTexture("data/1084.jpg");
			t.texmask = resman.prefetchTexture("data/monitor_mask.jpg");
			t.shaders = resman.prefetchShaderFiles(t.vertexShader, t.fragmentShader);		
			t.rasterfx.preloadResources();
		engine.popContext();
		t.background.preloadResources();
	},

	exit : function() {
		var t = this;
		engine.text2d.clearAllRectangles();
		engine.setCanvasZIndex("spritesCanvas", 3);
		engine.clearAllContexts();
		engine.removeCanvasClient(engine.canvases[webgl_3d_objects]);
		engine.pushContext(webgl_3d_objects, "RubberCube2 exit");
			t.rasterfx.exit();
		engine.popContext();
		t.background.exit();
	},

	enter : function() {
		var t = this;
		engine.addCanvasClient(engine.canvases[webgl_3d_objects]);
		t.tileStep = 0;
		engine.clearAllContexts();
		engine.setCanvasZIndex("spritesCanvas", 5);
		engine.pushContext(webgl_3d_objects, "RubberCube2 enter");
			t.rasterfx.enter();
		engine.popContext();
		t.background.enter();
		t.startScale = 3.5;
		engine.addCanvasClient(engine.frontCanvas);
		engine.text2d.addRectangle({x: 0.0, y: 0.0, w:1.0, h:1.0, a:0.6, alpha:0.6, done:false, fillStyle:"#FFFFFF", fadeOut:0.7});
		engine.text2d.closeAllIn(1.0);
	},
	
	getTransitionDuration : function() {
		return 5.0;
	},

	tick : function(time, _gl, remainingTime) {
		var t = this;
		t.elapsed += engine.deltaTime;
		var startLogoAnimAt = 3.0;
			
		t.background.tick(time,gl);
		
		engine.pushContext(webgl_3d_objects, "RubberCube2 tick");
			var gl = engine.gl;
			gl.clearColor(0.0,0.0,0.0,0.0);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
/*
			engine.enterRenderTexture(t.rendertex);
				var savedt = engine.deltaTime;
				engine.deltaTime *= 3.2;
				if (t.elapsed  < t.introDuration)
					engine.deltaTime = 0.0;
					
				t.rasterfx.tick(time,gl);
				engine.deltaTime = savedt;
			engine.exitRenderTexture();
	
*/
			engine.useProgram(t.program);
			engine.setTexture(t.tex, 0);
			engine.setTexture(t.texmask, 1);
//			engine.setTexture(t.rendertex, 2);
			engine.setTexture(t.rasterfx.cubeTexture, 2);
			
			gl.uniform3fv(t.program.lightDir, [0.0, 0.0, 1.0]);

			// Enable all of the vertex attribute arrays.
			gl.enableVertexAttribArray(0);
			gl.enableVertexAttribArray(1);
			gl.enableVertexAttribArray(2);

			// VertexArrays: Vertex, Normal und Texture
			gl.bindBuffer(gl.ARRAY_BUFFER, t.cube.vertexObject);
			gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, t.cube.texCoordObject);
			gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, t.cube.normalObject);
			gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

			//Indexarray
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, t.cube.indexObject);
			gl.enable(gl.SCISSOR_TEST);

			var slicesCount = gl.canvas.height / 4.0;
			for (var i = 0; i < slicesCount; i++) {

			t.perspectiveMatrix.makeIdentity();
			t.perspectiveMatrix.perspective(30, gl.canvas.width/gl.canvas.height, 1, 10000);
			t.perspectiveMatrix.lookat(0, 0, 7, 0, 0, 0, 0, 1, 0);
			
			// Make a model/view matrix.       
			t.mvMatrix.makeIdentity();
			//t.mvMatrix.rotate(20, 1,0,0);
			if (t.elapsed < t.introDuration) {
			//	t.startScale = Math.max(t.startScale-engine.deltaTime*0.01, 2.5);
				t.startScale = Math.max(t.startScale-engine.deltaTime*0.001, 0.00001);
			} else {
				var deltaIntro = (t.elapsed-t.introDuration) * 4.1;
				var deltaIntro2 = Math.max(0.0, deltaIntro * 0.15);
				t.mvMatrix.rotate(deltaIntro2*84.0*Math.sin(t.elapsed*0.018789) + i * 26.0 * deltaIntro2/slicesCount, 1,0,0);
				t.mvMatrix.rotate(deltaIntro2*81.1*Math.cos(t.elapsed*0.015) + i * 22.0 * deltaIntro2/slicesCount, 0,1,0);
				t.mvMatrix.rotate(Math.min(1.5,deltaIntro*0.001)*t.currentAngle + i * 12.0*deltaIntro/slicesCount, 0,0,1);
				t.startScale = Math.max(t.startScale * 0.99995, 0.00001);
			}
			
			t.mvMatrix.scale(t.startScale);
//			t.mvMatrix.translate(xy.x, xy.y);

			// Construct the normal matrix from the model-view matrix and pass it in
			t.normalMatrix.load(t.mvMatrix);
			t.normalMatrix.invert();
			t.normalMatrix.transpose();
			t.normalMatrix.setUniform(gl, t.program.normalMatrixLoc, false);

			// Construct the model-view * projection matrix and pass it in
			t.mvpMatrix.load(t.perspectiveMatrix);
			t.mvpMatrix.multiply(t.mvMatrix);
			t.mvpMatrix.setUniform(gl, t.program.modelViewProjMatrixLoc, false);
				
			gl.scissor(0, i*engine.canvas.height/slicesCount, engine.canvas.width, engine.canvas.height/slicesCount);
			gl.drawElements(gl.TRIANGLES, t.cube.numIndices, gl.UNSIGNED_BYTE, 0);

	//		t.currentAngle += Math.abs(Math.sin(time+Math.cos(i*0.1)))*0.045*50.0/slicesCount;
			t.currentAngle = (50.0*time + 10.0*Math.cos(i* 4.5 / slicesCount+time)) + Math.abs(Math.sin(time)) * 80.0 / slicesCount;
			if (t.currentAngle > 360)
				t.currentAngle -= 360;
				}
			
			gl.disable(gl.SCISSOR_TEST);
			
		engine.popContext();
	},

	createFX : function(_gl, hideText) {
		var t = this;
		engine.pushContext(webgl_3d_objects, "RubberCube2 createFX");
			var gl = engine.gl;
			t.hideText = hideText;
			// shader init
			t.program = engine.createProgramFromPrefetch(t.shaders);				
			gl.bindAttribLocation(t.program,0,"vPosition");
			gl.bindAttribLocation(t.program,1,"vNormal");
			gl.bindAttribLocation(t.program,2,"vTexCoord");
			t.program.lightDir = gl.getUniformLocation(t.program, "u_lightDir");
			t.program.normalMatrixLoc = gl.getUniformLocation(t.program, "u_normalMatrix");
			t.program.modelViewProjMatrixLoc = gl.getUniformLocation(t.program, "u_modelViewProjMatrix");
			
			// gl init
			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			gl.clearDepth(10000);
			gl.enable(gl.DEPTH_TEST);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.disable(gl.CULL_FACE);

			t.cube = makeBox(gl, "monitor");

			t.mvMatrix = new J3DIMatrix4();
			t.normalMatrix = new J3DIMatrix4();
			t.mvpMatrix = new J3DIMatrix4();
			t.perspectiveMatrix = new J3DIMatrix4();
			t.rendertex.createRenderTexture(gl, 512, 512, {wrap : engine.gl.REPEAT});
			t.rasterfx.createFX(gl, true);
		engine.popContext();		
		t.background.createFX(gl, true);
	}
}
