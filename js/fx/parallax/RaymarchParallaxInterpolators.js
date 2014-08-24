/** 
	WebGL engine by Soundy (Frederic Condolo)
	Released under WTFPL license (http://www.wtfpl.net/)
**/

RayMParlxInt = [
		{
			interpolator : new Interpolator("CamAngle"),
			values : [
				{from: -3.14159*0.5,
				to: 3.14159*0.5,
				duration:2.0},
				{from: 3.14159*0.5,
				to: -3.14159*0.5,
				duration:2.0},
				{from: -3.14159*0.5,
				to: -3.14159*0.4,
				duration:0.3},
				{from: -3.14159*0.4,
				to: -3.14159*0.3,
				duration:0.3},
				{from: -3.14159*0.3,
				to: -3.14159*0.2,
				duration:0.3},
				{from: -3.14159*0.2,
				to: 0.0,
				duration:0.4}
			]
		},
		{
			interpolator : new Interpolator("CamX"),
			values : [
				{from: 2.5,
				to: 2.5,
				duration:1.0},
				{from: 2.5,
				to: 2.5-0.6,
				duration:1.0},
				{from: 2.5-0.6,
				to: 2.5+0.6,
				duration:0.5},
				{from: 2.5+0.6,
				to: 2.5,
				duration:0.5},
				{from: 2.5,
				to: 2.5,
				duration:1.0}
			]
		},
		{
			interpolator : new Interpolator("CamY"),
			values : [
				{from: 2.5,
				to: 2.5,
				duration:2.0},
				{from: 2.5,
				to: 2.5-0.6,
				duration:2.0},
				{from: 2.5-0.6,
				to: 2.5+0.6,
				duration:2.0},
				{from: 2.5+0.6,
				to: 2.5,
				duration:2.0},
				{from: 2.5,
				to: 2.5-0.6,
				duration:0.5},
				{from: 2.5-0.6,
				to: 2.5+0.6,
				duration:0.7},
				{from: 2.5+0.6,
				to: 2.5,
				duration:2.0}
			]
		},
		{
			interpolator : new Interpolator("CamZ"),
			values : [
				{from: 1.0 * 0.0333,
				to: 5.0 * 0.0333,
				duration:5.0},
				{from: 5.0 * 0.0333,
				to: 5.5 * 0.0333,
				duration:0.5},
				{from: 5.5 * 0.0333,
				to: 7.5 *  0.0333,
				duration:1.2},
				{from: 7.5 * 0.0333,
				to: -10.0 * 0.0333,
				duration:7.5},
				{from: -10 * 0.0333,
				to: 1.0 * 0.0333,
				duration:10.5}
			]
		}
	];
