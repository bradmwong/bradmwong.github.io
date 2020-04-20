var sound= true;

$("#sound").click(function(){
	// Save input settings
});

// Toggle sound button/status
$("#sound").click(function(){
	$("#sound span i").toggleClass("fa-volume-up").toggleClass("fa-volume-mute");
	sound = !sound;
});

// Check Off Specific Todos By Clicking
$("#routineContent").on("click", "li", function(){
	$(this).toggleClass("completed");
});

// Click on trashcan to delete exercise
$("#routineContent").on("click", "span", function(event){
	$(this).parent().fadeOut(250, function(){
		$(this).remove();
	});
	event.stopPropagation();
});

// If Enter is pressed
$("input[type='text']").keypress(function(event){
	if(event.which === 13){
		// Grab new exercise text from input
		var exerciseText = $(this).val();
		$("#routineContent").append("<li><span><i class='far fa-trash-alt'></i></span>" + exerciseText + "</li>");
		$("#routineInput").val("");
	}
});

// Fade add button when clicked
$(".fa-plus").click(function(){
	$("input[type='text']").fadeToggle();
});








timer();

// TIMER
function beginTimer() {
    if (!isClicked) {
        timer();
        isClicked = !isClicked;
    }
}

function timer() {
    window.markDate = new Date();
    $(document).ready(function() {
        $("div.absent").toggleClass("present");
    });
    updateClock();
}

function updateClock() {  
    var currDate = new Date();
    var diff = currDate - markDate;
    document.getElementById("timer").innerHTML = format(diff/1000);
    setTimeout(function() {updateClock()}, 1000);
}

function format(seconds)
{
var numhours = parseInt(Math.floor(((seconds % 31536000) % 86400) / 3600),10);
var numminutes = parseInt(Math.floor((((seconds % 31536000) % 86400) % 3600) / 60),10);
var numseconds = parseInt((((seconds % 31536000) % 86400) % 3600) % 60,10);
    return ((numminutes<10) ? "0" + numminutes : numminutes)
    + ":" + ((numseconds<10) ? "0" + numseconds : numseconds);
}

// function format(seconds)
// {
// var numhours = parseInt(Math.floor(((seconds % 31536000) % 86400) / 3600),10);
// var numminutes = parseInt(Math.floor((((seconds % 31536000) % 86400) % 3600) / 60),10);
// var numseconds = parseInt((((seconds % 31536000) % 86400) % 3600) % 60,10);
//     return ((numhours<10) ? "0" + numhours : numhours)
//     + ":" + ((numminutes<10) ? "0" + numminutes : numminutes)
//     + ":" + ((numseconds<10) ? "0" + numseconds : numseconds);
// }