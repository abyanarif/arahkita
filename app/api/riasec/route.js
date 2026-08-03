import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const RIASEC_QUESTIONS = [
  {
    id: 1,
    pertanyaan: 'Saat senggang, aktivitas mana yang paling kamu nikmati?',
    opsi: [
      { text: 'Membongkar/memperbaiki barang elektronik, mesin, atau berkebun', type: 'Realistic' },
      { text: 'Membaca artikel sains, memecahkan teka-teki logika, atau menganalisis data', type: 'Investigative' },
      { text: 'Menggambar, menulis cerita, mendesain grafis, atau bermain musik', type: 'Artistic' },
      { text: 'Berdiskusi dengan teman, mengajar, atau menjadi relawan sosial', type: 'Social' },
      { text: 'Memimpin proyek, jualan produk, atau presentasi di depan kelas', type: 'Enterprising' },
      { text: 'Merapikan tabel jadwal, merapikan dokumen, atau menghitung anggaran', type: 'Conventional' }
    ]
  },
  {
    id: 2,
    pertanyaan: 'Mata pelajaran sekolah apa yang paling menarik bagimu?',
    opsi: [
      { text: 'Fisika Praktikum, Prakarya, atau Olahraga', type: 'Realistic' },
      { text: 'Matematika Peminatan, Kimia, atau Biologi', type: 'Investigative' },
      { text: 'Seni Budaya, Bahasa & Sastra, atau Desain', type: 'Artistic' },
      { text: 'Sosiologi, Psikologi Sosial, atau Bimbingan Konseling', type: 'Social' },
      { text: 'Ekonomi, Kewirausahaan, atau Bahasa Inggris Pidato', type: 'Enterprising' },
      { text: 'Akuntansi, Pengolahan Data Excel, atau Tata Kelola', type: 'Conventional' }
    ]
  },
  {
    id: 3,
    pertanyaan: 'Bagaimana caramu menyelesaikan sebuah masalah?',
    opsi: [
      { text: 'Langsung mencoba secara fisik dengan alat & peraga konkret', type: 'Realistic' },
      { text: 'Melakukan riset, mengumpulkan teori, dan analisa sistematis', type: 'Investigative' },
      { text: 'Mencari sudut pandang unik, kreatif, dan ide out-of-the-box', type: 'Artistic' },
      { text: 'Mengajak tim berdiskusi dan mendengarkan perasaan orang lain', type: 'Social' },
      { text: 'Mengambil keputusan cepat, meyakinkan orang, dan mengejar hasil', type: 'Enterprising' },
      { text: 'Membuat urutan langkah terstruktur sesuai aturan & SOP yang standar', type: 'Conventional' }
    ]
  },
  {
    id: 4,
    pertanyaan: 'Lingkungan kerja impianmu adalah tempat yang...',
    opsi: [
      { text: 'Banyak peralatan teknis, bengkel modern, atau lapangan fisik', type: 'Realistic' },
      { text: 'Laboratorium riset canggih, pusat data, atau pusat penelitian', type: 'Investigative' },
      { text: 'Studio kreatif yang fleksibel, ekspresif, dan penuh kebebasan', type: 'Artistic' },
      { text: 'Pusat pelayanan masyarakat, sekolah, atau klinik konsultasi', type: 'Social' },
      { text: 'Kantor korporasi modern, ruang meeting eksekutif, atau startup', type: 'Enterprising' },
      { text: 'Kantor keuangan yang rapi, tertata, dengan sistem terorganisir', type: 'Conventional' }
    ]
  },
  {
    id: 5,
    pertanyaan: 'Karakter utama yang paling menggambarkan dirimu adalah...',
    opsi: [
      { text: 'Praktis, mekanis, mandiri, dan tangkas', type: 'Realistic' },
      { text: 'Kritis, analitis, ingin tahu, dan rasional', type: 'Investigative' },
      { text: 'Kreatif, imajinatif, ekspresif, dan peka', type: 'Artistic' },
      { text: 'Empatis, ramah, komunikatif, dan suka membantu', type: 'Social' },
      { text: 'Ambisius, percaya diri, persuasif, dan berjiwa pemimpin', type: 'Enterprising' },
      { text: 'Teliti, teratur, disiplin, dan menghargai kepastian', type: 'Conventional' }
    ]
  },
  {
    id: 6,
    pertanyaan: 'Proyek kelompok apa yang paling membuatmu bersemangat?',
    opsi: [
      { text: 'Membuat prototipe fisik atau alat guna ulang', type: 'Realistic' },
      { text: 'Melakukan eksperimen ilmiah dan olah data statistik', type: 'Investigative' },
      { text: 'Membuat video visual, poster, dan konsep estetika', type: 'Artistic' },
      { text: 'Mengadakan acara bakti sosial atau pendampingan belajar', type: 'Social' },
      { text: 'Membuat rencana bisnis (Business Plan) dan presentasi investor', type: 'Enterprising' },
      { text: 'Menyusun laporan pembukuan rekapitulasi dan pengarsipan', type: 'Conventional' }
    ]
  },
  {
    id: 7,
    pertanyaan: 'Topik percakapan apa yang bisa membuatmu tahan berdiskusi berjam-jam?',
    opsi: [
      { text: 'Perkembangan otomotif, perkakas modern, atau arsitektur bangunan', type: 'Realistic' },
      { text: 'Penemuan medis terbaru, AI, fisika kuantum, atau fenomena alam', type: 'Investigative' },
      { text: 'Film, musik, seni rupa, tren fashion, atau novel', type: 'Artistic' },
      { text: 'Pengembangan diri, hubungan interpersonal, atau psikologi manusia', type: 'Social' },
      { text: 'Strategi investasi, kisah sukses pengusaha, dan pasar saham', type: 'Enterprising' },
      { text: 'Manajemen waktu, tips keteraturan kerja, dan efisiensi admin', type: 'Conventional' }
    ]
  },
  {
    id: 8,
    pertanyaan: 'Aplikasi atau software komputer apa yang paling sering kamu gunakan?',
    opsi: [
      { text: 'Software Simulasi Teknik, CAD, atau alat perkakas digital', type: 'Realistic' },
      { text: 'Python, SPSS, MATLAB, atau kalkulator ilmiah', type: 'Investigative' },
      { text: 'Adobe Photoshop/Illustrator, Figma, Canva, atau Premiere Pro', type: 'Artistic' },
      { text: 'Google Meet, Zoom, atau aplikasi komunitas online', type: 'Social' },
      { text: 'Notion, PowerPoint presentation, Trello, atau LinkedIn', type: 'Enterprising' },
      { text: 'Microsoft Excel, Google Sheets, atau Software Akuntansi', type: 'Conventional' }
    ]
  },
  {
    id: 9,
    pertanyaan: 'Bila kamu diberi dana $1.000 untuk sebuah proyek sekolah, kamu akan...',
    opsi: [
      { text: 'Membeli perlengkapan keras & perkakas kualitas tinggi', type: 'Realistic' },
      { text: 'Membiayai penelitian & riset laboratorium yang mendalam', type: 'Investigative' },
      { text: 'Membuat pameran seni, instalasi visual, atau pertunjukan kreatif', type: 'Artistic' },
      { text: 'Menyumbangkannya untuk program beasiswa & aksi kemanusiaan', type: 'Social' },
      { text: 'Memutar uang untuk jualan produk guna melipatgandakan keuntungan', type: 'Enterprising' },
      { text: 'Menyimpan dalam deposito aman dengan catatan pembukuan rapi', type: 'Conventional' }
    ]
  },
  {
    id: 10,
    pertanyaan: 'Saat bekerja dalam tim, peran mana yang paling alami buatmu?',
    opsi: [
      { text: 'Teknisi eksekutor yang menangani aspek teknis lapangan', type: 'Realistic' },
      { text: 'Riset analis yang memastikan akurasi data & logika', type: 'Investigative' },
      { text: 'Konseptor kreatif yang memberi sentuhan artistik & visual', type: 'Artistic' },
      { text: 'Fasilitator keharmonisan tim dan komunikasi anggota', type: 'Social' },
      { text: 'Ketua tim yang mengarahkan visi dan negosiasi', type: 'Enterprising' },
      { text: 'Sekretaris / Bendahara yang mengelola jadwal dan keuangan', type: 'Conventional' }
    ]
  }
];

export async function GET() {
  return NextResponse.json({ success: true, questions: RIASEC_QUESTIONS });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ success: false, message: 'Jawaban tidak valid' }, { status: 400 });
    }

    const counts = {
      Realistic: 0,
      Investigative: 0,
      Artistic: 0,
      Social: 0,
      Enterprising: 0,
      Conventional: 0
    };

    answers.forEach((type) => {
      if (counts[type] !== undefined) {
        counts[type] += 1;
      }
    });

    const total = answers.length || 1;

    const scores = Object.keys(counts).map((type) => ({
      trait: type,
      score: counts[type],
      percentage: Math.round((counts[type] / total) * 100)
    }));

    scores.sort((a, b) => b.score - a.score);

    const topTraits = scores.slice(0, 3).map((s) => s.trait);
    const primaryTrait = topTraits[0];

    const masterSql = `
      SELECT * FROM jurusan_info 
      WHERE kategori_riasec IN (?, ?, ?)
    `;
    const masterMajors = await query(masterSql, topTraits);

    const prodiSql = `
      SELECT p.kode_prodi, p.nama_prodi, p.jenjang, p.daya_tampung_sekarang, ptn.nama_ptn, ptn.provinsi_1
      FROM prodi p
      JOIN ptn ON p.id_ptn = ptn.id_ptn
      ORDER BY ptn.nama_ptn ASC
      LIMIT 8
    `;
    const recommendedProdis = await query(prodiSql);

    return NextResponse.json({
      success: true,
      data: {
        scores,
        topTraits,
        primaryTrait,
        masterMajors,
        recommendedProdis
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
