import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Loader2, 
  AlertTriangle, 
  AlertCircle,
  Sparkles,
  RefreshCw,
  Zap,
  Wand2
} from 'lucide-react';
import VoiceInput from './VoiceInput';
import EmpathyRadar from './EmpathyRadar';
import FeedbackWidget from './FeedbackWidget';
import PersonaSelector from './PersonaSelector';
import { useDebounce } from '../hooks/useDebounce';


const API_URL = 'http://localhost:8000/api/v1';

// Minimum character count for real-time analysis
const MIN_CHARS_FOR_ANALYSIS = 10;
// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 1000;

const Dashboard = () => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState('Diplomat');
  const [liveAnalysisEnabled, setLiveAnalysisEnabled] = useState(false);

  // Debounced text for real-time analysis
  const debouncedText = useDebounce(inputText, DEBOUNCE_DELAY);

  // Real-time analysis effect
  useEffect(() => {
    // Only trigger if:
    // 1. Live analysis is enabled
    // 2. Text is long enough
    // 3. Not already analyzing
    // 4. Debounced text matches current input (user stopped typing)
    if (
      liveAnalysisEnabled &&
      debouncedText.trim().length >= MIN_CHARS_FOR_ANALYSIS &&
      !isAnalyzing &&
      debouncedText === inputText
    ) {
      analyzeTextSilent(debouncedText);
    }
  }, [debouncedText, liveAnalysisEnabled]);

  // Silent analyze (doesn't clear previous result immediately)
  const analyzeTextSilent = async (text) => {
    if (!text.trim() || text.trim().length < MIN_CHARS_FOR_ANALYSIS) return;
    
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          sender: 'user',
          style: selectedPersona,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      // Don't show errors for background analysis
      console.error('Background analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };


  // Handle live transcript updates (replaces text while speaking)
  const handleVoiceTranscript = useCallback((transcript) => {
    setInputText(transcript);
  }, []);

  // Handle when speech ends (finalizes the text)
  const handleSpeechEnd = useCallback((finalTranscript) => {
    setInputText(finalTranscript);
  }, []);

  // Handle auto-submit (automatically analyze after speech ends)
  const handleAutoSubmit = useCallback((finalTranscript) => {
    if (finalTranscript.trim()) {
      setInputText(finalTranscript);
      // Trigger analysis after a short delay to ensure state is updated
      setTimeout(() => {
        analyzeTextWithInput(finalTranscript);
      }, 100);
    }
  }, []);

  // Analyze with specific input (used for auto-submit)
  const analyzeTextWithInput = async (text) => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          sender: 'user',
          style: selectedPersona,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze text');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeText = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          sender: 'user',
          style: selectedPersona,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze text');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setInputText('');
    setResult(null);
    setError(null);
  };

  const hasIssues = result?.issues && result.issues.length > 0;
  const hasRewrite = result?.rewrites && result.rewrites.length > 0;


  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-teal-400" />
            Communication Cockpit
          </h2>
          <p className="text-slate-400 mt-1">Analyze and transform your messages with AI-powered empathy</p>
        </div>
        {result && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            New Analysis
          </motion.button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Left Column - Input & Issues */}
        <div className="lg:col-span-7 space-y-6">
          {/* Input Section */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              Message Input
            </h3>
            
            <div className="space-y-4">
              {/* Textarea with Voice Input */}
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or speak your message here... The AI will analyze its empathy levels and suggest improvements."
                  rows={6}
                  className="cyber-input resize-none pr-14 font-mono text-sm"
                  disabled={isAnalyzing}
                />
                <div className="absolute bottom-3 right-3">
                  <VoiceInput 
                    onTranscript={handleVoiceTranscript} 
                    onSpeechEnd={handleSpeechEnd}
                    onAutoSubmit={handleAutoSubmit}
                    disabled={isAnalyzing} 
                    showAutoSubmitToggle={true}
                  />
                </div>
              </div>


              {/* Character Count, Live Analysis Toggle, Persona Selector & Analyze Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">
                    {inputText.length} characters
                  </span>
                  
                  {/* Live Analysis Toggle */}
                  <motion.button
                    onClick={() => setLiveAnalysisEnabled(!liveAnalysisEnabled)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                      transition-all duration-200 border
                      ${liveAnalysisEnabled 
                        ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' 
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-300 hover:border-slate-600/50'
                      }
                    `}
                    title={liveAnalysisEnabled ? 'Click to disable real-time analysis' : 'Click to enable real-time analysis (auto-analyze as you type)'}
                  >
                    <Wand2 className={`w-3.5 h-3.5 ${liveAnalysisEnabled ? 'animate-pulse' : ''}`} />
                    <span>Live</span>
                    {liveAnalysisEnabled && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-1.5 h-1.5 rounded-full bg-violet-400"
                      />
                    )}
                  </motion.button>
                  
                  {/* Analyzing indicator for live mode */}
                  <AnimatePresence>
                    {liveAnalysisEnabled && isAnalyzing && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-1.5 text-xs text-teal-400"
                      >
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Analyzing...</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Persona Selector */}
                  <PersonaSelector
                    value={selectedPersona}
                    onChange={setSelectedPersona}
                    disabled={isAnalyzing}
                  />

                  
                  {/* Analyze Button */}
                  <button
                    onClick={analyzeText}
                    disabled={!inputText.trim() || isAnalyzing}
                    className="cyber-button flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Analyze Message
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card p-4 border-red-500/30 bg-red-500/10"
              >
                <div className="flex items-center gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Issues Section */}
          <AnimatePresence>
            {hasIssues && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Detected Issues
                </h3>
                <div className="space-y-3">
                  {result.issues.map((issue, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/30 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="badge-warning flex-shrink-0">{issue.issue}</span>
                        {issue.span && (
                          <code className="text-sm text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">
                            "{issue.span}"
                          </code>
                        )}
                      </div>
                      {issue.explanation && (
                        <p className="mt-2 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                          {issue.explanation}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rewrite Section */}
          <AnimatePresence>
            {hasRewrite && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card p-6 relative overflow-hidden"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-transparent to-violet-500/10 pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />
                
                <div className="relative">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-400" />
                    AI-Suggested Rewrite
                  </h3>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-violet-500/10 border border-teal-500/20">
                    <p className="text-slate-200 leading-relaxed">
                      {result.rewrites[0].text}
                    </p>
                  </div>

                  {/* RLHF Feedback Widget */}
                  <div className="mt-4">
                    <FeedbackWidget 
                      messageId={result.message_id || `msg_${Date.now()}`}
                      initialText={result.rewrites[0].text}
                      onFeedbackSubmit={(data) => {
                        console.log('Feedback submitted:', data);
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Right Column - Visualization */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-6 h-full min-h-[500px] flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="relative inline-flex">
                    <div className="w-16 h-16 border-4 border-teal-500/30 rounded-full" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-teal-500 rounded-full animate-spin" />
                  </div>
                  <p className="mt-4 text-slate-400">Analyzing empathy patterns...</p>
                </div>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <EmpathyRadar scores={result.empathy_scores || {}} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-6 h-full min-h-[500px] flex items-center justify-center"
              >
                <div className="text-center max-w-sm">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500/20 to-violet-500/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-teal-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Head-Up Display Ready</h3>
                  <p className="text-sm text-slate-400">
                    Enter a message and click "Analyze" to see the empathy radar visualization
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
