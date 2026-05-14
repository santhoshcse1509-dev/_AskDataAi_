import React from 'react';
import { QueryHistoryItem } from '../types';
import { History, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  history: QueryHistoryItem[];
  onSelect: (item: QueryHistoryItem) => void;
  onClear: () => void;
}

const QueryHistory: React.FC<Props> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden ring-1 ring-slate-100">
      <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center">
          <History className="w-3.5 h-3.5 mr-2 text-indigo-500" />
          Recent Queries
        </h3>
        <button 
          onClick={onClear}
          className="text-[8px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar">
        <AnimatePresence initial={false}>
          {history.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(item)}
              className="w-full px-6 py-4 text-left hover:bg-indigo-50/50 transition-colors group flex justify-between items-center"
            >
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-xs font-bold text-slate-700 truncate group-hover:text-indigo-700 transition-colors">
                  {item.question}
                </p>
                <div className="flex items-center space-x-1.5 mt-1">
                  <Clock className="w-2.5 h-2.5 text-slate-300" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QueryHistory;
