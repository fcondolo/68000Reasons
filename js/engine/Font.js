/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/


/**
 * @constructor
 */
function Font() {
	var t = this;
	t.quads = new QuadPool();
	t.alphabet=" ";
}

Font.prototype = {
	create : function(gl, texture, quadsCount, charsPerLine, linesCount, charWidth, charHeight, charScaleX, charScaleY) {
		var t = this;
		
		t.quads.create(gl, texture, quadsCount);

		var scaleX = 1.0 / t.quads.tex.width;
		var scaleY = 1.0 / t.quads.tex.height;

		t.cw = charWidth * scaleX;
		t.ch = charHeight * scaleY;
		
		t.csx = charScaleX;
		t.csy = charScaleY;
		t.charsPerLine = charsPerLine;
	},
	
	draw : function(gl, program, x ,y , text) {
		var t = this;
	
		for (var i = 0; i < text.length; i++) {
			var index = Math.floor(Math.floor(text.charCodeAt(i)) - Math.floor(t.alphabet.charCodeAt(0)));
			var u = Math.floor(Math.floor(index) % Math.floor(t.charsPerLine));
			var v = Math.floor(Math.floor(index) / Math.floor(t.charsPerLine));
			var tx = x + t.csx*i;
			t.quads.setQuadData(i, tx, y, tx+t.csx, y+t.csy, u*t.cw, 1.0-(v+1.0)*t.ch, (u+1.0)*t.cw, 1.0-v*t.ch);
		}
		t.quads.draw(gl, program);
	}
}