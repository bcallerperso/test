const rounds = [
  {
    prompt: "🍎 Choose the correct sentence.",
    choices: [
      { label: "She likes apples.", correct: true },
      { label: "She like apples.", correct: false },
      { label: "She don't like apples.", correct: false }
    ],
    explanation: "Avec she/he, on met -s au verbe: likes."
  },
  {
    prompt: "🥞 Complete: Mr Wolf ___ pancakes.",
    choices: [
      { label: "likes", correct: true },
      { label: "like", correct: false },
      { label: "doesn't like", correct: false }
    ],
    explanation: "Mr Wolf = he, donc likes."
  },
  {
    prompt: "🐟 Ask a question: ___ you like fish and chips?",
    choices: [
      { label: "Do", correct: true },
      { label: "Does", correct: false },
      { label: "Can", correct: false }
    ],
    explanation: "Avec you, on utilise Do."
  },
  {
    prompt: "🍋 Choose the best answer.",
    choices: [
      { label: "I don't like lemons.", correct: true },
      { label: "I doesn't like lemons.", correct: false },
      { label: "I not like lemons.", correct: false }
    ],
    explanation: "Forme négative: I don't like..."
  },
  {
    prompt: "🧁 Complete: He ___ cake.",
    choices: [
      { label: "likes", correct: true },
      { label: "like", correct: false },
      { label: "don't like", correct: false }
    ],
    explanation: "He + likes."
  },
  {
    prompt: "🥕 Pick the correct sentence.",
    choices: [
      { label: "We like vegetables.", correct: true },
      { label: "We likes vegetables.", correct: false },
      { label: "We doesn't like vegetables.", correct: false }
    ],
    explanation: "Avec we, le verbe reste like."
  },
  {
    prompt: "📖 Story time: ___ does the story happen?",
    choices: [
      { label: "When", correct: true },
      { label: "Where", correct: false },
      { label: "Who", correct: false }
    ],
    explanation: "When = quand."
  },
  {
    prompt: "🌲 Story answer: It happens ___ a wood.",
    choices: [
      { label: "in", correct: true },
      { label: "on", correct: false },
      { label: "at", correct: false }
    ],
    explanation: "On dit in a wood."
  },
  {
    prompt: "🙋 Choose the right request.",
    choices: [
      { label: "Can you help me write my shopping list?", correct: true },
      { label: "Can you helps me write my shopping list?", correct: false },
      { label: "Do you help me write my shopping list?", correct: false }
    ],
    explanation: "Can you + verbe sans -s."
  },
  {
    prompt: "🍫 Complete: They ___ chocolate biscuits.",
    choices: [
      { label: "like", correct: true },
      { label: "likes", correct: false },
      { label: "doesn't like", correct: false }
    ],
    explanation: "They + like."
  }
];

const starsByScore = [
  { limit: 4, text: "🌟 Petite étoile" },
  { limit: 7, text: "🌟🌟 Super étoile" },
  { limit: 10, text: "🌟🌟🌟 English Hero" }
];

const app = {
  score: 0,
  streak: 0,
  index: -1,
  answered: false,
  badges: new Set()
};

const scoreValue = document.getElementById("score-value");
const streakValue = document.getElementById("streak-value");
const roundLabel = document.getElementById("round-label");
const questionTitle = document.getElementById("question-title");
const questionText = document.getElementById("question-text");
const optionGrid = document.getElementById("option-grid");
const feedback = document.getElementById("feedback");
const nextButton = document.getElementById("next-button");
const progressBar = document.getElementById("progress-bar");
const badgesContainer = document.getElementById("badges");
const speakButton = document.getElementById("speak-button");

function updateMeta() {
  scoreValue.textContent = String(app.score);
  streakValue.textContent = String(app.streak);
  progressBar.style.width = `${((app.index + 1) / rounds.length) * 100}%`;
}

function updateBadges() {
  if (app.badges.size === 0) {
    badgesContainer.innerHTML = '<span class="badge empty">Pas encore de trophée</span>';
    return;
  }

  badgesContainer.innerHTML = "";
  app.badges.forEach((badge) => {
    const chip = document.createElement("span");
    chip.className = "badge";
    chip.textContent = badge;
    badgesContainer.appendChild(chip);
  });
}

function checkForBadgeUnlock() {
  if (app.streak >= 3) {
    app.badges.add("🔥 Série de 3");
  }
  if (app.streak >= 5) {
    app.badges.add("🚀 Série de 5");
  }
  if (app.score >= 8) {
    app.badges.add("🎯 Grammaire pro");
  }
  updateBadges();
}

function setFeedback(text, type) {
  feedback.textContent = text;
  feedback.className = `feedback ${type}`;
}

function speakCurrentText() {
  const round = rounds[app.index];
  if (!window.speechSynthesis || !round) {
    return;
  }

  const message = `${round.prompt} ${round.choices.map((choice) => choice.label).join(". ")}`;
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "en-GB";
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function renderRound() {
  const round = rounds[app.index];
  app.answered = false;
  roundLabel.textContent = `Mission ${app.index + 1} / ${rounds.length}`;
  questionTitle.textContent = "Choisis la bonne réponse";
  questionText.textContent = round.prompt;
  setFeedback("", "");
  nextButton.disabled = true;
  optionGrid.innerHTML = "";

  round.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.className = "option-button";
    button.type = "button";
    button.textContent = choice.label;
    button.addEventListener("click", () => handleAnswer(button, choice.correct, round.explanation));
    optionGrid.appendChild(button);
  });

  updateMeta();
}

function handleAnswer(button, isCorrect, explanation) {
  if (app.answered) {
    return;
  }

  app.answered = true;
  const allButtons = Array.from(optionGrid.querySelectorAll(".option-button"));
  allButtons.forEach((item) => {
    item.disabled = true;
    const isItemCorrect = rounds[app.index].choices.find((choice) => choice.label === item.textContent)?.correct;
    if (isItemCorrect) {
      item.classList.add("good");
    }
  });

  if (!isCorrect) {
    button.classList.add("bad");
    app.streak = 0;
    setFeedback(`Presque ! ${explanation}`, "error");
  } else {
    app.score += 1;
    app.streak += 1;
    setFeedback(`Bravo ! ${explanation}`, "ok");
  }

  checkForBadgeUnlock();
  updateMeta();
  nextButton.disabled = false;
}

function renderEndScreen() {
  optionGrid.innerHTML = "";
  roundLabel.textContent = "Mission terminée";
  questionTitle.textContent = "🎉 Super travail !";

  const starLine = starsByScore.find((item) => app.score <= item.limit)?.text ?? "🌟🌟🌟 English Hero";
  questionText.textContent = `Score final: ${app.score}/${rounds.length} — ${starLine}`;
  setFeedback("Tu peux rejouer pour battre ton record !", "ok");
  nextButton.textContent = "Rejouer";
  nextButton.disabled = false;
  updateMeta();
}

function nextRound() {
  if (app.index >= rounds.length - 1) {
    app.index = -1;
    app.score = 0;
    app.streak = 0;
    app.badges = new Set();
    nextButton.textContent = "Suivant";
    updateBadges();
    updateMeta();
  }

  app.index += 1;
  if (app.index < rounds.length) {
    renderRound();
    return;
  }

  renderEndScreen();
}

nextButton.addEventListener("click", nextRound);
speakButton.addEventListener("click", speakCurrentText);

updateBadges();
updateMeta();
