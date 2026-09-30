import React from 'react';
import { Sparkles, Play, Pause, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface BatchEvaluationBarProps {
  totalToEvaluate: number;
  currentProgress: number;
  currentStudentName: string;
  isRunning: boolean;
  onStartAll: () => void;
  onPause: () => void;
  onCancel: () => void;
}

export const BatchEvaluationBar: React.FC<BatchEvaluationBarProps> = ({
  totalToEvaluate,
  currentProgress,
  currentStudentName,
  isRunning,
  onStartAll,
  onPause,
  onCancel,
}) => {
  if (totalToEvaluate === 0 && !isRunning) return null;

  const percent = totalToEvaluate > 0 ? Math.min(100, Math.round((currentProgress / totalToEvaluate) * 100)) : 0;

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-4 rounded-xl shadow-lg border border-indigo-700/50 mb-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30">
            <Sparkles className={`w-5 h-5 text-indigo-300 ${isRunning ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white">
                Penilaian Otomatis Batch AI (Semua Siswa Belum Dinilai)
              </h4>
              <span className="text-[10px] font-semibold bg-indigo-500/40 text-indigo-200 px-2 py-0.5 rounded-full">
                {currentProgress} / {totalToEvaluate} Selesai ({percent}%)
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              {isRunning ? (
                <span>
                  Sedang menganalisis vlog:{' '}
                  <strong className="text-amber-300 font-semibold">{currentStudentName || 'Memproses...'}</strong>
                </span>
              ) : (
                <span>
                  Terdapat <strong>{totalToEvaluate}</strong> video vlog siswa yang menunggu penilaian otomatis dari AI.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {!isRunning ? (
            <button
              onClick={onStartAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Mulai Nilai Semua ({totalToEvaluate})</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Jeda (Pause)</span>
            </button>
          )}

          <button
            onClick={onCancel}
            className="p-2 text-indigo-300 hover:text-white hover:bg-indigo-700/50 rounded-lg transition-colors cursor-pointer"
            title="Tutup Bar Penilaian"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="mt-3 w-full bg-indigo-950/60 rounded-full h-2 overflow-hidden border border-indigo-700/30">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
