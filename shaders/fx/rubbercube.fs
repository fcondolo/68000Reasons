#ifdef GL_ES
    precision mediump float;
#endif

    uniform sampler2D uSampler0;

    varying float v_Dot;
    varying vec2 v_texCoord;

    void main()
    {
        vec4 color = texture2D(uSampler0, v_texCoord);
		if (color.a < 1.0) 
			discard;	
        gl_FragColor = vec4(color.xyz * v_Dot, color.a);
    }
