/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
params:
{
	shadersPath		: "...",
	vertexShader	: ["..."],
	fragmentShader	: ["..."],
	initialRot		: {x:0.0, y:0.0, z:0.0},
	initialTrans	: {x:0.0, y:0.0, z:0.0},
	initialScale	: {x:1.0, y:1.0, z:1.0},
	lightDir		: {x:0.0, y:0.0, z:1.0}
}
*/

/**
 * @constructor
 */
function  Cube(params, type) {
	var t = this;
	engine.pushContext(webgl_3d_objects, "Cube constructor");	// switch to 3D canvas instead of raymarch canvas

	if (!type)
		type="cube";
		
	t.type = type;
	
	if (params && params.shadersPath)
		t.shadersPath = params.shadersPath;
	else
		t.shadersPath = "shaders/engine/";

	if (params && params.vertexShader)
		t.vertexShader = [t.shadersPath + params.vertexShader];
	else
		t.vertexShader = [t.shadersPath + "diffuseTexture3d.vs"];

	if (params && params.fragmentShader)
		t.fragmentShader = [t.shadersPath + params.fragmentShader];
	else
		t.fragmentShader = [t.shadersPath + "diffuseTexture3d.fs"];

	if (params && params.initialRot)
		t.rot = params.initialRot;
	else
		t.rot = {x:0.0, y:0.0, z:0.0};

	if (params && params.initialTrans)
		t.trans = params.initialTrans;
	else
		t.trans = {x:0.0, y:0.0, z:0.0};

	if (params && params.initialScale)
		t.scale = params.initialScale;
	else
		t.scale = {x:1.0, y:1.0, z:1.0};

	if (params && params.lightDir)
		t.lightDir = params.lightDir;
	else
		t.lightDir = {x:0.0, y:0.0, z:1.0};

	engine.popContext();
}

Cube.prototype = {
	rotate : function (x, y ,z) {
		var t = this;
		if (null != x)
			t.rot.x = ((x * 100) % 36000) / 100;
		if (null != y)
			t.rot.y = ((y * 100) % 36000) / 100;
		if (null != z)
			t.rot.z = ((z * 100) % 36000) / 100;
	},
	
	translate : function (x, y ,z) {
		var t = this;
		t.trans.x = x;
		t.trans.y = y;
		t.trans.z = z;
	},
	
	setScale : function (x, y ,z) {
		var t = this;
		t.scale.x = x;
		t.scale.y = y;
		t.scale.z = z;
	},
	
	lightDir : function (x, y ,z) {
		var t = this;
		t.lightDir.x = x;
		t.lightDir.y = y;
		t.lightDir.z = z;
	},

	preloadResources : function() {
		engine.pushContext(webgl_3d_objects, "Cube preloadResources");
		var t = this;
		t.shaders = resman.prefetchShaderFiles(t.vertexShader, t.fragmentShader);
		engine.popContext();
	},
	
	enter : function() {
		engine.addCanvasClient(engine.canvases[webgl_3d_objects]);
		engine.setCanvasZIndex("canvas3d", 3);
	},

	exit : function() {
		engine.setCanvasZIndex("canvas3d", 1);
		engine.removeCanvasClient(engine.canvases[webgl_3d_objects]);
	},

	tick : function(time, _gl, _texture) {
		engine.pushContext(webgl_3d_objects, "Cube tick");
		gl = engine.gl;
		var t = this;
		engine.useProgram(t.program);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		t.perspectiveMatrix.makeIdentity();
		t.perspectiveMatrix.perspective(30, gl.canvas.width/gl.canvas.height, 1, 10000);
		t.perspectiveMatrix.lookat(0, 0, 7, 0, 0, 0, 0, 1, 0);
		
		// Make a model/view matrix.       
        t.mvMatrix.makeIdentity();
        t.mvMatrix.rotate(t.rot.x, 1,0,0);
        t.mvMatrix.rotate(t.rot.y, 0,1,0);
        t.mvMatrix.rotate(t.rot.z, 0,0,1);
        t.mvMatrix.scale(t.scale.x, t.scale.y, t.scale.z);
        t.mvMatrix.translate(t.trans.x, t.trans.y, t.trans.z);

        // Construct the normal matrix from the model-view matrix and pass it in
        t.normalMatrix.load(t.mvMatrix);
        t.normalMatrix.invert();
        t.normalMatrix.transpose();
        t.normalMatrix.setUniform(gl, t.program.normalMatrixLoc, false);

        // Construct the model-view * projection matrix and pass it in
        t.mvpMatrix.load(t.perspectiveMatrix);
        t.mvpMatrix.multiply(t.mvMatrix);
        t.mvpMatrix.setUniform(gl, t.program.modelViewProjMatrixLoc, false);
            
		gl.uniform3fv(t.program.lightDir, [t.lightDir.x, t.lightDir.y, t.lightDir.z]);
		if (_texture)
			engine.setTexture(_texture, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, t.cube.vertexObject);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, t.cube.texCoordObject);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, t.cube.normalObject);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

        //Indexarray
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, t.cube.indexObject);		
        gl.drawElements(gl.TRIANGLES, t.cube.numIndices, gl.UNSIGNED_BYTE, 0);
				
		gl.flush();
		engine.popContext();
	},

	createFX : function(_gl) {
		engine.pushContext(webgl_3d_objects, "Cube createFX");
		gl = engine.gl;
		var t = this;
		
		// shader init
		t.program = engine.createProgramFromPrefetch(t.shaders);
	
		t.program.lightDir = gl.getUniformLocation(t.program, "u_lightDir");
        t.program.normalMatrixLoc = gl.getUniformLocation(t.program, "u_normalMatrix");
        t.program.modelViewProjMatrixLoc = gl.getUniformLocation(t.program, "u_modelViewProjMatrix");
		
		// gl init
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clearDepth(10000);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
//		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.disable(gl.CULL_FACE);

		if (null == t.cube) {
			t.cube = makeBox(gl, t.type);
		}

        t.mvMatrix = new J3DIMatrix4();
        t.normalMatrix = new J3DIMatrix4();
        t.mvpMatrix = new J3DIMatrix4();
		t.perspectiveMatrix = new J3DIMatrix4();

        // Enable all of the vertex attribute arrays.
		gl.bindAttribLocation(t.program,0,"vPosition");
		gl.bindAttribLocation(t.program,1,"vNormal");
		gl.bindAttribLocation(t.program,2,"vTexCoord");
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);

		engine.popContext();
	}
}
