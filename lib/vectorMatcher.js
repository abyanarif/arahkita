/**
 * vectorMatcher.js
 * ─────────────────────────────────────────────────────────────────
 * ArahKita / Smart Choose 2026 — Blueprint Assessment & Matching v1.0
 *
 * Berisi fungsi-fungsi core untuk:
 * 1. Cosine Similarity antara student_vector dan major_vector
 * 2. Kalkulasi AkademikFit ratio
 * 3. Kalkulasi KarirAlignment
 * 4. FinalScore formula berbobot: 0.55 × Match + 0.30 × Akademik + 0.15 × Karir
 * 5. Gating Filter (hard elimination + warning flags)
 * 6. buildStudentVector — konversi raw jawaban 26 dimensi ke float array
 * ─────────────────────────────────────────────────────────────────
 */

// ──────────────────────────────────────────────────────────────────
// KONSTANTA DIMENSI
// ──────────────────────────────────────────────────────────────────

/**
 * 26 Dimensi Student/Major Vector
 * Index 0-5:   RIASEC (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)
 * Index 6-11:  Akademik Proxy (Mat, Fis, Kim, Bio, Bhs_Indo, Bhs_Ing)
 * Index 12-17: Gaya Kerja (Outdoor, Teamwork, Analytical, Creative, Leadership, Detail_Oriented)
 * Index 18-23: Nilai Personal (Autonomy, Stability, Helping_Others, Innovation, Prestige, Social_Impact)
 * Index 24:    Preferensi Karir — Industri vs Publik (0=publik, 1=industri)
 * Index 25:    Realitas Karir — Gaji vs Passion (0=passion, 1=gaji)
 */
export const VECTOR_DIMENSIONS = [
  // Modul A: RIASEC (0-5)
  'riasec_realistic',
  'riasec_investigative',
  'riasec_artistic',
  'riasec_social',
  'riasec_enterprising',
  'riasec_conventional',
  // Modul B: Akademik Proxy (6-11)
  'akademik_matematika',
  'akademik_fisika',
  'akademik_kimia',
  'akademik_biologi',
  'akademik_bahasa_indo',
  'akademik_bahasa_ing',
  // Modul C: Gaya Kerja (12-17)
  'gaya_outdoor',
  'gaya_teamwork',
  'gaya_analytical',
  'gaya_creative',
  'gaya_leadership',
  'gaya_detail_oriented',
  // Modul D: Nilai Personal (18-23)
  'nilai_autonomy',
  'nilai_stability',
  'nilai_helping_others',
  'nilai_innovation',
  'nilai_prestige',
  'nilai_social_impact',
  // Modul E: Preferensi Karir (24-25)
  'karir_industri_vs_publik',
  'karir_gaji_vs_passion',
];

export const VECTOR_SIZE = 26;

// ──────────────────────────────────────────────────────────────────
// 1. COSINE SIMILARITY
// ──────────────────────────────────────────────────────────────────

/**
 * Menghitung Cosine Similarity antara dua vector float.
 * Nilai: -1 (berlawanan) hingga 1 (identik).
 *
 * @param {number[]} vecA - Student vector (length 26)
 * @param {number[]} vecB - Major vector (length 26)
 * @returns {number} Cosine similarity [0, 1] (di-clamp ke 0 jika negatif)
 */
export function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) return 0;
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += (vecA[i] || 0) * (vecB[i] || 0);
    normA += (vecA[i] || 0) ** 2;
    normB += (vecB[i] || 0) ** 2;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  // Clamp ke [0, 1] karena nilai negatif tidak relevan dalam konteks ini
  return Math.max(0, Math.min(1, dotProduct / denominator));
}

// ──────────────────────────────────────────────────────────────────
// 2. RIASEC PROFILE MATCHING (Fallback jika major_vector NULL)
// ──────────────────────────────────────────────────────────────────

/**
 * Hitung kecocokan berbasis RIASEC string (fallback ketika major_vector belum tersedia).
 * Membandingkan top RIASEC siswa dengan riasec_profile prodi.
 *
 * @param {object} studentRiasec - { topTraits: ['I','R','A'], scores: { Realistic: 4, ... } }
 * @param {object} prodiRiasecProfile - { R: 0.8, I: 0.9, A: 0.2, S: 0.4, E: 0.5, C: 0.6 }
 * @returns {number} Match score [0, 1]
 */
export function riasecProfileMatch(studentRiasec, prodiRiasecProfile) {
  if (!studentRiasec || !prodiRiasecProfile) return 0.5; // neutral fallback

  const RIASEC_MAP = {
    Realistic: 'R',
    Investigative: 'I',
    Artistic: 'A',
    Social: 'S',
    Enterprising: 'E',
    Conventional: 'C',
  };

  const topTraits = studentRiasec.topTraits || [];
  const scores = studentRiasec.scores || {};

  // Hitung total possible score (normalize)
  const totalScore = Object.values(scores).reduce((s, v) => s + (v || 0), 0) || 1;

  let matchScore = 0;
  let weightSum = 0;

  topTraits.slice(0, 3).forEach((trait, rank) => {
    const code = RIASEC_MAP[trait] || trait;
    const prodiStrength = prodiRiasecProfile[code] || 0;
    const studentWeight = (scores[trait] || 0) / totalScore;
    const rankWeight = rank === 0 ? 0.5 : rank === 1 ? 0.3 : 0.2;

    matchScore += prodiStrength * studentWeight * rankWeight;
    weightSum += rankWeight;
  });

  return weightSum > 0 ? Math.min(1, matchScore / (weightSum * 0.5)) : 0.5;
}

// ──────────────────────────────────────────────────────────────────
// 3. AKADEMIK FIT
// ──────────────────────────────────────────────────────────────────

/**
 * Kalkulasi AkademikFit — rasio nilai siswa terhadap ambang minimum prodi.
 * Menghasilkan nilai [0, 1].
 *
 * @param {object} studentScores - { utbk: 680, rapor: 88, matematika: 85, fisika: 80 }
 * @param {object} prodiMinimum  - { utbk_min: 650, rapor_min: 80, mapel_kunci: ['Matematika'] }
 * @returns {number} AkademikFit ratio [0, 1]
 */
export function calculateAkademikFit(studentScores, prodiMinimum) {
  if (!studentScores || !prodiMinimum) return 0.7; // default moderate fit

  let fits = [];

  // Cek UTBK
  if (prodiMinimum.utbk_min && studentScores.utbk) {
    const ratio = studentScores.utbk / prodiMinimum.utbk_min;
    fits.push(Math.min(1, ratio));
  }

  // Cek Rapor
  if (prodiMinimum.rapor_min && studentScores.rapor) {
    const ratio = studentScores.rapor / prodiMinimum.rapor_min;
    fits.push(Math.min(1, ratio));
  }

  // Cek mapel kunci
  const mapelKunci = prodiMinimum.mapel_kunci || [];
  const mapelMap = {
    Matematika: 'matematika',
    Fisika: 'fisika',
    Kimia: 'kimia',
    Biologi: 'biologi',
    'Bahasa Indonesia': 'bahasa_indo',
    'Bahasa Inggris': 'bahasa_ing',
  };

  mapelKunci.forEach((mapel) => {
    const key = mapelMap[mapel] || mapel.toLowerCase().replace(' ', '_');
    const studentVal = studentScores[key];
    const minVal = prodiMinimum[`min_${key}`] || 75; // default minimum 75
    if (studentVal !== undefined) {
      fits.push(Math.min(1, studentVal / minVal));
    }
  });

  if (fits.length === 0) return 0.7;
  return fits.reduce((sum, v) => sum + v, 0) / fits.length;
}

// ──────────────────────────────────────────────────────────────────
// 4. KARIR ALIGNMENT
// ──────────────────────────────────────────────────────────────────

/**
 * Kalkulasi KarirAlignment — kecocokan preferensi karir siswa dengan profil prodi.
 * Menghasilkan nilai [0, 1].
 *
 * @param {string[]} studentTopRiasec - Top RIASEC siswa ['Investigative','Realistic']
 * @param {object}   prodiKarirProfile - { entry: [...], mid: [...], ai_resistance: 0.75, sektors: ['teknologi'] }
 * @param {object}   studentCareerPref - { industri_vs_publik: 0.8, gaji_vs_passion: 0.6 }
 * @returns {number} KarirAlignment [0, 1]
 */
export function calculateKarirAlignment(studentTopRiasec, prodiKarirProfile, studentCareerPref) {
  if (!prodiKarirProfile) return 0.5;

  let score = 0.5; // baseline

  // Bonus jika prodi ada role entry yang relevan
  const entryRoles = prodiKarirProfile.entry || [];
  const sectors = prodiKarirProfile.sektors || [];

  // Cek AI resistance score (relevansi ke depan)
  const aiResistance = prodiKarirProfile.ai_resistance;
  if (typeof aiResistance === 'number') {
    score = 0.3 + aiResistance * 0.4; // ai_resistance berkontribusi 40%
  }

  // Bonus dari preferensi karir siswa vs profil prodi
  if (studentCareerPref) {
    const { industri_vs_publik = 0.5, gaji_vs_passion = 0.5 } = studentCareerPref;
    const prodiIndustri = prodiKarirProfile.industri_score || 0.5;
    const prodiGaji = prodiKarirProfile.gaji_score || 0.5;

    // Kecocokan preferensi (makin dekat makin tinggi)
    const industriMatch = 1 - Math.abs(industri_vs_publik - prodiIndustri);
    const gajiMatch = 1 - Math.abs(gaji_vs_passion - prodiGaji);

    score = score * 0.4 + (industriMatch * 0.3 + gajiMatch * 0.3);
  }

  return Math.max(0, Math.min(1, score));
}

// ──────────────────────────────────────────────────────────────────
// 5. FINAL SCORE (Formula Berbobot Blueprint)
// ──────────────────────────────────────────────────────────────────

/**
 * Hitung FinalScore berbobot sesuai Blueprint v1.0:
 *   FinalScore = (0.55 × MatchScore) + (0.30 × AkademikFit) + (0.15 × KarirAlignment)
 *
 * @param {number} matchScore    - Cosine Similarity atau RIASEC profile match [0,1]
 * @param {number} akademikFit   - Ratio nilai akademik siswa vs minimum prodi [0,1]
 * @param {number} karirAlignment - Kecocokan preferensi karir [0,1]
 * @returns {number} FinalScore [0, 1]
 */
export function calculateFinalScore(matchScore, akademikFit, karirAlignment) {
  const ms = Math.max(0, Math.min(1, matchScore || 0));
  const af = Math.max(0, Math.min(1, akademikFit || 0));
  const ka = Math.max(0, Math.min(1, karirAlignment || 0));

  return (0.55 * ms) + (0.30 * af) + (0.15 * ka);
}

// ──────────────────────────────────────────────────────────────────
// 6. GATING FILTER (Hard Elimination + Warning Flags)
// ──────────────────────────────────────────────────────────────────

/**
 * Matriks Gating — Filter eliminasi keras dan warning flags.
 * Mengembalikan { eliminated: bool, warnings: string[], category: string }
 *
 * @param {object} student - { must_have_traits_met: string[], student_vector: number[], academic_scores: {} }
 * @param {object} prodi   - { must_have_traits: string[], akademik_minimum: {}, portofolio: string }
 * @param {number} finalScore - FinalScore yang sudah dihitung
 * @param {number} akademikFit - AkademikFit ratio
 * @returns {{ eliminated: boolean, warnings: string[], category: 'aman'|'target'|'reach'|'eliminated', recommendation: string }}
 */
export function applyGatingFilter(student, prodi, finalScore, akademikFit) {
  const warnings = [];
  let eliminated = false;

  const mustHaveTraits = prodi.must_have_traits || [];
  const studentTraits = student.must_have_traits_met || [];
  const akademikMin = prodi.akademik_minimum || {};

  // ── Hard Gates (Eliminasi Keras) ──
  mustHaveTraits.forEach((trait) => {
    if (!studentTraits.includes(trait)) {
      eliminated = true;
      warnings.push(`❌ Syarat eliminasi tidak terpenuhi: "${trait}"`);
    }
  });

  // Portofolio khusus (seni, olahraga)
  const portofolio = (prodi.portofolio || '').toLowerCase();
  if (portofolio !== 'tidak ada' && portofolio !== '' && portofolio !== 'tidak') {
    warnings.push(`⚠️ Prodi ini membutuhkan portofolio: ${prodi.portofolio}. Pastikan kamu memiliki karya yang siap.`);
  }

  // ── Soft Warnings (Akademik di bawah ambang) ──
  const studentScores = student.academic_scores || {};
  if (akademikMin.utbk_min && studentScores.utbk) {
    if (studentScores.utbk < akademikMin.utbk_min * 0.95) {
      warnings.push(`⚠️ Skor UTBK kamu (${studentScores.utbk}) di bawah estimasi passing grade (~${akademikMin.utbk_min}). Status: REACH.`);
    }
  }
  if (akademikMin.rapor_min && studentScores.rapor) {
    if (studentScores.rapor < akademikMin.rapor_min * 0.95) {
      warnings.push(`⚠️ Nilai rapor kamu (${studentScores.rapor}) di bawah rata-rata diterima (~${akademikMin.rapor_min}). Pertimbangkan pilihan alternatif.`);
    }
  }

  // ── Kategorisasi Aman / Target / Reach ──
  let category = 'target';
  if (!eliminated) {
    if (finalScore >= 0.75 && akademikFit >= 0.9) {
      category = 'aman';
    } else if (finalScore >= 0.55 && akademikFit >= 0.7) {
      category = 'target';
    } else {
      category = 'reach';
      if (!warnings.some((w) => w.includes('REACH'))) {
        warnings.push('📊 Prodi ini termasuk kategori REACH — perlu persiapan ekstra untuk meningkatkan skor.');
      }
    }
  } else {
    category = 'eliminated';
  }

  // ── Rekomendasi teks singkat ──
  const recommendation =
    category === 'aman'
      ? 'Peluang sangat baik! Pertahankan performa dan jadikan ini pilihan utama.'
      : category === 'target'
      ? 'Peluang wajar. Tingkatkan nilai di mata pelajaran kunci untuk mengamankan posisi.'
      : category === 'reach'
      ? 'Prodi ambisius. Butuh peningkatan signifikan — siapkan rencana B yang lebih realistis.'
      : 'Prodi ini tidak bisa dipilih karena persyaratan wajib tidak terpenuhi.';

  return { eliminated, warnings, category, recommendation };
}

// ──────────────────────────────────────────────────────────────────
// 7. BUILD STUDENT VECTOR (dari jawaban assessment multi-dimensi)
// ──────────────────────────────────────────────────────────────────

/**
 * Konversi raw jawaban assessment (5 modul) menjadi float array 26 dimensi [0, 1].
 *
 * @param {object} assessmentAnswers - { moduleA: {}, moduleB: {}, moduleC: {}, moduleD: {}, moduleE: {} }
 * @returns {number[]} Student vector [length = 26], nilai range [0, 1]
 */
export function buildStudentVector(assessmentAnswers) {
  const vec = new Array(VECTOR_SIZE).fill(0);

  const { moduleA = {}, moduleB = {}, moduleC = {}, moduleD = {}, moduleE = {} } = assessmentAnswers;

  // ── Modul A: RIASEC (Likert 1-5) → index 0-5 ──
  // Tiap kategori punya 3 soal, skor max = 15 (3 × 5)
  const RIASEC_CATS = ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'];
  RIASEC_CATS.forEach((cat, i) => {
    const raw = moduleA[cat] || 0;  // sum of Likert scores (1-5) per 3 soal
    vec[i] = Math.min(1, raw / 15); // normalize ke [0,1]
  });

  // ── Modul B: Akademik Proxy (self-report nilai) → index 6-11 ──
  // Nilai input 0-100, normalize ke [0, 1]
  const AKADEMIK_KEYS = ['matematika', 'fisika', 'kimia', 'biologi', 'bahasa_indo', 'bahasa_ing'];
  AKADEMIK_KEYS.forEach((key, i) => {
    const raw = moduleB[key] || 0;
    vec[6 + i] = Math.min(1, Math.max(0, raw / 100));
  });

  // ── Modul C: Gaya Kerja SJT → index 12-17 ──
  // Tiap skenario memberikan poin ke dimensi tertentu, max poin per dimensi = 6
  const GAYA_KEYS = ['outdoor', 'teamwork', 'analytical', 'creative', 'leadership', 'detail_oriented'];
  GAYA_KEYS.forEach((key, i) => {
    const raw = moduleC[key] || 0;
    vec[12 + i] = Math.min(1, raw / 6);
  });

  // ── Modul D: Nilai Personal Ipsative → index 18-23 ──
  // Tiap forced-choice memberikan +1 ke salah satu dimensi, max = 6
  const NILAI_KEYS = ['autonomy', 'stability', 'helping_others', 'innovation', 'prestige', 'social_impact'];
  NILAI_KEYS.forEach((key, i) => {
    const raw = moduleD[key] || 0;
    vec[18 + i] = Math.min(1, raw / 6);
  });

  // ── Modul E: Preferensi Karir → index 24-25 ──
  // 0-1 langsung dari pilihan binary
  vec[24] = typeof moduleE.industri_vs_publik === 'number' ? moduleE.industri_vs_publik : 0.5;
  vec[25] = typeof moduleE.gaji_vs_passion === 'number' ? moduleE.gaji_vs_passion : 0.5;

  return vec;
}

// ──────────────────────────────────────────────────────────────────
// 8. VARIANCE CHECK (Deteksi "Bingung Minat")
// ──────────────────────────────────────────────────────────────────

/**
 * Cek apakah skor RIASEC siswa terlalu flat (tidak ada minat yang dominan).
 * Threshold: std deviation dari 6 skor RIASEC < 0.10
 *
 * @param {number[]} studentVector - Full 26-dim vector
 * @returns {{ isFlat: boolean, stdDev: number, message: string }}
 */
export function checkRiasecVariance(studentVector) {
  const riasecScores = studentVector.slice(0, 6);
  const mean = riasecScores.reduce((s, v) => s + v, 0) / 6;
  const variance = riasecScores.reduce((s, v) => s + (v - mean) ** 2, 0) / 6;
  const stdDev = Math.sqrt(variance);

  const isFlat = stdDev < 0.10;
  const message = isFlat
    ? 'Profil minatmu masih belum terbentuk dengan kuat. Mode "Jelajahi Semua Rumpun" diaktifkan untuk membantu eksplorasi lebih luas.'
    : `Profil minat terdeteksi dengan baik (spread = ${(stdDev * 100).toFixed(1)}%).`;

  return { isFlat, stdDev, message };
}

// ──────────────────────────────────────────────────────────────────
// 9. FULL MATCHING PIPELINE (convenience function)
// ──────────────────────────────────────────────────────────────────

/**
 * Jalankan full matching pipeline untuk satu prodi.
 * Automatically fallback ke RIASEC profile match jika major_vector NULL.
 *
 * @param {object} student - { student_vector, riasec_result, academic_scores, must_have_traits_met }
 * @param {object} prodi   - { major_vector, riasec_profile, akademik_minimum, must_have_traits, prospek_karir, gaya_kerja, ... }
 * @returns {object} Full match result dengan finalScore, category, warnings, dll.
 */
export function runMatchingPipeline(student, prodi) {
  // 1. Tentukan Match Score
  let matchScore = 0;
  const hasMajorVector = Array.isArray(prodi.major_vector) && prodi.major_vector.length === VECTOR_SIZE;
  const hasStudentVector = Array.isArray(student.student_vector) && student.student_vector.length === VECTOR_SIZE;

  if (hasMajorVector && hasStudentVector) {
    matchScore = cosineSimilarity(student.student_vector, prodi.major_vector);
  } else {
    // Fallback: RIASEC profile match
    matchScore = riasecProfileMatch(student.riasec_result, prodi.riasec_profile);
  }

  // 2. Hitung AkademikFit
  const akademikFit = calculateAkademikFit(student.academic_scores, prodi.akademik_minimum);

  // 3. Hitung KarirAlignment
  const studentCareerPref = {
    industri_vs_publik: student.student_vector?.[24] ?? 0.5,
    gaji_vs_passion: student.student_vector?.[25] ?? 0.5,
  };
  const karirAlignment = calculateKarirAlignment(
    student.riasec_result?.topTraits || [],
    prodi.prospek_karir,
    studentCareerPref
  );

  // 4. Hitung FinalScore
  const finalScore = calculateFinalScore(matchScore, akademikFit, karirAlignment);

  // 5. Apply Gating Filter
  const gateResult = applyGatingFilter(student, prodi, finalScore, akademikFit);

  return {
    matchScore: Math.round(matchScore * 100) / 100,
    akademikFit: Math.round(akademikFit * 100) / 100,
    karirAlignment: Math.round(karirAlignment * 100) / 100,
    finalScore: Math.round(finalScore * 100) / 100,
    finalScorePercent: Math.round(finalScore * 100),
    ...gateResult,
    usingVectorMatch: hasMajorVector && hasStudentVector,
  };
}
