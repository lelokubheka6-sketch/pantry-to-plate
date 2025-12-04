// meals.js - updated to fetch meal instructions from backend

// ---------------------------
// LOCAL FALLBACK DATABASE
const localMealDatabase = {
  eggs: [
    { title: "Omelette", description: "Quick and easy scrambled eggs with veggies." },
    { title: "Scrambled eggs with herbs", description: "Fluffy eggs with fresh herbs." },
    { title: "Egg & avocado toast", description: "Toast topped with avocado and eggs." }
  ],
  bread: [
    { title: "Avocado toast", description: "Classic toast with mashed avocado." },
    { title: "French toast", description: "Sweet and fluffy breakfast treat." },
    { title: "Open-faced sandwich", description: "Bread topped with your favorite ingredients." }
  ],
  avocado: [
    { title: "Avocado toast", description: "Classic toast with mashed avocado." },
    { title: "Avo salad", description: "Fresh avocado salad with lemon dressing." },
    { title: "Avo omelette", description: "Omelette with avocado slices inside." }
  ],
  pumpkin: [
    { title: "Roasted pumpkin", description: "Oven-roasted pumpkin cubes." },
    { title: "Pumpkin stew", description: "Savory pumpkin stew with spices." },
    { title: "Pumpkin & spinach sauté", description: "Quick sauté with pumpkin and spinach." }
  ],
  spinach: [
    { title: "Spinach omelette", description: "Omelette packed with spinach." },
    { title: "Spinach & chickpea bowl", description: "Healthy protein-packed bowl." },
    { title: "Spinach salad", description: "Fresh salad with spinach and toppings." }
  ],
  chicken: [
    { title: "Grilled chicken", description: "Simple grilled chicken breast." },
    { title: "Chicken salad", description: "Chicken with fresh veggies." },
    { title: "Chicken stir-fry", description: "Quick stir-fried chicken with vegetables." }
  ]
};

// ---------------------------
// DOM elements
const popup = document.getElementById('ingredientsPopup');
const primaryList = document.getElementById('primaryList');
const moreList = document.getElementById('moreList');
const noResults = document.getElementById('noResults');
const backBtn = document.getElementById('backBtn');

// Read current session ingredients
let currentSearch = JSON.parse(sessionStorage.getItem('currentSearch') || 'null');

if (!currentSearch || !Array.isArray(currentSearch) || currentSearch.length === 0) {
  window.location.href = 'pantry.html';
} else {
  popup.hidden = false;
  popup.innerHTML = `<strong>You entered:</strong> ${currentSearch.join(', ')}`;
}

// Clear previous meals
primaryList.innerHTML = '';
moreList.innerHTML = '';
noResults.hidden = true;

// ---------------------------
// Render a meal item with optional description
function renderMeal(container, title, usedIngredientsText, description = "") {
  const li = document.createElement('li');
  li.innerHTML = `<strong>${title}</strong>
                  <div style="font-size:.9rem;color:#666;margin-top:.35rem">${usedIngredientsText}</div>
                  ${description ? `<div style="font-size:.85rem;color:#555;margin-top:.25rem">${description}</div>` : ""}`;
  container.appendChild(li);
}

// ---------------------------
// Local fallback suggestion
function suggestFromLocalDB(searchItems) {
  const suggestions = [];
  searchItems.forEach(item => {
    const entry = localMealDatabase[item.toLowerCase()];
    if (entry && Array.isArray(entry)) {
      entry.forEach(e => {
        if (!suggestions.find(s => s.title === e.title)) suggestions.push(e);
      });
    }
  });
  return suggestions;
}

// ---------------------------
// Fetch meals from backend (Node server)
async function fetchMealsFromBackend(searchItems) {
  try {
    const ingredientsParam = encodeURIComponent(searchItems.join(','));
    const resp = await fetch(`http://localhost:3000/get-meals?ingredients=${ingredientsParam}`);
    if (!resp.ok) throw new Error('Backend fetch failed');
    const data = await resp.json();

    if (Array.isArray(data) && data.length > 0) {
      const primary = data.slice(0, 2);
      const more = data.slice(2, 6);

      primary.forEach(recipe => {
        const used = (recipe.usedIngredients || []).map(u => u.name).join(', ');
        renderMeal(primaryList, recipe.title, `uses: ${used}`, recipe.description || "");
      });

      more.forEach(recipe => {
        const used = (recipe.usedIngredients || []).map(u => u.name).join(', ');
        renderMeal(moreList, recipe.title, `uses: ${used}`, recipe.description || "");
      });

      return true;
    }
  } catch (err) {
    console.warn('Backend fetch failed, falling back to local DB', err);
  }
  return false;
}

// ---------------------------
// Main function
async function fetchAndShowMeals() {
  const success = await fetchMealsFromBackend(currentSearch);

  if (!success) {
    // Fallback to local DB
    const localSuggestions = suggestFromLocalDB(currentSearch);

    if (localSuggestions.length === 0) {
      noResults.hidden = false;
      noResults.textContent = "No meals found for these ingredients. Try a different ingredient.";
      return;
    }

    const primary = localSuggestions.slice(0, 2);
    const more = localSuggestions.slice(2, 6);

    primary.forEach(m => renderMeal(primaryList, m.title, `uses: ${currentSearch.join(', ')}`, m.description));
    more.forEach(m => renderMeal(moreList, m.title, `uses: ${currentSearch.join(', ')}`, m.description));
  }
}

// Run
fetchAndShowMeals();

// ---------------------------
// Back button
backBtn.addEventListener('click', () => {
  sessionStorage.removeItem('currentSearch');
  window.location.href = 'pantry.html';
});
