import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, AlertCircle, Settings2 } from 'lucide-react';
import useVoiceInput from '../hooks/useVoiceInput';

/**
 * VoiceInput Component - Cyberpunk-styled voice input button
 * @param {Object} props
 * @param {function} props.onTranscript - Called with text while speaking (real-time)
 * @param {function} props.onSpeechEnd - Called with final text when speech ends
 * @param {function} props.onAutoSubmit - Called when auto-submit is enabled and speech ends
 * @param {boolean} props.disabled - Disable the button
 * @param {boolean} props.showAutoSubmitToggle - Show the auto-submit toggle option
 */
const VoiceInput = ({ 
  onTranscript, 
  onSpeechEnd, 
  onAutoSubmit,
  disabled = false,
  showAutoSubmitToggle = false 
}) => {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  } = useVoiceInput({ continuous: true, interimResults: true });

  const [autoSubmit, setAutoSubmit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Call onTranscript with live text
  useEffect(() => {
    if (onTranscript && (transcript || interimTranscript)) {
      onTranscript(transcript + (interimTranscript ? ` ${interimTranscript}` : ''));
    }
  }, [transcript, interimTranscript, onTranscript]);

  // Handle speech end
  useEffect(() => {
    if (!isListening && transcript) {
      if (onSpeechEnd) {
        onSpeechEnd(transcript);
      }
      if (autoSubmit && onAutoSubmit) {
        onAutoSubmit(transcript);
      }
      // Reset after callback
      resetTranscript();
    }
  }, [isListening, transcript, onSpeechEnd, onAutoSubmit, autoSubmit, resetTranscript]);

  // Don't render if browser doesn't support
  if (!isSupported) {
    return (
      <div className="relative group">
        <button
          disabled
          className="p-3 rounded-xl bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-700/30"
          title="Speech recognition not supported"
        >
          <MicOff className="w-5 h-5" />
        </button>
        
        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Not supported in this browser</span>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-2">
      {/* Main Mic Button */}
      <div className="relative">
        <motion.button
          onClick={toggleListening}
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          className={`
            relative p-3 rounded-xl transition-all duration-300 overflow-hidden border
            ${isListening 
              ? 'bg-gradient-to-r from-red-600 to-rose-500 border-red-400/50 text-white shadow-lg shadow-red-500/40' 
              : 'bg-slate-800/80 border-slate-600/50 text-slate-300 hover:bg-slate-700/80 hover:text-white hover:border-slate-500/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          title={isListening ? 'Click to stop recording' : 'Click to start voice input'}
        >
          {/* Pulse Animation Rings */}
          <AnimatePresence>
            {isListening && (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.6 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 bg-red-500 rounded-xl"
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.4 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                  className="absolute inset-0 bg-red-500 rounded-xl"
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.3 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
                  className="absolute inset-0 bg-red-500 rounded-xl"
                />
              </>
            )}
          </AnimatePresence>
          
          {/* Icon */}
          <div className="relative z-10">
            <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
          </div>
        </motion.button>

        {/* Settings Toggle (if enabled) */}
        {showAutoSubmitToggle && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`
              absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center 
              transition-all duration-200
              ${showSettings 
                ? 'bg-teal-500 text-white' 
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
              }
            `}
          >
            <Settings2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Listening Indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, x: -10, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 'auto' }}
            exit={{ opacity: 0, x: -10, width: 0 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            {/* Waveform Animation */}
            <div className="flex items-center gap-0.5 h-5">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: ['8px', '16px', '8px'],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  }}
                  className="w-1 bg-gradient-to-t from-red-500 to-rose-400 rounded-full"
                />
              ))}
            </div>
            
            <span className="text-sm font-medium text-red-400 whitespace-nowrap">
              Listening...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Transcript Popup */}
      <AnimatePresence>
        {isListening && (transcript || interimTranscript) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-3 left-0 right-0 min-w-[250px] max-w-[350px] p-4 glass-card z-30"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-red-400 font-medium uppercase tracking-wider">Live Transcription</span>
            </div>
            <p className="text-slate-200 text-sm leading-relaxed">
              {transcript}
              {interimTranscript && (
                <span className="text-slate-400 italic"> {interimTranscript}</span>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Popup */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-3 left-0 p-3 rounded-xl bg-red-500/10 border border-red-500/30 z-30 min-w-[200px]"
          >
            <div className="flex items-start gap-2 text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-Submit Settings Dropdown */}
      <AnimatePresence>
        {showSettings && showAutoSubmitToggle && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 p-3 glass-card z-50 min-w-[180px]"
          >

            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-sm text-slate-300">Auto-Submit</span>
              <button
                onClick={() => setAutoSubmit(!autoSubmit)}
                className={`
                  relative w-10 h-5 rounded-full transition-colors duration-200
                  ${autoSubmit ? 'bg-teal-500' : 'bg-slate-600'}
                `}
              >
                <motion.div
                  animate={{ x: autoSubmit ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                />
              </button>
            </label>
            <p className="text-xs text-slate-500 mt-2">
              Automatically analyze when you stop speaking
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInput;
