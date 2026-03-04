
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UploadedFile } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;
  private modelName = 'gemini-2.5-flash';

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable is not defined");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeDocuments(
    files: UploadedFile[],
    userPrompt: string,
    onStream?: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<string> {
    const fileParts = files.map(file => ({
      inlineData: {
        data: file.base64,
        mimeType: file.type
      }
    }));

    const systemInstruction = `
      You are a world-class M&A Due Diligence analyst and financial auditor. 
      You are provided with multiple complete financial/legal documents (10-Ks, 10-Qs, or Annual Reports).
      
      Your objective is to provide a high-fidelity, consolidated intelligence report that is:
      1. HUMAN READABLE & EXECUTIVE READY: Use clear headings, professional bolding, and bullet points.
      2. DEEPLY ANALYTICAL & COMPARATIVE: When multiple entities/documents are provided, you MUST compare them side-by-side. Identify shifts in disclosure language, hidden liabilities, and strategic discrepancies between entities.
      3. CITATION-BACKED: Every figure, quote, or claim MUST have a specific citation like [Entity Name, Page #].
      4. CLEARLY PARSED: Break down complex legalese into actionable insights.
      
      When analyzing or comparing:
      - Identify thematic clusters (e.g., Supply Chain, Geopolitical, IP Litigation).
      - Contrast the 'Perceived Severity' - note if one company uses more urgent language than its peers.
      - Highlight unique vulnerabilities that appear in only one entity's filings.
      
      Formatting Requirements:
      - YOU MUST USE Markdown Tables for ALL comparative data placing entities side-by-side for easy benchmarking.
      - Use H2 and H3 headers to separate the analysis into logical sections.
      - Use bold text for key dollar figures and percentages.
      - Ensure the output is clean and professional for a C-suite audience.
    `;

    const contextHeader = `You are analyzing the following document(s): ${files.map(f => f.name).join(', ')}\n\nUser Query: `;
    const enrichedPrompt = contextHeader + userPrompt;

    try {
      if (onStream) {
        const stream = await this.ai.models.generateContentStream({
          model: this.modelName,
          contents: {
            parts: [...fileParts, { text: enrichedPrompt }]
          },
          config: {
            systemInstruction,
            temperature: 0.1,
            thinkingConfig: { thinkingBudget: 16000 }
          }
        });

        if (signal?.aborted) {
          const err = new Error('AbortError');
          err.name = 'AbortError';
          throw err;
        }

        let fullText = "";
        for await (const chunk of stream) {
          if (signal?.aborted) {
            const err = new Error('AbortError');
            err.name = 'AbortError';
            throw err;
          }
          const text = chunk.text || "";
          fullText += text;
          onStream(text);
        }
        return fullText;
      } else {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
          model: this.modelName,
          contents: {
            parts: [...fileParts, { text: enrichedPrompt }]
          },
          config: {
            systemInstruction,
            temperature: 0.1,
            thinkingConfig: { thinkingBudget: 16000 }
          }
        });
        return response.text || "No response generated.";
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}
