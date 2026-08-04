import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import {
  runMatchingPipeline,
  checkRiasecVariance,
  cosineSimilarity,
  VECTOR_SIZE,
} from '@/lib/vectorMatcher';

export const dynamic = 'force-dynamic';

// ──────────────────────────────────────────────────────────────────
// POST /api/recommendations
// ──────────────────────────────────────────────────────────────────
// Body: {
//   userId?           : string (UUID) — jika ada, ambil dari Supabase
//   student_vector?   : number[26]    — override / fallback dari client
//   riasec_result?    : object        — { topTraits, scores, topHollandCode }
//   academic_scores?  : object        — { matematika, fisika, ..., utbk, rapor }
//   limit?            : number        — max prodi candidates (default 200)
// }
//
// Output: {
//   success           : boolean
//   data: {
//     topMatches      : MatchResult[3]   — Aman / Target / Reach
//     alternatives    : MatchResult[3]   — Pivot majors
//     careerRoadmap   : CareerEntry[]    — dari top match
//     warnings        : Warning[]        — flags dari gating filter
//     isFlat          : boolean          — variansi RIASEC rendah
//     flatMessage     : string
//     crossRumpunSuggestions : string[]  — jika isFlat
//   }
// }

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      student_vector: clientVector,
      riasec_result: clientRiasec,
      academic_scores: clientAcademicScores,
      limit: limitParam = 200,
    } = body;

    // ── 1. Resolve student data (dari Supabase jika userId ada) ──
    let studentVector = clientVector || null;
    let riasecResult = clientRiasec || null;
    let academicScores = clientAcademicScores || null;

    if (userId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('student_vector, riasec_result, academic_scores')
        .eq('id', userId)
        .single();

      if (profile) {
        studentVector = profile.student_vector || studentVector;
        riasecResult = profile.riasec_result || riasecResult;
        academicScores = profile.academic_scores || academicScores;
      }
    }

    // Validasi minimal: butuh salah satu dari student_vector atau riasec_result
    if (!studentVector && !riasecResult) {
      return NextResponse.json(
        { success: false, error: 'Diperlukan student_vector atau riasec_result untuk menjalankan matching.' },
        { status: 400 }
      );
    }

    // ── 2. Ambil seluruh prodi dari Supabase ──
    const limit = Math.min(parseInt(limitParam) || 200, 500);
    const { data: prodiList, error: prodiError } = await supabase
      .from('prodi')
      .select(`
        kode_prodi,
        id_ptn,
        nama_prodi,
        jenjang,
        daya_tampung_sekarang,
        daya_tampung_snbt,
        daya_tampung_snbp,
        portofolio,
        riasec_profile,
        major_vector,
        akademik_minimum,
        must_have_traits,
        gaya_kerja,
        keketatan_snbt,
        prospek_karir,
        ptn(nama_ptn, provinsi_1, jenis_ptn)
      `)
      .limit(limit);

    if (prodiError) throw prodiError;

    if (!prodiList || prodiList.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada data prodi tersedia.' }, { status: 404 });
    }

    // ── 3. Normalisasi student object ──
    const student = {
      student_vector: Array.isArray(studentVector) && studentVector.length === VECTOR_SIZE
        ? studentVector
        : null,
      riasec_result: riasecResult || { topTraits: [], scores: {} },
      academic_scores: academicScores || {},
      must_have_traits_met: [], // TODO: bisa diisi dari form/profil siswa
    };

    // ── 4. Cek RIASEC variance (flat profile detection) ──
    const varianceCheck = checkRiasecVariance(
      student.student_vector || new Array(VECTOR_SIZE).fill(0)
    );

    // ── 5. Jalankan matching pipeline untuk setiap prodi ──
    const matchResults = prodiList
      .map((prodi) => {
        // Normalisasi prodi object
        const prodiNorm = {
          ...prodi,
          major_vector: Array.isArray(prodi.major_vector) ? prodi.major_vector : null,
          riasec_profile: prodi.riasec_profile || {},
          akademik_minimum: prodi.akademik_minimum || {},
          must_have_traits: prodi.must_have_traits || [],
          prospek_karir: prodi.prospek_karir || {},
          nama_ptn: prodi.ptn?.nama_ptn || '',
          provinsi_1: prodi.ptn?.provinsi_1 || 'Indonesia',
          jenis_ptn: prodi.ptn?.jenis_ptn || 'Akademik',
        };

        const matchResult = runMatchingPipeline(student, prodiNorm);

        return {
          prodi: prodiNorm,
          ...matchResult,
        };
      })
      // Filter prodi yang tereliminasi hard gate
      .filter((r) => !r.eliminated);

    // ── 6. Sort by finalScore descending ──
    matchResults.sort((a, b) => b.finalScore - a.finalScore);

    // ── 6b. GROUP by nama_prodi (deduplikasi nama jurusan, agregasi ptn_list) ──
    const groupedResults = groupByNamaProdi(matchResults);

    // ── 7. Kelompokkan ke Aman / Target / Reach (dari grouped results) ──
    const amanList   = groupedResults.filter((r) => r.category === 'aman');
    const targetList = groupedResults.filter((r) => r.category === 'target');
    const reachList  = groupedResults.filter((r) => r.category === 'reach');

    // Top 3: ambil 1 dari tiap kategori (aman, target, reach) untuk strategi optimal
    const topMatches = [];
    if (amanList.length > 0)   topMatches.push({ ...amanList[0],   strategi: 'Aman',   rank: 1 });
    if (targetList.length > 0) topMatches.push({ ...targetList[0], strategi: 'Target',  rank: 2 });
    if (reachList.length > 0)  topMatches.push({ ...reachList[0],  strategi: 'Reach',   rank: 3 });

    // Jika ada kategori yang kosong, isi dari yang tersisa
    while (topMatches.length < 3 && groupedResults.length > topMatches.length) {
      const usedNames = new Set(topMatches.map((m) => m.prodi.nama_prodi_generic));
      const next = groupedResults.find((r) => !usedNames.has(r.prodi.nama_prodi_generic));
      if (!next) break;
      topMatches.push({ ...next, strategi: next.category, rank: topMatches.length + 1 });
    }

    // ── 8. Alternatif / Pivot Majors (dari grouped results, bukan top 3) ──
    const usedTopNames = new Set(topMatches.map((m) => m.prodi.nama_prodi_generic));
    const alternatives = groupedResults
      .filter((r) => !usedTopNames.has(r.prodi.nama_prodi_generic))
      .slice(0, 3)
      .map((r, i) => ({
        ...r,
        pivotReason: buildPivotReason(r, student, i),
        rank: i + 1,
      }));

    // ── 9. Career Roadmap ──
    // Ambil dari top match prospek_karir jika ada, fallback ke RIASEC-based
    const careerRoadmap = buildCareerRoadmap(topMatches, student.riasec_result);

    // ── 10. Kumpulkan semua warnings ──
    const allWarnings = [];
    // Warnings dari top matches
    topMatches.forEach((match) => {
      if (match.warnings && match.warnings.length > 0) {
        match.warnings.forEach((w) => {
          allWarnings.push({
            prodiNama: match.prodi.nama_prodi,
            message: w,
            severity: w.startsWith('❌') ? 'error' : 'warning',
          });
        });
      }
    });

    // ── 11. Cross-Rumpun Suggestions (jika profile flat) ──
    let crossRumpunSuggestions = [];
    if (varianceCheck.isFlat) {
      crossRumpunSuggestions = buildCrossRumpunSuggestions(matchResults);
    }

    // ── 12. Format response ──
    const formattedTopMatches = topMatches.map((m) => formatMatchResult(m));
    const formattedAlternatives = alternatives.map((m) => formatMatchResult(m));

    return NextResponse.json({
      success: true,
      data: {
        topMatches: formattedTopMatches,
        alternatives: formattedAlternatives,
        careerRoadmap,
        warnings: allWarnings,
        isFlat: varianceCheck.isFlat,
        flatMessage: varianceCheck.message,
        crossRumpunSuggestions,
        meta: {
          totalCandidates: prodiList.length,
          totalFiltered: matchResults.length,
          usingVectorMatch: matchResults[0]?.usingVectorMatch || false,
          assessedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('[/api/recommendations]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────────────────────────
// HELPER: Grouping by nama_prodi — deduplikasi & agregasi ptn_list
// ──────────────────────────────────────────────────────────────────

/**
 * Deduplikasi matchResults berdasarkan nama_prodi (canonical).
 * Untuk setiap nama jurusan yang sama, ambil instance dengan finalScore terbaik
 * sebagai representasi utama, lalu agregasi semua PTN yang menyediakan prodi tersebut
 * ke dalam field `ptn_list`.
 *
 * @param {object[]} matchResults - sorted desc by finalScore
 * @returns {object[]} grouped results, masih sorted desc by finalScore
 */
function groupByNamaProdi(matchResults) {
  const groupMap = new Map(); // key = nama_prodi canonical lowercase

  matchResults.forEach((result) => {
    const namaGeneric = normalizeNamaProdi(result.prodi.nama_prodi);
    const key = namaGeneric.toLowerCase();

    if (!groupMap.has(key)) {
      // Pertama kali muncul — jadikan representative
      groupMap.set(key, {
        ...result,
        prodi: {
          ...result.prodi,
          nama_prodi_generic: namaGeneric,
        },
        ptn_list: [
          {
            kode_prodi: result.prodi.kode_prodi,
            nama_ptn: result.prodi.nama_ptn,
            provinsi_1: result.prodi.provinsi_1,
            jenis_ptn: result.prodi.jenis_ptn,
            jenjang: result.prodi.jenjang,
            daya_tampung_snbt: result.prodi.daya_tampung_snbt,
            daya_tampung_snbp: result.prodi.daya_tampung_snbp,
            keketatan_snbt: result.prodi.keketatan_snbt,
            finalScore: result.finalScore,
            category: result.category,
          },
        ],
      });
    } else {
      // Sudah ada — tambahkan PTN ke ptn_list jika belum ada
      const existing = groupMap.get(key);
      const alreadyAdded = existing.ptn_list.some(
        (p) => p.kode_prodi === result.prodi.kode_prodi
      );
      if (!alreadyAdded) {
        existing.ptn_list.push({
          kode_prodi: result.prodi.kode_prodi,
          nama_ptn: result.prodi.nama_ptn,
          provinsi_1: result.prodi.provinsi_1,
          jenis_ptn: result.prodi.jenis_ptn,
          jenjang: result.prodi.jenjang,
          daya_tampung_snbt: result.prodi.daya_tampung_snbt,
          daya_tampung_snbp: result.prodi.daya_tampung_snbp,
          keketatan_snbt: result.prodi.keketatan_snbt,
          finalScore: result.finalScore,
          category: result.category,
        });
      }
    }
  });

  // Sort ptn_list tiap grup by keketatan_snbt asc (dari paling mudah → ketat)
  groupMap.forEach((grouped) => {
    grouped.ptn_list.sort((a, b) => (b.keketatan_snbt || 10) - (a.keketatan_snbt || 10));
    grouped.ptn_count = grouped.ptn_list.length;
  });

  return Array.from(groupMap.values());
}

/**
 * Normalisasi nama prodi: hapus prefix universitas/kampus jika ada,
 * hilangkan suffix kode/tahun, uppercase.
 * Misal: "TEKNIK INFORMATIKA - UNAIR" → "TEKNIK INFORMATIKA"
 */
function normalizeNamaProdi(nama) {
  if (!nama) return 'JURUSAN TIDAK DIKETAHUI';
  // Hapus bagian setelah " - " (biasanya nama kampus)
  let clean = nama.split(' - ')[0].trim();
  // Hapus kode angka di akhir (misal "TEKNIK SIPIL 001")
  clean = clean.replace(/\s+\d{3,}$/, '').trim();
  return clean.toUpperCase();
}

// ──────────────────────────────────────────────────────────────────
// HELPER: Format match result untuk response
// ──────────────────────────────────────────────────────────────────
function formatMatchResult(m) {
  return {
    rank: m.rank,
    strategi: m.strategi || m.category,
    category: m.category,
    finalScore: m.finalScore,
    finalScorePercent: m.finalScorePercent,
    matchScore: m.matchScore,
    akademikFit: m.akademikFit,
    karirAlignment: m.karirAlignment,
    recommendation: m.recommendation,
    warnings: m.warnings || [],
    usingVectorMatch: m.usingVectorMatch,
    matchMode: m.matchMode || 'name_based', // 'vector' | 'riasec_profile' | 'name_based'
    pivotReason: m.pivotReason || null,
    // ptn_list: daftar semua PTN yang menyediakan jurusan ini (terurut dari keketatan tertinggi)
    ptn_list: m.ptn_list || [],
    ptn_count: m.ptn_count || 1,
    prodi: {
      kode_prodi: m.prodi.kode_prodi,
      nama_prodi: m.prodi.nama_prodi,
      nama_prodi_generic: m.prodi.nama_prodi_generic || normalizeNamaProdi(m.prodi.nama_prodi),
      jenjang: m.prodi.jenjang,
      nama_ptn: m.prodi.nama_ptn,
      provinsi_1: m.prodi.provinsi_1,
      jenis_ptn: m.prodi.jenis_ptn,
      daya_tampung_sekarang: m.prodi.daya_tampung_sekarang,
      daya_tampung_snbt: m.prodi.daya_tampung_snbt,
      daya_tampung_snbp: m.prodi.daya_tampung_snbp,
      portofolio: m.prodi.portofolio,
      keketatan_snbt: m.prodi.keketatan_snbt,
      prospek_karir: m.prodi.prospek_karir,
      akademik_minimum: m.prodi.akademik_minimum,
    },
  };
}

// ──────────────────────────────────────────────────────────────────
// HELPER: Build Career Roadmap
// ──────────────────────────────────────────────────────────────────
function buildCareerRoadmap(topMatches, riasecResult) {
  const roadmap = [];

  topMatches.forEach((match) => {
    const namaGeneric = match.prodi.nama_prodi_generic || normalizeNamaProdi(match.prodi.nama_prodi);
    const prospek = match.prodi.prospek_karir || {};
    const entryRoles = prospek.entry || generateFallbackRoles(namaGeneric, 'entry');
    const midRoles   = prospek.mid   || generateFallbackRoles(namaGeneric, 'mid');
    const aiScore    = prospek.ai_resistance ?? estimateAiResistance(namaGeneric);

    roadmap.push({
      prodi: namaGeneric,           // nama jurusan generic (tanpa nama kampus)
      ptn_count: match.ptn_count || 1,
      category: match.category,
      entryRoles,
      midRoles,
      aiResistanceScore: aiScore,
      aiResistanceLabel: aiScore >= 0.7 ? 'Tinggi' : aiScore >= 0.4 ? 'Sedang' : 'Rendah',
      aiResistanceDesc: getAiResistanceDesc(aiScore),
    });
  });

  return roadmap;
}

// ──────────────────────────────────────────────────────────────────
// HELPER: Generate fallback roles jika prospek_karir belum di-seed
// ──────────────────────────────────────────────────────────────────
const NAMA_PRODI_ROLE_MAP = {
  teknik: { entry: ['Junior Engineer', 'Site Engineer', 'Technical Analyst'], mid: ['Senior Engineer', 'Project Manager', 'R&D Lead'] },
  informatika: { entry: ['Junior Developer', 'QA Engineer', 'Data Analyst'], mid: ['Senior Software Engineer', 'Tech Lead', 'CTO'] },
  komputer: { entry: ['Junior Developer', 'System Analyst', 'IT Support'], mid: ['Software Architect', 'Engineering Manager', 'CTO'] },
  kedokteran: { entry: ['Dokter Umum', 'Resident/PPDS', 'Researcher'], mid: ['Dokter Spesialis', 'Kepala Klinik', 'Peneliti Senior'] },
  hukum: { entry: ['Junior Associate', 'Legal Intern', 'Paralegal'], mid: ['Associate Partner', 'In-House Counsel', 'Hakim Muda'] },
  manajemen: { entry: ['Management Trainee', 'Business Analyst', 'Sales Executive'], mid: ['Product Manager', 'Operations Manager', 'Business Director'] },
  komunikasi: { entry: ['Content Writer', 'Junior PR', 'Social Media Specialist'], mid: ['Brand Manager', 'PR Director', 'Communications Lead'] },
  psikologi: { entry: ['HR Staff', 'Konselor Junior', 'Research Assistant'], mid: ['Psikolog Klinis', 'HR Manager', 'Organizational Psychologist'] },
  akuntansi: { entry: ['Junior Auditor', 'Accounting Staff', 'Tax Analyst'], mid: ['Akuntan Publik', 'Finance Manager', 'CFO'] },
  desain: { entry: ['Junior Designer', 'UI Designer', 'Creative Intern'], mid: ['Senior Designer', 'Art Director', 'Design Lead'] },
};

function generateFallbackRoles(namaProdi, level) {
  const namaLower = (namaProdi || '').toLowerCase();
  for (const [key, roles] of Object.entries(NAMA_PRODI_ROLE_MAP)) {
    if (namaLower.includes(key)) {
      return roles[level] || [];
    }
  }
  return level === 'entry'
    ? ['Fresh Graduate', 'Junior Specialist', 'Research Analyst']
    : ['Senior Specialist', 'Manager', 'Department Head'];
}

function estimateAiResistance(namaProdi) {
  const namaLower = (namaProdi || '').toLowerCase();
  // Profesi yang butuh interaksi manusia tinggi → AI resistance tinggi
  if (/kedokteran|dokter|keperawatan|kebidanan|fisioterapi|psikologi|konseling/.test(namaLower)) return 0.85;
  if (/hukum|notaris|hakim/.test(namaLower)) return 0.75;
  if (/pendidikan|pgsd|guru/.test(namaLower)) return 0.70;
  if (/seni|musik|desain|arsitektur|tari|teater/.test(namaLower)) return 0.72;
  if (/teknik sipil|teknik lingkungan|pertanian|kehutanan/.test(namaLower)) return 0.65;
  if (/informatika|komputer|teknologi informasi|sistem informasi/.test(namaLower)) return 0.55;
  if (/akuntansi|administrasi|keuangan|perpustakaan/.test(namaLower)) return 0.35;
  if (/matematika|statistika|fisika/.test(namaLower)) return 0.60;
  return 0.55; // neutral default
}

function getAiResistanceDesc(score) {
  if (score >= 0.75) return 'Profesi ini sangat bergantung pada keahlian manusia dan empati — sulit digantikan AI.';
  if (score >= 0.55) return 'Sebagian tugas mungkin terotomasi, namun peran inti masih membutuhkan keahlian manusia.';
  return 'Beberapa tugas rutin berpotensi terotomasi oleh AI. Kuasai keterampilan analitis dan kreatif untuk tetap relevan.';
}

// ──────────────────────────────────────────────────────────────────
// HELPER: Build pivot reason
// ──────────────────────────────────────────────────────────────────
function buildPivotReason(matchResult, student, index) {
  const prodi = matchResult.prodi;
  const category = matchResult.category;
  const akademikFit = matchResult.akademikFit;

  if (category === 'aman' && akademikFit >= 0.85) {
    return `Prodi alternatif dengan tingkat persaingan lebih rendah — peluang masuk lebih besar dengan nilai yang kamu miliki.`;
  }
  if (akademikFit >= 0.7) {
    return `Bidang serupa dengan jalur karir yang overlap — cocok sebagai rencana B strategis.`;
  }
  return `Pilihan pivot dari rumpun ilmu yang masih relevan dengan profil minatmu.`;
}

// ──────────────────────────────────────────────────────────────────
// HELPER: Cross-Rumpun Suggestions (jika profil flat)
// ──────────────────────────────────────────────────────────────────
function buildCrossRumpunSuggestions(matchResults) {
  // Ambil 1 prodi terbaik dari setiap rumpun ilmu
  const rumpunMap = {
    'Sains & Teknologi': null,
    'Sosial & Humaniora': null,
    'Kesehatan': null,
    'Seni & Desain': null,
    'Ekonomi & Bisnis': null,
  };

  const rumpunKeywords = {
    'Sains & Teknologi': ['teknik', 'informatika', 'komputer', 'matematika', 'fisika', 'kimia', 'biologi'],
    'Kesehatan': ['kedokteran', 'keperawatan', 'farmasi', 'kesehatan', 'gizi', 'fisioterapi'],
    'Sosial & Humaniora': ['hukum', 'ilmu politik', 'sosiologi', 'komunikasi', 'psikologi', 'pendidikan'],
    'Ekonomi & Bisnis': ['manajemen', 'akuntansi', 'ekonomi', 'bisnis', 'perbankan'],
    'Seni & Desain': ['seni', 'desain', 'arsitektur', 'musik', 'sastra'],
  };

  matchResults.forEach((result) => {
    const namaGeneric = result.prodi.nama_prodi_generic || normalizeNamaProdi(result.prodi.nama_prodi);
    const namaLower = namaGeneric.toLowerCase();
    for (const [rumpun, keywords] of Object.entries(rumpunKeywords)) {
      if (rumpunMap[rumpun] === null && keywords.some((k) => namaLower.includes(k))) {
        rumpunMap[rumpun] = {
          rumpun,
          prodiNama: namaGeneric,
          ptnCount: result.ptn_count || 1,
          finalScore: result.finalScore,
          kodeProdi: result.prodi.kode_prodi,
        };
      }
    }
  });

  return Object.values(rumpunMap).filter(Boolean);
}
