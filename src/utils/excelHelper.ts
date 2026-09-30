import * as XLSX from 'xlsx';
import { AssignmentSettings, StudentVlogEntry } from '../types';

export interface ParsedExcelRow {
  name: string;
  className: string;
  videoUrl: string;
  videoTitle?: string;
  raw?: any;
}

export function parseExcelFile(file: File): Promise<ParsedExcelRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!jsonData || jsonData.length === 0) {
          throw new Error('File Excel kosong atau tidak terbaca.');
        }

        // Detect header row index
        let headerRowIndex = 0;
        let colMap = {
          name: -1,
          className: -1,
          videoUrl: -1,
          videoTitle: -1,
        };

        for (let r = 0; r < Math.min(jsonData.length, 10); r++) {
          const row = jsonData[r];
          if (Array.isArray(row)) {
            for (let c = 0; c < row.length; c++) {
              const cell = String(row[c] || '').toLowerCase().trim();
              if (cell.includes('nama') || cell.includes('siswa') || cell.includes('student') || cell.includes('peserta')) {
                colMap.name = c;
              }
              if (cell.includes('kelas') || cell.includes('class') || cell.includes('rombel') || cell.includes('tingkat')) {
                colMap.className = c;
              }
              if (cell.includes('link') || cell.includes('url') || cell.includes('tautan') || cell.includes('video') || cell.includes('vlog') || cell.includes('youtube')) {
                colMap.videoUrl = c;
              }
              if (cell.includes('judul') || cell.includes('title') || cell.includes('topik') || cell.includes('tema vlog')) {
                colMap.videoTitle = c;
              }
            }
            if (colMap.name !== -1 && (colMap.videoUrl !== -1 || colMap.className !== -1)) {
              headerRowIndex = r;
              break;
            }
          }
        }

        // Fallbacks if no header detected
        if (colMap.name === -1) colMap.name = 0;
        if (colMap.className === -1) colMap.className = 1;
        if (colMap.videoUrl === -1) colMap.videoUrl = 2;
        if (colMap.videoTitle === -1 && jsonData[0]?.length > 3) colMap.videoTitle = 3;

        const results: ParsedExcelRow[] = [];

        for (let r = headerRowIndex + 1; r < jsonData.length; r++) {
          const row = jsonData[r];
          if (!row || !Array.isArray(row)) continue;

          const name = String(row[colMap.name] || '').trim();
          const className = String(row[colMap.className] || 'X MIPA 1').trim();
          let videoUrl = String(row[colMap.videoUrl] || '').trim();
          const videoTitle = colMap.videoTitle !== -1 && row[colMap.videoTitle] ? String(row[colMap.videoTitle]).trim() : undefined;

          // If URL looks like it got swapped with name or class, attempt smart check
          if (!videoUrl && name.startsWith('http')) {
            videoUrl = name;
          }

          if (name || videoUrl) {
            results.push({
              name: name || `Siswa ${results.length + 1}`,
              className: className || 'Kelas Umum',
              videoUrl: videoUrl,
              videoTitle: videoTitle || (name ? `Vlog ${name}` : 'Tugas Vlog'),
              raw: row,
            });
          }
        }

        if (results.length === 0) {
          throw new Error('Tidak ditemukan data baris siswa yang valid di file Excel.');
        }

        resolve(results);
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

export function downloadExcelTemplate(withSampleData = false) {
  const wsData = [
    ['No', 'Nama Siswa', 'Kelas', 'Link Video Vlog', 'Judul Video Vlog (Opsional)', 'Catatan Guru (Opsional)'],
  ];

  if (withSampleData) {
    wsData.push(
      ['1', 'Rian Hidayat', 'X MIPA 1', 'https://www.youtube.com/watch?v=ScMzIvxBSi4', 'Vlog Percobaan Biogas Rumah Tangga', ''],
      ['2', 'Nabila Zahra', 'X MIPA 1', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Dokumenter Sanggar Tari Jaipong Tradisional', ''],
      ['3', 'Dimas Prasetyo', 'X MIPA 2', 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', 'Inovasi Penjernihan Air Sederhana Berbahan Pasir Zeolit', ''],
      ['4', 'Sarah Amalia', 'XI IPS 1', 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ', 'Pemberdayaan Ekonomi Ibu-Ibu Pengrajin Ketupat', '']
    );
  } else {
    wsData.push(
      ['1', 'Contoh Nama Siswa 1', 'X MIPA 1', 'https://www.youtube.com/watch?v=...', 'Judul Vlog Siswa', ''],
      ['2', 'Contoh Nama Siswa 2', 'X MIPA 2', 'https://youtu.be/...', 'Judul Vlog Siswa', '']
    );
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 28 }, // Nama
    { wch: 15 }, // Kelas
    { wch: 45 }, // Link
    { wch: 40 }, // Judul
    { wch: 30 }, // Catatan
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data_Vlog_Siswa');

  const fileName = withSampleData ? 'Template_Contoh_Data_Vlog_Siswa.xlsx' : 'Template_Format_Input_Vlog_Siswa.xlsx';
  XLSX.writeFile(wb, fileName);
}

export function exportRecapToExcel(
  students: StudentVlogEntry[],
  settings: AssignmentSettings,
  filteredClass?: string
) {
  const titleRow = [`REKAPITULASI HASIL PENILAIAN OTOMATIS VLOG SISWA`];
  const schoolRow = [`Satuan Pendidikan: ${settings.schoolName || 'Sekolah Menengah Atas'}`];
  const subjectRow = [`Mata Pelajaran: ${settings.subjectName || 'Multimedia / P5'}`];
  const themeRow = [`Tema Tugas: ${settings.theme}`];
  const teacherRow = [`Guru Penilai: ${settings.teacherName || 'Guru Pengampu'}`];
  const classFilterRow = [`Filter Kelas: ${filteredClass && filteredClass !== 'all' ? filteredClass : 'Semua Kelas'}`];
  const dateRow = [`Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`];
  const emptyRow = [''];

  const headerRow = [
    'No',
    'Peringkat',
    'Nama Siswa',
    'Kelas',
    'Judul Vlog',
    'Link Video',
    `Kreativitas (${settings.weights.creativity}%)`,
    `Kualitas Audio (${settings.weights.audio}%)`,
    `Kejernihan Visual (${settings.weights.visual}%)`,
    `Kesesuaian Tema (${settings.weights.theme}%)`,
    'Skor Akhir',
    'Predikat',
    'Status KKM',
    'Komentar AI & Guru',
    'Kelebihan Siswa',
    'Saran Perbaikan',
  ];

  // Sort students by score descending for ranking
  const sorted = [...students].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));

  const dataRows = sorted.map((std, idx) => {
    const isEvaluated = std.status === 'evaluated' || std.finalScore !== undefined;
    const finalScore = isEvaluated ? (std.finalScore || 0) : '-';
    const isPassed = isEvaluated ? ((std.finalScore || 0) >= settings.passingGrade ? 'TUNTAS' : 'BELUM TUNTAS') : 'PENDING';
    const comment = std.teacherManualComment || std.overallComment || (isEvaluated ? '-' : 'Belum Dinilai');
    const strengths = std.strengths ? std.strengths.join('; ') : '-';
    const improvements = std.improvements ? std.improvements.join('; ') : '-';

    return [
      idx + 1,
      isEvaluated ? `#${idx + 1}` : '-',
      std.name,
      std.className,
      std.videoTitle || 'Tugas Vlog',
      std.videoUrl,
      std.creativityScore ?? '-',
      std.audioScore ?? '-',
      std.visualScore ?? '-',
      std.themeRelevanceScore ?? '-',
      finalScore,
      std.grade ?? '-',
      isPassed,
      comment,
      strengths,
      improvements,
    ];
  });

  // Calculate summary stats row
  const evaluatedStudents = sorted.filter(s => s.status === 'evaluated' && s.finalScore !== undefined);
  const avgScore = evaluatedStudents.length > 0 
    ? Math.round(evaluatedStudents.reduce((a, b) => a + (b.finalScore || 0), 0) / evaluatedStudents.length)
    : 0;
  const highest = evaluatedStudents.length > 0 ? Math.max(...evaluatedStudents.map(s => s.finalScore || 0)) : 0;
  const lowest = evaluatedStudents.length > 0 ? Math.min(...evaluatedStudents.map(s => s.finalScore || 0)) : 0;
  const passedCount = evaluatedStudents.filter(s => (s.finalScore || 0) >= settings.passingGrade).length;
  const passRate = evaluatedStudents.length > 0 ? Math.round((passedCount / evaluatedStudents.length) * 100) : 0;

  const statsHeader = ['', 'STATISTIK KELAS', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
  const statsRow1 = ['', 'Total Siswa Terdata:', students.length, '', 'Sudah Dinilai:', evaluatedStudents.length, '', 'Nilai Rata-rata:', avgScore, '', 'Nilai Tertinggi:', highest, '', 'Nilai Terendah:', lowest, ''];
  const statsRow2 = ['', 'Jumlah Siswa Tuntas (>= KKM):', passedCount, '', 'Persentase Ketuntasan:', `${passRate}%`, '', 'Standar KKM:', settings.passingGrade, '', '', '', '', '', ''];

  const wsData = [
    titleRow,
    schoolRow,
    subjectRow,
    themeRow,
    teacherRow,
    classFilterRow,
    dateRow,
    emptyRow,
    headerRow,
    ...dataRows,
    emptyRow,
    statsHeader,
    statsRow1,
    statsRow2,
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 5 },  // No
    { wch: 10 }, // Peringkat
    { wch: 28 }, // Nama
    { wch: 12 }, // Kelas
    { wch: 32 }, // Judul
    { wch: 35 }, // Link
    { wch: 14 }, // Kreativitas
    { wch: 14 }, // Audio
    { wch: 14 }, // Visual
    { wch: 14 }, // Tema
    { wch: 12 }, // Skor Akhir
    { wch: 10 }, // Predikat
    { wch: 14 }, // Status KKM
    { wch: 45 }, // Komentar
    { wch: 40 }, // Kelebihan
    { wch: 40 }, // Perbaikan
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekapitulasi_Nilai');

  const safeClassName = filteredClass && filteredClass !== 'all' ? `_${filteredClass.replace(/\s+/g, '_')}` : '_Semua_Kelas';
  const fileName = `Rekap_Nilai_Vlog${safeClassName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
