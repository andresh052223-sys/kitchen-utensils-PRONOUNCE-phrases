export type CulinaryCategory = 
  | 'Cortes y Cuchillería'
  | 'Cocción y Fuego'
  | 'Medición y Control'
  | 'Áreas y Estaciones'
  | 'Pastelería y Panadería'
  | 'Higiene y Seguridad';

export interface UtensilItem {
  id: string;
  name: string;
  category: CulinaryCategory;
  image: string;
  targetPhrase: string; // The English technical phrase to pronounce
  targetPhraseSpanish: string; // Spanish translation for apprentice comprehension
  shortUsage: string;
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  pronunciationTips: string;
  technicalRole: string;
  area: string;
}

export interface Student {
  id: string;
  name: string;
  identification: string;
  group: string;
  registeredAt: string;
}

export interface WordDiff {
  word: string;
  status: 'correct' | 'missing' | 'incorrect' | 'partial';
}

export interface PracticeAttempt {
  id: string;
  studentId: string;
  studentName: string;
  utensilId: string;
  utensilName: string;
  category: CulinaryCategory;
  targetPhrase: string;
  spokenText: string;
  accuracyScore: number; // 0 to 100
  isSuccess: boolean;
  wordDiffs: WordDiff[];
  timestamp: string;
  durationSeconds: number;
}
