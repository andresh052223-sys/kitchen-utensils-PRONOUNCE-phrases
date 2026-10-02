/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PracticeSession } from './components/PracticeSession';
import { StudentHistory } from './components/StudentHistory';
import { ProgressReport } from './components/ProgressReport';
import { AddStudentModal } from './components/AddStudentModal';
import { Student, PracticeAttempt } from './types/culinary';
import { INITIAL_STUDENTS } from './data/culinaryItems';

export default function App() {
  const [activeTab, setActiveTab] = useState<'practice' | 'history' | 'reports'>('practice');

  // Check if first-time student registration was already done
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(() => {
    try {
      const hasCompleted = localStorage.getItem('culinary_registered_user_v1');
      return !hasCompleted;
    } catch {
      return false;
    }
  });

  // Open registration modal automatically on first launch
  const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(() => {
    try {
      const hasCompleted = localStorage.getItem('culinary_registered_user_v1');
      return !hasCompleted;
    } catch {
      return false;
    }
  });

  // Load students from localStorage or use defaults
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('culinary_students');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_STUDENTS;
  });

  // Current active student
  const [currentStudent, setCurrentStudent] = useState<Student | null>(() => {
    try {
      const savedId = localStorage.getItem('culinary_current_student_id');
      if (savedId) {
        const found = students.find(s => s.id === savedId);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return students[0] || null;
  });

  // Load attempts from localStorage - Starts completely EMPTY [] by default (no dummy data)
  const [attempts, setAttempts] = useState<PracticeAttempt[]>(() => {
    try {
      const hasPurged = localStorage.getItem('culinary_clean_start_v2');
      if (!hasPurged) {
        localStorage.removeItem('culinary_attempts');
        localStorage.setItem('culinary_clean_start_v2', 'true');
        return [];
      }
      const saved = localStorage.getItem('culinary_attempts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // One-time purge of any residual legacy sample data
  useEffect(() => {
    const hasPurged = localStorage.getItem('culinary_clean_start_v2');
    if (!hasPurged) {
      localStorage.removeItem('culinary_attempts');
      setAttempts([]);
      localStorage.setItem('culinary_clean_start_v2', 'true');
    }
  }, []);

  // Persist students
  useEffect(() => {
    try {
      localStorage.setItem('culinary_students', JSON.stringify(students));
    } catch {
      // ignore
    }
  }, [students]);

  // Persist current student
  useEffect(() => {
    if (currentStudent) {
      try {
        localStorage.setItem('culinary_current_student_id', currentStudent.id);
      } catch {
        // ignore
      }
    }
  }, [currentStudent]);

  // Persist attempts
  useEffect(() => {
    try {
      localStorage.setItem('culinary_attempts', JSON.stringify(attempts));
    } catch {
      // ignore
    }
  }, [attempts]);

  // When a new apprentice is added, RESET all history and reports so they start completely clean
  const handleAddStudent = (newStudent: Student) => {
    setStudents(prev => [newStudent, ...prev.filter(s => s.id !== newStudent.id)]);
    setCurrentStudent(newStudent);
    setIsFirstVisit(false);
    
    // Mark registration completed
    try {
      localStorage.setItem('culinary_registered_user_v1', 'true');
      localStorage.setItem('culinary_current_student_id', newStudent.id);
      localStorage.removeItem(`culinary_progress_${newStudent.id}`);
    } catch {
      // ignore
    }
    
    // Reset history and reports for a fresh start
    setAttempts([]);
    try {
      localStorage.setItem('culinary_attempts', JSON.stringify([]));
    } catch {
      // ignore
    }
    
    // Automatically switch to oral practice with the clean student
    setActiveTab('practice');
  };

  const handleRecordAttempt = (attempt: PracticeAttempt) => {
    setAttempts(prev => [attempt, ...prev]);
  };

  const handleClearHistory = () => {
    if (window.confirm('¿Deseas vaciar todo el historial e informes de intentos registrados?')) {
      setAttempts([]);
      try {
        localStorage.setItem('culinary_attempts', JSON.stringify([]));
        if (currentStudent) {
          localStorage.removeItem(`culinary_progress_${currentStudent.id}`);
        }
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        students={students}
        currentStudent={currentStudent}
        onSelectStudent={(student) => setCurrentStudent(student)}
        onOpenAddStudent={() => {
          setIsFirstVisit(false);
          setIsAddStudentOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {activeTab === 'practice' && (
          <PracticeSession
            currentStudent={currentStudent}
            attempts={attempts}
            onRecordAttempt={handleRecordAttempt}
          />
        )}

        {activeTab === 'history' && (
          <StudentHistory
            attempts={attempts}
            students={students}
            currentStudent={currentStudent}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeTab === 'reports' && (
          <ProgressReport
            attempts={attempts}
            students={students}
            currentStudent={currentStudent}
            onSelectStudent={(student) => setCurrentStudent(student)}
          />
        )}

      </main>

      {/* Clean Footer */}
      <footer className="border-t border-stone-200 bg-white/80 py-6 mt-12 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">CulinaryVoice</span>
            <span>·</span>
            <span>Entrenamiento de Vocabulario y Pronunciación Técnica para Escuelas de Gastronomía</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('practice')}
              className="text-stone-600 hover:text-stone-900 transition-colors"
            >
              Práctica Oral
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('history')}
              className="text-stone-600 hover:text-stone-900 transition-colors"
            >
              Historial
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-amber-800 hover:text-amber-950 font-medium transition-colors"
            >
              Informes y Reportes (PDF / CSV)
            </button>
          </div>
        </div>
      </footer>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onAddStudent={handleAddStudent}
        isFirstTime={isFirstVisit}
      />

    </div>
  );
}
