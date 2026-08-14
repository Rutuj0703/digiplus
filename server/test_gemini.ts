import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

async function runTest() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let log = "";

  try {
    const genRes = await ai.interactions.create({
      model: "gemini-3.1-flash-lite",
      input: "Reply with exactly 'Gemini works'"
    });
    // Check .text or similar on response
    log += "Gen: " + (genRes as any).text + "\n" + JSON.stringify(genRes, null, 2) + "\n";
  } catch (err: any) {
    log += `Gen failed: ${err.message}\n${err.stack}\n`;
  }

  try {
    const embRes = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: "Test embedding",
      config: {
        outputDimensionality: 768
      }
    });
    log += `Emb exists: ${!!embRes.embeddings?.[0]?.values}\nEmb length: ${embRes.embeddings?.[0]?.values?.length}\n`;
  } catch(err: any) {
    log += `Emb failed: ${err.message}\n`;
  }

  fs.writeFileSync('error_log.txt', log, 'utf8');
}
runTest();
