import React from 'react';
import { Trophy, Medal, Star, Play, Sparkles, ArrowUpRight } from 'lucide-react';
import { StudentVlogEntry } from '../types';
import { parseVideoUrl } from '../utils/videoHelper';

interface TopTenLeaderboardProps {
  students: StudentVlogEntry[];
  onSelectStudent: (student: StudentVlogEntry) => void;
}

export const TopTenLeaderboard: React.FC<TopTenLeaderboardProps> = ({
  students,
  onSelectStudent,
}) => {
  const evaluated = students.filter(s => s.status === 'evaluated' && s.finalScore !== undefined);
  const sorted = [...evaluated].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
  const topTen = sorted.slice(0, 10);

  if (topTen.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center shadow-2xs">
        <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h4 className="font-semibold text-slate-800">Peringkat 10 Besar Keseluruhan</h4>
        <p className="text-xs text-slate-500 mt-1">
          Belum ada nilai siswa yang dievaluasi. Lakukan penilaian otomatis dengan AI untuk melihat peringkat.
        </p>
      </div>
    );
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 font-extrabold flex items-center justify-center text-sm shadow-md shadow-amber-300/40 ring-2 ring-amber-200">
          🥇 1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-800 font-extrabold flex items-center justify-center text-sm shadow-sm ring-2 ring-slate-200">
          🥈 2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-amber-50 font-extrabold flex items-center justify-center text-sm shadow-sm ring-2 ring-amber-300">
          🥉 3
        </div>
      );
    }
    return (
      <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
        #{rank}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Peringkat Sepuluh Besar Keseluruhan
            </h3>
            <p className="text-xs text-slate-500">
              Siswa dengan performa video vlog terbaik dari seluruh kelas
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200/60 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Top 10 Leaderboard
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {topTen.map((student, index) => {
          const rank = index + 1;
          const videoInfo = parseVideoUrl(student.videoUrl);

          return (
            <div
              key={student.id}
              onClick={() => onSelectStudent(student)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                rank === 1
                  ? 'bg-gradient-to-r from-amber-50/60 via-yellow-50/30 to-white border-amber-300 hover:border-amber-400 shadow-xs'
                  : rank <= 3
                  ? 'bg-slate-50/50 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              {/* Left: Rank & Student info */}
              <div className="flex items-center gap-3 min-w-0">
                {getRankBadge(rank)}

                {/* Thumbnail */}
                <div className="relative h-12 w-16 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-slate-200 group-hover:ring-2 ring-indigo-400 transition-all">
                  {videoInfo.thumbnailUrl ? (
                    <img
                      src={videoInfo.thumbnailUrl}
                      alt={student.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                    <Play className="w-3.5 h-3.5 text-white fill-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h5 className="font-bold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                      {student.name}
                    </h5>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                      {student.className}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-[240px]">
                    {student.videoTitle || 'Tugas Vlog Siswa'}
                  </p>
                  
                  {/* Criteria mini scores */}
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    <span title="Kreativitas">K: <strong className="text-amber-700">{student.creativityScore}</strong></span>
                    <span title="Audio">A: <strong className="text-blue-700">{student.audioScore}</strong></span>
                    <span title="Visual">V: <strong className="text-indigo-700">{student.visualScore}</strong></span>
                    <span title="Tema">T: <strong className="text-emerald-700">{student.themeRelevanceScore}</strong></span>
                  </div>
                </div>
              </div>

              {/* Right: Big Final Score Badge */}
              <div className="flex flex-col items-end shrink-0 pl-2">
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl font-extrabold ${rank === 1 ? 'text-amber-600' : 'text-indigo-600'}`}>
                    {student.finalScore}
                  </span>
                  <span className="text-[10px] text-slate-400">pts</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  student.grade === 'A'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  Grade {student.grade}
                </span>
                <span className="text-[10px] text-indigo-500 font-medium flex items-center gap-0.5 mt-1 group-hover:underline">
                  Detail <ArrowUpRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
