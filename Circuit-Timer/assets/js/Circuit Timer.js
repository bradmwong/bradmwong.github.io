var sound= true;
var isRunning = false;
var isPaused = false;



// Toggle sound button/status
$("#sound").click(function(){
	$("#sound span i").toggleClass("fa-volume-up").toggleClass("fa-volume-mute");
	sound = !sound;
});




// Click setting button
$(".settingButtons").click(function(){
	// Settings increment button animation
	var $this = $(this);
	$(this).addClass("clickDefaultSetting");
	setTimeout(function(){
		$this.removeClass("clickDefaultSetting");
	}, 200);
})


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
}







init();

// Initialization
function init() {
	// $("#pauseButton").hide();
	$("#pauseButton").css({ height: 0, opacity: 0, marginTop: "0" });
}




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
}

jQuery(function ($) {
    var oneMinute = 60* 1 ;
        display = $('#timer');
    countTimer(oneMinute, display);
});