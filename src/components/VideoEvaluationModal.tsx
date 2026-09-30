import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ExternalLink,
  Play,
  Printer,
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Sliders,
  Award,
  Video,
  Volume2,
  Eye,
  BookOpen,
} from 'lucide-react';
import { AssignmentSettings, StudentVlogEntry } from '../types';
import { parseVideoUrl } from '../utils/videoHelper';

interface VideoEvaluationModalProps {
  student: StudentVlogEntry;
  settings: AssignmentSettings;
  onClose: () => void;
  onSave: (updatedStudent: StudentVlogEntry) => void;
  onReevaluate: (student: StudentVlogEntry) => Promise<void>;
  onPrintPdf: (student: StudentVlogEntry) => void;
  isEvaluating: boolean;
}

export const VideoEvaluationModal: React.FC<VideoEvaluationModalProps> = ({
  student,
  settings,
  onClose,
  onSave,
  onReevaluate,
  onPrintPdf,
  isEvaluating,
}) => {
  const [formData, setFormData] = useState<StudentVlogEntry>({ ...student });
  const [newStrength, setNewStrength] = useState('');
  const [newImprovement, setNewImprovement] = useState('');

  useEffect(() => {
    setFormData({ ...student });
  }, [student]);

  const videoInfo = parseVideoUrl(formData.videoUrl);

  // Recalculate weighted final score
  const updateCriteriaScore = (
    key: 'creativityScore' | 'audioScore' | 'visualScore' | 'themeRelevanceScore',
    value: number
  ) => {
    const clamped = Math.max(0, Math.min(100, Number(value) || 0));
    const nextState = { ...formData, [key]: clamped };

    const cS = key === 'creativityScore' ? clamped : (nextState.creativityScore || 80);
    const aS = key === 'audioScore' ? clamped : (nextState.audioScore || 80);
    const vS = key === 'visualScore' ? clamped : (nextState.visualScore || 80);
    const tS = key === 'themeRelevanceScore' ? clamped : (nextState.themeRelevanceScore || 80);

    const w = settings.weights;
    const totalW = w.creativity + w.audio + w.visual + w.theme;
    const finalScore = Math.round(
      (cS * w.creativity + aS * w.audio + vS * w.visual + tS * w.theme) / totalW
    );

    let grade: 'A' | 'B' | 'C' | 'D' = 'D';
    if (finalScore >= 88) grade = 'A';
    else if (finalScore >= 78) grade = 'B';
    else if (finalScore >= 65) grade = 'C';

    const isPassed = finalScore >= settings.passingGrade;

    setFormData({
      ...nextState,
      finalScore,
      grade,
      isPassed,
      status: 'evaluated',
    });
  };

  const addStrength = () => {
    if (!newStrength.trim()) return;
    const current = formData.strengths || [];
    setFormData({ ...formData, strengths: [...current, newStrength.trim()] });
    setNewStrength('');
  };

  const removeStrength = (index: number) => {
    const current = formData.strengths || [];
    setFormData({ ...formData, strengths: current.filter((_, i) => i !== index) });
  };

  const addImprovement = () => {
    if (!newImprovement.trim()) return;
    const current = formData.improvements || [];
    setFormData({ ...formData, improvements: [...current, newImprovement.trim()] });
    setNewImprovement('');
  };

  const removeImprovement = (index: number) => {
    const current = formData.improvements || [];
    setFormData({ ...formData, improvements: current.filter((_, i) => i !== index) });
  };

  const handleSaveAndClose = () => {
    onSave(formData);
    onClose();
  };

  // Quick Quality Presets
  const applyPresetQuality = (preset: 'poor' | 'fair' | 'good' | 'excellent') => {
    let c = 80, a = 80, v = 80, t = 80;
    let cFb = '', aFb = '', vFb = '', tFb = '';
    let pace = 'Komunikatif';
    let ovr = '';

    if (preset === 'poor') {
      c = 42; a = 38; v = 35; t = 48;
      cFb = 'Konsep tidak terencana, tidak ada editing transisi maupun alur narasi yang jelas.';
      aFb = 'Kualitas audio sangat buruk, artikulasi tidak jelas tertutup noise/distorsi parah.';
      vFb = 'Resolusi gambar buram/pecah, pencahayaan sangat gelap/backlight, dan kamera goyang parah.';
      tFb = `Pembahasan materi sangat minim dan melenceng dari tema "${settings.theme}".`;
      pace = 'Tidak Terstruktur & Asal-asalan';
      ovr = `Karya vlog ${formData.name} belum memenuhi standar minimum penilaian tugas (Skor: 41, Grade D). Wajib rekam ulang (remidi).`;
    } else if (preset === 'fair') {
      c = 68; a = 64; v = 65; t = 70;
      cFb = 'Penyampaian cukup jelas namun transisi dan daya tarik pembuka masih monoton.';
      aFb = 'Volume vokal terdengar namun sesekali terganggu suara latar atau musik terlalu keras.';
      vFb = 'Pencahayaan dan resolusi pas-pasan, sudut kamera masih sering goyang.';
      tFb = `Sudah menyentuh tema "${settings.theme}", namun data dan analisis masih dangkal.`;
      pace = 'Cukup Monoton';
      ovr = `Performa ${formData.name} masih membutuhkan perbaikan teknis audio dan visual (Skor: 67, Grade C).`;
    } else if (preset === 'good') {
      c = 82; a = 80; v = 83; t = 85;
      cFb = 'Storytelling runtut dengan pembuka yang cukup menarik.';
      aFb = 'Artikulasi suara vokal jelas dan keseimbangan musik latar terjaga.';
      vFb = 'Pencahayaan alami cukup baik, resolusi gambar tajam dan framing rapi.';
      tFb = `Materi vlog sangat selaras dengan tema "${settings.theme}".`;
      pace = 'Santai & Komunikatif';
      ovr = `Karya vlog yang baik dan memenuhi standar kompetensi tugas (Skor: 82, Grade B).`;
    } else if (preset === 'excellent') {
      c = 95; a = 93; v = 94; t = 96;
      cFb = 'Konsep sinematik memukau dengan transisi dan motion graphic yang sangat rapi.';
      aFb = 'Kualitas audio sangat bersih, vokal jernih layaknya presenter profesional.';
      vFb = 'Resolusi Full HD tajam, pencahayaan dan color grading estetik.';
      tFb = `Eksplorasi tema "${settings.theme}" luar biasa mendalam dan sarat pesan edukatif.`;
      pace = 'Inspiratif & Sangat Percaya Diri';
      ovr = `Karya luar biasa dari ${formData.name}! Salah satu video terbaik di kelas ini (Skor: 95, Grade A).`;
    }

    const w = settings.weights;
    const totalW = w.creativity + w.audio + w.visual + w.theme;
    const finalScore = Math.round((c * w.creativity + a * w.audio + v * w.visual + t * w.theme) / totalW);

    let grade: 'A' | 'B' | 'C' | 'D' = 'D';
    if (finalScore >= 88) grade = 'A';
    else if (finalScore >= 78) grade = 'B';
    else if (finalScore >= 65) grade = 'C';

    setFormData({
      ...formData,
      creativityScore: c,
      creativityFeedback: cFb,
      audioScore: a,
      audioFeedback: aFb,
      visualScore: v,
      visualFeedback: vFb,
      themeRelevanceScore: t,
      themeFeedback: tFb,
      finalScore,
      grade,
      isPassed: finalScore >= settings.passingGrade,
      presentationPace: pace,
      overallComment: ovr,
      qualityAssessment: preset,
      status: 'evaluated',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              {formData.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{formData.name}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
                  {formData.className}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  formData.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {formData.isPassed ? 'TUNTAS KKM' : 'BELUM TUNTAS'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tema: <span className="font-medium text-slate-700">{settings.theme}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintPdf(formData)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cetak Rapor Siswa</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - 2 Columns */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Video Player & Link Context (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Embedded Player */}
            <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center shadow-inner border border-slate-800">
              {videoInfo.embedUrl ? (
                <iframe
                  src={videoInfo.embedUrl}
                  title={`Vlog ${formData.name}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="p-6 text-center text-slate-400">
                  <Video className="w-10 h-10 mx-auto mb-2 text-slate-500" />
                  <p className="font-semibold text-slate-300 text-sm">Pratinjau Video Eksternal</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Link video tidak mendukung embed langsung. Silakan buka tautan di tab baru.
                  </p>
                </div>
              )}
            </div>

            {/* Video Meta Box */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Judul Vlog:</label>
                <input
                  type="text"
                  value={formData.videoTitle || ''}
                  onChange={(e) => setFormData({ ...formData, videoTitle: e.target.value })}
                  placeholder="Masukkan judul video vlog siswa..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Link Video Vlog:</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[11px] focus:outline-none"
                  />
                  <a
                    href={formData.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors shrink-0"
                    title="Buka link di tab baru"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {formData.presentationPace && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-600">
                  <span>Gaya Penyampaian:</span>
                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {formData.presentationPace}
                  </span>
                </div>
              )}
            </div>

            {/* AI Re-evaluate Trigger */}
            <button
              onClick={() => onReevaluate(formData)}
              disabled={isEvaluating}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isEvaluating ? 'animate-spin' : ''}`} />
              <span>{isEvaluating ? 'Menganalisis Ulang dengan Gemini AI...' : 'Evaluasi Ulang dengan Gemini AI'}</span>
            </button>

            {/* Final Calculated Score Card */}
            <div className="p-4 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl flex items-center justify-between shadow-md">
              <div>
                <span className="text-xs text-indigo-200 font-semibold uppercase tracking-wider block">
                  Skor Akhir Berbobot
                </span>
                <span className="text-3xl font-extrabold text-white">
                  {formData.finalScore ?? '-'}
                  <span className="text-sm font-normal text-indigo-200"> / 100</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-indigo-200 font-semibold uppercase tracking-wider block">
                  Predikat
                </span>
                <span className="text-2xl font-black text-amber-300">
                  Grade {formData.grade ?? '-'}
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: 4 Rubric Criteria & Feedback (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Quick Diagnostic Presets */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  Kalibrasi Cepat Kualitas Video (Preset Penilaian Tegas):
                </span>
                <span className="text-[11px] text-slate-400">Pilih jika ingin auto-set skor</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPresetQuality('poor')}
                  className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg text-left transition-colors cursor-pointer"
                  title="Gunakan jika kualitas video buram, gelap, goyang parah, audio kresek, atau asal-asalan"
                >
                  <span className="block text-[11px] font-bold text-rose-800 leading-tight">🔴 Sangat Buruk</span>
                  <span className="text-[10px] text-rose-600">Skor ~41 (Grade D)</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetQuality('fair')}
                  className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg text-left transition-colors cursor-pointer"
                  title="Gunakan jika kualitas kurang memuaskan dan perlu remidi"
                >
                  <span className="block text-[11px] font-bold text-amber-800 leading-tight">🟡 Kurang / Remidi</span>
                  <span className="text-[10px] text-amber-600">Skor ~67 (Grade C)</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetQuality('good')}
                  className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-lg text-left transition-colors cursor-pointer"
                  title="Gunakan untuk kualitas standar yang memenuhi KKM"
                >
                  <span className="block text-[11px] font-bold text-blue-800 leading-tight">🔵 Standar KKM</span>
                  <span className="text-[10px] text-blue-600">Skor ~82 (Grade B)</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetQuality('excellent')}
                  className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-left transition-colors cursor-pointer"
                  title="Gunakan untuk video yang sangat bagus, jernih, dan sinematik"
                >
                  <span className="block text-[11px] font-bold text-emerald-800 leading-tight">🟢 Sangat Bagus</span>
                  <span className="text-[10px] text-emerald-600">Skor ~95 (Grade A)</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Penilaian Rubrik Objektif (4 Kriteria)
              </h4>
              <span className="text-[11px] text-slate-500">
                Bobot: K:{settings.weights.creativity}% | A:{settings.weights.audio}% | V:{settings.weights.visual}% | T:{settings.weights.theme}%
              </span>
            </div>

            {/* 1. Kreativitas */}
            <div className="p-3.5 bg-amber-50/40 border border-amber-200/70 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-amber-500 text-white flex items-center justify-center text-xs font-bold">1</div>
                  <span className="font-bold text-slate-900 text-xs">Kreativitas & Orisinalitas ({settings.weights.creativity}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.creativityScore || 80}
                    onChange={(e) => updateCriteriaScore('creativityScore', Number(e.target.value))}
                    className="w-24 accent-amber-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.creativityScore || 80}
                    onChange={(e) => updateCriteriaScore('creativityScore', Number(e.target.value))}
                    className="w-14 px-1.5 py-1 text-center font-bold text-xs bg-white border border-amber-300 rounded"
                  />
                </div>
              </div>
              <textarea
                value={formData.creativityFeedback || ''}
                onChange={(e) => setFormData({ ...formData, creativityFeedback: e.target.value })}
                rows={2}
                placeholder="Ulasan aspek kreativitas & storytelling..."
                className="w-full p-2 bg-white text-xs border border-amber-200 rounded-lg focus:outline-none"
              />
            </div>

            {/* 2. Audio */}
            <div className="p-3.5 bg-blue-50/40 border border-blue-200/70 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-blue-500 text-white flex items-center justify-center text-xs font-bold">2</div>
                  <span className="font-bold text-slate-900 text-xs">Kualitas Audio & Vokal ({settings.weights.audio}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.audioScore || 80}
                    onChange={(e) => updateCriteriaScore('audioScore', Number(e.target.value))}
                    className="w-24 accent-blue-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.audioScore || 80}
                    onChange={(e) => updateCriteriaScore('audioScore', Number(e.target.value))}
                    className="w-14 px-1.5 py-1 text-center font-bold text-xs bg-white border border-blue-300 rounded"
                  />
                </div>
              </div>
              <textarea
                value={formData.audioFeedback || ''}
                onChange={(e) => setFormData({ ...formData, audioFeedback: e.target.value })}
                rows={2}
                placeholder="Ulasan aspek vokal, balancing musik & noise..."
                className="w-full p-2 bg-white text-xs border border-blue-200 rounded-lg focus:outline-none"
              />
            </div>

            {/* 3. Visual */}
            <div className="p-3.5 bg-indigo-50/40 border border-indigo-200/70 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">3</div>
                  <span className="font-bold text-slate-900 text-xs">Kejernihan Visual & Teknis ({settings.weights.visual}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.visualScore || 80}
                    onChange={(e) => updateCriteriaScore('visualScore', Number(e.target.value))}
                    className="w-24 accent-indigo-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.visualScore || 80}
                    onChange={(e) => updateCriteriaScore('visualScore', Number(e.target.value))}
                    className="w-14 px-1.5 py-1 text-center font-bold text-xs bg-white border border-indigo-300 rounded"
                  />
                </div>
              </div>
              <textarea
                value={formData.visualFeedback || ''}
                onChange={(e) => setFormData({ ...formData, visualFeedback: e.target.value })}
                rows={2}
                placeholder="Ulasan aspek pencahayaan, framing & stabilitas..."
                className="w-full p-2 bg-white text-xs border border-indigo-200 rounded-lg focus:outline-none"
              />
            </div>

            {/* 4. Tema */}
            <div className="p-3.5 bg-emerald-50/40 border border-emerald-200/70 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">4</div>
                  <span className="font-bold text-slate-900 text-xs">Kesesuaian Tema & Pesan ({settings.weights.theme}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.themeRelevanceScore || 80}
                    onChange={(e) => updateCriteriaScore('themeRelevanceScore', Number(e.target.value))}
                    className="w-24 accent-emerald-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.themeRelevanceScore || 80}
                    onChange={(e) => updateCriteriaScore('themeRelevanceScore', Number(e.target.value))}
                    className="w-14 px-1.5 py-1 text-center font-bold text-xs bg-white border border-emerald-300 rounded"
                  />
                </div>
              </div>
              <textarea
                value={formData.themeFeedback || ''}
                onChange={(e) => setFormData({ ...formData, themeFeedback: e.target.value })}
                rows={2}
                placeholder="Ulasan keselarasan materi dengan tema & pesan moral..."
                className="w-full p-2 bg-white text-xs border border-emerald-200 rounded-lg focus:outline-none"
              />
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Strengths */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Kelebihan Siswa
                </span>
                <div className="space-y-1.5">
                  {(formData.strengths || []).map((str, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-white p-1.5 rounded border border-slate-200">
                      <span className="text-slate-700 leading-tight">{str}</span>
                      <button onClick={() => removeStrength(idx)} className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Tambah kelebihan..."
                    value={newStrength}
                    onChange={(e) => setNewStrength(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addStrength()}
                    className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:outline-none"
                  />
                  <button onClick={addStrength} className="p-1 bg-emerald-600 text-white rounded cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Improvements */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Area Perbaikan
                </span>
                <div className="space-y-1.5">
                  {(formData.improvements || []).map((imp, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-white p-1.5 rounded border border-slate-200">
                      <span className="text-slate-700 leading-tight">{imp}</span>
                      <button onClick={() => removeImprovement(idx)} className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Tambah saran..."
                    value={newImprovement}
                    onChange={(e) => setNewImprovement(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addImprovement()}
                    className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:outline-none"
                  />
                  <button onClick={addImprovement} className="p-1 bg-rose-600 text-white rounded cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Overall Teacher/AI Comment */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <label className="text-xs font-bold text-slate-800 block">
                Komentar Rekapitulasi Rapor (Guru & AI):
              </label>
              <textarea
                value={formData.teacherManualComment || formData.overallComment || ''}
                onChange={(e) => setFormData({ ...formData, teacherManualComment: e.target.value })}
                rows={2}
                placeholder="Tulis ulasan komprehensif untuk siswa ini..."
                className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {formData.evaluatedAt ? (
              <span>Terakhir dievaluasi: {new Date(formData.evaluatedAt).toLocaleString('id-ID')}</span>
            ) : (
              <span>Status: Belum disimpan</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handleSaveAndClose}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Penilaian</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
