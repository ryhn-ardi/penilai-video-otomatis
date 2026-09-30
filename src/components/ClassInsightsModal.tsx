import React, { useState } from 'react';
import { Sparkles, X, Lightbulb, CheckCircle2, AlertTriangle, BookOpen, RefreshCw } from 'lucide-react';
import { ClassInsightReport, StudentVlogEntry } from '../types';

interface ClassInsightsModalProps {
  students: StudentVlogEntry[];
  assignmentTheme: string;
  selectedClass: string;
  onClose: () => void;
}

export const ClassInsightsModal: React.FC<ClassInsightsModalProps> = ({
  students,
  assignmentTheme,
  selectedClass,
  onClose,
}) => {
  const [report, setReport] = useState<ClassInsightReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const evaluated = students.filter((s) => s.status === 'evaluated' && s.finalScore !== undefined);

  const generateInsights = async () => {
    if (evaluated.length === 0) {
      setErrorMsg('Belum ada video vlog yang dinilai untuk dianalisis.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/class-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: evaluated,
          assignmentTheme,
          className: selectedClass !== 'all' ? selectedClass : 'Semua Kelas',
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gagal memproses insight.');

      setReport(json.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memanggil Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate on open if evaluated exists and not loaded yet
  React.useEffect(() => {
    if (!report && evaluated.length > 0) {
      generateInsights();
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-violet-500/30 border border-violet-400/30 text-violet-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Analisis Pedagogis AI Kelas</h3>
              <p className="text-xs text-indigo-200">
                Pola penguasaan rubrik, kelebihan kolektif, dan rekomendasi tindak lanjut guru
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          
          {isLoading && (
            <div className="py-12 text-center space-y-3">
              <div className="h-10 w-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-bold text-slate-800 text-sm">Gemini AI sedang menganalisis pola seluruh karya vlog siswa...</p>
              <p className="text-slate-400 text-xs">Mengekstrak tren kreativitas, teknik audio visual, dan pemahaman materi.</p>
            </div>
          )}

          {errorMsg && !isLoading && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-2">
              <p className="font-bold">Gagal Membuat Insight AI</p>
              <p>{errorMsg}</p>
              <button
                onClick={generateInsights}
                className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {report && !isLoading && (
            <div className="space-y-4">
              
              {/* Executive Summary */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Ringkasan Performa Umum
                </span>
                <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                  {report.executiveSummary}
                </p>
              </div>

              {/* Strengths & Challenges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Pola Kelebihan Terkuat Siswa
                  </span>
                  <p className="text-slate-700 leading-normal">{report.topStrengthPattern}</p>
                </div>

                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    Tantangan / Aspek Perlu Bimbingan
                  </span>
                  <p className="text-slate-700 leading-normal">{report.commonChallengePattern}</p>
                </div>
              </div>

              {/* Teaching Action Recommendations */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-200/80 rounded-xl space-y-2">
                <span className="font-bold text-indigo-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Rekomendasi Aksi Guru untuk Pertemuan Berikutnya
                </span>
                <ul className="space-y-2 text-slate-700">
                  {report.teachingRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-indigo-100">
                      <span className="h-5 w-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-xs leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={generateInsights}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Perbarui Analisis</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
