import React, { useState } from 'react';
import { ChefHat, UserPlus, Users, Mic, History, BarChart3 } from 'lucide-react';
import { Student } from '../types/culinary';

interface NavbarProps {
  activeTab: 'practice' | 'history' | 'reports';
  setActiveTab: (tab: 'practice' | 'history' | 'reports') => void;
  students: Student[];
  currentStudent: Student | null;
  onSelectStudent: (student: Student) => void;
  onOpenAddStudent: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  students,
  currentStudent,
  onSelectStudent,
  onOpenAddStudent,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-amber-700 text-amber-50 flex items-center justify-center shadow-sm">
            <ChefHat className="w-5 h-5" />
          </div>
          <button 
            onClick={() => setActiveTab('practice')}
            className="text-left group"
          >
            <span className="font-display font-bold text-xl text-stone-900 tracking-tight group-hover:text-amber-800 transition-colors">
              CulinaryVoice
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'practice'
                ? 'bg-amber-100/80 text-amber-900 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Mic className="w-4 h-4 text-amber-700" />
            <span>Práctica Oral</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-amber-100/80 text-amber-900 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <History className="w-4 h-4 text-amber-700" />
            <span>Historial</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-amber-100/80 text-amber-900 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-700" />
            <span>Informes y Progreso</span>
          </button>
        </nav>

        {/* Zone 3: Active Student Selector & Action */}
        <div className="flex items-center gap-2">
          {/* Student Selector */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm border border-stone-200 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors text-stone-800"
              title="Cambiar de aprendiz"
            >
              <Users className="w-4 h-4 text-stone-500" />
              <div className="text-left hidden sm:block max-w-[140px] truncate">
                <span className="font-semibold text-stone-900 block leading-tight truncate">
                  {currentStudent ? currentStudent.name : 'Seleccionar'}
                </span>
                <span className="text-[11px] text-stone-500 block leading-none">
                  {currentStudent?.identification || 'Aprendiz'}
                </span>
              </div>
              <span className="sm:hidden font-medium text-stone-800 text-xs truncate max-w-[100px]">
                {currentStudent ? currentStudent.name.split(' ')[0] : 'Alumno'}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                  Aprendiz en Sesión
                </div>
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => {
                      onSelectStudent(student);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center justify-between ${
                      currentStudent?.id === student.id ? 'bg-amber-50/70 text-amber-900 font-semibold' : 'text-stone-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-stone-900">{student.name}</div>
                      <div className="text-[11px] text-stone-500">{student.identification} · {student.group}</div>
                    </div>
                    {currentStudent?.id === student.id && (
                      <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    )}
                  </button>
                ))}
                <div className="border-t border-stone-100 mt-2 pt-2 px-2">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenAddStudent();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg font-medium transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Registrar Nuevo Aprendiz</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={onOpenAddStudent}
            className="p-2 sm:px-3 sm:py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            title="Registrar nuevo estudiante"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo Alumno</span>
          </button>
        </div>
      </div>

      {/* Mobile nav drawer tabs */}
      <div className="md:hidden flex border-t border-stone-100 overflow-x-auto px-4 py-2 gap-2 bg-stone-50">
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'practice' ? 'bg-amber-800 text-white font-medium' : 'text-stone-600 bg-white border border-stone-200'
          }`}
        >
          <Mic className="w-3.5 h-3.5" /> Práctica
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'history' ? 'bg-amber-800 text-white font-medium' : 'text-stone-600 bg-white border border-stone-200'
          }`}
        >
          <History className="w-3.5 h-3.5" /> Historial
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'reports' ? 'bg-amber-800 text-white font-medium' : 'text-stone-600 bg-white border border-stone-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" /> Informes
        </button>
      </div>
    </header>
  );
};

