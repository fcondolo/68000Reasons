/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  RoundedRects() {
	var t = this;
	t.shadersPath = "shaders/";
	t.vertexShader = [t.shadersPath + "engine/diffuseTexture2d.vs"];
	t.fragmentShader = [t.shadersPath + "fx/RoundedRects.fs"];
	t.sprite = new Array();
	t.horizCount = 16;
	t.vertCount = 16;
	t.tex = new Array();
}

function rotateZ(x, y, a)
{
	return {xo:Math.cos(a) * x - Math.sin(a) * y, yo:Math.sin(a) * x + Math.cos(a) * y};
}

RoundedRects.prototype = {
	preloadResources : function() {
		var t = this;
		t.tex[0] = resman.prefetchTexture("data/RoundedRect.png");
		t.nmap = resman.prefetchTexture("data/RoundedRectNormal.png");
		t.shaders = resman.prefetchShaderFiles(t.vertexShader, t.fragmentShader);
	},
	
	tick : function(time, gl) {
		var t = this;
		
		engine.useProgram(t.program);
		engine.setTexture(t.nmap, 2);

		//t.applyrot=1;
		var ofs = 0;
		var hsize = 2.0 / t.horizCount;
		var vsize = 2.0 / t.vertCount;
		for (var y = 0; y < t.vertCount; y++) {
			for (var x = 0; x < t.horizCount; x++) {
				var xc = (x-t.horizCount*0.5)*hsize;
				var yc = (y-t.vertCount*0.5)*vsize;
				if (t.applyrot) {
				    var angle = ofs*0.002*Math.sin(time*0.15);
					angle *= 1.0-(Math.sqrt(xc*xc+yc*yc) * 0.5);
					var rot = rotateZ(xc,yc,angle);
					t.sprite[ofs].setTransfo(rot.xo, rot.yo, 0.0);
				}
				else {
					t.sprite[ofs].setTransfo(xc, yc, 0.0);
				}
				var scale = 0.4 + 0.15 * Math.sin(Math.atan2(xc, yc)+time*2.0) + 0.1 * Math.abs(Math.cos(time)) * Math.sin(time + ofs * 0.05);
				t.sprite[ofs].setScale(vsize*scale, hsize*scale);
				t.sprite[ofs].draw(gl, t.program);
				ofs++;
			}
		}
	},

	createFX : function(gl) {
		var t = this;
		t.program = engine.createProgramFromPrefetch(t.shaders);
		var ofs = 0;
		for (var y = 0; y < t.vertCount; y++) {
			for (var x = 0; x < t.horizCount; x++) {
				t.sprite[ofs] = new Sprite();
				t.sprite[ofs].create(gl, t.tex[Math.floor(Math.random() * (t.tex.length))]);
				ofs++;
			}
		}
	}
}

