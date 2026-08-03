import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_ptn = searchParams.get('id_ptn');
    const jenis = searchParams.get('jenis');
    const search = searchParams.get('search');

    if (id_ptn) {
      const { data: ptnData, error: ptnError } = await supabase
        .from('ptn')
        .select('*')
        .eq('id_ptn', id_ptn)
        .single();

      if (ptnError || !ptnData) {
        return NextResponse.json({ success: false, message: 'PTN tidak ditemukan' }, { status: 404 });
      }

      const { data: prodiData } = await supabase
        .from('prodi')
        .select('*')
        .eq('id_ptn', id_ptn);

      return NextResponse.json({
        success: true,
        data: {
          ...ptnData,
          prodi_list: prodiData || []
        }
      });
    }

    let queryBuilder = supabase.from('ptn').select('*, prodi(count)');

    if (search) {
      queryBuilder = queryBuilder.or(`nama_ptn.ilike.%${search}%,kode_ptn.ilike.%${search}%`);
    }
    if (jenis && jenis !== 'Semua') {
      queryBuilder = queryBuilder.eq('jenis_ptn', jenis);
    }

    const { data: ptnList, error } = await queryBuilder.order('nama_ptn', { ascending: true });

    if (error) {
      throw error;
    }

    const formatted = (ptnList || []).map((item) => ({
      ...item,
      jumlah_prodi: item.prodi ? item.prodi[0]?.count || 0 : 0
    }));

    return NextResponse.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
