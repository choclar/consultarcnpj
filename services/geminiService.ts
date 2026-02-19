import { GoogleGenAI, Type } from "@google/genai";
import { BrasilAPIResponse, AIAnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCompanyProfile = async (companyData: BrasilAPIResponse): Promise<AIAnalysisResult> => {
  try {
    const prompt = `
      Analise os seguintes dados de uma empresa brasileira obtidos via CNPJ:
      ${JSON.stringify(companyData)}

      Por favor, forneça:
      1. Um resumo executivo do perfil da empresa (atividade principal, tempo de mercado, localização).
      2. Uma avaliação simples de risco baseada na situação cadastral e sócios (informal, apenas indicativo).
      3. Uma sugestão de abordagem comercial (pitch) curta para vender serviços B2B para esta empresa.

      Responda estritamente em JSON seguindo o schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Resumo executivo da empresa." },
            riskAssessment: { type: Type.STRING, description: "Avaliação de risco cadastral." },
            suggestedSalesPitch: { type: Type.STRING, description: "Pitch de vendas sugerido." }
          },
          required: ["summary", "riskAssessment", "suggestedSalesPitch"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Não foi possível gerar a análise da IA.");
    }

    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Erro na análise da IA:", error);
    // Return a fallback object so the UI doesn't crash completely
    return {
      summary: "Não foi possível gerar o resumo automático no momento.",
      riskAssessment: "Análise indisponível.",
      suggestedSalesPitch: "Recomendamos uma abordagem padrão baseada nos dados cadastrais."
    };
  }
};