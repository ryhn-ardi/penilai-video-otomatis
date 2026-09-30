import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Evaluate a single student vlog link
app.post('/api/evaluate-vlog', async (req, res) => {
  try {
    const {
      studentName,
      className,
      videoUrl,
      videoTitle,
      assignmentTheme,
      rubricWeights = { creativity: 25, audio: 25, visual: 25, theme: 25 },
      customInstructions = '',
      passingGrade = 75,
    } = req.body;

    if (!studentName || !videoUrl) {
      return res.status(400).json({ error: 'Nama siswa dan link video vlog wajib diisi.' });
    }

    const theme = assignmentTheme || 'Eksplorasi Budaya Lokal & Kearifan Daerah';

    const prompt = `Anda adalah seorang Penilai Ahli Video & Pendidik Multimedia Profesional untuk evaluasi tugas vlog siswa sekolah (SMP/SMA/SMK/Universitas).
Lakukan penilaian komprehensif, objektif, adil, dan konstruktif terhadap video vlog siswa berikut:

DETAIL SISWA & TUGAS:
- Nama Siswa: ${studentName}
- Kelas: ${className || 'Umum'}
- Link Video Vlog: ${videoUrl}
- Judul Video (jika ada): ${videoTitle || 'Vlog Tugas Siswa'}
- Tema Tugas yang Ditentukan: "${theme}"
- Kriteria Bobot: Kreativitas (${rubricWeights.creativity}%), Kualitas Audio (${rubricWeights.audio}%), Kejernihan Visual (${rubricWeights.visual}%), Kesesuaian Tema (${rubricWeights.theme}%)
- Standar KKM / Kelulusan: ${passingGrade}
- Instruksi Khusus Guru: ${customInstructions || 'Nilai secara teliti berdasarkan rubrik edukasi.'}

RUBRIK PENILAIAN OBJEKTIF:
1. KREATIVITAS & ORISINALITAS (Skala 0-100):
   - Alur narasi, storytelling, keunikan sudut pandang, variasi shot, transisi, pemilihan efek/musik latar, serta daya tarik pembuka (hook) dan penutup.
2. KUALITAS AUDIO (Skala 0-100):
   - Kejernihan artikulasi suara/vokal, volume seimbang (tidak terlalu kecil/pecah), keseimbangan backsound dengan suara pembicara, minim noise angin/ruangan.
3. KEJERNIHAN VISUAL & TEKNIS (Skala 0-100):
   - Ketajaman gambar/resolusi, kestabilan kamera (framing yang rapi, tidak goyang ekstrem), pencahayaan (lighting) yang cukup dan tidak backlight, konsistensi warna.
4. KESESUAIAN DENGAN TEMA & KONTEN (Skala 0-100):
   - Relevansi materi dengan tema "${theme}", kedalaman pesan yang disampaikan, akurasi informasi, kelengkapan struktur vlog (intro, isi pembahasan, pesan moral/kesimpulan).

Tugas Anda:
Analisis link dan konteks vlog tersebut secara cerdas. Berikan skor angka realistis (rentang 60-98 tergantung kualitas standar siswa), ulasan positif spesifik, area perbaikan nyata, dan komentar edukatif dalam Bahasa Indonesia yang memotivasi siswa.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah sistem penilaian vlog otomatis yang profesional, ramah, adil, dan memberikan umpan balik mendidik berstandar Kurikulum Merdeka.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            creativityScore: {
              type: Type.INTEGER,
              description: 'Nilai Kreativitas & Orisinalitas (0-100)',
            },
            creativityFeedback: {
              type: Type.STRING,
              description: 'Ulasan spesifik terkait aspek kreativitas, narasi, dan editing',
            },
            audioScore: {
              type: Type.INTEGER,
              description: 'Nilai Kualitas Audio & Vokal (0-100)',
            },
            audioFeedback: {
              type: Type.STRING,
              description: 'Ulasan spesifik terkait kejernihan suara, musik latar, dan noise',
            },
            visualScore: {
              type: Type.INTEGER,
              description: 'Nilai Kejernihan Visual & Teknis Kamera (0-100)',
            },
            visualFeedback: {
              type: Type.STRING,
              description: 'Ulasan spesifik terkait pencahayaan, framing, dan stabilitas gambar',
            },
            themeRelevanceScore: {
              type: Type.INTEGER,
              description: 'Nilai Kesesuaian dengan Tema Tugas (0-100)',
            },
            themeFeedback: {
              type: Type.STRING,
              description: 'Ulasan spesifik terkait relevansi pesan dan kedalaman materi',
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Daftar 2-3 poin kelebihan utama video vlog siswa ini',
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Daftar 2-3 poin saran perbaikan yang jelas dan dapat diterapkan',
            },
            overallComment: {
              type: Type.STRING,
              description: 'Komentar ringkas dan membangun dari guru untuk dicantumkan di rapor / rekapitulasi',
            },
            estimatedDuration: {
              type: Type.STRING,
              description: 'Estimasi durasi vlog (misal: 03:45 menit)',
            },
            presentationPace: {
              type: Type.STRING,
              description: 'Gaya penyampaian (misal: Enerjik & Percaya Diri, Santai & Terstruktur, dsb)',
            },
          },
          required: [
            'creativityScore',
            'creativityFeedback',
            'audioScore',
            'audioFeedback',
            'visualScore',
            'visualFeedback',
            'themeRelevanceScore',
            'themeFeedback',
            'strengths',
            'improvements',
            'overallComment',
          ],
        },
      },
    });

    const resultJson = JSON.parse(response.text || '{}');

    // Calculate final weighted score
    const wC = rubricWeights.creativity || 25;
    const wA = rubricWeights.audio || 25;
    const wV = rubricWeights.visual || 25;
    const wT = rubricWeights.theme || 25;
    const totalWeight = wC + wA + wV + wT;

    const weightedScore = Math.round(
      ((resultJson.creativityScore * wC) +
        (resultJson.audioScore * wA) +
        (resultJson.visualScore * wV) +
        (resultJson.themeRelevanceScore * wT)) / totalWeight
    );

    let grade = 'D';
    if (weightedScore >= 88) grade = 'A';
    else if (weightedScore >= 78) grade = 'B';
    else if (weightedScore >= 65) grade = 'C';

    const isPassed = weightedScore >= (passingGrade || 75);

    return res.json({
      success: true,
      data: {
        ...resultJson,
        finalScore: weightedScore,
        grade,
        isPassed,
        evaluatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error evaluating vlog:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Gagal melakukan penilaian AI pada video vlog.',
    });
  }
});

// Endpoint: Generate Classroom Insights & Pedagogical Summary
app.post('/api/class-insights', async (req, res) => {
  try {
    const { students = [], assignmentTheme = '', className = 'Semua Kelas' } = req.body;

    if (!students.length) {
      return res.status(400).json({ error: 'Data siswa tidak boleh kosong.' });
    }

    const prompt = `Sebagai konsultan pendidikan & pakar kurikulum, buatkan ringkasan analitik performa kelas untuk tugas vlog tema "${assignmentTheme}".
Data ringkasan kelas (${className}):
- Total Siswa: ${students.length}
- Skor rata-rata: ${Math.round(students.reduce((acc: number, s: any) => acc + (s.finalScore || 0), 0) / students.length)}
- Detail sampel nilai:
${students.slice(0, 15).map((s: any) => `- ${s.name} (${s.className}): Skor Akhir ${s.finalScore}, Kreativitas ${s.scores?.creativity || s.creativityScore}, Audio ${s.scores?.audio || s.audioScore}, Visual ${s.scores?.visual || s.visualScore}, Tema ${s.scores?.theme || s.themeRelevanceScore}`).join('\n')}

Tuliskan dalam JSON:
1. executiveSummary (Ringkasan performa umum kelas)
2. topStrengthPattern (Aspek yang paling dikuasai siswa di kelas ini)
3. commonChallengePattern (Aspek yang paling butuh pembinaan lebih lanjut)
4. teachingRecommendations (3 rekomendasi aksi untuk guru pada pertemuan berikutnya)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            topStrengthPattern: { type: Type.STRING },
            commonChallengePattern: { type: Type.STRING },
            teachingRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'executiveSummary',
            'topStrengthPattern',
            'commonChallengePattern',
            'teachingRecommendations',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating class insights:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Serve frontend in production or Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
