/**
 * TheMealDB API utility for fetching meal data
 * Free API: https://www.themealdb.com/api.php
 */

// List of popular meal search terms to fetch diverse food items
const MEAL_CATEGORIES = [
  'Breakfast',
  'Pasta',
  'Curry',
  'Pizza',
  'Salad',
  'Sandwich',
  'Seafood',
  'Vegetarian'
];

/**
 * Fetch meals from TheMealDB API by first letter
 * @param {string} letter - First letter of meal name
 * @returns {Promise<Array>} Array of meals
 */
export const fetchMealsByFirstLetter = async (letter) => {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error(`Error fetching meals for letter ${letter}:`, error);
    return [];
  }
};

/**
 * Fetch meals from TheMealDB API by category
 * @param {string} category - Meal category
 * @returns {Promise<Array>} Array of meals
 */
export const fetchMealsByCategory = async (category) => {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error(`Error fetching meals for category ${category}:`, error);
    return [];
  }
};

/**
 * Fetch all ingredients
 * @returns {Promise<Array>} Array of ingredients
 */
export const fetchAllIngredients = async () => {
  try {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?i=list');
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return [];
  }
};

/**
 * Convert TheMealDB meal to app food format
 * @param {Object} meal - Meal object from TheMealDB
 * @param {string} id - Custom ID
 * @param {string} category - Food category
 * @returns {Object} Formatted food object
 */
export const convertMealToFood = (meal, id, category) => {
  return {
    _id: id,
    name: meal.strMeal || 'Unknown Meal',
    image: meal.strMealThumb || '',
    price: Math.floor(Math.random() * (2000 - 800 + 1)) + 800, // Random price between 800-2000 INR
    description: meal.strInstructions ? meal.strInstructions.substring(0, 100) + '...' : 'Delicious food item',
    category: category,
    apiId: meal.idMeal,
    // Additional fields
    cuisine: meal.strArea || 'Indian',
    tags: meal.strTags ? meal.strTags.split(',') : [],
    ingredients: meal.strIngredient1 ? [
      meal.strIngredient1, meal.strIngredient2, meal.strIngredient3,
      meal.strIngredient4, meal.strIngredient5
    ].filter(Boolean) : []
  };
};

/**
 * Fetch diverse food items from TheMealDB API
 * @param {number} limit - Maximum number of items to fetch
 * @returns {Promise<Array>} Array of formatted food objects
 */
export const fetchFoodFromAPI = async (limit = 20) => {
  const foods = [];
  const seenIds = new Set();
  let foodId = 100; // Start ID after existing 32 items

  try {
    // Fetch meals from different letters to get diverse items
    const letters = ['a', 'b', 'c', 'd', 'f', 'p', 's', 't'];
    
    for (const letter of letters) {
      if (foods.length >= limit) break;

      const meals = await fetchMealsByFirstLetter(letter);
      
      for (const meal of meals) {
        if (foods.length >= limit) break;
        if (!seenIds.has(meal.idMeal)) {
          seenIds.add(meal.idMeal);
          
          // Determine category based on meal name
          let category = 'Salad'; // default
          const mealName = meal.strMeal.toLowerCase();
          
          if (mealName.includes('pasta') || mealName.includes('noodle')) category = 'Pasta';
          else if (mealName.includes('sandwich')) category = 'Sandwich';
          else if (mealName.includes('cake') || mealName.includes('dessert') || mealName.includes('pie')) category = 'Cake';
          else if (mealName.includes('roll')) category = 'Rolls';
          else if (mealName.includes('veg') || mealName.includes('vegetable')) category = 'Pure Veg';
          else if (mealName.includes('pizza') || mealName.includes('bread')) category = 'Sandwich';
          
          const food = convertMealToFood(meal, String(foodId++), category);
          foods.push(food);
        }
      }

      // Small delay to avoid API rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`✓ Fetched ${foods.length} food items from TheMealDB API`);
    return foods;

  } catch (error) {
    console.error('Error fetching food from API:', error);
    return foods;
  }
};

/**
 * Fetch meals by category from TheMealDB
 * @param {string} category - Category to fetch
 * @param {number} startId - Starting ID for foods
 * @returns {Promise<Array>} Array of formatted food objects
 */
export const fetchFoodByCategory = async (category, startId = 100) => {
  const foods = [];
  let foodId = startId;

  try {
    const meals = await fetchMealsByCategory(category);
    
    meals.slice(0, 10).forEach(meal => {
      const food = convertMealToFood(meal, String(foodId++), category);
      foods.push(food);
    });

    return foods;

  } catch (error) {
    console.error(`Error fetching foods for category ${category}:`, error);
    return foods;
  }
};

export default {
  fetchMealsByFirstLetter,
  fetchMealsByCategory,
  fetchFoodFromAPI,
  fetchFoodByCategory,
  convertMealToFood,
  fetchAllIngredients
};
