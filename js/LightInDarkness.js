/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

USE_MUSIC = true;
BOOTBLOCK_MIN_DURATION = -10.0;
LOADING_MIN_DURATION = 0.0;
HIDETEXT = true;
COMPILED = false;

var engine = new Engine(fxDemoUpdate);

var resman = new ResourceManager();
var fx;

// Demo variables
var fxBoot;
var fxLoading;
var fxDemo;

var curFXIndex = 0;
var prevFXIndex = 0;
var lastSwitchTime = 0.0;
var justChangedFxList = true;
var fx;
var beatHandler = null;

var LID_justLaunched;
var LID_fxCreated;
var LID_loadingScreenLoaded;
var LID_mainScreensPrefetched;
var LID_mainScreensCreated;

function createFxLists() {
/*
	Syntax:
	=======
		Special commands:
		----------------
			forceTime : Forces current time. Useful to jump in the middle of the list to test a specific fx. example: {forceTime: 6.0}
			forever : Never gets next Fx to execute. Useful to test a fx for an infinite duration. Must be placed AFTER the fx to test. example: {forever: true}
			shift: Shifts the "at" time of all following FX					
*/

	
	fxLoading = [{at: 0.0000, fx: new Diskette2(), name:"Diskette2", update: fxLoadingUpdate}];
	fxDemo = [		
		{at: 0.0,	fx: new FullscreenNoise(), name:"FullscreenNoise", forceTime: STARTIME},
		{at: 1.25,	fx: new VertRasters(), name:"VertRasters"},
		{at: 3.1,	fx: new FullscreenNoise(), name:"FullscreenNoise"},
		{at: 4.32,	fx: new RubberCube(), name:"RubberCube"},
		{at: 5.72,	fx: new FullscreenNoise(), name:"FullscreenNoise"},
		{at: 7.52,	fx: new StarfieldLogo(), name:"StarfieldLogo"},
		{at: 24.52,	fx: new Checker(), name:"Checker"},
		{at: 39.52,	fx: new Snake(), name:"snake"},
		{at: 54.77,	fx: new Circles(), name:"Circles"},
		{at: 70.08, fx: new RaymarchParallax(), name:"RaymarchParallax"},
		{at: 100.87, fx: new RenderTexSphere(), name:"RenderTexSphere"},
		{at: 131.52, fx: new Voxel1(), name:"Voxel1"},
		{at: 177.8, fx: new SnakeV2(), name:"SnakeV2"},
		{at: 199.0,	fx: new RubberCube2(), name:"RubberCube2"},
		{at: 208.7,	fx: new Fishes2(), name:"Fishes2"},
		{at: 243.0,	fx: new EndScroller(), name:"EndScroller"},
		{at: 5000.52,	fx: new LoopDemo(), update: fxDemoLoop, name:"looping..."}
	];
}

function prefetchFXscripts() {
	if (COMPILED)
		return;
	var async = true;
	var load = "normal";	
//	var load = "optimized";
//	var load = "compressed";
	var level1Files = [
	];
	var filesList = [
		// load engine scripts
		"3rdParty/j3di/j3di",
		"engine/Sprite",
		"engine/DebugDraw",
		"engine/BeatHandler",
		"engine/InterpolatorList",
		"engine/Font",
		"engine/Cube",
		"engine/PerlinNoise",
		"engine/Text2Texture",
		
		// load fx scripts
		"fx/Diskette2",
		"fx/LoadingScreen",
		"fx/FullscreenNoise",
		"fx/VertRasters",
		"fx/LinesTunnel",
		"fx/PointsMover",
		"fx/StarfieldLogo",
		"fx/XPlosion2D",
		"fx/Snake",
		"fx/SnakeV2",
		"fx/LeavingBars_Rot",
		"fx/Circles",
		"fx/RenderTexSphere",
		"fx/parallax/RaymarchParallax",
		"fx/RubberCube",
		"fx/RubberCube2",
		"fx/FallingBars",
		"fx/LeavingBars_Vert",
		"fx/LoopDemo",
		"fx/Checker",
		"fx/ComicStrip",
		"fx/ComicStrip2",
		"fx/SimpleSinCos",
		"fx/ScreenWalker",
		"fx/Voxel1",
		"fx/Fishes2",
		"fx/EndScroller"		
	];

	for (var i = 0; i < filesList.length; i++) {
		var jsPath;
		var fname = filesList[i];
		if (load == "normal") {
			jsPath = "js/";
			fname += ".js";
		} else if (load == "optimized") {
			jsPath = "baked/js/optim/";
			fname += ".js_o";
		} else if (load == "compressed") {
			jsPath = "baked/js/lzw/";
			fname += ".js_c";
		}
		jsLoader_load([jsPath + fname], async);
	}
}

function forceTime(time) {
	engine.forceTime(time);
	console.log("forced time to: " + time);
}

function launchNewFxList(list) {
	if (!list.alreadyCreated) {					
		createAllFX(list);	// do it here, not before, to avoid gl context scrambling		
		list.alreadyCreated = true;
	}
	engine.justLaunched = true;
	engine.globalUpdate = list[0].update;
	if (list[0].forceTime != null) {
		var timeset = list[0].forceTime;
		if (timeset < 5.0)	// avoid stupid epsilons
			timeset = 0.0;
		forceTime(timeset);
		if (USE_MUSIC) {		
			engine.music = AudioElem;
			engine.music.pause();
			engine.music.loop = true;
			engine.music.currentTime = timeset;
			engine.music.play();
		}
		
		if (!beatHandler) {
			beatHandler = new BeatHandler();
			beatHandler.setBPM(125.0);
		}
		else
			beatHandler.reset(timeset);
		
	}
	fx = list;
	curFXIndex = 0;
}

function fxBootUpdate(time, deltaTime) {
	if (LID_justLaunched) {	// first update
		LID_justLaunched = false;
		LID_fxCreated = false;
		forceTime(0.0);
		LID_loadingScreenLoaded = false;
		LID_mainScreensPrefetched = false;
		LID_mainScreensCreated = false;
	}
		
	if (LID_fxCreated) {	// fx has been created
		update(time, deltaTime, false);
		
		if (!LID_loadingScreenLoaded) {
			if (resman.isReady()&& jsLoader_isReady()) {
				LID_loadingScreenLoaded = true;
			}
		}
		else {
			if (!LID_mainScreensPrefetched) {
				prefetchAllResources(fxDemo);
				LID_mainScreensPrefetched = true;
			}
			if (engine.time > BOOTBLOCK_MIN_DURATION)
				launchNewFxList(fxLoading);
		}
	}
	else {
		if (resman.isReady() && jsLoader_isReady()) {	// resources are ready
			// launch fx
			createFxLists();			
			createAllFX(fxBoot);
			LID_fxCreated = true;
			// prefetch loading screen
			prefetchAllResources(fxLoading);
		}
	}
}

function fxLoadingUpdate(time, deltaTime) {
	if (LID_justLaunched) {	// first update
		LID_justLaunched = false;
		forceTime(0.0);
	}
	
	update(engine.time, deltaTime, false);
	
	if (!LID_mainScreensCreated) {
		if (resman.isReady() && jsLoader_isReady() && engine.fontLoaded) {
			if (AudioIsLoaded)
				LID_mainScreensCreated = true;
			else
				console.log("Waiting for audio to load...");
		}
	}
	else {
		if (engine.time > LOADING_MIN_DURATION) {
			launchNewFxList(fxDemo);
		}
	}
}

function fxDemoUpdate(time, deltaTime, click) {
	if (LID_justLaunched) {	// first update
		LID_justLaunched = false;
		forceTime(0.0);
	}
	if (beatHandler) {
		beatHandler.getData(engine.time-deltaTime, engine.time);
	}
	update(engine.time, deltaTime, click);
}

function fxDemoLoop(time, deltaTime) {
	launchNewFxList(fxDemo);
}

function getNextFXIndex(idx) {
	return (idx+1) % fx.length;
}
function goToNextFX() {
	prevFXIndex = curFXIndex;
	curFXIndex = getNextFXIndex(curFXIndex);
	if (fx[curFXIndex].JumpToIndex)
		curFXIndex = fx[curFXIndex].JumpToIndex;
	
	console.log("new FX index: " + curFXIndex);
}

function getNextRealFX() {
	var i = getNextFXIndex(curFXIndex);
	while (!fx[i].fx) {
		i = getNextFXIndex(i);
	};
	return fx[i];
}

function switchFX(time) {
	var skipThisFX = false;
	switch (curFXIndex) {
	default:
		if (fx[curFXIndex].forceTime != null) {
			time = fx[curFXIndex].forceTime;
			engine.forceTime(time);
			console.log("forced time to: " + time);
		}
		console.log("switching to fx \"" + fx[curFXIndex].name + "\" at time: " +  time);
		console.log("next fx: \"" + getNextRealFX().name + "\" at time: " +  getNextRealFX().at);
		engine.globalUpdate = fx[curFXIndex].update;
		if (engine.forceLODTimer <= 0.0) {
			engine.autoFrameRateTex = null;
			engine.lowFrameRateCounter = 0.0;			
			engine.timeWithGoodFrameRate = 0.0;
		}
	break;
	}
	return time;
}

var initDone = false;


function prefetchAllResources(_fx) {
	for (var i = 0; i < _fx.length; i++) {
		if (null != _fx[i].fx && null != _fx[i].fx.preloadResources)
			_fx[i].fx.preloadResources();
	}
}

function createAllFX(_fx) {
	var lastAt = -1.0;
	for (var i = 0; i < _fx.length; i++) {
		var deletei = false;
		if (_fx[i].forever) {	// simply shift all others
			for (var it = i+1; it < _fx.length; it++) {
				if(_fx[it].at)
					_fx[it].at += 99999999;
				if(_fx[it].atBar)
					_fx[it].atBar += 99999999;
			}
			if (!_fx[i].fx && _fx[i].at) // shift self if no fx to stay on previous fx
				_fx[i].at += 99999999;
			deletei = true;
		}		
		if (_fx[i].shift) {
			for (var it = i+1; it < _fx.length; it++) {
				if(_fx[it].at)
					_fx[it].at += _fx[i].shift;
			}
			deletei = true;
		}
		if (deletei) {
			_fx.splice(i, 1);
			i--;
		}
	}
	for (var i = 0; i < _fx.length; i++) {
		if (null != _fx[i].fx)
			_fx[i].fx.createFX(engine.gl, HIDETEXT);
	}
}

var lastTickFx = null;
function  update(time, deltaTime, click) {
	if (!fx)
		return;	// not yet initialized
	var nextTime;
	var nfx = getNextRealFX();
	if (nfx.at)
		nextTime = nfx.at;
	if (nfx.atBar)
		nextTime = beatHandler.lastBarTime + (nfx.atBar - beatHandler.lastBarIndex) * beatHandler.secondsForOneBar;
		
	if (fx[curFXIndex].fx) {
		if (fx[curFXIndex].fx != lastTickFx) {
			if (null != lastTickFx) {
				if (lastTickFx.exit) {
					lastTickFx.exit(engine.gl);
					if (engine.text2d.hijacked)
						engine.error("engine.text2d.hijacked still ON after exiting");
				}
			}
			if (fx[curFXIndex].fx.enter)
				fx[curFXIndex].fx.enter(lastTickFx);
			lastTickFx = fx[curFXIndex].fx;
		}
		engine.VerifyContextStackDepth();
		if (fx[curFXIndex].fx.tick) {
			var remaining = nextTime-time;
			if (engine.click && !engine.paused) {
				if ((!fx[curFXIndex].fx.onUserClick || !fx[curFXIndex].fx.onUserClick()) && (remaining > 2.0)) {
					time = nextTime - 2.0;
					engine.time = time;
					engine.music.pause();
					engine.music.currentTime = time;
					engine.music.play();
					beatHandler.reset(time);
				}
			}
			fx[curFXIndex].fx.tick(time, engine.gl, remaining);
		}
		engine.VerifyContextStackDepth();
	}
		
	if (time >= nextTime) {		
		goToNextFX();
		time = switchFX(time);
		lastSwitchTime = time;
	}		
}


function demoInit(){	
	//engine.init(30.0, null); // 
	engine.init(30.0, document.getElementById("music"));
	
	var jsPath = "js/";
	jsLoader_load([jsPath + "fx/BootBlock.js"], false);
	fxBoot = [{at: 0.0000, fx: new BootBlock(), update: fxBootUpdate}];
 
	
	fx = fxBoot;
	prefetchAllResources(fxBoot);
	prefetchFXscripts();
	engine.justLaunched = true;
	engine.globalUpdate = fxBoot[0].update;
}
