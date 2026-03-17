const PROFILE_STORAGE_KEY = "elsaEnglishProfileV1";
const DAILY_STORAGE_KEY = "elsaDailyWordsSrsV2";
const VERB_PROGRAM_STORAGE_KEY = "elsaVerbProgramV1";

const memoryFallbackStore = new Map();
const storageState = {
  available: true,
  lastError: ""
};

function shuffleArray(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function safeStorageGet(key) {
  try {
    const value = localStorage.getItem(key);
    storageState.available = true;
    return value ?? memoryFallbackStore.get(key) ?? null;
  } catch (error) {
    storageState.available = false;
    storageState.lastError = error?.name || "StorageError";
    return memoryFallbackStore.get(key) ?? null;
  }
}

function safeStorageSet(key, value) {
  memoryFallbackStore.set(key, value);
  try {
    localStorage.setItem(key, value);
    storageState.available = true;
    return true;
  } catch (error) {
    storageState.available = false;
    storageState.lastError = error?.name || "StorageError";
    return false;
  }
}

function safeStorageRemove(key) {
  memoryFallbackStore.delete(key);
  try {
    localStorage.removeItem(key);
    storageState.available = true;
  } catch (error) {
    storageState.available = false;
    storageState.lastError = error?.name || "StorageError";
  }
}

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
    { id: "wavy", label: "Ondulés" },
    { id: "ponytail", label: "Queue de cheval" },
    { id: "short", label: "Courts" },
    { id: "curly", label: "Bouclés" },
    { id: "buns", label: "Chignons" }
  ],
  eyes: [
    { id: "classic", label: "Ronds" },
    { id: "sparkle", label: "Brillants" },
    { id: "happy", label: "Souriants" },
    { id: "wink", label: "Clin d'oeil" }
  ],
  nose: [
    { id: "small", label: "Petit" },
    { id: "round", label: "Rond" },
    { id: "button", label: "Bouton" }
  ],
  mouth: [
    { id: "smile", label: "Sourire" },
    { id: "big_smile", label: "Grand sourire" },
    { id: "heart", label: "Lèvres coeur" },
    { id: "surprised", label: "Surprise" }
  ],
  outfit: [
    { id: "purple_shirt", label: "T-shirt violet" },
    { id: "dress", label: "Robe étoilée" },
    { id: "chef", label: "Tablier de chef" },
    { id: "sport", label: "Tenue sport" },
    { id: "hoodie", label: "Sweat à capuche" }
  ]
};

const profileGreeting = document.getElementById("profile-greeting");
const childNameInput = document.getElementById("child-name-input");
const saveProfileButton = document.getElementById("save-profile-button");
const profileSaveStatus = document.getElementById("profile-save-status");
const avatarCharacter = document.getElementById("avatar-character");
const avatarStyleLabel = document.getElementById("avatar-style-label");

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
  const storedRaw = safeStorageGet(PROFILE_STORAGE_KEY);
  if (!storedRaw) {
    sanitizeProfileValues();
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
    safeStorageRemove(PROFILE_STORAGE_KEY);
  }
  sanitizeProfileValues();
}

function saveProfile() {
  return safeStorageSet(PROFILE_STORAGE_KEY, JSON.stringify(profileState));
}

function optionById(part, id) {
  return avatarCatalog[part].find((item) => item.id === id);
}

function sanitizeProfileValues() {
  if (!optionById("hair", profileState.hair)) {
    profileState.hair = "wavy";
  }
  if (!optionById("eyes", profileState.eyes)) {
    profileState.eyes = "classic";
  }
  if (!optionById("nose", profileState.nose)) {
    profileState.nose = "small";
  }
  if (!optionById("mouth", profileState.mouth)) {
    profileState.mouth = "smile";
  }
  if (!optionById("outfit", profileState.outfit)) {
    profileState.outfit = "purple_shirt";
  }
}

function setProfileSaveStatus(isSaved) {
  if (isSaved) {
    profileSaveStatus.textContent = "✅ Profil sauvegardé sur cet appareil.";
    profileSaveStatus.className = "feedback ok";
    return;
  }
  profileSaveStatus.textContent = "⚠️ Sauvegarde navigateur limitée (mode privé/Safari). Le profil reste actif pendant cette session.";
  profileSaveStatus.className = "feedback warning";
}

function refreshProfileStorageStatus() {
  if (storageState.available) {
    profileSaveStatus.textContent = "";
    profileSaveStatus.className = "feedback";
    return;
  }
  profileSaveStatus.textContent = "⚠️ Sauvegarde navigateur limitée (mode privé/Safari). Le profil reste actif pendant cette session.";
  profileSaveStatus.className = "feedback warning";
}

function updateProfileView() {
  childNameInput.value = profileState.name;
  profileGreeting.textContent = `Hello ${profileState.name}! Let's learn English.`;
  avatarCharacter.className = `avatar-character hair-${profileState.hair} eyes-${profileState.eyes} nose-${profileState.nose} mouth-${profileState.mouth} outfit-${profileState.outfit}`;

  const hairLabel = optionById("hair", profileState.hair).label;
  const eyesLabel = optionById("eyes", profileState.eyes).label;
  const mouthLabel = optionById("mouth", profileState.mouth).label;
  const outfitLabel = optionById("outfit", profileState.outfit).label;
  avatarStyleLabel.textContent = `Style: ${hairLabel}, yeux ${eyesLabel.toLowerCase()}, ${mouthLabel.toLowerCase()}, ${outfitLabel.toLowerCase()}`;

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
        setProfileSaveStatus(saveProfile());
      });
      container.appendChild(button);
    });
  });
}

saveProfileButton.addEventListener("click", () => {
  const safeName = childNameInput.value.trim() || "Elsa";
  profileState.name = safeName.slice(0, 20);
  updateProfileView();
  setProfileSaveStatus(saveProfile());
});

childNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    saveProfileButton.click();
  }
});

const missionRoundsBase = [
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
  },
  {
    prompt: "Complete: She ___ books every evening.",
    choices: [
      { label: "reads", correct: true },
      { label: "read", correct: false },
      { label: "doesn't reads", correct: false }
    ],
    explanation: "She + reads."
  },
  {
    prompt: "Complete: He ___ football on Saturday.",
    choices: [
      { label: "play", correct: false },
      { label: "plays", correct: true },
      { label: "don't play", correct: false }
    ],
    explanation: "He + plays."
  },
  {
    prompt: "Choose the correct sentence.",
    choices: [
      { label: "I do my homework every day.", correct: true },
      { label: "I does my homework every day.", correct: false },
      { label: "I doing my homework every day.", correct: false }
    ],
    explanation: "I + do."
  },
  {
    prompt: "Complete the question: ___ she watch TV at night?",
    choices: [
      { label: "Do", correct: false },
      { label: "Does", correct: true },
      { label: "Is", correct: false }
    ],
    explanation: "Avec she, la question commence par Does."
  },
  {
    prompt: "Choose the correct negative sentence.",
    choices: [
      { label: "They don't drink milk in the morning.", correct: true },
      { label: "They doesn't drink milk in the morning.", correct: false },
      { label: "They don't drinks milk in the morning.", correct: false }
    ],
    explanation: "They + don't drink."
  },
  {
    prompt: "Complete: We ___ to school at 8 o'clock.",
    choices: [
      { label: "goes", correct: false },
      { label: "go", correct: true },
      { label: "doesn't go", correct: false }
    ],
    explanation: "We + go."
  }
];

let missionRounds = [...missionRoundsBase];

const starsByScore = [
  { limit: 6, text: "🌟 Petite étoile" },
  { limit: 11, text: "🌟🌟 Super étoile" },
  { limit: 16, text: "🌟🌟🌟 English Hero" }
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
const verbGeneratorInput = document.getElementById("verb-generator-input");
const verbGeneratorApply = document.getElementById("verb-generator-apply");
const verbGeneratorReset = document.getElementById("verb-generator-reset");
const verbGeneratorCount = document.getElementById("verb-generator-count");
const verbGeneratorFeedback = document.getElementById("verb-generator-feedback");

const MIN_GENERATED_VERBS = 3;
const MAX_GENERATED_VERBS = 12;
const suggestedVerbProgram = ["like", "play", "read", "write", "watch", "go", "do", "drink"];

const missionSubjects = ["She", "He", "Elsa", "My friend"];
const baseSubjects = ["I", "You", "We", "They"];
const sprintThirdSubjects = ["he", "she", "Elsa", "your friend"];
const sprintBaseSubjects = ["you", "they", "we", "I"];
const verbContextMap = {
  like: "pizza",
  play: "football",
  read: "books",
  write: "stories",
  watch: "TV",
  go: "to school",
  do: "homework",
  drink: "water",
  eat: "apples",
  cook: "pasta",
  wear: "a hat",
  sing: "songs",
  dance: "every day",
  run: "fast",
  help: "her family"
};

function conjugateThirdPerson(verb) {
  if (verb === "have") {
    return "has";
  }
  if (verb.endsWith("y") && !"aeiou".includes(verb.at(-2) || "")) {
    return `${verb.slice(0, -1)}ies`;
  }
  if (/(o|s|x|z|ch|sh)$/u.test(verb)) {
    return `${verb}es`;
  }
  return `${verb}s`;
}

function getVerbTail(verb) {
  return verbContextMap[verb] || "every day";
}

function parseVerbProgramInput(rawValue) {
  const seen = new Set();
  const valid = [];
  const rejected = [];
  const chunks = rawValue
    .split(/[\n,;]+/u)
    .map((chunk) => chunk.trim().toLowerCase())
    .filter(Boolean);

  chunks.forEach((chunk) => {
    if (!/^[a-z]+$/u.test(chunk)) {
      rejected.push(chunk);
      return;
    }
    if (seen.has(chunk)) {
      return;
    }
    seen.add(chunk);
    valid.push(chunk);
  });

  const trimmed = valid.slice(0, MAX_GENERATED_VERBS);
  return {
    verbs: trimmed,
    rejected,
    ignoredCount: Math.max(0, valid.length - trimmed.length)
  };
}

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

  const randomizedChoices = shuffleArray(round.choices);
  randomizedChoices.forEach((choice) => {
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

const foodLessonRounds = [
  {
    prompt: "Traduis en anglais : bananes",
    choices: ["bananas", "lemons", "pies"],
    answer: "bananas",
    explanation: "bananes = bananas."
  },
  {
    prompt: "Traduis en anglais : lait",
    choices: ["water", "milk", "ice-creams"],
    answer: "milk",
    explanation: "lait = milk."
  },
  {
    prompt: "Complète la question: ___ you like fish and chips?",
    choices: ["Do", "Does", "Can"],
    answer: "Do",
    explanation: "Avec you, on utilise Do."
  },
  {
    prompt: "Réponse positive correcte:",
    choices: ["Yes, I do.", "Yes, I like.", "Yes, I am."],
    answer: "Yes, I do.",
    explanation: "Pour répondre à Do you... : Yes, I do."
  },
  {
    prompt: "Réponse négative correcte:",
    choices: ["No, I don't.", "No, I doesn't.", "No, I am not."],
    answer: "No, I don't.",
    explanation: "Pour répondre négativement: No, I don't."
  },
  {
    prompt: "Complète: Mr Wolf ___ pancakes.",
    choices: ["like", "likes", "don't like"],
    answer: "likes",
    explanation: "Mr Wolf = he, donc likes."
  },
  {
    prompt: "Complète: He ___ pancakes.",
    choices: ["like", "likes", "doesn't likes"],
    answer: "likes",
    explanation: "He + likes."
  },
  {
    prompt: "Choisis la phrase correcte :",
    choices: [
      "I like cheese but I don't like apples.",
      "I likes cheese but I don't like apples.",
      "I like cheese but I doesn't like apples."
    ],
    answer: "I like cheese but I don't like apples.",
    explanation: "I + like / I don't like."
  },
  {
    prompt: "Traduis en anglais : biscuits au chocolat",
    choices: ["chocolate biscuits", "sweets biscuits", "pies chocolate"],
    answer: "chocolate biscuits",
    explanation: "biscuits au chocolat = chocolate biscuits."
  },
  {
    prompt: "Complète: She ___ cake.",
    choices: ["like", "likes", "don't like"],
    answer: "likes",
    explanation: "She + likes."
  },
  {
    prompt: "Traduis en anglais : poulet",
    choices: ["pasta", "chicken", "vegetables"],
    answer: "chicken",
    explanation: "poulet = chicken."
  },
  {
    prompt: "Complète: We ___ vegetables.",
    choices: ["likes", "like", "doesn't like"],
    answer: "like",
    explanation: "We + like."
  }
];

const foodState = {
  index: -1,
  score: 0,
  streak: 0,
  answered: false
};

const foodScoreValue = document.getElementById("food-score-value");
const foodStreakValue = document.getElementById("food-streak-value");
const foodProgressBar = document.getElementById("food-progress-bar");
const foodRoundLabel = document.getElementById("food-round-label");
const foodTitle = document.getElementById("food-title");
const foodPrompt = document.getElementById("food-prompt");
const foodOptions = document.getElementById("food-options");
const foodFeedback = document.getElementById("food-feedback");
const foodNextButton = document.getElementById("food-next-button");
const foodSpeakButton = document.getElementById("food-speak-button");

function updateFoodMeta() {
  foodScoreValue.textContent = String(foodState.score);
  foodStreakValue.textContent = String(foodState.streak);
  const ratio = foodState.index < 0 ? 0 : ((foodState.index + 1) / foodLessonRounds.length) * 100;
  foodProgressBar.style.width = `${Math.min(100, Math.max(0, ratio))}%`;
}

function setFoodFeedback(text, type) {
  foodFeedback.textContent = text;
  foodFeedback.className = `feedback ${type}`;
}

function speakFoodRound() {
  const round = foodLessonRounds[foodState.index];
  if (!window.speechSynthesis || !round) {
    return;
  }
  const message = `${round.prompt}. ${round.choices.join(". ")}`;
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "en-GB";
  utterance.rate = 0.88;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function renderFoodRound() {
  const round = foodLessonRounds[foodState.index];
  foodState.answered = false;
  foodRoundLabel.textContent = `Question ${foodState.index + 1} / ${foodLessonRounds.length}`;
  foodTitle.textContent = "Choisis la bonne réponse";
  foodPrompt.textContent = round.prompt;
  setFoodFeedback("", "");
  foodOptions.innerHTML = "";
  foodNextButton.textContent = "Suivant";
  foodNextButton.disabled = true;

  const randomizedChoices = shuffleArray(round.choices);
  randomizedChoices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-button";
    button.textContent = choice;
    button.addEventListener("click", () => handleFoodAnswer(button, choice === round.answer, round.answer, round.explanation));
    foodOptions.appendChild(button);
  });

  updateFoodMeta();
}

function handleFoodAnswer(button, isCorrect, answer, explanation) {
  if (foodState.answered) {
    return;
  }

  foodState.answered = true;
  const buttons = Array.from(foodOptions.querySelectorAll(".option-button"));
  buttons.forEach((item) => {
    item.disabled = true;
    if (item.textContent === answer) {
      item.classList.add("good");
    }
  });

  if (isCorrect) {
    foodState.score += 1;
    foodState.streak += 1;
    setFoodFeedback(`Bravo ${profileState.name} ! ${explanation}`, "ok");
  } else {
    button.classList.add("bad");
    foodState.streak = 0;
    setFoodFeedback(`Presque ! ${explanation}`, "error");
  }

  updateFoodMeta();
  foodNextButton.disabled = false;
}

function renderFoodEnd() {
  foodState.index = foodLessonRounds.length;
  foodOptions.innerHTML = "";
  foodRoundLabel.textContent = "Leçon terminée";
  foodTitle.textContent = `🎉 Great job ${profileState.name}!`;
  const medal = foodState.score >= 10 ? "🌟🌟🌟" : foodState.score >= 7 ? "🌟🌟" : "🌟";
  foodPrompt.textContent = `Score final: ${foodState.score}/${foodLessonRounds.length} ${medal}`;
  setFoodFeedback("Tu peux rejouer cette leçon pour renforcer la mémoire.", "ok");
  foodNextButton.textContent = "Rejouer";
  foodNextButton.disabled = false;
  updateFoodMeta();
}

function resetFoodGame() {
  foodState.index = 0;
  foodState.score = 0;
  foodState.streak = 0;
  foodState.answered = false;
  updateFoodMeta();
}

function nextFoodRound() {
  if (foodState.index < 0) {
    foodState.index = 0;
    renderFoodRound();
    return;
  }

  if (foodState.index >= foodLessonRounds.length) {
    resetFoodGame();
    renderFoodRound();
    return;
  }

  foodState.index += 1;
  if (foodState.index === foodLessonRounds.length) {
    renderFoodEnd();
    return;
  }
  renderFoodRound();
}

foodNextButton.addEventListener("click", nextFoodRound);
foodSpeakButton.addEventListener("click", speakFoodRound);

const mazeLevels = [
  {
    name: "Meadow Maze",
    map: [
      "#######",
      "#.....#",
      "###.#.#",
      "#...#.#",
      "#.###.#",
      "#.....#",
      "#######"
    ],
    start: { row: 1, col: 1, dir: "E" },
    goal: { row: 5, col: 5 }
  },
  {
    name: "Forest Maze",
    map: [
      "########",
      "#..#...#",
      "#.##.#.#",
      "#....#.#",
      "###.##.#",
      "#...#..#",
      "#.#...##",
      "########"
    ],
    start: { row: 1, col: 1, dir: "E" },
    goal: { row: 6, col: 5 }
  },
  {
    name: "Castle Maze",
    map: [
      "#########",
      "#...#...#",
      "#.#.#.#.#",
      "#.#...#.#",
      "#.#####.#",
      "#.....#.#",
      "###.#.#.#",
      "#...#...#",
      "#########"
    ],
    start: { row: 1, col: 1, dir: "E" },
    goal: { row: 7, col: 7 }
  }
];

const mazeDirections = ["N", "E", "S", "W"];
const mazeDirectionVectors = {
  N: [-1, 0],
  E: [0, 1],
  S: [1, 0],
  W: [0, -1]
};

const mazeDirectionLabels = {
  N: "North ⬆️",
  E: "East ➡️",
  S: "South ⬇️",
  W: "West ⬅️"
};

const mazeState = {
  levelIndex: 0,
  row: 0,
  col: 0,
  dir: "E",
  moves: 0,
  won: false,
  lastCommand: "Go straight on."
};

const mazeLevelValue = document.getElementById("maze-level-value");
const mazeMovesValue = document.getElementById("maze-moves-value");
const mazeFacing = document.getElementById("maze-facing");
const mazeCommand = document.getElementById("maze-command");
const mazeGrid = document.getElementById("maze-grid");
const mazeFeedback = document.getElementById("maze-feedback");
const mazeLeftButton = document.getElementById("maze-left-button");
const mazeStraightButton = document.getElementById("maze-straight-button");
const mazeRightButton = document.getElementById("maze-right-button");
const mazeSpeakButton = document.getElementById("maze-speak-button");
const mazeResetButton = document.getElementById("maze-reset-button");
const mazeNextLevelButton = document.getElementById("maze-next-level-button");

function getCurrentMazeLevel() {
  return mazeLevels[mazeState.levelIndex];
}

function setMazeFeedback(text, type) {
  mazeFeedback.textContent = text;
  mazeFeedback.className = `feedback ${type}`;
}

function updateMazeMeta() {
  mazeLevelValue.textContent = String(mazeState.levelIndex + 1);
  mazeMovesValue.textContent = String(mazeState.moves);
  mazeFacing.textContent = `Facing: ${mazeDirectionLabels[mazeState.dir]}`;
  mazeCommand.textContent = `Command: ${mazeState.lastCommand}`;
}

function renderMazeGrid() {
  const level = getCurrentMazeLevel();
  const rows = level.map.length;
  const cols = level.map[0].length;
  mazeGrid.style.setProperty("--maze-cols", cols);
  mazeGrid.innerHTML = "";

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    for (let colIndex = 0; colIndex < cols; colIndex += 1) {
      const symbol = level.map[rowIndex][colIndex];
      const cell = document.createElement("div");
      cell.className = `maze-cell ${symbol === "#" ? "wall" : "path"}`;

      const isGoal = rowIndex === level.goal.row && colIndex === level.goal.col;
      const isHorse = rowIndex === mazeState.row && colIndex === mazeState.col;

      if (isGoal) {
        cell.classList.add("goal");
      }
      if (isHorse) {
        cell.classList.add("horse");
      }

      if (isHorse && isGoal) {
        cell.textContent = "🏆";
      } else if (isHorse) {
        cell.textContent = "🐴";
      } else if (isGoal) {
        cell.textContent = "🥕";
      }

      mazeGrid.appendChild(cell);
    }
  }
}

function resetMazeLevel() {
  const level = getCurrentMazeLevel();
  mazeState.row = level.start.row;
  mazeState.col = level.start.col;
  mazeState.dir = level.start.dir;
  mazeState.moves = 0;
  mazeState.won = false;
  mazeState.lastCommand = "Go straight on.";
  mazeNextLevelButton.disabled = true;
  setMazeFeedback(`Level ${mazeState.levelIndex + 1}: Reach the carrot!`, "");
  updateMazeMeta();
  renderMazeGrid();
}

function moveToMazeLevel(levelIndex) {
  mazeState.levelIndex = levelIndex % mazeLevels.length;
  resetMazeLevel();
}

function speakMazeCommand() {
  if (!window.speechSynthesis) {
    return;
  }
  const utterance = new SpeechSynthesisUtterance(mazeState.lastCommand);
  utterance.lang = "en-GB";
  utterance.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function applyMazeCommand(command) {
  if (mazeState.won) {
    setMazeFeedback("Great! Click next level to continue.", "ok");
    return;
  }

  const commandLabels = {
    left: "Turn left.",
    straight: "Go straight on.",
    right: "Turn right."
  };
  mazeState.lastCommand = commandLabels[command];

  let directionIndex = mazeDirections.indexOf(mazeState.dir);
  if (command === "left") {
    directionIndex = (directionIndex + 3) % mazeDirections.length;
  } else if (command === "right") {
    directionIndex = (directionIndex + 1) % mazeDirections.length;
  }
  mazeState.dir = mazeDirections[directionIndex];

  const [deltaRow, deltaCol] = mazeDirectionVectors[mazeState.dir];
  const targetRow = mazeState.row + deltaRow;
  const targetCol = mazeState.col + deltaCol;
  const level = getCurrentMazeLevel();
  const cell = level.map[targetRow]?.[targetCol];

  if (!cell || cell === "#") {
    setMazeFeedback("Oops, wall! Try another command.", "error");
    updateMazeMeta();
    renderMazeGrid();
    return;
  }

  mazeState.row = targetRow;
  mazeState.col = targetCol;
  mazeState.moves += 1;
  setMazeFeedback(`Nice move: ${mazeState.lastCommand}`, "ok");

  if (mazeState.row === level.goal.row && mazeState.col === level.goal.col) {
    mazeState.won = true;
    mazeNextLevelButton.disabled = false;
    setMazeFeedback(`🎉 Well done ${profileState.name}! You reached the carrot in ${mazeState.moves} moves.`, "ok");
  }

  updateMazeMeta();
  renderMazeGrid();
}

mazeLeftButton.addEventListener("click", () => applyMazeCommand("left"));
mazeStraightButton.addEventListener("click", () => applyMazeCommand("straight"));
mazeRightButton.addEventListener("click", () => applyMazeCommand("right"));
mazeSpeakButton.addEventListener("click", speakMazeCommand);
mazeResetButton.addEventListener("click", resetMazeLevel);
mazeNextLevelButton.addEventListener("click", () => {
  moveToMazeLevel((mazeState.levelIndex + 1) % mazeLevels.length);
});

moveToMazeLevel(0);

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

const sprintRoundsBase = [
  { text: "___ you like bananas?", answer: "do" },
  { text: "___ he play football?", answer: "does" },
  { text: "___ they like pasta?", answer: "do" },
  { text: "___ she cook pancakes?", answer: "does" },
  { text: "___ we have a story today?", answer: "do" },
  { text: "___ she read comics every day?", answer: "does" },
  { text: "___ they write in English class?", answer: "do" },
  { text: "___ he watch TV at night?", answer: "does" }
];

let sprintRounds = [...sprintRoundsBase];

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

const builderRoundsBase = [
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
  },
  {
    prompt: "Choisis la phrase correcte.",
    choices: ["He plays football on Sunday.", "He play football on Sunday.", "He don't play football on Sunday."],
    answer: "He plays football on Sunday."
  },
  {
    prompt: "Choisis la phrase correcte.",
    choices: ["We go to school by bus.", "We goes to school by bus.", "We doesn't go to school by bus."],
    answer: "We go to school by bus."
  },
  {
    prompt: "Choisis la question correcte.",
    choices: ["Does she read books at night?", "Do she read books at night?", "Does she reads books at night?"],
    answer: "Does she read books at night?"
  },
  {
    prompt: "Choisis la phrase négative correcte.",
    choices: ["They don't drink coffee.", "They doesn't drink coffee.", "They don't drinks coffee."],
    answer: "They don't drink coffee."
  }
];

let builderRounds = [...builderRoundsBase];

function renderBuilderRound() {
  const round = builderRounds[builderState.index];
  builderPrompt.textContent = `${builderState.index + 1}/${builderRounds.length} - ${round.prompt}`;
  builderOptions.innerHTML = "";
  builderFeedback.textContent = "";
  builderFeedback.className = "feedback";
  builderNext.disabled = true;
  builderNext.textContent = "Suivant";

  const randomizedChoices = shuffleArray(round.choices);
  randomizedChoices.forEach((choice) => {
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

function createGeneratedMissionRounds(verbs) {
  return verbs.map((verb, index) => {
    const useThirdPerson = index % 2 === 0;
    const subject = useThirdPerson
      ? missionSubjects[index % missionSubjects.length]
      : baseSubjects[index % baseSubjects.length];
    const correctForm = useThirdPerson ? conjugateThirdPerson(verb) : verb;
    const wrongForm = useThirdPerson ? verb : conjugateThirdPerson(verb);
    const wrongNegative = useThirdPerson ? `don't ${verb}` : `doesn't ${verb}`;
    const tail = getVerbTail(verb);

    return {
      prompt: `Complete: ${subject} ___ ${tail}.`,
      choices: [
        { label: correctForm, correct: true },
        { label: wrongForm, correct: false },
        { label: wrongNegative, correct: false }
      ],
      explanation: useThirdPerson
        ? `${subject} est à la 3e personne: on utilise ${correctForm}.`
        : `${subject} utilise la base verbale: ${verb}.`
    };
  });
}

function createGeneratedSprintRounds(verbs) {
  return verbs.map((verb, index) => {
    const useThirdPerson = index % 2 === 0;
    const subject = useThirdPerson
      ? sprintThirdSubjects[index % sprintThirdSubjects.length]
      : sprintBaseSubjects[index % sprintBaseSubjects.length];

    return {
      text: `___ ${subject} ${verb} ${getVerbTail(verb)}?`,
      answer: useThirdPerson ? "does" : "do"
    };
  });
}

function createGeneratedBuilderRounds(verbs) {
  return verbs.map((verb, index) => {
    const useThirdPerson = index % 2 === 0;
    const subject = useThirdPerson
      ? missionSubjects[index % missionSubjects.length]
      : baseSubjects[index % baseSubjects.length];
    const correctVerb = useThirdPerson ? conjugateThirdPerson(verb) : verb;
    const wrongVerb = useThirdPerson ? verb : conjugateThirdPerson(verb);
    const wrongNegative = useThirdPerson ? `don't ${verb}` : `doesn't ${verb}`;
    const sentenceTail = getVerbTail(verb);
    const correctSentence = `${subject} ${correctVerb} ${sentenceTail}.`;

    return {
      prompt: `Choisis la phrase correcte avec "${verb}".`,
      choices: [
        correctSentence,
        `${subject} ${wrongVerb} ${sentenceTail}.`,
        `${subject} ${wrongNegative} ${sentenceTail}.`
      ],
      answer: correctSentence
    };
  });
}

function setVerbGeneratorFeedback(text, type = "") {
  verbGeneratorFeedback.textContent = text;
  verbGeneratorFeedback.className = `feedback ${type}`;
}

function resetMissionForProgram() {
  missionState.index = -1;
  missionState.score = 0;
  missionState.streak = 0;
  missionState.answered = false;
  missionState.badges = new Set();
  optionGrid.innerHTML = "";
  roundLabel.textContent = "Mission 1";
  questionTitle.textContent = "Bienvenue !";
  questionText.textContent = "Appuie sur \"Commencer\" pour jouer.";
  nextButton.textContent = "Commencer";
  nextButton.disabled = false;
  setMissionFeedback("", "");
  updateBadges();
  updateMissionMeta();
}

function resetSprintForProgram() {
  sprintState.index = -1;
  sprintState.score = 0;
  sprintState.currentRound = null;
  sprintQuestion.textContent = "Appuie sur \"Démarrer sprint\".";
  sprintFeedback.textContent = "";
  sprintFeedback.className = "feedback";
  sprintNext.textContent = "Démarrer sprint";
  sprintDo.disabled = true;
  sprintDoes.disabled = true;
}

function resetBuilderForProgram() {
  builderState.index = -1;
  builderPrompt.textContent = "Appuie sur \"Lancer builder\".";
  builderOptions.innerHTML = "";
  builderFeedback.textContent = "";
  builderFeedback.className = "feedback";
  builderNext.textContent = "Lancer builder";
  builderNext.disabled = false;
}

function updateVerbProgramLabel(verbs, isCustom) {
  if (!isCustom) {
    verbGeneratorCount.textContent = "Programme actuel: base";
    return;
  }
  const shortList = verbs.slice(0, 6).join(", ");
  const suffix = verbs.length > 6 ? ", ..." : "";
  verbGeneratorCount.textContent = `Programme actuel: ${verbs.length} verbes (${shortList}${suffix})`;
}

function applyGeneratedProgram(verbs, options = {}) {
  const { persist = true, announce = true } = options;
  missionRounds = createGeneratedMissionRounds(verbs);
  sprintRounds = createGeneratedSprintRounds(verbs);
  builderRounds = createGeneratedBuilderRounds(verbs);

  resetMissionForProgram();
  resetSprintForProgram();
  resetBuilderForProgram();
  updateVerbProgramLabel(verbs, true);
  verbGeneratorInput.value = verbs.join(", ");

  if (persist) {
    safeStorageSet(VERB_PROGRAM_STORAGE_KEY, JSON.stringify({ verbs }));
  }

  if (announce) {
    setVerbGeneratorFeedback(`✅ ${verbs.length} verbes générés automatiquement dans les 3 jeux.`, "ok");
  }
}

function applyBaseProgram(options = {}) {
  const { clearStorage = true, announce = true } = options;
  missionRounds = [...missionRoundsBase];
  sprintRounds = [...sprintRoundsBase];
  builderRounds = [...builderRoundsBase];

  resetMissionForProgram();
  resetSprintForProgram();
  resetBuilderForProgram();
  verbGeneratorInput.value = suggestedVerbProgram.join(", ");
  updateVerbProgramLabel([], false);

  if (clearStorage) {
    safeStorageRemove(VERB_PROGRAM_STORAGE_KEY);
  }

  if (announce) {
    setVerbGeneratorFeedback("↩️ Jeux de base restaurés.", "ok");
  }
}

function loadSavedVerbProgram() {
  verbGeneratorInput.value = suggestedVerbProgram.join(", ");
  updateVerbProgramLabel([], false);

  const raw = safeStorageGet(VERB_PROGRAM_STORAGE_KEY);
  if (!raw) {
    setVerbGeneratorFeedback("", "");
    return;
  }

  try {
    const saved = JSON.parse(raw);
    if (!saved || !Array.isArray(saved.verbs)) {
      safeStorageRemove(VERB_PROGRAM_STORAGE_KEY);
      setVerbGeneratorFeedback("", "");
      return;
    }
    const verbs = saved.verbs.filter((item) => typeof item === "string" && /^[a-z]+$/u.test(item));
    if (verbs.length < MIN_GENERATED_VERBS) {
      safeStorageRemove(VERB_PROGRAM_STORAGE_KEY);
      setVerbGeneratorFeedback("", "");
      return;
    }
    applyGeneratedProgram(verbs.slice(0, MAX_GENERATED_VERBS), { persist: false, announce: false });
    setVerbGeneratorFeedback("ℹ️ Programme personnalisé rechargé.", "warning");
  } catch {
    safeStorageRemove(VERB_PROGRAM_STORAGE_KEY);
    setVerbGeneratorFeedback("", "");
  }
}

verbGeneratorApply.addEventListener("click", () => {
  const { verbs, rejected, ignoredCount } = parseVerbProgramInput(verbGeneratorInput.value);

  if (verbs.length < MIN_GENERATED_VERBS) {
    setVerbGeneratorFeedback(`Ajoute au moins ${MIN_GENERATED_VERBS} verbes simples (ex: play, read, write).`, "error");
    return;
  }

  applyGeneratedProgram(verbs, { persist: true, announce: false });

  const warnings = [];
  if (rejected.length > 0) {
    warnings.push(`ignorés: ${rejected.slice(0, 4).join(", ")}${rejected.length > 4 ? ", ..." : ""}`);
  }
  if (ignoredCount > 0) {
    warnings.push(`limite à ${MAX_GENERATED_VERBS} verbes`);
  }

  if (warnings.length > 0) {
    setVerbGeneratorFeedback(`✅ ${verbs.length} verbes générés (${warnings.join(" · ")}).`, "warning");
    return;
  }

  setVerbGeneratorFeedback(`✅ ${verbs.length} verbes générés automatiquement dans les 3 jeux.`, "ok");
});

verbGeneratorReset.addEventListener("click", () => {
  applyBaseProgram({ clearStorage: true, announce: true });
});

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
  srs: {
    progress: {},
    assignments: {}
  }
};

const dailyWordsGrid = document.getElementById("daily-words-grid");
const dailyProgress = document.getElementById("daily-progress");
const dailyDate = document.getElementById("daily-date");
const dailyNewCounter = document.getElementById("daily-new-counter");
const dailyReviewCounter = document.getElementById("daily-review-counter");
const dailyReviewGrid = document.getElementById("daily-review-grid");
const dailyReviewSummary = document.getElementById("daily-review-summary");
const seriesButtons = Array.from(document.querySelectorAll(".series-button"));
const dailyQuizPrompt = document.getElementById("daily-quiz-prompt");
const dailyQuizOptions = document.getElementById("daily-quiz-options");
const dailyQuizFeedback = document.getElementById("daily-quiz-feedback");
const dailyQuizNext = document.getElementById("daily-quiz-next");

const reviewOffsetsByStage = {
  1: 1,
  2: 3,
  3: 7,
  4: 14
};

const stageLabels = {
  0: "Nouveau",
  1: "J+1",
  2: "J+3",
  3: "J+7",
  4: "Champion"
};

const dailyQuizState = {
  pool: [],
  index: -1,
  score: 0,
  answered: false,
  currentWord: null
};

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

function addDays(dayKey, amount) {
  const source = new Date(`${dayKey}T00:00:00`);
  source.setDate(source.getDate() + amount);
  return source.toISOString().slice(0, 10);
}

function getProgressForWord(wordId) {
  if (!dailyState.srs.progress[wordId]) {
    dailyState.srs.progress[wordId] = {
      stage: 0,
      nextReview: null,
      lastSeen: null,
      attempts: 0,
      correct: 0
    };
  }
  return dailyState.srs.progress[wordId];
}

function migrateLegacyDailyProgress(raw) {
  const migrated = {
    progress: {},
    assignments: {}
  };

  if (!raw || typeof raw !== "object" || !raw.learned) {
    return migrated;
  }

  const allIds = Object.values(vocabSeries)
    .flat()
    .map((word) => word.id);

  Object.keys(raw.learned).forEach((dayKey) => {
    Object.values(raw.learned[dayKey] || {}).forEach((wordMap) => {
      Object.keys(wordMap || {}).forEach((wordId) => {
        if (!allIds.includes(wordId) || !wordMap[wordId]) {
          return;
        }
        migrated.progress[wordId] = {
          stage: 1,
          nextReview: addDays(dayKey, 1),
          lastSeen: dayKey,
          attempts: 1,
          correct: 1
        };
      });
    });
  });

  return migrated;
}

function loadDailyProgress() {
  const raw = safeStorageGet(DAILY_STORAGE_KEY);
  if (!raw) {
    dailyState.srs = { progress: {}, assignments: {} };
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.progress && parsed.assignments) {
      dailyState.srs = parsed;
      return;
    }
    dailyState.srs = migrateLegacyDailyProgress(parsed);
  } catch {
    dailyState.srs = { progress: {}, assignments: {} };
    safeStorageRemove(DAILY_STORAGE_KEY);
  }
}

function saveDailyProgress() {
  return safeStorageSet(DAILY_STORAGE_KEY, JSON.stringify(dailyState.srs));
}

function ensureDailyAssignmentKey(dayKey, seriesName) {
  if (!dailyState.srs.assignments[dayKey]) {
    dailyState.srs.assignments[dayKey] = {};
  }
  if (!dailyState.srs.assignments[dayKey][seriesName]) {
    dailyState.srs.assignments[dayKey][seriesName] = [];
  }
}

function pickDeterministicSubset(list, count, seed) {
  if (list.length <= count) {
    return [...list];
  }
  const start = seed % list.length;
  const picked = [];
  for (let index = 0; index < count; index += 1) {
    picked.push(list[(start + index) % list.length]);
  }
  return picked;
}

function getOrCreateDailyAssignment(seriesName, dayKey) {
  ensureDailyAssignmentKey(dayKey, seriesName);
  const existingIds = dailyState.srs.assignments[dayKey][seriesName];
  if (existingIds.length === 3) {
    return vocabSeries[seriesName].filter((word) => existingIds.includes(word.id));
  }

  const words = [...vocabSeries[seriesName]];
  const unseen = words.filter((word) => getProgressForWord(word.id).stage === 0);
  const seed = getDaySeed() + (seriesName === "animals" ? 17 : 31);
  const selected = [];

  if (unseen.length >= 3) {
    selected.push(...pickDeterministicSubset(unseen, 3, seed));
  } else {
    selected.push(...unseen);
    const remaining = words
      .filter((word) => !selected.some((item) => item.id === word.id))
      .sort((left, right) => {
        const leftSeen = getProgressForWord(left.id).lastSeen || "1900-01-01";
        const rightSeen = getProgressForWord(right.id).lastSeen || "1900-01-01";
        return leftSeen.localeCompare(rightSeen);
      });
    selected.push(...pickDeterministicSubset(remaining, 3 - selected.length, seed));
  }

  dailyState.srs.assignments[dayKey][seriesName] = selected.map((word) => word.id);
  saveDailyProgress();
  return selected;
}

function getDueReviewWords(seriesName, todayKey) {
  return vocabSeries[seriesName].filter((word) => {
    const progress = getProgressForWord(word.id);
    return progress.stage >= 1 && progress.nextReview && progress.nextReview <= todayKey;
  });
}

function learnWord(wordId) {
  const todayKey = getTodayKey();
  const progress = getProgressForWord(wordId);
  progress.stage = Math.max(1, progress.stage);
  progress.nextReview = addDays(todayKey, reviewOffsetsByStage[1]);
  progress.lastSeen = todayKey;
  progress.attempts += 1;
  progress.correct += 1;
  saveDailyProgress();
}

function applyReviewResult(wordId, isCorrect) {
  const todayKey = getTodayKey();
  const progress = getProgressForWord(wordId);
  const currentStage = progress.stage;
  progress.attempts += 1;

  if (isCorrect) {
    progress.correct += 1;
    progress.stage = currentStage === 0 ? 1 : Math.min(4, currentStage + 1);
    progress.nextReview = addDays(todayKey, reviewOffsetsByStage[progress.stage]);
  } else if (currentStage === 0) {
    progress.stage = 0;
    progress.nextReview = null;
  } else {
    progress.stage = Math.max(1, currentStage - 1);
    progress.nextReview = addDays(todayKey, 1);
  }

  progress.lastSeen = todayKey;
  saveDailyProgress();
}

function renderNewWordCards(assignedWords, dayKey) {
  dailyWordsGrid.innerHTML = "";
  let learnedTodayCount = 0;

  assignedWords.forEach((word) => {
    const progress = getProgressForWord(word.id);
    const learnedToday = progress.lastSeen === dayKey && progress.stage >= 1;
    if (learnedToday) {
      learnedTodayCount += 1;
    }

    const card = document.createElement("article");
    card.className = `word-card ${progress.stage >= 1 ? "done" : ""}`;

    const top = document.createElement("div");
    top.className = "word-top";
    const label = document.createElement("span");
    label.textContent = word.fr;
    const stageBadge = document.createElement("span");
    stageBadge.className = "badge";
    stageBadge.textContent = stageLabels[progress.stage];
    top.appendChild(label);
    top.appendChild(stageBadge);
    card.appendChild(top);

    const english = document.createElement("p");
    english.className = "word-en";
    english.textContent = progress.stage >= 1 ? word.en : "Tap pour révéler le mot anglais";
    card.appendChild(english);

    const sentence = document.createElement("p");
    sentence.className = "subtitle small";
    sentence.textContent = progress.stage >= 1 ? word.sentence : "Phrase modèle cachée";
    card.appendChild(sentence);

    const meta = document.createElement("p");
    meta.className = "memory-meta";
    meta.textContent = progress.nextReview ? `Prochaine révision: ${progress.nextReview}` : "Pas encore planifié";
    card.appendChild(meta);

    const reveal = document.createElement("button");
    reveal.type = "button";
    reveal.className = "tiny-button";
    reveal.textContent = "Révéler";
    reveal.addEventListener("click", () => {
      english.textContent = word.en;
      sentence.textContent = word.sentence;
    });
    card.appendChild(reveal);

    const learned = document.createElement("button");
    learned.type = "button";
    learned.className = "tiny-button";
    learned.textContent = progress.stage >= 1 ? "✅ Déjà appris" : "Je l'ai appris";
    learned.disabled = progress.stage >= 1;
    learned.addEventListener("click", () => {
      learnWord(word.id);
      renderDailyWords();
    });
    card.appendChild(learned);

    dailyWordsGrid.appendChild(card);
  });

  dailyNewCounter.textContent = `Nouveaux: ${learnedTodayCount}/3`;
}

function renderDueReviewCards(dueWords) {
  dailyReviewGrid.innerHTML = "";

  if (dueWords.length === 0) {
    dailyReviewSummary.textContent = "Aucune révision due aujourd'hui. Continue comme ça !";
    dailyReviewCounter.textContent = "Révisions: 0";
    return;
  }

  dailyReviewSummary.textContent = `${dueWords.length} mot(s) à réviser maintenant.`;
  dailyReviewCounter.textContent = `Révisions: ${dueWords.length}`;

  dueWords.forEach((word) => {
    const progress = getProgressForWord(word.id);
    const card = document.createElement("article");
    card.className = "word-card review-due";

    const top = document.createElement("div");
    top.className = "word-top";
    const label = document.createElement("span");
    label.textContent = `${word.fr} → ${word.en}`;
    const stageBadge = document.createElement("span");
    stageBadge.className = "badge";
    stageBadge.textContent = stageLabels[progress.stage];
    top.appendChild(label);
    top.appendChild(stageBadge);
    card.appendChild(top);

    const sentence = document.createElement("p");
    sentence.className = "subtitle small";
    sentence.textContent = word.sentence;
    card.appendChild(sentence);

    const meta = document.createElement("p");
    meta.className = "memory-meta";
    meta.textContent = `Due: ${progress.nextReview} • Score: ${progress.correct}/${Math.max(progress.attempts, 1)}`;
    card.appendChild(meta);

    dailyReviewGrid.appendChild(card);
  });
}

function getDailyQuizPool() {
  const dayKey = getTodayKey();
  const assignedWords = getOrCreateDailyAssignment(dailyState.activeSeries, dayKey);
  const dueWords = getDueReviewWords(dailyState.activeSeries, dayKey);
  const uniqueWords = [...assignedWords, ...dueWords].filter(
    (word, index, array) => index === array.findIndex((item) => item.id === word.id)
  );
  return uniqueWords;
}

function setDailyQuizFeedback(text, type) {
  dailyQuizFeedback.textContent = text;
  dailyQuizFeedback.className = `feedback ${type}`;
}

function renderDailyQuizRound() {
  const word = dailyQuizState.pool[dailyQuizState.index];
  dailyQuizState.currentWord = word;
  dailyQuizState.answered = false;
  setDailyQuizFeedback("", "");
  dailyQuizNext.disabled = true;
  dailyQuizNext.textContent = "Question suivante";
  dailyQuizPrompt.textContent = `${dailyQuizState.index + 1}/${dailyQuizState.pool.length} - Comment dit-on "${word.fr}" en anglais ?`;
  dailyQuizOptions.innerHTML = "";

  const allSeriesWords = vocabSeries[dailyState.activeSeries];
  const distractors = allSeriesWords
    .filter((item) => item.id !== word.id)
    .slice(0, 6)
    .sort((left, right) => left.en.localeCompare(right.en))
    .slice(0, 3)
    .map((item) => item.en);

  const options = shuffleArray([word.en, ...distractors]);
  options.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-button";
    button.textContent = choice;
    button.addEventListener("click", () => {
      if (dailyQuizState.answered) {
        return;
      }
      dailyQuizState.answered = true;
      const correct = choice === word.en;
      Array.from(dailyQuizOptions.querySelectorAll(".option-button")).forEach((item) => {
        item.disabled = true;
        if (item.textContent === word.en) {
          item.classList.add("good");
        }
      });

      if (!correct) {
        button.classList.add("bad");
        setDailyQuizFeedback(`Presque ! Réponse: ${word.en}`, "error");
      } else {
        dailyQuizState.score += 1;
        setDailyQuizFeedback("Bravo ! Révision validée.", "ok");
      }
      applyReviewResult(word.id, correct);
      dailyQuizNext.disabled = false;
      renderDailyWords();
    });
    dailyQuizOptions.appendChild(button);
  });
}

function nextDailyQuizRound() {
  if (dailyQuizState.index < 0) {
    dailyQuizState.pool = getDailyQuizPool();
    dailyQuizState.score = 0;
    dailyQuizState.index = 0;
    if (dailyQuizState.pool.length === 0) {
      dailyQuizPrompt.textContent = "Aucun mot disponible. Commence par apprendre tes 3 mots du jour.";
      dailyQuizOptions.innerHTML = "";
      setDailyQuizFeedback("", "");
      dailyQuizNext.textContent = "Démarrer challenge";
      dailyQuizNext.disabled = false;
      dailyQuizState.index = -1;
      return;
    }
    renderDailyQuizRound();
    return;
  }

  dailyQuizState.index += 1;
  if (dailyQuizState.index >= dailyQuizState.pool.length) {
    dailyQuizPrompt.textContent = `Challenge terminé: ${dailyQuizState.score}/${dailyQuizState.pool.length}`;
    dailyQuizOptions.innerHTML = "";
    setDailyQuizFeedback("Top ! Continue demain pour consolider la mémoire.", "ok");
    dailyQuizNext.textContent = "Relancer challenge";
    dailyQuizNext.disabled = false;
    dailyQuizState.index = -1;
    dailyQuizState.pool = [];
    dailyQuizState.currentWord = null;
    renderDailyWords();
    return;
  }

  renderDailyQuizRound();
}

function resetDailyQuiz() {
  dailyQuizState.pool = [];
  dailyQuizState.index = -1;
  dailyQuizState.score = 0;
  dailyQuizState.answered = false;
  dailyQuizState.currentWord = null;
  dailyQuizPrompt.textContent = "Appuie sur \"Démarrer challenge\".";
  dailyQuizOptions.innerHTML = "";
  setDailyQuizFeedback("", "");
  dailyQuizNext.textContent = "Démarrer challenge";
  dailyQuizNext.disabled = false;
}

function renderDailyWords() {
  const dayKey = getTodayKey();
  const assignedWords = getOrCreateDailyAssignment(dailyState.activeSeries, dayKey);
  const dueWords = getDueReviewWords(dailyState.activeSeries, dayKey);
  dailyDate.textContent = `Date: ${dayKey} • Série: ${dailyState.activeSeries === "animals" ? "Animaux" : "Habits"}`;
  renderNewWordCards(assignedWords, dayKey);
  renderDueReviewCards(dueWords);

  const learnedCount = assignedWords.filter((word) => getProgressForWord(word.id).stage >= 1).length;
  const dueCount = dueWords.length;
  const storageHint = storageState.available
    ? ""
    : " ⚠️ Sauvegarde locale limitée sur ce navigateur (session active uniquement).";
  dailyProgress.textContent = `${profileState.name} a appris ${learnedCount}/3 mots aujourd'hui. Révisions dues: ${dueCount}.${storageHint}`;
}

seriesButtons.forEach((button) => {
  button.addEventListener("click", () => {
    seriesButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    dailyState.activeSeries = button.dataset.series;
    renderDailyWords();
    resetDailyQuiz();
  });
});

dailyQuizNext.addEventListener("click", nextDailyQuizRound);

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

  const randomizedChoices = shuffleArray(step.choices);
  randomizedChoices.forEach((choice) => {
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
refreshProfileStorageStatus();
loadSavedVerbProgram();
loadDailyProgress();
renderDailyWords();
resetDailyQuiz();
updateBadges();
updateMissionMeta();
updateFoodMeta();
updateCookingProgress();
