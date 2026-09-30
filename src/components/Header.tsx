import React from 'react';
import {
  Video,
  Sparkles,
  FileSpreadsheet,
  FileDown,
  Settings,
  Plus,
  BarChart3,
  BookOpen,
  Award,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { AssignmentSettings } from '../types';

interface HeaderProps {
  settings: AssignmentSettings;
  totalStudents: number;
  evaluatedCount: number;
  onOpenSettings: () => void;
  onOpenImport: () => void;
  onOpenAddStudent: () => void;
  onOpenInsights: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onDownloadTemplate: () => void;
  onResetData: () => void;
  isEvaluatingBatch: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  totalStudents,
  evaluatedCount,
  onOpenSettings,
  onOpenImport,
  onOpenAddStudent,
  onOpenInsights,
  onExportExcel,
  onExportPdf,
  onDownloadTemplate,
  onResetData,
  isEvaluatingBatch,
}) => {
  const percentComplete = totalStudents > 0 ? Math.round((evaluatedCount / totalStudents) * 100) : 0;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Assignment Theme */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded font-semibold border border-indigo-400/20">
              Tema Tugas
            </span>
            <span className="font-medium text-slate-100 truncate max-w-md sm:max-w-xl">
              {settings.theme}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <span>{settings.schoolName}</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Guru: {settings.teacherName}</span>
            <button
              onClick={onOpenSettings}
              className="text-indigo-300 hover:text-white underline cursor-pointer ml-1"
            >
              Ubah Pengaturan
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-100">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  VlogGrader <span className="text-indigo-600 font-extrabold">AI</span>
                </h1>
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  Gemini Flash 3.8
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sistem Penilai Otomatis & Rekapitulasi Video Vlog Siswa
              </p>
            </div>
          </div>

          {/* Quick Progress Badge */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 self-start lg:self-center">
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-700">Progres Penilaian:</span>
                <span className="font-bold text-indigo-600">
                  {evaluatedCount} / {totalStudents} Siswa ({percentComplete}%)
                </span>
              </div>
              <div className="w-48 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Import Excel */}
            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Unggah file spreadsheet Excel (.xlsx, .xls, .csv)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Import Excel</span>
            </button>

            {/* Tambah Siswa Manual */}
            <button
              onClick={onOpenAddStudent}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 text-slate-600" />
              <span>Tambah Siswa</span>
            </button>

            {/* Analisis Kelas AI */}
            <button
              onClick={onOpenInsights}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Lihat pola kelebihan dan tantangan belajar siswa dari AI"
            >
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span>Insight AI</span>
            </button>

            {/* Export Dropdown Group */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <button
                onClick={onExportExcel}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 border-r border-slate-200 transition-colors cursor-pointer"
                title="Unduh rekapitulasi nilai lengkap dalam format Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unduh Excel</span>
              </button>
              <button
                onClick={onExportPdf}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
                title="Unduh laporan nilai resmi dalam format PDF siap cetak"
              >
                <FileDown className="w-3.5 h-3.5 text-rose-600" />
                <span>Unduh PDF</span>
              </button>
            </div>

            {/* Pengaturan Rubrik */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Pengaturan Bobot Rubrik, Tema Tugas & KKM"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
