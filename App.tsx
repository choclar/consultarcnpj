import React, { useState, useEffect } from 'react';
import { Search, Loader2, ArrowRight, Share2, Copy, Check, MessageCircle } from 'lucide-react';
import { fetchCompanyData } from './services/brasilApi';
import { analyzeCompanyProfile } from './services/geminiService';
import { CompanyCard } from './components/CompanyCard';
import { AIAnalysisSection } from './components/AIAnalysisSection';
import { BrasilAPIResponse, AIAnalysisResult, LoadingState } from './types';

const App: React.FC = () => {
  const [cnpjInput, setCnpjInput] = useState('');
  const [companyData, setCompanyData] = useState<BrasilAPIResponse | null>(null);
  
  // Editable fields state
  const [fantasyName, setFantasyName] = useState('');
  const [email, setEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [aiStatus, setAiStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  // Estado para o loading do compartilhamento
  const [isSharing, setIsSharing] = useState(false);

  // DETECÇÃO DE DISPOSITIVO E S.O.
  useEffect(() => {
    const detectDevice = () => {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
      const body = document.body;
      
      // Detectar SO
      if (/android/i.test(ua)) body.classList.add('os-android');
      if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) body.classList.add('os-ios');
      if (/Win/.test(ua)) body.classList.add('os-windows');
      if (/Mac/.test(ua) && !/iPhone|iPad|iPod/.test(ua)) body.classList.add('os-mac');

      // Detectar Tipo
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      if (isMobile) {
        body.classList.add('is-mobile');
      } else {
        body.classList.add('is-desktop');
      }

      // Detectar Touch
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        body.classList.add('is-touch');
      }
    };

    detectDevice();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Simple mask logic: 00.000.000/0000-00
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 14) v = v.slice(0, 14);
    
    // Apply formatting
    v = v.replace(/^(\d{2})(\d)/, "$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
    
    setCnpjInput(v);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cnpjInput.length < 14) {
        setErrorMsg('Por favor, digite um CNPJ completo.');
        return;
    }

    setStatus(LoadingState.LOADING);
    setAiStatus(LoadingState.IDLE);
    setErrorMsg('');
    setCompanyData(null);
    
    // Reset editable fields
    setFantasyName('');
    setEmail('');
    setContactPhone('');
    
    setAnalysis(null);

    try {
      const data = await fetchCompanyData(cnpjInput);
      setCompanyData(data);
      
      // Pre-fill editable fields from API data if available
      setFantasyName(data.nome_fantasia || ''); 
      setEmail(data.email || '');
      setContactPhone(data.ddd_telefone_1 || '');

      setStatus(LoadingState.SUCCESS);

      // Trigger AI Analysis in parallel but don't block UI
      setAiStatus(LoadingState.LOADING);
      analyzeCompanyProfile(data)
        .then(result => {
          setAnalysis(result);
          setAiStatus(LoadingState.SUCCESS);
        })
        .catch(err => {
          console.error(err);
          setAiStatus(LoadingState.ERROR);
        });

    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao buscar dados.');
      setStatus(LoadingState.ERROR);
    }
  };

  // Helper to get text status
  const getStatusText = (data: BrasilAPIResponse) => {
    const raw = String(data.situacao_cadastral);
    const desc = data.descricao_situacao_cadastral || '';
    if (raw === '2' || desc.toUpperCase() === 'ATIVA') return 'ATIVA';
    return desc || 'INATIVA';
  };

  const handleCopyData = () => {
    if (!companyData) return;

    const statusText = getStatusText(companyData);

    const textData = `
DADOS DA EMPRESA (CHOC-LAR)
---------------------------
Razão Social: ${companyData.razao_social}
CNPJ: ${companyData.cnpj}
Nome Fantasia: ${fantasyName || 'N/A'}
Situação: ${statusText}
Data Abertura: ${companyData.data_inicio_atividade}

CONTATO
-------
Email: ${email || 'N/A'}
Telefone/WhatsApp: ${contactPhone || companyData.ddd_telefone_1 || 'N/A'}

ENDEREÇO
--------
${companyData.descricao_tipo_de_logradouro} ${companyData.logradouro}, ${companyData.numero} ${companyData.complemento}
Bairro: ${companyData.bairro}
Cidade: ${companyData.municipio} - ${companyData.uf}
CEP: ${companyData.cep}

SÓCIOS
------
${companyData.qsa?.map(s => `- ${s.nome_socio} (${s.qualificacao_socio})`).join('\n') || 'Sem informação de sócios'}

RESUMO IA
---------
${analysis?.summary || 'N/A'}

PITCH SUGERIDO
--------------
${analysis?.suggestedSalesPitch || 'N/A'}
    `.trim();

    navigator.clipboard.writeText(textData);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!companyData) return;
    setIsSharing(true);

    // Pequeno delay para garantir renderização de estados visuais
    await new Promise(resolve => setTimeout(resolve, 100));

    const element = document.getElementById('report-content');
    if (!element) {
        setIsSharing(false);
        return;
    }

    // Configurações otimizadas para mobile
    const isMobile = window.innerWidth < 768;
    
    const opt = {
      margin: 5,
      filename: `Relatorio_${companyData.cnpj}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { 
        scale: isMobile ? 1.5 : 2, // Reduz escala no mobile para evitar crash de memória
        useCORS: true, 
        letterRendering: true,
        scrollY: 0,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // Use type assertion to access html2pdf from window
      const html2pdf = (window as any).html2pdf;
      if (!html2pdf) {
        throw new Error('Biblioteca PDF não carregada.');
      }

      // Gera o PDF como Blob
      const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
      
      const file = new File([pdfBlob], `Relatorio_${companyData.razao_social.substring(0, 10).trim()}.pdf`, { type: 'application/pdf' });

      // Tenta usar a API nativa de compartilhamento (Celulares/Tablets)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Relatório Cadastral',
          text: `Segue PDF com dados da empresa ${companyData.razao_social}`,
        });
      } else {
        // Fallback para Desktop ou navegadores sem suporte a share de arquivos
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Relatorio_${companyData.cnpj}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (isMobile) {
            alert('PDF Gerado e baixado! Verifique seus downloads.');
        }
      }
    } catch (error) {
      console.error('Erro ao gerar/compartilhar PDF:', error);
      alert('Não foi possível gerar o PDF. Tente tirar um print da tela se o erro persistir.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    // Adiciona padding-bottom extra para respeitar a "Home Bar" do iOS (safe-area-inset-bottom)
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-[calc(5rem+env(safe-area-inset-bottom))] font-sans transition-all">
      {/* Header - Hidden in Print */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm no-print supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center select-none" title="CHOC-LAR">
              <div className="flex items-baseline text-xl sm:text-2xl font-black tracking-tight">
                <span className="text-green-500">C</span>
                <span className="text-blue-500">H</span>
                <span className="text-red-500 relative flex items-center justify-center mx-0.5">
                  <span className="text-xl">🍭</span>
                </span>
                <span className="text-pink-400">C</span>
                <span className="w-1.5 sm:w-2"></span>
                <span className="text-green-500">L</span>
                <span className="text-blue-500">A</span>
                <span className="text-yellow-400">R</span>
              </div>
            </div>
            <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest hidden sm:block pt-1">
              Pesquisa CNPJ
            </span>
          </div>
          <div className="text-[10px] sm:text-xs text-gray-400 hidden sm:block font-medium">
            Powered by Gemini AI
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        
        {/* Search Section - Hidden in Print */}
        <div className="text-center mb-6 sm:mb-10 no-print">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-2 sm:mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
              CONSULTA Rápida
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
            Digite o CNPJ do cliente para consultar rapidamente os dados da empresa.
          </p>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
            </div>
            {/* Input com tamanho de fonte base no mobile para evitar zoom no iOS */}
            <input
              type="text" // Use text with inputmode="numeric" for better keyboard support without validation issues
              inputMode="numeric"
              value={cnpjInput}
              onChange={handleInputChange}
              placeholder="00.000.000/0000-00"
              className="block w-full pl-11 pr-4 py-3 sm:py-4 bg-white border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-base sm:text-lg font-mono transition-all appearance-none"
              maxLength={18}
            />
            <button
              type="submit"
              disabled={status === LoadingState.LOADING}
              className="absolute right-2 top-2 bottom-2 bg-pink-500 hover:bg-pink-600 text-white px-4 sm:px-6 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-pink-200 active:scale-95 touch-manipulation"
            >
              {status === LoadingState.LOADING ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
              <span className="hidden sm:inline">Consultar</span>
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg inline-flex items-center gap-2 border border-red-100 text-sm sm:text-base animate-pulse">
               <span className="font-semibold">Erro:</span> {errorMsg}
            </div>
          )}
        </div>

        {/* Results Section */}
        {companyData && (
          <div className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-4 no-print">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Resultado da Consulta</h2>
              
              <div className="flex w-full sm:w-auto items-center gap-2">
                
                {/* Share Button */}
                <button 
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex-1 sm:flex-none justify-center bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 sm:py-2 rounded-lg font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait active:scale-95 touch-manipulation"
                >
                  {isSharing ? <Loader2 className="animate-spin" size={18} /> : <Share2 size={18} />}
                  {isSharing ? 'Gerando...' : 'Compartilhar'}
                </button>

                 {/* Copy Button */}
                 <button 
                  onClick={handleCopyData}
                  className={`px-4 py-3 sm:py-2 rounded-lg font-bold shadow-sm transition-all flex items-center justify-center gap-2 border active:bg-gray-100 touch-manipulation ${isCopied ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                >
                  {isCopied ? <Check size={18} /> : <Copy size={18} />}
                </button>

              </div>
            </div>

            {/* Report Content */}
            <div id="report-content" className="bg-white mx-auto w-full">
              <CompanyCard 
                data={companyData} 
                fantasyName={fantasyName}
                onFantasyNameChange={setFantasyName}
                email={email}
                onEmailChange={setEmail}
                contactPhone={contactPhone}
                onContactPhoneChange={setContactPhone}
              />
              
              <AIAnalysisSection 
                loading={aiStatus === LoadingState.LOADING} 
                analysis={analysis} 
              />
              
              {/* Watermark */}
              <div className="py-2 text-center text-[10px] text-gray-400 opacity-50 border-t border-gray-100 mt-2">
                Relatório gerado automaticamente pelo sistema PESQUISA CNPJ CHOC-LAR
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!companyData && status !== LoadingState.LOADING && (
          <div className="mt-10 sm:mt-20 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 text-center opacity-60 no-print max-w-3xl mx-auto">
             <div className="p-4 bg-white/50 rounded-xl">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} />
                </div>
                <h3 className="font-semibold text-gray-900">Busca Rápida</h3>
                <p className="text-sm mt-2 text-gray-500">Dados oficiais da Receita Federal.</p>
             </div>
             <div className="p-4 bg-white/50 rounded-xl">
                <div className="w-12 h-12 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">✨</span>
                </div>
                <h3 className="font-semibold text-gray-900">Análise Inteligente</h3>
                <p className="text-sm mt-2 text-gray-500">Insights automáticos via Gemini AI.</p>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;