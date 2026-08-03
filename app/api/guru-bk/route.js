import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const kelas = searchParams.get('kelas');

    let sql = `
      SELECT s.*, 
        p1.nama_prodi as p1_nama_prodi, ptn1.nama_ptn as p1_nama_ptn,
        p2.nama_prodi as p2_nama_prodi, ptn2.nama_ptn as p2_nama_ptn
      FROM siswa s
      LEFT JOIN prodi p1 ON s.pilihan_1_prodi_kode = p1.kode_prodi
      LEFT JOIN ptn ptn1 ON p1.id_ptn = ptn1.id_ptn
      LEFT JOIN prodi p2 ON s.pilihan_2_prodi_kode = p2.kode_prodi
      LEFT JOIN ptn ptn2 ON p2.id_ptn = ptn2.id_ptn
      WHERE 1=1
    `;
    const params = [];

    if (kelas && kelas !== 'Semua') {
      sql += ` AND s.kelas = ?`;
      params.push(kelas);
    }

    sql += ` ORDER BY s.skor_utbk_avg DESC`;

    const students = await query(sql, params);

    const riasecCounts = {
      Investigative: 0,
      Realistic: 0,
      Artistic: 0,
      Social: 0,
      Enterprising: 0,
      Conventional: 0
    };

    students.forEach((st) => {
      if (st.riasec_top && riasecCounts[st.riasec_top] !== undefined) {
        riasecCounts[st.riasec_top] += 1;
      }
    });

    const conflictMap = {};
    students.forEach((st) => {
      if (st.pilihan_1_prodi_kode) {
        const key = st.pilihan_1_prodi_kode;
        if (!conflictMap[key]) {
          conflictMap[key] = {
            kode_prodi: key,
            nama_prodi: st.p1_nama_prodi || key,
            nama_ptn: st.p1_nama_ptn || 'PTN Target',
            siswaList: []
          };
        }
        conflictMap[key].siswaList.push({
          nama: st.nama,
          kelas: st.kelas,
          skor: st.skor_utbk_avg
        });
      }
    });

    const conflicts = Object.values(conflictMap).filter((item) => item.siswaList.length > 1);

    return NextResponse.json({
      success: true,
      stats: {
        totalSiswa: students.length,
        riasecDistribution: riasecCounts,
        totalConflicts: conflicts.length
      },
      students,
      conflicts
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama, kelas, sekolah, skor_utbk_avg, riasec_top, pilihan_1_prodi_kode, pilihan_2_prodi_kode, status_rekomendasi } = body;

    if (!nama || !kelas || !sekolah) {
      return NextResponse.json({ success: false, message: 'Data siswa belum lengkap' }, { status: 400 });
    }

    const res = await query(
      `
      INSERT INTO siswa (nama, kelas, sekolah, skor_utbk_avg, riasec_top, pilihan_1_prodi_kode, pilihan_2_prodi_kode, status_rekomendasi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        nama,
        kelas,
        sekolah,
        skor_utbk_avg || 650.0,
        riasec_top || 'Investigative',
        pilihan_1_prodi_kode || '311001',
        pilihan_2_prodi_kode || '332001',
        status_rekomendasi || 'Target'
      ]
    );

    return NextResponse.json({ success: true, id: res.lastInsertRowid });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
