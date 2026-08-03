import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Harus login untuk menukar kode voucher' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ success: false, message: 'Sesi login tidak valid' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, message: 'Kode voucher harus diisi' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check voucher in database
    const { data: voucher, error: voucherError } = await supabaseAdmin
      .from('vouchers')
      .select('*')
      .eq('code', cleanCode)
      .single();

    if (voucherError || !voucher) {
      return NextResponse.json({ success: false, message: 'Kode voucher tidak valid atau tidak ditemukan' }, { status: 404 });
    }

    if (!voucher.is_active) {
      return NextResponse.json({ success: false, message: 'Kode voucher sudah tidak aktif' }, { status: 400 });
    }

    if (voucher.max_uses && voucher.used_count >= voucher.max_uses) {
      return NextResponse.json({ success: false, message: 'Batas kuota penggunaan voucher telah habis' }, { status: 400 });
    }

    // Calculate premium duration
    const validDays = voucher.valid_days || 30;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + validDays);

    // Update profile to Premium
    const { data: updatedProfile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        is_premium: true,
        premium_until: expiryDate.toISOString()
      })
      .select()
      .single();

    if (profileErr) throw profileErr;

    // Increment voucher used count
    await supabaseAdmin
      .from('vouchers')
      .update({ used_count: (voucher.used_count || 0) + 1 })
      .eq('id', voucher.id);

    // Log transaction
    await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: 0,
        status: 'success',
        payment_method: 'Voucher Redirection',
        voucher_code: cleanCode
      });

    return NextResponse.json({
      success: true,
      message: `Selamat! Voucher ${cleanCode} berhasil diaktifkan. Akses Premium berlaku hingga ${expiryDate.toLocaleDateString('id-ID')}`,
      data: updatedProfile
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
