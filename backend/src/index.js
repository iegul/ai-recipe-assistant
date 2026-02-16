import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db, { admin } from "./config/firebase.js";
import { generateRecipeFromText } from "./services/aiService.js";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

console.log("🔥 RUNNING NEW INDEX FILE");

/* 🔹 AI TEST ENDPOINT */
app.get("/test-ai", async (req, res) => {
  const completion = await openai.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: "Say hello in one sentence." }],
  });

  res.json({ text: completion.choices[0].message.content });
});

/* 🔹 GENERATE RECIPE */
app.post("/generate-recipe", async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: "Ingredients required" });
    }

    const aiResponse = await generateRecipeFromText(ingredients);

    const recipeData = {
      inputType: "text",
      rawIngredients: ingredients,
      parsedIngredients: ingredients,
      recipeName: aiResponse.recipeName,
      ingredients: aiResponse.ingredients,
      steps: aiResponse.steps,
      prepTime: aiResponse.prepTime,
      difficulty: aiResponse.difficulty,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("recipes").add(recipeData);

    res.json({
      success: true,
      id: docRef.id,
      recipe: recipeData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI generation failed" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
