import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const jenis = searchParams.get('jenis');
    const provinsi = searchParams.get('provinsi');
    const search = searchParams.get('search');

    let sql = `SELECT * FROM ptn WHERE 1=1`;
    const params = [];

    if (jenis && jenis !== 'Semua') {
      sql += ` AND jenis_ptn = ?`;
      params.push(jenis);
    }
    if (provinsi && provinsi !== 'Semua') {
      sql += ` AND (provinsi_1 = ? OR provinsi_2 = ?)`;
      params.push(provinsi, provinsi);
    }
    if (search) {
      sql += ` AND (nama_ptn LIKE ? OR kode_ptn LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY nama_ptn ASC LIMIT 100`;

    const ptns = await query(sql, params);
    return NextResponse.json({ success: true, data: ptns });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
