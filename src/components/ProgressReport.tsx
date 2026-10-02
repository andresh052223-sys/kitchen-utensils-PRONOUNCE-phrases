import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Award,
  TrendingUp,
  UserCheck,
  Printer
} from 'lucide-react';
import { PracticeAttempt, Student } from '../types/culinary';
import { CULINARY_ITEMS } from '../data/culinaryItems';
import { exportToCSV, exportToPDF, exportCertificatePDF } from '../utils/exportUtils';

interface ProgressReportProps {
  attempts: PracticeAttempt[];
  students: Student[];
  currentStudent: Student | null;
  onSelectStudent: (student: Student) => void;
}

export const ProgressReport: React.FC<ProgressReportProps> = ({
  attempts,
  students,
  currentStudent,
  onSelectStudent,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentStudent ? currentStudent.id : (students[0]?.id || '')
  );

  const activeStudent = students.find(s => s.id === selectedStudentId) || currentStudent || students[0];

  const studentAttempts = attempts.filter(a => a.studentId === activeStudent?.id);

  const totalAttempts = studentAttempts.length;
  const successfulAttempts = studentAttempts.filter(a => a.isSuccess).length;
  const successRate = totalAttempts > 0 ? Math.round((successfulAttempts / totalAttempts) * 100) : 0;
  const avgAccuracy = totalAttempts > 0
    ? Math.round(studentAttempts.reduce((acc, curr) => acc + curr.accuracyScore, 0) / totalAttempts)
    : 0;

  // Set of mastered utensils (at least 1 success)
  const masteredUtensilIds = new Set(
    studentAttempts.filter(a => a.isSuccess).map(a => a.utensilId)
  );

  // Group performance by category
  const categories = [
    'Cortes y Cuchillería',
    'Cocción y Fuego',
    'Medición y Control',
    'Áreas y Estaciones',
    'Pastelería y Panadería',
    'Higiene y Seguridad',
  ] as const;

  const categoryStats = categories.map(cat => {
    const catAttempts = studentAttempts.filter(a => a.category === cat);
    const catSuccess = catAttempts.filter(a => a.isSuccess).length;
    const catAvg = catAttempts.length > 0
      ? Math.round(catAttempts.reduce((acc, c) => acc + c.accuracyScore, 0) / catAttempts.length)
      : 0;
    return {
      category: cat,
      total: catAttempts.length,
      success: catSuccess,
      avgAccuracy: catAvg,
    };
  });

  const handleExportCSV = () => {
    exportToCSV(studentAttempts, activeStudent);
  };

  const handleExportPDF = () => {
    exportToPDF(studentAttempts, activeStudent);
  };

  const handleExportCertificate = () => {
    if (activeStudent) {
      exportCertificatePDF(activeStudent, studentAttempts);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner and Student Selector */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
            <BarChart3 className="w-4 h-4 text-amber-700" />
            <span>Métricas de Aprendizaje Culinario</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-stone-900">
            Informe Técnico de Progreso por Aprendiz
          </h2>
          <p className="text-xs text-stone-500">
            Diagnóstico detallado de pronunciación, retención de vocabulario y precisión técnica por estación.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <select
            value={selectedStudentId}
            onChange={(e) => {
              setSelectedStudentId(e.target.value);
              const st = students.find(s => s.id === e.target.value);
              if (st) onSelectStudent(st);
            }}
            className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-semibold focus:ring-2 focus:ring-amber-500"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.identification})
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
            title="Exportar archivo CSV con resultados"
          >
            <Download className="w-4 h-4 text-stone-600" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
            title="Descargar informe técnico en PDF"
          >
            <FileText className="w-4 h-4" />
            <span>Reporte PDF</span>
          </button>

          {/* Official Certificate Download Button */}
          <button
            onClick={handleExportCertificate}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs ring-2 ring-emerald-600/30"
            title="Descargar Certificado de Evidencia de Aprendizaje en PDF"
          >
            <Award className="w-4 h-4 text-emerald-200" />
            <span>Certificado de Evidencia (PDF)</span>
          </button>
        </div>
      </div>

      {/* Student Profile Overview Card */}
      {activeStudent && (
        <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-800 text-amber-50 flex items-center justify-center font-display font-bold text-lg">
              {activeStudent.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">{activeStudent.name}</h3>
              <p className="text-xs text-stone-500">
                Carné: <span className="font-mono-numbers font-medium text-stone-800">{activeStudent.identification}</span> · {activeStudent.group}
              </p>
              <p className="text-[11px] text-stone-400">
                Registrado el {activeStudent.registeredAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-stone-500 uppercase font-semibold block">Nivel Global</span>
              <span className="font-display font-bold text-amber-900 text-sm">
                {totalAttempts === 0 ? 'Sin Evaluaciones' : avgAccuracy >= 85 ? 'Sobresaliente' : avgAccuracy >= 70 ? 'Competente' : 'En Formación'}
              </span>
            </div>
          </div>
        </div>
      )}

      {totalAttempts === 0 && (
        <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 text-xs text-stone-600">
          <BarChart3 className="w-5 h-5 text-amber-700 shrink-0" />
          <span>
            <strong>Sin evaluaciones registradas:</strong> Este aprendiz aún no tiene intentos de práctica oral grabados. Todas las métricas e informes se actualizarán en tiempo real cuando practique en <em>Práctica Oral</em>.
          </span>
        </div>
      )}

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-2">
            <span>Intentos Totales</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono-numbers text-3xl font-bold text-stone-900">{totalAttempts}</div>
          <p className="text-[11px] text-stone-400 mt-1">
            {successfulAttempts} aciertos · {totalAttempts - successfulAttempts} reintentos
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-2">
            <span>Tasa de Aciertos</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono-numbers text-3xl font-bold text-emerald-700">{successRate}%</div>
          <p className="text-[11px] text-stone-400 mt-1">
            {successRate >= 70 ? 'Objetivo pedagógico alcanzado' : 'Requiere sesiones de refuerzo'}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-2">
            <span>Precisión Fonética Media</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono-numbers text-3xl font-bold text-stone-900">{avgAccuracy}%</div>
          <p className="text-[11px] text-stone-400 mt-1">
            Concordancia de palabras en español técnico
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-2">
            <span>Utensilios Validados</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-mono-numbers text-3xl font-bold text-stone-900">
            {masteredUtensilIds.size} <span className="text-base text-stone-400 font-normal">/ {CULINARY_ITEMS.length}</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            {Math.round((masteredUtensilIds.size / CULINARY_ITEMS.length) * 100)}% del catálogo dominado
          </p>
        </div>

      </div>

      {/* Two Column Section: Category Breakdown + Mastered Utensils */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Category Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-display font-bold text-lg text-stone-900">
              Desempeño por Categoría Culinaria
            </h3>
            <p className="text-xs text-stone-500">
              Porcentaje de precisión media y tasa de aciertos en cada área de la cocina.
            </p>
          </div>

          <div className="space-y-4">
            {categoryStats.map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800">{cat.category}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-stone-400 font-mono-numbers">{cat.success}/{cat.total} aciertos</span>
                    <span className="font-mono-numbers font-bold text-stone-900 w-12 text-right">
                      {cat.avgAccuracy}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cat.avgAccuracy >= 80
                        ? 'bg-emerald-600'
                        : cat.avgAccuracy >= 60
                        ? 'bg-amber-600'
                        : 'bg-stone-300'
                    }`}
                    style={{ width: `${Math.max(5, cat.avgAccuracy)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Utensil Catalog Checklist (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-display font-bold text-lg text-stone-900">
              Control de Validación Técnica
            </h3>
            <p className="text-xs text-stone-500">
              Estado de aprobación de cada equipo por el estudiante.
            </p>
          </div>

          <div className="divide-y divide-stone-100 max-h-[360px] overflow-y-auto pr-1">
            {CULINARY_ITEMS.map((item) => {
              const isMastered = masteredUtensilIds.has(item.id);
              return (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="truncate">
                    <span className="font-medium text-stone-900 block truncate">{item.name}</span>
                    <span className="text-[11px] text-stone-400 block truncate">{item.category}</span>
                  </div>

                  {isMastered ? (
                    <span className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Aprobado
                    </span>
                  ) : (
                    <span className="shrink-0 text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                      Pendiente
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
