import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const kode_prodi = searchParams.get('kode_prodi');
    const search = searchParams.get('search');
    const jenjang = searchParams.get('jenjang');
    const jenis_ptn = searchParams.get('jenis_ptn');
    const id_ptn = searchParams.get('id_ptn');
    const jalur = (searchParams.get('jalur') || 'SNBT').toUpperCase(); // 'SNBT' or 'SNBP'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : (search ? 500 : 200);

    // Single prodi detail request
    if (kode_prodi) {
      const prodiSql = `
        SELECT p.*, ptn.nama_ptn, ptn.jenis_ptn, ptn.provinsi_1, ptn.website 
        FROM prodi p 
        JOIN ptn ON p.id_ptn = ptn.id_ptn 
        WHERE p.kode_prodi = ?
      `;
      const prodiList = await query(prodiSql, [kode_prodi]);

      if (!prodiList || prodiList.length === 0) {
        return NextResponse.json({ success: false, message: 'Prodi tidak ditemukan' }, { status: 404 });
      }

      const prodi = prodiList[0];

      // Fetch 5-year SNBT history
      const historySnbt = await query(`SELECT * FROM historis_snbt WHERE kode_prodi = ? ORDER BY tahun ASC`, [kode_prodi]);
      // Fetch 5-year SNBP history
      const historySnbp = await query(`SELECT * FROM historis_snbp WHERE kode_prodi = ? ORDER BY tahun ASC`, [kode_prodi]);

      // Calculate latest keketatan status for SNBT
      const latestSnbt = historySnbt.length > 0 ? historySnbt[historySnbt.length - 1] : null;
      let statusKeketatanSnbt = 'Sedang';
      let keketatanSnbtPersen = latestSnbt ? latestSnbt.keketatan_persen : 10.0;
      if (keketatanSnbtPersen < 5.0) statusKeketatanSnbt = 'Sangat Ketat';
      else if (keketatanSnbtPersen <= 15.0) statusKeketatanSnbt = 'Ketat';

      // Calculate latest keketatan status for SNBP
      const latestSnbp = historySnbp.length > 0 ? historySnbp[historySnbp.length - 1] : null;
      let statusKeketatanSnbp = 'Sedang';
      let keketatanSnbpPersen = latestSnbp ? latestSnbp.keketatan_persen : 10.0;
      if (keketatanSnbpPersen < 5.0) statusKeketatanSnbp = 'Sangat Ketat';
      else if (keketatanSnbpPersen <= 15.0) statusKeketatanSnbp = 'Ketat';

      // Recommend similar prodi in other PTNs
      const keyword = prodi.nama_prodi.split(' ')[0] || '';
      const similarSql = `
        SELECT p.kode_prodi, p.nama_prodi, p.jenjang, p.daya_tampung_sekarang, p.daya_tampung_snbt, p.daya_tampung_snbp, ptn.nama_ptn, ptn.provinsi_1
        FROM prodi p
        JOIN ptn ON p.id_ptn = ptn.id_ptn
        WHERE p.nama_prodi LIKE ? AND p.kode_prodi != ?
        LIMIT 6
      `;
      const similarProdi = await query(similarSql, [`%${keyword}%`, kode_prodi]);

      return NextResponse.json({
        success: true,
        data: {
          ...prodi,
          historySnbt,
          historySnbp,
          latestSnbt,
          latestSnbp,
          keketatanSnbtPersen,
          statusKeketatanSnbt,
          keketatanSnbpPersen,
          statusKeketatanSnbp,
          similarProdi
        }
      });
    }

    // List & search prodi request
    let sql = `
      SELECT p.*, ptn.nama_ptn, ptn.jenis_ptn, ptn.provinsi_1, ptn.website 
      FROM prodi p 
      JOIN ptn ON p.id_ptn = ptn.id_ptn 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (p.nama_prodi LIKE ? OR ptn.nama_ptn LIKE ? OR p.kode_prodi LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (jenjang && jenjang !== 'Semua') {
      sql += ` AND p.jenjang = ?`;
      params.push(jenjang);
    }
    if (jenis_ptn && jenis_ptn !== 'Semua') {
      sql += ` AND ptn.jenis_ptn = ?`;
      params.push(jenis_ptn);
    }
    if (id_ptn) {
      sql += ` AND p.id_ptn = ?`;
      params.push(id_ptn);
    }

    sql += ` ORDER BY ptn.nama_ptn ASC, p.nama_prodi ASC LIMIT ${limit}`;

    const rawProdi = await query(sql, params);

    // Enrich prodi list based on selected jalur ('SNBT' or 'SNBP')
    const enrichedProdi = await Promise.all(
      rawProdi.map(async (p) => {
        const table = jalur === 'SNBP' ? 'historis_snbp' : 'historis_snbt';
        const h = await query(`SELECT * FROM ${table} WHERE kode_prodi = ? ORDER BY tahun DESC LIMIT 1`, [p.kode_prodi]);
        const latest = h.length > 0 ? h[0] : null;
        const keketatanPersen = latest ? latest.keketatan_persen : 10.0;
        let statusKeketatan = 'Sedang';
        if (keketatanPersen < 5.0) statusKeketatan = 'Sangat Ketat';
        else if (keketatanPersen <= 15.0) statusKeketatan = 'Ketat';

        const dayaTampungJalur = jalur === 'SNBP' 
          ? (p.daya_tampung_snbp || p.daya_tampung_sekarang) 
          : (p.daya_tampung_snbt || p.daya_tampung_sekarang);

        return {
          ...p,
          jalur,
          daya_tampung_aktif: dayaTampungJalur,
          peminat_terakhir: latest ? latest.peminat : 0,
          keketatan_persen: keketatanPersen,
          status_keketatan: statusKeketatan
        };
      })
    );

    return NextResponse.json({ success: true, count: enrichedProdi.length, jalur, data: enrichedProdi });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
