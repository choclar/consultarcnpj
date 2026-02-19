import { GoogleGenAI, Type } from "@google/genai";
import { BrasilAPIResponse, AIAnalysisResult } from '../types';

export const analyzeCompanyProfile = async (companyData: BrasilAPIResponse): Promise<AIAnalysisResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API Key do Gemini não encontrada.");
      throw new Error("API Key não configurada.");
    }

    // Inicializa dentro da função para garantir que as vars de ambiente estejam carregadas
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Filtrar dados para reduzir tamanho do prompt e focar no essencial
    // Isso ajuda a evitar alucinações ou erros de parse se o objeto original for muito sujo
    const relevantData = {
      razao_social: companyData.razao_social,
      nome_fantasia: companyData.nome_fantasia,
      atividade_principal: companyData.cnae_fiscal_descricao,
      data_abertura: companyData.data_inicio_atividade,
      situacao: companyData.descricao_situacao_cadastral,
      endereco: `${companyData.municipio}-${companyData.uf}`,
      natureza_juridica: companyData.qsa ? 'Com Sócios' : 'Individual/Outros',
      socios: companyData.qsa?.map(s => s.qualificacao_socio).join(', ')
    };

    const prompt = `
      Analise os dados desta empresa brasileira:
      ${JSON.stringify(relevantData)}

      Atue como um estrategista de vendas B2B experiente.
      1. Resumo: O que essa empresa faz e seu perfil de mercado.
      2. Risco: Avalie brevemente se é um cliente de baixo, médio ou alto risco para fechar negócios (baseado em tempo de atividade e sócios).
      3. Pitch: Uma frase de abertura curta e direta para vender produtos/serviços para eles.

      Retorne APENAS JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Resumo executivo curto." },
            riskAssessment: { type: Type.STRING, description: "Avaliação de risco." },
            suggestedSalesPitch: { type: Type.STRING, description: "Pitch de vendas." }
          },
          required: ["summary", "riskAssessment", "suggestedSalesPitch"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Resposta da IA vazia.");
    }

    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Erro detalhado na análise da IA:", error);
    // Return a fallback object so the UI doesn't crash completely
    return {
      summary: "Não foi possível gerar a análise. Verifique a conexão.",
      riskAssessment: "Análise indisponível no momento.",
      suggestedSalesPitch: "Utilize os dados cadastrais acima para contato."
    };
  }
};