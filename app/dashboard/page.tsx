'use client';
import React, { useState } from 'react';
import { Layout, Image as ImageIcon, Send, Box, MousePointer2, ChevronRight, Loader2, CheckCircle2, Sparkles } from 'lucide-react';

// --- YOUR CATEGORIES ---
const CATEGORIES = [/* Your 46 JSON items here */];
const SECTIONS = ["Hero at work", "Finished product", "The team", "Team at work", "Before and after"];

export default function PrecisionDashboard() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [activeTab, setActiveTab] = useState<'templates' | 'images'>('templates');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("");

  const callApi = async (payload: any) => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Generation failed");
    }
    return res.json();
  };

  const handleGenerateTemplates = async () => {
    setLoading(true);
    try {
      const colors = selectedCategory["Accent Colors"].replace(' or ', ',').split(',').map(c => c.trim());
      for (const color of colors) {
        setCurrentStep(`Gemini 3 Flash: Building ${color} Template...`);
        await callApi({ category: selectedCategory, type: 'TEMPLATE', color: color });
      }
      alert("Templates Generated Successfully!");
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); setCurrentStep(""); }
  };

  const handleImageGen = async (section?: string) => {
    setLoading(true);
    try {
      const targets = section ? [section] : SECTIONS;
      for (const target of targets) {
        setCurrentStep(`Gemini 2.5 Image: Creating ${target}...`);
        await callApi({ category: selectedCategory, type: 'IMAGE', section: target });
      }
      alert("Images Uploaded to category_assets!");
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); setCurrentStep(""); }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto py-12 px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 rounded-3xl shadow-lg shadow-blue-500/20">
              <Sparkles className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight uppercase italic text-white">Factory<span className="text-blue-500">.AI</span></h1>
              <p className="text-slate-500 font-medium tracking-wide">Category: {selectedCategory.Category}</p>
            </div>
          </div>
          
          <div className="relative group">
            <select 
              value={selectedCategory.Category}
              onChange={(e) => setSelectedCategory(CATEGORIES.find(c => c.Category === e.target.value)!)}
              disabled={loading}
              className="w-full md:w-80 appearance-none bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 pr-12 font-bold text-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none cursor-pointer hover:border-slate-600 disabled:opacity-50"
            >
              {CATEGORIES.map(c => <option key={c.Category} value={c.Category}>{c.Category}</option>)}
            </select>
            <ChevronRight className="absolute right-4 top-5 rotate-90 text-slate-500 group-hover:text-blue-400 transition-colors" size={20} />
          </div>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="mb-8 p-5 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-between animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-4">
              <Loader2 className="animate-spin text-blue-500" size={24} />
              <span className="font-bold text-blue-100 italic">{currentStep}</span>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-blue-500/60">Processing</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Tabs */}
          <div className="space-y-3">
            <button 
              onClick={() => setActiveTab('templates')}
              className={`w-full flex items-center justify-between px-6 py-5 rounded-3xl font-bold transition-all duration-300 ${activeTab === 'templates' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-2' : 'bg-slate-900/50 text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
            >
              <div className="flex items-center gap-4"><Layout size={22} /> Templates</div>
              {activeTab === 'templates' && <CheckCircle2 size={18} />}
            </button>
            <button 
              onClick={() => setActiveTab('images')}
              className={`w-full flex items-center justify-between px-6 py-5 rounded-3xl font-bold transition-all duration-300 ${activeTab === 'images' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-2' : 'bg-slate-900/50 text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
            >
              <div className="flex items-center gap-4"><ImageIcon size={22} /> Assets</div>
              {activeTab === 'images' && <CheckCircle2 size={18} />}
            </button>
          </div>

          {/* Action Content */}
          <div className="lg:col-span-3 bg-slate-900/30 border border-slate-800/60 rounded-[3rem] p-10 shadow-2xl">
            {activeTab === 'templates' ? (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-3xl font-black mb-3">HTML Engine</h2>
                  <p className="text-slate-400 text-lg">Generating 2 professional variants using <span className="text-blue-400 font-mono">gemini-3-flash</span>.</p>
                </div>
                <button 
                  onClick={handleGenerateTemplates}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-4 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 py-7 rounded-[2rem] text-2xl font-black transition-all shadow-xl shadow-blue-900/40 active:scale-[0.98] disabled:opacity-30 disabled:grayscale"
                >
                  <Send size={28} /> Build Template Pair
                </button>
              </div>
            ) : (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-800/20 p-8 rounded-[2.5rem] border border-slate-800/50">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Full Asset Suite</h2>
                    <p className="text-slate-400">Generates all 5 visual sections for this category.</p>
                  </div>
                  <button 
                    onClick={() => handleImageGen()}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-500 px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-3 transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-20"
                  >
                    <Box size={22} /> Generate All
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <p className="text-xs font-black text-slate-600 uppercase tracking-[0.3em] mb-2 px-4">Selective Generation</p>
                  {SECTIONS.map(item => (
                    <button 
                      key={item}
                      onClick={() => handleImageGen(item)}
                      disabled={loading}
                      className="flex items-center justify-between bg-slate-800/30 hover:bg-slate-800/60 p-6 rounded-3xl border border-slate-800/50 group transition-all active:scale-[0.99]"
                    >
                      <span className="text-lg font-bold text-slate-400 group-hover:text-white transition-colors">{item}</span>
                      <div className="p-3 bg-slate-700/50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <MousePointer2 size={20} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
