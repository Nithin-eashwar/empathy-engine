import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Persona options for the AI rewrite style
 */
const PERSONAS = [
  { id: 'Diplomat', label: 'Diplomat', emoji: '🕊️', description: 'Empathetic & balanced' },
  { id: 'Gen Z', label: 'Gen Z', emoji: '💀', description: 'Casual & relatable' },
  { id: 'Executive', label: 'Executive', emoji: '💼', description: 'Brief & professional' },
  { id: 'Victorian', label: 'Victorian', emoji: '🎩', description: 'Formal & eloquent' },
];

/**
 * PersonaSelector - Cyberpunk-styled dropdown for AI voice selection
 * @param {Object} props
 * @param {string} props.value - Currently selected persona ID
 * @param {function} props.onChange - Callback when selection changes
 * @param {boolean} props.disabled - Disable the selector
 */
const PersonaSelector = ({ value = 'Diplomat', onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Find the currently selected persona
  const selectedPersona = PERSONAS.find(p => p.id === value) || PERSONAS[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (personaId) => {
    onChange?.(personaId);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <motion.button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-slate-800/80 border border-slate-600/50
          hover:bg-slate-700/80 hover:border-slate-500/50
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'border-teal-500/50 bg-slate-700/80' : ''}
        `}
      >
        <span className="text-lg">{selectedPersona.emoji}</span>
        <span className="text-sm font-medium text-slate-200">{selectedPersona.label}</span>
        <ChevronDown 
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-50 min-w-[200px]"
          >
            <div className="glass-card p-2 border border-slate-600/50 shadow-xl shadow-black/20">
              {/* Header */}
              <div className="px-3 py-2 mb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  AI Voice
                </span>
              </div>

              {/* Options */}
              <div className="space-y-1">
                {PERSONAS.map((persona) => {
                  const isSelected = persona.id === value;
                  
                  return (
                    <motion.button
                      key={persona.id}
                      onClick={() => handleSelect(persona.id)}
                      whileHover={{ x: 4 }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                        text-left transition-all duration-150
                        ${isSelected 
                          ? 'bg-teal-500/10 border border-teal-500/30' 
                          : 'hover:bg-slate-700/50 border border-transparent'
                        }
                      `}
                    >
                      {/* Emoji */}
                      <span className="text-lg flex-shrink-0">{persona.emoji}</span>
                      
                      {/* Label & Description */}
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${isSelected ? 'text-teal-400' : 'text-slate-200'}`}>
                          {persona.label}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {persona.description}
                        </div>
                      </div>

                      {/* Check Icon */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex-shrink-0"
                        >
                          <Check className="w-4 h-4 text-teal-400" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer Hint */}
              <div className="mt-2 pt-2 border-t border-slate-700/50 px-3 pb-1">
                <p className="text-xs text-slate-500">
                  Changes how the AI phrases suggestions
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonaSelector;
