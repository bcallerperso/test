const PROFILE_STORAGE_KEY = "elsaEnglishProfileV1";
const DAILY_STORAGE_KEY = "elsaDailyWordsV1";

const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));

const profileState = {
  name: "Elsa",
  hair: "wavy",
  eyes: "classic",
  nose: "small",
  mouth: "smile",
  outfit: "purple_shirt"
};

const avatarCatalog = {
  hair: [
    { id: "wavy", label: "Ondulés", render: "~ ~ ~" },
    { id: "ponytail", label: "Queue de cheval", render: "~o~" },
    { id: "short", label: "Courts", render: "^^^" },
    { id: "curly", label: "Bouclés", render: "@@@@" }
  ],
  eyes: [
    { id: "classic", label: "Ronds", render: "o o" },
    { id: "sparkle", label: "Brillants", render: "* *" },
    { id: "happy", label: "Souriants", render: "^ ^" },
    { id: "sleepy", label: "Calmes", render: "- -" }
  ],
  nose: [
    { id: "small", label: "Petit", render: "^" },
    { id: "round", label: "Rond", render: "o" },
    { id: "button", label: "Bouton", render: "." }
  ],
  mouth: [
    { id: "smile", label: "Sourire", render: "u" },
    { id: "big_smile", label: "Grand sourire", render: "w" },
    { id: "surprised", label: "Surprise", render: "o" }
  ],
  outfit: [
    { id: "purple_shirt", label: "T-shirt violet", render: "T-shirt violet" },
    { id: "dress", label: "Robe étoilée", render: "Robe étoilée" },
    { id: "chef", label: "Tablier de chef", render: "Tablier de chef" },
    { id: "sport", label: "Tenue sport", render: "Tenue sport" }
  ]
};

const profileGreeting = document.getElementById("profile-greeting");
const childNameInput = document.getElementById("child-name-input");
const saveProfileButton = document.getElementById("save-profile-button");

const avatarRenders = {
  hair: document.getElementById("avatar-hair-render"),
  eyes: document.getElementById("avatar-eyes-render"),
  nose: document.getElementById("avatar-nose-render"),
  mouth: document.getElementById("avatar-mouth-render"),
  outfit: document.getElementById("avatar-outfit-render")
};

const avatarOptionContainers = {
  hair: document.getElementById("hair-options"),
  eyes: document.getElementById("eyes-options"),
  nose: document.getElementById("nose-options"),
  mouth: document.getElementById("mouth-options"),
  outfit: document.getElementById("outfit-options")
};

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.tabTarget;
    tabButtons.forEach((item) => item.classList.remove("active"));
    tabPanels.forEach((panel) => panel.classList.remove("active"));
    button.classList.add("active");
    document.getElementById(targetId)?.classList.add("active");
  });
});

function loadProfile() {
  const storedRaw = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!storedRaw) {
    return;
  }

  try {
    const stored = JSON.parse(storedRaw);
    profileState.name = stored.name || "Elsa";
    profileState.hair = stored.hair || profileState.hair;
    profileState.eyes = stored.eyes || profileState.eyes;
    profileState.nose = stored.nose || profileState.nose;
    profileState.mouth = stored.mouth || profileState.mouth;
    profileState.outfit = stored.outfit || profileState.outfit;
  } catch {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  }
}

function saveProfile() {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileState));
}

function optionById(part, id) {
  return avatarCatalog[part].find((item) => item.id === id);
}

function updateProfileView() {
  childNameInput.value = profileState.name;
  profileGreeting.textContent = `Hello ${profileState.name}! Let's learn English.`;
  avatarRenders.hair.textContent = optionById("hair", profileState.hair).render;
  avatarRenders.eyes.textContent = optionById("eyes", profileState.eyes).render;
  avatarRenders.nose.textContent = optionById("nose", profileState.nose).render;
  avatarRenders.mouth.textContent = optionById("mouth", profileState.mouth).render;
  avatarRenders.outfit.textContent = optionById("outfit", profileState.outfit).render;

  Object.keys(avatarOptionContainers).forEach((part) => {
    const buttons = avatarOptionContainers[part].querySelectorAll(".chip-button");
    buttons.forEach((button) => {
      button.classList.toggle("active", button.dataset.value === profileState[part]);
    });
  });
}

function renderAvatarOptions() {
  Object.keys(avatarOptionContainers).forEach((part) => {
    const container = avatarOptionContainers[part];
    container.innerHTML = "";

    avatarCatalog[part].forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chip-button";
      button.dataset.value = option.id;
      button.textContent = option.label;
      button.addEventListener("click", () => {
        profileState[part] = option.id;
        updateProfileView();
        saveProfile();
      });
      container.appendChild(button);
    });
  });
}

saveProfileButton.addEventListener("click", () => {
  const safeName = childNameInput.value.trim() || "Elsa";
  profileState.name = safeName.slice(0, 20);
  updateProfileView();
  saveProfile();
});

childNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    saveProfileButton.click();
  }
});

const missionRounds = [
  {
    prompt: "Choose the correct sentence.",
    choices: [
      { label: "She likes apples.", correct: true },
      { label: "She like apples.", correct: false },
      { label: "She don't like apples.", correct: false }
    ],
    explanation: "Avec she/he, on met -s au verbe: likes."
  },
  {
    prompt: "Complete: Mr Wolf ___ pancakes.",
    choices: [
      { label: "likes", correct: true },
      { label: "like", correct: false },
      { label: "doesn't like", correct: false }
    ],
    explanation: "Mr Wolf = he, donc likes."
  },
  {
    prompt: "Ask a question: ___ you like fish and chips?",
    choices: [
      { label: "Do", correct: true },
      { label: "Does", correct: false },
      { label: "Can", correct: false }
    ],
    explanation: "Avec you, on utilise Do."
  },
  {
    prompt: "Choose the best answer.",
    choices: [
      { label: "I don't like lemons.", correct: true },
      { label: "I doesn't like lemons.", correct: false },
      { label: "I not like lemons.", correct: false }
    ],
    explanation: "Forme négative: I don't like..."
  },
  {
    prompt: "Complete: He ___ cake.",
    choices: [
      { label: "likes", correct: true },
      { label: "like", correct: false },
      { label: "don't like", correct: false }
    ],
    explanation: "He + likes."
  },
  {
    prompt: "Pick the correct sentence.",
    choices: [
      { label: "We like vegetables.", correct: true },
      { label: "We likes vegetables.", correct: false },
      { label: "We doesn't like vegetables.", correct: false }
    ],
    explanation: "Avec we, le verbe reste like."
  },
  {
    prompt: "Story time: ___ does the story happen?",
    choices: [
      { label: "When", correct: true },
      { label: "Where", correct: false },
      { label: "Who", correct: false }
    ],
    explanation: "When = quand."
  },
  {
    prompt: "Story answer: It happens ___ a wood.",
    choices: [
      { label: "in", correct: true },
      { label: "on", correct: false },
      { label: "at", correct: false }
    ],
    explanation: "On dit in a wood."
  },
  {
    prompt: "Choose the right request.",
    choices: [
      { label: "Can you help me write my shopping list?", correct: true },
      { label: "Can you helps me write my shopping list?", correct: false },
      { label: "Do you help me write my shopping list?", correct: false }
    ],
    explanation: "Can you + verbe sans -s."
  },
  {
    prompt: "Complete: They ___ chocolate biscuits.",
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

const missionState = {
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

function updateMissionMeta() {
  scoreValue.textContent = String(missionState.score);
  streakValue.textContent = String(missionState.streak);
  const width = Math.max(0, ((missionState.index + 1) / missionRounds.length) * 100);
  progressBar.style.width = `${width}%`;
}

function updateBadges() {
  if (missionState.badges.size === 0) {
    badgesContainer.innerHTML = '<span class="badge empty">Pas encore de trophée</span>';
    return;
  }

  badgesContainer.innerHTML = "";
  missionState.badges.forEach((badge) => {
    const chip = document.createElement("span");
    chip.className = "badge";
    chip.textContent = badge;
    badgesContainer.appendChild(chip);
  });
}

function checkForBadgeUnlock() {
  if (missionState.streak >= 3) {
    missionState.badges.add("🔥 Série de 3");
  }
  if (missionState.streak >= 5) {
    missionState.badges.add("🚀 Série de 5");
  }
  if (missionState.score >= 8) {
    missionState.badges.add("🎯 Grammaire pro");
  }
  updateBadges();
}

function setMissionFeedback(text, type) {
  feedback.textContent = text;
  feedback.className = `feedback ${type}`;
}

function speakCurrentText() {
  const round = missionRounds[missionState.index];
  if (!window.speechSynthesis || !round) {
    return;
  }

  const message = `${round.prompt} ${round.choices.map((choice) => choice.label).join(". ")}`;
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "en-GB";
  utterance.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function renderMissionRound() {
  const round = missionRounds[missionState.index];
  missionState.answered = false;
  nextButton.textContent = "Suivant";
  roundLabel.textContent = `Mission ${missionState.index + 1} / ${missionRounds.length}`;
  questionTitle.textContent = "Choisis la bonne réponse";
  questionText.textContent = round.prompt;
  setMissionFeedback("", "");
  nextButton.disabled = true;
  optionGrid.innerHTML = "";

  round.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.className = "option-button";
    button.type = "button";
    button.textContent = choice.label;
    button.addEventListener("click", () => handleMissionAnswer(button, choice.correct, round.explanation));
    optionGrid.appendChild(button);
  });

  updateMissionMeta();
}

function handleMissionAnswer(button, isCorrect, explanation) {
  if (missionState.answered) {
    return;
  }

  missionState.answered = true;
  const allButtons = Array.from(optionGrid.querySelectorAll(".option-button"));
  allButtons.forEach((item) => {
    item.disabled = true;
    const isItemCorrect = missionRounds[missionState.index].choices.find((choice) => choice.label === item.textContent)?.correct;
    if (isItemCorrect) {
      item.classList.add("good");
    }
  });

  if (!isCorrect) {
    button.classList.add("bad");
    missionState.streak = 0;
    setMissionFeedback(`Presque ! ${explanation}`, "error");
  } else {
    missionState.score += 1;
    missionState.streak += 1;
    setMissionFeedback(`Bravo ${profileState.name} ! ${explanation}`, "ok");
  }

  checkForBadgeUnlock();
  updateMissionMeta();
  nextButton.disabled = false;
}

function renderMissionEndScreen() {
  optionGrid.innerHTML = "";
  missionState.index = missionRounds.length;
  roundLabel.textContent = "Mission terminée";
  questionTitle.textContent = `🎉 Super travail ${profileState.name} !`;

  const starLine = starsByScore.find((item) => missionState.score <= item.limit)?.text ?? "🌟🌟🌟 English Hero";
  questionText.textContent = `Score final: ${missionState.score}/${missionRounds.length} — ${starLine}`;
  setMissionFeedback("Tu peux rejouer pour battre ton record !", "ok");
  nextButton.textContent = "Rejouer";
  nextButton.disabled = false;
  updateMissionMeta();
}

function resetMissionGame() {
  missionState.index = 0;
  missionState.score = 0;
  missionState.streak = 0;
  missionState.badges = new Set();
  missionState.answered = false;
  updateBadges();
  updateMissionMeta();
}

function nextMissionRound() {
  if (missionState.index === -1) {
    missionState.index = 0;
    renderMissionRound();
    return;
  }

  if (missionState.index >= missionRounds.length) {
    resetMissionGame();
    renderMissionRound();
    return;
  }

  missionState.index += 1;
  if (missionState.index === missionRounds.length) {
    renderMissionEndScreen();
    return;
  }

  renderMissionRound();
}

nextButton.addEventListener("click", nextMissionRound);
speakButton.addEventListener("click", speakCurrentText);

const sprintState = {
  index: -1,
  score: 0,
  currentRound: null
};

const sprintQuestion = document.getElementById("sprint-question");
const sprintDo = document.getElementById("sprint-do");
const sprintDoes = document.getElementById("sprint-does");
const sprintFeedback = document.getElementById("sprint-feedback");
const sprintNext = document.getElementById("sprint-next");

const sprintRounds = [
  { text: "___ you like bananas?", answer: "do" },
  { text: "___ he play football?", answer: "does" },
  { text: "___ they like pasta?", answer: "do" },
  { text: "___ she cook pancakes?", answer: "does" },
  { text: "___ we have a story today?", answer: "do" }
];

function startSprint() {
  sprintState.index = 0;
  sprintState.score = 0;
  sprintFeedback.textContent = "";
  sprintFeedback.className = "feedback";
  sprintNext.textContent = "Question suivante";
  loadSprintRound();
}

function loadSprintRound() {
  sprintState.currentRound = sprintRounds[sprintState.index];
  sprintQuestion.textContent = `${sprintState.index + 1}/${sprintRounds.length} - ${sprintState.currentRound.text}`;
  sprintDo.disabled = false;
  sprintDoes.disabled = false;
}

function handleSprintAnswer(value) {
  if (!sprintState.currentRound) {
    return;
  }

  sprintDo.disabled = true;
  sprintDoes.disabled = true;
  const ok = sprintState.currentRound.answer === value;
  if (ok) {
    sprintState.score += 1;
    sprintFeedback.textContent = "Bravo!";
    sprintFeedback.className = "feedback ok";
  } else {
    sprintFeedback.textContent = `Presque! Réponse: ${sprintState.currentRound.answer.toUpperCase()}`;
    sprintFeedback.className = "feedback error";
  }
}

function nextSprintRound() {
  if (sprintState.index < 0) {
    startSprint();
    return;
  }

  sprintState.index += 1;
  if (sprintState.index >= sprintRounds.length) {
    sprintQuestion.textContent = `Sprint fini: ${sprintState.score}/${sprintRounds.length}`;
    sprintFeedback.textContent = "Super! Tu peux relancer le sprint.";
    sprintFeedback.className = "feedback ok";
    sprintDo.disabled = true;
    sprintDoes.disabled = true;
    sprintState.index = -1;
    sprintState.currentRound = null;
    sprintNext.textContent = "Relancer sprint";
    return;
  }

  loadSprintRound();
}

sprintDo.addEventListener("click", () => handleSprintAnswer("do"));
sprintDoes.addEventListener("click", () => handleSprintAnswer("does"));
sprintNext.addEventListener("click", nextSprintRound);
sprintDo.disabled = true;
sprintDoes.disabled = true;

const builderPrompt = document.getElementById("builder-prompt");
const builderOptions = document.getElementById("builder-options");
const builderFeedback = document.getElementById("builder-feedback");
const builderNext = document.getElementById("builder-next");

const builderState = {
  index: -1
};

const builderRounds = [
  {
    prompt: "Choisis la phrase correcte pour parler d'elle.",
    choices: ["She likes oranges.", "She like oranges.", "She don't like oranges."],
    answer: "She likes oranges."
  },
  {
    prompt: "Choisis la bonne phrase négative.",
    choices: ["I don't like milk.", "I doesn't like milk.", "I not like milk."],
    answer: "I don't like milk."
  },
  {
    prompt: "Choisis la bonne question.",
    choices: ["Do you like fish and chips?", "Does you like fish and chips?", "Are you like fish and chips?"],
    answer: "Do you like fish and chips?"
  }
];

function renderBuilderRound() {
  const round = builderRounds[builderState.index];
  builderPrompt.textContent = `${builderState.index + 1}/${builderRounds.length} - ${round.prompt}`;
  builderOptions.innerHTML = "";
  builderFeedback.textContent = "";
  builderFeedback.className = "feedback";
  builderNext.disabled = true;
  builderNext.textContent = "Suivant";

  round.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-button";
    button.textContent = choice;
    button.addEventListener("click", () => {
      const correct = choice === round.answer;
      Array.from(builderOptions.querySelectorAll(".option-button")).forEach((item) => {
        item.disabled = true;
        if (item.textContent === round.answer) {
          item.classList.add("good");
        }
      });
      if (!correct) {
        button.classList.add("bad");
        builderFeedback.textContent = "Presque, regarde la correction en vert.";
        builderFeedback.className = "feedback error";
      } else {
        builderFeedback.textContent = "Bravo!";
        builderFeedback.className = "feedback ok";
      }
      builderNext.disabled = false;
    });
    builderOptions.appendChild(button);
  });
}

function nextBuilderRound() {
  if (builderState.index < 0) {
    builderState.index = 0;
    renderBuilderRound();
    return;
  }

  builderState.index += 1;
  if (builderState.index >= builderRounds.length) {
    builderPrompt.textContent = "Builder terminé! Tu maîtrises de mieux en mieux le présent.";
    builderOptions.innerHTML = "";
    builderFeedback.textContent = "Relance quand tu veux.";
    builderFeedback.className = "feedback ok";
    builderState.index = -1;
    builderNext.textContent = "Relancer builder";
    builderNext.disabled = false;
    return;
  }
  renderBuilderRound();
}

builderNext.addEventListener("click", nextBuilderRound);

const vocabSeries = {
  animals: [
    { id: "fox", fr: "renard", en: "fox", sentence: "The fox runs fast." },
    { id: "wolf", fr: "loup", en: "wolf", sentence: "The wolf likes pancakes." },
    { id: "cat", fr: "chat", en: "cat", sentence: "The cat drinks milk." },
    { id: "dog", fr: "chien", en: "dog", sentence: "The dog eats biscuits." },
    { id: "rabbit", fr: "lapin", en: "rabbit", sentence: "The rabbit likes carrots." },
    { id: "bird", fr: "oiseau", en: "bird", sentence: "The bird sings." }
  ],
  clothes: [
    { id: "dress", fr: "robe", en: "dress", sentence: "She wears a dress." },
    { id: "hat", fr: "chapeau", en: "hat", sentence: "He wears a hat." },
    { id: "jacket", fr: "veste", en: "jacket", sentence: "I wear a jacket." },
    { id: "shirt", fr: "t-shirt", en: "shirt", sentence: "We wear shirts." },
    { id: "shoes", fr: "chaussures", en: "shoes", sentence: "They wear shoes." },
    { id: "scarf", fr: "écharpe", en: "scarf", sentence: "She wears a scarf." }
  ]
};

const dailyState = {
  activeSeries: "animals",
  learned: {}
};

const dailyWordsGrid = document.getElementById("daily-words-grid");
const dailyProgress = document.getElementById("daily-progress");
const dailyDate = document.getElementById("daily-date");
const seriesButtons = Array.from(document.querySelectorAll(".series-button"));

function getTodayKey() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function getDaySeed() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function pickDailyWords(seriesName) {
  const words = vocabSeries[seriesName];
  const seed = getDaySeed() + (seriesName === "animals" ? 3 : 11);
  const picks = new Set();
  let cursor = 0;
  while (picks.size < 3) {
    picks.add(words[(seed + cursor * 2) % words.length].id);
    cursor += 1;
  }
  return words.filter((item) => picks.has(item.id));
}

function loadDailyProgress() {
  const raw = localStorage.getItem(DAILY_STORAGE_KEY);
  if (!raw) {
    dailyState.learned = {};
    return;
  }

  try {
    dailyState.learned = JSON.parse(raw);
  } catch {
    dailyState.learned = {};
    localStorage.removeItem(DAILY_STORAGE_KEY);
  }
}

function saveDailyProgress() {
  localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(dailyState.learned));
}

function ensureDailyKey(dayKey, seriesName) {
  if (!dailyState.learned[dayKey]) {
    dailyState.learned[dayKey] = {};
  }
  if (!dailyState.learned[dayKey][seriesName]) {
    dailyState.learned[dayKey][seriesName] = {};
  }
}

function renderDailyWords() {
  const dayKey = getTodayKey();
  ensureDailyKey(dayKey, dailyState.activeSeries);
  const words = pickDailyWords(dailyState.activeSeries);
  dailyDate.textContent = `Date: ${dayKey} • Série: ${dailyState.activeSeries === "animals" ? "Animaux" : "Habits"}`;
  dailyWordsGrid.innerHTML = "";

  let doneCount = 0;
  words.forEach((word) => {
    const card = document.createElement("article");
    const isDone = Boolean(dailyState.learned[dayKey][dailyState.activeSeries][word.id]);
    if (isDone) {
      doneCount += 1;
    }

    card.className = `word-card ${isDone ? "done" : ""}`;
    const top = document.createElement("div");
    top.className = "word-top";
    top.textContent = `${word.fr}`;
    card.appendChild(top);

    const english = document.createElement("p");
    english.className = "word-en";
    english.textContent = isDone ? `${word.en}` : "Tap pour révéler le mot anglais";
    card.appendChild(english);

    const sentence = document.createElement("p");
    sentence.className = "subtitle small";
    sentence.textContent = isDone ? word.sentence : "Phrase modèle cachée";
    card.appendChild(sentence);

    const reveal = document.createElement("button");
    reveal.type = "button";
    reveal.className = "tiny-button";
    reveal.textContent = isDone ? "Déjà appris" : "Révéler";
    reveal.addEventListener("click", () => {
      english.textContent = word.en;
      sentence.textContent = word.sentence;
    });
    card.appendChild(reveal);

    const learned = document.createElement("button");
    learned.type = "button";
    learned.className = "tiny-button";
    learned.textContent = isDone ? "✅ Appris" : "Je l'ai appris";
    learned.addEventListener("click", () => {
      dailyState.learned[dayKey][dailyState.activeSeries][word.id] = true;
      saveDailyProgress();
      renderDailyWords();
    });
    card.appendChild(learned);

    dailyWordsGrid.appendChild(card);
  });

  dailyProgress.textContent = `${profileState.name} a appris ${doneCount}/3 mots aujourd'hui.`;
}

seriesButtons.forEach((button) => {
  button.addEventListener("click", () => {
    seriesButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    dailyState.activeSeries = button.dataset.series;
    renderDailyWords();
  });
});

const recipes = {
  pancakes: {
    label: "Pancakes",
    steps: [
      {
        prompt: "Step 1: Choose the correct sentence.",
        choices: ["I wash my hands first.", "I washes my hands first.", "I washing my hands first."],
        answer: "I wash my hands first.",
        explain: "I + wash."
      },
      {
        prompt: "Step 2: Complete: She ___ eggs in a bowl.",
        choices: ["cracks", "crack", "cracking"],
        answer: "cracks",
        explain: "She + cracks."
      },
      {
        prompt: "Step 3: Choose the best sentence.",
        choices: ["We mix milk and flour.", "We mixes milk and flour.", "We doesn't mix milk and flour."],
        answer: "We mix milk and flour.",
        explain: "We + mix."
      },
      {
        prompt: "Step 4: Complete: He ___ the pan.",
        choices: ["heats", "heat", "don't heat"],
        answer: "heats",
        explain: "He + heats."
      },
      {
        prompt: "Step 5: Final action.",
        choices: ["I cook the pancakes.", "I cooks the pancakes.", "I cooking the pancakes."],
        answer: "I cook the pancakes.",
        explain: "Great chef sentence!"
      }
    ]
  },
  fruit_salad: {
    label: "Fruit Salad",
    steps: [
      {
        prompt: "Step 1: Complete: I ___ the apples.",
        choices: ["wash", "washes", "washing"],
        answer: "wash",
        explain: "I + wash."
      },
      {
        prompt: "Step 2: Choose the correct sentence.",
        choices: ["She cuts the bananas.", "She cut the bananas.", "She don't cut the bananas."],
        answer: "She cuts the bananas.",
        explain: "She + cuts."
      },
      {
        prompt: "Step 3: Complete: They ___ oranges.",
        choices: ["peel", "peels", "peeling"],
        answer: "peel",
        explain: "They + peel."
      },
      {
        prompt: "Step 4: Choose the best sentence.",
        choices: ["We mix all fruits.", "We mixes all fruits.", "We doesn't mix all fruits."],
        answer: "We mix all fruits.",
        explain: "We + mix."
      },
      {
        prompt: "Step 5: Final sentence.",
        choices: ["I serve the fruit salad.", "I serves the fruit salad.", "I serving the fruit salad."],
        answer: "I serve the fruit salad.",
        explain: "Chef completed!"
      }
    ]
  }
};

const cookingState = {
  recipe: "pancakes",
  index: -1,
  score: 0,
  answered: false
};

const recipeButtons = Array.from(document.querySelectorAll(".recipe-button"));
const cookingProgress = document.getElementById("cooking-progress");
const cookingStepLabel = document.getElementById("cooking-step-label");
const cookingPrompt = document.getElementById("cooking-prompt");
const cookingOptions = document.getElementById("cooking-options");
const cookingFeedback = document.getElementById("cooking-feedback");
const cookingNext = document.getElementById("cooking-next");

function setCookingFeedback(text, type) {
  cookingFeedback.textContent = text;
  cookingFeedback.className = `feedback ${type}`;
}

function updateCookingProgress() {
  const steps = recipes[cookingState.recipe].steps.length;
  const width = cookingState.index < 0 ? 0 : ((cookingState.index + 1) / steps) * 100;
  cookingProgress.style.width = `${Math.min(100, width)}%`;
}

function renderCookingStep() {
  const recipe = recipes[cookingState.recipe];
  const step = recipe.steps[cookingState.index];
  cookingState.answered = false;
  cookingStepLabel.textContent = `${recipe.label} • Étape ${cookingState.index + 1}/${recipe.steps.length}`;
  cookingPrompt.textContent = step.prompt;
  setCookingFeedback("", "");
  cookingNext.disabled = true;
  cookingNext.textContent = "Étape suivante";
  cookingOptions.innerHTML = "";

  step.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-button";
    button.textContent = choice;
    button.addEventListener("click", () => handleCookingAnswer(button, choice === step.answer, step.answer, step.explain));
    cookingOptions.appendChild(button);
  });

  updateCookingProgress();
}

function handleCookingAnswer(button, isCorrect, answer, explanation) {
  if (cookingState.answered) {
    return;
  }

  cookingState.answered = true;
  const buttons = Array.from(cookingOptions.querySelectorAll(".option-button"));
  buttons.forEach((item) => {
    item.disabled = true;
    if (item.textContent === answer) {
      item.classList.add("good");
    }
  });

  if (isCorrect) {
    cookingState.score += 1;
    setCookingFeedback(`Yummy! ${explanation}`, "ok");
  } else {
    button.classList.add("bad");
    setCookingFeedback(`Presque! Bonne réponse: ${answer}`, "error");
  }
  cookingNext.disabled = false;
}

function renderCookingEnd() {
  const recipe = recipes[cookingState.recipe];
  cookingStepLabel.textContent = `${recipe.label} terminé`;
  cookingPrompt.textContent = `Great job ${profileState.name}! Score cuisine: ${cookingState.score}/${recipe.steps.length}`;
  cookingOptions.innerHTML = "";
  setCookingFeedback("Tu viens d'apprendre des verbes au présent en cuisinant.", "ok");
  cookingNext.textContent = "Rejouer la recette";
  cookingNext.disabled = false;
  cookingState.index = recipe.steps.length;
  updateCookingProgress();
}

function startCookingRecipe() {
  cookingState.index = 0;
  cookingState.score = 0;
  renderCookingStep();
}

function nextCookingStep() {
  if (cookingState.index < 0) {
    startCookingRecipe();
    return;
  }

  const recipe = recipes[cookingState.recipe];
  if (cookingState.index >= recipe.steps.length) {
    startCookingRecipe();
    return;
  }

  cookingState.index += 1;
  if (cookingState.index === recipe.steps.length) {
    renderCookingEnd();
    return;
  }

  renderCookingStep();
}

recipeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    recipeButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    cookingState.recipe = button.dataset.recipe;
    cookingState.index = -1;
    cookingState.score = 0;
    cookingStepLabel.textContent = "Étape 1";
    cookingPrompt.textContent = "Appuie sur \"Commencer la recette\".";
    cookingOptions.innerHTML = "";
    setCookingFeedback("", "");
    cookingNext.textContent = "Commencer la recette";
    cookingNext.disabled = false;
    updateCookingProgress();
  });
});

cookingNext.addEventListener("click", nextCookingStep);

renderAvatarOptions();
loadProfile();
updateProfileView();
loadDailyProgress();
renderDailyWords();
updateBadges();
updateMissionMeta();
updateCookingProgress();
