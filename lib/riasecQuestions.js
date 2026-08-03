// RIASEC Holland Code Standard Questions - Fallback / Constant Data
// 18 soal mencakup 6 tipe Holland Code (3 soal per tipe)
export const RIASEC_QUESTIONS = [
  // ── REALISTIC ──────────────────────────────────────────────
  {
    id: 1,
    pertanyaan: 'Saya suka merakit, memperbaiki, atau bekerja dengan mesin, alat, atau perangkat teknis.',
    category: 'Realistic',
    opsi: [
      { text: 'Sangat Sesuai dengan saya', type: 'Realistic' },
      { text: 'Cukup Sesuai dengan saya', type: 'Realistic_partial' },
      { text: 'Tidak Sesuai dengan saya', type: 'none' }
    ]
  },
  {
    id: 2,
    pertanyaan: 'Saya lebih suka melakukan pekerjaan fisik atau lapangan daripada duduk di depan meja seharian.',
    category: 'Realistic',
    opsi: [
      { text: 'Sangat Sesuai dengan saya', type: 'Realistic' },
      { text: 'Cukup Sesuai dengan saya', type: 'Realistic_partial' },
      { text: 'Tidak Sesuai dengan saya', type: 'none' }
    ]
  },
  {
    id: 3,
    pertanyaan: 'Saya tertarik dengan teknik konstruksi, elektronika, otomotif, atau pertanian/kehutanan.',
    category: 'Realistic',
    opsi: [
      { text: 'Sangat Sesuai dengan saya', type: 'Realistic' },
      { text: 'Cukup Sesuai dengan saya', type: 'Realistic_partial' },
      { text: 'Tidak Sesuai dengan saya', type: 'none' }
    ]
  },
  // ── INVESTIGATIVE ──────────────────────────────────────────
  {
    id: 4,
    pertanyaan: 'Saya senang menganalisis data, memecahkan persoalan matematika, atau melakukan penelitian sains.',
    category: 'Investigative',
    opsi: [
      { text: 'Sangat Sesuai dengan saya', type: 'Investigative' },
      { text: 'Cukup Sesuai dengan saya', type: 'Investigative_partial' },
      { text: 'Tidak Sesuai dengan saya', type: 'none' }
    ]
  },
  {
    id: 5,
    pertanyaan: 'Saya gemar membaca jurnal ilmiah, melakukan eksperimen, atau mencari tahu cara kerja suatu fenomena.',
    category: 'Investigative',
    opsi: [
      { text: 'Sangat Sesuai dengan saya', type: 'Investigative' },
      { text: 'Cukup Sesuai dengan saya', type: 'Investigative_partial' },
      { text: 'Tidak Sesuai dengan saya', type: 'none' }
    ]
  },
  {
    id: 6,
    pertanyaan: 'Saya tertarik mempelajari ilmu kedokteran, biologi, fisika, kimia, atau komputer secara mendalam.',
    category: 'Investigative',
    opsi: [
      { text: 'Sangat Sesuai dengan saya', type: 'Investigative' },
      { text: 'Cukup Sesuai dengan saya', type: 'Investigative_partial' },
      { text: 'Tidak Sesuai dengan saya', type: 'none' }
    ]
  },
  // ── ARTISTIC ───────────────────────────────────────────────
  {
    id: 7,
    pertanyaan: 'Saya suka mengekspresikan diri melalui seni rupa, desain grafis, tulisan kreatif, atau musik.',
    category: 'Artistic',
    opsi: [
      { text: 'Sangat Sesuai dengan saya', type: 'Artistic' },
      { text: 'Cukup Sesuai dengan saya', type: 'Artistic_partial' },
      { text: 'Tidak Sesuai dengan saya', type: 'none' }
    ]
  },
  {
    id: 8,
    pertanyaan: 'Saya menikmati kegiatan seperti menggambar, fotografi, membuat film, menulis cerita, atau bermain alat musik.',
    category: 'Artistic',
    opsi: [
      { text: 'Sangat Sesuai dengan saya', type: 'Artistic' },
      { text: 'Cukup Sesuai dengan saya', type: 'Artistic_partial' },
      { text: 'Tidak Sesuai dengan saya', type: 'none' }
    ]
  },
  {
    id: 9,
    pertanyaan: 'Saya lebih suka pekerjaan yang mengutamakan kreativitas dan ekspresi bebas daripada aturan ketat.',
    category: 'Artistic',
    opsi: [
      { text: 'Sangat Sesuai dengan saya', type: 'Artistic' },
      { text: 'Cukup Sesuai dengan saya', type: 'Artistic_partial' },
      { text: 'Tidak Sesuai dengan saya', type: 'none' }
    ]
  },
  // ── SOCIAL ─────────────────────────────────────────────────
  {
    id: 10,
    pertanyaan: 'Saya senang membantu, mengajar, membimbing, atau merawat orang lain secara langsung.',
    category: 'Social',
    opsi: [
      { text: 'Sangat Sesuai dengan saya', type: 'Social' },
      { text: 'Cukup Sesuai dengan saya', type: 'Social_partial' },
      { text: 'Tidak Sesuai dengan saya', type: 'none' }
    ]
  },
  {
    id: 11,
    pertanyaan: 'Saya peduli dengan isu sosial kemasyarakatan dan suka berkegiatan dalam komunitas atau organisasi.',
    category: 'Social',
    opsi: [
      { text: 'Sangat Sesuai dengan saya', type: 'Social' },
      { text: 'Cukup Sesuai dengan saya', type: 'Social_partial' },
      { text: 'Tidak Sesuai dengan saya', type: 'none' }
    ]
  },
  {
    id: 12,
    pertanyaan: 'Saya tertarik berkarir di bidang pendidikan, psikologi, keperawatan, atau pekerjaan sosial.',
    category: 'Social',
    opsi: [
      { text: 'Sangat Sesuai dengan saya', type: 'Social' },
      { text: 'Cukup Sesuai dengan saya', type: 'Social_partial' },
      { text: 'Tidak Sesuai dengan saya', type: 'none' }
    ]
  },
  // ── ENTERPRISING ───────────────────────────────────────────
  {
    id: 13,
    pertanyaan: 'Saya suka memimpin tim, bernegosiasi, membujuk orang, atau mengelola sebuah bisnis/proyek.',
    category: 'Enterprising',
    opsi: [
      { text: 'Sangat Sesuai dengan saya', type: 'Enterprising' },
      { text: 'Cukup Sesuai dengan saya', type: 'Enterprising_partial' },
      { text: 'Tidak Sesuai dengan saya', type: 'none' }
    ]
  },
  {
    id: 14,
    pertanyaan: 'Saya ambisius, berani mengambil risiko, dan menyukai tantangan kompetitif dalam pekerjaan.',
    category: 'Enterprising',
    opsi: [
      { text: 'Sangat Sesuai dengan saya', type: 'Enterprising' },
      { text: 'Cukup Sesuai dengan saya', type: 'Enterprising_partial' },
      { text: 'Tidak Sesuai dengan saya', type: 'none' }
    ]
  },
  {
    id: 15,
    pertanyaan: 'Saya tertarik mempelajari ilmu manajemen, pemasaran, hukum, komunikasi, atau kewirausahaan.',
    category: 'Enterprising',
    opsi: [
      { text: 'Sangat Sesuai dengan saya', type: 'Enterprising' },
      { text: 'Cukup Sesuai dengan saya', type: 'Enterprising_partial' },
      { text: 'Tidak Sesuai dengan saya', type: 'none' }
    ]
  },
  // ── CONVENTIONAL ───────────────────────────────────────────
  {
    id: 16,
    pertanyaan: 'Saya menyukai pekerjaan yang terstruktur, sistematis, mengelola dokumen, data, atau keuangan.',
    category: 'Conventional',
    opsi: [
      { text: 'Sangat Sesuai dengan saya', type: 'Conventional' },
      { text: 'Cukup Sesuai dengan saya', type: 'Conventional_partial' },
      { text: 'Tidak Sesuai dengan saya', type: 'none' }
    ]
  },
  {
    id: 17,
    pertanyaan: 'Saya teliti, rapi, dan lebih menyukai mengikuti prosedur yang jelas daripada berimprovisasi.',
    category: 'Conventional',
    opsi: [
      { text: 'Sangat Sesuai dengan saya', type: 'Conventional' },
      { text: 'Cukup Sesuai dengan saya', type: 'Conventional_partial' },
      { text: 'Tidak Sesuai dengan saya', type: 'none' }
    ]
  },
  {
    id: 18,
    pertanyaan: 'Saya tertarik berkarir di bidang akuntansi, administrasi perkantoran, perbankan, atau teknologi informasi.',
    category: 'Conventional',
    opsi: [
      { text: 'Sangat Sesuai dengan saya', type: 'Conventional' },
      { text: 'Cukup Sesuai dengan saya', type: 'Conventional_partial' },
      { text: 'Tidak Sesuai dengan saya', type: 'none' }
    ]
  }
];

// Static RIASEC Master Majors data for when Supabase jurusan_master is empty
export const RIASEC_MASTER_MAJORS = {
  Realistic: [
    { id_jurusan_master: 101, nama_jurusan: 'Teknik Sipil', kategori_riasec: 'Realistic', deskripsi: 'Merancang dan membangun infrastruktur jalan, jembatan, gedung, dan fasilitas publik.', prospek_karir: 'Project Manager, Site Engineer, Quantity Surveyor, Konsultan Infrastruktur' },
    { id_jurusan_master: 102, nama_jurusan: 'Teknik Mesin', kategori_riasec: 'Realistic', deskripsi: 'Mempelajari perancangan, manufaktur, dan pemeliharaan sistem mesin dan peralatan mekanik.', prospek_karir: 'Mechanical Engineer, Maintenance Engineer, R&D Engineer, Product Designer' },
    { id_jurusan_master: 103, nama_jurusan: 'Teknik Elektro', kategori_riasec: 'Realistic', deskripsi: 'Mengkaji sistem kelistrikan, elektronika, dan kendali otomatis untuk industri modern.', prospek_karir: 'Electrical Engineer, Control System Engineer, Power Plant Engineer' },
    { id_jurusan_master: 104, nama_jurusan: 'Teknologi Pertanian', kategori_riasec: 'Realistic', deskripsi: 'Menggabungkan ilmu teknik dengan pertanian untuk meningkatkan produktivitas pangan nasional.', prospek_karir: 'Agricultural Engineer, Food Technologist, Agribusiness Consultant' }
  ],
  Investigative: [
    { id_jurusan_master: 201, nama_jurusan: 'Kedokteran Umum', kategori_riasec: 'Investigative', deskripsi: 'Mempelajari ilmu kesehatan, anatomi, penyakit, dan tatalaksana medis secara komprehensif.', prospek_karir: 'Dokter Umum, Dokter Spesialis, Peneliti Medis, Akademisi Kedokteran' },
    { id_jurusan_master: 202, nama_jurusan: 'Ilmu Komputer / Informatika', kategori_riasec: 'Investigative', deskripsi: 'Mengkaji algoritma, pemrograman, kecerdasan buatan, dan sistem informasi modern.', prospek_karir: 'Software Engineer, Data Scientist, AI/ML Engineer, Cybersecurity Analyst' },
    { id_jurusan_master: 203, nama_jurusan: 'Matematika', kategori_riasec: 'Investigative', deskripsi: 'Mendalami teori matematika murni maupun terapan untuk memecahkan masalah kompleks.', prospek_karir: 'Aktuaris, Data Analyst, Financial Analyst, Matematikawan Peneliti' },
    { id_jurusan_master: 204, nama_jurusan: 'Farmasi', kategori_riasec: 'Investigative', deskripsi: 'Mempelajari ilmu obat-obatan, sintesis senyawa farmasi, dan pelayanan kefarmasian.', prospek_karir: 'Apoteker, Farmakolog, Peneliti Farmasi, Regulatory Affairs Specialist' }
  ],
  Artistic: [
    { id_jurusan_master: 301, nama_jurusan: 'Desain Komunikasi Visual (DKV)', kategori_riasec: 'Artistic', deskripsi: 'Mempelajari desain grafis, branding, tipografi, ilustrasi, dan media komunikasi visual.', prospek_karir: 'Graphic Designer, UI/UX Designer, Art Director, Brand Identity Designer' },
    { id_jurusan_master: 302, nama_jurusan: 'Sastra Indonesia / Sastra Inggris', kategori_riasec: 'Artistic', deskripsi: 'Mengkaji bahasa, sastra, linguistik, dan karya tulis kreatif secara mendalam.', prospek_karir: 'Penulis, Editor, Content Strategist, Jurnalis, Penerjemah' },
    { id_jurusan_master: 303, nama_jurusan: 'Seni Rupa / Seni Murni', kategori_riasec: 'Artistic', deskripsi: 'Mengembangkan kemampuan ekspresi visual melalui lukisan, patung, instalasi, dan seni kontemporer.', prospek_karir: 'Seniman, Kurator Galeri, Art Teacher, Visual Artist Profesional' },
    { id_jurusan_master: 304, nama_jurusan: 'Arsitektur', kategori_riasec: 'Artistic', deskripsi: 'Menggabungkan seni estetika dan ilmu teknik dalam perancangan bangunan dan ruang.', prospek_karir: 'Arsitek, Interior Designer, Urban Planner, Building Information Modeler' }
  ],
  Social: [
    { id_jurusan_master: 401, nama_jurusan: 'Psikologi', kategori_riasec: 'Social', deskripsi: 'Memahami perilaku manusia, proses mental, dan kondisi psikologis untuk membantu individu dan kelompok.', prospek_karir: 'Psikolog Klinis, HR Specialist, Konselor Sekolah, Psikolog Industri' },
    { id_jurusan_master: 402, nama_jurusan: 'Pendidikan / PGSD', kategori_riasec: 'Social', deskripsi: 'Mempelajari metode pengajaran, kurikulum, dan pedagogik untuk menjadi pendidik profesional.', prospek_karir: 'Guru, Kepala Sekolah, Instruktur Pelatihan, Curriculum Developer' },
    { id_jurusan_master: 403, nama_jurusan: 'Ilmu Kesehatan Masyarakat', kategori_riasec: 'Social', deskripsi: 'Memfokuskan pada pencegahan penyakit, promosi kesehatan, dan kebijakan kesehatan populasi.', prospek_karir: 'Epidemiolog, Health Promotion Officer, Sanitarian, Health Policy Analyst' },
    { id_jurusan_master: 404, nama_jurusan: 'Ilmu Keperawatan', kategori_riasec: 'Social', deskripsi: 'Mempelajari asuhan keperawatan, kesehatan pasien, dan prosedur medis pendukung.', prospek_karir: 'Perawat Klinis, Nurse Educator, Peneliti Keperawatan, Manajer Keperawatan' }
  ],
  Enterprising: [
    { id_jurusan_master: 501, nama_jurusan: 'Manajemen Bisnis', kategori_riasec: 'Enterprising', deskripsi: 'Mengkaji strategi bisnis, kepemimpinan organisasi, manajemen operasional, dan keuangan perusahaan.', prospek_karir: 'Business Analyst, Marketing Manager, Entrepreneur, Management Consultant' },
    { id_jurusan_master: 502, nama_jurusan: 'Ilmu Komunikasi', kategori_riasec: 'Enterprising', deskripsi: 'Mempelajari strategi komunikasi massa, PR, jurnalistik, dan media digital.', prospek_karir: 'Public Relations, Content Creator, Jurnalis, Media Planner, Brand Manager' },
    { id_jurusan_master: 503, nama_jurusan: 'Hukum', kategori_riasec: 'Enterprising', deskripsi: 'Mengkaji sistem perundang-undangan, hak asasi manusia, dan praktik hukum di berbagai bidang.', prospek_karir: 'Pengacara, Hakim, Notaris, Corporate Counsel, Legal Advisor' },
    { id_jurusan_master: 504, nama_jurusan: 'Ekonomi / Akuntansi', kategori_riasec: 'Enterprising', deskripsi: 'Mempelajari teori ekonomi makro-mikro, kebijakan fiskal, dan analisis laporan keuangan.', prospek_karir: 'Ekonom, Akuntan Publik, Investment Analyst, Auditor, CFO' }
  ],
  Conventional: [
    { id_jurusan_master: 601, nama_jurusan: 'Sistem Informasi', kategori_riasec: 'Conventional', deskripsi: 'Mengelola sistem teknologi informasi bisnis, database, dan analitik untuk pengambilan keputusan.', prospek_karir: 'System Analyst, Database Administrator, IT Project Manager, ERP Consultant' },
    { id_jurusan_master: 602, nama_jurusan: 'Administrasi Bisnis / Perkantoran', kategori_riasec: 'Conventional', deskripsi: 'Mempelajari pengelolaan administrasi, manajemen perkantoran, dan prosedur bisnis operasional.', prospek_karir: 'Office Manager, Administrative Analyst, Secretary, Procurement Officer' },
    { id_jurusan_master: 603, nama_jurusan: 'Statistika', kategori_riasec: 'Conventional', deskripsi: 'Menguasai metode pengumpulan, pengolahan, dan interpretasi data statistik untuk berbagai sektor.', prospek_karir: 'Statistician, Data Analyst, Research Analyst, Biostatistician' },
    { id_jurusan_master: 604, nama_jurusan: 'Ilmu Perpustakaan & Informasi', kategori_riasec: 'Conventional', deskripsi: 'Mengelola informasi, arsip, dan layanan perpustakaan secara sistematis dan terorganisir.', prospek_karir: 'Pustakawan, Knowledge Manager, Information Analyst, Archivist' }
  ]
};
