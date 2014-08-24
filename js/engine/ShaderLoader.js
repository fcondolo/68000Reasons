/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function ShaderLoader(url, type) {
	var t = this;
	t.shader=null;
	t.type = type;
	t.urlList = url;
	t.counter = 0;
	t.script = new Array();
	t.requests = new Array();
	t.loaded = false;
	t.requested = 0;
}

ShaderLoader.prototype= {
		decompress : function(s) {
		var compressor = new LZW();
		return compressor.decompress(s);
		},
		
		oneMoreFileLoaded : function (gl) {
			var t = this;
			t.counter++;
			if (t.counter == t.urlList.length) {
				t.compile(gl, t.urlList);
				t.loaded = true;
			}
		},
		
		loadAsync : function (gl) {
			var t = this;
			
			for (var i = 0; i < t.urlList.length; i++) {
				var request = new XMLHttpRequest();
				request.rurl = t.urlList[i];
				request.open('GET', t.urlList[i], true);	// async
				request.rindex = i;
				request.onreadystatechange = function () {
					if (this.readyState == 4) {
						t.script[this.rindex] = this.responseText;						
						t.oneMoreFileLoaded(gl);
					}
				};
				try {
					request.send(null);
					t.requests.push(request);
					t.requested++;
				} catch (e) {
					alert("Error loading file:\n" + t.urlList[i]+ "\n" + e.toString() + "\nMake sure file exists and HTTP Cross origin requests are enabled for your browser, or run the online version");
				}			
			}
		},


	compile : function(gl, url){
		var t = this;
		var script = "";
		for (var i = 0; i < t.script.length; i++)
			script += t.script[i];
		t.shader = gl.createShader(t.type);
		gl.shaderSource(t.shader, script);
		gl.compileShader(t.shader);
		if (!gl.getShaderParameter(t.shader, gl.COMPILE_STATUS)) {
			console.error("Shader compilation error:\nfiles:"+url+"\n"+gl.getShaderInfoLog(t.shader)+"\nsource:\n"+script);
			alert("Shader compilation mess. Check console");
		}
		else {
			console.log("Shader compiled from source(s):" + t.urlList);
		}			
	}
}