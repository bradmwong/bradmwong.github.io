let settings = {
    maxNum: 20,
    totalQuestions: 15,
    totalTime: 60,
    isVertical: true,
    isHorizontal: true
}

let game = {
    timeElapsed: 0,
    correct: 0,
    wrong: 0,
    iQuestions: 0
}

setupGame();

function setupGame() {

    $('#defaultMax').text(settings.maxNum);
    $('#defaultTotal').text(settings.totalQuestions);
    $('#defaultTime').text(settings.totalTime);

    updateUI();
    updateSettingsUI();

    $('#verticalQuestion').hide();
    $('#horizontalQuestion').hide();
    $('#scoreBoard').hide();
    $('#gameButtonContainer').hide();
    
    $('#defaultSettings').show();
    $('#startContainer').show();
}

function updateSettingsUI() {
    $('#maxNumberInput').val(settings.maxNum);
    $('#totalQuestionsInput').val(settings.totalQuestions);
    $('#timeLimitInput').val(settings.totalTime);
}

function updateUI() {
    $('#timer').text(settings.totalTime);
    $('#scoreMax').text(settings.totalQuestions);
    $('#scoreCurrent').text(`${game.correct} / ${game.iQuestions}`);
}

function updateSettings() {
    settings.maxNum = $('#maxNumberInput').val();
    settings.totalQuestions = $('#totalQuestionsInput').val();
    settings.totalTime = $('#timeLimitInput').val();

    settings.isVertical = $('#verticalInput').is(':checked');
    settings.isHorizontal = $('#horizontalInput').is(':checked');

    timeReset();
    resetGame();
    setupGame();
}

/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|            CONTROLS               ︳
\*________________________________*/

// START BUTTON
$('#startButton').click(function () {
    $('#defaultSettings').hide();
    $('#startContainer').hide();
    $('#gameButtonContainer').show();
    $('#scoreBoard').hide();

    timeReset();
    timeStart();
    updateScoreIcon();

    newQuestion(settings.maxNum, settings.isVertical, settings.isHorizontal);
})

// CORRECT BUTTON
$('#correctButton').click(function () {

    game.correct++;
    game.iQuestions++;

    updateScoreIcon();
    isComplete();
})

// WRONG BUTTON
$('#wrongButton').click(async function () {

    game.wrong++;
    game.iQuestions++;

    updateScoreIcon();
    isComplete();
})

// SKIP BUTTON
$('#skipButton').click(function () {
    newQuestion(settings.maxNum, settings.isVertical, settings.isHorizontal);
})

updateScoreIcon = () => {
    $('#scoreCurrent').text(`${game.correct} / ${game.iQuestions}`);
}

isComplete = () => {
    if (game.iQuestions >= settings.totalQuestions) {
        timePause();
        showScore();
        resetGame();
    } else {
        newQuestion(settings.maxNum, settings.isVertical, settings.isHorizontal);
    }
}

showScore = () => {
    $("#verticalQuestion").hide();
    $("#horizontalQuestion").hide();
    $('#gameButtonContainer').hide();

    $('#scoreRight').text(game.correct);
    $('#scoreWrong').text(game.wrong);
    $('#scorePercent').text(Math.round((game.correct / game.iQuestions) * 100));

    $("#scoreBoard").show();
    $('#startContainer').show();
}

resetGame = () => {
    game.timeElapsed = 0,
        game.correct = 0,
        game.wrong = 0,
        game.iQuestions = 0
}


/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|         UPDATE QUESTION           ︳
\*________________________________*/

function newQuestion(max, isV, isH) {

    const numbers = generateNumbers(max);
    const options = [];
    let format = 0;

    if (isV) { options.push('vertical') };
    if (isH) { options.push('horizontal') };
    format = options[Math.floor(Math.random() * options.length)];


    if (format === 'vertical') {
        // Vertical format
        $('#num1_v').text(numbers.first);
        $('#num2_v').text(numbers.second);

        let pShift = 10;
        if (String(numbers.first).length > String(numbers.second).length) {
            pShift = pShift + (String(numbers.first).length - String(numbers.second).length) * 62.125;
            $('#plus_v').css('margin-right', pShift);
        } else {
            $('#plus_v').css('margin-right', pShift);
        }

        $('#horizontalQuestion').hide();
        $('#verticalQuestion').show();

    } else if (format === 'horizontal') {
        // Horizontal format
        $('#num1_h').text(numbers.first);
        $('#num2_h').text(numbers.second);

        $('#verticalQuestion').hide();
        $('#horizontalQuestion').show();
    }
}

function generateNumbers(maxAns) {
    const ans = Math.floor(Math.random() * maxAns + 1);
    const num1 = Math.floor(Math.random() * ans);
    const num2 = ans - num1;
    return { Answer: ans, first: num1, second: num2 };
}


/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|              CANVAS               ︳
\*________________________________*/

// Ref: https://fellowtuts.com/bootstrap/off-canvas-sidebar-menu-wordpress/

jQuery(document).ready(function ($) {
    $(document).on('click', '.pull-bs-canvas-right, .pull-bs-canvas-left', function () {
        $('body').prepend('<div class="bs-canvas-overlay bg-dark position-fixed w-100 h-100"></div>');
        if ($(this).hasClass('pull-bs-canvas-right'))
            $('.bs-canvas-right').addClass('mr-0');
        else
            $('.bs-canvas-left').addClass('ml-0');
        return false;
    });

    $(document).on('click', '.bs-canvas-close, .bs-canvas-overlay', function () {
        var elm = $(this).hasClass('bs-canvas-close') ? $(this).closest('.bs-canvas') : $('.bs-canvas');
        elm.removeClass('mr-0 ml-0');
        $('.bs-canvas-overlay').remove();
        return false;
    });
});

/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|              TIMER                ︳
\*________________________________*/

// Ref: http://jsfiddle.net/XcvaE/4/

{/* <input type="button" value="Start" onclick="timeStart()"> */ }
{/* <input type="button" value="Stop" onclick="timePause()"> */ }
{/* <input type="button" value="Reset" onclick="timeReset()"> */ }

var t, count;
var blink;

function timeDisplay() {
    // displays time in span
    $('#timer').html(count);
};

function timeStart() {
    // time start
    if (count == 0) {
        timeupAlert();
    } else {
        timeDisplay();
        count--;
        t = setTimeout("timeStart()", 1000);
    }
};

function timePause() {
    // pauses timeStart
    clearTimeout(t);
};

function timeReset() {
    // resets timeStart
    timePause();
    count = settings.totalTime;
    timeDisplay();

    timerDefault();
};

function timeupAlert() {

    let i = 0;

    $('#timer').html("Time's Up");
    blink = setInterval(function () {

        if (i % 2 === 0) {
            $('#timerContainer').css('background-color', '#ffbaba');
        } else {
            $('#timerContainer').css('background-color', '#fff');
        }
        i++;
    }, 1000)
}

function timerDefault() {
    $('#timerContainer').css('background-color', '#fff');
    clearInterval(blink);
}

/*‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾*\
|           CANVAS FORM             ︳
\*________________________________*/

// Ref: https://jsfiddle.net/vyspiansky/ph4f3s9x/

(function () {
    function addValidation(checkboxes) {
        const firstCheckbox = getFirstCheckbox(checkboxes);

        if (firstCheckbox) {
            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].addEventListener('change', function () {
                    checkValidity(checkboxes, firstCheckbox);
                });
            }

            checkValidity(checkboxes, firstCheckbox);
        }
    }

    function getFirstCheckbox(checkboxes) {
        return checkboxes.length > 0 ? checkboxes[0] : null;
    }

    function isChecked(checkboxes) {
        for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) return true;
        }

        return false;
    }

    function checkValidity(checkboxes, firstCheckbox) {
        const errorMessage = !isChecked(checkboxes) ? 'At least one checkbox must be selected.' : '';
        firstCheckbox.setCustomValidity(errorMessage);
    }

    const form = document.querySelector('#sectionForm');

    // Let's add a validation for the first group of checkboxes
    const checkboxes = form.querySelectorAll('input[name="section"]');
    addValidation(checkboxes);

    // another group of checkboxes
    const subCheckboxes = form.querySelectorAll('input[name="sub_section"]');
    addValidation(subCheckboxes);
})();
