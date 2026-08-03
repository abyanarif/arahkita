import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  // If profiles table not yet created, return empty gracefully
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status'); // 'free' or 'premium'
    const search = searchParams.get('search');

    let queryBuilder = supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (role && role !== 'all') {
      queryBuilder = queryBuilder.eq('role', role);
    }
    if (status === 'premium') {
      queryBuilder = queryBuilder.eq('is_premium', true);
    } else if (status === 'free') {
      queryBuilder = queryBuilder.eq('is_premium', false);
    }
    if (search) {
      queryBuilder = queryBuilder.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,school_name.ilike.%${search}%`);
    }

    const { data: users, error } = await queryBuilder;
    if (error) {
      // Table may not exist yet — return empty list instead of 500
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({ success: true, count: 0, data: [], note: 'profiles table not yet created — run supabase_schema.sql first' });
      }
      throw error;
    }

    return NextResponse.json({ success: true, count: users ? users.length : 0, data: users || [] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, is_premium, valid_days = 30, role } = body;

    if (!user_id) {
      return NextResponse.json({ success: false, message: 'User ID wajib diisi' }, { status: 400 });
    }

    const updates = { is_premium: Boolean(is_premium) };

    if (is_premium) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (parseInt(valid_days) || 30));
      updates.premium_until = expiryDate.toISOString();
    } else {
      updates.premium_until = null;
    }

    if (role && ['siswa', 'guru_bk', 'admin'].includes(role)) {
      updates.role = role;
    }

    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', user_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Status akses user ${updated.email} berhasil diperbarui menjadi ${is_premium ? 'PREMIUM' : 'FREE'}.`,
      data: updated
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
