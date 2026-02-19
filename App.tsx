import React, { useState } from 'react';
import { Search, Loader2, ArrowRight, Save, Share2, FileDown } from 'lucide-react';
import { fetchCompanyData } from './services/brasilApi';
import { analyzeCompanyProfile } from './services/geminiService';
import { CompanyCard } from './components/CompanyCard';
import { AIAnalysisSection } from './components/AIAnalysisSection';
import { BrasilAPIResponse, AIAnalysisResult, LoadingState } from './types';

// Declare html2pdf for TypeScript since it's loaded via script tag
declare var html2pdf: any;

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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  const handleRegisterSimulation = () => {
    alert(`Empresa ${companyData?.razao_social} cadastrada com sucesso no sistema CHOC-LAR!`);
  };

  const handleGeneratePDF = () => {
    if (!companyData) return;
    setIsGeneratingPdf(true);

    const element = document.getElementById('report-content');
    const opt = {
      margin: [10, 10, 10, 10], // top, left, bottom, right
      filename: `Relatorio-CHOC-LAR-${companyData.cnpj}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsGeneratingPdf(false);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Placeholder / CSS Representation */}
            <div className="flex items-center select-none" title="CHOC-LAR">
              {/* If you have the image file, uncomment the line below and place the file in public folder */}
              {/* <img src="/logo-choc-lar.png" alt="CHOC-LAR" className="h-10 w-auto mr-2" /> */}
              
              <div className="flex items-baseline text-2xl font-black tracking-tight">
                <span className="text-green-500">C</span>
                <span className="text-blue-500">H</span>
                <span className="text-red-500 relative flex items-center justify-center mx-0.5">
                  <span className="text-xl">🍭</span> {/* Representing the lollipop O */}
                </span>
                <span className="text-pink-400">C</span>
                <span className="w-2"></span>
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
          <div className="text-xs text-gray-400 hidden sm:block font-medium">
            Powered by Gemini AI
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Search Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
              Cadastro Rápido
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Digite o CNPJ do cliente para preencher o cadastro automaticamente.
          </p>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
            </div>
            <input
              type="text"
              value={cnpjInput}
              onChange={handleInputChange}
              placeholder="00.000.000/0000-00"
              className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-lg font-mono transition-all"
              maxLength={18}
            />
            <button
              type="submit"
              disabled={status === LoadingState.LOADING}
              className="absolute right-2 top-2 bottom-2 bg-pink-500 hover:bg-pink-600 text-white px-6 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-pink-200"
            >
              {status === LoadingState.LOADING ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
              <span className="hidden sm:inline">Consultar</span>
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg inline-flex items-center gap-2 border border-red-100">
               <span className="font-semibold">Erro:</span> {errorMsg}
            </div>
          )}
        </div>

        {/* Results Section */}
        {companyData && (
          <div className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-800">Resultado da Consulta</h2>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleGeneratePDF}
                  disabled={isGeneratingPdf}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                >
                  {isGeneratingPdf ? <Loader2 className="animate-spin" size={18} /> : <FileDown size={18} />}
                  Compartilhar PDF
                </button>

                <button 
                  onClick={handleRegisterSimulation}
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                  <Save size={18} />
                  Confirmar Cadastro
                </button>
              </div>
            </div>

            {/* Content Wrapper for PDF Generation */}
            <div id="report-content" className="bg-slate-50 p-1">
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
              
              {/* Watermark for PDF only (visible in HTML but styled to look okay) */}
              <div className="mt-4 text-center text-xs text-gray-400 opacity-50">
                Relatório gerado automaticamente pelo sistema PESQUISA CNPJ CHOC-LAR
              </div>
            </div>
          </div>
        )}

        {/* Empty State / Features */}
        {!companyData && status !== LoadingState.LOADING && (
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center opacity-60">
             <div className="p-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} />
                </div>
                <h3 className="font-semibold text-gray-900">Busca Rápida</h3>
                <p className="text-sm mt-2 text-gray-500">Dados oficiais da Receita Federal.</p>
             </div>
             <div className="p-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Save size={24} />
                </div>
                <h3 className="font-semibold text-gray-900">Cadastro Ágil</h3>
                <p className="text-sm mt-2 text-gray-500">Integração direta com o sistema.</p>
             </div>
             <div className="p-4">
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