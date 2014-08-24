#ifdef GL_ES
    precision mediump float;
#endif

    uniform sampler2D uSampler0; // monitor
    uniform sampler2D uSampler1; // mask
    uniform sampler2D uSampler2; // fx
	uniform vec3 iResolution;
	uniform float beatBarFader;
	uniform float iGlobalTime;

    varying float v_Dot;
    varying vec2 v_texCoord;

	float rand(vec2 co){
		return fract(sin(dot(co.xy/(1.0+iGlobalTime*10.0) ,vec2(4.9898,27.233))) * (2563628.5453));
	}
	
	float noise(void)
	{
		vec2 uv = gl_FragCoord.xy;
		uv.x += iGlobalTime*200.56;
		uv /= iResolution.xy; 

		float flicker = 10.0;
			
		float freq = sin(pow(mod(iGlobalTime, flicker)+flicker, 1.9));
		
		float col = 0.5*(rand(uv+mod(iGlobalTime, freq)) + rand(uv+mod(iGlobalTime+.1, freq)));

		uv = gl_FragCoord.xy;
		uv.x += iGlobalTime*200.56+1.0;
		uv /= iResolution.xy; 
		col += 0.5*(rand(uv+mod(iGlobalTime, freq)) + rand(uv+mod(iGlobalTime+.1, freq)));

		uv = gl_FragCoord.xy;
		uv.x += iGlobalTime*200.56-1.0;
		uv /= iResolution.xy; 
		col += 0.5*(rand(uv+mod(iGlobalTime, freq)) + rand(uv+mod(iGlobalTime+.1, freq)));
		
		col *= 0.3;
		
		return col;
	}	
		
		
	void main()
    {
		float vDot = 0.5+pow(v_Dot,3.0);
        vec4 color = texture2D(uSampler0, v_texCoord);
        vec4 msk = texture2D(uSampler1, v_texCoord);
		vec2 v_texCoord2 = v_texCoord;
		v_texCoord2.x *= iResolution.x/iResolution.y;
		v_texCoord2.y = (v_texCoord2.y + 0.35) * 0.5;
        vec4 fx = texture2D(uSampler2, v_texCoord2);
		vec3 col = color.xyz * vDot + msk.x * fx.xyz;
		float ratio = min(1.0, beatBarFader * 2.0 * msk.x);
		col = (1.0-ratio)*col + noise() * ratio * 0.75 + col * 0.25 * ratio;
        gl_FragColor = vec4(col, color.a);
    }
