import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: vouchers, error } = await supabaseAdmin
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, count: vouchers ? vouchers.length : 0, data: vouchers || [] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, discount_percent = 100, valid_days = 30, max_uses = 100 } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, message: 'Kode voucher wajib diisi' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');

    const { data: newVoucher, error } = await supabaseAdmin
      .from('vouchers')
      .insert({
        code: cleanCode,
        discount_percent: parseInt(discount_percent) || 100,
        valid_days: parseInt(valid_days) || 30,
        max_uses: parseInt(max_uses) || 100,
        used_count: 0,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Kode voucher ${cleanCode} berhasil dibuat!`,
      data: newVoucher
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID voucher wajib diisi' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('vouchers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Voucher berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
