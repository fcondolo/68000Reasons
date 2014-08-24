/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function Text2Texture() {
	var t = this;
	t.canvasTexture = null;
	t.canvas = null;
	t.curParamIndex = 0;
	t.canvas = document.getElementById('Text2TextureCanvas');
	t.ctx = t.canvas.getContext('2d');
	t.ctx.font="120px Syncopate";
	t.curTextAlpha = 0.0;
}
 
 Text2Texture.prototype = {
	 createTexture : function (_params) {
		var t = this;
		t.writeToCanvas(_params);
		
		var gl = t.canvas.getContext("webgl");
		if (!gl)
			gl = t.canvas.getContext("experimental-webgl");
		if (!gl) {
			engine.error("Can't create webgl context for canvas Text2TextureCanvas");
			return null;
		}
		
		if (null == t.canvasTexture)
			t.canvasTexture = gl.createTexture();
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

		gl.bindTexture(gl.TEXTURE_2D, t.canvasTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		
		return t.canvasTexture;
	},

	 writeToCanvas : function (_time, _params) {
		var t = this;
		
		var p;
		var remaining = 9999999;
		if (t.curParamIndex < _params.length-1) {
			if (_params[t.curParamIndex+1].at <= _time)
				t.curParamIndex++;
			else
				remaining = _params[t.curParamIndex+1].at - _time;
		}
		p = _params[t.curParamIndex];
		if (!p.textAlign) p.textAlign = "center";
		if (!p.textBaseline) p.textBaseline = "middle";
		t.ctx.globalAlpha = 1.0;
		t.ctx.fillStyle = p.backCol;
//		t.ctx.fillRect(0, 0, t.canvas.width, t.canvas.height);
		t.ctx.clearRect(0, 0, t.canvas.width, t.canvas.height);
		if (t.curParamIndex == 0 && _time < p.at)
			return t.canvas;
			
		t.ctx.fillStyle = p.textCol;
		t.ctx.textAlign = p.textAlign;
		t.ctx.textBaseline = p.textBaseline;
		if (p.font) t.ctx.font = p.font;
		if (beatHandler.lastGetDataIsBeat == 2) {
			t.curTextAlpha = 1.0;
		}
		
		t.ctx.globalAlpha = t.curTextAlpha;
			
		t.ctx.fillText(p.text1, t.canvas.width/2, t.canvas.height/2*0.7);
		t.ctx.fillText(p.text2, t.canvas.width/2, t.canvas.height/2*1.3);
		t.curTextAlpha = Math.max(0.0, t.curTextAlpha-engine.deltaTime);
		
		return t.canvas;
	}
}
