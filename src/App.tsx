/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Trophy,
  BarChart3,
  ListOrdered,
  FileSpreadsheet,
  FileDown,
  Download,
  RotateCcw,
  Plus,
  Layers,
  School,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
} from 'lucide-react';

import { AssignmentSettings, FilterState, StudentVlogEntry } from './types';
import { defaultSettings, sampleStudents } from './data/initialData';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { ClassOverview } from './components/ClassOverview';
import { TopTenLeaderboard } from './components/TopTenLeaderboard';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { StudentTable } from './components/StudentTable';
import { BatchEvaluationBar } from './components/BatchEvaluationBar';
import { VideoEvaluationModal } from './components/VideoEvaluationModal';
import { ImportExcelModal } from './components/ImportExcelModal';
import { AddStudentModal } from './components/AddStudentModal';
import { RubricSettingsModal } from './components/RubricSettingsModal';
import { ClassInsightsModal } from './components/ClassInsightsModal';
import { exportRecapToExcel, downloadExcelTemplate, ParsedExcelRow } from './utils/excelHelper';
import { exportRecapToPdf, exportSingleStudentPdf } from './utils/pdfExport';

const STORAGE_KEY_STUDENTS = 'vlog_grader_students_v1';
const STORAGE_KEY_SETTINGS = 'vlog_grader_settings_v1';

export default function App() {
  // Load state from localStorage or fall back to sample data
  const [students, setStudents] = useState<StudentVlogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load students from localStorage', e);
    }
    return sampleStudents;
  });

  const [settings, setSettings] = useState<AssignmentSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load settings from localStorage', e);
    }
    return defaultSettings;
  });

  // Save changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save students to localStorage', e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    selectedClass: 'all',
    status: 'all',
    grade: 'all',
    sortBy: 'rank',
  });

  // Active view section
  const [activeTab, setActiveTab] = useState<'all' | 'table' | 'charts' | 'leaderboard'>('all');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [activeEvaluationStudent, setActiveEvaluationStudent] = useState<StudentVlogEntry | null>(null);

  // Evaluation States
  const [evaluatingStudentId, setEvaluatingStudentId] = useState<string | null>(null);
  const [isEvaluatingBatch, setIsEvaluatingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);
  const [batchCurrentName, setBatchCurrentName] = useState('');
  const batchCancelRef = useRef(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Single Evaluation Action
  const evaluateStudent = async (student: StudentVlogEntry): Promise<StudentVlogEntry | null> => {
    setEvaluatingStudentId(student.id);

    try {
      const res = await fetch('/api/evaluate-vlog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          className: student.className,
          videoUrl: student.videoUrl,
          videoTitle: student.videoTitle,
          assignmentTheme: settings.theme,
          rubricWeights: settings.weights,
          customInstructions: settings.instructions,
          passingGrade: settings.passingGrade,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Penilaian gagal');

      const updated: StudentVlogEntry = {
        ...student,
        ...json.data,
        status: 'evaluated',
      };

      setStudents((prev) => prev.map((s) => (s.id === student.id ? updated : s)));

      // If active in modal, update modal view
      if (activeEvaluationStudent?.id === student.id) {
        setActiveEvaluationStudent(updated);
      }

      showToast(`Berhasil menilai vlog ${student.name} (Skor: ${updated.finalScore})`, 'success');
      return updated;
    } catch (err: any) {
      console.error('Evaluation error:', err);
      showToast(`Gagal menilai ${student.name}: ${err.message}`, 'error');
      return null;
    } finally {
      setEvaluatingStudentId(null);
    }
  };

  // 2. Batch Evaluation Action
  const startBatchEvaluation = async (targetStudents?: StudentVlogEntry[]) => {
    const list = targetStudents || students.filter((s) => s.status !== 'evaluated' || s.finalScore === undefined);
    if (list.length === 0) {
      showToast('Semua siswa sudah dinilai!', 'info');
      return;
    }

    setIsEvaluatingBatch(true);
    setBatchTotal(list.length);
    setBatchProgress(0);
    batchCancelRef.current = false;

    let completed = 0;

    for (let i = 0; i < list.length; i++) {
      if (batchCancelRef.current) break;

      const student = list[i];
      setBatchCurrentName(`${student.name} (${student.className})`);
      setEvaluatingStudentId(student.id);

      try {
        const res = await fetch('/api/evaluate-vlog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: student.name,
            className: student.className,
            videoUrl: student.videoUrl,
            videoTitle: student.videoTitle,
            assignmentTheme: settings.theme,
            rubricWeights: settings.weights,
            customInstructions: settings.instructions,
            passingGrade: settings.passingGrade,
          }),
        });

        const json = await res.json();
        if (json.success) {
          const updated: StudentVlogEntry = {
            ...student,
            ...json.data,
            status: 'evaluated',
          };
          setStudents((prev) => prev.map((s) => (s.id === student.id ? updated : s)));
        }
      } catch (e) {
        console.error('Batch item error for student', student.name, e);
      }

      completed++;
      setBatchProgress(completed);
      // Small pause between AI calls
      await new Promise((r) => setTimeout(r, 600));
    }

    setIsEvaluatingBatch(false);
    setEvaluatingStudentId(null);
    setBatchCurrentName('');

    if (!batchCancelRef.current) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      showToast(`Selesai! Berhasil menilai ${completed} video vlog secara otomatis dengan AI.`, 'success');
    } else {
      showToast('Penilaian batch dihentikan.', 'info');
    }
  };

  const handlePauseBatch = () => {
    batchCancelRef.current = true;
    setIsEvaluatingBatch(false);
    setEvaluatingStudentId(null);
  };

  // 3. Import Excel Handler
  const handleImportExcelSuccess = (rows: ParsedExcelRow[], mode: 'append' | 'replace') => {
    const newEntries: StudentVlogEntry[] = rows.map((r, idx) => ({
      id: `imported-${Date.now()}-${idx}`,
      name: r.name,
      className: r.className,
      videoUrl: r.videoUrl,
      videoTitle: r.videoTitle || `Vlog ${r.name}`,
      status: 'pending',
    }));

    if (mode === 'replace') {
      setStudents(newEntries);
    } else {
      setStudents((prev) => [...prev, ...newEntries]);
    }

    showToast(`Berhasil mengimpor ${newEntries.length} data siswa dari Excel!`, 'success');
  };

  // 4. Add Single Student
  const handleAddStudent = (entry: Omit<StudentVlogEntry, 'id'>) => {
    const newStudent: StudentVlogEntry = {
      ...entry,
      id: `std-${Date.now()}`,
    };
    setStudents((prev) => [newStudent, ...prev]);
    showToast(`Data siswa ${newStudent.name} berhasil didaftarkan.`, 'success');
  };

  // 5. Delete Student
  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    showToast('Data siswa telah dihapus.', 'info');
  };

  // 6. Quick Update Score & Comment
  const handleQuickUpdateScoreComment = (studentId: string, manualScore?: number, manualComment?: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;

        let finalScore = manualScore !== undefined ? manualScore : s.finalScore;
        let grade = s.grade;
        if (finalScore !== undefined) {
          if (finalScore >= 88) grade = 'A';
          else if (finalScore >= 78) grade = 'B';
          else if (finalScore >= 65) grade = 'C';
          else grade = 'D';
        }

        return {
          ...s,
          finalScore,
          grade,
          isPassed: finalScore !== undefined ? finalScore >= settings.passingGrade : s.isPassed,
          teacherManualScore: manualScore,
          teacherManualComment: manualComment,
          status: 'evaluated',
        };
      })
    );
    showToast('Nilai dan catatan guru diperbarui.', 'success');
  };

  // 7. Save Single Student Full Assessment from Modal
  const handleSaveStudentAssessment = (updated: StudentVlogEntry) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showToast(`Penilaian untuk ${updated.name} berhasil disimpan!`, 'success');
  };

  // 8. Batch Action Handlers
  const handleBatchEvaluateSelected = (ids: string[]) => {
    const selected = students.filter((s) => ids.includes(s.id));
    startBatchEvaluation(selected);
  };

  const handleBatchDeleteSelected = (ids: string[]) => {
    setStudents((prev) => prev.filter((s) => !ids.includes(s.id)));
    showToast(`${ids.length} siswa berhasil dihapus.`, 'info');
  };

  // 9. Reset sample data
  const handleResetData = () => {
    if (confirm('Kembalikan data ke contoh sampel awal? Data yang Anda ubah akan digantikan sampel awal.')) {
      setStudents(sampleStudents);
      setSettings(defaultSettings);
      localStorage.removeItem(STORAGE_KEY_STUDENTS);
      localStorage.removeItem(STORAGE_KEY_SETTINGS);
      showToast('Data berhasil di-reset ke sampel contoh awal.', 'info');
    }
  };

  // Metrics
  const evaluatedCount = students.filter((s) => s.status === 'evaluated' && s.finalScore !== undefined).length;
  const pendingCount = students.length - evaluatedCount;
  const existingClasses = Array.from(new Set(students.map((s) => s.className || 'X MIPA 1'))).sort();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold text-white ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 border-emerald-500'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 border-rose-500'
                : 'bg-indigo-950 border-indigo-500'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        settings={settings}
        totalStudents={students.length}
        evaluatedCount={evaluatedCount}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenAddStudent={() => setIsAddStudentOpen(true)}
        onOpenInsights={() => setIsInsightsOpen(true)}
        onExportExcel={() => exportRecapToExcel(students, settings, filters.selectedClass)}
        onExportPdf={() => exportRecapToPdf(students, settings, filters.selectedClass)}
        onDownloadTemplate={() => downloadExcelTemplate(false)}
        onResetData={handleResetData}
        isEvaluatingBatch={isEvaluatingBatch}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Batch Evaluation Bar (Floating or Top banner) */}
        <BatchEvaluationBar
          totalToEvaluate={pendingCount}
          currentProgress={batchProgress}
          currentStudentName={batchCurrentName}
          isRunning={isEvaluatingBatch}
          onStartAll={() => startBatchEvaluation()}
          onPause={handlePauseBatch}
          onCancel={() => {
            handlePauseBatch();
            setBatchProgress(0);
          }}
        />

        {/* Top KPI Metrics Cards */}
        <StatsCards students={students} passingGrade={settings.passingGrade} />

        {/* Navigation View Switcher (Dashboard / Leaderboard / Charts / Table) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Semua Modul</span>
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'leaderboard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Peringkat 10 Besar</span>
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'charts'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Grafik Analitik</span>
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'table'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Tabel Nilai ({students.length})</span>
            </button>
          </div>

          {/* Quick shortcuts */}
          <div className="flex items-center gap-2">
            {pendingCount > 0 && !isEvaluatingBatch && (
              <button
                onClick={() => startBatchEvaluation()}
                className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nilai Semua ({pendingCount})</span>
              </button>
            )}
            <button
              onClick={handleResetData}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Reset ke data awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* View 1: Class Overview Highlights */}
        {(activeTab === 'all' || activeTab === 'table') && (
          <ClassOverview
            students={students}
            passingGrade={settings.passingGrade}
            selectedClass={filters.selectedClass}
            onSelectClass={(cls) => setFilters((prev) => ({ ...prev, selectedClass: cls }))}
          />
        )}

        {/* View 2: Top 10 Leaderboard */}
        {(activeTab === 'all' || activeTab === 'leaderboard') && (
          <TopTenLeaderboard
            students={students}
            onSelectStudent={(std) => setActiveEvaluationStudent(std)}
          />
        )}

        {/* View 3: Performance Charts */}
        {(activeTab === 'all' || activeTab === 'charts') && (
          <AnalyticsCharts students={students} passingGrade={settings.passingGrade} />
        )}

        {/* View 4: Student Data Table (Search, Filter, Quick Edit, AI Evaluate) */}
        {(activeTab === 'all' || activeTab === 'table') && (
          <StudentTable
            students={students}
            settings={settings}
            filters={filters}
            onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
            onEvaluateSingle={(std) => evaluateStudent(std)}
            onOpenEvaluationModal={(std) => setActiveEvaluationStudent(std)}
            onPrintStudentReport={(std) => exportSingleStudentPdf(std, settings)}
            onDeleteStudent={handleDeleteStudent}
            onQuickUpdateScoreComment={handleQuickUpdateScoreComment}
            onBatchEvaluateSelected={handleBatchEvaluateSelected}
            onBatchDeleteSelected={handleBatchDeleteSelected}
            evaluatingStudentId={evaluatingStudentId}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">VlogGrader AI</span>
            <span>•</span>
            <span>Platform Penilai Otomatis Video Siswa & Rekapitulasi Rapor</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Standar Kurikulum Merdeka & P5</span>
            <span>•</span>
            <span>Ditenagai Google Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Deep Video & Rubric Inspection Modal */}
      {activeEvaluationStudent && (
        <VideoEvaluationModal
          student={activeEvaluationStudent}
          settings={settings}
          onClose={() => setActiveEvaluationStudent(null)}
          onSave={handleSaveStudentAssessment}
          onReevaluate={async (std) => {
            const updated = await evaluateStudent(std);
            if (updated) setActiveEvaluationStudent(updated);
          }}
          onPrintPdf={(std) => exportSingleStudentPdf(std, settings)}
          isEvaluating={evaluatingStudentId === activeEvaluationStudent.id}
        />
      )}

      {/* 2. Import Excel Modal */}
      {isImportOpen && (
        <ImportExcelModal
          onClose={() => setIsImportOpen(false)}
          onImportSuccess={handleImportExcelSuccess}
        />
      )}

      {/* 3. Add Student Modal */}
      {isAddStudentOpen && (
        <AddStudentModal
          onClose={() => setIsAddStudentOpen(false)}
          onAddStudent={handleAddStudent}
          existingClasses={existingClasses}
        />
      )}

      {/* 4. Rubric & Theme Settings Modal */}
      {isSettingsOpen && (
        <RubricSettingsModal
          settings={settings}
          onClose={() => setIsSettingsOpen(false)}
          onSaveSettings={(newS) => {
            setSettings(newS);
            showToast('Pengaturan tugas dan bobot rubrik berhasil diperbarui!', 'success');
          }}
        />
      )}

      {/* 5. AI Class Pedagogical Insights Modal */}
      {isInsightsOpen && (
        <ClassInsightsModal
          students={students}
          assignmentTheme={settings.theme}
          selectedClass={filters.selectedClass}
          onClose={() => setIsInsightsOpen(false)}
        />
      )}
    </div>
  );
}
