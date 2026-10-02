import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';
import { Student } from '../types/culinary';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (student: Student) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
}) => {
  const [name, setName] = useState('');
  const [identification, setIdentification] = useState('');
  const [group, setGroup] = useState('Cocina Profesional - Grupo A');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor ingresa el nombre completo del aprendiz.');
      return;
    }
    if (!identification.trim()) {
      setError('Por favor ingresa el número de carné o documento.');
      return;
    }

    const newStudent: Student = {
      id: `student-${Date.now()}`,
      name: name.trim(),
      identification: identification.trim(),
      group: group.trim() || 'Cocina General',
      registeredAt: new Date().toISOString().slice(0, 10),
    };

    onAddStudent(newStudent);
    setName('');
    setIdentification('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2 text-stone-900 font-semibold text-base">
            <UserPlus className="w-5 h-5 text-amber-700" />
            <span>Registrar Nuevo Aprendiz</span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
              Nombre Completo del Aprendiz
            </label>
            <input
              type="text"
              placeholder="Ej. Valentina Morales Gómez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
              Carné de Estudiante / Identificación
            </label>
            <input
              type="text"
              placeholder="Ej. AP-90518 ó CC 10203040"
              value={identification}
              onChange={(e) => setIdentification(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Programa Académico o Grupo
              </label>
              <span className="text-[11px] text-amber-800 font-medium">
                (Escribe o selecciona)
              </span>
            </div>
            
            <input
              type="text"
              list="programas-sugeridos"
              placeholder="Ej. Técnico en Cocina, Ficha 284192, Pastelería..."
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900 transition-all font-medium"
            />
            
            <datalist id="programas-sugeridos">
              <option value="Técnico en Cocina Profesional" />
              <option value="Cocina Internacional - Ficha Mañana" />
              <option value="Cocina Internacional - Ficha Noche" />
              <option value="Técnico en Panadería y Pastelería" />
              <option value="Servicios de Alimentos y Bebidas" />
              <option value="Diplomado en Alta Cocina" />
              <option value="Iniciación Culinaria" />
            </datalist>

            {/* Quick preset chips to write faster */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-stone-400 self-center">Sugerencias rápidas:</span>
              {['Cocina Grupo A', 'Cocina Grupo B', 'Pastelería', 'Ficha Técnica'].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setGroup(preset)}
                  className="px-2 py-0.5 text-[11px] rounded bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-900 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar y Activar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
