import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, Zap } from 'lucide-react';
import { User } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSubscribeClick: () => void;
}

const PricingModal: React.FC<Props> = ({ isOpen, onClose, user, onSubscribeClick }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors p-2 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">
              Choose the perfect plan for your data analysis needs. Upgrade anytime.
            </p>

            <div className="flex flex-col items-center justify-center mt-8 space-y-2">
              <span className="text-sm font-bold text-slate-900">Manual Monthly Billing</span>
              <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest">No Auto-Charge</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-[2rem] border-2 border-slate-100 bg-slate-50 relative flex flex-col">
              <div className="mb-8">
                <h3 className="text-xl font-black text-slate-900 mb-2">Starter</h3>
                <p className="text-slate-500 text-sm font-medium">Perfect for trying out AskData AI.</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-black text-slate-900">₹0</span>
                <span className="text-slate-500 font-bold">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Up to 5 datasets', '100 queries per day', 'Standard support', 'CSV & Excel exports'].map((feature, i) => (
                  <li key={i} className="flex items-start space-x-3 text-sm font-bold text-slate-700">
                    <Check className="w-5 h-5 text-indigo-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button 
                disabled={!user || user.plan === 'free'}
                className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 border-2 border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
              >
                {user ? (user.plan === 'free' ? 'Current Plan' : 'Downgrade') : 'Sign Up Free'}
              </button>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-[2rem] border-2 border-indigo-600 bg-white shadow-2xl shadow-indigo-100 relative flex flex-col transform md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-1 shadow-lg shadow-indigo-200">
                <Zap className="w-3 h-3" />
                <span>Most Popular</span>
              </div>
              <div className="mb-8 mt-2">
                <h3 className="text-xl font-black text-indigo-600 mb-2">Pro</h3>
                <p className="text-slate-500 text-sm font-medium">For power users and teams.</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-black text-slate-900">₹69</span>
                <span className="text-slate-500 font-bold">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Unlimited datasets', 'Unlimited queries', 'Priority 24/7 support', 'Advanced AI models', 'Export to PDF & Dashboards', 'API Access'].map((feature, i) => (
                  <li key={i} className="flex items-start space-x-3 text-sm font-bold text-slate-700">
                    <Check className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => onSubscribeClick()}
                disabled={user?.plan === 'pro'}
                className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 disabled:opacity-50"
              >
                {user?.plan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PricingModal;
