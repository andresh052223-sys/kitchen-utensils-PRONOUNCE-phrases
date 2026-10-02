import React, { useState } from 'react';
import { Copy, Check, Sparkles, BookOpen, Layers, Mic, FileDown } from 'lucide-react';

export const PROMPT_MASTER_TEXT = `Actúa como un ingeniero de software senior y diseñador de interfaces educativas. Construye una aplicación web interactiva en React + TypeScript + Tailwind CSS diseñada para que aprendices de escuelas de gastronomía practiquen y sean evaluados en la pronunciación en INGLÉS TÉCNICO y comprensión de las partes de la cocina y utensilios profesionales.

### 1. OBJETIVO PEDAGÓGICO Y FLUJO PRINCIPAL
- La aplicación presenta tarjetas de estudio con utensilios de cocina profesional y áreas de brigada (Chef's knife, Sautoir pan, Mise en place station, Balloon whisk, Paring knife, Mandoline slicer, Digital probe thermometer, Plonge wash station, Salamander broiler, Color-coded cutting board).
- Cada tarjeta muestra:
  * Fotografía o ilustración técnica del utensilio.
  * Nombre profesional y categoría (Cortes, Cocción, Medición, Áreas, Higiene, Pastelería).
  * Frase técnica en INGLÉS a pronunciar (ej: "The chef's knife is used to chop, slice, and mince vegetables with precision.").
  * Traducción conceptual en español para garantizar la comprensión del aprendiz.
  * Guía fonética con consejos de pronunciación en inglés para hispanohablantes.
  * Botón para escuchar la frase con pronunciación nativa en inglés (Text-to-Speech con síntesis de voz en inglés 'en-US').
- El aprendiz activa el micrófono y lee la frase en INGLÉS en voz alta.
- La aplicación utiliza la Web Speech API con configuración en inglés (recognition.lang = 'en-US') para realizar la transcripción en tiempo real de lo dicho por el estudiante.
- La plataforma compara automáticamente la frase solicitada con la transcripción:
  * Maneja contracciones en inglés (chef's), guiones y puntuaciones.
  * Calcula el porcentaje de precisión fonética y coincidencia de palabras.
  * Resalta visualmente palabra por palabra: verde para palabras correctas, ámbar para omitidas y rojo para errores.
  * Si la precisión es igual o superior al 80%, suena un chime de acierto, se lanza una animación de celebración (confetti) y el sistema AVANZA AUTOMÁTICAMENTE al siguiente utensilio tras 3 segundos.
  * Si no coincide, registra el intento como "Reintento/Error" con retroalimentación inmediata para que el estudiante pueda repetirlo.

### 2. GESTIÓN MULTI-ESTUDIANTE Y REGISTRO HISTÓRICO
- Selector de aprendices y modal para registrar nuevos estudiantes (Nombre, Carné/ID institucional, Grupo o Programa).
- Registro histórico persistente (LocalStorage) que guarda cada intento con:
  * Fecha, hora exacta y duración del intento.
  * Nombre y carné del estudiante.
  * Utensilio evaluado y categoría culinaria.
  * Frase en inglés solicitada vs transcripción capturada por voz.
  * Porcentaje de precisión y resultado (Acierto o Reintento).

### 3. INFORMES DE PROGRESO Y EXPORTACIÓN (PDF Y CSV)
- Panel analítico con indicadores clave:
  * Tasa global de aciertos (%) y promedio de precisión fonética en inglés técnico.
  * Total de intentos y utensilios dominados.
  * Rendimiento desglosado por categorías culinarias.
- Exportación a CSV: Archivo estructurado con codificación UTF-8 BOM para apertura directa en Microsoft Excel sin problemas de codificación.
- Exportación a PDF: Reporte formal imprimible con encabezado institucional, datos del aprendiz, métricas consolidadas, tabla de intentos en inglés y espacio para firmas del instructor y el aprendiz.

### 4. REQUISITOS TÉCNICOS Y EXPERIENCIA DE USUARIO
- Interfaz elegante con tipografía editorial gastronómica, paleta cálida (pizarra, ámbar y piedra) y diseño accesible.
- Incluir un modo de prueba por teclado (simulador de voz) para entornos donde los permisos de micrófono estén restringidos en el navegador.`;

export const PromptGuideModal: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PROMPT_MASTER_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Prompt Maestro para Google AI Studio</span>
            </div>
            <h2 className="font-display font-bold text-2xl text-stone-900">
              Prompt Recomendado para Crear o Replicar Esta Aplicación
            </h2>
            <p className="text-sm text-stone-600 max-w-2xl">
              Aquí tienes el prompt exhaustivo y profesional redactado para Google AI Studio. Contiene todas las directrices técnicas, lógica de transcripción por voz, tolerancia fonética y sistema de exportación.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm shadow-xs transition-all whitespace-nowrap ${
              copied
                ? 'bg-emerald-700 text-white'
                : 'bg-amber-800 hover:bg-amber-900 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Prompt Copiado al Portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Prompt Completo</span>
              </>
            )}
          </button>
        </div>

        {/* Prompt content block */}
        <div className="relative">
          <div className="bg-stone-900 text-stone-100 rounded-xl p-5 sm:p-6 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto border border-stone-800 max-h-[500px] overflow-y-auto selection:bg-amber-500 selection:text-stone-950">
            <pre className="whitespace-pre-wrap font-mono">{PROMPT_MASTER_TEXT}</pre>
          </div>
        </div>
      </div>

      {/* Breakdown guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center mb-3">
            <Mic className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-stone-900 text-sm mb-1.5">Motor de Voz Web</h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            Especifica el uso de la <code className="text-stone-800 font-mono">Web Speech API</code> nativa para transcripción en español sin requerir claves de API externas de terceros.
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-stone-900 text-sm mb-1.5">Tolerancia Fonética</h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            Normalización de tildes y algoritmos de distancia de Levenshtein para evitar penalizar al aprendiz por variaciones acústicas del micrófono.
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center mb-3">
            <FileDown className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-stone-900 text-sm mb-1.5">Formatos de Exportación</h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            Estructuración de datos en CSV con BOM para Excel y documentos vectoriales PDF listos para firma del instructor y entrega de notas.
          </p>
        </div>
      </div>
    </div>
  );
};
