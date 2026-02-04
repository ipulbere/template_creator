'use client';
import React, { useState } from 'react';
import { Layout, Image as ImageIcon, Send, Box, MousePointer2, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';

// --- PASTE YOUR 46-ITEM JSON ARRAY HERE ---
const CATEGORIES = [
  {
    "Category": "1. Independent consultants",
    "Website Style": "Clean Minimalist",
    "Background Colors": "White, Neutral",
    "Accent Colors": "Blue or Green",
    "List of Services": "Consulting, Case Studies, Solutions",
    "Certificates": "Credentials, Partnerships",
    "Free Offers": "Free Call, White Paper",
    "Equipment": "Computers, Offices",
    "Uniforms": "No",
    "Working Hours": "Flexible, By Appointment",
    "Before and After Pictures": "Sometimes (Case Studies)"
  },
  // ... rest of the 45 categories
];

const SECTIONS = ["Hero at work", "Finished product", "The team", "Team at work", "Before and after"];

export default function PrecisionDashboard() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [activeTab, setActiveTab] = useState<'templates' | 'images'>('templates');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("");

  // Helper to call the API
  const callApi = async (payload: any) => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("API call failed");
    return res.json();
  };

  // HANDLER: Generate 2 Templates (One-by-one to avoid timeout)
  const handleGenerateTemplates = async () => {
    setLoading(true);
    try {
      const colors = selectedCategory["Accent Colors"].replace(' or ', ',').split(',').map(c => c.trim());
      
      for (const color of colors) {
        setCurrentStep(`Generating Template (${color})...`);
        await callApi({
          category: selectedCategory,
          type: 'TEMPLATE',
          color: color
        });
      }
      alert(`Success: 2 Templates created for ${selectedCategory.Category}`);
    } catch (err) {
      alert("Error generating templates. Check console.");
    } finally {
      setLoading(false);
      setCurrentStep("");
    }
  };

  // HANDLER: Generate All 5 Images (One-by-one to avoid timeout)
  const handleAllImages = async () => {
    setLoading(true);
    try {
      for (const section of SECTIONS) {
        setCurrentStep(`Generating Image: ${section}...`);
        await callApi({
          category: selectedCategory,
          type: 'IMAGE',
          section: section
        });
      }
      alert(`Success: All images generated for ${selectedCategory.Category}`);
    } catch (err) {
      alert("Error generating image set.");
    } finally {
      setLoading(false);
      setCurrentStep("");
    }
  };

  // HANDLER: Single Image Update
  const handleSingleImage = async (section: string) => {
    setLoading(true);
    setCurrentStep(`Generating ${section}...`);
    try {
      await callApi({
        category: selectedCategory,
        type: 'IMAGE',
        section: section
      });
      alert(`Updated: ${section}`);
    } catch (err) {
      alert("Error.");
    } finally {
      setLoading(false);
      setCurrentStep("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Header & Category Selector */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 p-8 rounded-3xl border border-slate-800">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase text-blue-500 flex items-center gap-2">
              <Box className="text-blue-400" /> Factory.AI
            </h1>
            <p className="text-slate-500 text-sm mt-1">Bucket & Table: <code className="text-blue-300">category_assets</code></p>
          </div>
          
          <div className="relative min-w-[300px]">
            <select 
              value={selectedCategory.Category}
              onChange={(e) => setSelectedCategory(CATEGORIES.find(c => c.Category === e.target.value)!)}
              disabled={loading}
              className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 pr-12 font-bold text-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none cursor-pointer disabled:opacity-50"
            >
              {CATEGORIES.map(c => <option key={c.Category} value={c.Category}>{c.Category}</option>)}
            </select>
            <ChevronRight className="absolute right-4 top-5 rotate-90 text-slate-500" size={20} />
          </div>
        </div>

        {/* Progress Indicator */}
        {loading && (
          <div className="mb-8 p-4 bg-blue-600/10 border border-blue-500/30 rounded-2xl flex items-center gap-4 animate-pulse">
            <Loader2 className="animate-spin text-blue-400" />
            <span className="font-bold text-blue-400">{currentStep}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Tabs Sidebar */}
          <div className="space-y-3">
            <button 
              onClick={() => setActiveTab('templates')}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'templates' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              <div className="flex items-center gap-3"><Layout size={20} /> Templates</div>
              {activeTab === 'templates' && <CheckCircle2 size={16} />}
            </button>
            <button 
              onClick={() => setActiveTab('images')}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'images' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              <div className="flex items-center gap-3"><ImageIcon size={20} /> Images</div>
              {activeTab === 'images' && <CheckCircle2 size={16} />}
            </button>
          </div>

          {/* Action Panels */}
          <div className="md:col-span-3 bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 shadow-inner">
            {activeTab === 'templates' ? (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-6">
                  <h2 className="text-2xl font-bold mb-2">Build Templates</h2>
                  <p className="text-slate-400">Generates 2 distinct HTML variants for <span className="text-white font-semibold">{selectedCategory.Category}</span>.</p>
                </div>
                <button 
                  onClick={handleGenerateTemplates}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl text-xl font-black transition-all shadow-lg shadow-blue-900/20 disabled:bg-slate-800"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Send size={24} />}
                  Generate Template Pair
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Image Assets</h2>
                  <p className="text-slate-400 mb-6">Create the complete high-res visual library for this category.</p>
                  <button 
                    onClick={handleAllImages}
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-900/20"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Box size={24} />}
                    Generate Full Image Set
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Individual Sections</p>
                  {SECTIONS.map(item => (
                    <button 
                      key={item}
                      onClick={() => handleSingleImage(item)}
                      disabled={loading}
                      className="w-full flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 p-5 rounded-2xl border border-slate-700/50 group transition-all"
                    >
                      <span className="font-bold text-slate-300 group-hover:text-white">{item}</span>
                      <div className="p-2 bg-slate-700 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <MousePointer2 size={18} />
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
