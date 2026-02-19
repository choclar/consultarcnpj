import React from 'react';
import { AIAnalysisResult } from '../types';
import { Sparkles, ShieldAlert, Lightbulb, Briefcase } from 'lucide-react';

interface AIAnalysisSectionProps {
  analysis: AIAnalysisResult | null;
  loading: boolean;
}

export const AIAnalysisSection: React.FC<AIAnalysisSectionProps> = ({ analysis, loading }) => {
  if (loading) {
    return (
      <div className="mt-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-pink-200 rounded-full"></div>
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
          <div className="h-4 bg-gray-100 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="mt-8 bg-white rounded-xl border border-pink-100 shadow-lg overflow-hidden relative">
      {/* Colorful Gradient Top Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-400 to-pink-500"></div>
      
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Análise Inteligente (Gemini)</h3>
            <p className="text-sm text-gray-500">Insights gerados automaticamente sobre o perfil da empresa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Summary */}
          <div className="bg-pink-50/50 rounded-xl p-5 border border-pink-100">
            <div className="flex items-center gap-2 mb-3 text-pink-600 font-semibold">
              <Briefcase size={18} />
              <h4>Resumo Executivo</h4>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Risk */}
          <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
             <div className="flex items-center gap-2 mb-3 text-blue-600 font-semibold">
              <ShieldAlert size={18} />
              <h4>Análise de Risco</h4>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {analysis.riskAssessment}
            </p>
          </div>

          {/* Sales Pitch */}
          <div className="bg-green-50/50 rounded-xl p-5 border border-green-100">
             <div className="flex items-center gap-2 mb-3 text-green-600 font-semibold">
              <Lightbulb size={18} />
              <h4>Sugestão de Abordagem</h4>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed italic">
              "{analysis.suggestedSalesPitch}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};