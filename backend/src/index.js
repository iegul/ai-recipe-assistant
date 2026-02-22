import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db, { admin } from "./config/firebase.js";
import {
  generateRecipeFromText,
  analyzeImageAndGenerateRecipe,
} from "./services/aiService.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const saveRecipe = (data) =>
  db.collection("recipes").add({
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

app.post("/generate-recipe", async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients?.length) {
      return res.status(400).json({ error: "Ingredients required" });
    }

    const aiResponse = await generateRecipeFromText(ingredients);
    const docRef = await saveRecipe({
      inputType: "text",
      rawIngredients: ingredients,
      parsedIngredients: ingredients,
      ...aiResponse,
    });

    res.json({ success: true, id: docRef.id, recipe: aiResponse });
  } catch (error) {
    res.status(500).json({
      error: "AI generation failed",
      details: error.message,
      stack: error.stack,
    });
  }
});

app.post("/generate-recipe-from-image", async (req, res) => {
  try {
    const { image, mimeType = "image/jpeg" } = req.body;

    if (!image) return res.status(400).json({ error: "Image required" });

    const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "");
    const aiResponse = await analyzeImageAndGenerateRecipe(
      base64Image,
      mimeType,
    );

    const docRef = await saveRecipe({
      inputType: "image",
      rawIngredients: aiResponse.detectedIngredients,
      parsedIngredients: aiResponse.detectedIngredients,
      ...aiResponse,
    });

    res.json({
      success: true,
      id: docRef.id,
      recipe: aiResponse,
      detectedIngredients: aiResponse.detectedIngredients,
    });
  } catch (error) {
    console.error("HATA:", error.message);
    console.error("STATUS:", error.status);
    console.error("DETAILS:", JSON.stringify(error.errorDetails));
    res.status(500).json({ error: "Failed", details: error.message });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
