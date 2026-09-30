import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { parseExcelFile, ParsedExcelRow, downloadExcelTemplate } from '../utils/excelHelper';

interface ImportExcelModalProps {
  onClose: () => void;
  onImportSuccess: (rows: ParsedExcelRow[], mode: 'append' | 'replace') => void;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  onClose,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedExcelRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const rows = await parseExcelFile(selectedFile);
      setParsedData(rows);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membaca file Excel. Pastikan format kolom sesuai.');
      setParsedData([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parsedData.length === 0) return;
    onImportSuccess(parsedData, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Import Data Siswa dari Excel</h3>
              <p className="text-xs text-slate-500">
                Unggah file .xlsx / .xls / .csv yang berisi nama siswa, kelas, dan link vlog
              </p>
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
        <div className="p-5 space-y-4">
          
          {/* Template Download Assistance */}
          <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-900">
              <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Belum punya format file? Unduh template Excel resmi:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadExcelTemplate(false)}
                className="px-2.5 py-1 bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Download className="w-3 h-3" />
                <span>Format Kosong</span>
              </button>
              <button
                onClick={() => downloadExcelTemplate(true)}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Download className="w-3 h-3" />
                <span>Format Contoh</span>
              </button>
            </div>
          </div>

          {/* Drag & Drop Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              file
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              className="hidden"
            />
            <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-600 mx-auto flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-indigo-600" />
            </div>
            {file ? (
              <div>
                <p className="font-bold text-slate-800 text-sm">{file.name}</p>
                <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB • Klik untuk ganti file
                </p>
              </div>
            ) : (
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  Tarik file Excel ke sini, atau <span className="text-indigo-600 underline">pilih dari komputer</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Mendukung format Microsoft Excel (.xlsx, .xls) dan CSV (.csv)
                </p>
              </div>
            )}
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Terdeteksi {parsedData.length} baris data siswa yang siap di-import:
                </span>
                <span className="text-slate-500">Pratinjau 3 data teratas</span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-36 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Nama</th>
                      <th className="py-2 px-3">Kelas</th>
                      <th className="py-2 px-3">Link Video Vlog</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3 font-medium text-slate-800">{row.name}</td>
                        <td className="py-1.5 px-3 text-slate-600">{row.className}</td>
                        <td className="py-1.5 px-3 text-indigo-600 truncate max-w-[200px]">{row.videoUrl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Import Mode Radio */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-700">Metode Penambahan:</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700">Tambahkan ke data saat ini (Append)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-rose-700 font-medium">Gantikan semua data (Replace)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={parsedData.length === 0 || isProcessing}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Import {parsedData.length} Data Siswa</span>
          </button>
        </div>

      </div>
    </div>
  );
};
