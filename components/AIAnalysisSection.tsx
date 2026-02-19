import React, { useState } from 'react';
import { AIAnalysisResult } from '../types';
import { Sparkles, ShieldAlert, Lightbulb, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';

interface AIAnalysisSectionProps {
  analysis: AIAnalysisResult | null;
  loading: boolean;
}

export const AIAnalysisSection: React.FC<AIAnalysisSectionProps> = ({ analysis, loading }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) {
    return (
      <div className="mt-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-pink-200 rounded-full"></div>
          <div className="h-3 w-40 bg-gray-200 rounded"></div>
        </div>
        <div className="h-2 bg-gray-100 rounded w-full"></div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    // Container capable of expanding
    <div className="mt-2 bg-white rounded-lg border border-pink-100 shadow-sm overflow-hidden relative select-text transition-all duration-300">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 via-blue-400 to-pink-500"></div>
      
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-pink-100 text-pink-600 rounded">
              <Sparkles size={12} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 leading-none">Análise Gemini AI</h3>
            </div>
          </div>
        </div>

        {/* 
            Dynamic Layout:
            Compact: grid-cols-3
            Expanded: flex-col (stacked)
        */}
        <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'flex flex-col gap-4' : 'grid grid-cols-3 gap-2'}`}>
          
          {/* Summary */}
          <div className={`rounded p-2 border transition-all ${isExpanded ? 'bg-pink-50 border-pink-200 shadow-sm' : 'bg-pink-50/50 border-pink-100'}`}>
            <div className={`flex items-center gap-1 mb-1 text-pink-600 font-bold uppercase ${isExpanded ? 'text-sm' : 'text-[10px]'}`}>
              <Briefcase size={isExpanded ? 16 : 10} />
              <h4>Resumo</h4>
            </div>
            <p className={`text-gray-700 leading-tight text-justify selection:bg-pink-200 ${isExpanded ? 'text-sm leading-relaxed' : 'text-[10px]'}`}>
              {analysis.summary}
            </p>
          </div>

          {/* Risk */}
          <div className={`rounded p-2 border transition-all ${isExpanded ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-blue-50/50 border-blue-100'}`}>
             <div className={`flex items-center gap-1 mb-1 text-blue-600 font-bold uppercase ${isExpanded ? 'text-sm' : 'text-[10px]'}`}>
              <ShieldAlert size={isExpanded ? 16 : 10} />
              <h4>Risco</h4>
            </div>
            <p className={`text-gray-700 leading-tight text-justify selection:bg-blue-200 ${isExpanded ? 'text-sm leading-relaxed' : 'text-[10px]'}`}>
              {analysis.riskAssessment}
            </p>
          </div>

          {/* Sales Pitch */}
          <div className={`rounded p-2 border transition-all ${isExpanded ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-green-50/50 border-green-100'}`}>
             <div className={`flex items-center gap-1 mb-1 text-green-600 font-bold uppercase ${isExpanded ? 'text-sm' : 'text-[10px]'}`}>
              <Lightbulb size={isExpanded ? 16 : 10} />
              <h4>Pitch</h4>
            </div>
            <p className={`text-gray-700 leading-tight italic text-justify selection:bg-green-200 ${isExpanded ? 'text-sm leading-relaxed' : 'text-[10px]'}`}>
              "{analysis.suggestedSalesPitch}"
            </p>
          </div>
        </div>

        {/* Expand Button - Hidden in Print unless you want the expanded view to print */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-3 py-1.5 flex items-center justify-center gap-1 text-xs font-semibold text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded transition-colors no-print"
        >
          {isExpanded ? (
            <>
              Recolher Análise <ChevronUp size={14} />
            </>
          ) : (
            <>
              Expandir Análise <ChevronDown size={14} />
            </>
          )}
        </button>

      </div>
    </div>
  );
};