function BPMTimeline(initialBPM) {

	var initialBPM = initialBPM;

	var bpmMarkers = {
		// 0 : {
		// 	type        : "linear",
		// 	endBeat     : undefined, 
		// 	endBPM      : initialBPM, 
		// 	total_time   : function() { return  }, // TODO
		// 	total_beats  : function() { return  }, // TODO
		// 	value_at_beat : function() { return bpm_to_beat_period(initialBPM); }
		// }
	};

	var index = [];


	// converter from beat to time
	this.time = function (beat) {

		var marker;
		for (var i=1; i<bpmMarkers.length; i++) 
			if (bpmMarkers[i].endBeat > beat) {
				marker = bpmMarkers[i];
				break;
			}

		if (!marker) // constant BPM
			return initialBeatPeriod * beat;
		else 
			return marker.total_time(beat);
	}

	// converter from time to beat
	this.beat = function (time) {
		// TODO
		var previous;
		var next;
		for (var i=0; i<bpmMarkers.length; i++) {
			if (bpmMarkers[i].time > time) {
				next = bpmMarkers[i];
			} else {
				previous = bpmMarkers[i];
			}
		}

		if (!previous && !next) // constant BPM
			return time / bpm_to_beat_period(initialBPM);
		else if (previous && next)
			return next.totalTime(time);
		else if (previous && !next)
			previous.beat 
	}

	function update(_initialBPM, start, end) {
		// TODO
		bpmMarkers.sort(function(m1, m2) { return m1.beat - m2.beat; });
	}

	function bpm_at_beat(b) {
		// TODO
	}

	function bpm_at_time(t) {
		// TODO
	}

	// marker: {time|beat, bpm}
	this.add_bpm_marker = function(marker) {
		// TODO
		var totalBeatsFn;
		var totalTimeFn;
		var valueAtBeatFn;

		if (marker.type=="linear" || marker.type=="exponential") {

			totalBeatsFn = function (time) {

				var end = this.endBeat;
				var endBeatPeriod = bpm_to_beat_period(this.endBPM);
				var start = (this.previous)? this.previous.endBeat : 0;
				var startBeatPeriod = 
					(this.previous)? 
						bpm_to_beat_period(this.previous.endBPM) : 
						this.timeline.get_initial_bpm();

				return Formulas[type+"_integral_inverse"](start, end, startBeatPeriod, endBeatPeriod, start, time);
			};

			totalTimeFn  = function (beats) {

				var end = this.endBeat;
				var endBeatPeriod = bpm_to_beat_period(this.endBPM);
				var start = (this.previous)? this.previous.endBeat : 0;

				var startBeatPeriod = 
					(this.previous)? 
						bpm_to_beat_period(this.previous.endBPM) : 
						bpm_to_beat_period(this.timeline.get_initial_bpm());

				var totalTimeAtStart;

				if (this.previous) {
					totalTimeAtStart = 0;
				} else 
					totalTimeAtStart = 
						this.previous.cache.total_time_at_end 
							= this.previous.total_time(start);

				return Formulas[type+"_integral"](start, end, startBeatPeriod, endBeatPeriod, totalTimeAtStart, beats);
			};

			valueAtBeatFn = function (beats) {

				var end = this.endBeat;
				var endBeatPeriod = bpm_to_beat_period(this.endBPM);
				var start = (this.previous)? this.previous.endBeat : 0;
				var startBeatPeriod = (this.previous)? bpm_to_beat_period(this.previous.endBPM) : this.timeline.get_initial_bpm();

				return Formulas[type](start, end, startBeatPeriod, endBeatPeriod, beats);
			};

		} else {
			throw "Unsupported marker type (" + marker.type + ") @ BPMTimeline.add_bpm_marker.";
		}

		var obj = {
			previous      : undefined,
			timeline      : this, 
			type          : marker.type,
			endBeat       : marker.endBeat, 
			endBPM        : marker.endBPM, 
			total_beats   : totalBeatsFn, 
			total_time    : totalTimeFn, 
			value_at_beat : valueAtBeatFn, 
			cache         : {
				total_beats_at_end : undefined, 
				total_time_at_end  : undefined, 
			}
		};

		totalBeatsFn.bind(obj);
		totalTimeFn.bind(obj);
		valueAtBeatFn.bind(obj);

		var idx = find_index(index, marker.endBeat);
		
		if (idx.length > 1) {

			bpmMarkers[marker.endBeat+""] = obj;

			if (index.length==0) {
				index.splice(0, 0, marker.endBeat);
			} else if (idx[0] != undefined && idx[1] == undefined) {
				// Insert after the last marker in the array.
				index.splice(idx[0]+1, 0, marker.endBeat);
				obj.previous = bpmMarkers[index[idx[0]]+""];
			} else if (idx[0] == undefined && idx[1] != undefined) {
				// Insert before the first marker in the array.
				index.splice(idx[1], 0, marker.endBeat);
				bpmMarkers[index[idx[1]]+""].previous = obj;
				obj.previous = undefined;
			} else if (idx[0] != undefined && idx[1] != undefined) {
				// Insert inbetween the markers in the array.
				index.splice(idx[1], 0, marker.endBeat);
				bpmMarkers[index[idx[1]]+""].previous = obj;
				obj.previous = bpmMarkers[index[idx[0]]+""];
			}
		} else 
			throw "Illegal access to a BPM marker @ BPMTimeline.add_bpm_marker.";

	}

	this.remove_bpm_marker = function(markerTime) {
		// TODO
	}

	this.change_bpm_marker = function(markerTime) {
		// TODO
	}

	this.get_markers = function() {
		return bpmMarkers;
	}

	this.get_initial_bpm = function() {
		return initialBPM;
	}

	/* 
	 * Given a beat index 'b0' and a step 'difB' (e.g.: beat 4, step 0.5), 
	 * returns the time period between [b0, b0+difB]. 
	 * Useful function to return the time period of, for example, a segment 
	 * of 4 beats.
	 */
	function get_period(b0, difB) {
		var startTime = this.time(b0);
		var endTime   = this.time(b0+difB);
		return endTime - startTime;
	}

	// helper
	function bpm_to_beat_period(bpm) { 
		return 60/bpm; 
	}

	// helper
	function beat_period_to_bpm(beatPeriod) { 
		return 60/beatPeriod; 
	}
	
}