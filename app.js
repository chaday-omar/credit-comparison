const steps = Array.from(document.querySelectorAll(".question-step"));
const backButton = document.querySelector("#backButton");
const nextButton = document.querySelector("#nextButton");
const progressLabel = document.querySelector("#progressLabel");
const progressBar = document.querySelector("#progressBar");
const compareForm = document.querySelector("#compareForm");
const loadingState = document.querySelector("#loadingState");
const resultsSection = document.querySelector("#resultados");
const resultsGrid = document.querySelector("#resultsGrid");
const resultsSummary = document.querySelector("#resultsSummary");

const options = [
  {
    name: "Impulso PyME",
    tag: "Más clara",
    rate: "Tasa desde 16%",
    points: ["Respuesta en 48 hrs", "Requisitos básicos", "Ideal para inventario"],
  },
  {
    name: "Capital Ágil",
    tag: "Más rápida",
    rate: "Tasa desde 18%",
    points: ["Preaprobación digital", "Monto flexible", "Ideal para capital de trabajo"],
  },
  {
    name: "Crecimiento Plus",
    tag: "Mayor monto",
    rate: "Tasa desde 21%",
    points: ["Pagos mensuales", "Soporta expansión", "Evaluación personalizada"],
  },
];

let currentStep = 0;

function updateStep() {
  steps.forEach((step, index) => {
    step.classList.toggle("active", index === currentStep);
  });

  const progress = ((currentStep + 1) / steps.length) * 100;
  progressLabel.textContent = `Pregunta ${currentStep + 1} de ${steps.length}`;
  progressBar.style.width = `${progress}%`;
  backButton.disabled = currentStep === 0;
  nextButton.textContent = currentStep === steps.length - 1 ? "Ver opciones" : "Continuar";
}

function getFormData() {
  const formData = new FormData(compareForm);
  return {
    need: formData.get("need"),
    amount: formData.get("amount"),
    history: formData.get("history"),
  };
}

function renderResults() {
  const data = getFormData();

  resultsSummary.innerHTML = `
    <span>Necesidad: ${data.need}</span>
    <span>Monto: ${data.amount}</span>
    <span>Crédito previo: ${data.history}</span>
  `;

  resultsGrid.innerHTML = options
    .map(
      (option) => `
        <article class="result-card">
          <header>
            <h3>${option.name}</h3>
            <span>${option.tag}</span>
          </header>
          <div class="main-metric">${option.rate}</div>
          <ul class="quick-info">
            ${option.points.map((point) => `<li>${point}</li>`).join("")}
          </ul>
          <button class="button button-primary" type="button">Ver opción</button>
        </article>
      `
    )
    .join("");
}

function showLoadingThenResults() {
  compareForm.hidden = true;
  loadingState.hidden = false;
  progressLabel.textContent = "Análisis en curso";
  progressBar.style.width = "100%";

  window.setTimeout(() => {
    renderResults();
    loadingState.hidden = true;
    compareForm.hidden = false;
    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 1200);
}

backButton.addEventListener("click", () => {
  currentStep = Math.max(0, currentStep - 1);
  updateStep();
});

nextButton.addEventListener("click", () => {
  if (currentStep < steps.length - 1) {
    currentStep += 1;
    updateStep();
    return;
  }

  showLoadingThenResults();
});

document.querySelectorAll(".select-card input").forEach((input) => {
  input.addEventListener("change", () => {
    const step = input.closest(".question-step");
    step.querySelectorAll(".select-card").forEach((card) => {
      card.toggleAttribute("data-selected", card.querySelector("input").checked);
    });
  });
});

updateStep();
