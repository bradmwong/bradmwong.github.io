let QUESTION_LIST = [];

document.querySelector('#questionButton').onclick = async () => {

    const lessonIds = ["L01", "L02", "L03a", "L03b", "L04", "L05", "L06a", "L06b", "L07", "L08", "L09a", "L09b", "L10", "L11", "L12", "L13", "L14a", "L14b", "L15", "L16"]
    const activeLessons = []

    // Get selected questions from checkboxes
    for (let i = 0; i < lessonIds.length; i++) {
        if (document.querySelector(`#${lessonIds[i]}`).checked == true) {
            activeLessons.push(lessonIds[i]);
        }
    }

    // Get selected questions
    const questionsObj = await fetch('./questions.json')
        .then((response) => response.json())
        .catch((e) => alert(`ERROR: ${e}`))
    QUESTION_LIST = questionsObj.questions.filter(obj => activeLessons.includes(obj.lesson_id));
    
    const questionOptions = document.querySelector('#questionOptions')
    questionOptions.classList.add('d-none')
    nextQuestionContainer.classList.remove('d-none')

    // Create a question
    createQuestions(QUESTION_LIST)
}

document.querySelector('#nextQuestionButton').onclick = () => {
    createQuestions(QUESTION_LIST)
}

function createQuestions(questions) {

    const questionList = document.querySelector('#questionList');
    const questionIndex = Math.floor(Math.random() * questions.length);
    const question = questions[questionIndex];
    const questionId = `${question.lesson_id} - ${question.question_id}`;
    const questionText = question.question;
    const answers = question.answers;

    // Clear question list
    if (questionList) {
        while (questionList.firstChild) {
            questionList.removeChild(questionList.firstChild);
        }
    }

    // Add question ID
    const questionIdItem = document.createElement('li');
    questionIdItem.className = 'list-group-item list-group-item-dark text-black border border-dark-subtle';
    questionIdItem.textContent = questionId;
    questionList.appendChild(questionIdItem);

    // Add question content
    const questionTextItem = document.createElement('li');
    questionTextItem.className = 'list-group-item list-group-item-dark text-black fw-medium border border-dark-subtle';
    questionTextItem.style.minHeight = '138px';
    questionTextItem.style.backgroundColor = 'gainsboro';
    questionTextItem.textContent = questionText;
    questionList.appendChild(questionTextItem);

    // Add answers
    answers.forEach(item => {
        const listItem = document.createElement('li');
        if (item.is_correct) {
            listItem.className = 'list-group-item list-group-item-success text-black fw-medium border border-dark-subtle';
            listItem.style.backgroundColor = 'yellowGreen';
        } else {
            listItem.className = 'list-group-item list-group-item-light';
        }
        listItem.textContent = item.option;
        questionList.appendChild(listItem);
    })
}
