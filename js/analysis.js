// Spoonacular API key
//const API_KEY = "8f5b249a3f0e4e18982a3535c048d603"; 
//const API_KEY = "f2d7e0301db8452eb2d4f5b3e701e79c";
const API_KEY = "419a44996f7647838ab7ea820ac345fe";

const foodEntries = JSON.parse(localStorage.getItem("foodEntries")) || [];
const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAYS_SHORT_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Map to spoonacular values - spoonacular doesn't have brand info
const foodMap = {
  "classic chips": "potato chips",
  "dark chocolate": "chocolate bar",
  "pepsi can": "cola",
  "corn flakes": "corn cereal",
  "kitkat": "chocolate wafer",
  "sushi": "sushi",
  "caesar salad": "caesar salad",
  "fried chicken": "fried chicken", // not working
  "pancakes": "pancakes", // not working
  "tacos": "tacos", // not working
  "burger": "hamburger",
  "pizza": "pizza",
  "pasta": "spaghetti",
};

// Standard adult daily values (based on 2000-calorie diet)
const DAILY_VALUES = {
  "Calories": 2000,
  "Carbohydrates": 275,
  "Fiber": 28,
  "Protein": 50,
  "Vitamin C": 90,
  "Vitamin D": 20,
  "Iron": 18,
};

// Nutrient labels mapped to Spoonacular nutrient names
const nutrientMap = {
  "Calories": "Calories",
  "Carbs": "Carbohydrates",
  "Fiber": "Fiber",
  "Protein": "Protein",
  "Vitamin C": "Vitamin C",
  "Vitamin D": "Vitamin D",
  "Iron": "Iron",
};
const metricKeyToLabel = {
  calories: "Calories",
  carbs: "Carbs",
  fiber: "Fiber",
  protein: "Protein",
  vitaminC: "Vitamin C",
  vitaminD: "Vitamin D",
  iron: "Iron"
};
// Cache to avoid redundant API calls
//const nutritionCache = {};

// Fetch nutrition info for a single food (100 grams)
async function fetchNutrition(food) {
  // if (nutritionCache[food]) return nutritionCache[food];

  const searchUrl = `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(food)}&number=1&apiKey=${API_KEY}`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  if (!searchData.results?.length) {
    console.warn(`No results found for ${food}`);
    return null;
  }

  const foodId = searchData.results[0].id;
  const infoUrl = `https://api.spoonacular.com/food/ingredients/${foodId}/information?amount=100&unit=grams&apiKey=${API_KEY}`;
  const infoRes = await fetch(infoUrl);
  const foodData = await infoRes.json();

  const nutrients = foodData.nutrition?.nutrients || [];
  //nutritionCache[food] = nutrients;
  return nutrients;
}
async function getNutrientTotalsForDay(day) {
  const filteredEntries = foodEntries.filter(e => e.day === day);

  if (filteredEntries.length === 0) {
    return {}; 
  }

  const nutrientTotals = {};

  for (const entry of filteredEntries) {
    const foodName = foodMap[entry.food.toLowerCase()] || entry.food;
    const servings = entry.servings || 1;

    const nutrients = await fetchNutrition(foodName);
    if (!nutrients) continue;

    nutrients.forEach(nutrient => {
      const nutrientName = Object.values(nutrientMap).find(n =>
        nutrient.name.toLowerCase().includes(n.toLowerCase())
      );
      if (!nutrientName) return;

      let amount = nutrient.amount * servings;
      const unit = nutrient.unit.toLowerCase();

      if (unit === "µg") amount /= 1000;                
      if (unit === "mg" && DAILY_VALUES[nutrientName] > 100) amount /= 1000; 

      nutrientTotals[nutrientName] = (nutrientTotals[nutrientName] || 0) + amount;
    });
  }

  return nutrientTotals;
}
async function calculateWeeklySeries(metricKey) {
  const series = [];

  const label = metricKeyToLabel[metricKey];
  const nutrientName = nutrientMap[label];

  for (const day of DAYS_OF_WEEK) {
    const totals = await getNutrientTotalsForDay(day);
    const value = totals[nutrientName] || 0;
    series.push(value);
  }

  return series;
}
// Main function: analyze foods for last day entered
async function analyzeDay(day) {
  const filteredEntries = foodEntries.filter(e => e.day === day); // filter by day instead of last day

  if (filteredEntries.length === 0) {
    alert(`No food entries for ${day}.`);
    return;
  }

  const lastDay = foodEntries[foodEntries.length - 1].day;
  //const filteredEntries = foodEntries.filter(entry => entry.day === lastDay);

  // if (filteredEntries.length === 0) {
  //   alert(`No entries found for day: ${lastDay}`);
  //   return;
  // }

  // Total nutrients accumulator
  // this code stayed the same
  const nutrientTotals = {};

  for (const entry of filteredEntries) {
    const foodName = foodMap[entry.food.toLowerCase()] || entry.food;
    const servings = entry.servings || 1;

    const nutrients = await fetchNutrition(foodName);
    if (!nutrients) continue;

    nutrients.forEach(nutrient => {
      const nutrientName = Object.values(nutrientMap).find(n =>
        nutrient.name.toLowerCase().includes(n.toLowerCase())
      );
      if (!nutrientName) return;

      let amount = nutrient.amount * servings;
      const unit = nutrient.unit.toLowerCase();

      // Convert units where needed
      if (unit === "µg") amount /= 1000;
      if (unit === "mg" && DAILY_VALUES[nutrientName] > 100) amount /= 1000;

      nutrientTotals[nutrientName] = (nutrientTotals[nutrientName] || 0) + amount;
    });
  }

  // Update UI nutrient bars
  document.querySelectorAll(".nutrient").forEach(div => {
    const label = div.querySelector(".label").textContent.trim();
    const nutrientName = nutrientMap[label];
    const amount = nutrientTotals[nutrientName] || 0;
    const dailyValue = DAILY_VALUES[nutrientName];

    const valueSpan = div.querySelector(".value");
    const bar = div.querySelector(".bar");

    if (!dailyValue) {
      valueSpan.textContent = "N/A";
      bar.style.width = "0%";
      bar.style.backgroundColor = "#ccc";
      return;
    }

    const percent = ((amount / dailyValue) * 100).toFixed(1);
    const boundedPercent = Math.min(percent, 100);

    valueSpan.textContent = `${percent}%`;
    bar.style.width = `${boundedPercent}%`;

    if (percent < 20) {
      bar.style.backgroundColor = "#e74c3c"; // red
    } else if (percent > 120) {
      bar.style.backgroundColor = "#f39c12"; // orange
    } else {
      bar.style.backgroundColor = "#27ae60"; // green
    }
  });

  // Generate improvement suggestions
  const improvements = [];
  for (const [nutrient, amount] of Object.entries(nutrientTotals)) {
    const dailyValue = DAILY_VALUES[nutrient];
    if (!dailyValue) continue;

    const percent = (amount / dailyValue) * 100;
    if (percent < 20) improvements.push(`Low ${nutrient}`);
    else if (percent > 120) improvements.push(`High ${nutrient}`);
  }

  const improvementList = document.getElementById("improvement-list");
  improvementList.innerHTML = improvements.length
    ? improvements.map(i => `<span>• ${i}</span>`).join("")
    : "<span>All nutrients are in a good range!</span>";

  localStorage.setItem("nutrientImprovements", JSON.stringify(improvements));

  console.log(`Analyzed nutrition for ${lastDay}:`, nutrientTotals);
}

const analysisDaySelect = document.getElementById("analysis-day-select");

// Re-run analysis whenever day is changed
analysisDaySelect.addEventListener("change", () => {
  analyzeDay(analysisDaySelect.value);
});

// Run analysis on page load using default dropdown value
analyzeDay(analysisDaySelect.value);


// Run the analysis on page load
//analyzeLastDay();

// ---------------- Weekly Nutrient Timeline (Line Graph) ----------------
const weeklyMetricSelect = document.getElementById("weekly-metric-select");
const weeklyChartCanvas = document.getElementById("weekly-nutrient-chart");

let weeklyChart = null;

if (weeklyMetricSelect && weeklyChartCanvas && window.Chart) {
  const ctx = weeklyChartCanvas.getContext("2d");

  const metricDisplayNames = {
    calories: "Calories (kcal)",
    carbs: "Carbs",
    fiber: "Fiber",
    protein: "Protein (g)",
    vitaminC: "Vitamin C",
    vitaminD: "Vitamin D",
    iron: "Iron"
  };

  weeklyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: DAYS_SHORT_LABELS,
      datasets: [
        {
          label: metricDisplayNames["calories"],
          data: [0, 0, 0, 0, 0, 0, 0],
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Day of Week"
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Total Amount"
          }
        }
      }
    }
  });

  async function updateWeeklyChart(metricKey) {
    const series = await calculateWeeklySeries(metricKey);

    weeklyChart.data.datasets[0].data = series;
    weeklyChart.data.datasets[0].label = metricDisplayNames[metricKey];
    weeklyChart.update();
  }

  weeklyMetricSelect.addEventListener("change", (e) => {
    updateWeeklyChart(e.target.value);
  });

  updateWeeklyChart(weeklyMetricSelect.value);
}