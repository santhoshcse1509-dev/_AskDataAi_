
import React from 'react';
import { User } from '../types';
import { AuthService } from '../services/auth';
import { Database, LogOut, FileText, User as UserIcon } from 'lucide-react';

interface Props {
  user: User | null;
  onLoginClick: () => void;
  onDocsClick: () => void;
  onPricingClick: () => void;
}

const Header: React.FC<Props> = ({ user, onLoginClick, onDocsClick, onPricingClick }) => {
  return (
    <header className="sticky top-0 z-[60] py-4 glass-panel mb-10">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.location.reload()}>
          <div className="bg-indigo-600 w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 transition-transform group-hover:scale-105">
             <Database className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-slate-900">AskData<span className="text-indigo-600">AI</span></h1>
        </div>

        <nav className="flex items-center space-x-4 md:space-x-8">
          <button onClick={onDocsClick} className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
            <FileText className="w-4 h-4" />
            <span>Docs</span>
          </button>
          
          {user ? (
            <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
              {user.plan === 'pro' ? (
                <div className="hidden md:flex items-center px-3 py-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-md">
                  Pro Plan
                </div>
              ) : (
                <button 
                  onClick={onPricingClick}
                  className="hidden md:flex items-center px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-md"
                >
                  Upgrade to Pro
                </button>
              )}
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-900 flex items-center">
                  {user.name}
                </span>
                <button 
                  onClick={() => AuthService.logout()}
                  className="flex items-center space-x-1 text-[8px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors mt-0.5"
                >
                  <LogOut className="w-2.5 h-2.5" />
                  <span>Logout</span>
                </button>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 border border-slate-200 shadow-sm overflow-hidden relative">
                {user.avatar 
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : user.name[0].toUpperCase()
                }
                {user.plan === 'pro' && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full border-2 border-white" />
                )}
              </div>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
