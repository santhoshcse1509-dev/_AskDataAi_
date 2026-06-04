import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Loader2, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { User } from '../types';
import { AuthService } from '../services/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

const CheckoutModal: React.FC<Props> = ({ isOpen, onClose, user, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !user) return null;

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    const isLoaded = await loadRazorpay();

    if (!isLoaded) {
      alert('Razorpay SDK failed to load. Are you online?');
      setIsProcessing(false);
      return;
    }

    // You should replace this with your actual Razorpay test/live key.
    // Since this is a frontend-only demo without backend order creation, 
    // Razorpay might show an invalid key error if a fake key is used.
    // For a real integration, fetch an `order_id` from your backend here.
    const options = {
      key: "rzp_test_YOUR_KEY_HERE", // Replace with your Razorpay Key ID
      amount: "6900", // 6900 paise = ₹69.00
      currency: "INR",
      name: "AskData AI",
      description: "1 Month Pro Access (Manual Renewal)",
      image: "https://ui-avatars.com/api/?name=AskData+AI&background=4f46e5&color=fff",
      handler: function (response: any) {
        // This handler is called on successful payment
        // response.razorpay_payment_id
        AuthService.upgradeToPro(user.id);
        setIsProcessing(false);
        setIsSuccess(true);
        
        setTimeout(() => {
          onSuccess();
          onClose();
          // Reset state for next time
          setTimeout(() => setIsSuccess(false), 500);
        }, 2000);
      },
      prefill: {
        name: user?.name,
        email: user?.email,
      },
      theme: {
        color: "#4f46e5",
      },
      modal: {
        ondismiss: function() {
          // User closed the Razorpay modal
          setIsProcessing(false);
        }
      }
    };

    try {
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        alert('Payment Failed! ' + response.error.description);
        setIsProcessing(false);
      });
      paymentObject.open();
    } catch (error) {
      alert('Failed to open Razorpay modal. Please check your API key.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden relative"
      >
        <button
          onClick={onClose}
          disabled={isProcessing || isSuccess}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors p-2 z-10 disabled:opacity-0"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-10">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="mb-8">
                  <div className="flex items-center space-x-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Secure Razorpay Checkout</span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
                    1 Month Pro Access
                  </h2>
                  <p className="text-slate-500 font-medium text-sm flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <span>Manual Renewal (No Auto-Charge)</span>
                    <span className="font-black text-slate-900">₹69.00</span>
                  </p>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                    <div className="flex items-start space-x-3">
                      <Zap className="w-4 h-4 text-indigo-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Instant Access</p>
                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">Your Pro features will be activated immediately after payment.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Lock className="w-4 h-4 text-indigo-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">100% Secure</p>
                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">Payments are processed securely via Razorpay (UPI, Cards, NetBanking).</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRazorpayPayment}
                  disabled={isProcessing}
                  className="w-full py-4 mt-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Opening Razorpay...</span>
                    </>
                  ) : (
                    <span>Pay ₹69.00 with Razorpay</span>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Payment Successful!</h3>
                <p className="text-slate-500 font-medium text-sm">
                  Welcome to AskData AI Pro. Your account has been upgraded.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutModal;
