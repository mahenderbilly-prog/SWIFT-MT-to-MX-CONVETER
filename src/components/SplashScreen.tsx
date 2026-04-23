/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Zap, ShieldCheck, Globe, Cpu } from "lucide-react";

interface SplashScreenProps {
  theme: {
    primary: string;
    bgGradient: string;
    text: string;
  };
}

export function SplashScreen({ theme }: SplashScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-${theme.primary}/10 blur-[120px] animate-pulse`} />
        <div className={`absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-${theme.primary}/5 blur-[120px]`} />
      </div>

      <div className="relative flex flex-col items-center max-w-2xl px-6 text-center">
        {/* Animated Rings */}
        <div className="relative mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`w-24 h-24 bg-gradient-to-br ${theme.bgGradient} rounded-[2rem] flex items-center justify-center shadow-2xl shadow-${theme.primary}/40 border border-white/20 z-10`}
          >
            <Zap className="text-white w-10 h-10 fill-white/20" />
          </motion.div>
          
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 -m-4 border border-white/5 rounded-[2.5rem]" 
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 -m-8 border border-white/5 rounded-[3rem]" 
          />
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2 italic">
            SWIFT MT <span className={`text-${theme.primary.replace('600', '400')}`}>TO</span> MX
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium tracking-[0.2em] uppercase mb-12">
            ISO 20022 Enterprise Engine
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-8 w-full max-w-md">
          {[
            { icon: <ShieldCheck className="w-5 h-5" />, label: "Secure" },
            { icon: <Globe className="w-5 h-5" />, label: "Global" },
            { icon: <Cpu className="w-5 h-5" />, label: "Smart" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-white/60">
                {item.icon}
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Technical Progress Bar */}
        <div className="mt-16 w-64 h-1 bg-white/5 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className={`absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-${theme.primary.replace('600', '500')} to-transparent`}
          />
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 text-[10px] text-slate-600 font-mono"
        >
          Initializing Standard Mapping Engine v2.4...
        </motion.p>
      </div>

      {/* Figma Aesthetic Labels */}
      <div className="absolute bottom-8 left-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">M</div>
        <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] text-indigo-400 font-bold">
          Viewing Prototype
        </div>
      </div>
    </motion.div>
  );
}
