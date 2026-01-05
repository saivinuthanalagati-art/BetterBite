console.log("recipe.js loaded");

//const API_KEY = "8f5b249a3f0e4e18982a3535c048d603"; 
//const API_KEY = "f2d7e0301db8452eb2d4f5b3e701e79c";
const API_KEY = "419a44996f7647838ab7ea820ac345fe";
const recipeId = localStorage.getItem("selectedRecipeId");
console.log("Selected recipe ID:", recipeId);

const titleEl = document.querySelector(".page-title");
const imgEl = document.querySelector(".recipe-img img");
const ingList = document.querySelector(".ingredients ul");

function getHeadingByText(tagName, text) {
  const els = Array.from(document.querySelectorAll(tagName));
  const target = els.find(
    (el) => el.textContent.trim().toLowerCase() === text.toLowerCase()
  );
  return target || null;
}

function removeNodesBetween(startNode, endNode) {
  if (!startNode || !endNode) return;
  let node = startNode.nextSibling;
  while (node && node !== endNode) {
    const toRemove = node;
    node = node.nextSibling;
    toRemove.remove();
  }
}

async function loadRecipe() {
  if (!recipeId) {
    const container = document.querySelector(".recipe-container") || document.body;
    container.innerHTML = `
      <h1>No recipe selected</h1>
      <p>Please go back to <a href="personalised-reccommendation.html">Personalized Recommendations</a> and choose one.</p>
    `;
    return;
  }

  try {
    const infoUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`;
    const instrUrl = `https://api.spoonacular.com/recipes/${recipeId}/analyzedInstructions?apiKey=${API_KEY}`;

    const [infoRes, instrRes] = await Promise.all([fetch(infoUrl), fetch(instrUrl)]);
    if (!infoRes.ok) console.warn("Info response not OK:", infoRes.status, infoRes.statusText);
    if (!instrRes.ok) console.warn("Instr response not OK:", instrRes.status, instrRes.statusText);

    const info = await infoRes.json();
    const instructions = await instrRes.json(); 

    console.log("Recipe details:", info);
    console.log("Analyzed instructions:", instructions);

    if (titleEl) titleEl.textContent = info.title || "Recipe";
    if (imgEl) {
      imgEl.src = info.image || "";
      imgEl.alt = info.title || "Recipe image";
    }


    if (ingList) {
      ingList.innerHTML = "";
      const items = Array.isArray(info.extendedIngredients) ? info.extendedIngredients : [];
      if (items.length) {
        items.forEach((ing) => {
          const li = document.createElement("li");
          li.textContent = ing.original || `${ing.amount || ""} ${ing.unit || ""} ${ing.name || ""}`.trim();
          ingList.appendChild(li);
        });
      } else {
        const li = document.createElement("li");
        li.textContent = "Ingredients not available.";
        ingList.appendChild(li);
      }
    }

    const instructionsH2 = getHeadingByText("h2", "Instructions");
    const storageH2 = getHeadingByText("h2", "Storage:");

    if (instructionsH2 && storageH2) {
      removeNodesBetween(instructionsH2, storageH2);

      const timeP = document.createElement("p");
      const mins = info.readyInMinutes ? `${info.readyInMinutes} minutes` : "—";
      timeP.innerHTML = `Estimated Time: ${mins}`;
      instructionsH2.insertAdjacentElement("afterend", timeP);

      const stepsOl = document.createElement("ol");
      stepsOl.className = "steps-list";

      const firstSet = Array.isArray(instructions) && instructions.length ? instructions[0] : null;
      const steps = firstSet && Array.isArray(firstSet.steps) ? firstSet.steps : [];

      if (steps.length) {
        steps.forEach((s, i) => {
          const li = document.createElement("li");
          li.innerHTML = `<span class="step-label">Step ${i + 1}:</span> ${s.step}`;
          stepsOl.appendChild(li);
        });
      } 
      else if (info.instructions) {
        info.instructions
          .split(/\.\s+/)
          .filter(Boolean)
          .forEach((text, i) => {
            const li = document.createElement("li");
            li.innerHTML = `<span class="step-label">Step ${i + 1}:</span> ${text}.`;
            stepsOl.appendChild(li);
          });
      } 
      else {
        const li = document.createElement("li");
        li.textContent = "Instructions not available.";
        stepsOl.appendChild(li);
      }

      timeP.insertAdjacentElement("afterend", stepsOl);
    } else {
      console.warn("Could not find Instructions/Storage headings to replace.");
    }
  } catch (err) {
    console.error("Error loading recipe:", err);
    const container = document.querySelector(".recipe-container") || document.body;
    container.insertAdjacentHTML("beforeend", `<p>Sorry, we couldn’t load this recipe right now.</p>`);
  }
}

document.addEventListener("DOMContentLoaded", loadRecipe);
