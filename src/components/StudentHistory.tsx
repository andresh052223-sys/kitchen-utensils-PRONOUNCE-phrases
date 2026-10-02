import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Filter, 
  Eye, 
  X,
  Sparkles,
  Award
} from 'lucide-react';
import { PracticeAttempt, Student } from '../types/culinary';
import { exportToCSV, exportToPDF, exportCertificatePDF } from '../utils/exportUtils';

interface StudentHistoryProps {
  attempts: PracticeAttempt[];
  students: Student[];
  currentStudent: Student | null;
  onClearHistory: () => void;
}

export const StudentHistory: React.FC<StudentHistoryProps> = ({
  attempts,
  students,
  currentStudent,
  onClearHistory,
}) => {
  const [filterStudentId, setFilterStudentId] = useState<string>(currentStudent ? currentStudent.id : 'all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAttemptForDetail, setSelectedAttemptForDetail] = useState<PracticeAttempt | null>(null);

  // Filter attempts
  const filteredAttempts = attempts.filter((att) => {
    if (filterStudentId !== 'all' && att.studentId !== filterStudentId) return false;
    if (filterStatus === 'success' && !att.isSuccess) return false;
    if (filterStatus === 'failed' && att.isSuccess) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchUtensil = att.utensilName.toLowerCase().includes(q);
      const matchSpoken = att.spokenText.toLowerCase().includes(q);
      const matchStudent = att.studentName.toLowerCase().includes(q);
      const matchTarget = att.targetPhrase.toLowerCase().includes(q);
      if (!matchUtensil && !matchSpoken && !matchStudent && !matchTarget) return false;
    }
    return true;
  });

  const selectedStudentObj = students.find(s => s.id === filterStudentId) || (currentStudent || null);

  const handleExportCSV = () => {
    exportToCSV(filteredAttempts, filterStudentId !== 'all' ? selectedStudentObj : null);
  };

  const handleExportPDF = () => {
    exportToPDF(filteredAttempts, filterStudentId !== 'all' ? selectedStudentObj : null);
  };

  const handleExportCertificate = () => {
    if (selectedStudentObj) {
      exportCertificatePDF(selectedStudentObj, attempts);
    } else if (students.length > 0) {
      exportCertificatePDF(students[0], attempts);
    }
  };

  const totalSuccess = filteredAttempts.filter(a => a.isSuccess).length;
  const totalFailed = filteredAttempts.filter(a => !a.isSuccess).length;
  const avgAccuracy = filteredAttempts.length > 0
    ? Math.round(filteredAttempts.reduce((acc, curr) => acc + curr.accuracyScore, 0) / filteredAttempts.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Header & Actions Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
            <History className="w-4 h-4 text-amber-700" />
            <span>Auditoría de Desempeño</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-stone-900">
            Registro Histórico de Aciertos y Errores
          </h2>
          <p className="text-xs text-stone-500">
            Seguimiento de cada transcripción de voz, precisión fonética y tiempo invertido por los aprendices.
          </p>
        </div>

        {/* Export and Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors shadow-xs"
            title="Exportar archivo CSV para Excel con tildes soportadas"
          >
            <Download className="w-4 h-4 text-stone-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
            title="Generar informe en PDF listo para firmar"
          >
            <FileText className="w-4 h-4" />
            <span>Reporte PDF</span>
          </button>

          <button
            onClick={handleExportCertificate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs ring-2 ring-emerald-600/30"
            title="Descargar Certificado Oficial de Evidencia de Aprendizaje"
          >
            <Award className="w-4 h-4 text-emerald-200" />
            <span>Certificado de Evidencia (PDF)</span>
          </button>

          {attempts.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-2 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-xl text-xs transition-colors"
              title="Limpiar registro histórico"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Metrics Mini-strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">Intentos Filtrados</span>
          <span className="font-mono-numbers text-2xl font-bold text-stone-900">{filteredAttempts.length}</span>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">Aciertos (≥80%)</span>
          <span className="font-mono-numbers text-2xl font-bold text-emerald-600">{totalSuccess}</span>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">Reintentos / Fallos</span>
          <span className="font-mono-numbers text-2xl font-bold text-amber-600">{totalFailed}</span>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">Precisión Media</span>
          <span className="font-mono-numbers text-2xl font-bold text-stone-900">{avgAccuracy}%</span>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por utensilio, frase o palabra..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
          />
        </div>

        {/* Student Selector Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <select
            value={filterStudentId}
            onChange={(e) => setFilterStudentId(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          >
            <option value="all">Todos los Aprendices</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.identification})
              </option>
            ))}
          </select>

          {/* Status selector */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'success' | 'failed')}
            className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          >
            <option value="all">Todos los Resultados</option>
            <option value="success">Solo Aciertos</option>
            <option value="failed">Solo Reintentos</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        {filteredAttempts.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <History className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-semibold text-stone-700 text-sm">Historial Vacío</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              No hay intentos registrados aún para este aprendiz. Comienza una sesión en "Práctica Oral" para registrar sus evaluaciones en tiempo real.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Fecha y Hora</th>
                  <th className="py-3.5 px-4">Aprendiz</th>
                  <th className="py-3.5 px-4">Utensilio / Área</th>
                  <th className="py-3.5 px-4">Transcripción de Voz</th>
                  <th className="py-3.5 px-4 text-center">Precisión</th>
                  <th className="py-3.5 px-4 text-center">Resultado</th>
                  <th className="py-3.5 px-4 text-center">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredAttempts.map((att) => {
                  const dateObj = new Date(att.timestamp);
                  const dateFormatted = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                  const timeFormatted = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={att.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono-numbers text-stone-500 whitespace-nowrap">
                        <span className="block font-medium text-stone-800">{timeFormatted}</span>
                        <span className="text-[10px] text-stone-400">{dateFormatted}</span>
                      </td>

                      <td className="py-3 px-4 font-medium text-stone-900 whitespace-nowrap">
                        {att.studentName}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-stone-900 block">{att.utensilName}</span>
                        <span className="text-[10px] text-stone-500">{att.category}</span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-stone-700 italic truncate" title={att.spokenText}>
                          "{att.spokenText || 'Sin voz captada'}"
                        </p>
                      </td>

                      <td className="py-3 px-4 text-center font-mono-numbers font-bold">
                        <span className={att.accuracyScore >= 80 ? 'text-emerald-700' : 'text-amber-700'}>
                          {att.accuracyScore}%
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {att.isSuccess ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Acierto
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                            <AlertCircle className="w-3 h-3" /> Reintento
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedAttemptForDetail(att)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Ver análisis palabra por palabra"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAttemptForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div>
                <h4 className="font-semibold text-stone-900 text-sm">Detalle de Evaluación Oral</h4>
                <p className="text-xs text-stone-500">
                  {selectedAttemptForDetail.studentName} · {selectedAttemptForDetail.utensilName}
                </p>
              </div>
              <button
                onClick={() => setSelectedAttemptForDetail(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  Frase Modelo Solicitada:
                </span>
                <p className="text-xs bg-stone-100 p-3 rounded-lg text-stone-800 font-medium">
                  "{selectedAttemptForDetail.targetPhrase}"
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  Transcripción de lo que pronunció el aprendiz:
                </span>
                <p className="text-xs bg-amber-50 p-3 rounded-lg text-amber-950 font-medium border border-amber-200">
                  "{selectedAttemptForDetail.spokenText}"
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                  Concordancia Palabra por Palabra:
                </span>
                <div className="flex flex-wrap gap-1.5 p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                  {selectedAttemptForDetail.wordDiffs.map((diff, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded-md font-medium ${
                        diff.status === 'correct'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-amber-100 text-amber-900 line-through opacity-75'
                      }`}
                    >
                      {diff.word}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-stone-600 border-t border-stone-100">
                <span>Puntaje obtenido: <strong className="text-stone-900 font-mono-numbers">{selectedAttemptForDetail.accuracyScore}%</strong></span>
                <span>Duración: <strong className="text-stone-900 font-mono-numbers">{selectedAttemptForDetail.durationSeconds}s</strong></span>
              </div>
            </div>

            <div className="bg-stone-50 px-6 py-3 flex justify-end">
              <button
                onClick={() => setSelectedAttemptForDetail(null)}
                className="px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
