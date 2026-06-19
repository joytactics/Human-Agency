const MAX_STATE = 10;
let currentState = 0;

const root = document.getElementById("experience");
const progressLabel = document.getElementById("progress-label");
const typeTargets = [...document.querySelectorAll("[data-type]")];
const relationshipSvg = document.querySelector(".relationship-layer");
const relationshipLabels = {
  mentorship: document.querySelector(".relationship-text-mentorship"),
  develop: document.querySelector(".relationship-text-develop"),
  selection: document.querySelector(".relationship-text-selection"),
  invest: document.querySelector(".relationship-text-invest"),
};
const relationshipLines = {
  mentorship: document.getElementById("mentorship-line"),
  develop: document.getElementById("develop-line"),
  selection: document.getElementById("selection-line"),
  investableStem: document.getElementById("investable-stem-line"),
  investable: document.getElementById("investable-line"),
};

const relationshipNodes = {
  founder: document.querySelector(".founder-title"),
  cohort: document.querySelector(".cohort-title"),
  foundation: document.querySelector(".foundation-title"),
  venture: document.querySelector(".venture-title"),
  investable: document.querySelector(".investable-title"),
};

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
  scheduleRelationshipGeometry();
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

let lastTouchNavigationAt = 0;

function navigateFromX(clientX) {
  if (clientX < window.innerWidth / 2) {
    retreat();
    return;
  }

  advance();
}

function handlePointerNavigation(event) {
  if (event.pointerType === "mouse") return;
  event.preventDefault();
  lastTouchNavigationAt = Date.now();
  navigateFromX(event.clientX);
}

function handleTouchNavigation(event) {
  const touch = event.changedTouches[0];
  if (!touch) return;
  event.preventDefault();
  lastTouchNavigationAt = Date.now();
  navigateFromX(touch.clientX);
}

function handleClickNavigation(event) {
  if (Date.now() - lastTouchNavigationAt < 700) return;
  navigateFromX(event.clientX);
}

hydrateTypewriter();
setState(0);

window.addEventListener("pointerup", handlePointerNavigation);
window.addEventListener("touchend", handleTouchNavigation, { passive: false });
window.addEventListener("click", handleClickNavigation);
window.addEventListener("keydown", handleKeydown);
window.addEventListener("resize", scheduleRelationshipGeometry);

function scheduleRelationshipGeometry() {
  requestAnimationFrame(updateRelationshipGeometry);
  window.setTimeout(updateRelationshipGeometry, 320);
  window.setTimeout(updateRelationshipGeometry, 760);
  window.setTimeout(updateRelationshipGeometry, 1160);
}

function nodeRect(node) {
  const rect = node.getBoundingClientRect();
  return {
    left: rect.left,
    right: rect.right,
    top: rect.top,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
  };
}

function pxToViewBox(x, y, viewport) {
  return {
    x: (x / viewport.width) * 100,
    y: (y / viewport.height) * 100,
  };
}

function pointCommand(x, y, viewport) {
  const point = pxToViewBox(x, y, viewport);
  return `${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
}

function setPath(path, commands) {
  if (path) {
    path.setAttribute("d", commands);
  }
}

function positionLabel(label, x, y) {
  if (!label) return;
  label.style.left = `${x}px`;
  label.style.top = `${y}px`;
}

function updateRelationshipGeometry() {
  if (!relationshipSvg) return;

  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  relationshipSvg.setAttribute("viewBox", `0 0 100 100`);

  const founder = nodeRect(relationshipNodes.founder);
  const cohort = nodeRect(relationshipNodes.cohort);
  const foundation = nodeRect(relationshipNodes.foundation);
  const venture = nodeRect(relationshipNodes.venture);
  const investable = nodeRect(relationshipNodes.investable);

  const isMobile = viewport.width <= 760;
  const gap = isMobile ? 20 : 34;
  const edgeInset = isMobile ? 28 : 54;
  const labelGap = isMobile ? 20 : 28;
  const minHorizontalArrow = isMobile ? 64 : 250;
  const topY = Math.max(founder.bottom, cohort.bottom) + gap * 0.78;
  const bottomY = Math.min(venture.top, foundation.top) - gap * (isMobile ? 2.3 : 1.7);
  const rightX = Math.min(
    viewport.width - edgeInset,
    Math.max(cohort.right, foundation.right) + gap
  );
  const leftX = Math.max(edgeInset, Math.min(founder.left, venture.left) - gap);

  let mentorStartX = founder.right + gap * 0.45;
  let mentorEndX = cohort.left - gap * 0.45;
  if (mentorEndX - mentorStartX < minHorizontalArrow) {
    mentorStartX = viewport.width / 2 - minHorizontalArrow / 2;
    mentorEndX = viewport.width / 2 + minHorizontalArrow / 2;
  }
  const mentorY = topY;
  setPath(
    relationshipLines.mentorship,
    `M ${pointCommand(mentorStartX, mentorY, viewport)} L ${pointCommand(mentorEndX, mentorY, viewport)}`
  );
  positionLabel(
    relationshipLabels.mentorship,
    (mentorStartX + mentorEndX) / 2,
    mentorY + labelGap
  );

  setPath(
    relationshipLines.develop,
    `M ${pointCommand(rightX, bottomY, viewport)} L ${pointCommand(rightX, topY, viewport)}`
  );
  positionLabel(
    relationshipLabels.develop,
    isMobile ? Math.min(rightX + 13, viewport.width - 24) : rightX + 20,
    (topY + bottomY) / 2
  );

  let selectionStartX = foundation.left - gap * 0.45;
  let selectionEndX = venture.right + gap * 0.45;
  if (selectionStartX - selectionEndX < minHorizontalArrow) {
    selectionStartX = viewport.width / 2 + minHorizontalArrow / 2;
    selectionEndX = viewport.width / 2 - minHorizontalArrow / 2;
  }
  const selectionY = bottomY;
  setPath(
    relationshipLines.selection,
    `M ${pointCommand(selectionStartX, selectionY, viewport)} L ${pointCommand(selectionEndX, selectionY, viewport)}`
  );
  positionLabel(
    relationshipLabels.selection,
    (selectionStartX + selectionEndX) / 2,
    selectionY + labelGap
  );

  const investVertexY = Math.min(
    Math.max(investable.centerY, topY + (bottomY - topY) * 0.45),
    bottomY - gap
  );
  const investEndX = Math.max(investable.left - gap * 0.45, leftX + gap * 1.8);
  setPath(
    relationshipLines.investableStem,
    `M ${pointCommand(leftX, bottomY, viewport)} L ${pointCommand(leftX, investVertexY, viewport)}`
  );
  setPath(
    relationshipLines.investable,
    `M ${pointCommand(leftX, investVertexY, viewport)} L ${pointCommand(investEndX, investVertexY, viewport)}`
  );
  positionLabel(
    relationshipLabels.invest,
    leftX + (investEndX - leftX) / 2,
    investVertexY + labelGap
  );
}
