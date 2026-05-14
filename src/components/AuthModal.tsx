import React, { useState } from 'react';
import { AuthService } from '../services/auth';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, User as UserIcon, Loader2, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        await AuthService.login(email);
      } else {
        await AuthService.signup(email, name);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors p-2 z-10" 
          disabled={isLoading}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-400 font-medium text-sm">
              {isLogin ? 'Enter your details to access your dashboard.' : 'Start analyzing your data with AI for free.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Full Name</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="text" required value={name} onChange={e => setName(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-indigo-500 focus:bg-white outline-none transition-all disabled:opacity-50 font-bold"
                      placeholder="John Doe"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-indigo-500 focus:bg-white outline-none transition-all disabled:opacity-50 font-bold"
                  placeholder="name@email.com"
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center"
              >
                {error}
              </motion.p>
            )}
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Join Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              disabled={isLoading}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all disabled:opacity-50"
            >
              {isLogin ? "New here? Create account" : "Have an account? Sign in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
