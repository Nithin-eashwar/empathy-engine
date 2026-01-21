import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Send, 
  Loader2, 
  Trophy, 
  XCircle, 
  RefreshCw,
  MessageSquare,
  Target,
  Zap
} from 'lucide-react';

const API_URL = 'http://localhost:8000/api/v1';

// Toxic scenarios for training
const SCENARIOS = [
  {
    id: 1,
    title: "The Angry Client",
    scenario: "A client screams at you: 'This is the third time you've missed the deadline! You people are completely incompetent!'",
    difficulty: "Hard",
    category: "Customer Service"
  },
  {
    id: 2,
    title: "The Frustrated Colleague",
    scenario: "Your colleague sends you: 'Why didn't you tell me about the meeting change? Now I look like an idiot in front of everyone!'",
    difficulty: "Medium",
    category: "Workplace"
  },
  {
    id: 3,
    title: "The Disappointed Manager",
    scenario: "Your manager says: 'I expected better from you. This report is nowhere near what we discussed.'",
    difficulty: "Medium",
    category: "Workplace"
  },
  {
    id: 4,
    title: "The Upset Friend",
    scenario: "Your friend texts: 'You always cancel on me at the last minute. I guess I'm just not a priority for you.'",
    difficulty: "Easy",
    category: "Personal"
  },
  {
    id: 5,
    title: "The Heated Debate",
    scenario: "Someone in a meeting says: 'That's the dumbest idea I've ever heard. Have you even thought this through?'",
    difficulty: "Hard",
    category: "Workplace"
  },
  {
    id: 6,
    title: "The Critical Review",
    scenario: "A user review states: 'This product is garbage. I can't believe I wasted my money on this trash.'",
    difficulty: "Medium",
    category: "Customer Service"
  },
  {
    id: 7,
    title: "The Family Tension",
    scenario: "A family member says: 'You never call, you never visit. It's like you don't care about us anymore.'",
    difficulty: "Medium",
    category: "Personal"
  },
  {
    id: 8,
    title: "The Blame Game",
    scenario: "A teammate accuses: 'This whole project failed because of YOUR mistakes. Don't try to blame anyone else.'",
    difficulty: "Hard",
    category: "Workplace"
  }
];

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'Easy': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    case 'Medium': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    case 'Hard': return 'text-red-400 bg-red-500/20 border-red-500/30';
    default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
  }
};

const EmpathyGym = () => {
  const [currentScenario, setCurrentScenario] = useState(() => 
    SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]
  );
  const [userResponse, setUserResponse] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);

  const getRandomScenario = useCallback(() => {
    const available = SCENARIOS.filter(s => s.id !== currentScenario.id);
    return available[Math.floor(Math.random() * available.length)];
  }, [currentScenario]);

  const analyzeResponse = async () => {
    if (!userResponse.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setShowResult(false);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: userResponse,
          sender: 'gym_user',
        }),
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      setResult(data);
      
      // Calculate if passed (average score >= 0.6)
      const scores = Object.values(data.empathy_scores || {});
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const passed = avgScore >= 0.6;
      
      if (passed) {
        setStreak(prev => prev + 1);
      } else {
        setStreak(0);
      }
      
      setShowResult(true);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const nextChallenge = () => {
    setCurrentScenario(getRandomScenario());
    setUserResponse('');
    setResult(null);
    setShowResult(false);
  };

  const isPassed = result && (() => {
    const scores = Object.values(result.empathy_scores || {});
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return avgScore >= 0.6;
  })();

  const avgScore = result ? (() => {
    const scores = Object.values(result.empathy_scores || {});
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  })() : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-violet-400" />
            Empathy Gym
          </h2>
          <p className="text-slate-400 mt-1">Practice handling difficult situations with empathy</p>
        </div>
        
        {/* Streak Counter */}
        <motion.div
          key={streak}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-3 px-4 py-2 glass-card"
        >
          <div className="flex items-center gap-2">
            <Zap className={`w-5 h-5 ${streak > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="text-sm text-slate-400">Streak:</span>
          </div>
          <span className={`text-2xl font-bold font-mono ${streak > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
            {streak}
          </span>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario Card */}
        <div className="space-y-6">
          <motion.div
            key={currentScenario.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 relative overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:20px_20px]" />
            </div>
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-violet-400" />
                  <span className="text-sm font-medium text-slate-400">{currentScenario.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(currentScenario.difficulty)}`}>
                    {currentScenario.difficulty}
                  </span>
                  <button
                    onClick={nextChallenge}
                    className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600/50 transition-colors"
                    title="Skip to next challenge"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-400" />
                {currentScenario.title}
              </h3>
              
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/50">
                <p className="text-slate-200 leading-relaxed italic">
                  "{currentScenario.scenario}"
                </p>
              </div>
            </div>
          </motion.div>

          {/* Response Input */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Empathetic Response</h3>
            <textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="How would you respond with empathy? Remember: acknowledge feelings, show understanding, and avoid blame..."
              rows={5}
              className="cyber-input resize-none mb-4"
              disabled={isAnalyzing || showResult}
            />
            
            {!showResult ? (
              <button
                onClick={analyzeResponse}
                disabled={!userResponse.trim() || isAnalyzing}
                className="cyber-button w-full flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Your Response...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Response
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextChallenge}
                className="cyber-button w-full flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Next Challenge
              </button>
            )}
          </div>
        </div>

        {/* Result Section */}
        <div>
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card h-full min-h-[400px] flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="relative inline-flex">
                    <div className="w-20 h-20 border-4 border-violet-500/30 rounded-full" />
                    <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-violet-500 rounded-full animate-spin" />
                  </div>
                  <p className="mt-4 text-slate-400">Evaluating your empathy...</p>
                </div>
              </motion.div>
            ) : showResult ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card p-6 h-full relative overflow-hidden"
              >
                {/* Background Effect based on result */}
                <div className={`absolute inset-0 ${isPassed ? 'bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10' : 'bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10'}`} />
                
                <div className="relative">
                  {/* Result Header */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="text-center mb-6"
                  >
                    {isPassed ? (
                      <>
                        <motion.div
                          initial={{ rotate: -180, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          transition={{ type: "spring", delay: 0.3 }}
                          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 mb-4 shadow-lg shadow-emerald-500/30"
                        >
                          <Trophy className="w-10 h-10 text-white" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-emerald-400 glow-text">Excellent!</h3>
                        <p className="text-slate-400 mt-1">Great empathetic response</p>
                      </>
                    ) : (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.3 }}
                          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 mb-4 shadow-lg shadow-red-500/30"
                        >
                          <XCircle className="w-10 h-10 text-white" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-red-400">Keep Practicing</h3>
                        <p className="text-slate-400 mt-1">Room for improvement</p>
                      </>
                    )}
                  </motion.div>

                  {/* Score Display */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/80 border border-slate-700/50">
                      <span className="text-slate-400">Empathy Score:</span>
                      <span className={`text-3xl font-bold font-mono ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                        {(avgScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Passing score: 60%</p>
                  </div>

                  {/* Score Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Score Breakdown</h4>
                    {result && Object.entries(result.empathy_scores || {}).map(([key, value], index) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <span className="text-sm text-slate-400 capitalize flex-shrink-0 w-28">
                          {key.replace('_', ' ')}
                        </span>
                        <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${value * 100}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                            className={`h-full rounded-full ${
                              value >= 0.6 
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                                : 'bg-gradient-to-r from-red-500 to-orange-500'
                            }`}
                          />
                        </div>
                        <span className={`text-sm font-mono font-bold w-12 text-right ${
                          value >= 0.6 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {(value * 100).toFixed(0)}%
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Suggested Rewrite */}
                  {result?.rewrites?.[0] && !isPassed && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="mt-6 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20"
                    >
                      <h4 className="text-sm font-semibold text-teal-400 mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Try this approach:
                      </h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {result.rewrites[0].text}
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card h-full min-h-[400px] flex items-center justify-center p-6"
              >
                <div className="text-center max-w-sm">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-teal-500/20 flex items-center justify-center">
                    <Dumbbell className="w-8 h-8 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Ready to Train?</h3>
                  <p className="text-sm text-slate-400">
                    Read the scenario on the left, craft an empathetic response, and submit to see your score!
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      ≥60% Pass
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      &lt;60% Fail
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EmpathyGym;
