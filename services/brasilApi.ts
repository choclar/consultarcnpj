import { BrasilAPIResponse } from '../types';

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
    return data as BrasilAPIResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao buscar dados da empresa.');
  }
};