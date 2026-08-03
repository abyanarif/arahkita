import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Helper: safe count query that returns 0 if table doesn't exist yet
async function safeCount(table, filters = {}) {
  try {
    let q = supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
    Object.entries(filters).forEach(([col, val]) => {
      q = q.eq(col, val);
    });
    const { count, error } = await q;
    if (error) return 0;
    return count || 0;
  } catch (_) {
    return 0;
  }
}

export async function GET() {
  try {
    // Core data stats (always available - seeded)
    const [totalPtn, totalProdi, totalHistoris] = await Promise.all([
      safeCount('ptn'),
      safeCount('prodi'),
      safeCount('historis_seleksi')
    ]);

    // Auth-dependent stats (may be 0 until profiles table is created via supabase_schema.sql)
    const [totalUsers, activePremium] = await Promise.all([
      safeCount('profiles'),
      safeCount('profiles', { is_premium: true })
    ]);

    // Revenue from successful transactions
    let totalRevenue = 0;
    try {
      const { data: transactions } = await supabaseAdmin
        .from('transactions')
        .select('amount')
        .eq('status', 'success');
      totalRevenue = (transactions || []).reduce((acc, t) => acc + (t.amount || 0), 0);
    } catch (_) {}

    // Growth trend chart data – real user counts per month where available,
    // supplemented with cumulative-growth projections for months without data
    let userGrowthTrend = [];
    try {
      const { data: profileRows } = await supabaseAdmin
        .from('profiles')
        .select('created_at, role');

      if (profileRows && profileRows.length > 0) {
        // Aggregate real signups by month
        const monthMap = {};
        profileRows.forEach((p) => {
          const d = new Date(p.created_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!monthMap[key]) monthMap[key] = { siswa: 0, guru_bk: 0 };
          if (p.role === 'guru_bk') monthMap[key].guru_bk += 1;
          else monthMap[key].siswa += 1;
        });

        const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        userGrowthTrend = Object.entries(monthMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-7)
          .map(([key, counts]) => {
            const [, month] = key.split('-');
            return {
              month: monthLabels[parseInt(month, 10) - 1],
              siswa: counts.siswa,
              guru_bk: counts.guru_bk
            };
          });
      }
    } catch (_) {}

    // If no real data yet, use a minimal placeholder trend
    if (userGrowthTrend.length === 0) {
      const now = new Date();
      const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      userGrowthTrend = [
        { month: monthLabels[(now.getMonth() + 10) % 12], siswa: 0, guru_bk: 0 },
        { month: monthLabels[(now.getMonth() + 11) % 12], siswa: 0, guru_bk: 0 },
        { month: monthLabels[now.getMonth()], siswa: totalUsers, guru_bk: 0 }
      ];
    }

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activePremium,
        totalPtn,
        totalProdi,
        totalHistoris,
        totalRevenue,
        userGrowthTrend
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
