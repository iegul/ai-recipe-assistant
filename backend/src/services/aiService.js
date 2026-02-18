import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Groq için (tarif oluşturma)
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Gemini için (vision)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Metin input için
export async function generateRecipeFromText(ingredients) {
  try {
    const prompt = `
Generate a recipe using these ingredients:
${ingredients.join(", ")}

Return ONLY valid JSON in this format:

{
  "recipeName": "string",
  "ingredients": [
    { "name": "string", "quantity": "string" }
  ],
  "steps": ["string"],
  "prepTime": "string",
  "difficulty": "Easy | Medium | Hard"
}
`;

    console.log("🤖 Calling Groq API...");

    const completion = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;
    console.log("📄 Raw AI response:", text); // Debug için

    // ✅ JSON bloğunu regex ile bul
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response: " + text);
    }
    const cleaned = jsonMatch[0].trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("❌ Groq API error:", error);
    throw error;
  }
}
// Görsel input için - GEMİNİ 2.5 FLASH
export async function analyzeImageAndGenerateRecipe(base64Image) {
  try {
    console.log("🔍 Analyzing image with Gemini 2.5 Flash...");

    // ✅ BASE64 TEMİZLİĞİ
    let cleanBase64 = base64Image;

    if (base64Image.includes(",")) {
      cleanBase64 = base64Image.split(",")[1];
    }

    cleanBase64 = cleanBase64.replace(/^\//, "");
    cleanBase64 = cleanBase64.replace(/\s/g, "");

    console.log("📸 Base64 length after cleaning:", cleanBase64.length);

    // ✅ GÜNCEL MODEL: gemini-2.5-flash (vision desteği var)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt =
      "List all food ingredients you can see in this image. Give me only a comma-separated list of ingredients, nothing else.";

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const ingredientsText = response.text();

    console.log("📄 Gemini response:", ingredientsText);

    const ingredientsList = ingredientsText
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    if (ingredientsList.length === 0) {
      throw new Error("No ingredients detected in image");
    }

    console.log("🔍 Detected ingredients:", ingredientsList);

    // Groq ile tarif oluştur
    const recipe = await generateRecipeFromText(ingredientsList);

    return {
      ...recipe,
      detectedIngredients: ingredientsList,
    };
  } catch (error) {
    console.error("❌ Vision error:", error);
    console.error("❌ Error details:", error.message);
    throw error;
  }
}
