/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  Checker() {
	var t = this;
	t.checkerCount = 4.0;
	t.minScale = 0.0001;
	t.rotation = 0.0;
	t.xofs = 0.0;
	t.yofs = 0.0;
	t.xofsSpd = 0.0;
	t.yofsSpd = 0.0;
	t.xdir = 1.0;
	t.ydir = 1.0;
	t.rythmBar = 0;
	t.randTable = [];
	t.colTable = [];
	for (var i = 0; i < 256; i++) {
		t.randTable[i] = Math.floor((Math.random() + 1.0) * 2.0);
		var r = (Math.floor(255.0 * Math.random())).toString(16);
		var g = (Math.floor(255.0 * Math.random())).toString(16);
		var b = (Math.floor(255.0 * Math.random())).toString(16);
		t.colTable[i] = "#" + r + g + b;
	}
	t.randIndex = 0;
	}

Checker.prototype = {
	preloadResources : function() {
		var t = this;
		t.credits = [
			resman.prefetchTexture("data/code_soundy.png", true),
			resman.prefetchTexture("data/music_dascon.png", true),
			resman.prefetchTexture("data/gfx_made.png", true)
		];
	},
	
	tick : function(_time, _gl, remainingTime) {
		var t = this;

		
		t.elapsed += engine.deltaTime;

		if (t.elapsed < 0.3)
			t.enterZoom += engine.deltaTime * 2.25;
		else
			t.enterZoom += (1.0-t.enterZoom) * engine.deltaTime;
	//	else if (remainingTime < 0.5)
		//	t.enterZoom += (30.0-t.enterZoom) * engine.deltaTime * 0.15;

		var beat = beatHandler.beatBarFader * 0.5;
		var cvs = engine.frontCanvas;
		var w = cvs.width;
		var h = cvs.height;
		var centerX = w * 0.5;
		var centerY = h * 0.5;
		var maxDim = Math.max(w, h) * (3.0 + beat * 0.75);
		var ctx = engine.frontContext;
		var exitZoom = 1.0;
		if (remainingTime <= 0.5)
			exitZoom *= 2.0-2.0*remainingTime;
		
		// try to avoid white at the center
		var redness = ctx.getImageData(centerX-2, centerY-2, 1, 1).data[0];
		redness += ctx.getImageData(centerX+2, centerY+2, 1, 1).data[0];
		
		
		// cls
		ctx.globalAlpha = 1.0;
		ctx.fillStyle = "#000000";
		if (t.explosionStarted > 0.0) {
			ctx.translate(0.0, 0.0);
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, engine.frontCanvas.width, engine.frontCanvas.height);
		} else {
			ctx.fillRect(0, 0, w, h);
		}

		ctx.fillStyle = "#DDDDDD";

		if (remainingTime > 3.0) {
			var deltaRot = -0.5 + PerlinNoise.noise(t.elapsed*1.6, t.rotation, Math.sin(t.elapsed)*1.6);
			deltaRot %= 0.02;
			t.rotation += deltaRot;
		} else
			t.rotation += 0.04;

		
		if (t.xofs > w *0.35)
			t.xdir = -1.0;
		else if (t.xofs < -w *0.35)
			t.xdir = 1.0;
		if (t.yofs > h *0.35)
			t.ydir = -1.0;
		else if (t.yofs < -h *0.35)
			t.ydir = 1.0;
		if (redness > 400) {
			t.xofsSpd += 0.003*w*t.xdir;
			t.yofsSpd += 0.003*h*t.ydir;
		}

		t.xofs += t.xofsSpd;
		t.xofsSpd *= 0.8;
		t.yofs += t.yofsSpd;
		t.yofsSpd *= 0.8;
		t.xofs += w*beat*0.075*Math.abs(Math.cos(t.elapsed*0.1))*t.xdir;
		t.yofs += h*beat*0.075*Math.abs(Math.sin(t.elapsed*0.12))*t.ydir;
		var saveStyle = ctx.fillStyle;
		var saveZoom = t.enterZoom;
		var savexofs = t.xofs;
		for (var ci = 0; ci < t.checkerCount; ci++) {		
			ctx.save();
			ctx.translate(centerX, centerY);			
			ctx.rotate(t.rotation);
			var sc = 0.001+Math.exp(t.z[ci])*0.15;
			ctx.scale(sc,sc);
			ctx.translate(-centerX, -centerY);
			if (sc > 2.0)
				ctx.globalAlpha = Math.max(1.0-sc*0.25, 0.0);
			else
				ctx.globalAlpha = Math.min(0.8,Math.max(sc, 0.0));
				
			var firstindex = t.rythmBar * t.xcount;
			var lastindex = firstindex + t.xcount;
			if (remainingTime <= 1.0)
				firstindex = 9999;
			var trigger = t.randTable[t.randIndex];
			if (remainingTime <= 1.0 || t.elapsed < 1.0)
				trigger = 999999;
			for (var i = 0; i < t.count; i++) {
				var s = t.squares[i];
				if (i == trigger){ //(i >= firstindex && i < lastindex) {				
					ctx.fillStyle = t.colTable[i & 255];
					//t.enterZoom = saveZoom *(1.0+0.05*Math.cos(t.elapsed * 16.0 + i));
				//	t.xofs += 0.4 * maxDim * Math.cos(t.elapsed);
				}

				ctx.fillRect(t.xofs + s.x * maxDim * t.enterZoom, t.yofs + s.y * maxDim * t.enterZoom, s.w * maxDim * exitZoom, s.h * maxDim *  exitZoom);
				if (i == trigger) {//if (i >= firstindex && i < lastindex) {
					trigger = (trigger + t.randTable[(t.randIndex + i) & 255]) % t.count;
					ctx.fillStyle = saveStyle;
//					t.enterZoom = saveZoom;
					t.xofs = savexofs;
				}
			}
			ctx.restore();
			t.z[ci] = t.z[ci]+0.047;
			if (t.z[ci] > 4.0 && remainingTime > 0.5)
				t.z[ci] = 0.0;
		}

		if (beatHandler.lastGetDataIsBeat != 0) {
			t.rythmBar = (t.rythmBar + 1) % t.ycount;
			t.randIndex = Math.floor(Math.random() * 255.0);
			if (beatHandler.lastGetDataIsBeat == 2)
				t.beatCount++;
		}
		
		if (t.explosionStarted > 0.0) {
			for (var i = 0; i < t.count; i++) {
				var s = t.squares[i];
				s.x += t.spd[i].x;
				s.y += t.spd[i].y;
				t.spd[i].y += 0.0015; // gravity;
				t.spd[i].x *= 0.99;
			}
			t.explosionStarted += engine.deltaTime;
			
			if (t.explosionStarted > 5.0) {
				t.exit();
				return true;
			}
		}

		if (t.beatCount > 2 ) {
			if (t.beatCount >= 7 && t.imgIndex !=1 && t.beatCount < 11 ) {
				t.imgIndex=1;
				t.imgX = 0.0;
			}
			if (t.beatCount >= 11 && t.imgIndex != 2) {
				t.imgIndex=2;
				t.imgX = 0.0;
			}
			var noiseX = 0.0;
			var noiseY = 0.0;
			var nzoomX = 0.0;
			var nzoomY = 0.0;
			if (Math.abs(t.imgX- 0.05) < 0.000001) {
				noiseX = 0.004 * PerlinNoise.noise(t.elapsed*4.667, t.rotation, Math.sin(t.elapsed)*12.645);
				noiseY = 0.01 * PerlinNoise.noise(t.elapsed*9.656, t.rotation*0.984365, Math.cos(t.elapsed*1.9387)*9.7);
			}
			if (beatHandler.beatBarFader > 0.0) {
				noiseX = 0.0;
				noiseY = 0.0;
				nzoomX = 0.025 * beatHandler.beatBarFader;
				nzoomY = 0.025 * beatHandler.beatBarFader;
				if (beatHandler.beatBarFader > 0.9 && !t.logoZoomInProgress) {
					t.logoZoomInProgress  = true;
					t.logoZoomValue = 0.0;
				}
			}
			ctx.globalAlpha = 1.0;//Math.min(1.0, 0.3 + beatHandler.beatBarFader * 0.7);
			ctx.drawImage(t.credits[t.imgIndex].texture.image, 0.0, 0.0, 512.0, 512.0, (t.imgX + noiseX - nzoomX*0.5) * w, (0.05 + noiseY - nzoomY*0.5) * h, w * (0.3 + nzoomX), h*(0.3 + nzoomY));
			if (t.logoZoomInProgress) {
				ctx.globalAlpha = Math.max(0.0, 1.0 - t.logoZoomValue * 1.5);
				t.logoZoomValue = Math.min(1.0, t.logoZoomValue + engine.deltaTime * 2.0);
				noiseX = 0.0;
				noiseY = 0.0;
				nzoomX = t.logoZoomValue * 0.25;
				nzoomY = t.logoZoomValue * 0.25;
				ctx.drawImage(t.credits[t.imgIndex].texture.image, 0.0, 0.0, 512.0, 512.0, (t.imgX + noiseX - nzoomX*0.5) * w, (0.05 + noiseY - nzoomY*0.5) * h, w * (0.3 + nzoomX), h*(0.3 + nzoomY));
				if (t.logoZoomValue >= 0.99999)
					t.logoZoomInProgress = false;
			}
			t.imgX = Math.min(t.imgX + engine.deltaTime * 0.25, 0.05);
		}
	
		return false;
	},

	enter : function() {
		var t = this;
		t.logoZoomInProgress  = false;
		t.logoZoomValue  = 0.0;
		t.imgIndex = 0;
		t.imgX = 0.0;
		t.enterZoom = 0.01;
		t.explosionStarted = 0.0;
		engine.addCanvasClient(engine.frontCanvas);
		engine.text2d.hijacked = true;
		t.elapsed = 0;
		t.exited = null;
		t.squares = new Array();
		t.xcount = Math.floor(10.0);
		t.ycount = Math.floor(10.0*engine.frontCanvas.height/engine.frontCanvas.width);
		t.xcount = Math.max(t.xcount, t.ycount);
		t.ycount = t.xcount; // make square for rotations
		t.barWidth = 1.0/t.xcount;
		t.barHeight = 1.0/t.ycount;
		t.barWidth = Math.max(t.barWidth, t.barHeight);
		t.barHeight = t.barWidth; // make square for rotations
		t.count = 0;
		t.beatCount = 0;
		var i = 0;
		for (var yy = -t.ycount*0.5; yy < t.ycount*1.5; yy++) {
			for (var xx = -t.xcount*0.5; xx < t.xcount*1.5; xx++, i++) {
				if (i & 1 == 1) {
					t.squares.push({x: xx * t.barWidth + t.barWidth * 0.0, y: yy * t.barHeight + t.barHeight * 0.0, w: t.barWidth, h: t.barHeight, a:1.0, spd:0, done:false, fillStyle:"#FFFFFF"});
					t.count++;
				}
			}
			i++;
		}
		t.z = [];
		for (var ip = 0; ip < t.checkerCount; ip++) {
			t.z[ip]=ip/t.checkerCount*6.1;
		}
		
		// end xplosion
		var max_x_spread = 0.01;
		var max_y_spread = -0.025;
		t.spd = [];
		for (var ispd = 0; ispd < t.squares.length; ispd++)
			t.spd.push({x: Math.random() * max_x_spread - max_x_spread * 0.5, y: Math.random() * max_y_spread});		
	},	

//	lateExit
	exit : function() {
		var t = this;
		if (null == t.exited) {
			t.exited = true;
			engine.text2d.clearAll();
			engine.text2d.hijacked = false;			
			engine.removeCanvasClient(engine.frontCanvas);
		}
	},
	
	createFX : function(gl, hideText) {
	}
}

