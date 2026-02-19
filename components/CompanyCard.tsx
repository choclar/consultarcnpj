import React from 'react';
import { BrasilAPIResponse } from '../types';
import { Building2, MapPin, Users, CheckCircle, AlertCircle, Copy, PenLine, Mail, Phone, Check } from 'lucide-react';

interface CompanyCardProps {
  data: BrasilAPIResponse;
  fantasyName: string;
  onFantasyNameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  contactPhone: string;
  onContactPhoneChange: (value: string) => void;
}

// Componente auxiliar para botão de copiar no header
const HeaderCopyBtn: React.FC<{ text: string; lightMode?: boolean }> = ({ text, lightMode = false }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita focar no input
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!text) return null;

  return (
    <button
      onClick={handleCopy}
      type="button"
      // Aumentado a área de toque para mobile (p-2 ou min-h-44px visualmente)
      className={`p-2 sm:p-1 rounded transition-colors duration-200 no-print touch-manipulation
        ${lightMode 
          ? 'text-gray-400 hover:text-pink-600 hover:bg-pink-50 active:bg-pink-100' 
          : 'text-white/70 hover:text-white hover:bg-white/20 active:bg-white/30'
        }`}
      title="Copiar dado"
    >
      {copied ? <Check size={16} className={lightMode ? "text-green-500" : "text-green-300"} /> : <Copy size={16} />}
    </button>
  );
};

const InfoRow: React.FC<{ label: string; value: string; copyable?: boolean }> = ({ label, value, copyable = true }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:py-1 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded-md transition-colors select-text group">
      <span className="text-xs font-semibold text-gray-500 sm:w-1/3 uppercase mb-1 sm:mb-0">{label}</span>
      <div className="flex items-center gap-2 flex-1 sm:justify-end min-w-0 justify-between">
        <span className="text-sm text-gray-900 font-medium break-words text-left sm:text-right selection:bg-pink-200 selection:text-pink-900" title={value}>
          {value || '-'}
        </span>
        {copyable && value && (
          <button
            onClick={handleCopy}
            className="p-2 sm:p-1 hover:bg-gray-200 rounded-md transition-colors text-gray-400 hover:text-pink-500 focus:outline-none no-print sm:opacity-0 sm:group-hover:opacity-100 active:opacity-100 touch-manipulation"
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
  // Lógica Robustecida: Confia estritamente no código numérico sanitizado pelo serviço
  // 2 = ATIVA. Qualquer outra coisa não é ativa.
  const isActive = data.situacao_cadastral === 2;
  
  // O texto já vem correto do serviço (Ex: BAIXADA, INAPTA, ATIVA)
  const statusLabel = data.descricao_situacao_cadastral || 'DESCONHECIDO';
  
  // Format Date Helper
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden select-text">
      {/* Header */}
      <div className={`p-3 sm:p-4 text-white relative transition-colors duration-300 ${isActive ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500' : 'bg-gray-600'}`}>
        <div className="flex flex-col gap-2">
          
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
               <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-[10px] uppercase font-bold opacity-80">Razão Social</h2>
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${isActive ? 'bg-green-400 text-green-900' : 'bg-red-500 text-white'}`}>
                    {statusLabel}
                  </div>
               </div>
               <div className="flex items-center gap-2 group relative">
                 <p className="text-lg sm:text-xl font-extrabold leading-tight tracking-tight selection:bg-white selection:text-pink-600 break-words pr-8">
                   {data.razao_social}
                 </p>
                 <div className="absolute right-0 top-0 sm:static sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <HeaderCopyBtn text={data.razao_social} />
                 </div>
               </div>
            </div>
          </div>
          
          {/* Editable Fields Container */}
          {/* REMOVIDO: backdrop-blur-sm para evitar artefatos no html2canvas */}
          {/* ALTERADO: bg-white/10 para bg-white/20 para melhor contraste sem blur */}
          <div className="bg-white/20 rounded-lg p-2 sm:p-3 border border-white/20 mt-1">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-2 items-end">
              
              {/* Fantasy Name */}
              <div className="md:col-span-6 relative">
                <label className="text-[10px] sm:text-[9px] uppercase font-bold text-white/80 tracking-wider flex items-center gap-1 mb-1">
                  <Building2 size={10} /> Nome Fantasia
                </label>
                <div className="relative group/input">
                  {/* ALTERADO: h-10, py-0, leading-10 para centralização vertical perfeita */}
                  <input 
                    type="text" 
                    value={fantasyName}
                    onChange={(e) => onFantasyNameChange(e.target.value)}
                    placeholder="Nome Fantasia..."
                    className="w-full bg-white/90 text-gray-900 placeholder-gray-400 rounded px-3 h-10 py-0 leading-[2.5rem] pr-10 text-base md:text-sm font-bold shadow-inner focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <HeaderCopyBtn text={fantasyName} lightMode={true} />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="md:col-span-3">
                <label className="text-[10px] sm:text-[9px] uppercase font-bold text-white/80 tracking-wider flex items-center gap-1 mb-1">
                  <Mail size={10} /> E-mail
                </label>
                <div className="relative group/input">
                  {/* ALTERADO: h-10, py-0, leading-10 */}
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    placeholder="Email..."
                    className="w-full bg-white/20 text-white placeholder-white/70 border border-white/30 rounded px-3 h-10 py-0 leading-[2.5rem] pr-10 text-base md:text-xs focus:bg-white/30 outline-none transition-all"
                  />
                   <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                    <HeaderCopyBtn text={email} />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="md:col-span-3">
                 <label className="text-[10px] sm:text-[9px] uppercase font-bold text-white/80 tracking-wider flex items-center gap-1 mb-1">
                  <Phone size={10} /> Tel/WhatsApp
                </label>
                <div className="relative group/input">
                  {/* ALTERADO: h-10, py-0, leading-10 */}
                  <input 
                    type="text" 
                    inputMode="tel"
                    value={contactPhone}
                    onChange={(e) => onContactPhoneChange(e.target.value)}
                    placeholder="Telefone..."
                    className="w-full bg-white/20 text-white placeholder-white/70 border border-white/30 rounded px-3 h-10 py-0 leading-[2.5rem] pr-10 text-base md:text-xs focus:bg-white/30 outline-none transition-all"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                    <HeaderCopyBtn text={contactPhone} />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Body */}
      <div className="p-3 sm:p-2 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
        {/* Left Column: Basic Info */}
        <div>
          <h3 className="text-xs font-bold text-gray-800 mb-2 sm:mb-1 flex items-center gap-1 border-b border-gray-100 pb-1">
            <Building2 className="text-pink-500" size={14} />
            Dados Cadastrais
          </h3>
          <div className="bg-white flex flex-col gap-1">
            <InfoRow label="CNPJ" value={data.cnpj} />
            <InfoRow label="Abertura" value={formatDate(data.data_inicio_atividade)} />
            <InfoRow label="CNAE" value={`${data.cnae_fiscal} - ${data.cnae_fiscal_descricao}`} />
            <InfoRow label="Tel. Fiscal" value={data.ddd_telefone_1} />
          </div>
        </div>

        {/* Right Column: Address */}
        <div>
          <h3 className="text-xs font-bold text-gray-800 mb-2 sm:mb-1 flex items-center gap-1 border-b border-gray-100 pb-1 mt-2 sm:mt-0">
            <MapPin className="text-blue-500" size={14} />
            Localização
          </h3>
          <div className="bg-white flex flex-col gap-1">
             <InfoRow label="Endereço" value={`${data.descricao_tipo_de_logradouro} ${data.logradouro}, ${data.numero}`} />
             <InfoRow label="Bairro" value={data.bairro} />
             <InfoRow label="Cidade/UF" value={`${data.municipio} - ${data.uf}`} />
             <InfoRow label="CEP" value={data.cep} />
          </div>
        </div>
      </div>
      
      {/* Quadro Societário */}
      {data.qsa && data.qsa.length > 0 && (
        <div className="px-3 pb-3 sm:px-2 sm:pb-2">
           <h3 className="text-xs font-bold text-gray-800 mb-2 sm:mb-1 flex items-center gap-1 border-b border-gray-100 pb-1 mt-2 sm:mt-0">
            <Users className="text-green-500" size={14} />
            Sócios
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.qsa.slice(0, 4).map((socio, index) => (
              <div key={index} className="px-3 py-2 sm:px-2 sm:py-1 bg-gray-50 rounded border border-gray-100 text-xs sm:text-[10px] flex justify-between items-center">
                <span className="font-semibold text-gray-900 truncate mr-1">{socio.nome_socio}</span>
                <span className="text-gray-500 whitespace-nowrap text-[10px]">{socio.qualificacao_socio}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};