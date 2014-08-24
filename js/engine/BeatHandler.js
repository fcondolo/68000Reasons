/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

var AudioIsLoaded = false;
var AudioElem = new Audio();
 
AudioElem.addEventListener('loadeddata', function() 
{
    AudioIsLoaded = true;
}, false);
 
AudioElem.addEventListener('error' , function() 
{
    alert('error loading audio');
}, false);
 
AudioElem.src = 'data/plagiatory.ogg';

var Audio2IsLoaded = false;
var Audio2Elem = new Audio();
 
Audio2Elem.addEventListener('loadeddata', function() 
{
    Audio2IsLoaded = true;
}, false);
 
Audio2Elem.addEventListener('error' , function() 
{
    alert('error loading audio2');
}, false);
 
Audio2Elem.src = 'data/pax.ogg';

/**
 * @constructor
 */
function BeatHandler() {
	var t = this;
	t.setBPM(125.0);
	t.reset(0.0);
	t.setTimeOffset(t.secondsForOneHalfBeat * 0.75); // trigger on snare, not bdrum
	t.nextBeatTime = 0.0;
}

BeatHandler.prototype = {
	reset : function(_time) {
		var t = this;
		t.lastBeatTime = _time;
		t.lastBarTime = _time;
		if (t.secondsForOneBar != 0.0)
			Math.floor(t.lastBarIndex = _time / t.secondsForOneBar);
		else
			t.lastBarIndex = 0;
		t.lastBeatValue = 0;
		t.lastGetDataIsBeat = 0;
		t.beatBarFader = 0.0;
		t.nextBeatTime = _time + t.secondsForOneBar;
	},
	
	
	setBPM : function(_bpm) {
		var t = this;
		t.bpm = _bpm;
		t.beatsPerSecond = t.bpm / 60.0;
		t.secondsForOneBeat = 1.0 / t.beatsPerSecond;
		t.secondsForOneBar = t.secondsForOneBeat * 2.0;
		t.secondsForOneHalfBeat = t.secondsForOneBeat * 0.5;
		t.toleranceForOneBeat = t.secondsForOneBeat * 0.1
		t.toleranceForOneHalfBeat = t.secondsForOneHalfBeat * 0.1
		t.toleranceForOneBar = t.secondsForOneBar * 0.1
	},

	setTimeOffset : function(_offset) {
		var t = this;
		t.offset = _offset;
	},
	
	scaleBar : function(_scale) {
		var t = this;
		t.secondsForOneBar *= _scale;
	},
	
	getData : function (_prevTime, _curTime) {
		var t = this;
		
		var correctedTime = t.offset + _curTime;
		t.lastGetDataIsBeat = 0;
		t.beatBarFader -= engine.deltaTime;
		t.beatBarFader = Math.max(0.0, t.beatBarFader - engine.deltaTime);
		
		if (Math.abs(correctedTime - t.lastBeatTime) < 0.5)
			return 0;
						
		while (t.nextBeatTime + t.secondsForOneBar < correctedTime)
			t.nextBeatTime += t.secondsForOneBar;
		
		var delta = Math.abs(t.nextBeatTime-correctedTime);
		if (delta <= t.toleranceForOneBar) {
			t.lastBeatTime = t.nextBeatTime;
			t.lastBeatValue = 2;
			t.lastGetDataIsBeat = 2;
			t.beatBarFader = 1.0;
			t.lastBarTime = t.nextBeatTime;
			t.lastBarIndex++;
			while (t.nextBeatTime < correctedTime)
				t.nextBeatTime += t.secondsForOneBar;
			return 2;
		}
			
		return 0;
	}
}