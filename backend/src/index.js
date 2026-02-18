import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db, { admin } from "./config/firebase.js";
import {
  generateRecipeFromText,
  analyzeImageAndGenerateRecipe,
} from "./services/aiService.js";
import OpenAI from "openai";

// ÖNCE dotenv.config() çağır
dotenv.config();

const app = express();

// ÖNEMLİ: Middleware sırası doğru olmalı
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

console.log("🔥 RUNNING NEW INDEX FILE");

/* 🔹 AI TEST ENDPOINT */
app.get("/test-ai", async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: "Say hello in one sentence." }],
    });

    res.json({ text: completion.choices[0].message.content });
  } catch (error) {
    console.error("Test AI error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* 🔹 GENERATE RECIPE */
app.post("/generate-recipe", async (req, res) => {
  try {
    console.log("📥 Request received:", req.body);
    console.log("📥 Content-Type:", req.headers["content-type"]);

    const { ingredients } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: "Ingredients required" });
    }

    console.log("🔍 Generating recipe for:", ingredients);

    const aiResponse = await generateRecipeFromText(ingredients);

    console.log("✅ AI Response:", aiResponse);

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
    console.error("❌ FULL ERROR:", error);
    console.error("❌ ERROR MESSAGE:", error.message);

    res.status(500).json({
      error: "AI generation failed",
      details: error.message,
    });
  }
});
/* 🔹 GENERATE RECIPE FROM IMAGE */
app.post("/generate-recipe-from-image", async (req, res) => {
  try {
    console.log("📸 Image request received");

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image required" });
    }

    console.log("🖼️  Image received, length:", image.length);

    // base64 prefix'i temizle (varsa)
    const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "");

    console.log("🤖 Calling vision API...");

    const aiResponse = await analyzeImageAndGenerateRecipe(base64Image);

    console.log("✅ Vision AI Response:", aiResponse);

    const recipeData = {
      inputType: "image",
      rawIngredients: aiResponse.detectedIngredients,
      parsedIngredients: aiResponse.detectedIngredients,
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
      detectedIngredients: aiResponse.detectedIngredients,
    });
  } catch (error) {
    console.error("❌ Image recipe generation error:", error);
    res.status(500).json({
      error: "Failed to generate recipe from image",
      details: error.message,
    });
  }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
