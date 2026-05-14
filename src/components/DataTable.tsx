
import React from 'react';
import { Table as TableIcon, SearchX } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  data: any[];
  columns: string[];
  title?: string;
  maxRows?: number;
}

const DataTable: React.FC<Props> = ({ data, columns, title, maxRows = 100 }) => {
  const displayData = data.slice(0, maxRows);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] text-center">
        <div className="p-6 bg-white rounded-[2rem] shadow-sm mb-6">
          <SearchX className="w-12 h-12 text-slate-200" />
        </div>
        <p className="text-slate-900 font-black uppercase tracking-widest text-xs">No Results Found</p>
        <p className="text-xs text-slate-400 font-medium mt-2 max-w-[200px]">Try adjusting your question or check the column names.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center space-x-3">
            <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{title}</h4>
        </div>
      )}
      <div className="relative overflow-hidden border border-slate-100 rounded-[2rem] shadow-2xl shadow-indigo-50/50 bg-white ring-1 ring-slate-100">
        <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
          <table className="min-w-full divide-y divide-slate-100 border-separate border-spacing-0">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                {columns.map((col, idx) => (
                  <th 
                    key={idx} 
                    className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {displayData.map((row, rowIdx) => (
                <motion.tr 
                  key={rowIdx} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIdx * 0.01 }}
                  className="hover:bg-indigo-50/40 transition-colors group cursor-default"
                >
                  {columns.map((col, colIdx) => {
                    const value = row[col];
                    const isNumeric = typeof value === 'number';
                    
                    return (
                      <td 
                        key={colIdx} 
                        className={`px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-600 group-hover:text-indigo-900 transition-colors ${isNumeric ? 'font-mono text-right tabular-nums' : ''}`}
                      >
                        {value?.toString() ?? <span className="text-slate-300 italic font-normal">null</span>}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.length > maxRows && (
          <div className="px-8 py-4 bg-slate-50/80 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-slate-400 border-t border-slate-100 flex justify-between items-center">
            <span>Displaying initial <b>{maxRows}</b> results</span>
            <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 text-slate-900">Total: {data.length} records</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
