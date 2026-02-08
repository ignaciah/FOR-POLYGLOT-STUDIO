"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function generateTranslation(prompt: string) {
  try {
    // We use gemini-1.5-flash for speed and cost-efficiency
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return { success: true, data: text };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { success: false, error: "Failed to generate content" };
  }
}
