import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Dumbbell, Sparkles } from 'lucide-react';
import Dashboard from './components/Dashboard';
import EmpathyGym from './components/EmpathyGym';
import './index.css';

const tabs = [
  { id: 'cockpit', label: 'Communication Cockpit', icon: Activity },
  { id: 'gym', label: 'Empathy Gym', icon: Dumbbell },
];

function App() {
  const [activeTab, setActiveTab] = useState('cockpit');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-teal-500/5 via-transparent to-transparent rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-700/50 backdrop-blur-xl bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute inset-0 w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-violet-500 blur-lg opacity-50" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-violet-400 bg-clip-text text-transparent">
                  Empathy Engine
                </h1>
                <p className="text-xs text-slate-400">AI-Powered Communication</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <nav className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
                      ${isActive 
                        ? 'text-white' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-violet-500/20 rounded-lg border border-teal-500/30"
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                    <Icon className="relative z-10 w-4 h-4" />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>API Connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'cockpit' ? (
            <motion.div
              key="cockpit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard />
            </motion.div>
          ) : (
            <motion.div
              key="gym"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EmpathyGym />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
