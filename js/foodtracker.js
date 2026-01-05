
const addButton = document.getElementById("food-entry-button");
const clearButton = document.getElementById("clear-food-button");

const viewDaySelect = document.getElementById("day-select");


// dropdowns
const daySelect = document.getElementById("days");
const categorySelect = document.getElementById("category");
const brandSelect = document.getElementById("brand");
const servingSelect = document.getElementById("serving");
const foodSelect = document.getElementById("food");

// load previous entries from localStorage
let foodEntries = JSON.parse(localStorage.getItem("foodEntries")) || [];

// save to localStorage
function saveEntries() {
  localStorage.setItem("foodEntries", JSON.stringify(foodEntries));
}

// add food entry
addButton.addEventListener("click", () => {
  const entry = {
    day: daySelect.value,
    category: categorySelect.value,
    brand: brandSelect.value,
    servings: parseInt(servingSelect.value),
    food: foodSelect.value
  };

  foodEntries.push(entry);
  saveEntries();
  renderEntries();
  // popup to inform user what they added
  alert(`Added ${entry.servings} serving(s) of ${entry.brand} ${entry.food} for ${entry.day}.`);
});

// clear all entries
clearButton.addEventListener("click", () => {
  if (confirm("Clear all saved food entries?")) {
    foodEntries = [];
    saveEntries();
    renderEntries();
    alert("All food entries cleared.");
  }
});

// get list of food entries
const listContainer = document.getElementById("food-entries-list");

viewDaySelect.addEventListener("change", renderEntries);

// display food entries at bottom by day
function renderEntries() {
  // get selected day
  let selectedDay = viewDaySelect.value;
  // filter entries by day
  let filteredEntries =
    selectedDay === "all"
      ? foodEntries
      : foodEntries.filter(e => e.day === selectedDay);
  // if no entries
  if (!filteredEntries.length) {
    listContainer.innerHTML = "<p>No entries for this day.</p>";
    return;
  }
 // display info about each entry
  listContainer.innerHTML = filteredEntries
    .map(
      (e) => `
      <div class="food-entry-item">
        <strong>${e.day.toUpperCase()}</strong> —
        ${e.servings} serving(s) of <strong>$${e.food}</strong>
        (${e.category})
      </div>
    `
    )
    .join("");
}

// on load
renderEntries();

