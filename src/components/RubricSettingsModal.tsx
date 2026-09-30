import React, { useState } from 'react';
import { Settings, X, CheckCircle, Sliders, Scale, Info, Sparkles } from 'lucide-react';
import { AssignmentSettings, RubricWeights } from '../types';

interface RubricSettingsModalProps {
  settings: AssignmentSettings;
  onClose: () => void;
  onSaveSettings: (newSettings: AssignmentSettings) => void;
}

export const RubricSettingsModal: React.FC<RubricSettingsModalProps> = ({
  settings,
  onClose,
  onSaveSettings,
}) => {
  const [title, setTitle] = useState(settings.title);
  const [theme, setTheme] = useState(settings.theme);
  const [subjectName, setSubjectName] = useState(settings.subjectName);
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [teacherName, setTeacherName] = useState(settings.teacherName);
  const [passingGrade, setPassingGrade] = useState(settings.passingGrade);
  const [weights, setWeights] = useState<RubricWeights>({ ...settings.weights });
  const [instructions, setInstructions] = useState(settings.instructions || '');
  const [strictnessMode, setStrictnessMode] = useState<'strict' | 'standard' | 'lenient'>(settings.strictnessMode || 'strict');

  const totalWeight = weights.creativity + weights.audio + weights.visual + weights.theme;
  const isWeightValid = totalWeight === 100;

  const handleResetToDefaultWeights = () => {
    setWeights({ creativity: 25, audio: 25, visual: 25, theme: 25 });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWeightValid) {
      alert(`Total bobot kriteria saat ini adalah ${totalWeight}%. Harus berjumlah tepat 100%!`);
      return;
    }

    onSaveSettings({
      title,
      theme,
      subjectName,
      schoolName,
      teacherName,
      passingGrade: Number(passingGrade) || 75,
      weights,
      targetDuration: settings.targetDuration,
      instructions,
      strictnessMode,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Pengaturan Tugas & Bobot Rubrik</h3>
              <p className="text-xs text-slate-500">Sesuaikan tema vlog, standar KKM, dan persentase bobot 4 kriteria penilaian</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[78vh]">
          
          {/* Section 1: Konteks Tugas & Sekolah */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-indigo-700">
              <span>Informasi Tugas & Pengampu</span>
            </h4>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tema Utama Tugas Vlog * (Konteks Penilaian AI)</label>
              <input
                type="text"
                required
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Contoh: Eksplorasi Budaya Lokal & Inovasi Sains Ramah Lingkungan"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                AI akan menilai apakah isi vlog siswa relevan dan sesuai dengan tema yang ditentukan di sini.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Satuan Pendidikan / Sekolah</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="SMA Negeri 1 Prestasi Nusantara"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mata Pelajaran / Projek</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Projek Penguatan Profil Pelajar Pancasila (P5)"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Guru Penilai</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Dra. Sri Wahyuni, M.Pd."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Standar Ketuntasan Minimum (KKM)</label>
                <input
                  type="number"
                  min="50"
                  max="95"
                  value={passingGrade}
                  onChange={(e) => setPassingGrade(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-indigo-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Bobot Rubrik 4 Kriteria */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-indigo-700">
                Bobot 4 Kriteria Rubrik Objektif
              </h4>
              <button
                type="button"
                onClick={handleResetToDefaultWeights}
                className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
              >
                Rata Masing-masing 25%
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Kreativitas */}
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">1. Kreativitas & Orisinalitas</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="5"
                      max="70"
                      value={weights.creativity}
                      onChange={(e) => setWeights({ ...weights, creativity: Number(e.target.value) })}
                      className="w-14 px-1 py-0.5 text-center font-bold bg-white border border-amber-300 rounded"
                    />
                    <span className="font-bold text-amber-900">%</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">Storytelling, transisi, sudut pandang inovatif</p>
              </div>

              {/* 2. Audio */}
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">2. Kualitas Audio & Vokal</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="5"
                      max="70"
                      value={weights.audio}
                      onChange={(e) => setWeights({ ...weights, audio: Number(e.target.value) })}
                      className="w-14 px-1 py-0.5 text-center font-bold bg-white border border-blue-300 rounded"
                    />
                    <span className="font-bold text-blue-900">%</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">Kejernihan vokal, balancing musik & bebas noise</p>
              </div>

              {/* 3. Visual */}
              <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">3. Kejernihan Visual & Teknis</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="5"
                      max="70"
                      value={weights.visual}
                      onChange={(e) => setWeights({ ...weights, visual: Number(e.target.value) })}
                      className="w-14 px-1 py-0.5 text-center font-bold bg-white border border-indigo-300 rounded"
                    />
                    <span className="font-bold text-indigo-900">%</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">Ketajaman resolusi, pencahayaan & stabilitas kamera</p>
              </div>

              {/* 4. Tema */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">4. Kesesuaian Tema & Pesan</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="5"
                      max="70"
                      value={weights.theme}
                      onChange={(e) => setWeights({ ...weights, theme: Number(e.target.value) })}
                      className="w-14 px-1 py-0.5 text-center font-bold bg-white border border-emerald-300 rounded"
                    />
                    <span className="font-bold text-emerald-900">%</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">Kedalaman materi & pesan moral edukatif</p>
              </div>
            </div>

            {/* Total Weight Status */}
            <div className={`p-2.5 rounded-lg flex items-center justify-between text-xs font-bold ${
              isWeightValid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              <div className="flex items-center gap-1.5">
                <Scale className="w-4 h-4" />
                <span>Total Bobot Persentase:</span>
              </div>
              <span>{totalWeight}% {isWeightValid ? '✓ Pas (100%)' : `⚠️ Harus bernilai 100% (Selisih ${100 - totalWeight}%)`}</span>
            </div>
          </div>

          {/* Section 3: Tingkat Ketat Penilaian */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-indigo-700">
              Tingkat Ketat & Objektivitas Penilaian AI
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  strictnessMode === 'strict'
                    ? 'border-rose-500 bg-rose-50/60 ring-1 ring-rose-500 text-rose-950 font-medium'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <input
                    type="radio"
                    name="strictness"
                    checked={strictnessMode === 'strict'}
                    onChange={() => setStrictnessMode('strict')}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-bold text-xs text-rose-800">🔴 Kritis & Tegas (Rekomendasi)</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Jika video jelek/buram/asal-asalan, nilai langsung 30–55 (Grade D). Sangat objektif.
                </p>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  strictnessMode === 'standard'
                    ? 'border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500 text-indigo-950 font-medium'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <input
                    type="radio"
                    name="strictness"
                    checked={strictnessMode === 'standard'}
                    onChange={() => setStrictnessMode('standard')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-xs text-indigo-800">🔵 Standar Objektif</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Penilaian seimbang sesuai kriteria umum Kurikulum Merdeka.
                </p>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  strictnessMode === 'lenient'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500 text-emerald-950 font-medium'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <input
                    type="radio"
                    name="strictness"
                    checked={strictnessMode === 'lenient'}
                    onChange={() => setStrictnessMode('lenient')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-xs text-emerald-800">🟢 Toleran / Pemula</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Penilaian apresiatif untuk tahap pengenalan video awal.
                </p>
              </label>
            </div>
          </div>

          {/* Section 4: Instruksi Khusus Guru */}
          <div className="pt-3 border-t border-slate-200 space-y-1">
            <label className="font-bold text-slate-700 block">Instruksi Khusus untuk Evaluasi AI (Opsional)</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              placeholder="Contoh: Beri penekanan ekstra pada siswa yang mewawancarai narasumber langsung di lapangan..."
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isWeightValid}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Terapkan Pengaturan</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
