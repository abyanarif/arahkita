/**
 * scripts/seedFromClaude.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeder script: baca major_psychometric_dataset.json → update tabel `prodi`
 * di Supabase dengan kolom psychometric (riasec_profile, major_vector, dll).
 *
 * Menjalankan:
 *   node scripts/seedFromClaude.js
 *
 * Strategi matching (berurutan, berhenti di match pertama):
 *   1. KEYWORD MATCH  — nama_prodi mengandung salah satu keyword dataset (case-insensitive)
 *   2. FALLBACK MATCH — nama_prodi mengandung kata kunci rumpun generik (TEKNIK, PENDIDIKAN, dll)
 *
 * Batch size: 50 UPDATE per round (hindari timeout / rate-limit Supabase)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { createClient } = require('@supabase/supabase-js');
const fs   = require('fs');
const path = require('path');

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

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE) {
  console.error('❌ Supabase credentials missing in process.env / .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Path dataset ─────────────────────────────────────────────────────────────
const DATASET_PATH = path.join(__dirname, '..', 'data', 'major_psychometric_dataset.json');
const BATCH_SIZE   = 50;        // jumlah UPDATE per batch
const VECTOR_SIZE  = 26;        // dimensi major_vector yang valid

// ── Validasi dimensi vector ───────────────────────────────────────────────────
function validateVector(vec, label) {
  if (!Array.isArray(vec) || vec.length !== VECTOR_SIZE) {
    throw new Error(`Vector "${label}" harus berupa array ${VECTOR_SIZE} elemen, dapat: ${vec?.length}`);
  }
  for (const v of vec) {
    if (typeof v !== 'number' || v < 0 || v > 1) {
      throw new Error(`Nilai vector "${label}" harus antara 0–1, dapat: ${v}`);
    }
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK RULES: map kata kunci rumpun → entry dataset
// Digunakan saat tidak ada keyword spesifik yang cocok dengan nama_prodi.
// Urutan penting: lebih spesifik dulu.
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_RULES = [
  // ── Kesehatan ──
  { test: /KEDOKTERAN GIGI|DENTAL|ORTODONTI/i,               keyword: 'KEDOKTERAN GIGI' },
  { test: /KEDOKTERAN|DOKTER|KLINIS|BEDAH/i,                  keyword: 'KEDOKTERAN' },
  { test: /KEPERAWATAN|NERS/i,                                keyword: 'KEPERAWATAN' },
  { test: /FARMASI|APOTEKER/i,                                keyword: 'FARMASI' },
  { test: /GIZI|NUTRISI/i,                                    keyword: 'GIZI' },
  { test: /KESEHATAN MASYARAKAT|KESMAS|EPIDEMIOLOGI/i,        keyword: 'KESEHATAN MASYARAKAT' },
  { test: /KESEHATAN/i,                                       keyword: 'KESEHATAN MASYARAKAT' },
  // ── Teknik spesifik ──
  { test: /TEKNIK SIPIL|KONSTRUKSI|TRANSPORTASI/i,            keyword: 'TEKNIK SIPIL' },
  { test: /TEKNIK ELEKTRO|ELEKTRONIKA|TELEKOMUNIKASI|ROBOTIKA|INSTRUMENTASI/i, keyword: 'TEKNIK ELEKTRO' },
  { test: /TEKNIK MESIN|MANUFAKTUR|OTOMOTIF/i,                keyword: 'TEKNIK MESIN' },
  { test: /TEKNIK INDUSTRI|MANAJEMEN REKAYASA|SISTEM PRODUKSI/i, keyword: 'TEKNIK INDUSTRI' },
  { test: /TEKNIK KIMIA|PETROKIMIA|BIOPROSES/i,               keyword: 'TEKNIK KIMIA' },
  { test: /TEKNIK LINGKUNGAN|SANITASI|REKAYASA LINGKUNGAN/i,  keyword: 'TEKNIK LINGKUNGAN' },
  { test: /TEKNIK GEODESI|GEOMATIKA|SURVEYING|PEMETAAN|GIS/i, keyword: 'TEKNIK GEODESI' },
  { test: /TEKNIK GEOLOGI|GEOLOGI|PERTAMBANGAN|GEOSAINS/i,    keyword: 'TEKNIK GEOLOGI' },
  { test: /TEKNIK PERKAPALAN|TEKNIK KELAUTAN|REKAYASA KELAUTAN/i, keyword: 'TEKNIK PERKAPALAN' },
  { test: /PERENCANAAN WILAYAH|PWK|PLANOLOGI|TATA KOTA/i,     keyword: 'PERENCANAAN WILAYAH DAN KOTA' },
  { test: /INFORMATIKA|KOMPUTER|PERANGKAT LUNAK|CYBER|TEKNOLOGI INFORMASI|SISTEM INFORMASI/i, keyword: 'INFORMATIKA' },
  { test: /SAINS DATA|DATA SCIENCE|BIG DATA/i,                keyword: 'SAINS DATA' },
  // ── Generik TEKNIK (harus setelah rule spesifik) ──
  { test: /TEKNIK/i,                                          keyword: 'TEKNIK INDUSTRI' },
  // ── Sains Murni ──
  { test: /MATEMATIKA|STATISTIKA|AKTUARIA/i,                  keyword: 'MATEMATIKA' },
  { test: /FISIKA|ASTRONOMI|GEOFISIKA/i,                      keyword: 'FISIKA' },
  { test: /KIMIA/i,                                           keyword: 'KIMIA' },
  { test: /BIOLOGI|BIOTEKNOLOGI|MIKROBIOLOGI|GENETIKA/i,      keyword: 'BIOLOGI' },
  // ── Ekonomi & Bisnis ──
  { test: /AKUNTANSI|AUDIT|PERPAJAKAN/i,                      keyword: 'AKUNTANSI' },
  { test: /KEUANGAN|PERBANKAN/i,                              keyword: 'AKUNTANSI' },
  { test: /MANAJEMEN/i,                                       keyword: 'MANAJEMEN' },
  { test: /EKONOMI PEMBANGUNAN|ILMU EKONOMI/i,                keyword: 'EKONOMI PEMBANGUNAN' },
  { test: /KEWIRAUSAHAAN|BISNIS DIGITAL|STARTUP|E-COMMERCE/i, keyword: 'BISNIS DIGITAL' },
  { test: /LOGISTIK/i,                                        keyword: 'TEKNIK INDUSTRI' },
  // ── Hukum & Sosial ──
  { test: /HUKUM/i,                                           keyword: 'HUKUM' },
  { test: /PSIKOLOGI/i,                                       keyword: 'PSIKOLOGI' },
  { test: /SOSIOLOGI|ANTROPOLOGI|ILMU SOSIAL/i,               keyword: 'SOSIOLOGI' },
  { test: /HUBUNGAN INTERNASIONAL|DIPLOMASI/i,                keyword: 'HUBUNGAN INTERNASIONAL' },
  { test: /ILMU KOMUNIKASI|JURNALISTIK|PUBLIC RELATIONS|PENYIARAN/i, keyword: 'ILMU KOMUNIKASI' },
  { test: /PERIKLANAN|ADVERTISING|HUMAS|BROADCASTING|MEDIA DIGITAL/i, keyword: 'PERIKLANAN' },
  // ── Sastra & Seni ──
  { test: /SASTRA|LINGUISTIK|BAHASA DAN SASTRA/i,             keyword: 'SASTRA INGGRIS' },
  { test: /DKV|DESAIN KOMUNIKASI VISUAL|DESAIN GRAFIS/i,      keyword: 'DKV' },
  { test: /DESAIN INTERIOR|PERANCANGAN RUANG/i,               keyword: 'DESAIN INTERIOR' },
  { test: /ARSITEKTUR|URBAN DESIGN/i,                         keyword: 'ARSITEKTUR' },
  { test: /FILM|TELEVISI|SINEMATOGRAFI/i,                     keyword: 'FILM' },
  { test: /SENI RUPA|SENI LUKIS|SENI PATUNG|SENI MURNI/i,    keyword: 'SENI RUPA' },
  { test: /DESAIN/i,                                          keyword: 'DKV' },
  { test: /SENI/i,                                            keyword: 'SENI RUPA' },
  // ── Pendidikan ──
  { test: /PGSD|GURU SEKOLAH DASAR|GURU SD/i,                 keyword: 'PGSD' },
  { test: /PENDIDIKAN BAHASA INGGRIS|PENDIDIKAN BAHASA INDONESIA|PENDIDIKAN BAHASA/i, keyword: 'PENDIDIKAN BAHASA' },
  { test: /PENDIDIKAN MATEMATIKA|PENDIDIKAN FISIKA|PENDIDIKAN IPA/i, keyword: 'PENDIDIKAN MATEMATIKA' },
  { test: /KEOLAHRAGAAN|PENDIDIKAN JASMANI|PJOK/i,            keyword: 'ILMU KEOLAHRAGAAN' },
  { test: /PENDIDIKAN/i,                                      keyword: 'PGSD' },
  // ── Pertanian & Agroteknologi ──
  { test: /AGROTEKNOLOGI|AGRIBISNIS|AGRONOMI|TANAH|PROTEKSI TANAMAN|PANGAN|HORTIKULTURA|PERKEBUNAN|AGROEKOTEKNOLOGI|PERTANIAN|AGRO/i, keyword: 'AGROTEKNOLOGI' },
  { test: /KEHUTANAN|KONSERVASI/i,                            keyword: 'KEHUTANAN' },
  { test: /PETERNAKAN|TERNAK|HEWAN|PAKAN/i,                   keyword: 'PETERNAKAN' },
  { test: /PERIKANAN|KELAUTAN|AKUAKULTUR|AKUATIK|PERAIRAN|IKAN|BAWAH LAUT/i, keyword: 'PERIKANAN' },
  { test: /LINGKUNGAN/i,                                      keyword: 'TEKNIK LINGKUNGAN' },
  // ── Pendidikan & Konseling ──
  { test: /PGSD|GURU SEKOLAH DASAR|GURU SD/i,                 keyword: 'PGSD' },
  { test: /PENDIDIKAN BAHASA INGGRIS|PENDIDIKAN BAHASA INDONESIA|PENDIDIKAN BAHASA|BAHASA/i, keyword: 'PENDIDIKAN BAHASA' },
  { test: /PENDIDIKAN MATEMATIKA|PENDIDIKAN FISIKA|PENDIDIKAN IPA/i, keyword: 'PENDIDIKAN MATEMATIKA' },
  { test: /KEOLAHRAGAAN|PENDIDIKAN JASMANI|PJOK|OLAHRAGA/i,   keyword: 'ILMU KEOLAHRAGAAN' },
  { test: /BIMBINGAN KONSELING|KONSELING/i,                   keyword: 'PSIKOLOGI' },
  { test: /PENDIDIKAN/i,                                      keyword: 'PGSD' },
  // ── Ekonomi, Bisnis & Administrasi ──
  { test: /AKUNTANSI|AUDIT|PERPAJAKAN/i,                      keyword: 'AKUNTANSI' },
  { test: /KEUANGAN|PERBANKAN/i,                              keyword: 'AKUNTANSI' },
  { test: /MANAJEMEN/i,                                       keyword: 'MANAJEMEN' },
  { test: /EKONOMI PEMBANGUNAN|ILMU EKONOMI|EKONOMI/i,        keyword: 'EKONOMI PEMBANGUNAN' },
  { test: /KEWIRAUSAHAAN|BISNIS DIGITAL|STARTUP|E-COMMERCE|KEWIRUSAHAAN|BISNIS/i, keyword: 'BISNIS DIGITAL' },
  { test: /LOGISTIK/i,                                        keyword: 'TEKNIK INDUSTRI' },
  { test: /ADMINISTRASI|PEMERINTAHAN|SEKRETARI/i,             keyword: 'ADMINISTRASI PUBLIK' },
  { test: /PERPUSTAKAAN|KEARSIPAN/i,                          keyword: 'ILMU PERPUSTAKAAN' },
  // ── Hukum, Sosial & Humaniora ──
  { test: /HUKUM|KRIMINOLOGI/i,                               keyword: 'HUKUM' },
  { test: /PSIKOLOGI/i,                                       keyword: 'PSIKOLOGI' },
  { test: /SOSIOLOGI|ANTROPOLOGI|ILMU SOSIAL|SEJARAH|FILSAFAT|KEBUDAYAAN/i, keyword: 'SOSIOLOGI' },
  { test: /HUBUNGAN INTERNASIONAL|DIPLOMASI/i,                keyword: 'HUBUNGAN INTERNASIONAL' },
  { test: /ILMU POLITIK|POLITIK/i,                            keyword: 'ILMU POLITIK' },
  { test: /ILMU KOMUNIKASI|JURNALISTIK|PUBLIC RELATIONS|PENYIARAN/i, keyword: 'ILMU KOMUNIKASI' },
  { test: /PERIKLANAN|ADVERTISING|HUMAS|BROADCASTING|MEDIA DIGITAL/i, keyword: 'PERIKLANAN' },
  // ── Pariwisata ──
  { test: /PARIWISATA|PERHOTELAN|HOSPITALITY|TATA BOGA|TATA HIDANG|WISATA|EKOWISATA/i, keyword: 'PARIWISATA' },
  // ── Default fallback catch-all per rumpun kata kunci ──
  { test: /REKAYASA|TEKNOLOGI/i,                              keyword: 'TEKNIK INDUSTRI' },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: cari entri dataset yang cocok dengan nama_prodi (keyword match)
// ─────────────────────────────────────────────────────────────────────────────
function findDatasetEntry(namaProdi, dataset) {
  const upper = (namaProdi || '').toUpperCase();

  // Iterasi setiap entri dataset
  for (const entry of dataset) {
    for (const kw of (entry.keywords || [])) {
      if (upper.includes(kw.toUpperCase())) {
        return { entry, matchedBy: `keyword:${kw}`, matchType: 'keyword' };
      }
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: build index dataset → key = keyword uppercase
// ─────────────────────────────────────────────────────────────────────────────
function buildDatasetIndex(dataset) {
  const idx = new Map();
  for (const entry of dataset) {
    for (const kw of (entry.keywords || [])) {
      idx.set(kw.toUpperCase(), entry);
    }
  }
  return idx;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: fallback rule match
// ─────────────────────────────────────────────────────────────────────────────
function findFallback(namaProdi, datasetIndex) {
  for (const rule of FALLBACK_RULES) {
    if (rule.test.test(namaProdi)) {
      const entry = datasetIndex.get(rule.keyword.toUpperCase());
      if (entry) {
        return { entry, matchedBy: `fallback:${rule.keyword}`, matchType: 'fallback' };
      }
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: build payload UPDATE dari satu dataset entry
// ─────────────────────────────────────────────────────────────────────────────
function buildPayload(entry) {
  // Validasi vector sebelum kirim
  validateVector(entry.major_vector, entry.sub_rumpun || 'unknown');

  return {
    riasec_profile:   entry.riasec_profile   || null,
    major_vector:     entry.major_vector      || null,
    gaya_kerja:       entry.gaya_kerja        || null,
    must_have_traits: entry.must_have_traits  || [],
    prospek_karir:    entry.prospek_karir     || null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: fetch SEMUA prodi secara paginated (Supabase limit 1000 per request)
// ─────────────────────────────────────────────────────────────────────────────
async function fetchAllProdi() {
  const all  = [];
  const PAGE = 1000;
  let from   = 0;

  while (true) {
    const { data, error } = await supabase
      .from('prodi')
      .select('kode_prodi, id_ptn, nama_prodi')
      .range(from, from + PAGE - 1)
      .order('kode_prodi', { ascending: true });

    if (error) throw new Error(`Fetch prodi [${from}] gagal: ${error.message}`);
    if (!data || data.length === 0) break;

    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  return all;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: update satu baris prodi
// ─────────────────────────────────────────────────────────────────────────────
async function updateProdi(kode_prodi, payload) {
  const { error } = await supabase
    .from('prodi')
    .update(payload)
    .eq('kode_prodi', kode_prodi);

  if (error) throw new Error(`UPDATE ${kode_prodi} gagal: ${error.message}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  ArahKita — Prodi Psychometric Seeder');
  console.log('  Dataset : data/major_psychometric_dataset.json');
  console.log('  Target  : Supabase tabel `prodi`');
  console.log('════════════════════════════════════════════════════════\n');

  // ── 1. Baca dataset ────────────────────────────────────────────────────────
  if (!fs.existsSync(DATASET_PATH)) {
    console.error(`❌ File tidak ditemukan: ${DATASET_PATH}`);
    process.exit(1);
  }

  let dataset;
  try {
    dataset = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf8'));
  } catch (e) {
    console.error(`❌ JSON parse error: ${e.message}`);
    process.exit(1);
  }

  // Validasi semua vector di dataset
  console.log(`📦 Dataset loaded: ${dataset.length} entri psychometric\n`);
  let validationErrors = 0;
  for (const entry of dataset) {
    try {
      validateVector(entry.major_vector, entry.sub_rumpun);
    } catch (e) {
      console.warn(`⚠️  Validasi gagal untuk "${entry.sub_rumpun}": ${e.message}`);
      validationErrors++;
    }
  }
  if (validationErrors > 0) {
    console.warn(`\n⚠️  ${validationErrors} entri dengan dimensi/nilai vector tidak valid (akan di-skip)\n`);
  }

  const datasetIndex = buildDatasetIndex(dataset);

  // ── 2. Ambil semua prodi dari Supabase ────────────────────────────────────
  console.log('🔄 Mengambil data prodi dari Supabase...');
  let prodiList;
  try {
    prodiList = await fetchAllProdi();
  } catch (e) {
    console.error(`❌ Gagal fetch prodi: ${e.message}`);
    process.exit(1);
  }
  console.log(`✅ Total prodi ditemukan: ${prodiList.length}\n`);

  // ── 3. Matching & build UPDATE queue ─────────────────────────────────────
  const queue = [];            // { kode_prodi, payload, namaProdi, matchedBy, matchType }
  const noMatch = [];          // prodi tanpa pasangan dataset

  for (const prodi of prodiList) {
    const nama = prodi.nama_prodi || '';

    // Prioritas 1: keyword match spesifik
    let result = findDatasetEntry(nama, dataset);

    // Prioritas 2: fallback rule
    if (!result) {
      result = findFallback(nama, datasetIndex);
    }

    if (result) {
      try {
        const payload = buildPayload(result.entry);
        queue.push({
          kode_prodi: prodi.kode_prodi,
          payload,
          namaProdi:  nama,
          matchedBy:  result.matchedBy,
          matchType:  result.matchType,
        });
      } catch (e) {
        console.warn(`⚠️  Skip "${nama}": ${e.message}`);
        noMatch.push({ nama, reason: e.message });
      }
    } else {
      noMatch.push({ nama, reason: 'no_match' });
    }
  }

  console.log(`📊 Hasil Matching:`);
  const kwCount = queue.filter((q) => q.matchType === 'keyword').length;
  const fbCount = queue.filter((q) => q.matchType === 'fallback').length;
  console.log(`   ✅ Keyword match  : ${kwCount}`);
  console.log(`   🔁 Fallback match : ${fbCount}`);
  console.log(`   ❌ Tidak cocok    : ${noMatch.length}`);
  console.log(`   ─────────────────────────────`);
  console.log(`   📋 Total akan di-UPDATE: ${queue.length}\n`);

  if (noMatch.length > 0) {
    console.log('── Prodi TIDAK COCOK (no match) ──');
    noMatch.forEach((n) => console.log(`   • ${n.nama} — ${n.reason}`));
    console.log('');
  }

  // ── 4. Eksekusi UPDATE secara batch ───────────────────────────────────────
  if (queue.length === 0) {
    console.log('⚠️  Tidak ada data yang perlu di-update. Selesai.');
    return;
  }

  console.log(`\n🚀 Memulai UPDATE (batch size: ${BATCH_SIZE})...\n`);

  let successCount = 0;
  let failCount    = 0;
  const failedItems = [];

  for (let i = 0; i < queue.length; i += BATCH_SIZE) {
    const batch = queue.slice(i, i + BATCH_SIZE);
    const batchNum  = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatch = Math.ceil(queue.length / BATCH_SIZE);

    process.stdout.write(`   Batch ${String(batchNum).padStart(3, ' ')}/${totalBatch} `);

    // Proses setiap item dalam batch secara paralel (max 10 concurrent)
    const concurrency = 10;
    for (let j = 0; j < batch.length; j += concurrency) {
      const chunk = batch.slice(j, j + concurrency);
      const results = await Promise.allSettled(
        chunk.map((item) => updateProdi(item.kode_prodi, item.payload))
      );

      results.forEach((res, k) => {
        const item = chunk[k];
        if (res.status === 'fulfilled') {
          successCount++;
          process.stdout.write('.');
        } else {
          failCount++;
          process.stdout.write('✗');
          failedItems.push({ kode_prodi: item.kode_prodi, nama: item.namaProdi, error: res.reason?.message });
        }
      });
    }

    process.stdout.write(` (${Math.min(i + BATCH_SIZE, queue.length)}/${queue.length})\n`);
  }

  // ── 5. Laporan akhir ──────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  SELESAI — Laporan Final');
  console.log('════════════════════════════════════════════════════════');
  console.log(`  ✅ Berhasil di-update : ${successCount} prodi`);
  console.log(`  ❌ Gagal              : ${failCount} prodi`);
  console.log(`  ⚠️  Tidak cocok       : ${noMatch.length} prodi`);
  console.log(`  ─────────────────────────────────────────────────────`);
  console.log(`  📊 Total prodi di DB  : ${prodiList.length}`);
  console.log(`  📦 Entri dataset      : ${dataset.length}`);

  if (failedItems.length > 0) {
    console.log('\n── UPDATE yang GAGAL ──');
    failedItems.forEach((f) => console.log(`   • [${f.kode_prodi}] ${f.nama} — ${f.error}`));
  }

  const coveragePercent = ((successCount / prodiList.length) * 100).toFixed(1);
  console.log(`\n  📈 Coverage: ${successCount}/${prodiList.length} = ${coveragePercent}% prodi ter-seed`);
  console.log('════════════════════════════════════════════════════════\n');

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('\n💥 Fatal error:', e.message);
  process.exit(1);
});
