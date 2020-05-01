var sound= true;
var isRunning = false;
var isPaused = false;

var prepTime;
var setTime;
var restTime;
var rounds;

// Per round
var exerciseList = [];
var ignoredList = [];
var exerciseQtyTotal = 0;
var exerciseQtyActive = 0;

// Overall exercise routine
var maxIndex = 0;



// Timer variables
var timeElapsed = 0;
var intervalTracker;
var display = $('#timer');

// Workout
var workout = {
	exercise: [],
	duration: [],
	ignored: []
};

function startTimer() {

	prepTime = totalSeconds("prepareSetting");
	setTime = totalSeconds("setSetting");
	restTime = totalSeconds("restSetting");
	rounds = totalRounds("roundSetting");

	globalTime();

	defineWorkout();
}

function defineWorkout() {

	var isIgnored;

	// Reset workout
	workout = {
		exercise: [],
		duration: [],
		ignored: []
	};

	// Set Prep Intervals
	workout.exercise[0] = "prepare";
	workout.duration[0] = prepTime;
	prepTime > 0 ? isIgnored = false : isIgnored = true;
	workout.ignored[0] = isIgnored;

	// Set Exercise/Rest Intervals
	if (rounds > 0 && exerciseQtyActive > 0) {
		maxIndex = exerciseQtyTotal * 2 * rounds - 1;
		console.log(maxIndex);

		// Loops through rounds
		var index = 0;
		for (var r = 0; r < rounds; r++) {
			
			// Loops through exercises
			var subIndex = 0;
			for (var i = 1; i <= exerciseQtyTotal; i++) {

				// Define Exercise Intervals
				index++;
				workout.exercise[index] = exerciseList[subIndex];
				workout.duration[index] = setTime;
				(setTime > 0 && !ignoredList[subIndex]) ? isIgnored = false : isIgnored = true;
				workout.ignored[index] = isIgnored;

				// Define Rest Intervals
				index++;
				if (index < maxIndex) {
					workout.exercise[index] = "Rest";
					workout.duration[index] = restTime;
					restTime > 0 ? isIgnored = false : isIgnored = true;
					workout.ignored[index] = isIgnored;
				} else {
					break;
				}
				
				subIndex === (exerciseQtyTotal - 1) ? subIndex = 0 : subIndex++;
			}
		}		
	}



	console.log("exercise: " + workout.exercise);
	// console.log("exercise length: " + workout.exercise.length);
	console.log("duration: " + workout.duration);
	// console.log("duration length: " + workout.duration.length);
	console.log("ignored: " + workout.ignored);
	// console.log("ignored length: " + workout.ignored.length);

}


/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|          INITALIZATION           ︳
\*________________________________*/

// Initialization
init();

// Initialization
function init() {

	// Set display time
	globalTime();

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
			if (time > 60 * 60) {
				time = 60 * 60;
			} else {
				// Add/subract based on button clicked
				if (parentClass.indexOf("addTime") >= 0) {
					time >= 60 * 60 ? time = 60 * 60 : time++;
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
	var seconds;
	
	// Array of all routine exercises
	exerciseList = routineArray();
	exerciseQtyTotal = exerciseList.length;

	// Array of active exercises
	ignoredList = ignoredArray();
	exerciseQtyActive = exerciseQtyTotal - occurancesInArray(ignoredList, true);

	// Calculate total workout time in seconds
	// Add prep time at start
	total += totalSeconds("prepareSetting");
	// Add total set time
	total += totalSeconds("setSetting") * totalRounds("roundSetting") * exerciseQtyActive;
	// Add total rest time
	total += totalSeconds("restSetting") * totalRounds("roundSetting") * exerciseQtyActive;
	// Subtract the last rest time
	if (totalRounds("roundSetting") > 0 && exerciseQtyActive > 0) {
		total -= totalSeconds("restSetting");
	}

	// Separate minutes and seconds
    hours = parseInt(total / (60 * 60), 10);
    minutes = parseInt((total % (60 * 60)) / 60, 10);
    seconds = parseInt(total % 60, 10);

    // Format number to 2 digit text format
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    total >= 60 * 60 ? displayTime = hours + ":" + minutes + ":" + seconds : displayTime = minutes + ":" + seconds;

    // Update main display
	$('#timer').text(displayTime);

	// Return total value in seconds
	return total;
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
	}


});










// function startTimer() {

// 	intervalTracker = countTimer(prepTime);

// }



function countTimer(duration) {
    var timer = duration, minutes, seconds;
    var stop = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.text(minutes + ":" + seconds);

        if (--timer < 0) {
            // Timer ends
            clearInterval(stop);
            
            // timer = duration;
        }

        timeElapsed++;
        console.log(timeElapsed);
    }, 1000);

    return stop;
};

if (false) {
	jQuery(function ($) {
    var oneMinute = 60* 1;
        display = $('#timer');
    countTimer(oneMinute, display);
	});
}





function stopCurrentInterval() {
	clearInterval(intervalTracker);
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
	if (seconds > 60 * 60) {
		seconds = 60 * 60;
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

