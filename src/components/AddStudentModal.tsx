import React, { useState } from 'react';
import { UserPlus, X, Video, CheckCircle } from 'lucide-react';
import { StudentVlogEntry } from '../types';

interface AddStudentModalProps {
  onClose: () => void;
  onAddStudent: (student: Omit<StudentVlogEntry, 'id'>) => void;
  existingClasses: string[];
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  onClose,
  onAddStudent,
  existingClasses,
}) => {
  const [name, setName] = useState('');
  const [className, setClassName] = useState(existingClasses[0] || 'X MIPA 1');
  const [isCustomClass, setIsCustomClass] = useState(false);
  const [customClassName, setCustomClassName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama siswa wajib diisi.');
      return;
    }
    if (!videoUrl.trim()) {
      setErrorMsg('Link video vlog wajib diisi.');
      return;
    }

    const finalClass = isCustomClass ? customClassName.trim() || 'Kelas Umum' : className;

    onAddStudent({
      name: name.trim(),
      className: finalClass,
      videoUrl: videoUrl.trim(),
      videoTitle: videoTitle.trim() || `Tugas Vlog ${name.trim()}`,
      status: 'pending',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Tambah Data Siswa & Vlog</h3>
              <p className="text-xs text-slate-500">Masukkan nama, rombel kelas, dan link tautan video vlog siswa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Siswa *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Muhammad Farhan Pratama"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg('');
              }}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pilih Kelas *</label>
              {!isCustomClass ? (
                <select
                  value={className}
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      setIsCustomClass(true);
                    } else {
                      setClassName(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none cursor-pointer"
                >
                  {existingClasses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__new__">+ Tulis Kelas Baru...</option>
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Contoh: XII IPA 3"
                  value={customClassName}
                  onChange={(e) => setCustomClassName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-indigo-400 rounded-lg text-xs focus:outline-none"
                  autoFocus
                />
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Judul Vlog (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Eksperimen Sains Botol"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Link Tautan Video Vlog * (YouTube / Google Drive / TikTok / dll)
            </label>
            <input
              type="url"
              required
              placeholder="https://www.youtube.com/watch?v=... atau https://drive.google.com/..."
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                setErrorMsg('');
              }}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              AI akan menganalisis konten video dari link ini berdasarkan 4 kriteria rubrik objektif.
            </p>
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Simpan & Daftarkan</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
