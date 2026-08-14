import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_for_build'
});

export const generateEmbedding = async (text: string): Promise<number[]> => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_for_build') {
    return Array(1536).fill(0); // mock for tests
  }
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
};

const CategorySchema = z.object({
  category: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  confidence: z.number(),
  reason: z.string(),
});

export const categorizeTicket = async (title: string, description: string) => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_for_build') {
     return { category: 'network', priority: 'MEDIUM', confidence: 0.9, reason: 'Mock due to missing API key' };
  }
  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Categorize the following support ticket into one of the known organization categories (e.g. network, identity, business-apps, collaboration, security). Determine priority (LOW, MEDIUM, HIGH, CRITICAL)." },
      { role: "user", content: `Title: ${title}\nDescription: ${description}` }
    ],
    response_format: zodResponseFormat(CategorySchema, "categorization"),
  });
  return completion.choices[0].message.parsed as any;
};

const AnalysisSchema = z.object({
  summary: z.string(),
  category: z.string(),
  categoryConfidence: z.number(),
  priority: z.string(),
  priorityConfidence: z.number(),
  probableCause: z.string(),
  troubleshootingSteps: z.array(z.string()),
  recommendedResolution: z.string(),
  confidence: z.number(),
});

export const analyzeTicket = async (incidentRaw: any, retrievedArticles: any[], retrievedIncidents: any[]) => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_for_build') {
     return {
         summary: 'Mock summary',
         category: 'network', categoryConfidence: 0.9,
         priority: 'HIGH', priorityConfidence: 0.8,
         probableCause: 'Mock cause',
         troubleshootingSteps: ['Step 1'],
         recommendedResolution: 'Mock resolution',
         confidence: 0.85
     };
  }

  const prompt = `CURRENT INCIDENT
Title: ${incidentRaw.title}
Description: ${incidentRaw.description}
Category: ${incidentRaw.categoryId || 'unknown'}

RETRIEVED KNOWLEDGE ARTICLES
${retrievedArticles.map((a, i) => `Article ${i+1}: ${a.title} - ${a.content}`).join('\n')}

RETRIEVED HISTORICAL INCIDENTS
${retrievedIncidents.map((inc, i) => `Incident ${i+1}: ${inc.title} - ${inc.description}`).join('\n')}
`;
  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an expert IT service desk AI. Analyze the current incident using the provided context." },
      { role: "user", content: prompt }
    ],
    response_format: zodResponseFormat(AnalysisSchema, "analysis"),
  });
  return completion.choices[0].message.parsed as any;
};
