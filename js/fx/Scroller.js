/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  Scroller() {
	var t = this;	
	t.elapsed = 0;
	t.writer = new Writer2();
	t.writer.setText([
	{x:0.1, y:0.2,
	fontSize:30, 
	fromX:0.5, fromY:0.5,
	flyDuration:1.0, spawnEachFrame: 32,
	text:"Escaping the sofa for 68000 reasons "},
	{x:0.1, y:0.7, font:10, text:"for 68000 reasons"}
	]);
}

Scroller.prototype = {
	
	preloadResources : function() {
		this.writer.preloadResources();
	},


	enter : function(_lastTickFx) {
		var t = this;
		engine.addCanvasClient(engine.frontCanvas, "Scroller enter");
		engine.text2d.clearAll();
		engine.text2d.hijacked = true;
		t.elapsed = 0;
		t.writer.enter(_lastTickFx);
	},
	
	exit : function() {
		var t = this;
		engine.removeCanvasClient(engine.frontCanvas);
		engine.text2d.hijacked = false;
		t.writer.exit();
	},

	tick : function(_time, _gl, remainingTime) {
		var t = this;
		t.writer.tick(_time, _gl, remainingTime);
	},

	createFX : function(_gl, hideText) {
		var t = this;
		t.writer.createFX(_gl, hideText);
	}
}
