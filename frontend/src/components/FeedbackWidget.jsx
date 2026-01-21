import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle, 
  Send,
  Loader2,
  Sparkles,
  MessageSquarePlus
} from 'lucide-react';

const API_URL = 'http://localhost:8000/api/v1';

/**
 * FeedbackWidget - RLHF Feedback Component for AI Rewrites
 * @param {Object} props
 * @param {string} props.messageId - Unique identifier for the message
 * @param {string} props.initialText - The AI's rewritten text
 * @param {function} props.onFeedbackSubmit - Optional callback after feedback is submitted
 */
const FeedbackWidget = ({ 
  messageId, 
  initialText,
  onFeedbackSubmit 
}) => {
  // Status: 'idle' | 'submitted' | 'providing_correction'
  const [status, setStatus] = useState('idle');
  const [correction, setCorrection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null); // 'positive' | 'negative'

  // Submit feedback to API
  const submitFeedback = useCallback(async (rating, userCorrection = null) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_id: messageId,
          rating: rating,
          user_correction: userCorrection,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setStatus('submitted');
      setFeedbackType(rating > 0 ? 'positive' : 'negative');
      
      if (onFeedbackSubmit) {
        onFeedbackSubmit({ rating, userCorrection });
      }
    } catch (error) {
      console.error('Feedback submission failed:', error);
      // Reset to idle on error
      setStatus('idle');
    } finally {
      setIsSubmitting(false);
    }
  }, [messageId, onFeedbackSubmit]);

  // Handle Thumbs Up - immediate submission
  const handleThumbsUp = useCallback(() => {
    if (status !== 'idle') return;
    submitFeedback(1);
  }, [status, submitFeedback]);

  // Handle Thumbs Down - show correction input
  const handleThumbsDown = useCallback(() => {
    if (status !== 'idle') return;
    setStatus('providing_correction');
  }, [status]);

  // Handle correction submission
  const handleSubmitCorrection = useCallback(() => {
    if (!correction.trim()) return;
    submitFeedback(-1, correction.trim());
  }, [correction, submitFeedback]);

  // Cancel correction and go back to idle
  const handleCancelCorrection = useCallback(() => {
    setStatus('idle');
    setCorrection('');
  }, []);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {/* Status: Submitted */}
        {status === 'submitted' && (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`
              flex items-center justify-center gap-2 py-3 px-4 rounded-xl
              ${feedbackType === 'positive' 
                ? 'bg-emerald-500/10 border border-emerald-500/30' 
                : 'bg-violet-500/10 border border-violet-500/30'
              }
            `}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {feedbackType === 'positive' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <Sparkles className="w-5 h-5 text-violet-400" />
              )}
            </motion.div>
            <span className={`text-sm font-medium ${
              feedbackType === 'positive' ? 'text-emerald-400' : 'text-violet-400'
            }`}>
              {feedbackType === 'positive' 
                ? 'Thanks for your feedback!' 
                : 'Thanks for teaching the AI!'
              }
            </span>
          </motion.div>
        )}

        {/* Status: Idle - Show Rating Buttons */}
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-sm text-slate-400">Was this helpful?</span>
            
            <div className="flex items-center gap-2">
              {/* Thumbs Up Button */}
              <motion.button
                onClick={handleThumbsUp}
                disabled={isSubmitting}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  group relative p-2.5 rounded-xl transition-all duration-300 overflow-hidden
                  bg-slate-800/80 border border-slate-600/50
                  hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                title="This was helpful"
              >
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <ThumbsUp className="relative z-10 w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </motion.button>

              {/* Thumbs Down Button */}
              <motion.button
                onClick={handleThumbsDown}
                disabled={isSubmitting}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  group relative p-2.5 rounded-xl transition-all duration-300 overflow-hidden
                  bg-slate-800/80 border border-slate-600/50
                  hover:bg-red-500/10 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/10
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                title="This could be better"
              >
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <ThumbsDown className="relative z-10 w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
              </motion.button>
            </div>

            {/* Loading Spinner */}
            <AnimatePresence>
              {isSubmitting && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                >
                  <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Status: Providing Correction */}
        {status === 'providing_correction' && (
          <motion.div
            key="correction"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <MessageSquarePlus className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white">Teach the AI</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    How would you improve this response?
                  </p>
                </div>
              </div>

              {/* Original Text Reference */}
              {initialText && (
                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
                  <p className="text-xs text-slate-500 mb-1.5">Original AI response:</p>
                  <p className="text-sm text-slate-400 italic line-clamp-2">{initialText}</p>
                </div>
              )}

              {/* Correction Input */}
              <div className="relative">
                <textarea
                  value={correction}
                  onChange={(e) => setCorrection(e.target.value)}
                  placeholder="Write a better version here..."
                  rows={3}
                  className="
                    w-full bg-slate-900/80 border border-slate-600/50 rounded-xl 
                    px-4 py-3 text-sm text-slate-100 placeholder-slate-500
                    focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10
                    resize-none transition-all duration-200
                  "
                  autoFocus
                />
                <div className="absolute bottom-2 right-2 text-xs text-slate-500">
                  {correction.length} chars
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleCancelCorrection}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>

                <motion.button
                  onClick={handleSubmitCorrection}
                  disabled={!correction.trim() || isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                    bg-gradient-to-r from-violet-500 to-fuchsia-500
                    hover:from-violet-600 hover:to-fuchsia-600
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-300
                    shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Teach AI
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackWidget;
