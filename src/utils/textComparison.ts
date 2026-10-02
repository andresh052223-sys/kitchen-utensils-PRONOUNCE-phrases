import { WordDiff } from '../types/culinary';

/**
 * Normalizes text for audio comparison:
 * Strips punctuation, reduces multiple spaces, converts to lowercase,
 * and handles English contractions (e.g., "chef's" -> "chefs").
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/['’]/g, '') // remove apostrophes (chef's -> chefs)
    .replace(/[-_]/g, ' ') // treat hyphens as space (color-coded -> color coded)
    .replace(/[.,/#!$%^&*;:{}=`~()?"'¡¿]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Simple Levenshtein distance for word-level typo tolerance in speech recognition
 */
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Checks if two words are considered a match (allowing small phonetic/STT tolerance)
 */
function isWordMatch(targetWord: string, spokenWord: string): boolean {
  if (targetWord === spokenWord) return true;
  if (targetWord.length >= 4 && spokenWord.length >= 4) {
    const dist = levenshtein(targetWord, spokenWord);
    return dist <= 1; // 1 typo allowed for longer words
  }
  return false;
}

/**
 * Compares target phrase with spoken phrase.
 * Returns accuracy (0-100), boolean isSuccess (threshold >= 80%), and WordDiff array.
 */
export function evaluateSpokenPhrase(
  targetPhrase: string,
  spokenPhrase: string,
  threshold = 80
): {
  accuracyScore: number;
  isSuccess: boolean;
  wordDiffs: WordDiff[];
  matchedWordsCount: number;
  totalTargetWords: number;
} {
  const normTarget = normalizeText(targetPhrase);
  const normSpoken = normalizeText(spokenPhrase);

  const targetTokens = normTarget.split(' ').filter(Boolean);
  const spokenTokens = normSpoken.split(' ').filter(Boolean);

  const originalTargetWords = targetPhrase.replace(/[.,;:¡!¿?]/g, '').split(/\s+/).filter(Boolean);

  if (targetTokens.length === 0) {
    return {
      accuracyScore: 0,
      isSuccess: false,
      wordDiffs: [],
      matchedWordsCount: 0,
      totalTargetWords: 0,
    };
  }

  const wordDiffs: WordDiff[] = [];
  const usedSpokenIndices = new Set<number>();
  let matchedCount = 0;

  targetTokens.forEach((targetWord, idx) => {
    const displayWord = originalTargetWords[idx] || targetWord;

    // Find if spoken tokens contain this word (search nearby window first)
    let foundIndex = -1;
    for (let sIdx = 0; sIdx < spokenTokens.length; sIdx++) {
      if (!usedSpokenIndices.has(sIdx) && isWordMatch(targetWord, spokenTokens[sIdx])) {
        foundIndex = sIdx;
        break;
      }
    }

    if (foundIndex !== -1) {
      usedSpokenIndices.add(foundIndex);
      matchedCount++;
      wordDiffs.push({ word: displayWord, status: 'correct' });
    } else {
      wordDiffs.push({ word: displayWord, status: 'missing' });
    }
  });

  const rawScore = (matchedCount / targetTokens.length) * 100;
  // Penalty if spoken has too many extraneous words or is too short
  let accuracyScore = Math.round(rawScore);
  if (spokenTokens.length < targetTokens.length * 0.4) {
    accuracyScore = Math.max(0, Math.round(accuracyScore * 0.6));
  }

  const isSuccess = accuracyScore >= threshold;

  return {
    accuracyScore,
    isSuccess,
    wordDiffs,
    matchedWordsCount: matchedCount,
    totalTargetWords: targetTokens.length,
  };
}

/**
 * Generates pleasant audio chimes using Web Audio API
 */
export function playChime(type: 'success' | 'retry') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'success') {
      const now = ctx.currentTime;
      // High bright pleasant chord
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.45);
      });
    } else {
      // Gentle two-tone warning
      const now = ctx.currentTime;
      [350, 310].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.15);

        gain.gain.setValueAtTime(0, now + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.15, now + i * 0.15 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.3);
      });
    }
  } catch {
    // Graceful fallback if audio context is blocked
  }
}

/**
 * Text to speech reading in English with culinary cadence
 */
export function speakEnglishPhrase(text: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.88; // Slightly measured educational cadence for language learners
  utterance.pitch = 1.0;

  // Try to find natural English voice if available
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en_US') || v.lang.startsWith('en-GB') || v.lang.startsWith('en'));
  if (enVoice) {
    utterance.voice = enVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

// Backward compatibility alias
export const speakSpanishPhrase = speakEnglishPhrase;
