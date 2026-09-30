import React, { useState } from 'react';
import {
  BarChart2,
  PieChart,
  Target,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react';
import { StudentVlogEntry } from '../types';

interface AnalyticsChartsProps {
  students: StudentVlogEntry[];
  passingGrade: number;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  students,
  passingGrade,
}) => {
  const [activeTab, setActiveTab] = useState<'criteria' | 'classes' | 'grades'>('criteria');

  const evaluated = students.filter((s) => s.status === 'evaluated' && s.finalScore !== undefined);

  if (evaluated.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-2xs">
        <BarChart2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h4 className="font-semibold text-slate-800">Visualisasi Grafik Performa</h4>
        <p className="text-xs text-slate-500 mt-1">
          Grafik akan otomatis digambar setelah ada video vlog siswa yang dinilai oleh AI.
        </p>
      </div>
    );
  }

  // 1. Criteria Averages
  const creativityAvg = Math.round(evaluated.reduce((a, b) => a + (b.creativityScore || 0), 0) / evaluated.length);
  const audioAvg = Math.round(evaluated.reduce((a, b) => a + (b.audioScore || 0), 0) / evaluated.length);
  const visualAvg = Math.round(evaluated.reduce((a, b) => a + (b.visualScore || 0), 0) / evaluated.length);
  const themeAvg = Math.round(evaluated.reduce((a, b) => a + (b.themeRelevanceScore || 0), 0) / evaluated.length);

  const criteriaData = [
    {
      name: 'Kreativitas & Orisinalitas',
      score: creativityAvg,
      desc: 'Storytelling, konsep unik, variasi editing & transisi',
      color: 'from-amber-500 to-orange-400',
      barColor: 'bg-amber-500',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      name: 'Kualitas Audio & Vokal',
      score: audioAvg,
      desc: 'Kejernihan suara, artikulasi vokal & balancing musik',
      color: 'from-blue-500 to-cyan-400',
      barColor: 'bg-blue-500',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      name: 'Kejernihan Visual & Teknis',
      score: visualAvg,
      desc: 'Ketajaman gambar, kestabilan kamera & pencahayaan',
      color: 'from-indigo-500 to-violet-400',
      barColor: 'bg-indigo-500',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      name: 'Kesesuaian Tema & Pesan',
      score: themeAvg,
      desc: 'Kedalaman materi dan penyampaian pesan edukatif',
      color: 'from-emerald-500 to-teal-400',
      barColor: 'bg-emerald-500',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  // 2. Class Comparison Data
  const uniqueClasses = Array.from(new Set(students.map((s) => s.className || 'Kelas Umum'))).sort();
  const classComparison = uniqueClasses.map((cName) => {
    const cStudents = evaluated.filter((s) => s.className === cName);
    const avg = cStudents.length > 0
      ? Math.round(cStudents.reduce((a, b) => a + (b.finalScore || 0), 0) / cStudents.length)
      : 0;
    const highest = cStudents.length > 0 ? Math.max(...cStudents.map((s) => s.finalScore || 0)) : 0;
    const lowest = cStudents.length > 0 ? Math.min(...cStudents.map((s) => s.finalScore || 0)) : 0;
    return { className: cName, avg, highest, lowest, count: cStudents.length };
  });

  // 3. Grade Distribution Data
  const gradeA = evaluated.filter((s) => s.grade === 'A').length;
  const gradeB = evaluated.filter((s) => s.grade === 'B').length;
  const gradeC = evaluated.filter((s) => s.grade === 'C').length;
  const gradeD = evaluated.filter((s) => s.grade === 'D').length;

  const gradesData = [
    { grade: 'A', label: 'Sangat Memuaskan (88 - 100)', count: gradeA, color: 'bg-emerald-500', textColor: 'text-emerald-700', bgLight: 'bg-emerald-50' },
    { grade: 'B', label: 'Baik / Memuaskan (78 - 87)', count: gradeB, color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
    { grade: 'C', label: 'Cukup (65 - 77)', count: gradeC, color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-50' },
    { grade: 'D', label: 'Perlu Bimbingan (< 65)', count: gradeD, color: 'bg-rose-500', textColor: 'text-rose-700', bgLight: 'bg-rose-50' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Visualisasi Analitik & Tren Performa Siswa
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Grafik interaktif distribusi nilai kriteria rubrik, predikat kelas, dan komparasi rombel
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('criteria')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'criteria'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rerata 4 Kriteria
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'classes'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Komparasi Kelas
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'grades'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Distribusi Grade
          </button>
        </div>
      </div>

      {/* TAB 1: 4 Criteria Breakdown */}
      {activeTab === 'criteria' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criteriaData.map((crit) => (
              <div
                key={crit.name}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-slate-800">{crit.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${crit.badge}`}>
                    Rerata: {crit.score} / 100
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{crit.desc}</p>

                {/* Visual Bar */}
                <div className="space-y-1">
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${crit.color}`}
                      style={{ width: `${crit.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>0 (Dasar)</span>
                    <span className="text-indigo-600 font-semibold">KKM: {passingGrade}</span>
                    <span>100 (Sempurna)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Sorotan Guru:</strong> Aspek dengan nilai tertinggi adalah{' '}
                <strong>
                  {[...criteriaData].sort((a, b) => b.score - a.score)[0]?.name}
                </strong>{' '}
                ({[...criteriaData].sort((a, b) => b.score - a.score)[0]?.score} pts).
              </span>
            </div>
            <span className="font-semibold text-indigo-700 shrink-0">
              {evaluated.length} Siswa Dianalisis
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: Class Comparison Chart */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classComparison.map((item) => {
              const maxScale = 100;
              const avgHeight = (item.avg / maxScale) * 140;
              const highestHeight = (item.highest / maxScale) * 140;
              const lowestHeight = (item.lowest / maxScale) * 140;

              return (
                <div
                  key={item.className}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-800 text-sm">{item.className}</h5>
                    <span className="text-[11px] font-medium text-slate-500">
                      {item.count} siswa dinilai
                    </span>
                  </div>

                  {/* SVG/CSS Bar Chart visualization */}
                  <div className="my-4 h-40 flex items-end justify-center gap-4 pt-4 border-b border-slate-200">
                    {/* Lowest Bar */}
                    <div className="flex flex-col items-center gap-1 group">
                      <span className="text-[10px] font-bold text-rose-600 opacity-90 group-hover:scale-110 transition-transform">
                        {item.lowest}
                      </span>
                      <div
                        className="w-7 bg-rose-400/80 rounded-t-md transition-all duration-700 hover:bg-rose-500"
                        style={{ height: `${Math.max(lowestHeight, 8)}px` }}
                      />
                      <span className="text-[9px] text-slate-500 font-medium">Min</span>
                    </div>

                    {/* Average Bar */}
                    <div className="flex flex-col items-center gap-1 group">
                      <span className="text-[11px] font-extrabold text-indigo-600 opacity-90 group-hover:scale-110 transition-transform">
                        {item.avg}
                      </span>
                      <div
                        className="w-9 bg-indigo-600 rounded-t-md transition-all duration-700 shadow-xs hover:bg-indigo-700"
                        style={{ height: `${Math.max(avgHeight, 10)}px` }}
                      />
                      <span className="text-[10px] text-indigo-700 font-bold">Rerata</span>
                    </div>

                    {/* Highest Bar */}
                    <div className="flex flex-col items-center gap-1 group">
                      <span className="text-[10px] font-bold text-emerald-600 opacity-90 group-hover:scale-110 transition-transform">
                        {item.highest}
                      </span>
                      <div
                        className="w-7 bg-emerald-500/80 rounded-t-md transition-all duration-700 hover:bg-emerald-600"
                        style={{ height: `${Math.max(highestHeight, 8)}px` }}
                      />
                      <span className="text-[9px] text-slate-500 font-medium">Max</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Spread Rentang Nilai:</span>
                    <span className="font-bold text-slate-800">
                      {item.highest - item.lowest} poin selisih
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Grade Distribution */}
      {activeTab === 'grades' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gradesData.map((g) => {
              const percentage = evaluated.length > 0 ? Math.round((g.count / evaluated.length) * 100) : 0;
              return (
                <div
                  key={g.grade}
                  className={`p-4 rounded-xl border border-slate-200 ${g.bgLight} flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-extrabold ${g.textColor}`}>
                      Grade {g.grade}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-2xs">
                      {percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{g.label}</p>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Jumlah Siswa:</span>
                    <span className="text-xl font-bold text-slate-800">
                      {g.count} <span className="text-xs font-normal text-slate-400">orang</span>
                    </span>
                  </div>

                  {/* Mini progress bar */}
                  <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${g.color} rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
