import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const kode_prodi = searchParams.get('kode_prodi');
    const search = searchParams.get('search');
    const jenjang = searchParams.get('jenjang');
    const jenis_ptn = searchParams.get('jenis_ptn');
    const id_ptn = searchParams.get('id_ptn');
    const jalur = (searchParams.get('jalur') || 'SNBT').toUpperCase();
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : (search ? 500 : 200);

    // Single prodi detail request
    if (kode_prodi) {
      const { data: prodiData, error: prodiError } = await supabase
        .from('prodi')
        .select('*, ptn(*)')
        .eq('kode_prodi', kode_prodi)
        .single();

      if (prodiError || !prodiData) {
        return NextResponse.json({ success: false, message: 'Prodi tidak ditemukan' }, { status: 404 });
      }

      // Fetch SNBT & SNBP history
      const { data: historySnbtRaw } = await supabase
        .from('historis_seleksi')
        .select('*')
        .eq('kode_prodi', kode_prodi)
        .eq('jalur', 'SNBT')
        .order('tahun', { ascending: true });

      const { data: historySnbpRaw } = await supabase
        .from('historis_seleksi')
        .select('*')
        .eq('kode_prodi', kode_prodi)
        .eq('jalur', 'SNBP')
        .order('tahun', { ascending: true });

      const historySnbt = historySnbtRaw || [];
      const historySnbp = historySnbpRaw || [];

      const latestSnbt = historySnbt.length > 0 ? historySnbt[historySnbt.length - 1] : null;
      let statusKeketatanSnbt = 'Sedang';
      let keketatanSnbtPersen = latestSnbt ? latestSnbt.keketatan_persen : 10.0;
      if (keketatanSnbtPersen < 5.0) statusKeketatanSnbt = 'Sangat Ketat';
      else if (keketatanSnbtPersen <= 15.0) statusKeketatanSnbt = 'Ketat';

      const latestSnbp = historySnbp.length > 0 ? historySnbp[historySnbp.length - 1] : null;
      let statusKeketatanSnbp = 'Sedang';
      let keketatanSnbpPersen = latestSnbp ? latestSnbp.keketatan_persen : 10.0;
      if (keketatanSnbpPersen < 5.0) statusKeketatanSnbp = 'Sangat Ketat';
      else if (keketatanSnbpPersen <= 15.0) statusKeketatanSnbp = 'Ketat';

      const keyword = prodiData.nama_prodi.split(' ')[0] || '';
      const { data: similarRaw } = await supabase
        .from('prodi')
        .select('kode_prodi, nama_prodi, jenjang, daya_tampung_sekarang, daya_tampung_snbt, daya_tampung_snbp, ptn(nama_ptn, provinsi_1)')
        .ilike('nama_prodi', `%${keyword}%`)
        .neq('kode_prodi', kode_prodi)
        .limit(6);

      const similarProdi = (similarRaw || []).map((s) => ({
        kode_prodi: s.kode_prodi,
        nama_prodi: s.nama_prodi,
        jenjang: s.jenjang,
        daya_tampung_sekarang: s.daya_tampung_sekarang,
        daya_tampung_snbt: s.daya_tampung_snbt,
        daya_tampung_snbp: s.daya_tampung_snbp,
        nama_ptn: s.ptn?.nama_ptn || '',
        provinsi_1: s.ptn?.provinsi_1 || ''
      }));

      return NextResponse.json({
        success: true,
        data: {
          ...prodiData,
          nama_ptn: prodiData.ptn?.nama_ptn || '',
          jenis_ptn: prodiData.ptn?.jenis_ptn || 'Akademik',
          provinsi_1: prodiData.ptn?.provinsi_1 || 'Indonesia',
          website: prodiData.ptn?.website || '',
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

    // List & search prodis
    let queryBuilder = supabase
      .from('prodi')
      .select('*, ptn!inner(*)');

    if (search) {
      queryBuilder = queryBuilder.or(`nama_prodi.ilike.%${search}%,kode_prodi.ilike.%${search}%,ptn.nama_ptn.ilike.%${search}%`);
    }
    if (jenjang && jenjang !== 'Semua') {
      queryBuilder = queryBuilder.eq('jenjang', jenjang);
    }
    if (jenis_ptn && jenis_ptn !== 'Semua') {
      queryBuilder = queryBuilder.eq('ptn.jenis_ptn', jenis_ptn);
    }
    if (id_ptn) {
      queryBuilder = queryBuilder.eq('id_ptn', id_ptn);
    }

    const { data: rawProdi, error } = await queryBuilder.limit(limit);

    if (error) throw error;

    // Enrich prodi list with latest historical competition data
    const enrichedProdi = await Promise.all(
      (rawProdi || []).map(async (p) => {
        const { data: history } = await supabase
          .from('historis_seleksi')
          .select('*')
          .eq('kode_prodi', p.kode_prodi)
          .eq('jalur', jalur)
          .order('tahun', { ascending: false })
          .limit(1);

        const latest = history && history.length > 0 ? history[0] : null;
        const keketatanPersen = latest ? latest.keketatan_persen : 10.0;
        let statusKeketatan = 'Sedang';
        if (keketatanPersen < 5.0) statusKeketatan = 'Sangat Ketat';
        else if (keketatanPersen <= 15.0) statusKeketatan = 'Ketat';

        const dayaTampungJalur = jalur === 'SNBP' 
          ? (p.daya_tampung_snbp || p.daya_tampung_sekarang) 
          : (p.daya_tampung_snbt || p.daya_tampung_sekarang);

        return {
          ...p,
          nama_ptn: p.ptn?.nama_ptn || '',
          jenis_ptn: p.ptn?.jenis_ptn || 'Akademik',
          provinsi_1: p.ptn?.provinsi_1 || 'Indonesia',
          website: p.ptn?.website || '',
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
