import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AssignmentSettings, StudentVlogEntry } from '../types';

export function exportRecapToPdf(
  students: StudentVlogEntry[],
  settings: AssignmentSettings,
  filteredClass?: string
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const evaluatedStudents = students.filter(s => s.status === 'evaluated' && s.finalScore !== undefined);
  const sorted = [...students].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));

  const avgScore = evaluatedStudents.length > 0
    ? Math.round(evaluatedStudents.reduce((a, b) => a + (b.finalScore || 0), 0) / evaluatedStudents.length)
    : 0;
  const highest = evaluatedStudents.length > 0 ? Math.max(...evaluatedStudents.map(s => s.finalScore || 0)) : 0;
  const lowest = evaluatedStudents.length > 0 ? Math.min(...evaluatedStudents.map(s => s.finalScore || 0)) : 0;
  const passedCount = evaluatedStudents.filter(s => (s.finalScore || 0) >= settings.passingGrade).length;
  const passRate = evaluatedStudents.length > 0 ? Math.round((passedCount / evaluatedStudents.length) * 100) : 0;

  // Header Banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN REKAPITULASI PENILAIAN VLOG SISWA', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`${settings.schoolName || 'Satuan Pendidikan'} • ${settings.subjectName || 'Multimedia & P5'}`, 14, 18);
  doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, pageWidth - 14, 18, { align: 'right' });

  // Metadata Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 33, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Tema Tugas:', 18, 39);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.theme, 42, 39);

  doc.setFont('helvetica', 'bold');
  doc.text('Guru Penilai:', 18, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.teacherName || 'Guru Pengampu', 42, 45);

  doc.setFont('helvetica', 'bold');
  doc.text('Filter Rombel:', 18, 51);
  doc.setFont('helvetica', 'normal');
  doc.text(filteredClass && filteredClass !== 'all' ? filteredClass : 'Semua Kelas', 42, 51);

  // Mini summary badges on right side of card
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Siswa: ${students.length}`, 160, 39);
  doc.text(`Ter-evaluasi: ${evaluatedStudents.length}/${students.length}`, 160, 45);
  doc.text(`Rata-rata: ${avgScore}`, 160, 51);

  doc.text(`Nilai Tertinggi: ${highest}`, 215, 39);
  doc.text(`Nilai Terendah: ${lowest}`, 215, 45);
  doc.text(`Kelulusan KKM (${settings.passingGrade}): ${passRate}%`, 215, 51);

  // Table Data Preparation
  const tableRows = sorted.map((std, idx) => {
    const isEval = std.status === 'evaluated' && std.finalScore !== undefined;
    const finalScore = isEval ? String(std.finalScore) : '-';
    const predikat = isEval ? (std.grade || '-') : '-';
    const statusKkm = isEval ? ((std.finalScore || 0) >= settings.passingGrade ? 'Tuntas' : 'Belum') : 'Pending';
    const comment = std.teacherManualComment || std.overallComment || (isEval ? '-' : 'Menunggu Penilaian AI');

    return [
      idx + 1,
      isEval ? `#${idx + 1}` : '-',
      std.name,
      std.className,
      std.videoTitle || 'Tugas Vlog',
      std.creativityScore ?? '-',
      std.audioScore ?? '-',
      std.visualScore ?? '-',
      std.themeRelevanceScore ?? '-',
      finalScore,
      predikat,
      statusKkm,
      comment,
    ];
  });

  autoTable(doc, {
    startY: 60,
    head: [[
      'No',
      'Rank',
      'Nama Siswa',
      'Kelas',
      'Judul Vlog',
      `Kreativitas\n(${settings.weights.creativity}%)`,
      `Audio\n(${settings.weights.audio}%)`,
      `Visual\n(${settings.weights.visual}%)`,
      `Tema\n(${settings.weights.theme}%)`,
      'Skor\nAkhir',
      'Grade',
      'Status',
      'Komentar & Ulasan Guru / AI',
    ]],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      valign: 'middle',
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [79, 70, 229], // Indigo-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', cellWidth: 10 },
      2: { fontStyle: 'bold', cellWidth: 36 },
      3: { halign: 'center', cellWidth: 16 },
      4: { cellWidth: 40 },
      5: { halign: 'center', cellWidth: 16 },
      6: { halign: 'center', cellWidth: 14 },
      7: { halign: 'center', cellWidth: 14 },
      8: { halign: 'center', cellWidth: 14 },
      9: { halign: 'center', fontStyle: 'bold', cellWidth: 14 },
      10: { halign: 'center', fontStyle: 'bold', cellWidth: 12 },
      11: { halign: 'center', cellWidth: 14 },
      12: { cellWidth: 'auto' },
    },
    didDrawPage: (data) => {
      // Footer page numbering
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Halaman ${data.pageNumber} • Sistem Penilaian Vlog AI • ${settings.schoolName}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    },
  });

  // Teacher signature block on the last page
  const finalY = (doc as any).lastAutoTable.finalY || 160;
  if (finalY < 165) {
    const signY = finalY + 12;
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(`Mengetahui,`, pageWidth - 65, signY);
    doc.text(`Guru Pengampu / Penilai`, pageWidth - 65, signY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${settings.teacherName || 'Guru Mata Pelajaran'}`, pageWidth - 65, signY + 22);
    doc.setFont('helvetica', 'normal');
    doc.text(`NIP. ........................................`, pageWidth - 65, signY + 27);
  }

  const safeClassName = filteredClass && filteredClass !== 'all' ? `_${filteredClass.replace(/\s+/g, '_')}` : '_Semua_Kelas';
  doc.save(`Laporan_Nilai_Vlog${safeClassName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportSingleStudentPdf(
  student: StudentVlogEntry,
  settings: AssignmentSettings
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Top Header Banner
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('LEMBAR HASIL PENILAIAN VLOG SISWA', pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(224, 231, 255);
  doc.text(`${settings.schoolName || 'SMA Negeri Prestasi'} • ${settings.subjectName || 'Multimedia & P5'}`, pageWidth / 2, 22, { align: 'center' });

  // Student Profile Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 38, pageWidth - 30, 32, 3, 3, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(student.name, 22, 47);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Kelas: ${student.className} • Tanggal Penilaian: ${student.evaluatedAt ? new Date(student.evaluatedAt).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-' }`, 22, 53);
  doc.text(`Judul Vlog: "${student.videoTitle || 'Tugas Vlog Siswa'}"`, 22, 59);
  doc.text(`Link Video: ${student.videoUrl}`, 22, 65);

  // Big Score Badge
  const scoreBoxX = pageWidth - 55;
  doc.setFillColor(student.isPassed ? 236 : 254, student.isPassed ? 253 : 242, student.isPassed ? 245 : 242);
  doc.setDrawColor(student.isPassed ? 167 : 254, student.isPassed ? 243 : 202, student.isPassed ? 208 : 202);
  doc.roundedRect(scoreBoxX, 42, 32, 24, 2, 2, 'FD');

  doc.setTextColor(student.isPassed ? 5 : 185, student.isPassed ? 150 : 28, student.isPassed ? 105 : 28);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(String(student.finalScore || 0), scoreBoxX + 16, 53, { align: 'center' });
  doc.setFontSize(8);
  doc.text(`GRADE ${student.grade || '-'} • ${student.isPassed ? 'TUNTAS' : 'REMIDI'}`, scoreBoxX + 16, 61, { align: 'center' });

  // Rubric Scores Table
  autoTable(doc, {
    startY: 76,
    head: [[
      'Kriteria Penilaian Objektif',
      'Bobot',
      'Skor (0-100)',
      'Analisis & Ulasan AI Rubrik',
    ]],
    body: [
      [
        '1. Kreativitas & Orisinalitas\n(Storytelling, transisi, konsep visual)',
        `${settings.weights.creativity}%`,
        student.creativityScore ?? '-',
        student.creativityFeedback || 'Orisinalitas ide dan alur narasi dinamis.',
      ],
      [
        '2. Kualitas Audio & Vokal\n(Kejernihan vokal, balance musik latar, noise)',
        `${settings.weights.audio}%`,
        student.audioScore ?? '-',
        student.audioFeedback || 'Artikulasi pembicara dan balancing backsound.',
      ],
      [
        '3. Kejernihan Visual & Teknis\n(Resolusi, pencahayaan, kestabilan kamera)',
        `${settings.weights.visual}%`,
        student.visualScore ?? '-',
        student.visualFeedback || 'Ketajaman gambar, komposisi framing, dan lighting.',
      ],
      [
        '4. Kesesuaian Tema & Pesan\n(Relevansi tema, kedalaman materi)',
        `${settings.weights.theme}%`,
        student.themeRelevanceScore ?? '-',
        student.themeFeedback || 'Kedalaman informasi sesuai tema yang ditentukan.',
      ],
    ],
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      valign: 'middle',
      lineColor: [226, 232, 240],
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { halign: 'center', cellWidth: 18 },
      2: { halign: 'center', fontStyle: 'bold', cellWidth: 22 },
      3: { cellWidth: 'auto' },
    },
  });

  const tableEnd = (doc as any).lastAutoTable.finalY || 150;

  // Strengths & Improvements Boxes
  let currY = tableEnd + 8;
  doc.setFillColor(240, 253, 244); // Green-50
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(15, currY, (pageWidth - 34) / 2, 38, 2, 2, 'FD');

  doc.setTextColor(22, 101, 52);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Kelebihan Utama (Strengths):', 20, currY + 7);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const strengths = student.strengths || ['Penyampaian percaya diri', 'Kualitas visual sangat baik'];
  strengths.slice(0, 3).forEach((item, i) => {
    const lines = doc.splitTextToSize(`• ${item}`, (pageWidth - 34) / 2 - 10);
    doc.text(lines, 20, currY + 14 + (i * 7));
  });

  // Improvements Box
  const impX = 15 + (pageWidth - 34) / 2 + 4;
  doc.setFillColor(254, 242, 242); // Red-50
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(impX, currY, (pageWidth - 34) / 2, 38, 2, 2, 'FD');

  doc.setTextColor(153, 27, 27);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Area Perbaikan (Recommendations):', impX + 5, currY + 7);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const improvements = student.improvements || ['Perhatikan level audio latar', 'Gunakan pencahayaan lebih merata'];
  improvements.slice(0, 3).forEach((item, i) => {
    const lines = doc.splitTextToSize(`• ${item}`, (pageWidth - 34) / 2 - 10);
    doc.text(lines, impX + 5, currY + 14 + (i * 7));
  });

  // Overall Teacher/AI Feedback
  currY += 44;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, currY, pageWidth - 30, 26, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Komentar & Catatan Evaluator:', 20, currY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const commentText = student.teacherManualComment || student.overallComment || 'Terus kembangkan kemampuan storytelling dan penguasaan materi.';
  const splitComment = doc.splitTextToSize(commentText, pageWidth - 42);
  doc.text(splitComment, 20, currY + 13);

  // Signatures
  const signY = currY + 34;
  doc.setFontSize(8.5);
  doc.text('Siswa Bersangkutan,', 25, signY);
  doc.text(`${student.name}`, 25, signY + 18);

  doc.text('Guru Penilai,', pageWidth - 65, signY);
  doc.text(`${settings.teacherName || 'Guru Pengampu'}`, pageWidth - 65, signY + 18);

  doc.save(`Rapor_Nilai_Vlog_${student.name.replace(/\s+/g, '_')}.pdf`);
}
