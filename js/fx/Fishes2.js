/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  Fishes2() {
	var t = this;
	
	engine.pushContext(webgl_2d_raymarch, "Fishes2 Constructor");
	t.texturesPath = "data/";
	t.shadersPath = "shaders/";
	t.vertexShader = [t.shadersPath + "engine/vertex.vs"];
	t.fragmentShader = [t.shadersPath + "fx/Fishes2.fs"];
	t.quad = new QuadMesh();
	t.elapsed = 0;
	t.centersCount = 4;
	t.centers = [];
	t.groundcenters = [];
	t.radspd = [];
	t.spdxy = [];
	t.baseSpd = 0.0022;
	for (var i = 0; i < t.centersCount * 2; i++) {
		t.centers.push(0.5);
		t.groundcenters.push(0.5);
		t.spdxy.push(t.baseSpd * Math.cos(i));
	}
	for (var i = 0; i < t.centersCount; i++) {
		t.radspd.push(0.1);
	}

	engine.popContext();
}

Fishes2.prototype = {
	
	preloadResources : function() {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "Fishes2 preloadResources");
			t.shaders = resman.prefetchShaderFiles(t.vertexShader, t.fragmentShader);
		engine.popContext();
		t.texture = resman.prefetchTexture(t.texturesPath + "made_blessyou_1200.jpg", false, true);
	},

	enter : function(_lastTickFx) {
		var t = this;
		engine.addCanvasClient(engine.canvases[webgl_2d_raymarch], "Fishes2 enter");
		engine.addCanvasClient(engine.frontCanvas, "Fishes2 enter");
		engine.pushContext(webgl_2d_raymarch, "Fishes2 enter");
			t.elapsed = 0;
		engine.popContext();
		engine.text2d.clearAll();
		engine.text2d.hijacked = true;
		t.cosAmount = 0.0;

		engine.addCanvasClient(engine.frontCanvas);
		engine.text2d.addRectangle({x: 0.0, y: 0.0, w:1.0, h:1.0, a:0.6, alpha:0.6, done:false, fillStyle:"#FFFFFF", fadeOut:0.7});
		engine.text2d.closeAllIn(1.0);
		t.lastFlashTimer = 0.3;
	},
	
	exit : function() {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "Fishes2 exit");
		engine.removeCanvasClient(engine.frontCanvas, "Fishes2 exit");
		engine.removeCanvasClient(engine.canvases[webgl_2d_raymarch], "Fishes2 exit");
		engine.text2d.hijacked = false;
		engine.popContext();
	},

	tick : function(_time, _gl, remainingTime) {
		var t = this;

		if (remainingTime < 15.0)
			t.cosAmount = 1.0-(remainingTime / 20.0);
			
		for (var i = 0; i < t.radspd.length; i++) {
			t.radspd[i] += engine.deltaTime * 2.0;
		}

		
		for (var i = 0; i < t.centers.length; i++) {
			if (t.elapsed < i) {			
				break;
			}
			t.centers[i] += t.spdxy[i] * PerlinNoise.noise(t.elapsed*1.6, i, Math.sin(t.elapsed)*1.6);
			i++;
			t.centers[i] += t.spdxy[i] * PerlinNoise.noise(t.elapsed*1.6, i, Math.sin(t.elapsed)*1.6);
			if (t.centers[i-1] < -0.25 || t.centers[i-1] > 1.25 || t.centers[i] < -0.25 || t.centers[i] > 1.25) {
				t.centers[i-1] = 0.5;
				t.centers[i] = 0.5;
				//t.radspd[i] = 0.0;
				t.spdxy[i-1] = Math.cos(t.elapsed+i*3.14159*2.0/t.centers.length);
				t.spdxy[i] = Math.sin(t.elapsed+i*3.14159*2.0/t.centers.length);
				var len = Math.sqrt(t.spdxy[i-1]*t.spdxy[i-1]+t.spdxy[i]*t.spdxy[i]);
				t.spdxy[i-1] *= t.baseSpd * 0.5 * len;
				t.spdxy[i] *= t.baseSpd * len;
			}
		}

		for (var i = 0; i < t.centersCount; i++) {
			if (t.elapsed >= i * 2.5) {
				t.groundcenters[i*2] = t.centers[i*2];
				t.groundcenters[i*2+1] = t.centers[i*2+1];
			} else
			{
				t.groundcenters[i*2] = 1000.0;
			}
		}

		
		engine.pushContext(webgl_2d_raymarch, "Fishes2 tick");
			var gl = engine.gl;
			t.elapsed += engine.deltaTime;
			engine.useProgram(t.program);
			engine.setTexture(t.texture, 0);
			gl.uniform1f(t.program.iGlobalTime, t.elapsed);
			gl.uniform2fv(t.program.centers, t.groundcenters);
			gl.uniform1f(t.program.iGlobalTime, t.elapsed);
			gl.uniform1f(t.program.cosAmount, t.cosAmount);
		/*	if ( engine.time < 240.0)
				gl.uniform1f(t.program.amb, 1.0);
			else
				gl.uniform1f(t.program.amb, Math.max(0.0, 1.0-(engine.time - 239.0)*0.6));
				*/
			if ( engine.time < 230.0)
				gl.uniform1f(t.program.amb, 1.0);
			else {
				if (engine.time >= 240 && t.lastFlashTimer > 0.0) {
					t.lastFlashTimer -= engine.deltaTime;
					gl.uniform1f(t.program.amb, 1.0);
				 }
				else
					gl.uniform1f(t.program.amb, Math.max(0.0, (241.0-engine.time)/(241.0-230.0)));
			}
				
			t.quad.draw(gl, t.program);		
		engine.popContext();

		var cvs = engine.frontCanvas;
		var w = cvs.width;
		var h = cvs.height;
		var ctx = engine.frontContext;
		ctx.globalAlpha = 0.3;
		ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
//		ctx.clearRect(0,0,w,h);
		ctx.drawImage(engine.canvases[webgl_2d_raymarch], 0, 0);

	},

	createFX : function(_gl, hideText) {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "Fishes2 createFX");
			var gl = engine.gl;
			t.quad.create(gl, -1.0, -1.0, 2.0 , 2.0);
			t.program = engine.createProgramFromPrefetch(t.shaders);
			t.program.iGlobalTime = gl.getUniformLocation(t.program, "iGlobalTime");
			t.program.centers = gl.getUniformLocation(t.program, "centers");
			t.program.cosAmount = gl.getUniformLocation(t.program, "cosAmount");
			t.program.amb = gl.getUniformLocation(t.program, "amb");			
		engine.popContext();
	}
}
