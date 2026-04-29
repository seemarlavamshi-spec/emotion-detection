import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-20 bg-brand-bg/80 backdrop-blur-md border-b border-slate-900 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="relative w-96">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          <Search size={16} />
        </span>
        <input 
          type="text" 
          placeholder="SEARCH_RESOURCES..."
          className="w-full bg-slate-900/50 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-[11px] font-mono tracking-wider text-slate-400 focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-all outline-none"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-brand-accent transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-brand-bg rounded-full shadow-[0_0_8px_#f43f5e]">
          </span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
          <div className="text-right">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">User_Active</p>
            <p className="text-sm font-bold text-white">Alex Johnson</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
            <User className="text-brand-accent" size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
