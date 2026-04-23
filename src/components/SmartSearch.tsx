/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { Search, Loader2, Sparkles, BookOpen, ExternalLink } from "lucide-react";
import { useState } from "react";
import { KNOWLEDGE_BASE } from "../lib/swift/knowledge-base";
import { KnowledgeItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function SmartSearch({ themeColor = 'blue-600' }: { themeColor?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KnowledgeItem[]>([]);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const themeRing = `focus:ring-${themeColor.split('-')[0]}-500/20`;
  const themeBg = `bg-${themeColor}`;
  const themeText = `text-${themeColor}`;
  const themeBorder = `border-${themeColor}/30`;
  const themeLightBg = `bg-${themeColor.split('-')[0]}-50/50`;
  const themeDarkBorder = `dark:border-${themeColor.split('-')[0]}-900/30`;
  const themeDarkText = `dark:text-${themeColor.split('-')[0]}-400`;
  const themeIcon = `group-hover:text-${themeColor}`;

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    // Local Search
    const local = KNOWLEDGE_BASE.filter(item => 
      item.title.toLowerCase().includes(val.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(val.toLowerCase()))
    );
    setResults(local);
    setShowResults(true);
  };

  const askAI = async () => {
    if (!query) return;
    setLoading(true);
    setAiResponse(null);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a SWIFT and ISO 20022 expert. Answer the following query briefly for a banking professional: ${query}`,
        config: {
          systemInstruction: "Provide concise, accurate technical explanations regarding SWIFT MT/MX mapping, payment concepts, or field definitions. Use bullet points if helpful."
        }
      });
      setAiResponse(response.text || "No response generated.");
    } catch (error) {
      console.error(error);
      setAiResponse("AI insight currently unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto z-50">
      <div className="relative flex items-center">
        <Search className="absolute left-4 text-zinc-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search MT103, pacs.008, field mappings, or concepts..."
          className={`w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-32 focus:outline-none focus:ring-2 ${themeRing} transition-all font-sans text-sm shadow-xl`}
          id="global-search"
        />
        <button
          onClick={askAI}
          disabled={loading || !query}
          className={`absolute right-2 px-4 py-2 ${themeBg} hover:opacity-90 disabled:opacity-50 text-white rounded-xl flex items-center gap-2 text-xs font-medium transition-colors cursor-pointer`}
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          Ask AI
        </button>
      </div>

      <AnimatePresence>
        {showResults && (query.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto"
          >
            {aiResponse && (
              <div className={`mb-4 p-4 ${themeLightBg} dark:bg-zinc-800/50 rounded-xl border ${themeBorder} ${themeDarkBorder}`}>
                <div className={`flex items-center gap-2 ${themeText} ${themeDarkText} text-xs font-bold uppercase tracking-wider mb-2`}>
                  <Sparkles className="w-3 h-3" />
                  AI Synthesis
                </div>
                <div className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {aiResponse}
                </div>
              </div>
            )}

            {results.length > 0 ? (
              <div className="space-y-1">
                <div className="px-3 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Knowledge Base</div>
                {results.map((item) => (
                  <div
                    key={item.id}
                    className="group p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.category === 'MT' ? 'bg-orange-100 text-orange-700' : 
                            item.category === 'MX' ? 'bg-purple-100 text-purple-700' : 'bg-zinc-100 text-zinc-700'
                          }`}>
                            {item.category}
                          </span>
                          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h4>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{item.content}</p>
                      </div>
                      <ExternalLink className={`w-4 h-4 text-zinc-300 ${themeIcon} transition-colors`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : !aiResponse && (
              <div className="p-8 text-center text-zinc-400">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No direct matches. Try asking AI for conceptual help.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
