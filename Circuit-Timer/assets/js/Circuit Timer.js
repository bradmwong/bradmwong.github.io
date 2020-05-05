var sound= true;
var isRunning = false;
var isPaused = false;

var prepTime;
var setTime;
var restTime;
var rounds;

// Timer variables
var totalTime = 0;
var timeElapsed = 0;

var tracker = {
	intervalTracker: 0,
	indexTracker: 0,
	timeTracker: 0
}

// mainDisplay
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
	ignored: []
};

// Overall exercise routine
var maxIndex = 0;


/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|          INITALIZATION           ︳
\*________________________________*/

// Initialization
init();

// Initialization
function init() {

	// Set display time
	globalTime();

	// Display initial values
	resetDisplay();

	// $("#pauseButton").hide();
	$("#pauseButton").css({ height: 0, opacity: 0, marginTop: "0" });
};

// Toggle sound button/status
$("#sound").click(function(){
	$("#sound span i").toggleClass("fa-volume-up").toggleClass("fa-volume-mute");
	sound = !sound;
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
	// Subtract the last rest time
	if (totalRounds("roundSetting") > 0 && roundData.exerciseQtyActive > 0) {
		total -= totalSeconds("restSetting");
	}

	// Separate minutes and seconds
    hours = parseInt(total / (3600), 10);
    minutes = parseInt((total % 3600) / 60, 10);
    seconds = parseInt(total % 60, 10);

    // Format number to 2 digit text format
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    total >= 3600 ? displayTime = hours + ":" + minutes + ":" + seconds : displayTime = minutes + ":" + seconds;

    // Update time variables
    totalTime = total;
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
	$(this).parent().fadeOut(250, function(){
		$(this).remove();
		globalTime();
	});
	event.stopPropagation();
});

// Check off exercise to exclude
$("#routineContent").on("click", "li", function(){
	if (!isRunning) {
		$(this).toggleClass("ignored");
		globalTime();
	}
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

	// hide unused fields and show "pause button"
	if (isRunning) {
		$("#settingSetup").animate({ height: 0, opacity: 0 }, 'slow');
		$(".fa-plus").fadeToggle();
		$("#routineInputWrapper").animate({ height: 0, opacity: 0 }, 'slow');
		$("#routineContent span:first-child").hide();
		$("#pauseButton").animate({ height: 53.591, opacity: 1, marginTop: "25.8px" }, 'slow');
	} else {
		$("#settingSetup").animate({ height: 208.364, opacity: 1 }, 'slow');
		$(".fa-plus").fadeToggle();
		$("#routineInputWrapper").animate({ height: 52.800, opacity: 1 }, 'slow');
		$("#routineContent span:first-child").show();
		$("#pauseButton").animate({ height: 0, opacity: 0, marginTop: "0" }, 'slow');
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
	timeElapsed = 0;
	countTimer(0, maxIndex);
}

function defineWorkout() {

	var isIgnored;

	// Reset workout
	workoutData = {
		exercise: [],
		duration: [],
		ignored: []
	};

	// Set Prep Intervals
	workoutData.exercise[0] = "PREPARE";
	workoutData.duration[0] = prepTime;
	prepTime > 0 ? isIgnored = false : isIgnored = true;
	workoutData.ignored[0] = isIgnored;

	// Set Exercise/Rest Intervals
	if (rounds > 0 && roundData.exerciseQtyActive > 0) {
		maxIndex = roundData.exerciseQtyTotal * 2 * rounds - 1;
		console.log(maxIndex);

		// Loops through rounds
		var index = 0;
		for (var r = 0; r < rounds; r++) {
			
			// Loops through exercises
			var subIndex = 0;
			for (var i = 1; i <= roundData.exerciseQtyTotal; i++) {

				// Define Exercise Intervals
				index++;
				workoutData.exercise[index] = roundData.exerciseList[subIndex].toUpperCase();
				workoutData.duration[index] = setTime;
				(setTime > 0 && !roundData.ignoredList[subIndex]) ? isIgnored = false : isIgnored = true;
				workoutData.ignored[index] = isIgnored;

				// Define Rest Intervals
				index++;
				if (index < maxIndex) {
					workoutData.exercise[index] = "REST";
					workoutData.duration[index] = restTime;
					restTime > 0 && !(workoutData.ignored[index - 1]) ? isIgnored = false : isIgnored = true;
					workoutData.ignored[index] = isIgnored;
				} else {
					break;
				}
				
				subIndex === (roundData.exerciseQtyTotal - 1) ? subIndex = 0 : subIndex++;
			}
		}		
	}
}

function countTimer(startIndex, endIndex) {

    tracker.indexTracker = startIndex;

    // Check if segment should be run or not
 	if (!workoutData.ignored[tracker.indexTracker]) {

	    var timer = workoutData.duration[tracker.indexTracker];

	    // Update display at start
	    updateDisplay();

	    // Update display after each second
	    tracker.intervalTracker = setInterval(function () {

	    	timer--;
	    	timeElapsed++;

	        // if timer reaches the end
	        if (timer === 0) {
	        	// Clear the interval
	            clearInterval(tracker.intervalTracker);

	            // Check if entire workout is complete
	            if (timeElapsed === totalTime && tracker.indexTracker === endIndex) {
	            	updateDisplay();

			    	// Display end message
			    	mainDisplay.exercise.text("COMPLETE!");
	        		
	        	} else {
	        		tracker.indexTracker++;
	        		// Run the next interval
		            countTimer(tracker.indexTracker, maxIndex);
	        	}
	        } else {
		    	updateDisplay();
	        }
	    }, 1000);

 	} else {
 		tracker.indexTracker++;
 		countTimer(tracker.indexTracker, maxIndex);
 	}

 	// Function to update main display
	function updateDisplay() {
	    // Update exercise display
		mainDisplay.exercise.text(workoutData.exercise[tracker.indexTracker]);
		
		// Update round display
		mainDisplay.round.text(Math.ceil( tracker.indexTracker / ((endIndex + 1) / rounds)) );

		// Update time display
		var minutes = parseInt(timer / 60, 10);
		var seconds = parseInt(timer % 60, 10);
	    minutes = minutes < 10 ? "0" + minutes : minutes;
	    seconds = seconds < 10 ? "0" + seconds : seconds;
	    mainDisplay.timer.text(minutes + ":" + seconds);

	    // Update progress display
	   	var progressPercent;
	    progressPercent = Math.round((timeElapsed / totalTime) * 100);
	    mainDisplay.progress.text(progressPercent + "%");
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



	if (isPaused) {
		// Save index

		// Save current time
		// Stop all intervals
		stopCurrentInterval();
		countTimer();
	} else {
		// Start running again
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

