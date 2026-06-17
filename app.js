const MAX_STATE = 10;
let currentState = 0;

const root = document.getElementById("experience");
const progressLabel = document.getElementById("progress-label");
const typeTargets = [...document.querySelectorAll("[data-type]")];

function escapeHtml(character) {
  return character
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hydrateTypewriter() {
  const sequenceRoots = [
    ...document.querySelectorAll("[data-type-sequence]"),
    ...document.querySelectorAll(".founder-page"),
    ...document.querySelectorAll(".cohort-page"),
    ...document.querySelectorAll(".foundation-page"),
    ...document.querySelectorAll(".venture-page"),
    ...document.querySelectorAll(".investable-page"),
  ];
  const sequencedTargets = new Set();

  sequenceRoots.forEach((rootElement) => {
    hydrateSequence([...rootElement.querySelectorAll("[data-type]")]);
    rootElement.querySelectorAll("[data-type]").forEach((target) => sequencedTargets.add(target));
  });

  hydrateSequence(typeTargets.filter((target) => !sequencedTargets.has(target)));
}

function hydrateSequence(targets) {
  let offset = 0;

  targets.forEach((target) => {
    const text = target.dataset.type || "";
    target.innerHTML = text
      .split("\n")
      .map((line, lineIndex) => {
        const typedLine = line
          .split(" ")
          .map((word) => {
            const chars = [...word]
              .map((character, index) => {
                return `<span class="type-char" style="--i:${index + offset}">${escapeHtml(character)}</span>`;
              })
              .join("");
            offset += word.length + 1;
            return `<span class="type-word">${chars}</span>`;
          })
          .join(" ");
        offset += 4;
        return `${lineIndex > 0 ? "<br>" : ""}${typedLine}`;
      })
      .join("");
  });
}

function setState(nextState) {
  currentState = Math.max(0, Math.min(MAX_STATE, nextState));
  root.className = `experience state-${currentState}`;
  progressLabel.textContent = String(currentState).padStart(2, "0");
}

function advance() {
  setState(currentState + 1);
}

function retreat() {
  setState(currentState - 1);
}

function handleKeydown(event) {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    advance();
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    retreat();
  }
}

hydrateTypewriter();
setState(0);

window.addEventListener("click", advance);
window.addEventListener("keydown", handleKeydown);
