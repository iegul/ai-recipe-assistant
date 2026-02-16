import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function generateRecipeFromText(ingredients) {
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

  const completion = await openai.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const text = completion.choices[0].message.content;
  const cleaned = text.replace(/```json|```/g, "").trim();

  return JSON.parse(cleaned);
}
