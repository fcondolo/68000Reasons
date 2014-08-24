/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

/**
 * @constructor
 */
function InterpolatorList() {
	var t = this;
	t.list = [];
}
 
 InterpolatorList.prototype = {
	addInterpolator : function(params) {
		var t = this;
		t.list.push(params);
		var index = t.list.length-1;
		t.list[index].index = -1;
		return index;
	},

	addInterpolatorList : function(list) {
		var t = this;
		var ret = t.list.length;
		for (var i = 0; i < list.length; i++)
			t.addInterpolator(list[i]);
		return ret;
	},
	
	
	getByIndex : function(index) {
		var t = this;
		return t.list[index];
	},
		
	getByName : function(name) {
		var t = this;
		return t.getByIndex(t.getIndexByName(name));
	},

	getIndexByName : function(name) {
		var t = this;
		for (var i = 0; i < t.list.length; i++) {
			if (t.list[i].interpolator.name == name)
				return i;
		}
		alert("InterpolatorList.js, function getIndexByName - Could not find interpolator " + name);
		return -1;
	},

	update : function(time) {
		var t = this;
		for (var i = 0; i < t.list.length; i++) {
			t.list[i].index = t.private_updateInterp(time, t.list[i].interpolator, t.list[i].values, t.list[i].index);
		}
	},

	private_updateInterp : function(time, interpolator, values, index) {
		var t = this;
		var setNextValues = false;
		if (index == -1) {
			setNextValues = true;
			index = 0;
		}
		if (interpolator.isOver(time)) {
			setNextValues = true;
			index = (index + 1) % values.length;
		}
		if (setNextValues)
			interpolator.setValues(values[index].from, values[index].to, values[index].duration);
			
		return index;
	}
}
