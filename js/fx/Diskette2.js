/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  Diskette2() {
	var t = this;
	engine.pushContext(webgl_3d_objects, "Diskette2 Constructor");
		t.shadersPath = "shaders/";
		t.vertexShader = [t.shadersPath + "engine/diffuseTexture3d.vs"];
		t.fragmentShader = [t.shadersPath + "engine/diffuseTexture3d.fs"];
		t.currentAngle = 0.0;
		t.elapsed = 0;
	engine.popContext();
/*	t.writer = [];
	t.writer[0] = new Writer2();
	t.writer[0].setText([
	{x:0.1, y:0.2,
	fontSize:30, 
	fromX:0.5, fromY:0.5,
	flyDuration:1.0, spawnEachFrame: 32,
	text:"Escaping the sofa for 68000 reasons "}
	]);*/
}

Diskette2.prototype = {
	preloadResources : function() {
		var t = this;
		engine.pushContext(webgl_3d_objects, "Diskette2 preloadResources");
			t.tex = resman.prefetchTexture("data/3rdparty/manual.png");
			t.shaders = resman.prefetchShaderFiles(t.vertexShader, t.fragmentShader);		
		engine.popContext();
	},

	exit : function() {
		var t = this;
		engine.text2d.hijacked = false;
		engine.removeCanvasClient(engine.frontCanvas, "Diskette2 enter");
		engine.removeCanvasClient(engine.canvases[webgl_3d_objects], "Diskette2 exit");
		engine.clearAllContexts();
		//t.writer[0].exit();
		//engine.setCanvasZIndex("canvas3d", 1);
	},

	enter : function() {
		var t = this;
		engine.addCanvasClient(engine.canvases[webgl_3d_objects], "Diskette2 enter");
		engine.addCanvasClient(engine.frontCanvas, "Diskette2 enter");
		engine.clearAllContexts();
		engine.text2d.hijacked = true;
		t.sliceDeformThresold = 0.0;
/*
		t.oDiv = document.getElementById( "endScroll" );
		var style = '<p style="color:white; font-family:JSGL; text-align: left; font-size:';
		style += (Math.floor(50.0*window.innerWidth/1366.0)).toString()+'px; ">';
		t.oDiv.innerHTML =  style + '<button onClick="screenfull.toggle();">Fullscreen me!</button>';
		*/
		//t.writer[0].enter(true);
		//engine.setCanvasZIndex("canvas3d", 6);
	},
	

	tick : function(time, _gl, remainingTime) {
		var t = this;
		t.elapsed += engine.deltaTime;
		t.sliceDeformThresold = Math.min(t.sliceDeformThresold + engine.deltaTime * 0.1, 1.0);
		engine.pushContext(webgl_3d_objects, "Diskette2 tick");
			var gl = engine.gl;
			gl.clearColor(0.0,0.0,0.0,1.0);
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
			//t.mvMatrix.rotate(20, 1,0,0);
			t.mvMatrix.rotate(45.0+Math.abs(80.0*Math.sin(engine.time*0.38789)) + t.sliceDeformThresold* i * 5.0/slicesCount, 1,0,0);
			t.mvMatrix.rotate(4.3*Math.abs(110.0*Math.cos(engine.time*0.25)) + ((t.sliceDeformThresold * i + engine.time) * 155.0 )/slicesCount, 0,1,0);
			t.mvMatrix.rotate(0.5*t.currentAngle + t.sliceDeformThresold * i * 5.0/slicesCount, 0,0,1);
			t.mvMatrix.scale(1.0 + Math.abs(Math.cos(t.elapsed*0.5)*0.7));
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
		
		// progress bar
		var cvs = engine.frontCanvas;
		var w = cvs.width;
		var h = cvs.height;
		var ctx = engine.frontContext;
		ctx.globalAlpha = 1.0;
		ctx.fillStyle = "#000";
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = "#888888";
		ctx.strokeStyle = "#FFFFFF";
		var offsetx = 0.003;
		var offsety = offsetx*w/h;
		var width = 0.5;
		var height = 0.05;
		ctx.strokeRect(w*(0.5-width*0.5-offsetx), h*(0.9-offsety), w*(width+offsetx*2.0), h*(height+offsety*2.0));
		ctx.fillRect(w*(0.5-width*0.5), h*0.9, w*resman.loadingRatio*width, h*height);
		//t.writer[0].tick(time, true);
	},

	createFX : function(_gl, hideText) {
		var t = this;
		engine.pushContext(webgl_3d_objects, "Diskette2 createFX");
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

			t.cube = makeBox(gl, "diskette");

			t.mvMatrix = new J3DIMatrix4();
			t.normalMatrix = new J3DIMatrix4();
			t.mvpMatrix = new J3DIMatrix4();
			t.perspectiveMatrix = new J3DIMatrix4();
		engine.popContext();
		//t.writer[0].createFX(_gl, hideText);
	}
}
