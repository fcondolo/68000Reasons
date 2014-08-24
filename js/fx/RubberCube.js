/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  RubberCube() {
	var t = this; 
	engine.pushContext(webgl_3d_objects, "RubberCube Constructor");
		t.shadersPath = "shaders/";
		t.vertexShader = [t.shadersPath + "engine/diffuseTexture3d.vs"];
		t.fragmentShader = [t.shadersPath + "fx/rubbercube.fs"];
		t.currentAngle = 0.0;
		t.curtexIndex = 0;
		t.sessions = 0;
		t.elapsed = 0;
	engine.popContext();
	engine.pushContext(webgl_2d_frontSprites, "RubberCube Constructor 2");
		t.dbg = new DebugDraw(null, ["shaders/fx/MosaicAlpha.fs"]);
	engine.popContext();
	t.tun = new LinesTunnel();
}

RubberCube.prototype = {
	preloadResources : function() {
		var t = this;
		engine.pushContext(webgl_3d_objects, "RubberCube preloadResources");
			t.tex = resman.prefetchTexture("data/xmas.jpg");
			t.shaders = resman.prefetchShaderFiles(t.vertexShader, t.fragmentShader);		
		engine.popContext();
	},

	exit : function() {
		var t = this;
		t.tun.exit();
		if (t.text)
			t.text.fadeOut = 0.5;
		engine.text2d.clearAllRectangles();
		engine.setCanvasZIndex("spritesCanvas", 3);
		engine.clearAllContexts();
		engine.removeCanvasClient(engine.canvases[webgl_3d_objects], "RubberCube exit");
	},

	enter : function() {
		var t = this;
		if (!t.hideText) {
			t.text = {x:0.05, y:0.95, string:"Rubber Cube", fillStyle:"#FFFFFF", alpha: 0.0, fadeIn: 1.0};
			engine.text2d.addEntry(t.text);
		}
		engine.addCanvasClient(engine.canvases[webgl_3d_objects], "RubberCube enter");
		t.tileStep = 0;
		engine.clearAllContexts();
		engine.setCanvasZIndex("spritesCanvas", 5);
		t.tun.enter();
	},
	
	getTransitionDuration : function() {
		return 5.0;
	},

	tick : function(time, _gl, remainingTime) {
		var t = this;
		t.elapsed += engine.deltaTime;
		var startLogoAnimAt = 3.0;
		
		var xy = t.tun.tick(time, _gl, remainingTime);
		
		engine.pushContext(webgl_3d_objects, "RubberCube tick");
			var gl = engine.gl;
			gl.clearColor(0.0,0.05,0.1,0.0);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			engine.useProgram(t.program);
			engine.setTexture(t.tex, 0);
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
			t.mvMatrix.rotate(20, 1,0,0);
			t.mvMatrix.rotate(t.currentAngle + i * 80.0/slicesCount, 0,1,0);
			t.mvMatrix.rotate(1.5*t.currentAngle + i * 80.0/slicesCount, 0,0,1);
			t.mvMatrix.scale(0.5 + Math.abs(Math.cos(t.elapsed*0.5)*0.7));
			t.mvMatrix.translate(xy.x, xy.y);

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
		engine.pushContext(webgl_3d_objects, "RubberCube createFX");
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

			t.cube = makeBox(gl, "cube");

			t.mvMatrix = new J3DIMatrix4();
			t.normalMatrix = new J3DIMatrix4();
			t.mvpMatrix = new J3DIMatrix4();
			t.perspectiveMatrix = new J3DIMatrix4();
		engine.popContext();
	}
}

