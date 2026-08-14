import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

const ai = API_KEY
  ? new GoogleGenAI({ apiKey: API_KEY })
  : null;

const EMBEDDING_DIMENSION = 768;

const isMockMode =
  !API_KEY || API_KEY === "dummy_for_build";

/**
 * Generate a 768-dimensional embedding for semantic search.
 *
 * Model:
 * gemini-embedding-2
 *
 * The 768 dimension must match the pgvector column
 * configured in PostgreSQL.
 */
export const generateEmbedding = async (
  text: string
): Promise<number[]> => {
  if (isMockMode) {
    return Array(EMBEDDING_DIMENSION).fill(0);
  }

  if (!ai) {
    throw new Error("Gemini AI client is not initialized");
  }

  const response = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents: text,
    config: {
      outputDimensionality: EMBEDDING_DIMENSION,
    },
  });

  const embedding = response.embeddings?.[0]?.values;

  if (!embedding || embedding.length !== EMBEDDING_DIMENSION) {
    throw new Error(
      `Invalid embedding returned by Gemini. Expected ${EMBEDDING_DIMENSION} dimensions, received ${embedding?.length ?? 0
      }.`
    );
  }

  return embedding;
};


/**
 * Ticket categorization schema.
 */
const categorySchema = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      description:
        "The support category for the ticket.",
    },

    priority: {
      type: Type.STRING,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      description:
        "The urgency/priority of the support ticket.",
    },

    confidence: {
      type: Type.NUMBER,
      description:
        "Confidence score between 0 and 1.",
    },

    reason: {
      type: Type.STRING,
      description:
        "Short explanation for the classification.",
    },
  },

  required: [
    "category",
    "priority",
    "confidence",
    "reason",
  ],
};


/**
 * Categorize a support ticket using Gemini.
 */
export const categorizeTicket = async (
  title: string,
  description: string
) => {
  if (isMockMode) {
    return {
      category: "network",
      priority: "MEDIUM",
      confidence: 0.9,
      reason: "Mock classification because GEMINI_API_KEY is not configured.",
    };
  }

  if (!ai) {
    throw new Error("Gemini AI client is not initialized");
  }

  const prompt = `
You are an expert IT service desk ticket classifier.

Classify the following support ticket.

Known organization categories include:
- network
- identity
- business-apps
- collaboration
- security
- tier-1
- tier-2

Choose the category that best matches the ticket.

Determine the priority:
- LOW: Minor issue with little operational impact.
- MEDIUM: Normal issue affecting one or a small number of users.
- HIGH: Significant operational impact or multiple users affected.
- CRITICAL: Major outage, security incident, or business-critical service disruption.

Return a confidence score between 0 and 1.

TICKET

Title:
${title}

Description:
${description}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt
  });

  let text = response.text || (response as any).output_text || "";
  if (text.startsWith("```json")) {
    text = text.replace(/^```json\n?/, "").replace(/\n?```\n?$/, "");
  }

  if (!text) {
    throw new Error(
      "Gemini returned an empty categorization response"
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Failed to parse Gemini categorization response: ${text}`
    );
  }
};


/**
 * AI incident analysis schema.
 *
 * This is used after hybrid search retrieves:
 * 1. Relevant knowledge articles
 * 2. Relevant historical incidents
 *
 * The retrieved information becomes the RAG context.
 */
const analysisSchema = {
  type: Type.OBJECT,

  properties: {
    summary: {
      type: Type.STRING,
      description:
        "Concise summary of the incident.",
    },

    category: {
      type: Type.STRING,
      description:
        "Most appropriate support category.",
    },

    categoryConfidence: {
      type: Type.NUMBER,
      description:
        "Confidence in the category from 0 to 1.",
    },

    priority: {
      type: Type.STRING,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      description:
        "Recommended incident priority.",
    },

    priorityConfidence: {
      type: Type.NUMBER,
      description:
        "Confidence in the priority from 0 to 1.",
    },

    probableCause: {
      type: Type.STRING,
      description:
        "Most likely root or contributing cause.",
    },

    troubleshootingSteps: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description:
        "Ordered troubleshooting steps.",
    },

    recommendedResolution: {
      type: Type.STRING,
      description:
        "Recommended resolution based on the retrieved context.",
    },

    confidence: {
      type: Type.NUMBER,
      description:
        "Overall confidence in the analysis from 0 to 1.",
    },
  },

  required: [
    "summary",
    "category",
    "categoryConfidence",
    "priority",
    "priorityConfidence",
    "probableCause",
    "troubleshootingSteps",
    "recommendedResolution",
    "confidence",
  ],
};


/**
 * Analyze an incident using RAG.
 *
 * retrievedArticles:
 * Knowledge-base documents returned by hybrid search.
 *
 * retrievedIncidents:
 * Historical support tickets returned by hybrid search.
 */
export const analyzeTicket = async (
  incidentRaw: any,
  retrievedArticles: any[],
  retrievedIncidents: any[]
) => {
  if (isMockMode) {
    return {
      summary: "Mock summary",
      category: "network",
      categoryConfidence: 0.9,
      priority: "HIGH",
      priorityConfidence: 0.8,
      probableCause: "Mock cause",
      troubleshootingSteps: [
        "Check service logs",
        "Verify network connectivity",
      ],
      recommendedResolution: "Mock resolution",
      confidence: 0.85,
    };
  }

  if (!ai) {
    throw new Error("Gemini AI client is not initialized");
  }

  const knowledgeContext =
    retrievedArticles.length > 0
      ? retrievedArticles
        .map(
          (article, index) => `
KNOWLEDGE ARTICLE ${index + 1}

Title:
${article.title ?? "Untitled"}

Content:
${article.content ?? ""}
`
        )
        .join("\n")
      : "No relevant knowledge articles were found.";


  const incidentContext =
    retrievedIncidents.length > 0
      ? retrievedIncidents
        .map(
          (incident, index) => `
HISTORICAL INCIDENT ${index + 1}

Title:
${incident.title ?? "Untitled"}

Description:
${incident.description ?? ""}

Category:
${incident.category ?? incident.categoryId ?? "Unknown"}

Priority:
${incident.priority ?? "Unknown"}

Resolution:
${incident.resolution ?? "Not available"}
`
        )
        .join("\n")
      : "No relevant historical incidents were found.";


  const prompt = `
You are an expert IT service desk AI.

Analyze the current incident using the retrieved organizational
knowledge and historical incidents provided below.

IMPORTANT:
- Base your recommendation primarily on the retrieved context.
- Do not invent organizational policies or historical incidents.
- If the retrieved context does not provide enough evidence,
  explicitly make a cautious recommendation.
- Do not claim certainty when evidence is insufficient.
- Use the historical incidents and knowledge articles as
  supporting evidence for your reasoning.

==============================
CURRENT INCIDENT
==============================

Title:
${incidentRaw.title ?? ""}

Description:
${incidentRaw.description ?? ""}

Current Category:
${incidentRaw.categoryId ?? "Unknown"}

Current Priority:
${incidentRaw.priority ?? "Unknown"}


==============================
RETRIEVED KNOWLEDGE ARTICLES
==============================

${knowledgeContext}


==============================
RETRIEVED HISTORICAL INCIDENTS
==============================

${incidentContext}


==============================
TASK
==============================

Provide:

1. A concise incident summary.
2. The most appropriate category.
3. Category confidence between 0 and 1.
4. Recommended priority.
5. Priority confidence between 0 and 1.
6. Probable cause.
7. Ordered troubleshooting steps.
8. Recommended resolution.
9. Overall confidence between 0 and 1.

Return only the requested structured JSON.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt
  });

  let text = response.text || (response as any).output_text || "";
  if (text.startsWith("```json")) {
    text = text.replace(/^```json\n?/, "").replace(/\n?```\n?$/, "");
  }

  if (!text) {
    throw new Error(
      "Gemini returned an empty incident analysis response"
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Failed to parse Gemini incident analysis response: ${text}`
    );
  }
};