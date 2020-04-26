var sound= true;
var isRunning = false;
var isPaused = false;



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

	var display;
	var total = 0;
	var hours = 0;
	var minutes = 0;
	var seconds;

	// Add prep time at start
	total += totalSeconds("prepareSetting");
	// Add total set time
	total += totalSeconds("setSetting") * totalRounds("roundSetting");
	// Add total rest time
	total += totalSeconds("restSetting") * totalRounds("roundSetting");

	// Separate minutes and seconds
    hours = parseInt(total / (60 * 60), 10);
    minutes = parseInt((total % (60 * 60)) / 60, 10);
    seconds = parseInt(total % 60, 10);

    // Format number to 2 digit text format
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    total >= 60 * 60 ? display = hours + ":" + minutes + ":" + seconds : display = minutes + ":" + seconds;

    // Update main display
	$('#timer').text(display);
}

// Total time in seconds
function totalSeconds(parentId) {

	var seconds = 0;
	var s1 = $("#" + parentId + " .minInput");
	var s2 = $("#" + parentId + " .secInput");

	(isNaN(s1.val()) || s1.val() <= 0) ? s1.val("00") : seconds += parseInt(s1.val() * 60); 
	(isNaN(s2.val()) || s2.val() <= 0) ? s2.val("00") : seconds += parseInt(s2.val());

	if (seconds > 60 * 60) {
		seconds = 60 * 60;
		s1.val("60");
		s2.val("00");
	} else {
		var m = parseInt(s1.val());
		var s = parseInt(s2.val());
		s1.val(	m < 10 ? "0" + m : m ); 
		s2.val(	s < 10 ? "0" + s : s ); 
	}

	return seconds;
}

// Total time in rounds
function totalRounds(parentId) {
	var rounds = 0;
	var r = $("#" + parentId + " .roundInput");

	(isNaN(r.val()) || r.val() <= 0) ? r.val("0") : rounds += parseInt(r.val()); 

	return rounds;
}

/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|          ROUTINE INPUT           ︳
\*________________________________*/

// If Enter is pressed
$("input[type='text']").keypress(function(event){
	if(event.which === 13) {
		addRoutine()
	}
});

// If add sign is clicked
$(".fa-plus").click(function(){
	addRoutine();
});

// Click on trashcan to delete exercise
$("#routineContent").on("click", "span:first-child", function(event){
	$(this).parent().fadeOut(250, function(){
		$(this).remove();
	});
	event.stopPropagation();
});

// Check off exercise to exclude
$("#routineContent").on("click", "li", function(){
	if (!isRunning) {
		$(this).toggleClass("ignored");
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
		$("#routineInputWrapper").animate({ height: 0, opacity: 0 }, 'slow');
		$("#routineContent span:first-child").hide();
		$("#pauseButton").animate({ height: 53.591, opacity: 1, marginTop: "25.8px" }, 'slow');
	} else {
		$("#settingSetup").animate({ height: 208.364, opacity: 1 }, 'slow');
		$("#routineInputWrapper").animate({ height: 52.800, opacity: 1 }, 'slow');
		$("#routineContent span:first-child").show();
		$("#pauseButton").animate({ height: 0, opacity: 0, marginTop: "0" }, 'slow');
	}
	$(".fa-plus").fadeToggle();
});


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









// Initialization
init();

// Initialization
function init() {

	// Set display time
	globalTime();

	// $("#pauseButton").hide();
	$("#pauseButton").css({ height: 0, opacity: 0, marginTop: "0" });
};




function countTimer(duration, display) {
    var timer = duration, minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.text(minutes + ":" + seconds);

        if (--timer < 0) {
            timer = duration;
        }
    }, 1000);
};

if (false) {
	jQuery(function ($) {
    var oneMinute = 60* 1 ;
        display = $('#timer');
    countTimer(oneMinute, display);
	});
}

