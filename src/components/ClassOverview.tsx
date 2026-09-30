import React from 'react';
import { School, TrendingUp, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { StudentVlogEntry, ClassSummary } from '../types';

interface ClassOverviewProps {
  students: StudentVlogEntry[];
  passingGrade: number;
  selectedClass: string;
  onSelectClass: (className: string) => void;
}

export const ClassOverview: React.FC<ClassOverviewProps> = ({
  students,
  passingGrade,
  selectedClass,
  onSelectClass,
}) => {
  // Extract unique classes
  const classNames = Array.from(new Set(students.map((s) => s.className || 'Kelas Umum'))).sort();

  // Compute stats for each class
  const classSummaries: ClassSummary[] = classNames.map((cName) => {
    const classStudents = students.filter((s) => s.className === cName);
    const evaluated = classStudents.filter((s) => s.status === 'evaluated' && s.finalScore !== undefined);

    const highestStudent = evaluated.length > 0
      ? [...evaluated].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))[0]
      : undefined;

    const lowestStudent = evaluated.length > 0
      ? [...evaluated].sort((a, b) => (a.finalScore || 0) - (b.finalScore || 0))[0]
      : undefined;

    const avg = evaluated.length > 0
      ? Math.round(evaluated.reduce((acc, curr) => acc + (curr.finalScore || 0), 0) / evaluated.length)
      : 0;

    const passed = evaluated.filter((s) => (s.finalScore || 0) >= passingGrade).length;
    const passRate = evaluated.length > 0 ? Math.round((passed / evaluated.length) * 100) : 0;

    const creativityAvg = evaluated.length > 0
      ? Math.round(evaluated.reduce((acc, curr) => acc + (curr.creativityScore || 0), 0) / evaluated.length)
      : 0;
    const audioAvg = evaluated.length > 0
      ? Math.round(evaluated.reduce((acc, curr) => acc + (curr.audioScore || 0), 0) / evaluated.length)
      : 0;
    const visualAvg = evaluated.length > 0
      ? Math.round(evaluated.reduce((acc, curr) => acc + (curr.visualScore || 0), 0) / evaluated.length)
      : 0;
    const themeAvg = evaluated.length > 0
      ? Math.round(evaluated.reduce((acc, curr) => acc + (curr.themeRelevanceScore || 0), 0) / evaluated.length)
      : 0;

    return {
      className: cName,
      totalStudents: classStudents.length,
      evaluatedCount: evaluated.length,
      highestScore: highestStudent ? (highestStudent.finalScore || 0) : 0,
      highestStudent: highestStudent?.name,
      lowestScore: lowestStudent ? (lowestStudent.finalScore || 0) : 0,
      lowestStudent: lowestStudent?.name,
      averageScore: avg,
      passedCount: passed,
      passRate,
      creativityAvg,
      audioAvg,
      visualAvg,
      themeAvg,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Performa & Rekap Nilai Tiap Kelas
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Komparasi nilai tertinggi, terendah, dan rata-rata per rombel belajar
          </p>
        </div>

        {/* View All Classes Button */}
        <button
          onClick={() => onSelectClass('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            selectedClass === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Lihat Semua Kelas ({students.length} Siswa)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {classSummaries.map((summary) => {
          const isSelected = selectedClass === summary.className;

          return (
            <div
              key={summary.className}
              onClick={() => onSelectClass(isSelected ? 'all' : summary.className)}
              className={`rounded-xl p-4 border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-gradient-to-b from-indigo-50/40 to-white shadow-sm'
                  : 'border-slate-200 hover:border-indigo-300 hover:shadow-xs bg-white'
              }`}
            >
              {/* Header card */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  {summary.className}
                </span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {summary.evaluatedCount}/{summary.totalStudents} Terisi
                </span>
              </div>

              {/* Stats Grid */}
              <div className="mt-3 grid grid-cols-3 gap-2 bg-slate-50/80 rounded-lg p-2.5 border border-slate-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Rata-rata
                  </span>
                  <span className="text-base font-bold text-indigo-600">
                    {summary.averageScore || '-'}
                  </span>
                </div>
                <div className="border-x border-slate-200">
                  <span className="text-[10px] text-emerald-600 font-semibold block uppercase">
                    Tertinggi
                  </span>
                  <span className="text-base font-bold text-emerald-600">
                    {summary.highestScore || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-600 font-semibold block uppercase">
                    Terendah
                  </span>
                  <span className="text-base font-bold text-rose-600">
                    {summary.lowestScore || '-'}
                  </span>
                </div>
              </div>

              {/* Student details */}
              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">🏆 Terbaik:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[150px]" title={summary.highestStudent}>
                    {summary.highestStudent || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">🎯 Remidi:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[150px]" title={summary.lowestStudent}>
                    {summary.lowestStudent || '-'}
                  </span>
                </div>
              </div>

              {/* Mini Criteria Average Bars */}
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <div className="text-[10px] font-semibold text-slate-400 mb-1.5 flex justify-between">
                  <span>Rerata Rubrik:</span>
                  <span className="text-emerald-600 font-bold">Ketuntasan: {summary.passRate}%</span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-center">
                  <div className="bg-amber-50 rounded px-1 py-0.5 border border-amber-200/60" title="Kreativitas">
                    <span className="text-[9px] text-amber-700 block font-medium">Kreatif</span>
                    <span className="text-[11px] font-bold text-amber-900">{summary.creativityAvg || '-'}</span>
                  </div>
                  <div className="bg-blue-50 rounded px-1 py-0.5 border border-blue-200/60" title="Audio">
                    <span className="text-[9px] text-blue-700 block font-medium">Audio</span>
                    <span className="text-[11px] font-bold text-blue-900">{summary.audioAvg || '-'}</span>
                  </div>
                  <div className="bg-indigo-50 rounded px-1 py-0.5 border border-indigo-200/60" title="Visual">
                    <span className="text-[9px] text-indigo-700 block font-medium">Visual</span>
                    <span className="text-[11px] font-bold text-indigo-900">{summary.visualAvg || '-'}</span>
                  </div>
                  <div className="bg-emerald-50 rounded px-1 py-0.5 border border-emerald-200/60" title="Tema">
                    <span className="text-[9px] text-emerald-700 block font-medium">Tema</span>
                    <span className="text-[11px] font-bold text-emerald-900">{summary.themeAvg || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Action footer */}
              <div className="mt-3 flex items-center justify-between text-xs text-indigo-600 font-medium group-hover:text-indigo-700">
                <span>{isSelected ? 'Sedang difilter' : 'Klik untuk filter kelas ini'}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
