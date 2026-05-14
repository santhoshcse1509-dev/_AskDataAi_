
import React, { useState } from 'react';
import { RazorpayService } from '../services/razorpay';
import { User } from '../types';
import { Check, X, Shield, Star, Award, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  user: User | null;
  onClose: () => void;
  onUpgrade: () => void;
  onLoginRequired: () => void;
}

const PricingPage: React.FC<Props> = ({ user, onClose, onUpgrade, onLoginRequired }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = () => {
    if (!user) {
      onLoginRequired();
      return;
    }
    
    setIsProcessing(true);
    RazorpayService.openCheckout(user, () => {
      setIsProcessing(false);
      onUpgrade();
      onClose();
    });
    
    setTimeout(() => {
      if (isProcessing) setIsProcessing(false);
    }, 10000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
      >
        <button 
          onClick={onClose} 
          disabled={isProcessing}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 z-[110] disabled:opacity-30 bg-white shadow-xl rounded-2xl"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Free Plan */}
        <div className="flex-1 p-12 border-r border-slate-50">
          <div className="mb-2">
            <div className="flex items-center space-x-2 mb-1">
              <Star className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Starter</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900">Free Explorer</h3>
          </div>
          <p className="text-slate-400 text-sm font-medium mb-8">Test the AI on your data for 7 days.</p>
          <div className="mb-8 flex items-baseline">
            <span className="text-5xl font-black text-slate-900 tracking-tighter">₹0</span>
            <span className="text-slate-400 font-bold text-xs ml-2">/7 Days</span>
          </div>
          <ul className="space-y-4 mb-12">
            {['Unlimited AI Queries', 'CSV & Excel Uploads', 'Auto Schema Detection', 'Browser-Native SQL'].map(f => (
              <li key={f} className="flex items-center text-sm text-slate-600 font-medium">
                <div className="p-1 bg-indigo-50 rounded-lg mr-3">
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                {f}
              </li>
            ))}
          </ul>
          <div className="w-full py-4 text-center bg-slate-100/50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100">
            {user?.plan === 'pro' ? 'Previously Used' : 'Currently Active Plan'}
          </div>
        </div>

        {/* Pro Plan */}
        <div className="flex-1 p-12 bg-slate-900 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
             <Award className="w-40 h-40 text-white" />
          </div>
          
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black px-6 py-2 rounded-bl-3xl uppercase tracking-widest">Best Value</div>
          
          <div className="relative z-10">
            <div className="mb-2">
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Power User</span>
              </div>
              <h3 className="text-2xl font-black text-white">AskData Pro</h3>
            </div>
            <p className="text-white/50 text-sm font-medium mb-8">Unlock unlimited exports and priority AI.</p>
            <div className="mb-8 flex items-baseline">
              <span className="text-5xl font-black text-white tracking-tighter">₹99</span>
              <span className="text-white/40 font-bold text-xs ml-2">/Monthly</span>
            </div>
            <ul className="space-y-4 mb-12">
              {['Everything in Free', 'Unlimited Downloads', 'Priority Gemini 3 Pro', 'Commercial Usage License'].map(f => (
                <li key={f} className="flex items-center text-sm text-white font-bold">
                  <div className="p-1 bg-white/10 rounded-lg mr-3">
                    <Check className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          
          <button 
            onClick={handleUpgrade}
            disabled={user?.plan === 'pro' || isProcessing}
            className={`mt-auto w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center space-x-2
              ${user?.plan === 'pro' 
                ? 'bg-slate-800 text-slate-500 cursor-default' 
                : isProcessing
                  ? 'bg-indigo-500 text-white cursor-wait opacity-80'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-[1.03] active:scale-[0.97] shadow-indigo-600/30'
              }
            `}
          >
            {isProcessing ? (
               <Loader2 className="w-5 h-5 animate-spin" />
            ) : user?.plan === 'pro' ? 'Subscription Active' : 'Upgrade to Pro'}
          </button>
          
          <div className="flex items-center justify-center space-x-2 opacity-30 mt-4">
             <Shield className="w-3 h-3 text-white" />
             <p className="text-center text-[8px] text-white font-black uppercase tracking-widest">
               Secured by Razorpay • UPI • SSL
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PricingPage;
