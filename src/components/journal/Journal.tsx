import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Calendar, Heart, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  date: string;
}

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('journal_entries');
    if (saved) {
      setEntries(JSON.parse(saved));
    } else {
      // Seed with sample
      const initial = [{
        id: '1',
        title: 'A morning reflection',
        content: 'Early morning walk really helped clear my head today. The air was crisp and I felt a sense of peace I haven’t felt in weeks...',
        mood: 'Peaceful',
        date: new Date(Date.now() - 86400000).toISOString()
      }];
      setEntries(initial);
      localStorage.setItem('journal_entries', JSON.stringify(initial));
    }
  }, []);

  const saveEntries = (updated: JournalEntry[]) => {
    setEntries(updated);
    localStorage.setItem('journal_entries', JSON.stringify(updated));
  };

  const addEntry = async () => {
    if (!newEntry.content.trim() || isAnalyzing) return;
    setIsAnalyzing(true);

    let detectedMood = 'Thoughtful';

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: `Based on this journal entry, what is the single most prominent emotion? Return ONLY the emotion name (one word). Entry: "${newEntry.content}"` }] }]
      });
      detectedMood = (response.text || 'Thoughtful').trim().replace(/[.]/g, '');
    } catch (error) {
      console.error("AI Mood Detection Error:", error);
    }

    const entry: JournalEntry = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEntry.title || 'Untitled Reflection',
      content: newEntry.content,
      mood: detectedMood,
      date: new Date().toISOString()
    };

    saveEntries([entry, ...entries]);
    setNewEntry({ title: '', content: '' });
    setIsAdding(false);
    setIsAnalyzing(false);
  };

  const deleteEntry = (id: string) => {
    saveEntries(entries.filter(e => e.id !== id));
  };

  const filteredEntries = entries.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold text-slate-100 italic">Mindful Journal</h2>
          <p className="text-slate-500 mt-1">Capture your thoughts and track your inner growth.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-brand-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all active:scale-95"
        >
          <Plus size={20} />
          Write New Entry
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entry List */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="popLayout">
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-brand-card rounded-[2rem] border-2 border-brand-primary/20 shadow-xl overflow-hidden ring-4 ring-brand-primary/5"
              >
                <div className="p-8 space-y-6">
                  <input 
                    type="text"
                    placeholder="Give your reflection a title..."
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                    className="w-full text-2xl font-serif font-bold text-white placeholder:text-slate-800 outline-none italic bg-transparent"
                  />
                  <textarea 
                    placeholder="Start writing from the heart..."
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                    className="w-full min-h-[300px] text-lg text-slate-300 placeholder:text-slate-800 outline-none resize-none italic leading-relaxed bg-transparent"
                  />
                  <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                      <Sparkles size={14} className="text-brand-accent" />
                      AI Insights Active
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setIsAdding(false)}
                        className="px-6 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-800 transition-colors"
                      >
                        Discard
                      </button>
                      <button 
                        onClick={addEntry}
                        disabled={isAnalyzing || !newEntry.content.trim()}
                        className="bg-brand-primary text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : 'Keep Entry'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {filteredEntries.length === 0 && !isAdding && (
              <div className="bg-brand-card/50 border-2 border-dashed border-slate-800 rounded-[2rem] p-24 text-center">
                <BookOpen size={48} className="mx-auto mb-6 text-slate-800" />
                <p className="text-slate-600 font-medium italic">Your journal is waiting for its first page...</p>
              </div>
            )}

            {filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-brand-card p-8 rounded-[2rem] border border-slate-800 shadow-sm relative group hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-white italic">{entry.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <Calendar size={14} />
                        {new Date(entry.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-bold uppercase tracking-widest leading-none border border-brand-primary/20">
                        <Heart size={10} />
                        {entry.mood}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteEntry(entry.id)}
                    className="p-2 text-slate-700 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-slate-400 leading-relaxed italic whitespace-pre-wrap">
                  {entry.content}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Sidebar Features */}
        <div className="space-y-6">
          <div className="bg-brand-card p-8 rounded-[2rem] border border-slate-800 shadow-sm">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <Search size={18} className="text-brand-accent" />
              Quick Search
            </h3>
            <input 
              type="text" 
              placeholder="Searching through time..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-white"
            />
          </div>

          <div className="bg-brand-primary/5 p-8 rounded-[2rem] border border-brand-primary/10">
            <h3 className="font-serif text-2xl font-bold text-brand-primary mb-4 italic">Insightful Prompts</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 italic">
              Sometimes the hardest part is the first word. Try one of these:
            </p>
            <div className="space-y-3">
              {[
                "What made you smile unexpectedly today?",
                "Identify one thing you handled well this week.",
                "Describe a place where you feel perfectly safe."
              ].map((prompt, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    setIsAdding(true);
                    setNewEntry({ ...newEntry, content: prompt + "\n\n" });
                  }}
                  className="w-full text-left p-4 bg-brand-card rounded-2xl text-xs font-medium text-slate-300 border border-slate-800 hover:border-brand-primary/30 hover:shadow-sm transition-all italic"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

