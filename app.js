const compareForm = document.querySelector("#compareForm");

if (compareForm) {
  const steps = Array.from(document.querySelectorAll(".question-step"));
  const backButton = document.querySelector("#backButton");
  const nextButton = document.querySelector("#nextButton");
  const progressLabel = document.querySelector("#progressLabel");
  const progressBar = document.querySelector("#progressBar");
  const loadingState = document.querySelector("#loadingState");
  const resultsSection = document.querySelector("#resultados");
  const resultsGrid = document.querySelector("#resultsGrid");
  const resultsSummary = document.querySelector("#resultsSummary");
  const resultsHeadline = document.querySelector("#resultsHeadline");
  const healthCard = document.querySelector("#healthCard");
  const sortSelect = document.querySelector("#sortSelect");
  const amountRange = document.querySelector("#amountRange");
  const amountOutput = document.querySelector("#amountOutput");

  const options = [
    {
      name: "Banco Norte PyME",
      type: "Banco",
      baseMatch: 84,
      rate: 16,
      speedHours: 48,
      probability: "Alta",
      rating: "★★★★☆ 4.7",
      requirements: 4,
      profile: "A",
      explanation:
        "Buena opción para negocios con más de 1 año operando, facturación sólida y necesidad de capital estable.",
    },
    {
      name: "Fintech Uno Express",
      type: "Fintech",
      baseMatch: 88,
      rate: 18,
      speedHours: 24,
      probability: "Alta",
      rating: "★★★★★ 4.8",
      requirements: 2,
      profile: "B",
      explanation:
        "Recomendada para negocios que buscan respuesta rápida y prefieren un proceso digital con pocos requisitos.",
    },
    {
      name: "Capital MX Flexible",
      type: "Crédito flexible",
      baseMatch: 80,
      rate: 22,
      speedHours: 36,
      probability: "Media",
      rating: "★★★★☆ 4.6",
      requirements: 1,
      profile: "C",
      explanation:
        "Compatible con negocios nuevos, historial limitado o necesidad de evaluar flujo antes que documentación tradicional.",
    },
    {
      name: "Crecimiento Plus",
      type: "Fintech",
      baseMatch: 76,
      rate: 20,
      speedHours: 48,
      probability: "Media",
      rating: "★★★★☆ 4.5",
      requirements: 3,
      profile: "B",
      explanation:
        "Alternativa útil para expansión, compra de equipo o inventario cuando se busca flexibilidad de pagos.",
    },
  ];

  let currentStep = 0;
  let latestResults = [];

  function currency(value) {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function updateAmount() {
    if (!amountRange || !amountOutput) return;
    amountOutput.value = currency(Number(amountRange.value));
  }

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
      business: formData.get("business"),
      need: formData.get("need"),
      amount: Number(formData.get("amount")),
      age: formData.get("age"),
      revenue: formData.get("revenue"),
      history: formData.get("history"),
      credit: formData.get("credit"),
    };
  }

  function detectProfile(data) {
    if (
      data.credit === "Bueno" &&
      (data.revenue === "200k-500k" || data.revenue === "500k+") &&
      data.age !== "Menos de 1 año"
    ) {
      return "A";
    }

    if (data.age === "Menos de 1 año" || data.need === "Marketing") {
      return "B";
    }

    if (data.credit === "Malo" || data.credit === "No lo sé" || data.history === "No") {
      return "C";
    }

    return "B";
  }

  function scoreOption(option, data, profile) {
    let score = option.baseMatch;

    if (option.profile === profile) score += 8;
    if (data.need === "Inventario" && option.name.includes("Capital")) score += 4;
    if (data.need === "Expansión" && option.name.includes("Crecimiento")) score += 6;
    if (data.amount >= 500000 && option.type === "Banco") score += 5;
    if (data.credit !== "Bueno" && option.type === "Crédito flexible") score += 7;
    if (data.revenue === "Menos de 50k" && option.requirements <= 2) score += 5;

    return Math.min(98, score);
  }

  function buildResults() {
    const data = getFormData();
    const profile = detectProfile(data);

    latestResults = options
      .map((option) => ({
        ...option,
        match: scoreOption(option, data, profile),
      }))
      .sort((a, b) => b.match - a.match);

    const health = profile === "A" ? "Bueno" : profile === "B" ? "En crecimiento" : "Flexible";
    const probability = profile === "C" ? "Media" : "Alta";

    resultsHeadline.textContent = `Encontramos ${latestResults.length} opciones compatibles con tu perfil.`;
    resultsSummary.innerHTML = `
      <span>${data.business}</span>
      <span>${data.need}</span>
      <span>${currency(data.amount)}</span>
      <span>${data.revenue} al mes</span>
    `;
    healthCard.innerHTML = `
      <div>
        <span class="small-label">Perfil financiero</span>
        <strong>${health}</strong>
      </div>
      <div class="health-meter"><span style="--health: ${profile === "A" ? "88%" : profile === "B" ? "74%" : "62%"}"></span></div>
      <div>
        <span class="small-label">Probabilidad de aprobación</span>
        <strong>${probability}</strong>
      </div>
    `;

    renderResults();
  }

  function sortResults(type) {
    const sorters = {
      match: (a, b) => b.match - a.match,
      rate: (a, b) => a.rate - b.rate,
      speed: (a, b) => a.speedHours - b.speedHours,
      requirements: (a, b) => a.requirements - b.requirements,
    };

    latestResults.sort(sorters[type] || sorters.match);
    renderResults();
  }

  function renderResults() {
    resultsGrid.innerHTML = latestResults
      .map(
        (option) => `
          <article class="result-card recommendation-card">
            <span class="rec-label">Recomendado para ti</span>
            <header>
              <div>
                <h3>${option.name}</h3>
                <p>${option.type}</p>
              </div>
              <span>${option.match}% Match</span>
            </header>
            <div class="main-metric">Desde ${option.rate}%</div>
            <ul class="quick-info">
              <li>Respuesta en ${option.speedHours} hrs</li>
              <li>Probabilidad estimada: ${option.probability}</li>
              <li>Rating de usuarios: ${option.rating}</li>
            </ul>
            <p class="smart-explanation">${option.explanation}</p>
            <button class="button button-primary" type="button">Contactame</button>
          </article>
        `
      )
      .join("");
  }

  function showLoadingThenResults() {
    compareForm.hidden = true;
    loadingState.hidden = false;
    progressLabel.textContent = "Matching en curso";
    progressBar.style.width = "100%";

    window.setTimeout(() => {
      buildResults();
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

  if (sortSelect) {
    sortSelect.addEventListener("change", () => sortResults(sortSelect.value));
  }

  if (amountRange) {
    amountRange.addEventListener("input", updateAmount);
  }

  document.querySelectorAll(".select-card input").forEach((input) => {
    input.addEventListener("change", () => {
      const step = input.closest(".question-step");
      step.querySelectorAll(".select-card").forEach((card) => {
        card.toggleAttribute("data-selected", card.querySelector("input").checked);
      });
    });
  });

  updateAmount();
  updateStep();
}
