/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  Snake(isSubFX) {
	var t = this;
	engine.pushContext(webgl_2d_raymarch, "Snake Constructor");
	t.maxCentersCount = 16;
	var scale = 0.2 * t.maxCentersCount / 6.0;
	
	t.texturesPath = "data/";
	t.shadersPath = "shaders/";
	t.vertexShader = [t.shadersPath + "engine/vertex.vs"];
	t.fragmentShader = [t.shadersPath + "fx/snake.fs"];
	t.quad = new QuadMesh();
	t.centers = new Array();
	t.colors = new Array();
	t.movingSystem = 0.0;
	t.centers3d = new Array();
	t.projected = new Array();
	t.colorShift = 0;
	t.elapsed = 0;
	t.endBar1 = {x: 0.0, y: 0.5001, w: 1.0, h:0.0, alpha:1.0, fillStyle:"#000000"};
	t.endBar2 = {x: 0.0, y: 0.4999, w: 1.0, h:0.0, alpha:1.0, fillStyle:"#000000"};
	var count = 0;
	t.centersCount = t.maxCentersCount;
	// xz circle shape
	count = 0;
	for (var i = 0; i < t.maxCentersCount; i++) {
		t.centers3d[count] = scale * Math.cos(i*6.282/t.maxCentersCount);
		count++;
		t.centers3d[count] = 0.0;
		count++;
		t.centers3d[count] = scale * Math.sin(i*6.282/t.maxCentersCount);
		count++;
	}
	if (count != t.maxCentersCount*3) {
		alert("Snake constructor: count != t.maxCentersCount*3");
	}
	t.centersCount = t.maxCentersCount;
	t.lastCountChange = engine.time;
	t.centersCountIncr = 1;
	t.centersCountIncrSpd = 0.5;
	

	t.isSubFX = isSubFX;
	if (!t.isSubFX) {
		engine.pushContext(webgl_2d_frontSprites, "Snake Constructor 2");
			t.dbg = new DebugDraw(null, ["shaders/fx/MosaicBlendAlpha.fs"]);
		engine.popContext();
		t.transitionFX = new LeavingBars_Rot();
		t.transitionOn = false;
	}
	engine.popContext();
}

Snake.prototype = {

	snakeRotateZ : function(_coord, ix, angle) {
		var t = this;
		var ccos = Math.cos(angle);
		var ssin = Math.sin(angle);
		var px = _coord[ix*3];
		var py = _coord[ix*3+1];
		var pz = _coord[ix*3+2];
		t.projected[ix*3] =  px * ccos - py * ssin;
		t.projected[ix*3+1] = py * ccos + px * ssin;
		t.projected[ix*3+2] = pz;// + 0.25*Math.sin(engine.time+ix*0.4);
	},
	snakeRotateX : function(_coord, ix, angle) {
		var t = this;
		var ccos = Math.cos(angle);
		var ssin = Math.sin(angle);
		var px = _coord[ix*3];
		var py = _coord[ix*3+1];
		var pz = _coord[ix*3+2];
		t.projected[ix*3] =  px;
		t.projected[ix*3+1] = py * ccos - pz * ssin;
		t.projected[ix*3+2] = py * ssin + pz * ccos;
	},
	snakeRotateY : function(_coord, ix, angle) {
		var t = this;
		var ccos = Math.cos(angle);
		var ssin = Math.sin(angle);
		var px = _coord[ix*3];
		var py = _coord[ix*3+1];
		var pz = _coord[ix*3+2];
		t.projected[ix*3] =  px * ccos + pz * ssin;
		t.projected[ix*3+1] = py;
		t.projected[ix*3+2] = -px * ssin + pz * ccos;
	},

	preloadResources : function() {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "Snake preloadResources");
		t.shaders = resman.prefetchShaderFiles(t.vertexShader, t.fragmentShader);
		if (!t.isSubFX) {
			engine.pushContext(webgl_2d_frontSprites, "Snake preloadResources 2");
				t.dbgTex = resman.prefetchTexture("data/voroforever.png");
			engine.popContext();
		}
		engine.popContext();
	},
	
	getTransitionDuration : function() {
		return 7.0;
	},

	tick : function(_time, _gl, remainingTime) {
		var t = this;
		t.elapsed += engine.deltaTime * (1.5 + 2.0*beatHandler.beatBarFader);
		var time = t.elapsed;
		engine.pushContext(webgl_2d_raymarch, "Snake tick");
		var gl = engine.gl;
		var scale = 0.4 + 0.4*beatHandler.beatBarFader;
		var count = 0;

		t.elapsed += engine.deltaTime;
		
		if (beatHandler.lastGetDataIsBeat == 2)
			t.colorShift++;
		
		if (t.centersCount < t.maxCentersCount && Math.abs(time-t.lastCountChange) > t.centersCountIncrSpd) {
			t.centersCount += t.centersCountIncr;
			if (t.centersCount >= t.maxCentersCount) {
				t.centersCountIncr = -1.0;
				t.centersCount = t.maxCentersCount;
				centersCountIncrSpd = 1000000.0;
			} /*else if (t.centersCount < 1.0) {
				t.centersCountIncr = 1.0;
				t.centersCount += t.centersCountIncr;
				centersCountIncrSpd = 0.3;
			}*/
			t.lastCountChange = time;
		}
		
		// xz circle shape
		count = 0;
		for (var i = 0; i < t.centersCount; i++) {
			t.centers3d[count] -= (t.centers3d[count] - scale * Math.cos(i*6.282/t.centersCount)) * 0.002;
			count++;
			t.centers3d[count] = 0.0;
			count++;
			t.centers3d[count] -= (t.centers3d[count] - scale * Math.sin(i*6.282/t.centersCount)) * 0.002;
			count++;
		}
		
		t.movingSystem = Math.abs(Math.sin(time * 0.05));
		t.secondSystem = Math.abs(Math.cos(time * 0.1));
		{
			var animTime = 30.0 + time * 0.8;
			for (i = 0; i < t.centersCount; i++) {
				t.centers[i*3] = t.movingSystem * (0.5 + 0.25 * Math.cos(i*0.2+animTime*0.4));				// pos X
				t.centers[i*3+1] = t.movingSystem * (0.85 * Math.sin(i*0.2+animTime*0.2) + 0.35);				// pos Y
				t.centers[i*3+2] = t.movingSystem * (2.0*Math.abs(Math.cos(time*0.4 + i*4.4)) * (1.0 + Math.abs(Math.sin(i * 0.15 + animTime * 0.2))));		// weight
			}
		}
		{
			var animTime = 30.0 + time * 1.8;
			for (i = 0; i < t.centersCount; i++) {
				t.centers[i*3] += (1.0-t.movingSystem) * (0.5 + 0.45 * Math.cos(i*0.1+animTime*0.2) - 0.5);				// pos X
				t.centers[i*3+1] += (1.0-t.movingSystem) * (0.25 * Math.cos(i*0.1+animTime*0.4));				// pos Y
				t.centers[i*3+2] += (1.0-t.movingSystem) * (2.0*Math.abs(Math.cos(time*0.4 + i*4.2)) * (1.0 + Math.abs(Math.sin(i * 0.15 + animTime * 0.2))));		// weight
			}
		}

		
		//var minZ;
		//var maxZ;
		for (i = 0; i < t.centersCount; i++) {
			t.snakeRotateY(t.centers3d, i, time*0.4);
			t.snakeRotateX(t.projected, i, time*0.2);
			t.centers[i*3] = t.centers[i*3]*(1.0-t.secondSystem) + t.secondSystem*t.projected[i*3];
			t.centers[i*3+1] = t.centers[i*3+1]*(1.0-t.secondSystem) + t.secondSystem*t.projected[i*3+1];
			t.centers[i*3+2] = Math.max(1.0+t.projected[i*3+2]*6.0, 0.2);
		}

		for (i = 0; i < t.centersCount; i++) {
			t.centers[i*3+2] += 0.1*Math.abs(3.0*Math.sin(time+i*3.14159/16.0));
		}

		var constcol = 0.1;
		var varcol = 1.0-constcol;
		for (i = 0; i < t.centersCount; i++) {
			var ci = Math.floor((i+t.colorShift)%t.centersCount)*3;
			t.colors[ci] = constcol+varcol*Math.abs(Math.cos(i * 0.1 + time * 0.25));
			t.colors[ci+1] = constcol+varcol*Math.abs(Math.sin(i * 0.11 + time * 0.25));
			t.colors[ci+2] = constcol+varcol*Math.abs(Math.cos(i * 0.12 + time * 0.25));
		}
	
		engine.useProgram(t.program);
		gl.uniform3fv(t.program.centers, t.centers);
		gl.uniform3fv(t.program.colors, t.colors);
		t.quad.draw(gl, t.program);

		t.transitionFX.tick(time, remainingTime);

		// display Voro's face
		if (!t.isSubFX) {	
			var startLogoAnimAt = 10.0;
			engine.pushContext(webgl_2d_frontSprites, "Snake tick 2");
			var gl2 = engine.gl;
				if (t.elapsed >= startLogoAnimAt && t.dbg.tryBuild(gl2, t.dbgTex)) {
					if (!t.ColorFader)
						t.ColorFader = gl2.getUniformLocation(t.dbg.program, "ColorFader");					
					t.dbg.sprite.setScale(0.25, 0.25*engine.canvas.width/engine.canvas.height);
					t.dbg.sprite.setTransfo(-0.75, -0.75, 0.0);
					if (!t.tile_num)
						t.tile_num = gl2.getUniformLocation(t.dbg.program, "tilenum");
					if (!t.alphamult)
						t.alphamult = gl2.getUniformLocation(t.dbg.program, "alphamult");
					if (!t.addColor)
						t.addColor = gl2.getUniformLocation(t.dbg.program, "addColor");
					engine.useProgram(t.dbg.program);
					gl2.uniform1f(t.alphamult, 0.6);
					gl2.uniform1f(t.ColorFader, 0.0);
					gl2.uniform1f(t.addColor, 0.0);

					if (t.tileStep == 0) {
						t.invTilesNum += engine.deltaTime * 60.0;
						if (t.elapsed < startLogoAnimAt + 5.0)
							gl2.uniform1f(t.tile_num, t.invTilesNum);
						else {
							gl2.uniform1f(t.tile_num, 10000.0);
							t.tileStep = 1;
						}
					} 
					gl2.enable(gl2.BLEND);
					gl2.blendFunc(gl2.SRC_ALPHA, gl2.ONE_MINUS_SRC_ALPHA);
					t.dbg.draw(gl2, t.dbgTex);
					gl2.disable(gl2.BLEND);
				}
				// closer
				
				if (remainingTime < 0.5) {
					if (!t.transitionOn) {
						t.transitionOn = true;
						engine.addCanvasClient(engine.frontCanvas);
						engine.text2d.addRectangle(t.endBar1);
						engine.text2d.addRectangle(t.endBar2);
					} else {
						var dt = engine.deltaTime * 1.2;
						t.endBar1.y -= dt;
						t.endBar1.h += dt;
						t.endBar2.h += dt;
					}
				}
			engine.popContext();
		}
		engine.popContext(webgl_2d_raymarch);
	},


	enter : function() {
		var t = this;
		if (t.transitionFX)
			t.transitionFX.enter();
		t.tileStep = 0;
		t.invTilesNum = 5;
		t.elapsed = 0;
		engine.addCanvasClient(engine.canvases[webgl_2d_raymarch]);
		engine.addCanvasClient(engine.canvases[webgl_2d_frontSprites]);
	},

	exit : function() {
		var t = this;
		if (t.transitionFX)
			t.transitionFX.exit();
		if (!t.isSubFX) {
			engine.pushContext(webgl_2d_frontSprites, "Snake exit");
				engine.clearContext(0, 0, 0, 0); // alpha to 0 to guarantee transparent front canvas
			engine.popContext();
			engine.text2d.closeAllIn(0.5);
		}
		engine.removeCanvasClient(engine.canvases[webgl_2d_raymarch]);
		engine.removeCanvasClient(engine.canvases[webgl_2d_frontSprites]);
	},


	createFX : function(_gl, hideText) {
		var t = this;
		engine.pushContext(webgl_2d_raymarch, "Snake createFX");
		var gl = engine.gl;
		t.hideText = hideText;
		t.quad.create(gl, -1.0, -1.0, 2.0, 2.0);
		t.program = engine.createProgramFromPrefetch(t.shaders);
		t.program.centers = gl.getUniformLocation(t.program, "centers");
		t.program.colors = gl.getUniformLocation(t.program, "colors");
		if (t.transitionFX)
			t.transitionFX.createFX(gl, hideText);
		engine.popContext();
	}
}

