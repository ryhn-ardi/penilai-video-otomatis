import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Sparkles,
  Play,
  FileText,
  Trash2,
  Edit3,
  Check,
  X,
  Printer,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { AssignmentSettings, FilterState, StudentVlogEntry } from '../types';
import { parseVideoUrl } from '../utils/videoHelper';

interface StudentTableProps {
  students: StudentVlogEntry[];
  settings: AssignmentSettings;
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onEvaluateSingle: (student: StudentVlogEntry) => void;
  onOpenEvaluationModal: (student: StudentVlogEntry) => void;
  onPrintStudentReport: (student: StudentVlogEntry) => void;
  onDeleteStudent: (studentId: string) => void;
  onQuickUpdateScoreComment: (studentId: string, manualScore?: number, manualComment?: string) => void;
  onBatchEvaluateSelected: (studentIds: string[]) => void;
  onBatchDeleteSelected: (studentIds: string[]) => void;
  evaluatingStudentId: string | null;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  settings,
  filters,
  onFilterChange,
  onEvaluateSingle,
  onOpenEvaluationModal,
  onPrintStudentReport,
  onDeleteStudent,
  onQuickUpdateScoreComment,
  onBatchEvaluateSelected,
  onBatchDeleteSelected,
  evaluatingStudentId,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<number>(0);
  const [editComment, setEditComment] = useState<string>('');

  // Extract unique classes
  const uniqueClasses = Array.from(new Set(students.map((s) => s.className || 'Kelas Umum'))).sort();

  // Filter and Sort Logic
  const filteredStudents = students.filter((s) => {
    // Search query
    const matchSearch =
      filters.search === '' ||
      s.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (s.videoTitle && s.videoTitle.toLowerCase().includes(filters.search.toLowerCase())) ||
      s.className.toLowerCase().includes(filters.search.toLowerCase());

    // Class filter
    const matchClass = filters.selectedClass === 'all' || s.className === filters.selectedClass;

    // Status filter
    const matchStatus =
      filters.status === 'all' ||
      (filters.status === 'evaluated' && (s.status === 'evaluated' || s.finalScore !== undefined)) ||
      (filters.status === 'pending' && s.status !== 'evaluated' && s.finalScore === undefined);

    // Grade filter
    const matchGrade = filters.grade === 'all' || s.grade === filters.grade;

    return matchSearch && matchClass && matchStatus && matchGrade;
  });

  // Sort
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (filters.sortBy === 'rank' || filters.sortBy === 'score_desc') {
      return (b.finalScore || 0) - (a.finalScore || 0);
    }
    if (filters.sortBy === 'score_asc') {
      return (a.finalScore || 0) - (b.finalScore || 0);
    }
    if (filters.sortBy === 'name_asc') {
      return a.name.localeCompare(b.name);
    }
    if (filters.sortBy === 'class_asc') {
      return a.className.localeCompare(b.className);
    }
    return 0;
  });

  const allSelected = sortedStudents.length > 0 && selectedIds.length === sortedStudents.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedStudents.map((s) => s.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const startQuickEdit = (std: StudentVlogEntry) => {
    setEditingRowId(std.id);
    setEditScore(std.finalScore || 80);
    setEditComment(std.teacherManualComment || std.overallComment || '');
  };

  const saveQuickEdit = (id: string) => {
    onQuickUpdateScoreComment(id, editScore, editComment);
    setEditingRowId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Search & Filter Header Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama siswa, judul vlog, atau kelas..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange({ search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Class Filter */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Kelas:</span>
              <select
                value={filters.selectedClass}
                onChange={(e) => onFilterChange({ selectedClass: e.target.value })}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Kelas ({students.length})</option>
                {uniqueClasses.map((c) => (
                  <option key={c} value={c}>
                    {c} ({students.filter((s) => s.className === c).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={filters.status}
                onChange={(e) => onFilterChange({ status: e.target.value })}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="evaluated">Sudah Dinilai ({students.filter((s) => s.status === 'evaluated').length})</option>
                <option value="pending">Belum Dinilai ({students.filter((s) => s.status !== 'evaluated').length})</option>
              </select>
            </div>

            {/* Grade Filter */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium">Grade:</span>
              <select
                value={filters.grade}
                onChange={(e) => onFilterChange({ grade: e.target.value })}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Grade</option>
                <option value="A">Grade A (&ge; 88)</option>
                <option value="B">Grade B (78-87)</option>
                <option value="C">Grade C (65-77)</option>
                <option value="D">Grade D (&lt; 65)</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filters.sortBy}
                onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="rank">Peringkat Tertinggi 🏆</option>
                <option value="score_asc">Nilai Terendah</option>
                <option value="name_asc">Nama Siswa (A-Z)</option>
                <option value="class_asc">Rombel Kelas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Batch Operations Toolbar (when items are checked) */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs animate-fadeIn">
            <span className="font-semibold text-indigo-900">
              {selectedIds.length} siswa dipilih
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onBatchEvaluateSelected(selectedIds)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition-colors cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nilai Otomatis dengan AI ({selectedIds.length})</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Yakin ingin menghapus ${selectedIds.length} data siswa terpilih?`)) {
                    onBatchDeleteSelected(selectedIds);
                    setSelectedIds([]);
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-md transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Hapus Terpilih</span>
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-slate-500 hover:text-slate-800 px-2 py-1 font-medium cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 w-14 text-center">Rank</th>
              <th className="py-3 px-4 min-w-[200px]">Nama Siswa & Kelas</th>
              <th className="py-3 px-4 min-w-[220px]">Video Vlog & Tautan</th>
              <th className="py-3 px-3 min-w-[170px]">Kriteria Rubrik (0-100)</th>
              <th className="py-3 px-3 text-center min-w-[110px]">Skor Akhir</th>
              <th className="py-3 px-4 min-w-[240px]">Komentar & Catatan Guru / AI</th>
              <th className="py-3 px-4 text-center min-w-[150px]">Aksi Penilaian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {sortedStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-600">Tidak ada data siswa yang cocok dengan filter.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Coba ubah filter pencarian atau import data Excel baru.</p>
                </td>
              </tr>
            ) : (
              sortedStudents.map((std, index) => {
                const isChecked = selectedIds.includes(std.id);
                const isBeingEvaluated = evaluatingStudentId === std.id;
                const isEvaluated = std.status === 'evaluated' || std.finalScore !== undefined;
                const isEditing = editingRowId === std.id;
                const videoInfo = parseVideoUrl(std.videoUrl);

                // Rank badge styling
                const rankNumber = index + 1;
                let rankBadge = (
                  <span className="text-slate-500 font-semibold">#{rankNumber}</span>
                );
                if (isEvaluated && filters.sortBy === 'rank') {
                  if (rankNumber === 1) rankBadge = <span className="text-amber-600 font-bold text-sm">🥇 1</span>;
                  else if (rankNumber === 2) rankBadge = <span className="text-slate-600 font-bold text-sm">🥈 2</span>;
                  else if (rankNumber === 3) rankBadge = <span className="text-amber-800 font-bold text-sm">🥉 3</span>;
                }

                return (
                  <tr
                    key={std.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isChecked ? 'bg-indigo-50/30' : ''
                    } ${isBeingEvaluated ? 'bg-amber-50/50 animate-pulse' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(std.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>

                    {/* Rank */}
                    <td className="py-3 px-3 text-center">
                      {isEvaluated ? rankBadge : <span className="text-slate-300">-</span>}
                    </td>

                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                          {std.name.charAt(0)}
                        </div>
                        <div>
                          <span
                            onClick={() => onOpenEvaluationModal(std)}
                            className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors block"
                          >
                            {std.name}
                          </span>
                          <span className="inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                            {std.className}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Vlog Info & Link */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          onClick={() => onOpenEvaluationModal(std)}
                          className="relative h-10 w-14 rounded bg-slate-800 overflow-hidden shrink-0 cursor-pointer group border border-slate-200"
                        >
                          {videoInfo.thumbnailUrl ? (
                            <img
                              src={videoInfo.thumbnailUrl}
                              alt={std.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-800">
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 flex items-center justify-center transition-colors">
                            <Play className="w-3 h-3 text-white fill-white opacity-80 group-hover:opacity-100" />
                          </div>
                        </div>

                        <div className="min-w-0">
                          <p
                            onClick={() => onOpenEvaluationModal(std)}
                            className="font-medium text-slate-800 truncate max-w-[160px] hover:text-indigo-600 cursor-pointer"
                            title={std.videoTitle || 'Tugas Vlog Siswa'}
                          >
                            {std.videoTitle || 'Tugas Vlog Siswa'}
                          </p>
                          <a
                            href={std.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 hover:underline truncate max-w-[160px]"
                            title={std.videoUrl}
                          >
                            <span className="truncate">{std.videoUrl.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* 4 Rubric Criteria */}
                    <td className="py-3 px-3">
                      {isEvaluated ? (
                        <div className="grid grid-cols-2 gap-1 text-[10px]">
                          <div className="bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60" title="Kreativitas & Orisinalitas">
                            <span className="text-amber-700 font-medium">Kreatif: </span>
                            <span className="font-bold text-amber-950">{std.creativityScore}</span>
                          </div>
                          <div className="bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60" title="Kualitas Audio & Vokal">
                            <span className="text-blue-700 font-medium">Audio: </span>
                            <span className="font-bold text-blue-950">{std.audioScore}</span>
                          </div>
                          <div className="bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60" title="Kejernihan Visual & Teknis">
                            <span className="text-indigo-700 font-medium">Visual: </span>
                            <span className="font-bold text-indigo-950">{std.visualScore}</span>
                          </div>
                          <div className="bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60" title="Kesesuaian dengan Tema">
                            <span className="text-emerald-700 font-medium">Tema: </span>
                            <span className="font-bold text-emerald-950">{std.themeRelevanceScore}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Belum dinilai AI</span>
                      )}
                    </td>

                    {/* Final Score & Grade */}
                    <td className="py-3 px-3 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editScore}
                          onChange={(e) => setEditScore(Number(e.target.value))}
                          className="w-16 px-1.5 py-1 text-center font-bold text-sm bg-white border border-indigo-500 rounded focus:outline-none"
                        />
                      ) : isEvaluated ? (
                        <div className="flex flex-col items-center">
                          <span
                            onClick={() => startQuickEdit(std)}
                            className="text-base font-extrabold text-slate-900 cursor-pointer hover:text-indigo-600"
                            title="Klik untuk ubah skor cepat"
                          >
                            {std.finalScore}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                              std.grade === 'A'
                                ? 'bg-emerald-100 text-emerald-800'
                                : std.grade === 'B'
                                ? 'bg-blue-100 text-blue-800'
                                : std.grade === 'C'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            Grade {std.grade}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs font-semibold">-</span>
                      )}
                    </td>

                    {/* Comments & Feedback */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <div className="space-y-1">
                          <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            rows={2}
                            placeholder="Tulis ulasan/komentar guru..."
                            className="w-full p-1.5 text-xs bg-white border border-indigo-400 rounded focus:outline-none"
                          />
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => saveQuickEdit(std.id)}
                              className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={() => setEditingRowId(null)}
                              className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-medium cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="group relative">
                          <p
                            onClick={() => startQuickEdit(std)}
                            className="text-slate-600 line-clamp-2 hover:text-slate-900 cursor-pointer"
                            title="Klik untuk ubah komentar"
                          >
                            {std.teacherManualComment || std.overallComment || (
                              <span className="text-slate-400 italic">Belum ada komentar</span>
                            )}
                          </p>
                          <button
                            onClick={() => startQuickEdit(std)}
                            className="text-[10px] text-indigo-500 font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 inline-flex items-center gap-0.5"
                          >
                            <Edit3 className="w-2.5 h-2.5" /> Edit Catatan
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Auto-evaluate with AI button */}
                        <button
                          onClick={() => onEvaluateSingle(std)}
                          disabled={isBeingEvaluated}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                            isBeingEvaluated
                              ? 'bg-amber-100 text-amber-800 cursor-not-allowed'
                              : isEvaluated
                              ? 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                          }`}
                          title={isEvaluated ? 'Evaluasi ulang dengan AI' : 'Nilai otomatis dengan AI'}
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${isBeingEvaluated ? 'animate-spin text-amber-600' : ''}`} />
                          <span>{isBeingEvaluated ? 'Menilai...' : isEvaluated ? 'Re-AI' : 'Nilai AI'}</span>
                        </button>

                        {/* Open Rubric modal */}
                        <button
                          onClick={() => onOpenEvaluationModal(std)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-indigo-200"
                          title="Buka Lembar Evaluasi & Video Player"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Print Student PDF Report */}
                        <button
                          onClick={() => onPrintStudentReport(std)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
                          title="Cetak Rapor Nilai Siswa (PDF)"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Delete Student */}
                        <button
                          onClick={() => {
                            if (confirm(`Hapus data vlog ${std.name}?`)) {
                              onDeleteStudent(std.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer info bar */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div>
          Menampilkan <strong className="text-slate-800">{sortedStudents.length}</strong> dari <strong className="text-slate-800">{students.length}</strong> total siswa
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Grade A: {students.filter((s) => s.grade === 'A').length}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Grade B: {students.filter((s) => s.grade === 'B').length}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Grade C: {students.filter((s) => s.grade === 'C').length}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Grade D: {students.filter((s) => s.grade === 'D').length}
          </span>
        </div>
      </div>
    </div>
  );
};
