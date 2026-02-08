import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  // Start the streaming request
  const result = await model.generateContentStream(prompt);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        controller.enqueue(encoder.encode(chunkText));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
