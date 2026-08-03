import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'short' });

function buildUserGrowthTrend(profiles = []) {
  const grouped = new Map();

  profiles.forEach((profile) => {
    if (!profile.created_at) return;

    const createdAt = new Date(profile.created_at);
    if (Number.isNaN(createdAt.getTime())) return;

    const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
    const existing = grouped.get(key) || {
      date: new Date(createdAt.getFullYear(), createdAt.getMonth(), 1),
      month: monthFormatter.format(createdAt),
      siswa: 0,
      guru_bk: 0,
      admin: 0,
    };

    if (profile.role === 'guru_bk') {
      existing.guru_bk += 1;
    } else if (profile.role === 'admin') {
      existing.admin += 1;
    } else {
      existing.siswa += 1;
    }

    grouped.set(key, existing);
  });

  return Array.from(grouped.values())
    .sort((a, b) => a.date - b.date)
    .map(({ date, ...item }) => item);
}

export async function GET() {
  try {
    const { count: totalUsers, error: totalUsersError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    if (totalUsersError) throw totalUsersError;

    const { count: activePremium, error: activePremiumError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', true);
    if (activePremiumError) throw activePremiumError;

    const { count: totalPtn, error: totalPtnError } = await supabaseAdmin
      .from('ptn')
      .select('*', { count: 'exact', head: true });
    if (totalPtnError) throw totalPtnError;

    const { count: totalProdi, error: totalProdiError } = await supabaseAdmin
      .from('prodi')
      .select('*', { count: 'exact', head: true });
    if (totalProdiError) throw totalProdiError;

    const { count: totalHistoris, error: totalHistorisError } = await supabaseAdmin
      .from('historis_seleksi')
      .select('*', { count: 'exact', head: true });
    if (totalHistorisError) throw totalHistorisError;

    const { data: transactions, error: transactionsError } = await supabaseAdmin
      .from('transactions')
      .select('amount')
      .eq('status', 'success');
    if (transactionsError) throw transactionsError;

    const totalRevenue = (transactions || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('created_at, role')
      .order('created_at', { ascending: true });
    if (profilesError) throw profilesError;

    const userGrowthTrend = buildUserGrowthTrend(profiles || []);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        activePremium: activePremium || 0,
        totalPtn: totalPtn || 0,
        totalProdi: totalProdi || 0,
        totalSynced: (totalPtn || 0) + (totalProdi || 0),
        totalHistoris: totalHistoris || 0,
        totalRevenue,
        userGrowthTrend,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
