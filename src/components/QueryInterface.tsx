import React, { useState, useEffect } from 'react';
import { GeminiService } from '../services/gemini';
import { DataService } from '../services/db';
import { TableData, QueryResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Zap, Loader2, Sparkles, Send, AlertCircle } from 'lucide-react';

interface Props {
  tableData: TableData;
  onQueryResult: (result: QueryResult, question: string) => void;
  externalQuery?: string;
}

const QueryInterface: React.FC<Props> = ({ tableData, onQueryResult, externalQuery }) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<'ai' | 'sql' | 'idle'>('idle');

  useEffect(() => {
    if (externalQuery) {
      setQuery(externalQuery);
    }
  }, [externalQuery]);

  const handleAsk = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isProcessing) return;

    setIsProcessing(true);
    setProcessingStatus('ai');
    setError(null);

    try {
      const aiResponse = await GeminiService.generateSQL(
        query,
        tableData.columns,
        tableData.rows.slice(0, 5)
      );

      if (aiResponse.isAmbiguous) {
        setError(`I'm not sure what you meant: ${aiResponse.clarificationMessage || "Could you rephrase that?"}`);
        setIsProcessing(false);
        setProcessingStatus('idle');
        return;
      }

      setProcessingStatus('sql');
      const results = await DataService.executeQuery(aiResponse.sql);

      onQueryResult({
        sql: aiResponse.sql,
        explanation: aiResponse.explanation,
        data: results
      }, query);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while processing your question.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('idle');
    }
  };

  const suggestions = [
    "Summarize data",
    "List top 5 records",
    "Total entry count",
    "Average value"
  ];

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Sparkles className="w-24 h-24 text-indigo-600" />
      </div>

      <div className="space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-indigo-600">
             <div className="p-2 bg-indigo-50 rounded-xl">
               <MessageSquare className="w-5 h-5" />
             </div>
             <h3 className="font-black uppercase tracking-widest text-[10px]">AI Assistant</h3>
          </div>
          <AnimatePresence>
            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-indigo-500"
              >
                 <Loader2 className="w-3 h-3 animate-spin" />
                 <span>{processingStatus === 'ai' ? 'Consulting Gemini...' : 'Querying AlaSQL...'}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <form onSubmit={handleAsk} className="relative">
          <input
            type="text"
            className={`w-full pl-8 pr-36 py-6 border-2 rounded-2xl text-lg font-bold outline-none transition-all
              ${error 
                ? 'border-red-100 focus:border-red-500 bg-red-50/20 text-red-900' 
                : 'border-slate-50 focus:border-indigo-500 bg-slate-50/50 focus:bg-white shadow-inner focus:shadow-2xl focus:shadow-indigo-100/50 text-indigo-950'
              } disabled:opacity-75 disabled:cursor-not-allowed placeholder:text-slate-300`}
            placeholder="Ask your data anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !query.trim()}
            className="absolute right-3 top-3 bottom-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black uppercase tracking-widest text-[10px] px-8 rounded-xl transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-95 flex items-center justify-center min-w-[120px]"
          >
            {isProcessing ? (
               <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="flex items-center space-x-2">
                <span>Analyze</span>
                <Send className="w-4 h-4" />
              </div>
            )}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs flex items-center space-x-3 shadow-sm overflow-hidden"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-black uppercase tracking-widest text-[8px] mb-0.5">Engine Error</p>
              <p className="font-bold">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center space-x-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Try:</span>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => { setQuery(s); }}
              disabled={isProcessing}
              className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white border border-slate-100 text-slate-400 rounded-xl hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QueryInterface;
