// server.js
require("dotenv").config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// Load API key from .env
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors()); // allow frontend to talk to backend

// Endpoint to handle meal search from frontend
app.get("/get-meals", async (req, res) => {
  const ingredients = req.query.ingredients; // ?ingredients=egg,bread

  try {
    // Step 1: Fetch recipes by ingredients
    const response = await axios.get(
      "https://api.spoonacular.com/recipes/findByIngredients",
      {
        params: {
          ingredients,
          number: 5, // number of results to return
          ranking: 1,
          apiKey: process.env.API_KEY
        }
      }
    );

    const recipes = response.data;

    // Step 2: For each recipe, fetch detailed information (instructions)
    const detailedRecipes = await Promise.all(
      recipes.map(async (r) => {
        try {
          const details = await axios.get(
            `https://api.spoonacular.com/recipes/${r.id}/information`,
            {
              params: { apiKey: process.env.API_KEY }
            }
          );

         return {
  title: r.title,
  usedIngredients: r.usedIngredients,

  // add meal description
  description: details.data.summary
    ? details.data.summary.replace(/<[^>]+>/g, "").slice(0, 140) + "..."
    : "A delicious meal suggestion based on your ingredients.",

  instructions: details.data.instructions || ""
};


        } catch (err) {
          // fallback if instructions fail
          return { title: r.title, usedIngredients: r.usedIngredients, instructions: "" };
        }
      })
    );

    // Step 3: Send back array of recipes with instructions
    res.json(detailedRecipes);

  } catch (error) {
    console.error("API fetch failed:", error.message);
    res.status(500).json({ error: "API failed 😢" });
  }
});

// Start backend server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
