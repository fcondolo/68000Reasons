/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function  EndScroller() {
	var t = this;
	t.textScrollingSpd = 30.0;
	t.createSplines();
}

EndScroller.prototype = {

	createSplines : function() {
		var t = this;
		t.dta = [];
		t.pointsPerLine = 8;
		t.distBetweenPoints = 0.025;
		t.splinesCount = 8;
		t.splineSpd = 0.0025;
	},

	enterSplines : function() {
		var t = this;
		for (var iSpl = 0; iSpl < t.splinesCount; iSpl++) {
			t.dta[iSpl] = {x: new Array(), y: new Array(), spdx: new Array(), spdy: new Array()};
			var data = t.dta[iSpl];
			var lnspd = t.splineSpd * (1.0 + iSpl / t.splinesCount);
			data.x[0] = -Math.random() * 0.1;
			data.y[0] = Math.random() * 0.1 + 0.45;
			data.spdx[0] = Math.cos(iSpl + iSpl * 3.14159 * 2.0 / t.splinesCount) * lnspd;
			data.spdy[0] = Math.sin(iSpl + iSpl * 3.14159 * 2.0 / t.splinesCount) * lnspd;
			for (var iPt = 1; iPt < t.pointsPerLine; iPt++) {
				data.x[iPt] = (data.x[data.x.length-1] - data.spdx[data.spdx.length-1]*t.distBetweenPoints/lnspd);
				data.y[iPt] = (data.y[data.y.length-1] - data.spdy[data.spdy.length-1]*t.distBetweenPoints/lnspd);
				data.spdx[iPt] = data.spdx[0];
				data.spdy[iPt] = data.spdy[0];
			}
		}
	},

	tickSplines : function(G) {
		var t = this;
		var iPt = 0;
		var xmin = -0.25;
		var xmax = 1.25;
		var ymin = -0.25;
		var ymax = 1.25;
		var cols = ["#D3EEF6", "#E9DADC", "#D3EEF6", "#E9DADC"];
		G.globalAlpha=0.05;
		for (var iSpl = 0; iSpl < t.splinesCount; iSpl++) {
			var data = t.dta[iSpl];
			var spdScale = 0.00001;
			var exitScale = 0.005;

			G.strokeStyle = cols[iSpl % cols.length];

			for (iPt = 1; iPt < t.pointsPerLine; iPt++) {
				data.spdx[iPt] = (data.x[iPt-1] - data.x[iPt]) * t.splineSpd * 10.0;
				data.spdy[iPt] = (data.y[iPt-1] - data.y[iPt]) * t.splineSpd * 10.0;
			}
			
			for (iPt = 0; iPt < t.pointsPerLine; iPt++) {
				data.x[iPt] += data.spdx[iPt];
				data.y[iPt] += data.spdy[iPt];
			}
						
			
			iPt = 0;
/*
			if (data.x[iPt] <= xmin + 0.25)
				data.spdx[iPt] += Math.max((1.0/Math.max(data.x[iPt], 0.0000001)) * spdScale, spdScale);
			else if (data.x[iPt]>= xmax - 0.25) data.spdx[iPt] -= Math.max((1.0/Math.max(1.0-data.x[iPt], 0.0000001)) * spdScale, spdScale);

			if (data.y[iPt] <= ymin + 0.1)
				data.spdy[iPt] += exitScale * 0.05;
			else if (data.y[iPt]>= ymax - 0.1) data.spdy[iPt] -= exitScale * 0.05;
*/
			
			if (data.x[iPt] <= xmin) {
				data.spdx[iPt] = exitScale * 0.5;
				data.x[iPt] = xmin + exitScale;
			}
			else if (data.x[iPt] >= xmax) {
				data.spdx[iPt] = -exitScale * 0.5;
				data.x[iPt] = xmax-exitScale;
			}
			
			if (data.y[iPt] <= ymin) {
				data.spdy[iPt] = exitScale * 0.5;
				data.y[iPt] = ymin + exitScale;
			}
			else if (data.y[iPt] >= ymax) {
				data.spdy[iPt] = -exitScale * 0.5;
				data.y[iPt] = ymax-exitScale;
			 }
			 
			 if (Math.abs(data.spdy[iPt]) < 0.0001  ) {
				if (data.spdy[iPt] < 0.0 )
					data.spdy[iPt] = -exitScale * 0.05;
				else
					data.spdy[iPt] = exitScale * 0.05;
			 }
				
			 if (Math.abs(data.spdx[iPt]) < 0.0001  ) {
				if (data.spdx[iPt] < 0.0 )
					data.spdx[iPt] = -exitScale * 0.05;
				else
					data.spdx[iPt] = exitScale * 0.05;
			 }
			 
			G.beginPath();
			G.lineWidth = 10.0;
			G.moveTo(data.x[0]*t.width, data.y[0]*t.height);
			for (var i = 1; i < t.pointsPerLine - 2; i ++)
			{
				var xc = (data.x[i] + data.x[i + 1]) / 2;
				var yc = (data.y[i] + data.y[i + 1]) / 2;
				G.quadraticCurveTo(data.x[i]*t.width, data.y[i]*t.height, xc*t.width, yc*t.height);
			}
			G.quadraticCurveTo(data.x[i]*t.width, data.y[i]*t.height, data.x[i+1]*t.width, data.y[i+1]*t.height);
			G.stroke();
			
			G.beginPath();
			G.arc(data.x[0] * t.width, data.y[0] * t.height, t.width * 0.01 * Math.abs(Math.cos(t.elapsed * 16.0)), 0, 2 * Math.PI, false);
			G.fillStyle = "#FF9999";
			G.fill();
		}
		
		var index = Math.floor((t.elapsed * 0.1) % t.splinesCount);
		if (index != t.transPtIndex) {
			t.lastChangetransPtTime = t.elapsed;
			t.transPtIndex = index;
		}
	},

	preloadResources : function() {
		var t = this;
		t.background = resman.prefetchTexture("data/pax_back.jpg", true);
		t.whale = resman.prefetchTexture("data/pax_whale.png", true);
	},
	
	
	tick : function(_time, _gl, remainingTime) {
		var t = this;
		t.elapsed += engine.deltaTime;
		if (engine.key == 40 || engine.key == 39)
			t.textScrollingSpd = Math.min(256.0, t.textScrollingSpd * 1.2);
		else if (engine.key == 37 || engine.key == 38)
			t.textScrollingSpd = Math.max(1.0, t.textScrollingSpd * 0.8);
		
		t.width = window.innerWidth;
		t.height = window.innerHeight;
		var G=engine.frontContext;

		G.globalAlpha=0.5;
		G.fillStyle = "#FFFFFF";
		var ratio = t.width / t.background.width;
//		if (t.height < t.width)
	//		ratio = t.height / t.background.height;
		var picw = t.background.width * ratio;
		var pich = t.background.height * ratio;
		var picwo = (t.width - picw) * 0.5;
		var picho = (t.height - pich) * 0.5;
		var picy = 0.0;
		if (pich > t.height)
			picy = (pich - t.height) * Math.sin(t.elapsed * 0.1) * 0.5;
		G.globalAlpha=Math.min(1.0, t.elapsed * 0.1);
		G.drawImage(t.background.texture.image, picwo, picho - picy, picw, pich);
		G.globalAlpha=Math.min(1.0, t.elapsed * 0.5);
		G.drawImage(t.whale.texture.image, picwo, picho - picy + Math.sin(t.elapsed * 0.7) * picw*0.004, picw, pich);

		G.translate(0, -picy);
		t.tickSplines(G);
		G.translate(0, picy);

		G.globalAlpha=1.0;
		G.fillStyle = "#000000";
		if (picwo > 0.0) {
			G.fillRect(0,0,picwo,t.height);
			G.fillRect(t.width-picwo,0,picwo,t.height);
		}
		if (picho > 0.0) {
			G.fillRect(0,0,t.width,picho);
			G.fillRect(0,t.height-picho,t.width,picho);
		}
		

		t.ypos = Math.max(0.0, t.ypos);
		var prev = t.oDiv.scrollTop;
		t.oDiv.scrollTop = t.ypos;
		
		if (Math.abs(t.textScrollingSpd) > 0.00001 && Math.abs(t.oDiv.scrollTop - prev) < 0.001) {
			t.scrollStuck += engine.deltaTime;
			if (t.scrollStuck > 1.0)
				t.ypos = 0.0;
		} else t.scrollStuck = 0.0;
			
		//t.oDiv.style.top = t.ypos;
		t.ypos += engine.deltaTime * t.textScrollingSpd;



		return false;
	},

	onUserClick: function() {
		return true;
	},
	
	enter : function() {
		var t = this;

		engine.music.pause();
		engine.music = Audio2Elem;
		engine.music.pause();
		engine.music.loop = true;
		engine.music.currentTime = 0.0;
		engine.music.play();


		engine.addCanvasClient(engine.frontCanvas);
		engine.text2d.addRectangle({x: 0.0, y: 0.0, w:1.0, h:1.0, a:0.6, alpha:0.6, done:false, fillStyle:"#FFFFFF", fadeOut:2.0});

		t.enterSplines();
		t.scrollStuck = 0.0;
		t.rotation = 0.004;
		t.elapsed = 0;
		t.exited = null;
		t.transX = 0.0;
		t.transY = 0.0;
		t.transPtIndex = 0;
		t.lastChangetransPtTime = 0.0;
		t.width = window.innerWidth;
		t.height = window.innerHeight;
		engine.text2d.hijacked = true;
		t.ypos = 0;//window.innerHeight;
		t.oDiv = document.getElementById( "endScroll" );
		t.oDiv.style.display = 'block';
		t.oDiv.style.height = window.innerHeight;
		t.oDiv.height = window.innerHeight;
		var fontattr = 'color:white; font-family:JSGL; text-align: left; font-size:' + (Math.floor(12.0*window.innerWidth/1366.0)).toString()+'px; "';
		var style = '<p style="' +
		'display:block' + fontattr + '>';
		t.oDiv.innerHTML =  style + 
		"<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>"+
		"<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>"+
		"<b>Use keyboard arrows to change scrolling speed</b><br>" +
		"<b>Underlined words are clickable hyperlinks</b><br><br><br>" +
		"You've been watching:<br>" +
		'<img src="data/titleshort.png" width="80%" style="margin-left:10%"><br><br>' +
		'First presented during <b>DEMODAYS 2014</b> by:<br><b>* THE DEADLINERS *</b><br><br>' +
		'<br>This demo is a tribute to the 1990 - 1995 Amiga days spirit<br><br>' +
		'<br><b>* Credits: *</b><br>' +
		'Soundy (Frederic Condolo)<br>' +
		'Dascon (Bernd Hoffmann) - <a href=http://www.soundcloud.com/berndhoffmann style="border-bottom:1px solid rgba(255,255,255,128);">Soundcloud</a><br>' +
		'Made (Carlos Pardo) - <a href=http://www.m4de.com/ style="border-bottom:1px solid rgba(255,255,255,128);">Web site</a><br>' +
		'The 3 of us are 40 years old ex-Amiga sceners that escaped the sofa to create this demo. Coming from different groups, we ad-hoc created "The Deadliners" for this prod.'+
		'<br><br>' +
		'<br><b>* Detailed music contributions: *</b><br>' +
		'- Main music "Plagiatory" composed by Dascon,<br>mixed by Virgill<br>' +
		'- End music "Pax" composed by Soundy' +
		'<br><br><br>' +
		'<br><b>* FX list with GFX contributions: *</b><br><br>' +
		'<table border="0" style="border-style: none; padding:0px; table-layout:fixed; width:75%' + fontattr + '>' + 
		'<tr><td>100% canvas oldskool rasters.<br>NGC logo by Yolan.</td> <td><img src="data/shot_1.jpg"></td></tr>'+
		'<tr><td>Rubber cube & lines tunnel.<br>Christmas texture by La Boheme.</td> <td><img src="data/shot2.jpg"></td></tr>'+
		'<tr><td>3D Starfield.<br>Logo by Made.</td> <td><img src="data/shot3.jpg"></td></tr>'+
		'<tr><td>Zooming Checkers.<br>Credits logos by Made.</td> <td><img src="data/shot9.jpg"></td></tr>'+
		'<tr><td>3D Bobs based on curved Voronoi.<br>Logo by Made.</td> <td><img src="data/shot10.jpg"></td></tr>'+
		'<tr><td>2D plasma.<br>Logo by Made.</td> <td><img src="data/shot11.jpg"></td></tr>'+
		'<tr><td>Yet another ray-marching.</td> <td><img src="data/shot12.jpg"></td></tr>'+
		'<tr><td>3D plasma.<br>We love plasmas!</td> <td><img src="data/shot13.jpg"></td></tr>'+
		'<tr><td>Voxelized logos.<br>Images taken from demos we love.</td> <td><img src="data/shot8.jpg"></td></tr>'+
		"<tr><td>Dynamic weight Voronoi sites.<br>That's all it takes</td> <td><img src='data/shot14.jpg'></td></tr>"+
		'<tr><td>MoltenCore<br>Picture by Made.</td><td><img src="data/shot4.jpg"></td></tr>'+
		'<tr><td>Rubber monitor.<br>1084 Texture by Robin Vincent.</td><td><img src="data/shot7.jpg"></td></tr>'+
		'<tr><td>Interferences.<br>"Bless You" picture by Made.</td><td><img src="data/shot5.jpg"></td></tr>'+
		'<tr><td>End scroller.<br>"Pax" picture by Made.</td><td><img src="data/shot6.jpg"></td></tr>'+
		'</table><br><br>'+
		

		'<br><u>Greetings:</u><br>' +
		"Alcatraz - Anarchy - Andromeda - " +
		"Bomb - Brainstorm - " +
		"CNCD - Complex - Crionics - Crusaders - Cryptoburners - " +
		"Delight - Desire - Digital - Dragons - Dreamdealers - " +
		"Fairlight - Frantic - " +
		"Haujobb - HMD - " +
		"Impact - " +
		"Kefrens - " +
		"Lemon - " +
		"Majic 12 - MCS - Melon Design - " +
		"NGC - " +
		"Oxygen - " +
		"Phenomena - Pigmy Projects - PMC - Polka Brothers - " + 
		"Quartex - " + 
		"Ram Jam - Razor 1911 - Rebels - Red Sector - Reflex - " + 
		"Sanity - Scoopex - Silents - Stellar - " + 
		"Tristar - " + 
		"Vanish - Virtual Dreams - Vision Factory - " + 

		'<br><br><br>Now a few words from:<br><br><b><u>Made <a href=http://www.m4de.com/ style="border-bottom:1px solid rgba(255,255,255,128);">(www.m4de.com)</a></u></b><br>' +
		"I have been pixeling and messing with computers for more than 20 years. This demo was the occasion to pay respect to the demoscene, with whom i growed, and say hello to the future generations. This is my first contribution to a web demo, huge thanks goes to Soundy and Dascon for this invitation and their kindness.<br>"+
		"Kudos goes to all the scene people who dream hard enough to make all the demos we see and inspire year by year new minds to come and create with us.<br>"+
		"Regards to my close friends at Bomb, Oxygene, Scoopex, Rebels, HMD, Distorsion, Pulse, Sunflower, Complex, Impact studios, TCB, DF, Razor 1911, TSL, Eurasia, Hirmu, TPolm, Orange, Hugi, OJ, Nah Kolor, and the ones I forget.<br>"+
		"And the most important, a kiss to my lovely wife <3<br>"+
		"Ready for the next adventure !<br>"+
		
		'<br><br><br>Now a few words from:<br><br><b><u>Soundy</u></b><br>' +
		'First some thanks and greets:<br>' +
		'- All my friends in NGC and MCS, it was so nice making demos together 20 years ago.<br>' +
		'- IQ: Man, Shadertoy and all your tutorials are priceless contributions to the scene. This demo owes a lot to you!<br>' +
		'- NoRecess: Nice seeing you in Montreal! Thanks for the direction advices<br>' +
		"- Mushies: You disappeared, hope you're doing well.<br>" +
		"- Dascon & Made: Talented and open-minded! Thank you guys for joining this crazy adventure.<br>" +
		"- Ramon / Desire: Thanks for your kindness and help." +
		
				
		'<br><br><br>Now a few words from:<br><br><b><u>Dascon</u></b><br>' +
		"Hi there, now it seems like it is on me to send some lines into this (still funky) scene world...<br>" +
		"First of all, I hope you enjoyed watching this production as much as I did contributing to it with my music.<br>" +
		"Not to get sentimental now, but this demo means something special to me - as it is the first scene production I participate in after more than 10 years of inactivity...<br>" +
		"As some of you might still remember from older productions of my former groups Essence and Haujobb, I started tracking way back in 1991 and have contributed to several demos, intros, chip-compilations and similar stuff until the late 90s. Somehow, when my old group Essence broke up, I more and more lost interest in creating scene music.<br>" +
		"Due to personal circumstances like my studies, my time-demanding hobby at that time (playing guitar in a metal band) and later on my employment duties, I decided to quit scene activities around 200something. Still, the scene spirit did never let me go for real. I very often found myself watching the latest productions getting released,<br>" +
		'feeling a taste of melancholy. Moreover, with each year passing by I realized that this "fire" called "scene spirit" still somehow burns inside - though it has been more likea matchstick for several years.<br>' +
		'Well, after all I did need a "wake up" call to get from THINKING about restarting activities again to actually DOING so. Big thanks have to go out to Triace and Ramon of ' +
		'Desire, who more or less forced / annoyed / motivated (each verb fits in here in some way...) me to do a comeback. In early 2014 I installed that beloved ProTracker 2.3d again and hey - here we go again. ;)<br>' +
		"There are by far too many people I could greet in here but most probably will leave the majority out right now - Don´t you mind, you know who you are! <br>" +
		"Still, I would like to focus on the following persons for now:<br><br>" +
		"<u>My wife:</u><br>" +
		'Well, she probably will never read this, but she deserves this greet. I think it is pretty cool when you marry someone who is NOT into doing computer music, turns into this "Oh Darling, I am about to go upstairs to do something..." - guy after one year of marriage and still you understand, though computer music sounds like a wounded cat to your ears, that this hobby means something special to your husband and you are even fine with the fact, that from now on it obviously is on you to let the dog go for a walk in the evenings... ;)<br><br>' +
		"<u>Soundy & Made:</u><br>" +
		"Thanks for that great experience doing this demo together with you. It has been a hell of fun as working with you was a great pleasure on the one hand, a great inspiration and motivation on the other hand. It surely is true that working with very skilled people pushes yourself even more to increase your output´s quality - thanks for that!<br><br>" +
		"<u>Triace & Ramon:</u><br>" +
		"As stated above - thanks for getting me back to business due to your never-ending motivation efforts.<br><br>" +
		"<u>Virgill:</u><br>" +
		"Thanks for your always appreciated feedback on my stuff and of course for mastering my music. I could not have thought about someone better suitable for this job, honestly.<br><br>" +
		"<u>Chromag:</u><br>" +
		'Timm, we definitely HAVE TO get back into coop mode again - scene world should be ready for new modules wearing the "Sandpit" label. So just get your ass up! ;)<br><br>' +
		"<u>Slash:</u><br>" +
		'Well, you are a great motivator aswell, what can I say... Thanks for all your efforts to keep Amiga music alive - I really appreciate that.<br><br>' +
		'Okay, I think that is all for now... In case you want to check out more music by me feel free to check <a href=http://www.soundcloud.com/berndhoffmann style="border-bottom:1px solid rgba(255,255,255,128);">my soundcloud page</a> once a while:<br>' +
		'In case you need some music for WHATEVER, feel free to drop me a line at <A HREF="mailto:info@pflege-fobi.com" style="border-bottom:1px solid rgba(255,255,255,128);">info@pflege-fobi.com</A> and I will see whether I can help out.<br>' +

		'<br><br><br><b>Some technical info:</b><br>' +
		'The source code of this demo is not compressed or crypted. You can read and re-use it as you wish.<br>' +
		'At the beginning, this was just a way for me to learn Javascript, and for this reason, you will see many style errors and insanities ;)<br>' +
		"You'll notice that most of the code is downloaded, even shaders are fragmented in different files that are re-assembled and compiled during loading time.<br>" +
		"The demo first loads all the needed .js files. Then, every FX is instanciated and declares its resources (shaders, textures). When all needed resources are loaded, the demo can start.<br>" +
		"Music synchro system is prehistorical, but it works. It's based on hardcoded timings, and a metronome that updates a 'beatBarFader' variable which is injected in all shaders.<br>" +
		'Since music synchro and frame-rate on low-end computers is important (even runs on high end Android phones), the GPU heaviest FX are driven by a system that checks the frame-rate and renders to a smaller resolution texture when it gets too slow. This offscreen texture is then stretched to fit the actual screen resolution.<br>' +
		'Finally I used a lot overlapping HTML5 canvases to combine shader-based FX with simple image blit logos or transitions. FX use 1 to 3 simultaneous canvases.<br>' +
		'Oh BTW you can pause/unpause the demo pressing space and go forward in time with up and right arrow keys.<br>' +


		'<br><br><br><u>Give love to:</u><br>' +
		'<a href=http://www.elmobo.com/ style="border-bottom:1px solid rgba(255,255,255,128);">Moby / El Mobo</a><br>'+
		'<a href=http://www.norecess.net/ style="border-bottom:1px solid rgba(255,255,255,128);">NoRecess / Condense</a><br>'+
		'<a href=http://bruno.kerouanton.net// style="border-bottom:1px solid rgba(255,255,255,128);">Gadget / MCS</a><br>'+
		'<a href=http://olivierbechard.com/ style="border-bottom:1px solid rgba(255,255,255,128);">Ra / Nooon</a><br>'+

		'<br><br>Stay tuned for new productions from</b><br>'+
		'<img src="data/TheDeadliners.png" width="90%" style="margin-left:5%">' +
		
		'<br><br><br><b><u>THE END</u></b><br>'+
		"<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>"+
		"<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>"+
		"<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>"+
		"<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>"+
		"<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>"+
		' ';
/*
		var msk = document.getElementById( "endScrollMask" );
		msk.style.display = 'block';
		msk.style.backgroundSize="100% 100%";
		msk.style.background="-webkit-linear-gradient(top, rgba(255,255,255,100), rgba(255,255,255,0))";
		*/
		var G = engine.frontContext;
		G.globalAlpha=1.0;
		G.fillStyle = "#000";
		G.fillRect(0, 0, engine.frontCanvas.width, engine.frontCanvas.height);
	},	

	exit : function() {
		var t = this;
		if (null == t.exited) {
			t.exited = true;
			engine.text2d.hijacked = false;
			engine.frontContext.globalAlpha = 1.0;
			engine.text2d.clearAllRectangles();
			engine.text2d.rotation = null;
			engine.removeCanvasClient(engine.frontCanvas);
		}
		t.oDiv.innerHTML = "";
		engine.text2d.clearAllTexts();
		engine.pauseBeat = false;
	},
	

	createFX : function(_gl, hideText) {
		var t = this;
	}
}

/*
<body
	onload=setInterval("
		S=Math.sin;
		with(R.getContext('2d'))
			for(
				fillRect(0,0,300,150,drawImage(R,9,2,282,148,0,3,300,150),fillStyle='rgba(99,0,42,.01)'),
				a+=x=88;
				x--;
				fillRect(x*4,75+S(a+x/27+S(x/9)*S(a*2-x/15))*20,4,3))fillStyle='#c60'",a=9
				)
			><canvas id=R>
			*/