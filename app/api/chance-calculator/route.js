import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

function calculatePassingScoreSnbt(keketatanPersen) {
  if (keketatanPersen <= 3.0) return 725;
  if (keketatanPersen <= 5.0) return 690;
  if (keketatanPersen <= 10.0) return 650;
  if (keketatanPersen <= 15.0) return 615;
  return 570;
}

function calculatePassingScoreSnbp(keketatanPersen) {
  if (keketatanPersen <= 3.0) return 93.5;
  if (keketatanPersen <= 5.0) return 91.0;
  if (keketatanPersen <= 10.0) return 88.5;
  if (keketatanPersen <= 15.0) return 86.0;
  return 83.0;
}

async function evaluateChoice(studentScore, prodiKode, jalur = 'SNBT') {
  const prodiSql = `
    SELECT p.*, ptn.nama_ptn, ptn.jenis_ptn, ptn.provinsi_1
    FROM prodi p
    JOIN ptn ON p.id_ptn = ptn.id_ptn
    WHERE p.kode_prodi = ?
  `;
  const prodiList = await query(prodiSql, [prodiKode]);

  if (!prodiList || prodiList.length === 0) return null;

  const prodi = prodiList[0];
  const table = jalur === 'SNBP' ? 'historis_snbp' : 'historis_snbt';
  const history = await query(`SELECT * FROM ${table} WHERE kode_prodi = ? ORDER BY tahun DESC LIMIT 1`, [prodiKode]);
  const latestHistory = history.length > 0 ? history[0] : null;

  const keketatan = latestHistory ? latestHistory.keketatan_persen : 10.0;
  const estimatedPassingScore = jalur === 'SNBP' 
    ? calculatePassingScoreSnbp(keketatan) 
    : calculatePassingScoreSnbt(keketatan);

  const scoreDiff = Math.round((studentScore - estimatedPassingScore) * 10) / 10;

  let category = 'Target';
  let badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  let probabilityPercent = 65;
  let summaryAdvice = '';

  const safeMargin = jalur === 'SNBP' ? 1.5 : 25;
  const reachMargin = jalur === 'SNBP' ? -1.0 : -15;

  if (scoreDiff >= safeMargin) {
    category = 'Safe (Aman)';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    probabilityPercent = Math.min(95, Math.round(75 + (jalur === 'SNBP' ? scoreDiff * 8 : scoreDiff * 0.5)));
    summaryAdvice = jalur === 'SNBP'
      ? 'Nilai Rapor kamu di atas rata-rata batas aman historis SNBP. Peluang elitis sekolah sangat baik!'
      : 'Nilai UTBK kamu berada di atas rata-rata batas aman historis SNBT. Peluang diterima sangat tinggi!';
  } else if (scoreDiff >= reachMargin) {
    category = 'Target (Cukup Bersaing)';
    badgeColor = 'bg-blue-100 text-blue-800 border-blue-300';
    probabilityPercent = Math.round(55 + (jalur === 'SNBP' ? scoreDiff * 10 : scoreDiff * 0.6));
    summaryAdvice = jalur === 'SNBP'
      ? 'Nilai Rapor kamu kompetitif untuk SNBP. Pastikan portofolio atau prestasi pendukung sudah lengkap.'
      : 'Nilai UTBK kamu cukup kompetitif. Pertimbangkan urutan pilihan ke-1 dan ke-2 secara strategis.';
  } else {
    category = 'Reach (Tantangan / Ketat)';
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
    probabilityPercent = Math.max(15, Math.round(40 + (jalur === 'SNBP' ? scoreDiff * 12 : scoreDiff * 0.7)));
    summaryAdvice = jalur === 'SNBP'
      ? 'SNBP jurusan ini sangat ketat. Disarankan menyiapkan pilihan ke-2 yang lebih aman atau fokus pada jalur tes SNBT.'
      : 'Peta persaingan prodi ini sangat ketat. Disarankan menyiapkan opsi pilihan ke-2 yang lebih aman.';
  }

  return {
    prodi,
    jalur,
    latestHistory,
    keketatan_persen: keketatan,
    estimatedPassingScore,
    scoreDiff,
    category,
    badgeColor,
    probabilityPercent,
    summaryAdvice
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { studentScore, choice1Kode, choice2Kode, jalur = 'SNBT' } = body;

    const parsedScore = parseFloat(studentScore);
    if (isNaN(parsedScore)) {
      return NextResponse.json({ success: false, message: 'Skor harus berupa angka' }, { status: 400 });
    }

    if (jalur === 'SNBP' && (parsedScore < 60 || parsedScore > 100)) {
      return NextResponse.json({ success: false, message: 'Nilai Rapor rata-rata untuk SNBP harus berkisar antara 60 - 100' }, { status: 400 });
    }
    if (jalur === 'SNBT' && (parsedScore < 300 || parsedScore > 1000)) {
      return NextResponse.json({ success: false, message: 'Skor UTBK untuk SNBT harus berkisar antara 300 - 1000' }, { status: 400 });
    }

    if (!choice1Kode) {
      return NextResponse.json({ success: false, message: 'Pilihan 1 prodi harus dipilih' }, { status: 400 });
    }

    const eval1 = await evaluateChoice(parsedScore, choice1Kode, jalur);
    const eval2 = choice2Kode ? await evaluateChoice(parsedScore, choice2Kode, jalur) : null;

    return NextResponse.json({
      success: true,
      data: {
        studentScore: parsedScore,
        jalur,
        choice1: eval1,
        choice2: eval2
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
