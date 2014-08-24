#ifdef GL_ES
    precision mediump float;
#endif

    uniform sampler2D uSampler0;

    varying float v_Dot;
    varying vec2 v_texCoord;

    void main()
    {
        vec4 color = texture2D(uSampler0, v_texCoord);
        gl_FragColor = color;
		/*
        color += vec4(0.1, 0.1, 0.1, 1);
        gl_FragColor = vec4(color.xyz * v_Dot, color.a);*/
    }
