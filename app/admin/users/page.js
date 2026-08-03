'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Crown, Shield, UserCheck, ShieldAlert, Check, X, Calendar } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const togglePremium = async (userId, currentPremium, validDays = 90) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          is_premium: !currentPremium,
          valid_days: validDays
        })
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage({ type: 'success', text: json.message });
        fetchUsers();
      } else {
        setActionMessage({ type: 'error', text: json.message });
      }
    } catch (e) {
      setActionMessage({ type: 'error', text: e.message });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Pengguna</h1>
        <p className="text-xs text-slate-500">Kelola pengguna terdaftar, perbarui peran akun, atau berikan akses Premium secara manual.</p>
      </div>

      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, atau asal sekolah..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-600"
          />
        </form>

        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">Semua Role</option>
            <option value="siswa">Siswa</option>
            <option value="guru_bk">Guru BK</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">Semua Status Akses</option>
            <option value="free">Free Only</option>
            <option value="premium">Premium Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Memuat daftar pengguna...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">Tidak ada pengguna ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                <tr>
                  <th className="p-3.5">Nama & Email</th>
                  <th className="p-3.5">Asal Sekolah</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status Akses</th>
                  <th className="p-3.5">Masa Aktif Premium</th>
                  <th className="p-3.5 text-right">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block">{u.full_name || 'Tanpa Nama'}</span>
                      <span className="text-slate-500 text-[11px]">{u.email}</span>
                    </td>
                    <td className="p-3.5 text-slate-700 font-medium">{u.school_name || '-'}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'guru_bk'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {u.is_premium ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-[#D48813] text-[10px] font-extrabold border border-amber-300 inline-flex items-center gap-1">
                          <Crown className="w-3 h-3 text-[#F5A623]" /> PREMIUM
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                          FREE
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {u.premium_until ? new Date(u.premium_until).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => togglePremium(u.id, u.is_premium, 90)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                          u.is_premium
                            ? 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        }`}
                      >
                        {u.is_premium ? 'Revoke Premium' : '+ Berikan Premium (90 Hari)'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
