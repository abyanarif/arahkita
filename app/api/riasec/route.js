import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { scores } = body; // e.g. { R: 4, I: 9, A: 3, S: 8, E: 5, C: 2 }

    if (!scores || typeof scores !== 'object') {
      return NextResponse.json({ success: false, message: 'Skor RIASEC tidak valid' }, { status: 400 });
    }

    const sortedTypes = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type);

    const topCategoryLetter = sortedTypes[0] || 'I';

    const categoryMap = {
      R: 'Realistic',
      I: 'Investigative',
      A: 'Artistic',
      S: 'Social',
      E: 'Enterprising',
      C: 'Conventional'
    };

    const primaryCategoryName = categoryMap[topCategoryLetter] || 'Investigative';

    const { data: jurusanMasterList } = await supabase
      .from('jurusan_master')
      .select('*')
      .eq('kategori_riasec', primaryCategoryName);

    const { data: prodiRecommendations } = await supabase
      .from('prodi')
      .select('kode_prodi, nama_prodi, jenjang, daya_tampung_sekarang, ptn(nama_ptn, provinsi_1)')
      .limit(6);

    const formattedRecs = (prodiRecommendations || []).map((p) => ({
      ...p,
      nama_ptn: p.ptn?.nama_ptn || '',
      provinsi_1: p.ptn?.provinsi_1 || ''
    }));

    return NextResponse.json({
      success: true,
      data: {
        topHollandCode: sortedTypes.slice(0, 3).join(''),
        primaryCategory: primaryCategoryName,
        jurusanMaster: jurusanMasterList || [],
        prodiRecommendations: formattedRecs
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
