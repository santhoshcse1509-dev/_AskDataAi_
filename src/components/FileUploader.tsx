import React, { useRef, useState } from 'react';
import { TableData, ColumnMetadata } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileSpreadsheet, Plus } from 'lucide-react';

interface Props {
  onUploadSuccess: (data: TableData) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

declare var XLSX: any;
declare var Papa: any;

const FileUploader: React.FC<Props> = ({ onUploadSuccess, isLoading, setIsLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Detecting columns...');

  const detectType = (value: any): ColumnMetadata['type'] => {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'string') {
      const date = Date.parse(value);
      if (!isNaN(date) && value.length > 8 && (value.includes('-') || value.includes('/') || value.includes(':'))) {
        return 'date';
      }
    }
    return 'string';
  };

  const validateAndProcessFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Please upload a file smaller than 10MB.");
      return;
    }

    setIsLoading(true);
    setStatusMessage('Reading file structure...');
    const extension = file.name.split('.').pop()?.toLowerCase();

    // Small timeout to allow UI to update
    setTimeout(() => {
      if (extension === 'csv') {
        setStatusMessage('Parsing CSV rows...');
        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results: any) => {
            processParsedData(results.data, file.name);
          },
          error: (err: any) => {
            console.error(err);
            alert("Error parsing CSV: " + err.message);
            setIsLoading(false);
          }
        });
      } else if (['xlsx', 'xls', 'ods'].includes(extension || '')) {
        setStatusMessage('Reading Excel sheets...');
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            processParsedData(jsonData, file.name);
          } catch (err: any) {
            alert("Error reading Excel file: " + err.message);
            setIsLoading(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert('Unsupported file format. Please upload CSV or Excel.');
        setIsLoading(false);
      }
    }, 300);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndProcessFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (isLoading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) validateAndProcessFile(file);
  };

  const processParsedData = (rows: any[], fileName: string) => {
    setStatusMessage('Finalizing data model...');
    if (!rows || rows.length === 0) {
      alert('The file appears to be empty or could not be read properly.');
      setIsLoading(false);
      return;
    }

    const cleanedRows = rows.map(row => {
        const newRow: any = {};
        for (const key in row) {
            const val = row[key];
            if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
                newRow[key] = JSON.stringify(val);
            } else {
                newRow[key] = val;
            }
        }
        return newRow;
    });

    const firstRow = cleanedRows[0];
    const columns: ColumnMetadata[] = Object.keys(firstRow).map(key => ({
      name: key,
      type: detectType(firstRow[key])
    }));

    onUploadSuccess({ columns, rows: cleanedRows, fileName });
    setIsLoading(false);
  };

  return (
    <motion.div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={!isLoading ? { scale: 1.01 } : {}}
      className={`bg-white p-10 rounded-[2.5rem] border-2 transition-all duration-300 shadow-2xl relative overflow-hidden group
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' 
          : 'border-slate-100 hover:border-indigo-100'
        }`}
    >
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-6"
          >
             <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 border-4 border-indigo-50 border-t-indigo-600 rounded-full"
                ></motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Upload className="w-8 h-8 text-indigo-600" />
                </div>
             </div>
             <div className="text-center space-y-1">
               <motion.p 
                 initial={{ opacity: 0, y: 5 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-sm font-black text-slate-900 uppercase tracking-widest"
               >
                 {statusMessage}
               </motion.p>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Processing with local engine</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center space-y-8">
        <div className={`p-8 rounded-[2rem] transition-all duration-500 ${isDragging ? 'bg-indigo-600 shadow-2xl shadow-indigo-200' : 'bg-indigo-50 shadow-lg shadow-indigo-50'}`}>
          <FileSpreadsheet 
            className={`w-16 h-16 transition-colors duration-500 ${isDragging ? 'text-white' : 'text-indigo-600'}`} 
          />
        </div>
        
        <div className="text-center space-y-3">
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
            {isDragging ? 'Drop it now!' : 'Import Dataset'}
          </h3>
          <p className="text-slate-500 font-medium max-w-sm text-sm">
            Drag and drop your <span className="text-indigo-600 font-bold">CSV or Excel</span> file here, or click to browse. Files up to 10MB.
          </p>
        </div>
        
        <div className="w-full">
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            accept=".csv,.xlsx,.xls,.ods" 
            onChange={handleFileChange} 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className={`w-full group/btn flex items-center justify-center space-x-3 px-8 py-5 rounded-2xl border-2 border-dashed transition-all relative overflow-hidden
              ${isLoading 
                ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-50' 
                : isDragging
                  ? 'bg-white border-indigo-400 text-indigo-700'
                  : 'bg-indigo-50/30 border-indigo-100 hover:border-indigo-500 hover:bg-white text-indigo-900'
              }`}
          >
            <Plus className={`w-5 h-5 transition-transform group-hover/btn:rotate-90 duration-300`} />
            <span className="font-black uppercase tracking-widest text-xs">Select Dataset</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
           {['.csv', '.xlsx', '.xls'].map(ext => (
             <span key={ext} className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">{ext}</span>
           ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FileUploader;
