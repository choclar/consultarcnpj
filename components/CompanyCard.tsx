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
    e.stopPropagation(); // Evita focar no input se estiver dentro de um label/div
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
      className={`p-1 rounded transition-colors duration-200 no-print 
        ${lightMode 
          ? 'text-gray-400 hover:text-pink-600 hover:bg-pink-50' 
          : 'text-white/70 hover:text-white hover:bg-white/20'
        }`}
      title="Copiar dado"
    >
      {copied ? <Check size={14} className={lightMode ? "text-green-500" : "text-green-300"} /> : <Copy size={14} />}
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
    <div className="flex flex-row items-center justify-between py-1 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded-md transition-colors select-text group">
      <span className="text-xs font-semibold text-gray-500 w-1/3 uppercase">{label}</span>
      <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
        <span className="text-xs sm:text-sm text-gray-900 font-medium break-words text-right selection:bg-pink-200 selection:text-pink-900" title={value}>
          {value || '-'}
        </span>
        {copyable && value && (
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-gray-200 rounded-md transition-colors text-gray-400 hover:text-pink-500 focus:outline-none no-print opacity-0 group-hover:opacity-100"
            title="Copiar"
          >
            {copied ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} />}
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
  // Correção Lógica Situação Cadastral
  const rawStatus = data.situacao_cadastral;
  const statusDesc = data.descricao_situacao_cadastral || '';
  
  const isActive = String(rawStatus) === '2' || 
                   statusDesc.toUpperCase() === 'ATIVA' || 
                   statusDesc.toUpperCase() === 'ATIVO';

  // Texto a ser exibido no badge
  const statusLabel = isActive ? 'ATIVA' : (statusDesc || 'INATIVA');
  
  // Format Date Helper
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden select-text">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-3 text-white relative">
        <div className="flex flex-col gap-1">
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
               <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-[10px] uppercase font-bold opacity-80">Razão Social</h2>
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${isActive ? 'bg-green-400 text-green-900' : 'bg-red-400 text-white'}`}>
                    {statusLabel}
                  </div>
               </div>
               <div className="flex items-center gap-2 group">
                 <p className="text-lg font-extrabold leading-tight tracking-tight selection:bg-white selection:text-pink-600">{data.razao_social}</p>
                 <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <HeaderCopyBtn text={data.razao_social} />
                 </div>
               </div>
            </div>
          </div>
          
          {/* Editable Fields Container */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20 mt-1">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
              
              {/* Fantasy Name */}
              <div className="md:col-span-6 relative">
                <label className="text-[9px] uppercase font-bold text-white/80 tracking-wider flex items-center gap-1 mb-0.5">
                  <Building2 size={10} /> Nome Fantasia
                </label>
                <div className="relative group/input">
                  <input 
                    type="text" 
                    value={fantasyName}
                    onChange={(e) => onFantasyNameChange(e.target.value)}
                    placeholder="Nome Fantasia..."
                    className="w-full bg-white/90 text-gray-900 placeholder-gray-400 rounded px-2 py-1 pr-8 text-sm font-bold shadow-inner focus:ring-1 focus:ring-yellow-400 outline-none transition-all"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <HeaderCopyBtn text={fantasyName} lightMode={true} />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="md:col-span-3">
                <label className="text-[9px] uppercase font-bold text-white/80 tracking-wider flex items-center gap-1 mb-0.5">
                  <Mail size={10} /> E-mail
                </label>
                <div className="relative group/input">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    placeholder="Email..."
                    className="w-full bg-white/20 text-white placeholder-white/50 border border-white/30 rounded px-2 py-1 pr-8 text-xs focus:bg-white/30 outline-none transition-all"
                  />
                   <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                    <HeaderCopyBtn text={email} />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="md:col-span-3">
                 <label className="text-[9px] uppercase font-bold text-white/80 tracking-wider flex items-center gap-1 mb-0.5">
                  <Phone size={10} /> Tel/WhatsApp
                </label>
                <div className="relative group/input">
                  <input 
                    type="text" 
                    value={contactPhone}
                    onChange={(e) => onContactPhoneChange(e.target.value)}
                    placeholder="Telefone..."
                    className="w-full bg-white/20 text-white placeholder-white/50 border border-white/30 rounded px-2 py-1 pr-8 text-xs focus:bg-white/30 outline-none transition-all"
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
      <div className="p-2 grid grid-cols-2 gap-4">
        {/* Left Column: Basic Info */}
        <div>
          <h3 className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1 border-b border-gray-100 pb-1">
            <Building2 className="text-pink-500" size={14} />
            Dados Cadastrais
          </h3>
          <div className="bg-white">
            <InfoRow label="CNPJ" value={data.cnpj} />
            <InfoRow label="Abertura" value={formatDate(data.data_inicio_atividade)} />
            <InfoRow label="CNAE" value={`${data.cnae_fiscal} - ${data.cnae_fiscal_descricao}`} />
            <InfoRow label="Tel. Fiscal" value={data.ddd_telefone_1} />
          </div>
        </div>

        {/* Right Column: Address */}
        <div>
          <h3 className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1 border-b border-gray-100 pb-1">
            <MapPin className="text-blue-500" size={14} />
            Localização
          </h3>
          <div className="bg-white">
             <InfoRow label="Endereço" value={`${data.descricao_tipo_de_logradouro} ${data.logradouro}, ${data.numero}`} />
             <InfoRow label="Bairro" value={data.bairro} />
             <InfoRow label="Cidade/UF" value={`${data.municipio} - ${data.uf}`} />
             <InfoRow label="CEP" value={data.cep} />
          </div>
        </div>
      </div>
      
      {/* Quadro Societário */}
      {data.qsa && data.qsa.length > 0 && (
        <div className="px-2 pb-2">
           <h3 className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1 border-b border-gray-100 pb-1">
            <Users className="text-green-500" size={14} />
            Sócios
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {data.qsa.slice(0, 4).map((socio, index) => (
              <div key={index} className="px-2 py-1 bg-gray-50 rounded border border-gray-100 text-[10px] flex justify-between items-center">
                <span className="font-semibold text-gray-900 truncate mr-1">{socio.nome_socio}</span>
                <span className="text-gray-500 whitespace-nowrap hidden sm:inline">{socio.qualificacao_socio}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};