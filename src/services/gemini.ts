
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, ColumnMetadata } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class GeminiService {
  static async generateSQL(
    prompt: string,
    columns: ColumnMetadata[],
    sampleData: any[]
  ): Promise<AIResponse> {
    const schemaString = columns
      .map(c => `- ${c.name} (Type: ${c.type})`)
      .join('\n');
    
    const sampleString = JSON.stringify(sampleData, null, 2);

    const systemInstruction = `
      You are AskData AI, a world-class SQL expert. 
      Convert natural language into valid, read-only SELECT statements for a browser-based AlaSQL engine.

      DATABASE SCHEMA:
      Table Name: uploaded_data
      Columns:
      ${schemaString}

      SAMPLE DATA:
      ${sampleString}

      STRICT RULES:
      1. ONLY generate SELECT statements. No UPDATE, DELETE, or DROP.
      2. Use backticks for columns with spaces: \`Total Revenue\`.
      3. Use standard SQL aggregate functions (SUM, AVG, COUNT, MIN, MAX).
      4. For dates, assume they are strings or standard JS Date formats.
      5. Output MUST be valid JSON.
      6. If you cannot fulfill the request because it is ambiguous or impossible, set isAmbiguous to true.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sql: { type: Type.STRING },
              explanation: { type: Type.STRING },
              isAmbiguous: { type: Type.BOOLEAN },
              clarificationMessage: { type: Type.STRING }
            },
            required: ['sql', 'explanation', 'isAmbiguous']
          }
        }
      });

      return JSON.parse(response.text || '{}') as AIResponse;
    } catch (error) {
      console.error('Gemini Error:', error);
      throw new Error('AI was unable to process this request. Try simpler phrasing.');
    }
  }
}
