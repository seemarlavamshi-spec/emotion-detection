import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import DashboardOverview from './components/dashboard/Overview';
import ChatInterface from './components/chat/ChatInterface';
import MoodTracker from './components/mood/MoodTracker';
import Journal from './components/journal/Journal';
import CrisisHelp from './components/crisis/CrisisHelp';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex min-h-screen bg-brand-bg text-slate-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <div className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              {activeTab === 'dashboard' && <DashboardOverview />}
              {activeTab === 'chat' && <ChatInterface />}
              {activeTab === 'mood' && <MoodTracker />}
              {activeTab === 'journal' && <Journal />}
              {activeTab === 'crisis' && <CrisisHelp />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
