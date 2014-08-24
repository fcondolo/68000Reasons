/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function Texture() {
	var t = this;
	t.texture = null;
	t.loaded = false;
	t.context = engine.gl;
}
 
 Texture.prototype = {
	/**
		Callback called by load()
		don't call this function directly
		@param gl the OpenGL context
	**/
	 onLoaded : function (_gl) {
		var t = this;
		var gl = t.context;
		if (null == gl) {
			gl = engine.gl || _gl;
			t.context = gl;
		}

	//	console.log("onLoaded: " + t.texture.image.src);
		gl.bindTexture(gl.TEXTURE_2D, t.texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t.texture.image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		if (t.clampToEdge) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);		
		}
		gl.bindTexture(gl.TEXTURE_2D, null);
		t.width = t.texture.image.width;
		t.height = t.texture.image.height;
		t.format = gl.RGBA;
		t.type = gl.UNSIGNED_BYTE;
		t.loaded = true;
		t.context = engine.gl;
		if (!t.keepImage)
			t.texture.image = null;
	},


	/**
		Loads a texture
		@param gl the OpenGL context
		@param url path to the texture file
	**/
	 load :  function(_gl, url) {
		var t = this;
		var gl = t.context;
		if (null == gl) {
			gl = engine.gl || _gl;
			t.context = gl;
		}
		t.texture = gl.createTexture();
		t.texture.image = new Image();
		t.texture.image.onload = function () {
			t.onLoaded(gl)
			console.log ("loaded texture " + url + ", width:" + t.width + ", height:" + t.height);
		}
		t.texture.image.src = url;
	},
	
	createRenderTexture : function (_gl, width, height, options) {
		var t = this;
		t.context = engine.gl;
		gl = engine.gl;
		options = options || {};
		t.texture = gl.createTexture();
		t.width = width;
		t.height = height;
		t.format = options.format || gl.RGBA;
		t.type = options.type || gl.UNSIGNED_BYTE;
		
		gl.bindTexture(gl.TEXTURE_2D, t.texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);		
		gl.texImage2D(gl.TEXTURE_2D, 0, t.format, width, height, 0, t.format, t.type, null);
	}
}
