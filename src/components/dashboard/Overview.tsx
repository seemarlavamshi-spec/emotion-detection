import React, { useState, useEffect } from 'react';
import { Activity, Heart, Sparkles, AlertCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

export default function DashboardOverview() {
  const [moodHistory, setMoodHistory] = useState<any[]>([]);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('mood_history') || '[]');
    setMoodHistory(history);
  }, []);

  const getMoodDistribution = () => {
    const counts: Record<string, number> = {};
    moodHistory.forEach(item => {
      counts[item.emotion] = (counts[item.emotion] || 0) + 1;
    });
    return counts;
  };

  const distribution = getMoodDistribution();
  const latestMood = moodHistory.length > 0 ? moodHistory[moodHistory.length - 1] : null;

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-end mb-6 px-2">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Health Dashboard</h1>
          <p className="text-slate-500 mt-1 uppercase text-xs font-mono tracking-widest italic italic">Session: Resilience_Protocol_Active</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-brand-accent shadow-[0_0_8px_#22D3EE]"></div>
            <span className="text-[10px] font-mono font-semibold text-brand-accent uppercase">AI Link Stable</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-12 grid-rows-2 gap-4 h-[auto]">
        {[
          { label: 'Avg Mood', value: latestMood ? latestMood.emotion : 'N/A', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10', colSpan: 'col-span-3' },
          { label: 'Analysis Logs', value: moodHistory.length.toString(), icon: MessageSquare, color: 'text-brand-accent', bg: 'bg-cyan-500/10', colSpan: 'col-span-3' },
          { label: 'Mindful Cycles', value: `${moodHistory.length} Logs`, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10', colSpan: 'col-span-3' },
          { label: 'Crisis Alerts', value: '0', icon: AlertCircle, color: 'text-slate-600', bg: 'bg-slate-800', colSpan: 'col-span-3' },
        ].map((stat, i) => (
          <div key={i} className={cn(stat.colSpan, "bg-brand-card border border-slate-800 rounded-2xl p-6 flex flex-col justify-between transition-all hover:border-slate-700 group")}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", stat.bg)}>
              <stat.icon className={stat.color} size={20} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1 capitalize">{stat.value}</p>
            </div>
          </div>
        ))}

        {/* Mood Trend Chart Placeholder */}
        <div className="col-span-8 row-span-2 bg-[#0F1420] border border-slate-800 rounded-2xl p-8 flex flex-col transition-all hover:border-slate-700">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Emotional distribution</h2>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-brand-accent font-mono">LIVE_FEED</span>
            </div>
          </div>
          
          {moodHistory.length === 0 ? (
            <div className="flex-1 bg-slate-900/30 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-slate-600 p-8 text-center">
              <Activity size={32} className="mb-4 opacity-20" />
              <p className="text-xs font-mono tracking-widest uppercase">No stream data detected</p>
              <p className="text-[10px] mt-2 opacity-50 max-w-[200px]">Recording needed to initialize trend visualization.</p>
            </div>
          ) : (
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2">
              {Object.entries(distribution)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .map(([emotion, count]) => {
                const percentage = Math.round(((count as number) / moodHistory.length) * 100);
                
                const getBarColor = (emo: string) => {
                  const e = emo.toLowerCase();
                  if (e.includes('happy') || e.includes('joy')) return 'bg-emerald-500';
                  if (e.includes('sad')) return 'bg-blue-500';
                  if (e.includes('angry')) return 'bg-rose-500';
                  if (e.includes('depression')) return 'bg-indigo-500';
                  if (e.includes('anxiety') || e.includes('stressed')) return 'bg-amber-500';
                  if (e.includes('tired')) return 'bg-purple-500';
                  if (e.includes('hungry')) return 'bg-orange-500';
                  if (e.includes('surprised') || e.includes('excited')) return 'bg-cyan-400';
                  if (e.includes('fearful') || e.includes('scared')) return 'bg-slate-400';
                  return 'bg-brand-primary';
                };
                
                return (
                  <div key={emotion} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                      <span className="text-slate-400">{emotion}</span>
                      <span className="text-brand-accent">{percentage}% ({count as number})</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn("h-full", getBarColor(emotion))}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Daily Insights */}
        <div className="col-span-4 row-span-2 bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 border border-brand-primary/30 rounded-2xl p-8 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors" />
          
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-10 relative z-10 transition-transform group-hover:rotate-12">
            <Sparkles size={24} className="text-brand-accent" />
          </div>
          
          <div className="relative z-10 flex-1">
            <h3 className="text-xs font-mono font-bold text-brand-accent uppercase tracking-widest mb-4">protocol::insight</h3>
            <p className="text-xl font-bold text-white leading-tight">
              "System recovery starts with a single mindful cycle. Initialize breathing protocol."
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
            <div className="space-y-0.5 text-xs">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Activity_Link</span>
              <p className="font-bold text-slate-300">Meditation v1.2</p>
            </div>
            <button className="bg-brand-accent/20 hover:bg-brand-accent/30 p-2.5 rounded-full transition-all text-brand-accent border border-brand-accent/20">
              <Heart size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
