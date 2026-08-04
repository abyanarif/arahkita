/**
 * scripts/diagnosePtnPenyedia.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Diagnostic & Validation Script: Investigasi PTN Penyedia di Recommendations API
 *
 * Menjalankan:
 *   node scripts/diagnosePtnPenyedia.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  buildStudentVector,
  runMatchingPipeline,
  parseVector,
  VECTOR_SIZE,
} from '../lib/vectorMatcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Read .env.local
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

async function fetchAllProdi(client) {
  const all = [];
  const PAGE_SIZE = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await client
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
      .range(from, from + PAGE_SIZE - 1)
      .order('kode_prodi', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) break;

    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}

function normalizeNamaProdi(nama) {
  if (!nama) return 'JURUSAN TIDAK DIKETAHUI';
  let clean = nama.split(' - ')[0].trim();
  clean = clean.replace(/\s*\((S1|D4|D3|D2|D1)\)/i, '');
  clean = clean.replace(/\s+PSDKU.*$/i, '');
  clean = clean.replace(/\s+KAMPUS.*$/i, '');
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
            provinsi_1: result.prodi.provinsi_1,
            jenis_ptn: result.prodi.jenis_ptn,
            jenjang: result.prodi.jenjang,
            daya_tampung_snbt: result.prodi.daya_tampung_snbt,
            keketatan_snbt: result.prodi.keketatan_snbt,
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
          provinsi_1: result.prodi.provinsi_1,
          jenis_ptn: result.prodi.jenis_ptn,
          jenjang: result.prodi.jenjang,
          daya_tampung_snbt: result.prodi.daya_tampung_snbt,
          keketatan_snbt: result.prodi.keketatan_snbt,
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

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('  ArahKita — Diagnostic: PTN Penyedia pada Recommendations API');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  // 1. Cek Database Count
  console.log('🔍 [LANGKAH 1] Evaluasi Master Data di Supabase...');
  const { count: totalProdi } = await supabase.from('prodi').select('kode_prodi', { count: 'exact', head: true });
  const { count: farmasiProdi } = await supabase.from('prodi').select('kode_prodi', { count: 'exact', head: true }).ilike('nama_prodi', '%FARMASI%');

  console.log(`  • Total baris di tabel \`prodi\` Supabase : ${totalProdi} prodi`);
  console.log(`  • Total prodi dengan nama "FARMASI"      : ${farmasiProdi} prodi (di berbagai PTN)\n`);

  // 2. Simulasi API Fetch & Matching
  console.log('🚀 [LANGKAH 2] Simulasikan API Fetch (Paginated >5.000 rows)...');
  const prodiList = await fetchAllProdi(supabase);
  console.log(`  • Berhasil mengunduh : ${prodiList.length} prodi ke memori API.\n`);

  // Build student vector untuk profil kesehatan/farmasi
  const answers = {
    moduleA: { Investigative: 15, Social: 12, Conventional: 12, Realistic: 6, Artistic: 3, Enterprising: 3 },
    moduleB: { kimia: 95, biologi: 95, matematika: 85, bahasa_indo: 85, bahasa_ing: 85, fisika: 75 },
    moduleC: { analytical: 5, detail_oriented: 6, practical: 4, teamwork: 4 },
    moduleD: { helping_others: 5, stability: 5, precision: 5 },
    moduleE: { industri_vs_publik: 0.7, gaji_vs_passion: 0.6 },
  };

  const studentVector = buildStudentVector(answers);
  const student = {
    student_vector: studentVector,
    riasec_result: { topTraits: ['Investigative', 'Social', 'Conventional'], topHollandCode: 'ISC', scores: answers.moduleA },
    academic_scores: answers.moduleB,
  };

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
      return { prodi: prodiNorm, ...runMatchingPipeline(student, prodiNorm) };
    })
    .filter((r) => !r.eliminated);

  matchResults.sort((a, b) => b.finalScore - a.finalScore);
  const grouped = groupByNamaProdi(matchResults);

  // 3. Inspeksi Hasil Grouping untuk FARMASI
  console.log('📊 [LANGKAH 3] Hasil Grouping PTN Penyedia (Contoh: FARMASI):');
  const farmasiGroup = grouped.find((g) => g.prodi.nama_prodi_generic.includes('FARMASI'));

  if (farmasiGroup) {
    console.log(`  • Nama Jurusan Generic : ${farmasiGroup.prodi.nama_prodi_generic}`);
    console.log(`  • Skor Kecocokan      : ${farmasiGroup.finalScorePercent}% (${farmasiGroup.category.toUpperCase()})`);
    console.log(`  • Total PTN Penyedia  : ${farmasiGroup.ptn_count} PTN (Sebelumnya hanya 1-2 PTN!)`);
    console.log(`  • Sample PTN Penyedia (Top 10):`);
    farmasiGroup.ptn_list.slice(0, 10).forEach((ptn, idx) => {
      console.log(`      ${idx + 1}. ${ptn.nama_ptn} (${ptn.provinsi_1}) — ${ptn.daya_tampung_snbt || '-'} kursi SNBT`);
    });
  } else {
    console.log('  ⚠️ Farmasi tidak ditemukan di grouped results.');
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  if (farmasiGroup && farmasiGroup.ptn_count >= 30) {
    console.log('  🎉 ✅ DIAGNOSTIC & FIX PASSED: Seluruh PTN Penyedia Terbaca & Ter-grouping Lengkap!');
  } else {
    console.log('  ⚠️ FIX VERIFICATION FAILED');
  }
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('💥 Crash:', err.message);
  process.exit(1);
});
