'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, DollarSign, Database, TrendingUp, Sparkles, Building, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setStats(json.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">Memuat data metrik administrator...</p>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Pengguna', value: stats?.totalUsers || 0, icon: Users, color: 'from-blue-500 to-indigo-600', badge: '+18% bulan ini' },
    { title: 'Langganan Premium Aktif', value: stats?.activePremium || 0, icon: Crown, color: 'from-amber-500 to-amber-600', badge: 'Freemium Converter' },
    { title: 'Estimasi Pendapatan', value: `Rp ${(stats?.totalRevenue || 0).toLocaleString('id-ID')}`, icon: DollarSign, color: 'from-emerald-500 to-emerald-700', badge: 'QRIS & Voucher' },
    { title: 'Data PTN & Prodi Synced', value: `${stats?.totalPtn ?? 0} PTN / ${stats?.totalProdi ?? 0} Prodi`, icon: Database, color: 'from-purple-500 to-purple-700', badge: 'Cloud Supabase' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Dashboard Ringkasan Admin</h1>
        <p className="text-xs text-slate-500">Monitor pengguna, pendapatan langganan, dan sinkronisasi data Supabase Cloud.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500">{card.title}</span>
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900 leading-tight">{card.value}</h3>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {card.badge}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Analytics Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            Grafik Pertumbuhan Pengguna & Transaksi Pendapatan Harian
          </h3>
          <span className="text-xs text-slate-400">Tahun 2026</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.userGrowthTrend || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="siswa" name="Siswa Terdaftar" stroke="#3157AC" fill="#3157AC" fillOpacity={0.2} />
              <Area type="monotone" dataKey="guru_bk" name="Guru BK Terdaftar" stroke="#F5A623" fill="#F5A623" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
