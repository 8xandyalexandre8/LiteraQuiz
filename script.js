/*
  LITERAQUIZ — LÓGICA DO JOGO

  1) Primeiro carrega perguntas.json, que fica dentro do próprio projeto.
  2) Se houver menos de 10 perguntas locais preenchidas, consulta a
     Open Trivia Database oficial na categoria 10 (Entertainment: Books).
  3) As perguntas locais têm prioridade. A API é apenas complementar.

  IMPORTANTE SOBRE OS IDs:
  A OpenTDB oficial não permite pesquisar por IDs individuais. Os dez IDs
  do trabalho ficam registrados em perguntas.json, mas os enunciados e as
  alternativas precisam ser preenchidos com o conteúdo correspondente.
  Não inventamos o texto das perguntas.
*/

const TOTAL_PERGUNTAS = 10;
const API_URL = "https://opentdb.com/api.php";
const CATEGORIA_LIVROS = 10; // Entertainment: Books na OpenTDB

const questionElement = document.querySelector("#question");
const answersElement = document.querySelector("#answers");
const statusElement = document.querySelector("#status");
const feedbackElement = document.querySelector("#feedback");
const counterElement = document.querySelector("#question-counter");
const scoreElement = document.querySelector("#score");
const progressBar = document.querySelector("#progress-bar");
const restartButton = document.querySelector("#restart-button");

let questions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let isAnswering = false;

function decodeHTML(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text ?? "";
  return textarea.value;
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/* Tradução complementar para as perguntas que vierem em inglês da API. */
async function translateToPortuguese(text) {
  try {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.search = new URLSearchParams({
      client: "gtx", sl: "en", tl: "pt", dt: "t", q: text
    });
    const response = await fetch(url);
    if (!response.ok) return text;
    const data = await response.json();
    return data?.[0]?.map(part => part[0]).filter(Boolean).join("") || text;
  } catch (error) {
    console.warn("Tradução indisponível; mantendo o texto recebido.", error);
    return text;
  }
}

/*
  Uma pergunta local só é considerada pronta se tiver enunciado,
  resposta correta e exatamente três alternativas incorretas preenchidas.
*/
function localQuestionIsComplete(item) {
  return Boolean(
    item &&
    item.pergunta?.trim() &&
    item.respostaCorreta?.trim() &&
    Array.isArray(item.respostasIncorretas) &&
    item.respostasIncorretas.length === 3 &&
    item.respostasIncorretas.every(answer => answer?.trim())
  );
}

async function loadLocalQuestions() {
  const response = await fetch("./perguntas.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Não foi possível abrir perguntas.json. Confira se ele está na mesma pasta do index.html.");
  }

  const data = await response.json();
  const entries = Array.isArray(data.perguntas) ? data.perguntas : [];

  return entries
    .filter(localQuestionIsComplete)
    .map(item => ({
      id: item.id,
      question: item.pergunta.trim(),
      correctAnswer: item.respostaCorreta.trim(),
      incorrectAnswers: item.respostasIncorretas.map(answer => answer.trim()),
      source: "local"
    }));
}

/* Busca perguntas adicionais da categoria Livros na OpenTDB oficial. */
async function loadApiQuestions(amount) {
  if (amount <= 0) return [];

  const url = new URL(API_URL);
  url.searchParams.set("amount", String(amount));
  url.searchParams.set("category", String(CATEGORIA_LIVROS));
  url.searchParams.set("type", "multiple");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OpenTDB respondeu com HTTP ${response.status}.`);
  }

  const data = await response.json();

  if (data.response_code !== 0 || !Array.isArray(data.results)) {
    throw new Error(`OpenTDB não retornou perguntas (código ${data.response_code}).`);
  }

  const translated = [];
  for (const item of data.results) {
    translated.push({
      question: await translateToPortuguese(decodeHTML(item.question)),
      correctAnswer: await translateToPortuguese(decodeHTML(item.correct_answer)),
      incorrectAnswers: await Promise.all(
        item.incorrect_answers.map(answer =>
          translateToPortuguese(decodeHTML(answer))
        )
      ),
      source: "api"
    });
  }
  return translated;
}

async function loadQuestions() {
  statusElement.textContent = "Carregando banco local...";
  questionElement.textContent = "Preparando as perguntas.";
  answersElement.replaceChildren();
  feedbackElement.textContent = "";
  restartButton.hidden = true;

  try {
    const localQuestions = await loadLocalQuestions();
    statusElement.textContent =
      `${localQuestions.length} pergunta(s) local(is) carregada(s). Consultando complemento...`;

    let apiQuestions = [];
    const missingAmount = Math.max(0, TOTAL_PERGUNTAS - localQuestions.length);

    if (missingAmount > 0) {
      try {
        apiQuestions = await loadApiQuestions(missingAmount);
      } catch (apiError) {
        console.warn("API complementar indisponível:", apiError);
      }
    }

    // Perguntas locais aparecem primeiro; a API completa o total quando possível.
    questions = [...localQuestions, ...apiQuestions].slice(0, TOTAL_PERGUNTAS);

    if (questions.length === 0) {
      throw new Error(
        "O banco local ainda não tem perguntas preenchidas e a API complementar está indisponível."
      );
    }

    currentQuestionIndex = 0;
    correctAnswers = 0;
    updateScore();

    if (questions.length < TOTAL_PERGUNTAS) {
      feedbackElement.textContent =
        `Foram carregadas ${questions.length} pergunta(s). ` +
        "Preencha perguntas.json ou tente novamente quando a API estiver disponível.";
    } else if (localQuestions.length < TOTAL_PERGUNTAS) {
      feedbackElement.textContent =
        `Carregadas ${localQuestions.length} pergunta(s) local(is) e ` +
        `${apiQuestions.length} pergunta(s) complementar(es) da API.`;
    }

    showQuestion();
  } catch (error) {
    console.error("Erro ao iniciar o LiteraQuiz:", error);
    statusElement.textContent = "Não foi possível iniciar o jogo.";
    questionElement.textContent = error.message;
    feedbackElement.textContent =
      "Confira se está usando Live Server ou GitHub Pages e se perguntas.json está na pasta correta.";
    restartButton.hidden = false;
  }
}

function updateScore() {
  const total = questions.length;
  counterElement.textContent =
    `Pergunta ${Math.min(currentQuestionIndex + 1, total)} de ${total}`;
  scoreElement.textContent = `Acertos: ${correctAnswers}`;
  progressBar.style.width = total
    ? `${(currentQuestionIndex / total) * 100}%`
    : "0%";
}

function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    finishGame();
    return;
  }

  isAnswering = false;
  const current = questions[currentQuestionIndex];

  statusElement.textContent =
    current.source === "local" ? "Pergunta do banco local" : "Pergunta complementar da API";
  questionElement.textContent = current.question;
  feedbackElement.textContent = "";
  answersElement.replaceChildren();
  updateScore();

  const options = shuffleArray([
    { text: current.correctAnswer, isCorrect: true },
    ...current.incorrectAnswers.map(text => ({ text, isCorrect: false }))
  ]);

  options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.textContent = `${String.fromCharCode(65 + index)}) ${option.text}`;
    button.dataset.correct = String(option.isCorrect);
    button.addEventListener("click", () => checkAnswer(button));
    answersElement.appendChild(button);
  });
}

function checkAnswer(selectedButton) {
  if (isAnswering) return;
  isAnswering = true;

  const isCorrect = selectedButton.dataset.correct === "true";
  const buttons = answersElement.querySelectorAll("button");

  buttons.forEach(button => {
    button.disabled = true;
    if (button.dataset.correct === "true") button.classList.add("correct");
  });

  if (isCorrect) {
    correctAnswers++;
    selectedButton.classList.add("correct");
    feedbackElement.textContent = "Resposta correta! Próxima pergunta...";
    statusElement.textContent = "Muito bem!";
    currentQuestionIndex++;
    updateScore();
    window.setTimeout(showQuestion, 850);
  } else {
    selectedButton.classList.add("incorrect");
    feedbackElement.textContent =
      "Resposta incorreta. A alternativa correta está destacada.";
    statusElement.textContent = "Fim da rodada.";
    restartButton.hidden = false;
  }
}

function finishGame() {
  questionElement.textContent = "Parabéns! Você concluiu o LiteraQuiz!";
  statusElement.textContent = "Desafio concluído";
  answersElement.replaceChildren();
  feedbackElement.textContent =
    `Você acertou todas as ${questions.length} perguntas!`;
  counterElement.textContent =
    `Pergunta ${questions.length} de ${questions.length}`;
  scoreElement.textContent = `Acertos: ${correctAnswers}`;
  progressBar.style.width = "100%";
  restartButton.hidden = false;
}

restartButton.addEventListener("click", loadQuestions);
loadQuestions();
