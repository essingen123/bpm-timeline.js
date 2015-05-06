# bpm-timeline.js

A class that provides a similar way to schedule beat period changes like Web Audio API AudioParam but, in order to convert between Time (seconds) and Beat, we need to calculate the integrals and inverse of the integrals of the automation functions.

**Create a BPMTimeline object**

```javascript
var initialBPM = 60;
var automation = new BPMTimeline(initialBPM);
```

**Add a BPM marker**

```javascript
automation.add_bpm_marker({type: "linear", endBeat: 50,  endBPM : 120    });
automation.add_bpm_marker({type: "linear", endBeat: 100, endBPM : 140   });
automation.add_bpm_marker({type: "linear", endBeat: 120, endBPM : 50    });
automation.add_bpm_marker({type: "linear", endBeat: 125, endBPM : 10    });
automation.add_bpm_marker({type: "linear", endBeat: 130, endBPM : 1000   });
```

**Remove a BPM marker**
```javascript
automation.remove_bpm_marker({ endBeat: 50 });
```
```javascript
automation.remove_bpm_marker({ endTime: 37.5 });
```

**Edit a BPM marker**
```javascript
automation.change_bpm_marker({endBeat:130, endBPM: 100});
```

**Beat/Time relation**
```javascript
automation.time(132);
```
```javascript
automation.beat(40);
```


**What is the BPM at**


**Use cases**