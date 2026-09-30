import React from 'react';
import {
  Users,
  Award,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import { StudentVlogEntry } from '../types';

interface StatsCardsProps {
  students: StudentVlogEntry[];
  passingGrade: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ students, passingGrade }) => {
  const evaluated = students.filter(s => s.status === 'evaluated' && s.finalScore !== undefined);
  const total = students.length;
  const pendingCount = total - evaluated.length;

  const avgScore = evaluated.length > 0
    ? Math.round(evaluated.reduce((a, b) => a + (b.finalScore || 0), 0) / evaluated.length)
    : 0;

  const highestStudent = evaluated.length > 0
    ? [...evaluated].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))[0]
    : null;

  const lowestStudent = evaluated.length > 0
    ? [...evaluated].sort((a, b) => (a.finalScore || 0) - (b.finalScore || 0))[0]
    : null;

  const passedStudents = evaluated.filter(s => (s.finalScore || 0) >= passingGrade);
  const passRate = evaluated.length > 0
    ? Math.round((passedStudents.length / evaluated.length) * 100)
    : 0;

  // Grade breakdown
  const gradeA = evaluated.filter(s => s.grade === 'A').length;
  const gradeB = evaluated.filter(s => s.grade === 'B').length;
  const gradeC = evaluated.filter(s => s.grade === 'C').length;
  const gradeD = evaluated.filter(s => s.grade === 'D').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Siswa & Progres */}
      <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-2xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Siswa
          </span>
          <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{total}</span>
          <span className="text-xs text-slate-500">Siswa Terdaftar</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
          <span className="text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {evaluated.length} Dinilai
          </span>
          {pendingCount > 0 ? (
            <span className="text-amber-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {pendingCount} Pending
            </span>
          ) : (
            <span className="text-slate-400 font-medium">Semua selesai</span>
          )}
        </div>
      </div>

      {/* 2. Rata-rata Nilai & Ketuntasan */}
      <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-2xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Rata-rata Skor
          </span>
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{avgScore}</span>
          <span className="text-xs font-medium text-slate-400">/ 100</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
          <span className="text-slate-600">
            Ketuntasan (KKM {passingGrade}):
          </span>
          <span className={`font-bold ${passRate >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {passRate}% ({passedStudents.length}/{evaluated.length})
          </span>
        </div>
      </div>

      {/* 3. Nilai Tertinggi */}
      <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-2xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Nilai Tertinggi
          </span>
          <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-600">
            {highestStudent ? highestStudent.finalScore : '-'}
          </span>
          <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-semibold">
            Peringkat 1 🏆
          </span>
        </div>
        <div className="mt-3 truncate text-xs pt-2 border-t border-slate-100 text-slate-600">
          {highestStudent ? (
            <span className="font-semibold text-slate-800">
              {highestStudent.name} <span className="text-slate-400 font-normal">({highestStudent.className})</span>
            </span>
          ) : (
            <span className="text-slate-400">Belum ada data nilai</span>
          )}
        </div>
      </div>

      {/* 4. Nilai Terendah & Distribusi Grade */}
      <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-2xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Nilai Terendah
          </span>
          <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-rose-600">
            {lowestStudent ? lowestStudent.finalScore : '-'}
          </span>
          {lowestStudent && (
            <span className="text-xs text-slate-500 truncate max-w-[140px]">
              {lowestStudent.name}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">A: {gradeA}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">B: {gradeB}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">C: {gradeC}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">D: {gradeD}</span>
        </div>
      </div>
    </div>
  );
};
