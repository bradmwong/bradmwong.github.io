var isSound= true;
var isRunning = false;
var isPaused = false;
var isComplete = false;

var prepTime;
var setTime;
var restTime;
var rounds;

// Main Display
var mainDisplay = {
	timer: $("#timerCount"),
	exercise: $("#exerciseTitle"),
	round: $("#roundCount"),
	progress: $("#progressCount")
}

// Per round
var roundData = {
	exerciseList: [],
	ignoredList: [],
	exerciseQtyTotal: 0,
	exerciseQtyActive: 0
}

// Workout
var workoutData = {
	exercise: [],
	duration: [],
	ignored: [],
	maxIndex: 0,
	totalTime: 0,
	firstRun: true
}

// Trackers to save running workout values
var tracker = {
	intervalTracker: 0,
	indexTracker: 0,
	timeTracker: 0,
	timeElapsed: 0
}

// Sound variables
var soundData = {
	beep: {
		sound: new Howl({
			src: ["assets/sounds/beep.wav"],
			volume: 0.5
		})
	},
	delete: {
		sound: new Howl({
			src: ["assets/sounds/delete.wav"],
			volume: 0.4
		})
	},
	ignore: {
		sound: new Howl({
			src: ["assets/sounds/ignore.wav"],
			volume: 1.0
		})
	}
};

// Voice variables
var voiceMessage = new SpeechSynthesisUtterance();
var voices;

var voiceOption = [];
var voiceDefault;
var voiceOptionIndex = 2;
var voiceRate = 1.1;
var voicePitch = 1;












/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|          INITALIZATION           ︳
\*________________________________*/

// Initialization
init();

// Initialization
function init() {

	//Define current voice
	setVoiceArray();

	// Set display time
	globalTime();

	// Display initial values
	resetDisplay();

	// $("#pauseButton").hide();
	$("#pauseButton").css({ height: 0, opacity: 0, marginTop: "0" });
	$("#pauseButton").hide();
};

/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|           SAVE BUTTON            ︳
\*________________________________*/

$("#save").click(function(){
  	$("#saveModal").show();
})


$(".closeButton").click(function() {
  	$("#saveModal").hide();
})

// If Esc is pressed
$("body").keydown(function(event){
	if(event.which === 27) {
  		$("#saveModal").hide();
	}
});



/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|            LOAD BUTTON           ︳
\*________________________________*/

$("#load").click(function(){
	$("#loadModal").show();
});


$(".closeButton").click(function() {
  	$("#loadModal").hide();
})

// If Esc is pressed
$("body").keydown(function(event){
	if(event.which === 27) {
  		$("#loadModal").hide();
	}
});


/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|           SOUND BUTTON           ︳
\*________________________________*/

// Toggle sound button/status
$("#sound").click(function(){
	$("#sound span i").toggleClass("fa-volume-up").toggleClass("fa-volume-mute");
	isSound = !isSound;
	if (isSound) {
		speak("sound on");
	}
});


/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|          SETTING INPUT           ︳
\*________________________________*/

// Prevent non-number inputs
$(".timeStyle").keypress(function(event){
	if(event.which != 8 && isNaN(String.fromCharCode(event.which))) {
		event.preventDefault();
	}
	// console.log('Caret at: ', event.target.selectionStart)
});

// Click setting increment buttons
$(".settingButtons").click(function(){

	var $this = $(this);
	var parentClass = $(this).closest("div").attr("class");
	var parentId = $(this).closest("li").attr("id");

	// Button animation
	$(this).addClass("clickDefaultSetting");
	setTimeout(function(){
		$this.removeClass("clickDefaultSetting");
	}, 200);

	// Play sound
	playSound("beep");

	// If input is a number or time value
	if (parentId === "roundSetting") {

		var rdSelector = "#" + parentId + " .timerInput .roundInput";
		var round = parseInt($(rdSelector).val());

		// Default value to 0 if number is not entered
		if (isNaN(round)) {
			round = 0;
		} else {
			// Increase/decrease round number
			if (round > 99) {
				round = 99;
			} else {
				// Add/subract based on button clicked
				if (parentClass.indexOf("addTime") >= 0) {
					round >= 99 ? round = 99 : round++;
				} else if (parentClass.indexOf("minusTime") >= 0) {
					round <= 0 ? round = 0 : round--;
				}
			}
		}
		// Update round value
		$(rdSelector).val(round);

	} else {

		var secSelector = "#" + parentId + " .timerInput .secInput";
		var seconds = parseInt($(secSelector).val());
		var minSelector = "#" + parentId + " .timerInput .minInput";
		var minutes = parseInt($(minSelector).val());
		var time = minutes * 60 + seconds;

		// Default value to 0 if number is not entered
		if (isNaN(time)) {
			time = 0;
		} else {
			// Increase/decrease time interval
			if (time > 3600) {
				time = 3600;
			} else {
				// Add/subract based on button clicked
				if (parentClass.indexOf("addTime") >= 0) {
					time >= 3600 ? time = 3600 : time++;
				} else if (parentClass.indexOf("minusTime") >= 0) {
					time <= 0 ? time = 0 : time--;
				}
			}
		}

		// Separate minutes and seconds
	    minutes = parseInt(time / 60, 10);
	    seconds = parseInt(time % 60, 10);
	    // Format number to 2 digit text format
	    minutes = minutes < 10 ? "0" + minutes : minutes;
	    seconds = seconds < 10 ? "0" + seconds : seconds;
	    // Update time values
	    $(minSelector).val(minutes);
	    $(secSelector).val(seconds);
	}
});

// Update main display if anything is clicked
$("body").click(function(){
	if (!isRunning) {
		// Set main timer display
		globalTime();
	}
})

// Updates time variables and main display
function globalTime() {

	var displayTime;
	var total = 0;
	var hours = 0;
	var minutes = 0;
	var seconds = 0;
	
	// Array of all routine exercises
	roundData.exerciseList = routineArray();
	roundData.exerciseQtyTotal = roundData.exerciseList.length;

	// Array of active exercises
	roundData.ignoredList = ignoredArray();
	roundData.exerciseQtyActive = roundData.exerciseQtyTotal - occurancesInArray(roundData.ignoredList, true);

	// Calculate total workout time in seconds
	// Add prep time at start
	total += totalSeconds("prepareSetting");
	// Add total set time
	total += totalSeconds("setSetting") * totalRounds("roundSetting") * roundData.exerciseQtyActive;
	// Add total rest time
	total += totalSeconds("restSetting") * totalRounds("roundSetting") * roundData.exerciseQtyActive;
	// Subtract a rest for the first rest
	// if (totalSeconds("prepareSetting") <= 0) {
	total -= totalSeconds("restSetting");
	// }

	// Separate minutes and seconds
    hours = parseInt(total / (3600), 10);
    minutes = parseInt((total % 3600) / 60, 10);
    seconds = parseInt(total % 60, 10);

    // Format number to 2 digit text format
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    total >= 3600 ? displayTime = hours + ":" + minutes + ":" + seconds : displayTime = minutes + ":" + seconds;

    // Update time variables
    workoutData.totalTime = total;
	prepTime = totalSeconds("prepareSetting");
	setTime = totalSeconds("setSetting");
	restTime = totalSeconds("restSetting");
	rounds = totalRounds("roundSetting");

    // Update main display
	mainDisplay.timer.text(displayTime);
	mainDisplay.round.text(rounds);
}


/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|          ROUTINE INPUT           ︳
\*________________________________*/

// If Enter is pressed
$("input[type='text']").keypress(function(event){
	if(event.which === 13) {
		addRoutine();
		globalTime();
	}
});

// If add sign is clicked
$(".fa-plus").click(function(){
	addRoutine();
	globalTime();
});

// Click on trashcan to delete exercise
$("#routineContent").on("click", "span:first-child", function(event){
	
	// Delete animation
	$(this).parent().fadeOut(250, function(){
		$(this).remove();
		globalTime();
	});
	event.stopPropagation();

	// Play sound
	playSound("delete");
});

// Check off exercise to exclude
$("#routineContent").on("click", "li", function(){
	
	// Strike-through animation
	if (!isRunning) {
		$(this).toggleClass("ignored");
		globalTime();
	}
 
	// Play sound
	playSound("ignore");
});

function addRoutine() {
	if($("#routineInput").val() !== ""){
		// Add new exercise text from input
		var exerciseText = $("#routineInput").val();
		$("#routineContent").append("<li><span><i class='far fa-trash-alt'></i></span><span>" + exerciseText + "</span></li>");
		$("#routineInput").val("");
	}
};


/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|        START/RESET BUTTON        ︳
\*________________________________*/

// Click start button
$("#startButton").click(function(){

	// Check that inputs are correct
	globalTime();

	// Start workout
	isRunning = !isRunning;
	isComplete = false;

	// Start button animation
	var $this = $(this);
	$(this).addClass("clickDefault");
	setTimeout(function(){
		$this.removeClass("clickDefault");

		// Change Start/Reset button
		if (isRunning) {
			$this.html("Reset");
		} else {
			$this.html("Start");
		}

		// Reset pause button
		isPaused = false;
		$("#pauseButton").html("Pause");

	}, 200);

	// Hide unused fields and show "pause button"
	if (isRunning) {
		// Hide workout settings
		$("#settingSetup").animate({ height: 0, opacity: 0 }, 'slow', function(){
			// $(this).hide();
		});
		// Hide exercise settings
		$(".fa-plus").fadeToggle();
		$("#routineInputWrapper").animate({ height: 0, opacity: 0 }, 'slow', function(){
			$(this).hide();
		});
		$("#routineContent span:first-child").hide();
		// Show pause button
		$("#pauseButton").show();
		$("#pauseButton").animate({ height: 53.6, opacity: 1, marginTop: "25.8px" }, 'slow');
	} else {
		// Show workout settings
		// $("#settingSetup").show();
		// $("#settingSetup").animate({ height: 208.364, opacity: 1 }, 'slow');
		$("#settingSetup").animate({ height: 209.6, opacity: 1 }, 'slow');
		// Show exercise setting
		$(".fa-plus").fadeToggle();
		$("#routineInputWrapper").show();
		$("#routineInputWrapper").animate({ height: 52.800, opacity: 1 }, 'slow');
		$("#routineContent span:first-child").show();
		// Hide pause button
		$("#pauseButton").animate({ height: 0, opacity: 0, marginTop: "0" }, 'slow', function(){
			$("#pauseButton").hide();
		});
	}

	if (isRunning) {
		speak("start");
	} else {
		speak("reset");
	}

	if (isRunning) {
		startTimer();
	} else {
		stopCurrentInterval();
		globalTime();
		resetDisplay();
	}
});

function resetDisplay() {
	// Display default values
	mainDisplay.exercise.text("Your Custom Workout");
	mainDisplay.round.text(rounds = totalRounds("roundSetting"));
	mainDisplay.progress.text("100" + "%");
}


function startTimer() {

	prepTime = totalSeconds("prepareSetting");
	setTime = totalSeconds("setSetting");
	restTime = totalSeconds("restSetting");
	rounds = totalRounds("roundSetting");

	globalTime();

	defineWorkout();

	// Reset time and run timer
	tracker.timeElapsed = 0;
	firstRun = true;
	countTimer(0, workoutData.maxIndex);
}

function defineWorkout() {

	var isIgnored;
	var firstIndex = true;
	var firstRest = true;

	// Reset workout
	workoutData.exercise = [];
	workoutData.duration = [];
	workoutData.ignored = [];

	// Set Prep Intervals
	workoutData.exercise[0] = "PREPARE";
	workoutData.duration[0] = prepTime;
	prepTime > 0 ? isIgnored = false : isIgnored = true;
	workoutData.ignored[0] = isIgnored;

	// Set Exercise/Rest Intervals
	if (rounds > 0 && roundData.exerciseQtyActive > 0) {
		workoutData.maxIndex = roundData.exerciseQtyTotal * 2 * rounds - 1;

		// Loops through rounds
		var index = 0;
		for (var r = 1; r <= rounds; r++) {
			
			// Loops through exercises
			var subIndex = 0;
			for (var i = 1; i <= roundData.exerciseQtyTotal; i++) {

				var ignoreAll = setTime <= 0 || roundData.ignoredList[subIndex] ? true : false;

				// Define Rest Intervals
				if (index !== 0) {
					index++;
					workoutData.exercise[index] = "REST";
					workoutData.duration[index] = restTime;
					restTime > 0 ? isIgnored = false : isIgnored = true;
					// Check for prep time
					if (firstIndex) {
						// Check if prep time is ignored
						isIgnored = workoutData.ignored[index - 1] ? true : false;
						firstIndex = false;
					}
					isIgnored = ignoreAll ? true : isIgnored;
					workoutData.ignored[index] = isIgnored;				
				}

				// Define Exercise Intervals
				index++;
				workoutData.exercise[index] = roundData.exerciseList[subIndex].toUpperCase();
				workoutData.duration[index] = setTime;
				(setTime > 0 && !roundData.ignoredList[subIndex]) ? isIgnored = false : isIgnored = true;
				isIgnored = ignoreAll ? true : isIgnored;
				workoutData.ignored[index] = isIgnored;

				subIndex === (roundData.exerciseQtyTotal - 1) ? subIndex = 0 : subIndex++;
			}
		}
	} else {
		// If only prep time
		workoutData.maxIndex = 0;
	}

	// console.log(workoutData.exercise);
	// console.log(workoutData.duration);
	// console.log(workoutData.ignored);
}

function countTimer(startIndex, endIndex, setTime) {

	var timer = 0;
    tracker.indexTracker = startIndex;

    // Check if segment should be run or not
 	if (!workoutData.ignored[tracker.indexTracker]) {

 		// Time pulled from index if not defined
	    timer =	(typeof setTime !== 'undefined') ? setTime : workoutData.duration[tracker.indexTracker];

	    // Update display at start
	    updateDisplay();

	    // Voice command
	    if (firstRun === true) {
	    	firstRun = false;
	    } else {
	    	speak(workoutData.exercise[tracker.indexTracker]);
	    }

	    // Update display after each second
	    tracker.intervalTracker = setInterval(function () {

	    	timer--;
	    	tracker.timeElapsed++;

	        // if timer reaches the end
	        if (timer <= 0) {
	        	// Clear the interval
	            clearInterval(tracker.intervalTracker);

	            // Check if workout is complete
	            if (tracker.timeElapsed >= workoutData.totalTime && tracker.indexTracker >= endIndex) {
	            	workoutComplete();
	        	} else {
	        		tracker.indexTracker++;
	        		// Run the next interval
		            countTimer(tracker.indexTracker, workoutData.maxIndex);
	        	}
	        } else {
		    	updateDisplay();
	        }
	    }, 1000);

 	} else {

 		// Check if workout is complete
 		if (tracker.timeElapsed >= workoutData.totalTime && tracker.indexTracker >= endIndex) {
 			workoutComplete();

 		} else {
 			tracker.indexTracker++;
 			countTimer(tracker.indexTracker, workoutData.maxIndex);
 		}
 	}

 	// Function to update main display
	function updateDisplay() {

	    // Update exercise display
		mainDisplay.exercise.text(workoutData.exercise[tracker.indexTracker]);
		
		// Update round display
		mainDisplay.round.text(Math.ceil(tracker.indexTracker / ((endIndex + 1) / rounds)));

		// Update time display
		var minutes = parseInt(timer / 60, 10);
		var seconds = parseInt(timer % 60, 10);
	    minutes = minutes < 10 ? "0" + minutes : minutes;
	    seconds = seconds < 10 ? "0" + seconds : seconds;
	    mainDisplay.timer.text(minutes + ":" + seconds);

	    // Update progress display
	   	var progressPercent;
	    progressPercent = Math.floor((tracker.timeElapsed / workoutData.totalTime) * 100);
	    mainDisplay.progress.text(progressPercent + "%");

	    // Save value to tracker
	    tracker.timeTracker = timer;

	    // Voice command for the last 3 seconds
	    if (timer <= 3) {
	    	speak(timer);
	    }
	}

	 function workoutComplete() {

    	updateDisplay();
    	isComplete = true;

    	// Display end message
    	mainDisplay.exercise.text("COMPLETE!");

    	// Voice command
    	speak("your workout is complete");
 	}
};

function stopCurrentInterval() {
	clearInterval(tracker.intervalTracker);
}


/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|        PAUSE/RESUME BUTTON       ︳
\*________________________________*/

// Click pause button
$("#pauseButton").click(function(){

	// Start/Stop workout
	isPaused = !isPaused;

	// Click button animation
	var $this = $(this);
	$(this).addClass("clickDefault");
	setTimeout(function(){
		$this.removeClass("clickDefault");
		if (isPaused) {
			$this.html("Resume");
		} else {
			$this.html("Pause");
	}
	}, 200);

	// Voice Command
	if (isPaused) {
		speak("pause");
	}

	if (!isComplete) {
		// If status is paused, stop interval otherwise reload interval
		if (isPaused) {
			// Stop current interval
			stopCurrentInterval();
		} else {
			// Start running again
			countTimer(tracker.indexTracker, workoutData.maxIndex, tracker.timeTracker);
		}		
	}
});


/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|         GLOBAL FUNCTIONS         ︳
\*________________________________*/

// Total time in seconds
function totalSeconds(parentId) {

	var seconds = 0;
	var s1 = $("#" + parentId + " .minInput");
	var s2 = $("#" + parentId + " .secInput");

	// Default value to 0 if invalid or negative value entered
	(isNaN(s1.val()) || s1.val() <= 0) ? s1.val("00") : seconds += parseInt(s1.val() * 60);
	(isNaN(s2.val()) || s2.val() <= 0) ? s2.val("00") : seconds += parseInt(s2.val());

	// If value is greater than upper limit
	if (seconds > 3600) {
		seconds = 3600;
		s1.val("60");
		s2.val("00");
	} else {
	    var m = parseInt(seconds / 60, 10);
	    var s = parseInt(seconds % 60, 10);
		s1.val(	m < 10 ? "0" + m : m );
		s2.val(	s < 10 ? "0" + s : s );
	}

	return seconds;
}

// Total time in rounds
function totalRounds(parentId) {
	var rds = 0;
	var r = $("#" + parentId + " .roundInput");

	(isNaN(r.val()) || r.val() <= 0) ? r.val("0") : rds += parseInt(r.val());

	return rds;
}

// List of all exercises
function routineArray() {
	var arr = [];
	arr = $('#routineContent li').map(function(){ return $(this).text(); }).toArray();
	return arr;
}

// True if exercise is valid / False if exercise is ignored
function ignoredArray() {
	var arr = [];
	arr = $("#routineContent li").map(function(){ return $(this).hasClass("ignored") }).toArray();
	return arr;
}

// Count how many time value occurs in array
function occurancesInArray(array, value) {
    return array.filter((v) => (v === value)).length;
}


/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|          SOUND FUNCTIONS         ︳
\*________________________________*/

function playSound(soundId) {
	if (isSound) {
		soundData[soundId].sound.play();
	}
}


/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|          VOICE FUNCTIONS         ︳
\*________________________________*/

function speak(dialogue) {
	// Stop any running voice
	speechSynthesis.cancel();
	// If sound is on, play new voices
	if (isSound) {
		// Set voice
		name = voiceOption[voiceOptionIndex];
		voiceMessage.voice = voices.find(voice => voice.name === name);
		voiceMessage.voiceURI = "native";
		voiceMessage.rate = voiceRate;
		voiceMessage.pitch = voicePitch;

		// Set speech text
		if (typeof dialogue === "string") {
			dialogue = dialogue.toLowerCase();
		}
		voiceMessage.text = dialogue;

		// Play text to voice
		speechSynthesis.speak(voiceMessage);
	}
}

function setVoiceArray() {

	var prom1 = setSpeech();
	prom1.then((voices) => voiceOption = voicesArray());

	function setSpeech() {
	    return new Promise(function (resolve, reject) {
            let synth = window.speechSynthesis;
            let id;

            id = setInterval(() => {
                if (synth.getVoices().length !== 0) {
                    resolve(synth.getVoices());
                    clearInterval(id);
                }
            }, 10);
        })
	}

	var prom2 = setDefaultVoice();
	prom2.then((voiceOption) => voiceDefault = voiceOption[voiceOptionIndex]);
	prom2.then((voiceOption) => voiceMessage.voice = voices[voiceOptionIndex]);

	function setDefaultVoice() {
		return new Promise(function (resolve, reject) {
			let id;
			id = setInterval(() => {
				if (voiceOption.length !== 0) {
					resolve(voiceOption);
					clearInterval(id);
				}
			}, 10);
		})
	}
}

// List of all exercises in English
function voicesArray() {
 	var arr = [];

	voices = speechSynthesis.getVoices();

	for(var i = 0; i < voices.length; i++) {
		if (voices[i].lang.includes('en')) {
			arr.push(voices[i].name);
		}
	}

	return arr;
}

