/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

// const not supported by minifiers
webgl_2d_raymarch = 0;
webgl_3d_objects = 1;
webgl_2d_frontSprites = 2;
LOD_level_1 = 0.75;
LOD_level_2 = 0.5;

/**
 * @constructor
 */
function Engine(defaultUpdate) {
	var t = this;
	t.time = 0.0;
	t.gl = null;
	t.canvas = null;
	t.currentProgram = null;
	t.deltaTime = 0.0;
	t.lastTime = 0.0;
	t.globalUpdate = null;
	t.defaultUpdate = defaultUpdate;
	t.contexts = new Array();
	t.canvases = new Array();
	t.text2d = new Text2d();
	t.savedContexts = [];
	t.timeAtMusicLoop = 0.0;
	t.framebuffer = [];
	t.renderbuffer = [];

	t.click = false;
	t.key = 0;
	
	// framerate regulation
	t.autoFrameRate = true;
	t.autoFrameRateTex = null;
	t.lowFrameRateCounter = 0.0;
	t.scaleGL = 1.0;
	t.timeWithGoodFrameRate = 0.0;
	t.forceLODTimer = 0.0;
	t.LODBeforeForce = null;
	t.lastLODRefWidth = window.innerWidth;
	t.lastLODRefHeight = window.innerHeight;
	if (t.autoFrameRate) {
		t.lodTex = [];
	}
	t.pauseBeat = false;
	t.paused = false;
	t.musicDelta = -0.09;
}

Engine.prototype = {
	breakpoint: function() {
		console.log("BP");
	},

	error: function(_label) {
		console.error(_label);
		alert(_label);
	},

	doPauseBeat : function(_pause) {
		this.pauseBeat = _pause;
	},

	forceLOD: function(_duration) {
		var t = this;
		if (t.forceLODTimer > 0.0)
			return; // important!
		t.forceLODTimer = _duration;
		t.LODBeforeForce = t.autoFrameRateTex;
	},
	
	addCanvasClient: function(cvs, from) {
		if (cvs.refCount == 0) {
			cvs.style.display="block";
			var _from = from || "undocumented";
			console.log("Showing canvas " + cvs.id + " from " + _from);
		}
		cvs.refCount++;
		//console.log("Canvas " + cvs.id + " has now " + cvs.refCount + " clients.");
	},
	

	removeCanvasClient: function(cvs, from) {
		var t = this;
		if (null == cvs)
			t.error("engine::removeCanvasClient BAD ARG");
		if (cvs.refCount == 1) {
			cvs.style.display="none";
			var _from = from || "undocumented";
			console.log("Hiding canvas " + cvs.id + " from " + _from);
		}
		cvs.refCount--;
		if (cvs.refCount < 0)
			t.error("Bad refCount for canvas " + cvs.id);
		//console.log("Canvas " + cvs.id + " has now " + cvs.refCount + " clients.");
	},


	getDebugDraw : function() {
		var t = this;
		if (!resman)
			return null;
		if (!t.debugDraw)
			t.debugDraw = new DebugDraw();
		return t.debugDraw;
	},
	
	forceTime : function(time) {
		var t = this;
		t.time = time;
		t.lastTime = time-t.deltaTime;
	},
	
	initProgram : function(program) {
		var t = this;
		var gl = t.gl;
		if (program.context != gl) {
			t.error("engine::initProgram --> Program belongs to context " + program.context.canvas.id + " while current context is " + gl.canvas.id);
		}
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) 
			console.log(gl.getProgramInfoLog(program));
		
		// Bind default common variables
		program.vertexData = gl.getAttribLocation(program, "vertexData");
		
		program.transfo2D = gl.getUniformLocation(program, "transfo2D");
		program.scale2D = gl.getUniformLocation(program, "scale2D");
		program.iResolution = gl.getUniformLocation(program, "iResolution");
		program.iGlobalTime = gl.getUniformLocation(program, "iGlobalTime");
		program.RaymarchMinDistDistortion = gl.getUniformLocation(program, "RaymarchMinDistDistortion");
		program.sampler0Uniform = gl.getUniformLocation(program, "uSampler0");
		program.sampler1Uniform = gl.getUniformLocation(program, "uSampler1");
		program.sampler2Uniform = gl.getUniformLocation(program, "uSampler2");
		program.beatBarFader = gl.getUniformLocation(program, "beatBarFader");
	},

	createProgramFromPrefetch : function(shaders) {
		var t = this;
		var gl = t.gl;
		
		if (!shaders)
			t.error("Engine.createProgramFromPrefetch : null shaders");

		if (!shaders[0].loaded)
			t.error("Engine.createProgramFromPrefetch : vertex shader not loaded");

		if (!shaders[1].loaded)
			t.error("Engine.createProgramFromPrefetch : fragment shader not loaded");
		
		// create openGL program
		var program = gl.createProgram();
		
		// load and link shaders
		gl.attachShader(program, shaders[0].shader);
		gl.attachShader(program, shaders[1].shader);
		program.context = gl;

		t.initProgram(program);
		return program;
	},
		
	/**
		Sets a program (set of shaders) as the current program
		@param program the program to use
	**/
	useProgram : function(program){
		var t = this;
		var gl = t.gl;

		if (program.context != gl) {
			t.error("engine::useProgram --> Program belongs to context " + program.context.canvas.id + " while current context is " + gl.canvas.id);
		}

		gl.useProgram(program); 
		
		// set default values for variables
		gl.uniform3fv(program.iResolution, [t.canvas.width, t.canvas.height, 1.0]);
		gl.uniform1f(program.iGlobalTime, t.time);
		gl.uniform1f(program.RaymarchMinDistDistortion, 0.0);
		if (beatHandler && !t.pauseBeat && program.beatBarFader) {
			gl.uniform1f(program.beatBarFader, beatHandler.beatBarFader);
		}
		t.currentProgram = program;
	},

	setCanvasZIndex : function (canvasName, z) {
		document.getElementById(canvasName).setAttribute('style', 'z-index: '+z+'; position:absolute; left:0px; top:0px;');
	},

	switchContext : function (index) {
		var t = this;
		if (t.contexts[index].isHidden)
			t.error("Switching to hidden context " + t.contexts[index].id);
		t.gl = t.contexts[index];
		t.canvas = t.canvases[index];
		if (t.canvas == null)
			t.error("Engine.switchContext: switching to null canvas index " + index);
		if (t.gl == null)
			t.error("Engine.switchContext: switching to null context index " + index);
		t.curContextIndex = index;
	},

	clearAllContexts: function() {
		var t = this;
		t.switchContext(webgl_2d_raymarch);
		t.clearContext(0, 0, 0, 0);
		t.gl.flush();
		t.switchContext(webgl_3d_objects);
		t.clearContext(0, 0, 0, 0);
		t.gl.flush();
		t.switchContext(webgl_2d_frontSprites);
		t.clearContext(0, 0, 0, 0);
		t.gl.flush();
		t.text2d.clearAll();
		var ctx = t.frontContext;
		ctx.translate(0.0, 0.0);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, t.frontCanvas.width, t.frontCanvas.height);
	},
	
	clearContext : function (_r, _g, _b, _a) {
		var t = this;	
		var r = _r || 0.0;
		var g = _g || 0.0;
		var b = _b || 0.0;
		var a = _a || 0.0;
		t.gl.viewport(0, 0, t.canvas.width, t.canvas.height);	
		t.gl.clearColor(r, g, b, a);
		t.gl.clear(t.gl.COLOR_BUFFER_BIT | t.gl.DEPTH_BUFFER_BIT);
	},

	pushContext : function (index, user) {
		var t = this;
		t.savedContexts.push({ctx:t.curContextIndex, usr:user});
		t.switchContext(index);
	},
	
	draw2dText: function (_entry) {
		var t = this;
//		t.frontContext.save();
		if (null != _entry.fillStyle)
			t.frontContext.fillStyle=_entry.fillStyle;
		if (null != _entry.font)
			t.frontContext.font=(_entry.font*window.innerWidth/1366.0).toString()+"px JSGL";
		if (null != _entry.alpha)
			t.frontContext.globalAlpha =_entry.alpha;
		t.frontContext.fillText(_entry.string, _entry.x * window.innerWidth, _entry.y * window.innerHeight, window.innerWidth);
//		t.frontContext.restore();

	},
	
	dumpContexts : function () {
		var t = this;
		var ret = " - DUMP CONTEXTS: -\n";
		for (var i = 0; i < t.savedContexts.length; i++) {
			ret += "index: " + t.savedContexts[i].ctx + ", user:" + t.savedContexts[i].usr + "\n";
		}
		console.log (ret);
		return ret;
	},
	
	popContext : function (index, user) {
		var t = this;
		if (t.savedContexts.length <= 0) {			
			t.error("Engine::popContext --> popping more contexts than pushed. Check dumped contexts in console:\n" + t.dumpContexts());
		}
		t.switchContext(t.savedContexts[t.savedContexts.length-1].ctx);
		t.savedContexts.pop();
	},

	VerifyContextStackDepth : function () {
		var t = this;
		if (t.savedContexts.length != 0) {
			t.error("engine::VerifyContextStackDepth failed! Check dumped contexts in console:" + t.dumpContexts());
		}
	},
	
	/**
		Initializes the engine
		@param fps		desired frames per second.
		@param music	if not null, DOM element that contains the music to synchronize with
	**/
	init : function(fps, music){
		var t = this;
		t.music = null;

		// trick to load font
		t.fontLoader = new Image;
		t.fontLoader.src = "data/3rdparty/amiga4ever.ttf";
		t.fontLoaded = false;
		t.fontLoader.onerror = function() { 
			t.fontLoaded = true; // need file to be loaded to realize it's not an image
			t.frontContext.font = "50px JSGL";
			document.getElementById("Text2TextureCanvas").getContext("2d").font = "50px JSGL";
		};
		
		document.getElementById('canvas_div').style.cursor = "none";
		t.canvases[webgl_2d_raymarch] = document.getElementById("canvas2d");
		t.canvases[webgl_3d_objects] = document.getElementById("canvas3d");
		t.canvases[webgl_2d_frontSprites] = document.getElementById("spritesCanvas");
		t.frontCanvas = document.getElementById("frontCanvas");
		t.frontContext = t.frontCanvas.getContext("2d");
		t.frontContext.fillStyle="#FFFFFF";
		t.frontCanvas.style.display = "none";
		t.frontCanvas.refCount = 0;
		for (var i = 0; i < t.canvases.length; i++) {
			if (null != t.canvases[i]) {
				t.contexts[i] = t.canvases[i].getContext("webgl");
				if (t.contexts[i] == null)
					t.contexts[i] = t.canvases[i].getContext("experimental-webgl");
				if (t.contexts[i] == null)
					t.error("Can't create webgl context for canvas #" + i);
				t.switchContext(i);
				t.gl.viewport(0, 0, t.canvas.width, t.canvas.height);	
				t.gl.clearColor(0, 0, 0, 1);
				t.gl.clear(t.gl.COLOR_BUFFER_BIT | t.gl.DEPTH_BUFFER_BIT);
				t.canvases[i].style.display = "none";
				t.canvases[i].refCount = 0;
			}
		}
		t.switchContext(0);

		if (t.autoFrameRate) {
			t.pushContext(webgl_2d_raymarch);			
				t.lodTex[0] = new Texture();
				t.lodTex[1] = new Texture();
				t.lodTex[0].createRenderTexture(t.gl, Math.floor(window.innerWidth * LOD_level_1), Math.floor(window.innerHeight * LOD_level_1), {wrap : engine.gl.CLAMP_TO_EDGE});
				t.lodTex[1].createRenderTexture(t.gl, Math.floor(window.innerWidth * LOD_level_2), Math.floor(window.innerHeight * LOD_level_2), {wrap : engine.gl.CLAMP_TO_EDGE});
			t.popContext(webgl_2d_raymarch);			
		}
			
		var aspect = t.canvas.width / t.canvas.height;
	
		window.requestAnimFrame = (function(){
		  return  window.requestAnimationFrame       ||
				  window.webkitRequestAnimationFrame ||
				  window.mozRequestAnimationFrame    ||
				  function( callback ){
					window.setTimeout(callback, 1000.0 / fps);
				  };
		})();
		
		(function animloop(){
			requestAnimFrame(animloop);
			var newtime = t.time;
			if (null == t.music)
				newtime += 1.0/fps;
			else {
				newtime = t.music.currentTime + t.musicDelta;
				if (newtime+t.timeAtMusicLoop < t.time-10.0)
					t.timeAtMusicLoop = t.time+0.0001;
			}
			if (newtime != t.time) {
			  t.time = newtime + t.timeAtMusicLoop;
			  t.render();
			  t.text2d.update();
			}
		})();
	},

	mouseClick : function() {
		var t = this;
		t.click = true;
		console.log("click at time:" + t.time);
	},
	
	keyDown : function(_key) {
		var t = this;
		t.key = _key;
		console.log("KEYPRESS: " + t.key + " at time:" + t.time);
		
		if (_key == 32) { // spacebar
			t.paused = !t.paused;
			if (t.paused) {
				console.log("PAUSED AT TIME: " + t.time);
				engine.music.pause();
			}
			else
				engine.music.play();			
		}
		else if (_key == 37) { // left
			if (t.paused) {
				engine.music.currentTime = Math.max(0.0, engine.music.currentTime - 1.0);
				console.log("PAUSED AT TIME: " + engine.music.currentTime);
			}
		}
		else if (_key == 39) { // right
			if (t.paused) {
				engine.music.currentTime += 1.0;
				console.log("PAUSED AT TIME: " + engine.music.currentTime);
			}
		}		
		else if (_key == 40) { // down
			if (t.paused) {
				engine.music.currentTime = Math.max(0.0, engine.music.currentTime - 1.0/30.0);
				console.log("PAUSED AT TIME: " + engine.music.currentTime);
			}
		}
		else if (_key == 38) { // up
			if (t.paused) {
				engine.music.currentTime += 1.0/30.0;
				console.log("PAUSED AT TIME: " + engine.music.currentTime);
			}
		}		
	},

	/**
		Updates demo effects and renders the scene
	**/
	render : function() {
		var t = this;
		var gl = t.gl;

		for (var i = 0; i < t.contexts.length; i++)		
		{
			t.pushContext(i);
			t.resizeCanvas();
			t.popContext();
		}

		t.deltaTime = t.time - t.lastTime;		
		t.lowFrameRateCounter = Math.max(t.lowFrameRateCounter, 0.0);
		if (t.autoFrameRate && t.deltaTime > 1.0/30.0)
			t.lowFrameRateCounter += t.deltaTime;
		else
			t.lowFrameRateCounter -= t.deltaTime;
		
		if (t.lowFrameRateCounter <= 0.0 && t.autoFrameRateTex != null) {
			t.timeWithGoodFrameRate += t.deltaTime;
			//console.log("timeWithGoodFrameRate: " + t.timeWithGoodFrameRate);
		}
		else
			t.timeWithGoodFrameRate = Math.max(0.0, t.timeWithGoodFrameRate-t.deltaTime);
			
		t.handleLOD();
			
		t.lastTime = t.time;

		if (null != t.globalUpdate)
			t.globalUpdate(t.time, t.deltaTime, t.click);
		else if (null != t.defaultUpdate)
			t.defaultUpdate(t.time, t.deltaTime, t.click);
		
		t.click = false;
		t.key = 0;
	},

	handleLOD : function(){
		var t = this;
//				t.autoFrameRateTex = t.lodTex[0];
		
		if (t.forceLODTimer > 0.0) {
			if (!t.autoFrameRateTex) {
				t.autoFrameRateTex = t.lodTex[0];
				console.log("FORCE SWITCHING TO LOD 1");
			}
			t.forceLODTimer -= t.deltaTime;
			if (t.forceLODTimer <= 0.0) {
				t.autoFrameRateTex = t.LODBeforeForce;
				t.lowFrameRateCounter = 0.0;
				t.timeWithGoodFrameRate = 0.0;
			}			
		} else if (t.lowFrameRateCounter > 2.0) {
			t.lowFrameRateCounter = 0;
			if (!t.autoFrameRateTex) {
				t.autoFrameRateTex = t.lodTex[0];
				console.log("SWITCHING TO LOD 1");
			}
			else if (t.autoFrameRateTex == t.lodTex[0]) {
				t.autoFrameRateTex = t.lodTex[1];
				console.log("SWITCHING TO LOD 2");
			}
		}
	/*	
		if (t.timeWithGoodFrameRate > 10.0) {
			if (t.autoFrameRateTex == t.lodTex[1]) {
				t.autoFrameRateTex = t.lodTex[0];
				console.log("SWITCHING BACK TO LOD 1");
			}
			else if (t.autoFrameRateTex == t.lodTex[0]) {
				t.autoFrameRateTex = null;
				console.log("SWITCHING BACK TO NO LOD");
			}
			t.timeWithGoodFrameRate = 0.0;
		}
		*/
		if (t.lastLODRefWidth == window.innerWidth && t.lastLODRefHeight == window.innerHeight)
			return;
	
		console.log("REALLOC LOD TEXTURES");
		t.pushContext(webgl_2d_raymarch);
			t.lastLODRefWidth = window.innerWidth;
			t.lastLODRefHeight = window.innerHeight;
			t.lodTex[0].context.deleteTexture(t.lodTex[0].texture);
			t.lodTex[1].context.deleteTexture(t.lodTex[1].texture);
			t.lodTex[0].createRenderTexture(t.gl, Math.floor(window.innerWidth * LOD_level_1), Math.floor(window.innerHeight * LOD_level_1), {wrap : engine.gl.CLAMP_TO_EDGE});
			t.lodTex[1].createRenderTexture(t.gl, Math.floor(window.innerWidth * LOD_level_2), Math.floor(window.innerHeight * LOD_level_2), {wrap : engine.gl.CLAMP_TO_EDGE});
			t.autoFrameRateTex = null;
			t.timeWithGoodFrameRate = 0.0;
			t.lowFrameRateCounter = 0;
		t.popContext(webgl_2d_raymarch);			
	},
	
	/**
		Internal, called by render
	**/
	resizeCanvas : function() {
		var t = this;
		var gl = t.gl;
		
		if (gl.canvas.width == window.innerWidth && gl.canvas.height == window.innerHeight) {
			return;
		}
		
		t.frontCanvas.width = window.innerWidth;
		t.frontCanvas.height = window.innerHeight;
		t.frontContext.font=(40*window.innerWidth/800).toString() +"px JSGL";
					
		gl.canvas.left = (window.innerWidth - window.innerWidth * t.scaleGL) * 1.0;
		gl.canvas.top = (window.innerHeight - window.innerHeight * t.scaleGL) * 1.0;
		gl.canvas.height = window.innerHeight * t.scaleGL;
		gl.canvas.width = window.innerWidth * t.scaleGL;
		gl.canvas.height = window.innerHeight * t.scaleGL;
		gl.viewport(gl.canvas.left, 0, t.canvas.width * t.scaleGL, t.canvas.height * t.scaleGL);
		if (null != t.currenProgram)
			gl.uniform3fv(t.currentProgram.iResolution, [t.canvas.width * t.scaleGL, t.canvas.height * t.scaleGL, 1.0]);
	},

	/**
		Assigns a texture to a channel
		@param texture	the texture
		@param channel	the channel index
	**/
	setTexture : function(texture, channel) {
		var t = this;
		var gl = t.gl;

		switch (channel) {
			case 0:
				gl.activeTexture(gl.TEXTURE0);
			break;
			case 1:
				gl.activeTexture(gl.TEXTURE1);
			break;
			case 2:
				gl.activeTexture(gl.TEXTURE2);
			break;
			default:
				gl.activeTexture(gl.TEXTURE0);
			break;
		}
			
		gl.bindTexture(gl.TEXTURE_2D, texture.texture);
		if (null != t.currentProgram) {
			if (t.currentProgram.context != gl)
				t.error("engine::setTexture --> Program belongs to context " + t.currentProgram.context.canvas.id + " while current context is " + gl.canvas.id);
			switch (channel) {
				case 0:
					gl.uniform1i(t.currentProgram.sampler0Uniform, channel);
				break;
				case 1:
					gl.uniform1i(t.currentProgram.sampler1Uniform, channel);
				break;
				case 2:
					gl.uniform1i(t.currentProgram.sampler2Uniform, channel);
				break;
				default:
					gl.uniform1i(t.currentProgram.sampler0Uniform, channel);
				break;
			}
		}
	},
	
	enterRenderTexture : function(texture, _clear) {
		var t = this;
		var gl = t.gl;

		t.savedViewport = gl.getParameter(gl.VIEWPORT);
		
		t.framebuffer[t.curContextIndex] = t.framebuffer[t.curContextIndex] || gl.createFramebuffer();
		t.renderbuffer[t.curContextIndex] = t.renderbuffer[t.curContextIndex] || gl.createRenderbuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, t.framebuffer[t.curContextIndex]);
		gl.bindRenderbuffer(gl.RENDERBUFFER, t.renderbuffer[t.curContextIndex]);
		if (texture.width != t.renderbuffer[t.curContextIndex].width || texture.height != t.renderbuffer[t.curContextIndex].height) {
		  t.renderbuffer[t.curContextIndex].width = texture.width;
		  t.renderbuffer[t.curContextIndex].height = texture.height;
		  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, texture.width, texture.height);
		}
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.texture, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, t.renderbuffer[t.curContextIndex]);
		gl.viewport(0, 0, texture.width, texture.height);
		if (_clear) {
			gl.clearColor(0, 0, 0, 1);
			gl.clear(t.gl.COLOR_BUFFER_BIT | t.gl.DEPTH_BUFFER_BIT);
		}
	},
	
	exitRenderTexture : function() {
		var t = this;
		var gl = t.gl;
		var v = t.savedViewport;
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.viewport(v[0], v[1], v[2], v[3]);
	}
}