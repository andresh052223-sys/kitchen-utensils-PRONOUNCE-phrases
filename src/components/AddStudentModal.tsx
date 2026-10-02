import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2, ChefHat, Sparkles } from 'lucide-react';
import { Student } from '../types/culinary';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (student: Student) => void;
  isFirstTime?: boolean;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
  isFirstTime = false,
}) => {
  const [name, setName] = useState('');
  const [identification, setIdentification] = useState('');
  const [group, setGroup] = useState('Técnico en Cocina Profesional');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor ingresa el nombre completo del aprendiz.');
      return;
    }
    if (!identification.trim()) {
      setError('Por favor ingresa el número de carné o documento de identidad.');
      return;
    }

    const newStudent: Student = {
      id: `student-${Date.now()}`,
      name: name.trim(),
      identification: identification.trim(),
      group: group.trim() || 'Técnico en Cocina Profesional',
      registeredAt: new Date().toISOString().slice(0, 10),
    };

    onAddStudent(newStudent);
    setName('');
    setIdentification('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-800 text-amber-50 flex items-center justify-center shadow-xs shrink-0">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 leading-tight">
                {isFirstTime ? 'Bienvenido a CulinaryVoice' : 'Registrar Nuevo Aprendiz'}
              </h3>
              <p className="text-xs text-stone-500">
                {isFirstTime 
                  ? 'Configura los datos del estudiante para iniciar la práctica' 
                  : 'Registra un nuevo alumno para iniciar una evaluación limpia'}
              </p>
            </div>
          </div>

          {!isFirstTime && (
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg transition-colors"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isFirstTime && (
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Registro Inicial de Aprendiz</span>
                <span>
                  Ingresa tus datos a continuación. Tu nombre y ficha aparecerán automáticamente en tu progreso, grabaciones y en la descarga del certificado PDF oficial.
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Nombre Completo del Aprendiz *
            </label>
            <input
              type="text"
              placeholder="Ej. Juan Andrés Pérez Gómez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:bg-white text-stone-900 transition-all font-medium"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Carné de Estudiante / Documento de Identidad *
            </label>
            <input
              type="text"
              placeholder="Ej. CC 10203040 ó Ficha 284192"
              value={identification}
              onChange={(e) => setIdentification(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:bg-white text-stone-900 transition-all font-mono-numbers"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Programa Académico o Grupo
              </label>
              <span className="text-[11px] text-amber-800 font-medium">
                (Personalizable)
              </span>
            </div>
            
            <input
              type="text"
              list="programas-sugeridos"
              placeholder="Ej. Técnico en Cocina Profesional, Grupo A..."
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:bg-white text-stone-900 transition-all font-medium"
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

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-stone-400 self-center">Opciones rápidas:</span>
              {['Cocina Profesional', 'Pastelería y Panadería', 'Ficha 284192', 'Grupo A'].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setGroup(preset)}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 transition-colors font-medium"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            {!isFirstTime && (
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-800 transition-colors"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-md transition-all active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-200" />
              <span>{isFirstTime ? 'Comenzar Práctica Oral' : 'Guardar y Activar'}</span>
            </button>
          </div>

          {isFirstTime && (
            <p className="text-[11px] text-center text-stone-400 pt-1">
              Podrás agregar o alternar entre varios aprendices en cualquier momento desde la barra superior.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
