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

		$(rdSelector).val(round);

	} else {

		var secSelector = "#" + parentId + " .timerInput .secInput";
		var seconds = parseInt($(secSelector).val());
		var minSelector = "#" + parentId + " .timerInput .minInput";
		var minutes = parseInt($(minSelector).val());
		var time = minutes * 60 + seconds;

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

		// Separate minutes and seconds
	    minutes = parseInt(time / 60, 10);
	    seconds = parseInt(time % 60, 10);
	    // Format number to 2 digit text format
	    minutes = minutes < 10 ? "0" + minutes : minutes;
	    seconds = seconds < 10 ? "0" + seconds : seconds;
	    $(minSelector).val(minutes);
	    $(secSelector).val(seconds);
	}
});


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


/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|        START/RESET BUTTON        ︳
\*________________________________*/

// Click start button
$("#startButton").click(function(){

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



function addRoutine(){
	if($("#routineInput").val() !== ""){
		// Add new exercise text from input
		var exerciseText = $("#routineInput").val();
		$("#routineContent").append("<li><span><i class='far fa-trash-alt'></i></span><span>" + exerciseText + "</span></li>");
		$("#routineInput").val("");
	}
};







init();

// Initialization
function init() {
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

jQuery(function ($) {
    var oneMinute = 60* 1 ;
        display = $('#timer');
    countTimer(oneMinute, display);
});