/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function Interpolator(name) {
	var t = this;
	t.name = name;
	t.useBeatHandler = true;
}
 
 Interpolator.prototype = {
	 setValues : function (from, to, duration) {
		var t = this;
		t.from = from;
		t.to = to;
		t.duration = duration;
		//if (t.useBeatHandler)
			//t.duration = Math.floor(t.duration / beatHandler.secondsForOneBar) * beatHandler.secondsForOneBar;
		t.spd = (to-from)/duration;
		t.value = t.from;
		t.elapsed = 0.0;
		t.firstSet=true;
	},

	 getValueAt :  function(time) {
		var t = this;
		if (t.firstSet) {
			t.firstSet = false;
			t.startTime = time;
		}
		t.pelasped = Math.min(time-t.startTime, t.duration);

		
		var ratio = 12.0*t.pelasped/t.duration - 6.0;
		t.value = t.from + t.spd * t.duration * 1.0/(1.0+Math.exp(-ratio));
		return t.value;
	},

	isOver :  function(time) {
		var t = this;
		return time-t.startTime >= t.duration;
	}
}
