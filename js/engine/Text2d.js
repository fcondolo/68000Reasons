/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function Text2d() {
	var t = this;
	t.unique = 0;
	t.texts = new Array();
	t.rectangles = new Array();
	t.postRenderCallbacks = [];
	t.hijacked = false;
	t.autoClose = -1;
}

Text2d.prototype = {
	addEntry : function(_entry) {
		var t = this;
		_entry.unique = t.unique++;
		_entry.remove=false;
		t.texts.push(_entry);
		return _entry.unique;
		},

	clearAllTexts : function() {
		this.texts = new Array();
	},
	
	clearAllRectangles : function() {
		this.rectangles = new Array();
	},

	clearAll : function() {
		var t = this;
		t.postRenderCallbacks = [];
		t.clearRotation();
		t.clearAllTexts();
		t.clearAllRectangles();
		var ctx = engine.frontContext;
		ctx.fillStyle = "#000000";
		ctx.globalAlpha = 0.0;
		ctx.translate(0.0, 0.0);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, engine.frontCanvas.width, engine.frontCanvas.height);
	},

	addRectangle : function(_entry) {
		var t = this;
		_entry.unique = t.unique++;
		_entry.remove=false;
		t.rectangles.push(_entry);
		return _entry.unique;
		},
	
	closeAllIn : function(_delay) {
		var t = this;
		for ( var i = 0; i < t.texts.length; i++) {
			if (!t.texts[i].fadeOut || t.texts[i].fadeOut > _delay)
				t.texts[i].fadeOut = _delay;
		}
		for ( var i = 0; i < t.rectangles.length; i++) {
			if (!t.rectangles[i].fadeOut || t.rectangles[i].fadeOut > _delay)
				t.rectangles[i].fadeOut = _delay;
		}
		t.autoClose = _delay;
	},
		
	updateTexts : function (deltaTime, ctx) {
		var t = this;

		for ( var i = 0; i < t.texts.length; i++) {
			var tx = t.texts[i];

			t.commonUpdate(tx, deltaTime);
			engine.draw2dText(tx);
		}
		for ( var i = 0; i < t.texts.length; i++) {
			if (t.texts[i].remove)
				t.texts.splice(i,1);
		}
	},

	updateRectangles : function(deltaTime, ctx) {
		var t = this;

		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 1.0;

		for ( var i = 0; i < t.rectangles.length; i++) {
			var r = t.rectangles[i];
			t.commonUpdate(r, deltaTime);

			ctx.fillStyle = r.fillStyle;
			ctx.globalAlpha = r.alpha;
			if (r.img) {
				var u0 = r.u0 || 0;
				var v0 = r.v0 || 0;
				var u1 = r.u1 || r.img.width;
				var v1 = r.v1 || r.img.height;
				ctx.drawImage(r.img, u0, v0, u1, v1, r.x * engine.frontCanvas.width, r.y * engine.frontCanvas.height, r.w * engine.frontCanvas.width, r.h * engine.frontCanvas.height);
			}
			else
				ctx.fillRect(r.x * engine.frontCanvas.width, r.y * engine.frontCanvas.height, r.w * engine.frontCanvas.width, r.h * engine.frontCanvas.height);
			if (r.stroke) {
				ctx.strokeRect(r.x * engine.frontCanvas.width, r.y * engine.frontCanvas.height, r.w * engine.frontCanvas.width, r.h * engine.frontCanvas.height);
			}

		}
		for ( var i = 0; i < t.rectangles.length; i++) {
			if (t.rectangles[i].remove) {
				t.rectangles.splice(i,1);
			}
		}
	},
	
	commonUpdate : function (tx, deltaTime) {
		if (tx.fadeOut) {
			tx.fadeIn = null;
			tx.fadeInCounter = null;
			if (!tx.fadeOutCounter)
				tx.fadeOutCounter = tx.fadeOut;
		}

		if (tx.fadeIn && !tx.fadeInCounter)
			tx.fadeInCounter = tx.fadeIn;
		
		if (tx.fadeInCounter && tx.fadeInCounter > 0.0) {
			var ratio = tx.fadeInCounter / tx.fadeIn;
				tx.alpha = 1.0-ratio;
			tx.fadeInCounter -= deltaTime;
		}

		if (tx.fadeOutCounter && tx.fadeOutCounter > 0.0) {
			var ratio = tx.fadeOutCounter / tx.fadeOut;
				tx.alpha = ratio;
			tx.fadeOutCounter -= deltaTime;
			if (tx.fadeOutCounter < 0.0) {
				tx.remove = true;
			}
		}

		tx.alpha = Math.min(tx.alpha, 1.0);
		tx.alpha = Math.max(0.0, tx.alpha);
	},
	
	update : function() {
		var t = this;
		if (t.hijacked)
			return;
			
		if (t.autoClose > 0.0) {
			t.autoClose -= engine.deltaTime;
			if (t.autoClose <= 0.0) {
				t.clearAll();
				engine.removeCanvasClient(engine.frontCanvas);				
			}			
		}
			
		var deltaTime = 0.0;
		if (!t.lasttime) {
			t.lasttime = engine.time;
			deltaTime = 1.0/30.0;
		}
		else
			deltaTime = engine.time - t.lasttime;
		t.lasttime = engine.time;
		var ctx = engine.frontContext;
		ctx.translate(0.0, 0.0);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, engine.frontCanvas.width, engine.frontCanvas.height);
		if (t.rotation && t.rotation != 0.0) {
			ctx.translate(engine.frontCanvas.width * 0.5, engine.frontCanvas.height * 0.5);
			ctx.rotate(t.rotation);
			ctx.translate(-engine.frontCanvas.width * 0.5, -engine.frontCanvas.height * 0.5);
		}
			
		t.updateTexts(deltaTime, ctx);
		t.updateRectangles(deltaTime, ctx);
		t.updateFX(engine.time);
		for (var itFx = 0; itFx < t.postRenderCallbacks.length; itFx++) {
			t.postRenderCallbacks[itFx].func(t.postRenderCallbacks[itFx].p1);
		}
	},
	
	clearRotation : function() {
		var t = this;
		var ctx = engine.frontContext;
		ctx.translate(0.0, 0.0);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, engine.frontCanvas.width, engine.frontCanvas.height);
		ctx.translate(engine.frontCanvas.width * 0.5, engine.frontCanvas.height * 0.5);
		ctx.rotate(0.0);
		ctx.translate(-engine.frontCanvas.width * 0.5, -engine.frontCanvas.height * 0.5);
		t.rotation = null;
	},
	
	remove : function(_unique) {
		var t = this;
		for ( var i = 0; i < t.texts.length; i++) {
			if (t.texts[i].unique == _unique) {
				t.texts.splice(i,1);
				break;
			}
		}
	},
	
	removeRectangle : function(_unique) {
		var t = this;
		for ( var i = 0; i < t.rectangles.length; i++) {
			if (t.rectangles[i].unique == _unique) {
				t.rectangles.splice(i,1);
				break;
			}
		}
	},
	
	addFX : function (fx) {
		var t = this;
		if (t.fx == null)
			t.fx = new Array();
		fx.create();
		t.fx.push(fx);
	},
	
	updateFX : function (time) {
		var t = this;
		var done = new Array();
		if (!t.fx)
			return;
		for (var i = 0; i < t.fx.length; i++) {
			done[i] = t.fx[i].tick(time);			
		}
		do {
			var redo = false;
			for (var i = 0; i < t.fx.length; i++) {
				if (done[i]){
					t.fx.splice(i, 1);
					done.splice(i, 1);
					redo = true;
					break;
				}
			}
		} while (redo);
	}
	
}