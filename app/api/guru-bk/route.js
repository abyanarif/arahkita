import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { data: siswaList, error: siswaError } = await supabase
      .from('siswa')
      .select('*')
      .order('nama', { ascending: true });

    if (siswaError) throw siswaError;

    const enrichedSiswa = await Promise.all(
      (siswaList || []).map(async (s) => {
        let choice1 = null;
        let choice2 = null;

        if (s.pilihan_1_prodi_kode) {
          const { data: p1 } = await supabase
            .from('prodi')
            .select('kode_prodi, nama_prodi, ptn(nama_ptn)')
            .eq('kode_prodi', s.pilihan_1_prodi_kode)
            .single();
          if (p1) {
            choice1 = {
              kode_prodi: p1.kode_prodi,
              nama_prodi: p1.nama_prodi,
              nama_ptn: p1.ptn?.nama_ptn || ''
            };
          }
        }

        if (s.pilihan_2_prodi_kode) {
          const { data: p2 } = await supabase
            .from('prodi')
            .select('kode_prodi, nama_prodi, ptn(nama_ptn)')
            .eq('kode_prodi', s.pilihan_2_prodi_kode)
            .single();
          if (p2) {
            choice2 = {
              kode_prodi: p2.kode_prodi,
              nama_prodi: p2.nama_prodi,
              nama_ptn: p2.ptn?.nama_ptn || ''
            };
          }
        }

        return {
          ...s,
          choice1,
          choice2
        };
      })
    );

    // Calculate choice conflicts
    const conflictMap = {};
    enrichedSiswa.forEach((s) => {
      if (s.pilihan_1_prodi_kode) {
        conflictMap[s.pilihan_1_prodi_kode] = (conflictMap[s.pilihan_1_prodi_kode] || 0) + 1;
      }
      if (s.pilihan_2_prodi_kode) {
        conflictMap[s.pilihan_2_prodi_kode] = (conflictMap[s.pilihan_2_prodi_kode] || 0) + 1;
      }
    });

    const prodiBentrokList = Object.entries(conflictMap)
      .filter(([_, count]) => count > 1)
      .map(([kode, count]) => ({ kode_prodi: kode, jumlah_peminat_sekolah: count }));

    return NextResponse.json({
      success: true,
      data: {
        siswa: enrichedSiswa,
        totalSiswa: enrichedSiswa.length,
        prodiBentrok: prodiBentrokList
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
