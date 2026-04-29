import React from 'react';
import { Home, MessageSquare, Brain, BookOpen, ShieldAlert, Settings, LogOut } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'chat', label: 'AI Support', icon: MessageSquare },
  { id: 'mood', label: 'Mood Track', icon: Brain },
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'crisis', label: 'Get Help', icon: ShieldAlert, variant: 'danger' },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-brand-bg border-r border-slate-900 flex flex-col p-6 sticky top-0">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Brain size={24} />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">MindEase</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                isActive 
                  ? "bg-slate-800 text-brand-accent border border-slate-700 shadow-inner" 
                  : "text-slate-500 hover:bg-slate-900/50 hover:text-slate-300",
                item.variant === 'danger' && !isActive && "text-rose-500/70 hover:bg-rose-500/5 hover:text-rose-400"
              )}
            >
              <Icon size={18} className={cn(
                "transition-transform duration-200",
                isActive ? "text-brand-accent" : "text-slate-600 group-hover:text-slate-400"
              )} />
              {item.label}
              {isActive && (
                <motion.div 
                  layoutId="active-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-accent shadow-[0_0_8px_#22D3EE]"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 pt-6 border-t border-slate-900">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-900/50 hover:text-slate-300 transition-all text-xs font-mono tracking-widest uppercase">
          <Settings size={16} />
          Settings
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-rose-500/5 hover:text-rose-400 transition-all text-xs font-mono tracking-widest uppercase">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}
