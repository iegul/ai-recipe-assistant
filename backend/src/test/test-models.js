// test-models.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listAvailableModels() {
  try {
    console.log("🔍 Checking available Gemini models...\n");

    const models = await genAI.listModels();

    console.log("✅ Available models:\n");
    for await (const model of models) {
      console.log(`📦 ${model.name}`);
      console.log(
        `   Supported: ${model.supportedGenerationMethods.join(", ")}`,
      );
      console.log("");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

listAvailableModels();
