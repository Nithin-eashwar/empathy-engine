import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for browser-native Speech Recognition
 * @param {Object} options - Configuration options
 * @param {string} options.lang - Language code (default: 'en-US')
 * @param {boolean} options.continuous - Keep listening after speech ends (default: false)
 * @param {boolean} options.interimResults - Show results while still speaking (default: true)
 * @returns {Object} Speech recognition state and controls
 */
const useVoiceInput = (options = {}) => {
  const {
    lang = 'en-US',
    continuous = false,
    interimResults = true,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      finalTranscriptRef.current = '';
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        finalTranscriptRef.current += finalText;
        setTranscript(finalTranscriptRef.current);
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      const errorMessages = {
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'Microphone not found. Please check your device.',
        'not-allowed': 'Microphone access denied. Please allow microphone permissions.',
        'network': 'Network error occurred. Please check your connection.',
        'aborted': 'Speech recognition was aborted.',
        'service-not-allowed': 'Speech recognition service is not allowed.',
      };
      
      setError(errorMessages[event.error] || `Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [lang, continuous, interimResults]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;

    setTranscript('');
    setInterimTranscript('');
    setError(null);
    finalTranscriptRef.current = '';

    try {
      recognitionRef.current.start();
    } catch (err) {
      // Handle case where recognition is already started
      if (err.name === 'InvalidStateError') {
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current.start();
        }, 100);
      } else {
        setError('Failed to start speech recognition.');
      }
    }
  }, [isSupported]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
    } catch (err) {
      // Ignore errors when stopping
    }
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
  }, []);

  // Get current text (final + interim)
  const getCurrentText = useCallback(() => {
    return transcript + (interimTranscript ? ` ${interimTranscript}` : '');
  }, [transcript, interimTranscript]);

  return {
    // State
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    
    // Actions
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
    getCurrentText,
  };
};

export default useVoiceInput;
