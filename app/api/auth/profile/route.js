import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Unauthorized: Auth header missing' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ success: false, message: 'Unauthorized / Invalid session' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // Fallback: Return profile synthesized from user metadata
      return NextResponse.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
          role: user.user_metadata?.role || 'siswa',
          school_name: user.user_metadata?.school_name || 'SMA Negeri 1 Indonesia',
          is_premium: false,
          premium_until: null
        }
      });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, school_name, role } = body;

    const updates = {
      id: user.id,
      email: user.email,
      full_name: full_name || user.user_metadata?.full_name || user.email,
      school_name: school_name || 'SMA Negeri 1 Indonesia',
    };
    if (role && ['siswa', 'guru_bk', 'admin'].includes(role)) {
      updates.role = role;
    }

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .upsert(updates)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: 'Profil berhasil diperbarui', data: updatedProfile });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
