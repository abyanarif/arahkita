'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  AlertTriangle,
  BarChart2,
  PlusCircle,
  School,
  CheckCircle2,
  UserCheck,
  Search,
  Filter,
  ShieldAlert,
  ChevronRight,
  Plus,
  X
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function DashboardBkPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedKelas, setSelectedKelas] = useState('Semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [prodiOptions, setProdiOptions] = useState([]);

  // Form New Student State
  const [formData, setFormData] = useState({
    nama: '',
    kelas: 'XII MIPA 1',
    sekolah: 'SMA Negeri 1 Jakarta',
    skor_utbk_avg: 680,
    riasec_top: 'Investigative',
    pilihan_1_prodi_kode: '',
    pilihan_2_prodi_kode: '',
    status_rekomendasi: 'Target'
  });

  const fetchBkData = async () => {
    setLoading(true);
    try {
      const q = selectedKelas !== 'Semua' ? `?kelas=${selectedKelas}` : '';
      const res = await fetch(`/api/guru-bk${q}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBkData();
    fetch('/api/prodi')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setProdiOptions(json.data);
          if (json.data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              pilihan_1_prodi_kode: json.data[0].kode_prodi,
              pilihan_2_prodi_kode: json.data.length > 1 ? json.data[1].kode_prodi : json.data[0].kode_prodi
            }));
          }
        }
      });
  }, [selectedKelas]);

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/guru-bk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        setFormData({
          nama: '',
          kelas: 'XII MIPA 1',
          sekolah: 'SMA Negeri 1 Jakarta',
          skor_utbk_avg: 680,
          riasec_top: 'Investigative',
          pilihan_1_prodi_kode: prodiOptions[0]?.kode_prodi || '',
          pilihan_2_prodi_kode: prodiOptions[1]?.kode_prodi || '',
          status_rekomendasi: 'Target'
        });
        fetchBkData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const COLORS_PIE = ['#3157AC', '#F5A623', '#10B981', '#6366F1', '#EC4899', '#64748B'];

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#3157AC] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-600 font-medium">Memuat Dashboard Guru BK & Pemetaan Sekolah...</p>
      </div>
    );
  }

  const pieData = data?.stats?.riasecDistribution
    ? Object.keys(data.stats.riasecDistribution).map((key) => ({
        name: key,
        value: data.stats.riasecDistribution[key]
      }))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 mb-2">
            <School className="w-4 h-4 text-indigo-600" />
            Portal Kerjasama B2B Sekolah & Konseling Guru BK
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Dashboard Pemetaan Pilihan SNBP / SNBT Siswa
          </h1>
          <p className="text-sm text-slate-600">
            SMA Negeri 1 Jakarta - Tahun Ajaran 2025/2026
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-xl bg-[#3157AC] hover:bg-[#223F82] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Data Siswa Baru
        </button>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Total Siswa Terdaftar</span>
            <Users className="w-5 h-5 text-[#3157AC]" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{data?.stats?.totalSiswa || 0} Siswa</p>
          <p className="text-xs text-slate-500">Telah Mengikuti Kuis Minat Bakat</p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Deteksi Bentrokan Pilihan</span>
            <AlertTriangle className="w-5 h-5 text-[#F5A623]" />
          </div>
          <p className="text-3xl font-extrabold text-[#F5A623]">{data?.stats?.totalConflicts || 0} Prodi</p>
          <p className="text-xs text-slate-500">Potensi "Sikut-Sikutan" Antar Siswa</p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Status Konseling BK</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">85%</p>
          <p className="text-xs text-slate-500">Peta Pilihan Telah Divalidasi</p>
        </div>
      </div>

      {/* DETEKSI BENTROKAN / CONFLICT WARNING WIDGET ("SIKUT-SIKUTAN") */}
      {data?.conflicts && data.conflicts.length > 0 && (
        <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-amber-900">
            <div className="w-10 h-10 rounded-xl bg-[#F5A623] flex items-center justify-center text-white shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Peringatan Bentrokan Pilihan Utama ("Sikut-Sikutan" Detector)</h3>
              <p className="text-xs text-amber-800">
                Terdeteksi beberapa siswa dari sekolah yang sama menargetkan prodi yang persis sama sebagai Pilihan Ke-1. Guru BK disarankan mengadakan konseling agar kuota sekolah terdistribusi optimal!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {data.conflicts.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.nama_prodi}</h4>
                    <p className="text-xs text-[#3157AC] font-medium">{item.nama_ptn}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    {item.siswaList.length} Siswa Bentrok
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Siswa yang Mengambil Pilihan Ini:</span>
                  <div className="space-y-1">
                    {item.siswaList.map((st, sIdx) => (
                      <div key={sIdx} className="flex justify-between items-center text-xs p-1.5 bg-slate-50 rounded-lg">
                        <span className="font-semibold text-slate-800">{st.nama} ({st.kelas})</span>
                        <span className="font-bold text-[#3157AC]">Skor UTBK: {st.skor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANALYTICS SECTION (RIASEC PIE CHART & CLASS FILTER) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart Widget */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#3157AC]" />
            Distribusi Kepribadian RIASEC Siswa
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrolled Students Table */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#3157AC]" />
                Rekap Data Pilihan Siswa
              </h3>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700"
                >
                  <option value="Semua">Semua Kelas</option>
                  <option value="XII MIPA 1">XII MIPA 1</option>
                  <option value="XII MIPA 2">XII MIPA 2</option>
                  <option value="XII IPS 1">XII IPS 1</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Skor Avg</th>
                    <th className="p-3">Top RIASEC</th>
                    <th className="p-3">Pilihan 1</th>
                    <th className="p-3">Pilihan 2</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.students?.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{s.nama}</td>
                      <td className="p-3">{s.kelas}</td>
                      <td className="p-3 font-semibold text-[#3157AC]">{s.skor_utbk_avg}</td>
                      <td className="p-3 font-semibold text-[#D48813]">{s.riasec_top}</td>
                      <td className="p-3 font-medium text-slate-800">
                        {s.p1_nama_prodi || 'Unmapped'} ({s.p1_nama_ptn})
                      </td>
                      <td className="p-3 text-slate-600">
                        {s.p2_nama_prodi || 'Unmapped'} ({s.p2_nama_ptn})
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status_rekomendasi === 'Safe'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status_rekomendasi === 'Target'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {s.status_rekomendasi}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ADD NEW STUDENT MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-slate-900">Input Data Siswa Baru</h2>

              <form onSubmit={handleAddStudentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#3157AC]"
                    placeholder="misal: Muhammad Rizky"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kelas</label>
                    <select
                      value={formData.kelas}
                      onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="XII MIPA 1">XII MIPA 1</option>
                      <option value="XII MIPA 2">XII MIPA 2</option>
                      <option value="XII IPS 1">XII IPS 1</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Skor Avg UTBK / Rapor</label>
                    <input
                      type="number"
                      required
                      value={formData.skor_utbk_avg}
                      onChange={(e) => setFormData({ ...formData, skor_utbk_avg: parseFloat(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#3157AC]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilihan 1 (Prodi Target)</label>
                  <select
                    value={formData.pilihan_1_prodi_kode}
                    onChange={(e) => setFormData({ ...formData, pilihan_1_prodi_kode: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    {prodiOptions.map((p) => (
                      <option key={`m1-${p.kode_prodi}`} value={p.kode_prodi}>
                        {p.nama_prodi} - {p.nama_ptn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilihan 2 (Prodi Cadangan)</label>
                  <select
                    value={formData.pilihan_2_prodi_kode}
                    onChange={(e) => setFormData({ ...formData, pilihan_2_prodi_kode: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    {prodiOptions.map((p) => (
                      <option key={`m2-${p.kode_prodi}`} value={p.kode_prodi}>
                        {p.nama_prodi} - {p.nama_ptn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#3157AC] hover:bg-[#223F82] text-white font-bold text-sm shadow-md transition-all"
                  >
                    Simpan Data Siswa
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
