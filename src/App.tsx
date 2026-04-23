/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Code, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Download, 
  ArrowRightLeft,
  Moon,
  Sun,
  Zap,
  Info,
  Loader2,
  ChevronDown,
  Palette
} from 'lucide-react';
import { SmartSearch } from './components/SmartSearch';
import { parseMT } from './lib/swift/mt-parser';
import { generateMX } from './lib/swift/mx-generator';
import { validateMT } from './lib/swift/validator';
import { MTMessage, ValidationResult } from './types';
import { SplashScreen } from './components/SplashScreen';

interface ThemeConfig {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bgGradient: string;
  shadow: string;
  border: string;
  text: string;
  ring: string;
  hover: string;
  darkAccent: string;
  darkBorder: string;
  darkText: string;
  panelBase: string; // Base dark color for panels
  sidebarBase: string; // Base dark color for sidebar
}

const THEMES: Record<string, ThemeConfig> = {
  indigo: {
    id: 'indigo',
    name: 'Indigo',
    primary: 'indigo-600',
    secondary: 'violet-700',
    accent: 'indigo-50',
    bgGradient: 'from-indigo-600 to-violet-700',
    shadow: 'shadow-indigo-200',
    border: 'border-indigo-100',
    text: 'text-indigo-700',
    ring: 'ring-indigo-500',
    hover: 'hover:bg-indigo-700',
    darkAccent: 'dark:bg-indigo-900/40',
    darkBorder: 'dark:border-indigo-700',
    darkText: 'dark:text-indigo-300',
    panelBase: 'bg-slate-900 shadow-indigo-900/10 border-slate-800',
    sidebarBase: 'bg-slate-800 dark:bg-slate-950 border-slate-700 dark:border-slate-800'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    primary: 'emerald-600',
    secondary: 'teal-700',
    accent: 'emerald-50',
    bgGradient: 'from-emerald-600 to-teal-700',
    shadow: 'shadow-emerald-200',
    border: 'border-emerald-100',
    text: 'text-emerald-700',
    ring: 'ring-emerald-500',
    hover: 'hover:bg-emerald-700',
    darkAccent: 'dark:bg-emerald-900/40',
    darkBorder: 'dark:border-emerald-700',
    darkText: 'dark:text-emerald-300',
    panelBase: 'bg-emerald-950 shadow-emerald-900/10 border-emerald-900',
    sidebarBase: 'bg-emerald-900 dark:bg-[#022c22] border-emerald-800 dark:border-emerald-900/50'
  },
  rose: {
    id: 'rose',
    name: 'Rose',
    primary: 'rose-600',
    secondary: 'pink-700',
    accent: 'rose-50',
    bgGradient: 'from-rose-600 to-pink-700',
    shadow: 'shadow-rose-200',
    border: 'border-rose-100',
    text: 'text-rose-700',
    ring: 'ring-rose-500',
    hover: 'hover:bg-rose-700',
    darkAccent: 'dark:bg-rose-900/40',
    darkBorder: 'dark:border-rose-700',
    darkText: 'dark:text-rose-300',
    panelBase: 'bg-rose-950 shadow-rose-900/10 border-rose-900',
    sidebarBase: 'bg-rose-900 dark:bg-[#450a0a] border-rose-800 dark:border-rose-900/50'
  },
  amber: {
    id: 'amber',
    name: 'Amber',
    primary: 'amber-600',
    secondary: 'orange-700',
    accent: 'amber-50',
    bgGradient: 'from-amber-600 to-orange-700',
    shadow: 'shadow-amber-200',
    border: 'border-amber-100',
    text: 'text-amber-700',
    ring: 'ring-amber-500',
    hover: 'hover:bg-amber-700',
    darkAccent: 'dark:bg-amber-900/40',
    darkBorder: 'dark:border-amber-700',
    darkText: 'dark:text-amber-300',
    panelBase: 'bg-amber-950 shadow-amber-900/10 border-amber-900',
    sidebarBase: 'bg-amber-900 dark:bg-[#451a03] border-amber-800 dark:border-amber-900/50'
  },
  slate: {
    id: 'slate',
    name: 'Slate',
    primary: 'slate-700',
    secondary: 'slate-900',
    accent: 'slate-100',
    bgGradient: 'from-slate-700 to-slate-900',
    shadow: 'shadow-slate-300',
    border: 'border-slate-200',
    text: 'text-slate-800',
    ring: 'ring-slate-500',
    hover: 'hover:bg-slate-800',
    darkAccent: 'dark:bg-slate-800/40',
    darkBorder: 'dark:border-slate-600',
    darkText: 'dark:text-slate-300',
    panelBase: 'bg-slate-900 shadow-slate-900/10 border-slate-800',
    sidebarBase: 'bg-slate-800 dark:bg-slate-950 border-slate-700 dark:border-slate-800'
  }
};

const SAMPLE_MT103 = `{1:F01BANKUS33AXXX0000000000}{2:I103BANKBEBXXXXN}{4:
:20:REF103-TEST-001
:23B:CRED
:32A:260422USD5000,00
:50A:/12345678
BANKUS33
:59:/98765432
JOHN DOE
:71A:SHA
-}`;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [rawMT, setRawMT] = useState('');
  const [mtData, setMtData] = useState<MTMessage | null>(null);
  const [mxXML, setMxXML] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(THEMES.indigo);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isSplashing, setIsSplashing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashing(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const theme = activeTheme;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (rawMT.trim()) {
      const parsed = parseMT(rawMT);
      setMtData(parsed);
      setMxXML(generateMX(parsed));
      setValidation(validateMT(parsed));
    } else {
      setMtData(null);
      setMxXML('');
      setValidation(null);
    }
  }, [rawMT]);

  const loadDynamicSample = async (type?: 'MT103' | 'MT202') => {
    setIsGenerating(true);
    try {
      const typePrompt = type ? `specifically an ${type}` : "a SWIFT MT103 or MT202 message (choose randomly)";
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a raw ${typePrompt}. Return ONLY the raw block 1, 2, and 4 content. Use realistic but dummy data for BICs, names, and amounts. Ensure the format matches: {1:...}{2:...}{4:\n:20:...\n... -}`,
        config: {
          systemInstruction: "You are a professional SWIFT message generator for testing. Output raw message text only, no markdown, no explanation."
        }
      });
      const generated = response.text?.trim() || '';
      setRawMT(generated.replace(/```[a-z]*\n?/gi, '').replace(/```/g, ''));
    } catch (error) {
      console.error("Failed to generate sample:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadXML = () => {
    const blob = new Blob([mxXML], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_${mtData?.type || 'payment'}.xml`;
    a.click();
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors">
      
      <AnimatePresence mode="wait">
        {isSplashing && <SplashScreen theme={theme} />}
      </AnimatePresence>

      {/* Navigation / Header */}
        <header className="flex items-center justify-between px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-50">
          <div 
            onClick={() => {
              setIsSplashing(true);
              setTimeout(() => setIsSplashing(false), 5000);
            }}
            className="flex items-center space-x-3 min-w-[200px] cursor-pointer group"
          >
            <div className={`w-9 h-9 bg-gradient-to-br ${theme.bgGradient} rounded-xl flex items-center justify-center ${theme.shadow} shadow-xl border border-white/10 group-hover:scale-105 transition-transform`}>
              <Zap className="text-white w-5 h-5 fill-white/20" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">Swift<span className={`text-${theme.primary}`}>Convert</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold leading-none">Global Standards Engine</p>
            </div>
          </div>
          
          <div className="flex-1 max-w-xl mx-8">
            <SmartSearch themeColor={theme.primary} />
          </div>

          <div className="flex items-center space-x-4 min-w-[200px] justify-end">
            <div className="relative">
              <button 
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="flex items-center space-x-2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Palette className="w-5 h-5" />
                <ChevronDown className={`w-3 h-3 transition-transform ${showThemeMenu ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showThemeMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 min-w-[140px] z-[100]"
                  >
                    {Object.values(THEMES).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveTheme(t);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                          theme.id === t.id 
                            ? `bg-${t.accent} ${t.darkAccent} text-${t.primary}` 
                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${t.bgGradient}`} />
                        <span>{t.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full uppercase tracking-wider">
            <span className={`w-2 h-2 bg-${theme.primary.replace('-600', '-500')} rounded-full animate-pulse`}></span>
            <span>Network Active</span>
          </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 text-slate-400 hover:text-${theme.primary} transition-colors`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden p-6 gap-6 relative">
          
          {/* Source Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center space-x-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span>Source MT Message</span>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => loadDynamicSample('MT103')}
                    disabled={isGenerating}
                    className={`px-2 py-0.5 rounded border text-[9px] font-bold transition-all cursor-pointer hover:shadow-sm active:scale-95 disabled:opacity-50 ${mtData?.type === 'MT103' ? `bg-${theme.accent} ${theme.darkAccent} border-${theme.primary}/20 ${theme.darkBorder} text-${theme.primary} ${theme.darkText}` : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
                  >
                    MT103
                  </button>
                  <button 
                    onClick={() => loadDynamicSample('MT202')}
                    disabled={isGenerating}
                    className={`px-2 py-0.5 rounded border text-[9px] font-bold transition-all cursor-pointer hover:shadow-sm active:scale-95 disabled:opacity-50 ${mtData?.type === 'MT202' ? `bg-${theme.accent} ${theme.darkAccent} border-${theme.primary}/20 ${theme.darkBorder} text-${theme.primary} ${theme.darkText}` : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
                  >
                    MT202
                  </button>
                </div>
              </div>
              <button 
                onClick={loadDynamicSample}
                disabled={isGenerating}
                className={`text-[11px] text-${theme.primary} font-bold hover:underline underline-offset-4 cursor-pointer flex items-center gap-1.5 disabled:opacity-50`}
              >
                {isGenerating && <Loader2 className="w-3 h-3 animate-spin" />}
                {isGenerating ? 'Generating...' : 'Load Sample'}
              </button>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-sm">
              <textarea
                value={rawMT}
                onChange={(e) => setRawMT(e.target.value)}
                placeholder="Paste SWIFT payment blocks here..."
                className="flex-1 p-5 font-mono text-[13px] leading-relaxed resize-none focus:outline-none text-slate-700 dark:text-slate-300 bg-slate-50/30 dark:bg-slate-900/30"
                spellCheck="false"
              />
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>SWIFT CHARSET | {rawMT.length} Chars</span>
                <div className="flex gap-2">
                   <button className={`bg-${theme.primary} text-white font-bold px-3 py-1.5 rounded-lg ${theme.hover} transition uppercase tracking-tighter`}>Convert Now</button>
                </div>
              </div>
            </div>
          </div>

          {/* Target Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target MX Output (ISO 20022)</div>
              <div className="flex space-x-1.5">
                <button onClick={() => copyToClipboard(mxXML)} className={`p-1 px-2 text-slate-400 hover:text-${theme.primary} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs cursor-pointer`}>
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button onClick={downloadXML} className={`p-1 px-2 text-slate-400 hover:text-${theme.primary} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs cursor-pointer`}>
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className={`flex-1 ${theme.panelBase} rounded-xl overflow-hidden shadow-xl`}>
              <div className="h-full p-5 font-mono text-[13px] leading-relaxed overflow-auto scrollbar-thin scrollbar-thumb-white/10 text-slate-300">
                {mxXML ? (
                   <div className="whitespace-pre-wrap">
                      {mxXML}
                   </div>
                ) : (
                  <div className="h-full flex items-center justify-center opacity-20 italic">
                    Waiting for input...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Sidebar */}
          <aside className="w-80 flex flex-col gap-4 overflow-y-auto">
            
            {/* Validation */}
            <AnimatePresence>
              {validation && (
                <motion.div 
                  initial={{ x: 20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm"
                >
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Validation Integrity</h3>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      validation.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {validation.status === 'SUCCESS' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-none mb-1">{validation.status}</div>
                      <div className="text-[10px] text-slate-500 font-medium">Compliance Check Complete</div>
                    </div>
                  </div>
                  <div className="space-y-1.5 overflow-hidden">
                    {validation.errors.map((e, i) => (
                      <div key={i} className="p-2 bg-red-50 dark:bg-red-900/10 border-l-2 border-red-500 rounded text-[11px] text-red-800 dark:text-red-300 leading-tight">
                        {e}
                      </div>
                    ))}
                    {validation.warnings.map((w, i) => (
                      <div key={i} className="p-2 bg-orange-50 dark:bg-orange-900/10 border-l-2 border-orange-400 rounded text-[11px] text-orange-800 dark:text-orange-300 leading-tight">
                        {w}
                      </div>
                    ))}
                    {validation.status === 'SUCCESS' && (
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/10 border-l-2 border-emerald-500 rounded text-[11px] text-emerald-800 dark:text-emerald-300 leading-tight">
                        Message schema verified against latest ISO guidelines.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Field Breakdown as "Intelligence" */}
            <div className={`${theme.sidebarBase} text-white rounded-xl p-5 shadow-inner flex flex-col flex-1 min-h-[400px]`}>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Mapping Intelligence</h3>
              <div className="space-y-5 overflow-y-auto pr-1">
                {mtData?.fields.map((field, idx) => (
                  <div key={idx}>
                    <div className={`text-[11px] font-mono text-${theme.primary.replace('-600', '-300')} dark:text-${theme.primary}/80 underline underline-offset-4 decoration-${theme.primary}/30 mb-1.5 truncate`}>
                      {field.tag} → {field.name}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-mono break-all opacity-90">
                      {field.value}
                    </p>
                  </div>
                ))}
                {!mtData && (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-500 italic text-[11px]">
                    <Info className="w-8 h-8 mb-4 opacity-10" />
                    <p>Field-level intelligence will populate here</p>
                  </div>
                )}
              </div>
              
              <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
                 <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-white/40">
                   <span>MT SCHEMA</span>
                   <span className="text-white">v2023.R1</span>
                 </div>
                 <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-white/40">
                   <span>MX SCHEMA</span>
                   <span className="text-white">v8.2.1</span>
                 </div>
              </div>
            </div>
          </aside>
        </main>

        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 py-2.5 flex items-center justify-between text-[10px] font-medium text-slate-400">
          <div className="flex items-center space-x-6 uppercase tracking-wider">
            <span>Ver. 2.4.0.82</span>
            <span>Stable Release: Nov 23</span>
            <span className={`text-${theme.primary} flex items-center gap-1.5`}>
              <span className={`w-1.5 h-1.5 bg-${theme.primary} rounded-full`}></span>
              3,412 API Calls Today
            </span>
          </div>
          <div className="flex items-center space-x-6 uppercase tracking-wider">
            <a href="#" className={`hover:text-${theme.primary} transition-colors`}>Documentation</a>
            <a href="#" className={`hover:text-${theme.primary} transition-colors`}>Feedback</a>
            <a href="#" className={`hover:text-${theme.primary} transition-colors`}>API Status</a>
          </div>
        </footer>

      </div>
    );
}
