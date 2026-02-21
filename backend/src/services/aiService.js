import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const RECIPE_PROMPT = (ingredients) => `
Generate a recipe using these ingredients:
${ingredients.join(", ")}

Return ONLY valid JSON in this format:
{
  "recipeName": "string",
  "ingredients": [{ "name": "string", "quantity": "string" }],
  "steps": ["string"],
  "prepTime": "string",
  "difficulty": "Easy | Medium | Hard"
}
`;

export async function generateRecipeFromText(ingredients) {
  const completion = await openai.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: RECIPE_PROMPT(ingredients) }],
    temperature: 0.7,
  });

  const text = completion.choices[0].message.content;
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) throw new Error("No JSON found in AI response: " + text);

  return JSON.parse(jsonMatch[0].trim());
}

export async function analyzeImageAndGenerateRecipe(
  base64Image,
  mimeType = "image/jpeg",
) {
  // Eğer data URL ise prefix'i kaldır, değilse olduğu gibi kullan
  const cleanBase64 = base64Image.includes(",")
    ? base64Image.split(",").pop()
    : base64Image;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent([
    "List all food ingredients you can see in this image. Give me only a comma-separated list of ingredients, nothing else.",
    { inlineData: { data: cleanBase64, mimeType } },
  ]);

  const ingredientsList = result.response
    .text()
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);

  if (ingredientsList.length === 0) {
    throw new Error("No ingredients detected in image");
  }

  const recipe = await generateRecipeFromText(ingredientsList);
  return { ...recipe, detectedIngredients: ingredientsList };
}
