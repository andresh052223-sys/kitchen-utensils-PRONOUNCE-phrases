import { useState, useEffect, useRef, useCallback } from 'react';

// Type definitions for Web Speech API
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives?: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

/**
 * Deduplicates repeated consecutive words and repeated multi-word phrase loops
 * that mobile Web Speech API (especially Android Chrome) can emit during continuous recognition.
 */
export function deduplicateRepeatedPhrases(rawText: string): string {
  if (!rawText) return '';
  
  // Normalize whitespace
  let text = rawText.replace(/\s+/g, ' ').trim();
  if (!text) return '';

  // 1. Remove immediate consecutive duplicate words: "the the the" -> "the"
  const words = text.split(' ');
  const singleDeduped: string[] = [];
  for (let i = 0; i < words.length; i++) {
    if (i === 0 || words[i].toLowerCase() !== words[i - 1].toLowerCase()) {
      singleDeduped.push(words[i]);
    }
  }

  let result = singleDeduped.join(' ');

  // 2. Remove immediate consecutive repeated multi-word phrase patterns:
  // e.g. "the chips nice the chips nice" -> "the chips nice"
  for (let len = 10; len >= 2; len--) {
    let changed = true;
    let safety = 0;
    while (changed && safety < 20) {
      changed = false;
      safety++;
      const tokens = result.split(' ');
      if (tokens.length < len * 2) break;

      for (let i = 0; i <= tokens.length - len * 2; i++) {
        const chunkA = tokens.slice(i, i + len).join(' ').toLowerCase();
        const chunkB = tokens.slice(i + len, i + len * 2).join(' ').toLowerCase();
        if (chunkA === chunkB) {
          tokens.splice(i + len, len);
          result = tokens.join(' ');
          changed = true;
          break;
        }
      }
    }
  }

  return result.trim();
}

export function useSpeechRecognition(lang: string = 'en-US') {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef<string>('');

  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang; // English ('en-US') for technical culinary pronunciation
      if ('maxAlternatives' in recognition) {
        recognition.maxAlternatives = 1;
      }

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let finalStr = '';
        let interimStr = '';

        // Build cleanly from the cumulative results array.
        // DO NOT append to an external accumulator to prevent duplicate compounding on mobile!
        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = (result[0]?.transcript || '').trim();
          if (!text) continue;

          if (result.isFinal) {
            finalStr += (finalStr ? ' ' : '') + text;
          } else {
            interimStr += (interimStr ? ' ' : '') + text;
          }
        }

        const cleanFinal = deduplicateRepeatedPhrases(finalStr);
        const cleanInterim = deduplicateRepeatedPhrases(interimStr);

        finalTranscriptRef.current = cleanFinal;
        setTranscript(cleanFinal);
        setInterimTranscript(cleanInterim);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        if (event.error === 'no-speech') {
          // Normal timeout if user was silent
          return;
        }
        if (event.error === 'not-allowed') {
          setErrorMessage('Permiso de micrófono denegado. Permite el acceso al micrófono en tu navegador.');
        } else {
          setErrorMessage(`Aviso de micrófono: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('SpeechRecognition initialization error:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [lang]);

  const startListening = useCallback(() => {
    setErrorMessage(null);
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';

    if (!recognitionRef.current) {
      setErrorMessage('Tu navegador no soporta la API de reconocimiento de voz.');
      return;
    }

    try {
      recognitionRef.current.start();
    } catch {
      // If already started or aborting
      try {
        recognitionRef.current.abort();
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch {
            // ignore
          }
        }, 150);
      } catch {
        // ignore
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
  }, []);

  const setManualTranscript = useCallback((text: string) => {
    const clean = deduplicateRepeatedPhrases(text);
    finalTranscriptRef.current = clean;
    setTranscript(clean);
    setInterimTranscript('');
  }, []);

  // Compute clean unified full transcript
  const computedFullTranscript = (() => {
    const t = transcript.trim();
    const it = interimTranscript.trim();
    if (t && it) {
      if (t.toLowerCase().endsWith(it.toLowerCase())) {
        return t;
      }
      return deduplicateRepeatedPhrases(`${t} ${it}`);
    }
    return t || it;
  })();

  return {
    isListening,
    transcript,
    interimTranscript,
    fullTranscript: computedFullTranscript,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    resetTranscript,
    setManualTranscript,
  };
}
