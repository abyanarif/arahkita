/**
 * scripts/testStressAntiHardcode.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Stress Test & Anti-Hardcode Validation: Pure Vector Matching Engine & Gating Rules
 *
 * Menjalankan:
 *   node scripts/testStressAntiHardcode.js
 *
 * Memverifikasi murni kalkulasi matematika Vector Matching (26D Cosine / Pearson Correlation),
 * variansi RIASEC (stdDev), dan pencarian Cross-Rumpun tanpa adanya hardcoded condition.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  buildStudentVector,
  runMatchingPipeline,
  checkRiasecVariance,
  parseVector,
  VECTOR_SIZE,
} from '../lib/vectorMatcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Read environment variables from .env.local ──────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://geeqgdjgykixomfbzwkr.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Deduplikasi & Normalisasi nama prodi
// ─────────────────────────────────────────────────────────────────────────────
function normalizeNamaProdi(nama) {
  if (!nama) return 'JURUSAN TIDAK DIKETAHUI';
  let clean = nama.split(' - ')[0].trim();
  clean = clean.replace(/\s+\d{3,}$/, '').trim();
  return clean.toUpperCase();
}

function groupByNamaProdi(matchResults) {
  const groupMap = new Map();

  matchResults.forEach((result) => {
    const namaGeneric = normalizeNamaProdi(result.prodi.nama_prodi);
    const key = namaGeneric.toLowerCase();

    if (!groupMap.has(key)) {
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
            finalScore: result.finalScore,
            category: result.category,
          },
        ],
      });
    } else {
      const existing = groupMap.get(key);
      const alreadyAdded = existing.ptn_list.some(
        (p) => p.kode_prodi === result.prodi.kode_prodi
      );
      if (!alreadyAdded) {
        existing.ptn_list.push({
          kode_prodi: result.prodi.kode_prodi,
          nama_ptn: result.prodi.nama_ptn,
          finalScore: result.finalScore,
          category: result.category,
        });
      }
    }
  });

  groupMap.forEach((grouped) => {
    grouped.ptn_count = grouped.ptn_list.length;
  });

  return Array.from(groupMap.values());
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFINISI 4 SKENARIO UNIK & EDGE CASES
// ─────────────────────────────────────────────────────────────────────────────
const STRESS_SCENARIOS = [
  {
    id: 'A',
    title: 'SKENARIO A: PROFIL CREATIVE-SPATIAL (SENI & ARSITEKTUR)',
    answers: {
      moduleA: {
        Artistic: 15,     // max
        Realistic: 12,    // tinggi
        Investigative: 9, // sedang
        Social: 3,        // rendah
        Enterprising: 3,  // rendah
        Conventional: 3,  // rendah
      },
      moduleB: {
        bahasa_indo: 90,
        bahasa_ing: 90,
        matematika: 70,
        fisika: 75,
        kimia: 50,
        biologi: 50,
      },
      moduleC: {
        creative: 6,
        outdoor: 4,
        practical: 4,
        detail_oriented: 4,
        analytical: 3,
        leadership: 1,
      },
      moduleD: {
        innovation: 6,
        autonomy: 5,
        prestige: 3,
        stability: 3,
        helping_others: 2,
        social_impact: 2,
      },
      moduleE: {
        industri_vs_publik: 0.8,
        gaji_vs_passion: 0.2, // high passion
      },
    },
    expectedKeywords: ['DESAIN KOMUNIKASI VISUAL', 'DKV', 'ARSITEKTUR', 'DESAIN INTERIOR', 'SENI RUPA', 'SENI', 'FILM'],
    type: 'normal',
  },
  {
    id: 'B',
    title: 'SKENARIO B: PROFIL FIELD-RESEARCHER / NATURE (KEHUTANAN & AGRO)',
    answers: {
      moduleA: {
        Realistic: 15,    // max
        Investigative: 12,// tinggi
        Conventional: 3,  // rendah
        Artistic: 3,
        Social: 3,
        Enterprising: 3,
      },
      moduleB: {
        biologi: 95,
        kimia: 80,
        fisika: 80,
        matematika: 70,
        bahasa_indo: 70,
        bahasa_ing: 70,
      },
      moduleC: {
        outdoor: 6,
        practical: 5,
        analytical: 5,
        teamwork: 3,
        creative: 2,
        leadership: 2,
      },
      moduleD: {
        autonomy: 5,
        stability: 5,
        innovation: 4,
        social_impact: 3,
        helping_others: 2,
        prestige: 2,
      },
      moduleE: {
        industri_vs_publik: 0.4,
        gaji_vs_passion: 0.5,
      },
    },
    expectedKeywords: ['KEHUTANAN', 'AGROTEKNOLOGI', 'PETERNAKAN', 'TEKNIK GEOLOGI', 'PERTANIAN', 'AGRIBISNIS', 'PERIKANAN', 'TEKNIK MESIN', 'TEKNIK KIMIA', 'ARSITEKTUR', 'GEOLOGI'],
    type: 'normal',
  },
  {
    id: 'C',
    title: 'SKENARIO C: PROFIL LOGISTICS & ANALYTICAL SYSTEM (LOGISTIK & VOKASI TERAPAN)',
    answers: {
      moduleA: {
        Conventional: 15, // max
        Enterprising: 12, // tinggi
        Realistic: 9,     // sedang
        Investigative: 6,
        Artistic: 3,
        Social: 3,
      },
      moduleB: {
        matematika: 90,
        bahasa_indo: 85,
        bahasa_ing: 85,
        fisika: 70,
        kimia: 50,
        biologi: 50,
      },
      moduleC: {
        detail_oriented: 6,
        leadership: 5,
        practical: 5,
        analytical: 4,
        teamwork: 3,
        creative: 2,
      },
      moduleD: {
        stability: 6,
        prestige: 5,
        autonomy: 4,
        innovation: 3,
        helping_others: 2,
        social_impact: 2,
      },
      moduleE: {
        industri_vs_publik: 0.9,
        gaji_vs_passion: 0.8,
      },
    },
    expectedKeywords: ['LOGISTIK', 'TEKNIK INDUSTRI', 'AKUNTANSI', 'MANAJEMEN', 'EKONOMI', 'KEUANGAN', 'TRANSPORTASI', 'TEKNIK SIPIL', 'TEKNIK ELEKTRO', 'INFORMATIKA', 'SISTEM INFORMASI', 'TEKNIK'],
    type: 'normal',
  },
  {
    id: 'D',
    title: 'SKENARIO D: PROFIL FLAT / FLAT VARIANCE (EDGE CASE - BINGUNG MINAT)',
    answers: {
      moduleA: {
        Realistic: 9,
        Investigative: 9,
        Artistic: 9,
        Social: 9,
        Enterprising: 9,
        Conventional: 9,
      },
      moduleB: {
        matematika: 75,
        fisika: 75,
        kimia: 75,
        biologi: 75,
        bahasa_indo: 75,
        bahasa_ing: 75,
      },
      moduleC: {
        outdoor: 3,
        teamwork: 3,
        analytical: 3,
        creative: 3,
        leadership: 3,
        detail_oriented: 3,
      },
      moduleD: {
        autonomy: 3,
        stability: 3,
        helping_others: 3,
        innovation: 3,
        prestige: 3,
        social_impact: 3,
      },
      moduleE: {
        industri_vs_publik: 0.5,
        gaji_vs_passion: 0.5,
      },
    },
    expectedKeywords: [],
    type: 'flat_edge_case',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Fetch semua prodi dari Supabase
// ─────────────────────────────────────────────────────────────────────────────
async function fetchProdiFromDb() {
  const all = [];
  const PAGE = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('prodi')
      .select('*, ptn ( nama_ptn, provinsi_1, jenis_ptn )')
      .range(from, from + PAGE - 1)
      .order('kode_prodi', { ascending: true });

    if (error) throw new Error(`Fetch prodi gagal: ${error.message}`);
    if (!data || data.length === 0) break;

    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  return all;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN STRESS TEST RUNNER
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('  ArahKita — Stress Test & Anti-Hardcode Validation (Pure Vector Engine)');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  // 1. Fetch data prodi dari DB
  console.log('🔄 Mengambil data prodi dari Supabase...');
  let prodiList;
  try {
    prodiList = await fetchProdiFromDb();
    console.log(`✅ Loaded ${prodiList.length} prodi dari database.\n`);
  } catch (e) {
    console.error(`❌ Gagal terhubung ke Supabase: ${e.message}`);
    process.exit(1);
  }

  let totalPassed = 0;
  const totalScenarios = STRESS_SCENARIOS.length;

  // 2. Loop setiap skenario
  for (const scenario of STRESS_SCENARIOS) {
    console.log(`───────────────────────────────────────────────────────────────────────────`);
    console.log(`📌 ${scenario.title}`);
    console.log(`───────────────────────────────────────────────────────────────────────────`);

    // A. Build 26D student vector
    const studentVector = buildStudentVector(scenario.answers);
    const varianceCheck = checkRiasecVariance(studentVector);
    const isFlat = varianceCheck.isFlat;
    const stdDev = varianceCheck.stdDev;

    // Log vector & standard deviation
    console.log(`  26D Student Vector (sample first 12 dims):`);
    console.log(`   [${studentVector.slice(0, 12).map((v) => v.toFixed(2)).join(', ')}, ...]`);
    console.log(`  Standard Deviation RIASEC: ${stdDev.toFixed(4)} (${(stdDev * 100).toFixed(2)}%)`);
    console.log(`  Low Variance / Bingung Minat: ${isFlat ? 'YES (Flag Active 🚩)' : 'NO (Clear Preference)'}`);

    // Hitung riasec_result dari modul A
    const scoreEntries = Object.entries(scenario.answers.moduleA)
      .map(([trait, raw]) => ({ trait, raw, percentage: Math.round((raw / 15) * 100) }))
      .sort((a, b) => b.percentage - a.percentage);

    const topTraits = scoreEntries.slice(0, 3).map((e) => e.trait);
    const topHollandCode = topTraits.map((t) => t[0]).join('');

    const student = {
      student_vector: studentVector,
      riasec_result: { topTraits, topHollandCode, scores: scenario.answers.moduleA },
      academic_scores: scenario.answers.moduleB,
      must_have_traits_met: [],
    };

    // B. Run matching pipeline untuk seluruh prodi
    const matchResults = prodiList
      .map((prodi) => {
        const prodiNorm = {
          ...prodi,
          major_vector: parseVector(prodi.major_vector),
          riasec_profile: prodi.riasec_profile || {},
          akademik_minimum: prodi.akademik_minimum || {},
          must_have_traits: prodi.must_have_traits || [],
          prospek_karir: prodi.prospek_karir || {},
          nama_ptn: prodi.ptn?.nama_ptn || '',
          provinsi_1: prodi.ptn?.provinsi_1 || 'Indonesia',
          jenis_ptn: prodi.ptn?.jenis_ptn || 'Akademik',
        };

        const matchResult = runMatchingPipeline(student, prodiNorm);
        return { prodi: prodiNorm, ...matchResult };
      })
      .filter((r) => !r.eliminated);

    // C. Sort & Group by generic major name
    matchResults.sort((a, b) => b.finalScore - a.finalScore);
    const groupedResults = groupByNamaProdi(matchResults);

    // D. Evaluasi khusus per tipe skenario
    if (scenario.type === 'normal') {
      const top3Matches = groupedResults.slice(0, 3).map((m, i) => ({
        ...m,
        rank: i + 1,
        strategi: m.category === 'aman' ? 'Aman' : m.category === 'target' ? 'Target' : 'Reach',
      }));

      console.log(`  Top 3 Hasil Rekomendasi (Pure Vector Math):`);
      top3Matches.forEach((m, idx) => {
        console.log(
          `   ${idx + 1}. [${m.strategi.toUpperCase()}] ${m.prodi.nama_prodi_generic} — FinalScore: ${m.finalScorePercent}% (MatchScore: ${Math.round(m.matchScore * 100)}%, mode: ${m.matchMode})`
        );
      });

      const top3Names = top3Matches.map((m) => m.prodi.nama_prodi_generic.toUpperCase());
      const isMatched = scenario.expectedKeywords.some((keyword) =>
        top3Names.some((nama) => nama.includes(keyword.toUpperCase()))
      );

      if (isMatched) {
        console.log(`  ASSERTION: ✅ PASS (Top 3 relevan dengan rumpun sasaran)\n`);
        totalPassed++;
      } else {
        console.log(`  ASSERTION: ❌ FAIL (Top 3 "${top3Names.join(', ')}" tidak memuat keyword sasaran)\n`);
      }
    } else if (scenario.type === 'flat_edge_case') {
      // Skenario D: Flat Profile
      const crossRumpunFlag = isFlat;
      const top5SubRumpuns = new Set(
        groupedResults.slice(0, 5).map((m) => m.prodi.sub_rumpun || m.prodi.nama_prodi_generic)
      );

      console.log(`  Top 5 Rekomendasi Lintas Rumpun (Cross-Rumpun Explorer):`);
      groupedResults.slice(0, 5).forEach((m, idx) => {
        console.log(
          `   ${idx + 1}. ${m.prodi.nama_prodi_generic} [Sub-Rumpun: ${m.prodi.sub_rumpun || 'Umum'}] — FinalScore: ${m.finalScorePercent}%`
        );
      });

      const hasDiversity = top5SubRumpuns.size >= 2;
      const passFlatTest = crossRumpunFlag && hasDiversity;

      console.log(`  Assertion Checks:`);
      console.log(`   • Low Variance Flag (stdDev < 0.10) : ${crossRumpunFlag ? '✅ TRUE' : '❌ FALSE'}`);
      console.log(`   • Cross-Rumpun Diversity            : ${hasDiversity ? `✅ TRUE (${top5SubRumpuns.size} sub-rumpun)` : '❌ FALSE'}`);

      if (passFlatTest) {
        console.log(`  ASSERTION: ✅ PASS (Deteksi profil flat & variasi lintas rumpun bekerja sempurna)\n`);
        totalPassed++;
      } else {
        console.log(`  ASSERTION: ❌ FAIL (Flat profile detection gagal)\n`);
      }
    }
  }

  // 3. Laporan Akhir
  console.log('═══════════════════════════════════════════════════════════════════════════');
  if (totalPassed === totalScenarios) {
    console.log(`  🎉 ✅ PASSED: Pure Vector Engine Valid & Dynamic (${totalPassed}/${totalScenarios} Skenario Berhasil)`);
  } else {
    console.log(`  ⚠️ ❌ FAILED: ${totalPassed}/${totalScenarios} Skenario Berhasil`);
  }
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  process.exit(totalPassed === totalScenarios ? 0 : 1);
}

main().catch((err) => {
  console.error('\n💥 Test runner crash:', err.message);
  process.exit(1);
});
