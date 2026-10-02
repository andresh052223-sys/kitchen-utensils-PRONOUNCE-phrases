import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  SlidersHorizontal,
  Flame,
  Lightbulb,
  Lock,
  Award,
  FileText,
  Save,
  BookmarkCheck
} from 'lucide-react';
import { UtensilItem, Student, PracticeAttempt, CulinaryCategory } from '../types/culinary';
import { CULINARY_ITEMS } from '../data/culinaryItems';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { evaluateSpokenPhrase, playChime, speakSpanishPhrase } from '../utils/textComparison';
import { exportCertificatePDF, exportToPDF } from '../utils/exportUtils';

interface PracticeSessionProps {
  currentStudent: Student | null;
  attempts: PracticeAttempt[];
  onRecordAttempt: (attempt: PracticeAttempt) => void;
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({
  currentStudent,
  attempts,
  onRecordAttempt,
}) => {
  const studentKey = currentStudent ? currentStudent.id : 'guest';
  const progressStorageKey = `culinary_progress_${studentKey}`;

  // Read saved category on startup
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`culinary_progress_${currentStudent ? currentStudent.id : 'guest'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.selectedCategory === 'string') return parsed.selectedCategory;
      }
    } catch {
      // ignore
    }
    return 'all';
  });

  // Read saved index on startup so student resumes exactly where they left off
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`culinary_progress_${currentStudent ? currentStudent.id : 'guest'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.currentIndex === 'number' && parsed.currentIndex >= 0 && parsed.currentIndex < CULINARY_ITEMS.length) {
          return parsed.currentIndex;
        }
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const [isSpeakingPhrase, setIsSpeakingPhrase] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [lastEvaluation, setLastEvaluation] = useState<ReturnType<typeof evaluateSpokenPhrase> | null>(null);
  const [hasEvaluatedCurrent, setHasEvaluatedCurrent] = useState<boolean>(false);

  const {
    isListening,
    transcript,
    interimTranscript,
    fullTranscript,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition('en-US'); // Voice engine configured for English technical phrases

  // Filter items by category
  const filteredItems = selectedCategory === 'all'
    ? CULINARY_ITEMS
    : CULINARY_ITEMS.filter(item => item.category === selectedCategory);

  const currentItem = filteredItems[currentIndex] || filteredItems[0];

  // Approved attempts and items for this student
  const studentSuccessAttempts = attempts.filter(
    a => a.studentId === (currentStudent ? currentStudent.id : 'invitado') && a.isSuccess
  );
  const approvedUtensilIds = new Set(studentSuccessAttempts.map(a => a.utensilId));
  const isCurrentItemApproved = currentItem ? approvedUtensilIds.has(currentItem.id) : false;

  // Persist current position and category continuously so apprentice never loses progress
  useEffect(() => {
    try {
      localStorage.setItem(progressStorageKey, JSON.stringify({
        currentIndex,
        selectedCategory,
        lastUpdated: Date.now(),
      }));
    } catch {
      // ignore
    }
  }, [currentIndex, selectedCategory, progressStorageKey]);

  // Sync state if student changes
  useEffect(() => {
    if (!currentStudent) return;
    try {
      const saved = localStorage.getItem(`culinary_progress_${currentStudent.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.currentIndex === 'number') {
          setCurrentIndex(parsed.currentIndex);
        }
        if (typeof parsed.selectedCategory === 'string') {
          setSelectedCategory(parsed.selectedCategory);
        }
      } else {
        setCurrentIndex(0);
        setSelectedCategory('all');
      }
    } catch {
      // ignore
    }
  }, [currentStudent?.id]);

  // Reset transcript and evaluation when item changes
  useEffect(() => {
    resetTranscript();
    setLastEvaluation(null);
    setHasEvaluatedCurrent(false);
    setSessionStartTime(Date.now());
  }, [currentIndex, selectedCategory]);

  const handleNext = () => {
    if (currentIndex < filteredItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // Loop back to start
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleHearPhrase = () => {
    if (!currentItem) return;
    setIsSpeakingPhrase(true);
    speakSpanishPhrase(currentItem.targetPhrase, () => {
      setIsSpeakingPhrase(false);
    });
  };

  // Perform evaluation of spoken or inputted text
  const performEvaluation = (spoken: string) => {
    if (!spoken.trim() || !currentItem) return;

    const evalResult = evaluateSpokenPhrase(currentItem.targetPhrase, spoken);
    setLastEvaluation(evalResult);
    setHasEvaluatedCurrent(true);

    const duration = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));

    // Save attempt record
    const attempt: PracticeAttempt = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: currentStudent?.id || 'invitado',
      studentName: currentStudent?.name || 'Aprendiz Invitado',
      utensilId: currentItem.id,
      utensilName: currentItem.name,
      category: currentItem.category,
      targetPhrase: currentItem.targetPhrase,
      spokenText: spoken.trim(),
      accuracyScore: evalResult.accuracyScore,
      isSuccess: evalResult.isSuccess,
      wordDiffs: evalResult.wordDiffs,
      timestamp: new Date().toISOString(),
      durationSeconds: duration,
    };

    onRecordAttempt(attempt);

    if (evalResult.isSuccess) {
      playChime('success');
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#b45309', '#059669', '#d97706', '#10b981'],
      });
      // The feedback window stays open permanently until the user clicks "Continuar con la Siguiente Frase"
    } else {
      playChime('retry');
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
      const textToEval = fullTranscript.trim();
      if (textToEval) {
        performEvaluation(textToEval);
      }
    } else {
      resetTranscript();
      setLastEvaluation(null);
      setHasEvaluatedCurrent(false);
      startListening();
    }
  };

  // Automatically trigger evaluation when speech recognition finishes naturally after speaking
  useEffect(() => {
    if (!isListening && fullTranscript.trim() && !hasEvaluatedCurrent) {
      performEvaluation(fullTranscript.trim());
    }
  }, [isListening, fullTranscript, hasEvaluatedCurrent]);

  const categories = [
    'all',
    'Cortes y Cuchillería',
    'Cocción y Fuego',
    'Medición y Control',
    'Áreas y Estaciones',
    'Pastelería y Panadería',
    'Higiene y Seguridad',
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Filter and Controls Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        
        {/* Category filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <div className="flex items-center gap-1 text-xs font-semibold text-stone-500 mr-1 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Categoría:</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat === 'all' ? 'Todos los Utensilios' : cat}
            </button>
          ))}
        </div>

        {/* Counter and Status */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-stone-100 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-md font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Aprobación: <strong>≥ 80%</strong></span>
          </div>

          <div 
            className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-900 border border-emerald-200/80 px-2.5 py-1 rounded-md font-medium"
            title="Tu progreso se guarda de forma continua en este navegador. Puedes cerrar la app o apagar el equipo y retomarás aquí."
          >
            <Save className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Progreso Guardado</span>
            <span className="sm:hidden">Guardado</span>
          </div>

          <div className="text-xs font-mono-numbers text-stone-600 bg-stone-100 px-3 py-1 rounded-md font-medium">
            <span>Utensilio {currentIndex + 1}</span>
            <span className="text-stone-400"> de </span>
            <span>{filteredItems.length}</span>
          </div>
        </div>
      </div>

      {/* Resumed Progress Banner */}
      {(currentIndex > 0 || approvedUtensilIds.size > 0) && (
        <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-emerald-950 block text-xs sm:text-sm">
                Avance de Aprendiz Resguardado
              </span>
              <span className="text-emerald-900/90 text-[11px] sm:text-xs">
                Continuando en <strong>{currentItem.name}</strong> ({currentIndex + 1} de {filteredItems.length}) · {approvedUtensilIds.size} frase(s) aprobada(s). Puedes cerrar la ventana o apagar el equipo y retomarás exactamente aquí.
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm('¿Deseas reiniciar la sesión al Utensilio 1? Tus frases aprobadas e historial seguirán guardados.')) {
                setCurrentIndex(0);
              }
            }}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors shrink-0 text-center"
          >
            Reiniciar al Utensilio 1
          </button>
        </div>
      )}

      {/* Main Two-Zone Sandbox Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Zone: Visual Stage & Utensil Info (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs space-y-0">
          
          {/* Utensil Image Hero with Scrim & Fallback */}
          <div className="relative aspect-4/3 w-full bg-stone-900 overflow-hidden">
            <img
              src={currentItem.image}
              alt={currentItem.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-102"
              onError={(e) => {
                // Styled fallback container if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            
            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
              
              {/* Unboxed Metadata with Typographic Separators */}
              <div className="flex items-center gap-2 text-xs font-medium text-amber-200 mb-1">
                <span>{currentItem.category}</span>
                <span aria-hidden="true">·</span>
                <span>{currentItem.area}</span>
                <span aria-hidden="true">·</span>
                <span className="uppercase tracking-wider">{currentItem.difficulty}</span>
              </div>

              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight drop-shadow-xs">
                {currentItem.name}
              </h2>
            </div>
          </div>

          {/* Technical Info & Target Phrase */}
          <div className="p-6 sm:p-7 space-y-6">
            
            {/* Technical Usage Brief */}
            {/* Utensil Technical Info */}
            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Uso Técnico Profesional
              </h4>
              <p className="text-sm text-stone-800 leading-relaxed">
                {currentItem.shortUsage}
              </p>
            </div>

            {/* Pronunciation & Culinary Tip */}
            <div className="flex items-start gap-3 bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-stone-700">
              <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950">Consejo Fonético para Cocina: </span>
                <span>{currentItem.pronunciationTips}</span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <button
                onClick={handleNext}
                disabled={lastEvaluation !== null && !lastEvaluation.isSuccess}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  lastEvaluation !== null && !lastEvaluation.isSuccess
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'text-amber-900 bg-amber-100 hover:bg-amber-200'
                }`}
                title={lastEvaluation !== null && !lastEvaluation.isSuccess ? 'Debes alcanzar el 80% para avanzar' : 'Siguiente utensilio'}
              >
                {lastEvaluation !== null && !lastEvaluation.isSuccess ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Bloqueado (&lt; 80%)</span>
                  </>
                ) : (
                  <>
                    <span>Siguiente Utensilio</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Zone: Control Deck & Live Voice Evaluation (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Apprentice Badge with Direct PDF Download Option */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Evaluando actualmente a:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-bold text-stone-900 text-base sm:text-lg">
                  {currentStudent?.name || 'Aprendiz Invitado'}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Activo
                </span>
              </div>
              <span className="text-xs text-stone-500 block">
                {currentStudent?.identification} · {currentStudent?.group}
              </span>
            </div>

            {/* Direct PDF Download Buttons Beside Student Name */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => {
                  if (!currentStudent) {
                    alert('Selecciona o registra un aprendiz primero.');
                    return;
                  }
                  exportCertificatePDF(currentStudent, attempts);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-xs ring-1 ring-emerald-600 transition-colors"
                title="Descargar Certificado Oficial de Evidencia de Aprendizaje en PDF"
              >
                <Award className="w-4 h-4 text-emerald-200" />
                <span>Certificado PDF</span>
              </button>

              <button
                onClick={() => {
                  if (attempts.length === 0) {
                    alert('No hay intentos registrados para generar el reporte PDF.');
                    return;
                  }
                  exportToPDF(attempts, currentStudent);
                }}
                className="flex items-center gap-1.5 px-2.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold transition-colors"
                title="Descargar Reporte Detallado de Práctica en PDF"
              >
                <FileText className="w-4 h-4 text-stone-600" />
                <span>Reporte PDF</span>
              </button>
            </div>
          </div>

          {/* Interactive Speech Recognition Controller */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="font-display font-bold text-lg text-stone-900">
                Evaluador de Pronunciación
              </h3>
              <p className="text-xs text-stone-500">
                Lee la frase en inglés y pulsa el botón para grabar
              </p>
            </div>

            {/* Target English Phrase: Placed right above the recording button */}
            <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-700" />
                  <span>Frase en Inglés a Pronunciar:</span>
                </span>

                {/* Listen Audio Button */}
                <button
                  onClick={handleHearPhrase}
                  disabled={isSpeakingPhrase}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-medium shadow-2xs transition-colors disabled:opacity-50 shrink-0"
                  title="Escuchar audio modelo en inglés"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isSpeakingPhrase ? 'animate-bounce text-amber-700' : 'text-amber-800'}`} />
                  <span>{isSpeakingPhrase ? 'Reproduciendo...' : 'Escuchar Modelo'}</span>
                </button>
              </div>

              {/* Large highlighted target text */}
              <blockquote className="font-display text-lg sm:text-xl font-bold text-stone-950 leading-snug border-l-4 border-amber-600 pl-3 py-1">
                "{currentItem.targetPhrase}"
              </blockquote>

              {/* Translation in Spanish */}
              <div className="pt-2 border-t border-amber-200/70 text-xs text-stone-600 flex items-start gap-1.5">
                <span className="font-semibold text-amber-900 shrink-0">Traducción:</span>
                <span className="italic text-stone-700">"{currentItem.targetPhraseSpanish}"</span>
              </div>
            </div>

            {/* Speech error notice if any */}
            {errorMessage && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Aviso de Reconocimiento de Voz</p>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Voice Mode: Mic button immediately next to the phrase */}
            <div className="flex flex-col items-center justify-center pt-1 pb-3 space-y-3">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                {isListening ? 'Grabando tu pronunciación...' : 'Presiona el botón para grabar:'}
              </span>
              
              {/* Big Mic Button with Active Pulsing Ring */}
              <div className="relative">
                {isListening && (
                  <div className="absolute inset-0 rounded-full bg-red-400/30 animate-ping"></div>
                )}
                <button
                  onClick={handleToggleListening}
                  className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg transition-all transform active:scale-95 ${
                    isListening
                      ? 'bg-red-600 hover:bg-red-700 text-white ring-8 ring-red-100 animate-mic-pulse'
                      : 'bg-amber-800 hover:bg-amber-900 text-white ring-4 ring-amber-100 hover:ring-amber-200'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-8 h-8" />
                      <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">Detener</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-8 h-8" />
                      <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">Hablar</span>
                    </>
                  )}
                </button>
              </div>

              {/* State Label & Audio Visualizer Bars */}
              <div className="text-center space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                  {isListening ? (
                    <span className="text-red-600 font-bold flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                      Escuchando al estudiante...
                    </span>
                  ) : (
                    <span>Haz clic para grabar tu voz</span>
                  )}
                </div>

                {/* Simulated wave bars */}
                {isListening && (
                  <div className="flex items-center justify-center gap-1 h-6">
                    {[40, 75, 100, 60, 90, 45, 80, 55, 95, 30].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-red-500 rounded-full animate-pulse"
                        style={{
                          height: `${h}%`,
                          animationDuration: `${0.4 + (i % 4) * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Live Transcription Box */}
            <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/70 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
                <span>Transcripción Capturada en Tiempo Real</span>
                {fullTranscript && (
                  <button
                    onClick={resetTranscript}
                    className="text-stone-400 hover:text-stone-700"
                    title="Limpiar"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="min-h-[48px] text-sm text-stone-800 font-medium">
                {fullTranscript ? (
                  <span className="text-stone-900">"{fullTranscript}"</span>
                ) : (
                  <span className="text-stone-400 italic text-xs">
                    (Ninguna voz captada aún. Presiona el botón rojo y lee la frase).
                  </span>
                )}
              </div>
            </div>

            {/* Evaluation Results Breakdown */}
            {lastEvaluation && hasEvaluatedCurrent && (
              <div className={`rounded-xl p-5 border space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
                lastEvaluation.isSuccess
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-amber-50/60 border-amber-200'
              }`}>
                {/* Result header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {lastEvaluation.isSuccess ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    )}
                    <div>
                      <span className={`font-display font-bold text-base block ${
                        lastEvaluation.isSuccess ? 'text-emerald-950' : 'text-amber-950'
                      }`}>
                        {lastEvaluation.isSuccess ? '¡Frase Aprobada! (≥ 80%)' : 'No Aprobado (< 80%)'}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {lastEvaluation.isSuccess
                          ? 'Cumple con el estándar de pronunciación y comprensión técnica.'
                          : 'Se requiere un mínimo de 80% de precisión para avanzar.'}
                      </span>
                    </div>
                  </div>

                  <div className={`px-2.5 py-1 rounded-md text-xs font-mono-numbers font-bold shrink-0 ${
                    lastEvaluation.isSuccess ? 'bg-emerald-200 text-emerald-950' : 'bg-amber-200 text-amber-950'
                  }`}>
                    {lastEvaluation.accuracyScore}% Precisión
                  </div>
                </div>

                {/* Word by Word Diff Analysis */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                    Análisis de Coincidencia Palabra por Palabra:
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-3 bg-white rounded-lg border border-stone-200 text-xs">
                    {lastEvaluation.wordDiffs.map((diff, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded-md font-medium ${
                          diff.status === 'correct'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-amber-100 text-amber-900 line-through opacity-75'
                        }`}
                        title={diff.status === 'correct' ? 'Palabra identificada correctamente' : 'Palabra omitida o no reconocida'}
                      >
                        {diff.word}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-stone-500 pt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-200"></span> Pronunciada con éxito
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-200"></span> Omitida o no concordante
                    </span>
                  </div>
                </div>

                {/* Action recommendations: If < 80%, MUST repeat. If >= 80%, can continue. */}
                {!lastEvaluation.isSuccess ? (
                  <div className="pt-3 border-t border-amber-200/80 space-y-3">
                    <div className="bg-amber-100/90 border border-amber-300 text-amber-950 rounded-xl p-3 flex items-start gap-2.5 text-xs">
                      <Lock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Avance Bloqueado: Debes repetir la pronunciación</span>
                        <span className="text-amber-900/90">
                          Para poder continuar con la siguiente frase, debes alcanzar al menos el 80% de precisión.
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        resetTranscript();
                        setLastEvaluation(null);
                        setHasEvaluatedCurrent(false);
                        startListening();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-98"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Repetir Esta Frase (Requerido ≥ 80%)</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        resetTranscript();
                        setLastEvaluation(null);
                        setHasEvaluatedCurrent(false);
                        startListening();
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl shadow-xs transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                      <span>Volver a Practicar</span>
                    </button>

                    <button
                      onClick={handleNext}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all"
                    >
                      <span>Continuar con la Siguiente Frase</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
