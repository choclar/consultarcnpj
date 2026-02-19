import { BrasilAPIResponse } from '../types';

// Mapeamento oficial de códigos de situação cadastral da Receita Federal
const STATUS_MAP: Record<number, string> = {
  1: 'NULA',
  2: 'ATIVA',
  3: 'SUSPENSA',
  4: 'INAPTA',
  8: 'BAIXADA'
};

export const fetchCompanyData = async (cnpj: string): Promise<BrasilAPIResponse> => {
  // Remove non-numeric characters
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  if (cleanCNPJ.length !== 14) {
    throw new Error('CNPJ inválido. Certifique-se de que há 14 dígitos.');
  }

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('CNPJ não encontrado na base de dados.');
      }
      throw new Error('Erro ao consultar a API. Tente novamente mais tarde.');
    }

    const data = await response.json();

    // --- NORMALIZAÇÃO E TRATAMENTO DE DADOS ---
    
    // 1. Forçar situacao_cadastral para número para comparações seguras
    const statusCode = Number(data.situacao_cadastral);
    data.situacao_cadastral = isNaN(statusCode) ? 0 : statusCode;

    // 2. Garantir que a descrição bate com o código oficial
    // Isso corrige casos onde a API retorna código 8 mas texto confuso, ou código 2 e texto vazio
    if (STATUS_MAP[data.situacao_cadastral]) {
      data.descricao_situacao_cadastral = STATUS_MAP[data.situacao_cadastral];
    } else {
      // Fallback se não tiver descrição mas tiver código desconhecido
      data.descricao_situacao_cadastral = data.descricao_situacao_cadastral || 'SITUAÇÃO DESCONHECIDA';
    }

    // 3. Garantir valores padrão para campos opcionais para evitar erros de renderização
    data.nome_fantasia = data.nome_fantasia || '';
    data.email = data.email || '';
    data.ddd_telefone_1 = data.ddd_telefone_1 || '';
    data.complemento = data.complemento || '';
    data.qsa = data.qsa || [];

    return data as BrasilAPIResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao buscar dados da empresa.');
  }
};