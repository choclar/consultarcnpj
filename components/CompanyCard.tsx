import React from 'react';
import { BrasilAPIResponse } from '../types';
import { Building2, MapPin, Users, CheckCircle, AlertCircle, Copy, PenLine, Mail, Phone } from 'lucide-react';

interface CompanyCardProps {
  data: BrasilAPIResponse;
  fantasyName: string;
  onFantasyNameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  contactPhone: string;
  onContactPhoneChange: (value: string) => void;
}

const InfoRow: React.FC<{ label: string; value: string; copyable?: boolean }> = ({ label, value, copyable = true }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded-md transition-colors">
      <span className="text-sm font-medium text-gray-500 mb-1 sm:mb-0 w-1/3">{label}</span>
      <div className="flex items-center gap-2 flex-1 sm:justify-end min-w-0">
        <span className="text-sm text-gray-900 font-medium truncate max-w-full block" title={value}>
          {value || '-'}
        </span>
        {copyable && value && (
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-gray-200 rounded-md transition-colors text-gray-400 hover:text-pink-500 focus:outline-none"
            title="Copiar"
          >
            {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
};

export const CompanyCard: React.FC<CompanyCardProps> = ({ 
  data, 
  fantasyName, 
  onFantasyNameChange,
  email,
  onEmailChange,
  contactPhone,
  onContactPhoneChange
}) => {
  const isActive = data.situacao_cadastral === '2' || data.situacao_cadastral === 'ATIVO' || data.situacao_cadastral === 'Ativa'; 
  
  // Format Date Helper
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header with CHOC-LAR Theme Gradient */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-6 text-white relative">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="flex-1 w-full">
             <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-bold opacity-90 mb-1">Razão Social:</h2>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 shrink-0 ${isActive ? 'bg-green-400 text-green-900' : 'bg-red-400 text-white'} md:hidden`}>
                  {isActive ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                  {data.situacao_cadastral}
                </div>
             </div>
             <p className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight mb-4">{data.razao_social}</p>
            
            {/* Editable Fields Container - High Visibility */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mt-2">
              
              {/* Fantasy Name Row */}
              <div className="mb-4">
                <label className="text-xs uppercase font-bold text-white/80 tracking-wider flex items-center gap-2 mb-1">
                  <Building2 size={14} /> Nome Fantasia (Editável)
                </label>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={fantasyName}
                    onChange={(e) => onFantasyNameChange(e.target.value)}
                    placeholder="Digite o nome fantasia..."
                    className="w-full bg-white/90 text-gray-900 placeholder-gray-400 rounded-md py-2 px-3 text-lg font-bold shadow-inner focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                  />
                  <PenLine size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Email & Phone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/80 tracking-wider flex items-center gap-2 mb-1">
                    <Mail size={12} /> E-mail (Editável)
                  </label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => onEmailChange(e.target.value)}
                      placeholder="email@empresa.com"
                      className="w-full bg-white/20 text-white placeholder-white/50 border border-white/30 rounded-md py-1.5 px-3 text-sm focus:bg-white/30 focus:border-white outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                   <label className="text-[10px] uppercase font-bold text-white/80 tracking-wider flex items-center gap-2 mb-1">
                    <Phone size={12} /> WhatsApp/Contato (Editável)
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={contactPhone}
                      onChange={(e) => onContactPhoneChange(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="w-full bg-white/20 text-white placeholder-white/50 border border-white/30 rounded-md py-1.5 px-3 text-sm focus:bg-white/30 focus:border-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide hidden md:flex items-center gap-1 shrink-0 ${isActive ? 'bg-green-400 text-green-900' : 'bg-red-400 text-white'}`}>
             {isActive ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
             {data.situacao_cadastral}
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Basic Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 className="text-pink-500" size={20} />
            Dados Cadastrais
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 p-1">
            <InfoRow label="CNPJ" value={data.cnpj} />
            <InfoRow label="Abertura" value={formatDate(data.data_inicio_atividade)} />
            <InfoRow label="CNAE Principal" value={`${data.cnae_fiscal} - ${data.cnae_fiscal_descricao}`} />
            <InfoRow label="Telefone Fiscal" value={data.ddd_telefone_1} />
          </div>
        </div>

        {/* Right Column: Address */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="text-blue-500" size={20} />
            Localização
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 p-1">
             <InfoRow label="Logradouro" value={`${data.descricao_tipo_de_logradouro} ${data.logradouro}`} />
             <InfoRow label="Número" value={data.numero} />
             <InfoRow label="Complemento" value={data.complemento} />
             <InfoRow label="Bairro" value={data.bairro} />
             <InfoRow label="Cidade/UF" value={`${data.municipio} - ${data.uf}`} />
             <InfoRow label="CEP" value={data.cep} />
          </div>
        </div>
      </div>
      
      {/* Quadro Societário (if available) */}
      {data.qsa && data.qsa.length > 0 && (
        <div className="px-6 pb-6">
           <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="text-green-500" size={20} />
            Quadro Societário
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.qsa.map((socio, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                <p className="font-semibold text-gray-900">{socio.nome_socio}</p>
                <p className="text-gray-500">{socio.qualificacao_socio}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};