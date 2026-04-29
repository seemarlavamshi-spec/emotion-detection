import React, { useState } from 'react';
import { BookOpen, Plus, Search, Calendar, Heart, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  date: Date;
}

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      title: 'A morning reflection',
      content: 'Early morning walk really helped clear my head today. The air was crisp and I felt a sense of peace I haven’t felt in weeks...',
      mood: 'Peaceful',
      date: new Date(Date.now() - 86400000)
    }
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });

  const addEntry = () => {
    if (!newEntry.content.trim()) return;
    const entry: JournalEntry = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEntry.title || 'Untitled Entry',
      content: newEntry.content,
      mood: 'Calm',
      date: new Date()
    };
    setEntries([entry, ...entries]);
    setNewEntry({ title: '', content: '' });
    setIsAdding(false);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold text-slate-900 italic">Mindful Journal</h2>
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
                className="bg-white rounded-[2rem] border-2 border-brand-primary/20 shadow-xl shadow-brand-primary/5 overflow-hidden ring-4 ring-brand-primary/5"
              >
                <div className="p-8 space-y-6">
                  <input 
                    type="text"
                    placeholder="Give your reflection a title..."
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                    className="w-full text-2xl font-serif font-bold text-slate-900 placeholder:text-slate-200 outline-none italic"
                  />
                  <textarea 
                    placeholder="Start writing from the heart..."
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                    className="w-full min-h-[300px] text-lg text-slate-600 placeholder:text-slate-300 outline-none resize-none italic leading-relaxed"
                  />
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <div className="flex gap-2">
                       <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Mood Tracking: Calm</span>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setIsAdding(false)}
                        className="px-6 py-2 rounded-xl text-slate-400 font-bold hover:bg-slate-50 transition-colors"
                      >
                        Discard
                      </button>
                      <button 
                        onClick={addEntry}
                        className="bg-brand-primary text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-all"
                      >
                        Keep Entry
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {entries.length === 0 && !isAdding && (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-24 text-center">
                <BookOpen size={48} className="mx-auto mb-6 text-slate-200" />
                <p className="text-slate-400 font-medium italic italic">Your journal is waiting for its first page...</p>
              </div>
            )}

            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-slate-900 italic italic">{entry.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <Calendar size={14} />
                        {entry.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-soft text-brand-primary rounded-full text-[10px] font-bold uppercase tracking-widest leading-none">
                        <Heart size={10} />
                        {entry.mood}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteEntry(entry.id)}
                    className="p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-slate-600 leading-relaxed italic italic line-clamp-3">
                  {entry.content}
                </p>
                <button className="mt-4 text-xs font-bold text-brand-primary hover:underline underline-offset-4 uppercase tracking-widest font-sans">
                  Read Full Reflection
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Sidebar Features */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Search size={18} className="text-brand-primary" />
              Quick Search
            </h3>
            <input 
              type="text" 
              placeholder="Searching through time..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all"
            />
          </div>

          <div className="bg-brand-soft p-8 rounded-[2rem] border border-brand-primary/10">
            <h3 className="font-serif text-2xl font-bold text-brand-primary mb-4 italic italic">Insightful Prompts</h3>
            <p className="text-sm text-brand-primary/70 leading-relaxed mb-6 italic italic">
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
                  className="w-full text-left p-4 bg-white rounded-2xl text-xs font-medium text-slate-600 border border-slate-100 hover:border-brand-primary/30 hover:shadow-sm transition-all italic"
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
