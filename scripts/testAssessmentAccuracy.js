/**
 * scripts/testAssessmentAccuracy.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Integration Test: Validasi Akurasi Assessment & Recommendation Engine
 *
 * Menjalankan:
 *   node scripts/testAssessmentAccuracy.js
 *
 * Menguji 3 Skenario Profil Siswa:
 *   1. Profil Informatika / Tech (I & C tinggi, Math/Komputer)
 *   2. Profil Kedokteran / Kesehatan (I & S tinggi, Biologi/Kimia)
 *   3. Profil Ekonomi / Bisnis / Manajemen (E & C tinggi, Leadership/Akuntansi)
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
  clean = clean.replace(/\s*\((S1|D4|D3|D2|D1)\)/i, '');
  clean = clean.replace(/\s+PSDKU.*$/i, '');
  clean = clean.replace(/\s+KAMPUS.*$/i, '');
  clean = clean.replace(/\s+\d{3,}$/, '').trim().toUpperCase();

  if (/DOKTER HEWAN|KEDOKTERAN HEWAN/i.test(clean)) return 'KEDOKTERAN HEWAN';
  if (/PENDIDIKAN DOKTER GIGI|KEDOKTERAN GIGI/i.test(clean)) return 'KEDOKTERAN GIGI';
  if (/PENDIDIKAN DOKTER|^KEDOKTERAN$/i.test(clean)) return 'KEDOKTERAN';
  if (/PENDIDIKAN APOTEKER|^FARMASI$/i.test(clean)) return 'FARMASI';

  return clean;
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
// DEFINISI 3 SKENARIO PROFIL KUIS
// ─────────────────────────────────────────────────────────────────────────────
const TEST_SCENARIOS = [
  {
    id: 1,
    title: 'SKENARIO 1: PROFIL INFORMATIKA / TECH',
    answers: {
      moduleA: {
        Realistic: 9,      // sedang
        Investigative: 15, // max
        Artistic: 3,       // rendah
        Social: 3,         // rendah
        Enterprising: 6,    // sedang-rendah
        Conventional: 14,  // tinggi
      },
      moduleB: {
        matematika: 95,
        fisika: 85,
        kimia: 75,
        biologi: 60,
        bahasa_indo: 85,
        bahasa_ing: 90,
      },
      moduleC: {
        analytical: 6,
        detail_oriented: 5,
        practical: 4,
        creative: 3,
        leadership: 2,
        outdoor: 1,
      },
      moduleD: {
        autonomy: 5,
        innovation: 5,
        stability: 4,
        helping_others: 2,
        prestige: 3,
        social_impact: 2,
      },
      moduleE: {
        industri_vs_publik: 0.9,
        gaji_vs_passion: 0.8,
      },
    },
    expectedKeywords: ['INFORMATIKA', 'TEKNOLOGI INFORMASI', 'SISTEM INFORMASI', 'KOMPUTER', 'CYBER'],
  },
  {
    id: 2,
    title: 'SKENARIO 2: PROFIL KEDOKTERAN / KESEHATAN',
    answers: {
      moduleA: {
        Realistic: 6,
        Investigative: 15, // max
        Artistic: 3,
        Social: 14,        // tinggi
        Enterprising: 4,
        Conventional: 8,
      },
      moduleB: {
        matematika: 85,
        fisika: 80,
        kimia: 95,
        biologi: 98,
        bahasa_indo: 88,
        bahasa_ing: 85,
      },
      moduleC: {
        analytical: 5,
        teamwork: 5,
        detail_oriented: 5,
        practical: 4,
        creative: 2,
        leadership: 2,
      },
      moduleD: {
        helping_others: 6,
        social_impact: 5,
        stability: 5,
        autonomy: 3,
        prestige: 3,
        innovation: 3,
      },
      moduleE: {
        industri_vs_publik: 0.3,
        gaji_vs_passion: 0.4,
      },
    },
    expectedKeywords: ['KEDOKTERAN', 'DOKTER', 'KEPERAWATAN', 'FARMASI', 'KESEHATAN MASYARAKAT', 'GIZI'],
  },
  {
    id: 3,
    title: 'SKENARIO 3: PROFIL EKONOMI / BISNIS / MANAJEMEN',
    answers: {
      moduleA: {
        Realistic: 4,
        Investigative: 7,
        Artistic: 4,
        Social: 8,
        Enterprising: 15, // max
        Conventional: 14, // tinggi
      },
      moduleB: {
        matematika: 90,
        fisika: 65,
        kimia: 65,
        biologi: 60,
        bahasa_indo: 92,
        bahasa_ing: 90,
      },
      moduleC: {
        leadership: 6,
        analytical: 5,
        teamwork: 4,
        creative: 3,
        detail_oriented: 4,
        outdoor: 1,
      },
      moduleD: {
        prestige: 6,
        autonomy: 5,
        stability: 4,
        social_impact: 3,
        innovation: 4,
        helping_others: 2,
      },
      moduleE: {
        industri_vs_publik: 0.9,
        gaji_vs_passion: 0.85,
      },
    },
    expectedKeywords: ['MANAJEMEN', 'AKUNTANSI', 'BISNIS DIGITAL', 'EKONOMI', 'KEUANGAN'],
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
// MAIN INTEGRATION TEST SUITE
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log('  ArahKita — Integration Test: Assessment & Matching Engine');
  console.log('═════════════════════════════════════════════════════════════════\n');

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
  const totalScenarios = TEST_SCENARIOS.length;

  // 2. Loop setiap skenario
  for (const scenario of TEST_SCENARIOS) {
    console.log(`─────────────────────────────────────────────────────────────────`);
    console.log(`📌 ${scenario.title}`);
    console.log(`─────────────────────────────────────────────────────────────────`);

    // A. Build student vector
    const studentVector = buildStudentVector(scenario.answers);
    
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

    // D. Ambil Top 3 Rekomendasi (Top 3 Highest FinalScore)
    const top3Matches = groupedResults.slice(0, 3).map((m, i) => ({
      ...m,
      rank: i + 1,
      strategi: m.category === 'aman' ? 'Aman' : m.category === 'target' ? 'Target' : 'Reach',
    }));

    // E. Cetak Top 3 Rekomendasi
    console.log(`  Holland Code  : ${topHollandCode} (${topTraits.join(', ')})`);
    console.log(`  Top 3 Hasil Rekomendasi:`);
    top3Matches.forEach((m, idx) => {
      const nama = m.prodi.nama_prodi_generic;
      console.log(
        `   ${idx + 1}. [${m.strategi.toUpperCase()}] ${nama} — Skor: ${m.finalScorePercent}% (${m.ptn_count} PTN, mode: ${m.matchMode})`
      );
    });

    // F. Evaluasi apakah expected keywords muncul di Top 3
    const top3Names = top3Matches.map((m) => m.prodi.nama_prodi_generic.toUpperCase());
    const isMatched = scenario.expectedKeywords.some((keyword) =>
      top3Names.some((nama) => nama.includes(keyword.toUpperCase()))
    );

    if (isMatched) {
      console.log(`  RESULT: ✅ PASS (Jurusan sasaran cocok di Top 3)\n`);
      totalPassed++;
    } else {
      console.log(`  RESULT: ❌ FAIL (Jurusan sasaran "${scenario.expectedKeywords.join('/')}" tidak muncul di Top 3)\n`);
    }
  }

  // 3. Ringkasan Pengujian
  console.log('═════════════════════════════════════════════════════════════════');
  if (totalPassed === totalScenarios) {
    console.log(`  🎉 ✅ PASSED: Matching Engine 100% Akurat (${totalPassed}/${totalScenarios} Skenario Berhasil)`);
  } else {
    console.log(`  ⚠️ ❌ FAILED: ${totalPassed}/${totalScenarios} Skenario Berhasil`);
  }
  console.log('═════════════════════════════════════════════════════════════════\n');

  process.exit(totalPassed === totalScenarios ? 0 : 1);
}

main().catch((err) => {
  console.error('\n💥 Test runner crash:', err.message);
  process.exit(1);
});
