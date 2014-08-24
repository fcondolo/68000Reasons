/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function ResourceManager() {
	var t = this;
	t.textures = new Array();
	t.shaderLoaders = new Array();
	t.resources = new Array();
	t.logFailuresCount = 0;
	t.loadingRatio = 1.0;
}

ResourceManager.prototype = {
	prefetchTexture : function(texture, keepImageAfterLoading, clampToEdge) {
		var t = this;
		
		if (t.resources[texture]) {
			console.log("TEXTURE CACHE HIT for: " + texture);
			return t.resources[texture];
		}
			
		var tex = new Texture();
		if (keepImageAfterLoading)
			tex.keepImage = true;
		else
			tex.keepImage = false;
		
		if (clampToEdge)
			tex.clampToEdge = true;
		else
			tex.clampToEdge = false;
		
		tex.load(engine.gl, texture);
		t.textures.push(tex);
		t.resources[texture] = tex;
		return tex;
	},
	
	prefetchShaderFiles : function(vtx, frgmt) {
		var t = this;
		var gl = engine.gl;
		
		var vs = new ShaderLoader(vtx, gl.VERTEX_SHADER);
		var fs = new ShaderLoader(frgmt, gl.FRAGMENT_SHADER);
		vs.loadAsync(gl);
		fs.loadAsync(gl);
		t.shaderLoaders.push(vs);
		t.shaderLoaders.push(fs);
		return [vs, fs];
	},
	
	getReadyStateText : function(state) {
		switch (state) {
			case 0: return "UNSENT"; break;
			case 1: return "OPENED"; break;
			case 2: return "HEADERS RECEIVED"; break;
			case 3: return "LOADING"; break;
			case 4: return "DONE"; break;
			default: return "UNKNOWN"; break;
		}
	},

	isReady : function() {
		var t = this;
		var tsolved = 0;
		var ssolved = 0;
		var maxLogFailuresBeforeLog = 50;
		
		for (var i = 0; i < t.textures.length; i++) {
			if (t.textures[i].loaded)
				tsolved++;
		}
		
		for (var i = 0; i < t.shaderLoaders.length; i++) {
			var loader = t.shaderLoaders[i];
			if (loader.loaded && loader.shader != null) {
				ssolved++;
			}
			else {
				if (t.logFailuresCount > maxLogFailuresBeforeLog) {
					console.log("ResourceManager : " + loader.urlList + " NOT ready, requested:" + loader.requested + "/" + loader.urlList.length);
					for (var j = 0; j < loader.requests.length; j++) {
						var request = loader.requests[j];
						console.log("readystate: " + t.getReadyStateText(request.readyState) + ", status: " + request.status + ", statustext:" + request.statusText);
					}
				}
			}
		}
		if (t.logFailuresCount > maxLogFailuresBeforeLog)
			console.log("ResourceManager : " + tsolved + "/" + t.textures.length + " textures ready, " + ssolved + "/" + t.shaderLoaders.length + " shaders ready");
			
		var allSolved = tsolved == t.textures.length && ssolved == t.shaderLoaders.length;
		if (allSolved || t.logFailuresCount > maxLogFailuresBeforeLog)
			t.logFailuresCount = 0;
		else
			t.logFailuresCount++;
		var solvedCount = tsolved + ssolved;
		if (beatHandler && beatHandler.AudioIsLoaded)
			solvedCount++;
		solvedCount += jsLoader_totalLoad-jsLoader_leftToLoad;
		t.loadingRatio = solvedCount / (t.textures.length + t.shaderLoaders.length + jsLoader_totalLoad + 1); // + 1 for music
		return allSolved;
	}	
}