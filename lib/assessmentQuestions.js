/**
 * assessmentQuestions.js
 * ─────────────────────────────────────────────────────────────────
 * ArahKita / Smart Choose 2026 — Bank Soal Assessment Multi-Dimensi
 *
 * 5 Modul × Assessment → 26 Dimensi Student Vector
 *
 * Modul A: RIASEC Likert 1-5       (18 soal → dim 0-5)
 * Modul B: Akademik Proxy           (6  soal → dim 6-11)
 * Modul C: Gaya Kerja SJT           (6  skenario → dim 12-17)
 * Modul D: Nilai Personal Ipsative  (6  pasang → dim 18-23)
 * Modul E: Preferensi Karir         (4  soal → dim 24-25)
 * ─────────────────────────────────────────────────────────────────
 */

// ──────────────────────────────────────────────────────────────────
// MODUL A: RIASEC (Likert 1-5)
// ──────────────────────────────────────────────────────────────────
// Setiap soal punya skala 1-5 (Sangat Tidak Setuju → Sangat Setuju)
// 3 soal per tipe RIASEC × 6 tipe = 18 soal
// Skor per kategori: sum(likert per 3 soal), max = 15

export const MODULE_A_RIASEC = [
  // ── REALISTIC (3 soal) ─────────────────────────────────────────
  {
    id: 'A1',
    module: 'A',
    category: 'Realistic',
    pertanyaan: 'Saya senang merakit, memperbaiki, atau bekerja langsung dengan mesin, alat, atau perangkat elektronik.',
    type: 'likert',
    scale: 5,
  },
  {
    id: 'A2',
    module: 'A',
    category: 'Realistic',
    pertanyaan: 'Saya lebih suka pekerjaan fisik atau lapangan yang nyata daripada hanya duduk di depan komputer seharian.',
    type: 'likert',
    scale: 5,
  },
  {
    id: 'A3',
    module: 'A',
    category: 'Realistic',
    pertanyaan: 'Saya tertarik dengan bidang teknik konstruksi, otomotif, elektronika, pertanian, atau kehutanan.',
    type: 'likert',
    scale: 5,
  },
  // ── INVESTIGATIVE (3 soal) ─────────────────────────────────────
  {
    id: 'A4',
    module: 'A',
    category: 'Investigative',
    pertanyaan: 'Saya menikmati menganalisis data, memecahkan soal matematika, atau meneliti fenomena alam secara mendalam.',
    type: 'likert',
    scale: 5,
  },
  {
    id: 'A5',
    module: 'A',
    category: 'Investigative',
    pertanyaan: 'Saya gemar membaca jurnal ilmiah, melakukan eksperimen, atau mencari penjelasan ilmiah di balik suatu kejadian.',
    type: 'likert',
    scale: 5,
  },
  {
    id: 'A6',
    module: 'A',
    category: 'Investigative',
    pertanyaan: 'Saya tertarik mempelajari ilmu kedokteran, biologi, fisika, kimia, atau ilmu komputer secara serius dan mendalam.',
    type: 'likert',
    scale: 5,
  },
  // ── ARTISTIC (3 soal) ──────────────────────────────────────────
  {
    id: 'A7',
    module: 'A',
    category: 'Artistic',
    pertanyaan: 'Saya suka mengekspresikan diri melalui seni rupa, desain grafis, tulisan kreatif, musik, atau pertunjukan.',
    type: 'likert',
    scale: 5,
  },
  {
    id: 'A8',
    module: 'A',
    category: 'Artistic',
    pertanyaan: 'Saya menikmati kegiatan menggambar, fotografi, membuat film, menulis fiksi/puisi, atau memainkan alat musik.',
    type: 'likert',
    scale: 5,
  },
  {
    id: 'A9',
    module: 'A',
    category: 'Artistic',
    pertanyaan: 'Saya lebih suka pekerjaan yang mengutamakan kreativitas dan kebebasan berekspresi daripada aturan dan prosedur ketat.',
    type: 'likert',
    scale: 5,
  },
  // ── SOCIAL (3 soal) ────────────────────────────────────────────
  {
    id: 'A10',
    module: 'A',
    category: 'Social',
    pertanyaan: 'Saya senang membantu, mengajar, membimbing, menasihati, atau merawat orang lain secara langsung.',
    type: 'likert',
    scale: 5,
  },
  {
    id: 'A11',
    module: 'A',
    category: 'Social',
    pertanyaan: 'Saya peduli dengan isu-isu sosial kemasyarakatan dan aktif dalam kegiatan komunitas, organisasi, atau kegiatan sosial.',
    type: 'likert',
    scale: 5,
  },
  {
    id: 'A12',
    module: 'A',
    category: 'Social',
    pertanyaan: 'Saya tertarik berkarir di bidang pendidikan, psikologi, keperawatan, pekerjaan sosial, atau konseling.',
    type: 'likert',
    scale: 5,
  },
  // ── ENTERPRISING (3 soal) ──────────────────────────────────────
  {
    id: 'A13',
    module: 'A',
    category: 'Enterprising',
    pertanyaan: 'Saya suka memimpin tim, bernegosiasi, membujuk orang lain, atau mengelola sebuah bisnis/proyek dari awal.',
    type: 'likert',
    scale: 5,
  },
  {
    id: 'A14',
    module: 'A',
    category: 'Enterprising',
    pertanyaan: 'Saya ambisius, berani mengambil risiko yang diperhitungkan, dan menyukai tantangan kompetitif.',
    type: 'likert',
    scale: 5,
  },
  {
    id: 'A15',
    module: 'A',
    category: 'Enterprising',
    pertanyaan: 'Saya tertarik mempelajari ilmu manajemen, pemasaran, hukum bisnis, atau membangun usaha sendiri.',
    type: 'likert',
    scale: 5,
  },
  // ── CONVENTIONAL (3 soal) ──────────────────────────────────────
  {
    id: 'A16',
    module: 'A',
    category: 'Conventional',
    pertanyaan: 'Saya menyukai pekerjaan yang terstruktur, sistematis, dan melibatkan pengelolaan data, dokumen, atau keuangan.',
    type: 'likert',
    scale: 5,
  },
  {
    id: 'A17',
    module: 'A',
    category: 'Conventional',
    pertanyaan: 'Saya teliti, rapi, dan lebih nyaman mengikuti prosedur dan instruksi yang sudah jelas daripada berimprovisasi.',
    type: 'likert',
    scale: 5,
  },
  {
    id: 'A18',
    module: 'A',
    category: 'Conventional',
    pertanyaan: 'Saya tertarik berkarir di bidang akuntansi, administrasi, perbankan, teknologi informasi, atau statistik.',
    type: 'likert',
    scale: 5,
  },
];

// ──────────────────────────────────────────────────────────────────
// MODUL B: AKADEMIK PROXY (Self-Report Nilai Rapor)
// ──────────────────────────────────────────────────────────────────
// Siswa memasukkan nilai rata-rata per mata pelajaran (0-100)
// Dipakai untuk mengisi dimensi 6-11 student_vector

export const MODULE_B_AKADEMIK = [
  {
    id: 'B1',
    module: 'B',
    dimension: 'matematika',
    pertanyaan: 'Berapa rata-rata nilai Matematika kamu dari Semester 1 hingga Semester 5?',
    type: 'number_input',
    min: 0,
    max: 100,
    placeholder: 'Misal: 85',
    hint: 'Masukkan nilai rata-rata Matematika (Wajib & Peminatan jika ada)',
  },
  {
    id: 'B2',
    module: 'B',
    dimension: 'fisika',
    pertanyaan: 'Berapa rata-rata nilai Fisika kamu? (Isi 0 jika tidak mengambil Fisika)',
    type: 'number_input',
    min: 0,
    max: 100,
    placeholder: 'Misal: 80',
    hint: 'Nilai Fisika sangat relevan untuk jurusan teknik dan sains murni',
  },
  {
    id: 'B3',
    module: 'B',
    dimension: 'kimia',
    pertanyaan: 'Berapa rata-rata nilai Kimia kamu? (Isi 0 jika tidak mengambil Kimia)',
    type: 'number_input',
    min: 0,
    max: 100,
    placeholder: 'Misal: 78',
    hint: 'Nilai Kimia relevan untuk jurusan farmasi, kedokteran, dan teknik kimia',
  },
  {
    id: 'B4',
    module: 'B',
    dimension: 'biologi',
    pertanyaan: 'Berapa rata-rata nilai Biologi kamu? (Isi 0 jika tidak mengambil Biologi)',
    type: 'number_input',
    min: 0,
    max: 100,
    placeholder: 'Misal: 88',
    hint: 'Nilai Biologi relevan untuk jurusan kedokteran, kesehatan, dan pertanian',
  },
  {
    id: 'B5',
    module: 'B',
    dimension: 'bahasa_indo',
    pertanyaan: 'Berapa rata-rata nilai Bahasa Indonesia kamu?',
    type: 'number_input',
    min: 0,
    max: 100,
    placeholder: 'Misal: 90',
    hint: 'Nilai Bahasa Indonesia relevan untuk jurusan sastra, komunikasi, dan hukum',
  },
  {
    id: 'B6',
    module: 'B',
    dimension: 'bahasa_ing',
    pertanyaan: 'Berapa rata-rata nilai Bahasa Inggris kamu?',
    type: 'number_input',
    min: 0,
    max: 100,
    placeholder: 'Misal: 85',
    hint: 'Bahasa Inggris penting untuk hampir semua jurusan di era global',
  },
];

// ──────────────────────────────────────────────────────────────────
// MODUL C: GAYA KERJA (Situational Judgment Test / SJT)
// ──────────────────────────────────────────────────────────────────
// 6 skenario, tiap skenario ada 4 pilihan (a/b/c/d)
// Tiap pilihan memberikan poin ke dimensi gaya kerja tertentu
// Dimensi: outdoor, teamwork, analytical, creative, leadership, detail_oriented

export const MODULE_C_GAYA_KERJA = [
  {
    id: 'C1',
    module: 'C',
    pertanyaan: 'Kamu ditugaskan menyelesaikan proyek besar dalam tim. Bagaimana cara kamu berkontribusi?',
    type: 'single_choice',
    opsi: [
      { text: 'Aku langsung mengambil alih koordinasi tim dan membagi tugas secara jelas.', dimensi: 'leadership', poin: 1 },
      { text: 'Aku fokus pada bagian analisis data dan riset mendalam untuk mendukung keputusan tim.', dimensi: 'analytical', poin: 1 },
      { text: 'Aku menyumbangkan ide-ide kreatif dan inovatif untuk solusi yang belum pernah dicoba.', dimensi: 'creative', poin: 1 },
      { text: 'Aku memastikan semua dokumentasi, deadline, dan prosedur berjalan rapi dan teratur.', dimensi: 'detail_oriented', poin: 1 },
    ],
  },
  {
    id: 'C2',
    module: 'C',
    pertanyaan: 'Saat ada masalah teknis kompleks yang harus diselesaikan, kamu biasanya...',
    type: 'single_choice',
    opsi: [
      { text: 'Langsung turun tangan dan mencoba memperbaikinya sendiri secara fisik/langsung.', dimensi: 'outdoor', poin: 1 },
      { text: 'Mengumpulkan semua informasi terlebih dahulu, menganalisis pola, lalu membuat rencana solusi.', dimensi: 'analytical', poin: 1 },
      { text: 'Berdiskusi dengan anggota tim untuk menemukan solusi bersama.', dimensi: 'teamwork', poin: 1 },
      { text: 'Mengecek semua checklist dan SOP yang ada sebelum mengambil tindakan.', dimensi: 'detail_oriented', poin: 1 },
    ],
  },
  {
    id: 'C3',
    module: 'C',
    pertanyaan: 'Jika kamu punya waktu luang 2 jam di tempat kerja, kamu paling mungkin menghabiskannya dengan...',
    type: 'single_choice',
    opsi: [
      { text: 'Keluar, inspeksi lapangan, atau meninjau progres proyek secara langsung di lokasi.', dimensi: 'outdoor', poin: 1 },
      { text: 'Membuat konten kreatif, desain, atau ide-ide baru untuk proyek berikutnya.', dimensi: 'creative', poin: 1 },
      { text: 'Ngobrol dan berkolaborasi dengan rekan untuk saling berbagi pengetahuan.', dimensi: 'teamwork', poin: 1 },
      { text: 'Menganalisis data dan membuat laporan yang lebih akurat dan terperinci.', dimensi: 'analytical', poin: 1 },
    ],
  },
  {
    id: 'C4',
    module: 'C',
    pertanyaan: 'Dalam situasi presentasi penting kepada klien besar, peran yang paling natural untukmu adalah...',
    type: 'single_choice',
    opsi: [
      { text: 'Menjadi pembicara utama, memimpin presentasi, dan meyakinkan klien.', dimensi: 'leadership', poin: 1 },
      { text: 'Menyiapkan visualisasi, desain slide, dan materi kreatif yang memukau.', dimensi: 'creative', poin: 1 },
      { text: 'Memastikan semua data, angka, dan fakta dalam presentasi sudah akurat 100%.', dimensi: 'detail_oriented', poin: 1 },
      { text: 'Mendukung tim dan menjawab pertanyaan teknis dari klien saat sesi tanya jawab.', dimensi: 'teamwork', poin: 1 },
    ],
  },
  {
    id: 'C5',
    module: 'C',
    pertanyaan: 'Lingkungan kerja ideal yang paling kamu bayangkan adalah...',
    type: 'single_choice',
    opsi: [
      { text: 'Di luar ruangan, di lapangan, dekat alam, atau di lokasi proyek nyata.', dimensi: 'outdoor', poin: 1 },
      { text: 'Di studio kreatif yang penuh inspirasi dan fleksibel tanpa banyak aturan kaku.', dimensi: 'creative', poin: 1 },
      { text: 'Di kantor dengan tim yang solid, sering rapat kolaborasi, dan budaya keterbukaan.', dimensi: 'teamwork', poin: 1 },
      { text: 'Di ruang kerja yang tenang, terstruktur, dengan sistem dan prosedur yang jelas.', dimensi: 'detail_oriented', poin: 1 },
    ],
  },
  {
    id: 'C6',
    module: 'C',
    pertanyaan: 'Ketika diminta untuk memimpin sebuah inisiatif baru di sekolah/organisasi, kamu...',
    type: 'single_choice',
    opsi: [
      { text: 'Antusias! Aku langsung menyusun struktur tim, rencana aksi, dan delegasi tugas.', dimensi: 'leadership', poin: 1 },
      { text: 'Aku riset mendalam dulu, kumpulkan data, sebelum memutuskan langkah apapun.', dimensi: 'analytical', poin: 1 },
      { text: 'Aku mengajak semua anggota berdiskusi terlebih dahulu untuk mendapat masukan semua pihak.', dimensi: 'teamwork', poin: 1 },
      { text: 'Aku merancang timeline, checklist, dan sistem monitoring yang terperinci sebelum mulai.', dimensi: 'detail_oriented', poin: 1 },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────
// MODUL D: NILAI PERSONAL (Ipsative Forced-Choice)
// ──────────────────────────────────────────────────────────────────
// 6 pasang nilai, tiap pasang pilih A atau B
// Tiap pilihan menambah poin ke dimensi nilai personal tertentu
// Dimensi: autonomy, stability, helping_others, innovation, prestige, social_impact

export const MODULE_D_NILAI_PERSONAL = [
  {
    id: 'D1',
    module: 'D',
    pertanyaan: 'Mana yang lebih penting bagimu dalam karir?',
    type: 'forced_choice',
    opsiA: { text: 'Kebebasan untuk bekerja mandiri dan mengatur sendiri cara kerjaku.', dimensi: 'autonomy' },
    opsiB: { text: 'Stabilitas penghasilan dan jaminan kerja yang pasti jangka panjang.', dimensi: 'stability' },
  },
  {
    id: 'D2',
    module: 'D',
    pertanyaan: 'Mana yang lebih memberimu kepuasan mendalam?',
    type: 'forced_choice',
    opsiA: { text: 'Membuat terobosan inovasi baru yang belum pernah ada sebelumnya.', dimensi: 'innovation' },
    opsiB: { text: 'Langsung membantu orang lain dan melihat dampak positif nyata di kehidupan mereka.', dimensi: 'helping_others' },
  },
  {
    id: 'D3',
    module: 'D',
    pertanyaan: 'Saat memilih pekerjaan pertama, kamu akan lebih mempertimbangkan...',
    type: 'forced_choice',
    opsiA: { text: 'Gengsi/prestise perusahaan atau jabatan — nama besar yang aku bisa banggakan.', dimensi: 'prestige' },
    opsiB: { text: 'Dampak sosial pekerjaan itu — seberapa nyata kontribusiku untuk masyarakat luas.', dimensi: 'social_impact' },
  },
  {
    id: 'D4',
    module: 'D',
    pertanyaan: 'Dalam 10 tahun ke depan, kamu lebih ingin dikenal sebagai...',
    type: 'forced_choice',
    opsiA: { text: 'Orang yang selalu konsisten, dapat diandalkan, dan memiliki track record yang stabil.', dimensi: 'stability' },
    opsiB: { text: 'Orang yang berani berinovasi, menciptakan hal baru, dan memimpin perubahan.', dimensi: 'innovation' },
  },
  {
    id: 'D5',
    module: 'D',
    pertanyaan: 'Saat ada pilihan proyek, kamu lebih memilih proyek yang...',
    type: 'forced_choice',
    opsiA: { text: 'Memberi kebebasan penuh untuk bereksplorasi dan berkreasi tanpa batas yang ketat.', dimensi: 'autonomy' },
    opsiB: { text: 'Punya dampak nyata bagi komunitas atau kelompok masyarakat yang membutuhkan.', dimensi: 'social_impact' },
  },
  {
    id: 'D6',
    module: 'D',
    pertanyaan: 'Menurutmu, tolak ukur keberhasilan karir yang paling bermakna adalah...',
    type: 'forced_choice',
    opsiA: { text: 'Diakui sebagai ahli terkemuka dan sosok yang dihormati di bidangku.', dimensi: 'prestige' },
    opsiB: { text: 'Bisa membantu, mendukung, atau mempermudah kehidupan orang banyak secara langsung.', dimensi: 'helping_others' },
  },
];

// ──────────────────────────────────────────────────────────────────
// MODUL E: PREFERENSI KARIR & REALITAS (4 soal)
// ──────────────────────────────────────────────────────────────────
// Mengisi dimensi 24-25 student_vector
// Soal berbentuk slider konseptual atau binary choice

export const MODULE_E_PREFERENSI_KARIR = [
  {
    id: 'E1',
    module: 'E',
    dimension: 'industri_vs_publik',
    pertanyaan: 'Setelah lulus, di sektor mana kamu lebih ingin berkarir?',
    type: 'binary_scale',
    labelA: 'Sektor Publik / Pemerintahan / NGO',
    labelB: 'Sektor Swasta / Startup / Korporasi',
    hint: 'Pilihanmu membantu kami mencocokkan prodi dengan track karir yang relevan',
    // value 0 = sepenuhnya publik, 1 = sepenuhnya swasta/industri
  },
  {
    id: 'E2',
    module: 'E',
    dimension: 'gaji_vs_passion',
    pertanyaan: 'Dalam memilih karir jangka panjang, mana yang lebih kamu prioritaskan?',
    type: 'binary_scale',
    labelA: 'Passion & Makna (meski gaji lebih rendah)',
    labelB: 'Gaji & Stabilitas Finansial (meski kurang passion)',
    hint: 'Tidak ada jawaban benar/salah — ini tentang prioritas hidupmu',
    // value 0 = passion, 1 = gaji
  },
  {
    id: 'E3',
    module: 'E',
    dimension: 'industri_vs_publik', // kontributor tambahan ke dim 24
    pertanyaan: 'Bagaimana pandanganmu tentang wirausaha atau membangun startup?',
    type: 'single_choice',
    opsi: [
      { text: 'Sangat menarik! Aku ingin membangun bisnis sendiri di masa depan.', value: 1.0 },
      { text: 'Menarik, tapi aku lebih prefer bekerja dulu di perusahaan mapan.', value: 0.7 },
      { text: 'Kurang tertarik — aku lebih suka karir yang stabil dan terstruktur.', value: 0.3 },
      { text: 'Tidak tertarik sama sekali dengan dunia bisnis/wirausaha.', value: 0.0 },
    ],
  },
  {
    id: 'E4',
    module: 'E',
    dimension: 'gaji_vs_passion', // kontributor tambahan ke dim 25
    pertanyaan: 'Jika harus memilih satu, karir impian idealmu adalah yang...',
    type: 'single_choice',
    opsi: [
      { text: 'Aku sangat cintai pekerjaannya, meski gajinya standar/sedang.', value: 0.1 },
      { text: 'Cukup aku nikmati dan gajinya di atas rata-rata (balance).', value: 0.4 },
      { text: 'Gajinya sangat tinggi, meski pekerjaannya biasa-biasa saja bagiku.', value: 0.8 },
      { text: 'Gaji tertinggi yang bisa kuraih, apapun bidangnya.', value: 1.0 },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────
// EXPORT: SEMUA MODUL TERGABUNG
// ──────────────────────────────────────────────────────────────────

export const ASSESSMENT_MODULES = {
  A: {
    id: 'A',
    title: 'Minat & Kepribadian (RIASEC)',
    description: 'Ukur tipe kepribadian Holland kamu melalui 18 pernyataan. Pilih seberapa cocok setiap pernyataan mencerminkan dirimu.',
    icon: 'Brain',
    color: '#3157AC',
    questions: MODULE_A_RIASEC,
    totalQuestions: MODULE_A_RIASEC.length,
  },
  B: {
    id: 'B',
    title: 'Profil Akademik',
    description: 'Masukkan nilai rata-rata rapor kamu per mata pelajaran. Data ini membantu kami menemukan prodi yang sesuai kemampuanmu.',
    icon: 'BookOpen',
    color: '#10B981',
    questions: MODULE_B_AKADEMIK,
    totalQuestions: MODULE_B_AKADEMIK.length,
  },
  C: {
    id: 'C',
    title: 'Gaya Kerja & Lingkungan',
    description: '6 skenario situasional. Pilih respons yang paling alami bagi kamu — tidak ada jawaban benar atau salah.',
    icon: 'Briefcase',
    color: '#F5A623',
    questions: MODULE_C_GAYA_KERJA,
    totalQuestions: MODULE_C_GAYA_KERJA.length,
  },
  D: {
    id: 'D',
    title: 'Nilai & Prioritas Hidup',
    description: '6 pasang nilai. Untuk tiap pasang, pilih satu yang lebih penting bagimu. Pilih dengan jujur sesuai hati nurani.',
    icon: 'Heart',
    color: '#EC4899',
    questions: MODULE_D_NILAI_PERSONAL,
    totalQuestions: MODULE_D_NILAI_PERSONAL.length,
  },
  E: {
    id: 'E',
    title: 'Preferensi Karir',
    description: '4 pertanyaan tentang ekspektasi karir masa depanmu — sektor, prioritas finansial, dan visi jangka panjang.',
    icon: 'Target',
    color: '#8B5CF6',
    questions: MODULE_E_PREFERENSI_KARIR,
    totalQuestions: MODULE_E_PREFERENSI_KARIR.length,
  },
};

export const MODULE_ORDER = ['A', 'B', 'C', 'D', 'E'];
export const TOTAL_MODULES = MODULE_ORDER.length;
export const TOTAL_QUESTIONS = Object.values(ASSESSMENT_MODULES).reduce(
  (sum, m) => sum + m.totalQuestions,
  0
);

// ──────────────────────────────────────────────────────────────────
// SCORE CALCULATOR: Konversi jawaban mentah ke skor per dimensi
// ──────────────────────────────────────────────────────────────────

/**
 * Hitung skor per modul dari jawaban mentah.
 *
 * @param {object} rawAnswers - { A: { A1: 4, A2: 3, ... }, B: { B1: 85, ... }, C: { C1: 'teamwork', ... }, D: { D1: 'A', ... }, E: { E1: 0.8, ... } }
 * @returns {object} { moduleA: { Realistic: 12, Investigative: 8, ... }, moduleB: { matematika: 85, ... }, moduleC: { teamwork: 2, ... }, moduleD: { autonomy: 2, ... }, moduleE: { industri_vs_publik: 0.8, gaji_vs_passion: 0.4 } }
 */
export function calculateModuleScores(rawAnswers) {
  const result = {
    moduleA: {
      Realistic: 0, Investigative: 0, Artistic: 0,
      Social: 0, Enterprising: 0, Conventional: 0,
    },
    moduleB: {
      matematika: 0, fisika: 0, kimia: 0,
      biologi: 0, bahasa_indo: 0, bahasa_ing: 0,
    },
    moduleC: {
      outdoor: 0, teamwork: 0, analytical: 0,
      creative: 0, leadership: 0, detail_oriented: 0,
    },
    moduleD: {
      autonomy: 0, stability: 0, helping_others: 0,
      innovation: 0, prestige: 0, social_impact: 0,
    },
    moduleE: {
      industri_vs_publik: 0.5,
      gaji_vs_passion: 0.5,
    },
  };

  const answersA = rawAnswers.A || {};
  const answersB = rawAnswers.B || {};
  const answersC = rawAnswers.C || {};
  const answersD = rawAnswers.D || {};
  const answersE = rawAnswers.E || {};

  // ── Modul A: sum Likert per kategori ──
  MODULE_A_RIASEC.forEach((q) => {
    const val = parseInt(answersA[q.id] || 0, 10);
    result.moduleA[q.category] = (result.moduleA[q.category] || 0) + val;
  });

  // ── Modul B: nilai rapor langsung ──
  MODULE_B_AKADEMIK.forEach((q) => {
    result.moduleB[q.dimension] = parseFloat(answersB[q.id] || 0);
  });

  // ── Modul C: hitung poin per dimensi gaya kerja ──
  MODULE_C_GAYA_KERJA.forEach((q) => {
    const chosen = answersC[q.id]; // string dimensi yang dipilih
    if (chosen && result.moduleC[chosen] !== undefined) {
      result.moduleC[chosen] += 1;
    }
  });

  // ── Modul D: hitung poin per dimensi nilai personal ──
  MODULE_D_NILAI_PERSONAL.forEach((q) => {
    const chosen = answersD[q.id]; // 'A' or 'B'
    const dimensi = chosen === 'A' ? q.opsiA?.dimensi : q.opsiB?.dimensi;
    if (dimensi && result.moduleD[dimensi] !== undefined) {
      result.moduleD[dimensi] += 1;
    }
  });

  // ── Modul E: preferensi karir ──
  // E1 dan E3 → industri_vs_publik (average)
  const e1Val = typeof answersE['E1'] === 'number' ? answersE['E1'] : 0.5;
  const e3Val = typeof answersE['E3'] === 'number' ? answersE['E3'] : 0.5;
  result.moduleE.industri_vs_publik = (e1Val + e3Val) / 2;

  // E2 dan E4 → gaji_vs_passion (average)
  const e2Val = typeof answersE['E2'] === 'number' ? answersE['E2'] : 0.5;
  const e4Val = typeof answersE['E4'] === 'number' ? answersE['E4'] : 0.5;
  result.moduleE.gaji_vs_passion = (e2Val + e4Val) / 2;

  return result;
}

/**
 * Hitung RIASEC result dari moduleA scores.
 * @param {object} moduleAScores - { Realistic: 12, Investigative: 8, ... }
 * @returns {object} { topTraits: ['Investigative', 'Realistic', 'Artistic'], scores: {...}, topHollandCode: 'IRA' }
 */
export function calculateRiasecResult(moduleAScores) {
  const entries = Object.entries(moduleAScores)
    .map(([trait, raw]) => ({
      trait,
      raw,
      percentage: Math.round(Math.min(100, (raw / 15) * 100)),
    }))
    .sort((a, b) => b.raw - a.raw);

  const topTraits = entries.slice(0, 3).map((e) => e.trait);
  const RIASEC_CODE = { Realistic: 'R', Investigative: 'I', Artistic: 'A', Social: 'S', Enterprising: 'E', Conventional: 'C' };
  const topHollandCode = topTraits.map((t) => RIASEC_CODE[t] || t[0]).join('');

  const scoresObj = {};
  entries.forEach((e) => { scoresObj[e.trait] = e.raw; });

  return { topTraits, scores: scoresObj, scoreEntries: entries, topHollandCode };
}
