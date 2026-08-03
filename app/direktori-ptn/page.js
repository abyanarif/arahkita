'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Building,
  BarChart2,
  X,
  ExternalLink,
  Users,
  ChevronRight,
  Calculator,
  ShieldAlert,
  Info,
  Award,
  BookOpen,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

export default function DirektoriPtnPage() {
  const [prodis, setProdis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedJalur, setSelectedJalur] = useState('SNBT'); // 'SNBT' or 'SNBP'
  const [selectedJenjang, setSelectedJenjang] = useState('Semua');
  const [selectedJenisPtn, setSelectedJenisPtn] = useState('Semua');
  
  // Modal detail state
  const [selectedProdi, setSelectedProdi] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('SNBT'); // 'SNBT' or 'SNBP'

  const fetchProdis = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      queryParams.set('jalur', selectedJalur);
      if (selectedJenjang !== 'Semua') queryParams.set('jenjang', selectedJenjang);
      if (selectedJenisPtn !== 'Semua') queryParams.set('jenis_ptn', selectedJenisPtn);

      const res = await fetch(`/api/prodi?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProdis(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdis();
  }, [selectedJalur, selectedJenjang, selectedJenisPtn]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProdis();
  };

  const openDetailModal = async (kodeProdi) => {
    setModalLoading(true);
    setSelectedProdi(null);
    setActiveModalTab(selectedJalur);
    try {
      const res = await fetch(`/api/prodi?kode_prodi=${kodeProdi}`);
      const data = await res.json();
      if (data.success) {
        setSelectedProdi(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setModalLoading(false);
    }
  };

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Sangat Ketat':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Ketat':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF4FF] border border-[#3157AC]/30 text-xs font-bold text-[#3157AC]">
          <BarChart2 className="w-4 h-4 text-[#3157AC]" />
          Direktori Kampus & Peta Persaingan SNBT & SNBP 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Cari Program Studi & Analisis Daya Tampung PTN
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
          Eksplorasi data resmi PTN se-Indonesia, tren peminat 5 tahun terakhir, dan perbandingan rasio keketatan jalur SNBT (UTBK) vs SNBP (Prestasi Rapor).
        </p>
      </div>

      {/* JALUR SELEKSI TOGGLE SWITCHER & SEARCH BAR */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
        {/* Jalur Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jalur Seleksi:</span>
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setSelectedJalur('SNBT')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedJalur === 'SNBT'
                    ? 'bg-[#3157AC] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
                SNBT (Jalur UTBK / Tes)
              </button>
              <button
                onClick={() => setSelectedJalur('SNBP')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedJalur === 'SNBP'
                    ? 'bg-[#F5A623] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-white" />
                SNBP (Jalur Prestasi / Rapor)
              </button>
            </div>
          </div>

          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            Menampilkan Kuota {selectedJalur} 2026
          </span>
        </div>

        {/* Form Search & Filters */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama prodi atau universitas (misal: Informatika, Kedokteran, UI, UGM)..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#3157AC] text-sm"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedJenjang}
              onChange={(e) => setSelectedJenjang(e.target.value)}
              className="px-3 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#3157AC]"
            >
              <option value="Semua">Semua Jenjang</option>
              <option value="S1">S1</option>
              <option value="D4">D4</option>
              <option value="D3">D3</option>
            </select>

            <select
              value={selectedJenisPtn}
              onChange={(e) => setSelectedJenisPtn(e.target.value)}
              className="px-3 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#3157AC]"
            >
              <option value="Semua">Semua Jenis PTN</option>
              <option value="Akademik">Akademik</option>
              <option value="Vokasi">Vokasi</option>
              <option value="PTKIN">PTKIN</option>
            </select>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#3157AC] hover:bg-[#223F82] text-white font-bold text-sm shadow-md transition-all shrink-0"
            >
              Cari Prodi
            </button>
          </div>
        </form>
      </div>

      {/* PRODI LIST GRID */}
      {loading ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-10 h-10 border-4 border-[#3157AC] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Memuat data prodi PTN se-Indonesia...</p>
        </div>
      ) : prodis.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Info className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Prodi tidak ditemukan</h3>
          <p className="text-sm text-slate-500">Coba ubah kata kunci atau reset filter pencarianmu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prodis.map((p) => (
            <motion.div
              key={p.kode_prodi}
              whileHover={{ y: -3 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#3157AC]/40 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-[#EFF4FF] text-[#3157AC]">
                    {p.jenjang} - {p.jenis_ptn}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getBadgeStyle(
                      p.status_keketatan
                    )}`}
                  >
                    {p.status_keketatan} ({p.keketatan_persen}%)
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{p.nama_prodi}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 font-medium">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.nama_ptn}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{p.provinsi_1}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400 block">Daya Tampung {selectedJalur}:</span>
                  <span className="font-bold text-slate-800 text-sm">{p.daya_tampung_aktif} Kursi</span>
                </div>

                <button
                  onClick={() => openDetailModal(p.kode_prodi)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#3157AC] hover:text-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1"
                >
                  Detail & Komparasi <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* DETAIL PRODI MODAL WITH SIDE-BY-SIDE SNBP & SNBT COMPARISON */}
      <AnimatePresence>
        {(modalLoading || selectedProdi) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 relative"
            >
              <button
                onClick={() => {
                  setSelectedProdi(null);
                  setModalLoading(false);
                }}
                className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {modalLoading ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-[#3157AC] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-slate-600">Memuat analisis komparasi SNBP vs SNBT...</p>
                </div>
              ) : (
                selectedProdi && (
                  <div className="space-y-6">
                    {/* Header Info */}
                    <div className="space-y-2 pr-8">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EFF4FF] text-[#3157AC]">
                          Kode Prodi: {selectedProdi.kode_prodi}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          Jenjang {selectedProdi.jenjang}
                        </span>
                      </div>
                      <h2 className="text-2xl font-extrabold text-slate-900">{selectedProdi.nama_prodi}</h2>
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-semibold">
                        <Building className="w-4 h-4 text-[#3157AC]" />
                        <span>{selectedProdi.nama_ptn} ({selectedProdi.provinsi_1})</span>
                      </div>
                    </div>

                    {/* COMPARISON CARDS: SNBP VS SNBT */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* SNBP Card */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF8EB] to-amber-50/50 border border-amber-200 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-[#D48813] flex items-center gap-1">
                            <Award className="w-4 h-4 text-[#F5A623]" /> JALUR SNBP (RAPOR)
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(selectedProdi.statusKeketatanSnbp)}`}>
                            {selectedProdi.statusKeketatanSnbp} ({selectedProdi.keketatanSnbpPersen}%)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-500 block">Daya Tampung SNBP</span>
                            <span className="font-bold text-slate-900 text-base">{selectedProdi.daya_tampung_snbp || '-'} Kursi</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Peminat Terakhir</span>
                            <span className="font-bold text-slate-900 text-base">
                              {selectedProdi.latestSnbp ? selectedProdi.latestSnbp.peminat.toLocaleString('id-ID') : '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* SNBT Card */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#EFF4FF] to-blue-50/50 border border-blue-200 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-[#3157AC] flex items-center gap-1">
                            <Sparkles className="w-4 h-4 text-[#3157AC]" /> JALUR SNBT (UTBK)
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(selectedProdi.statusKeketatanSnbt)}`}>
                            {selectedProdi.statusKeketatanSnbt} ({selectedProdi.keketatanSnbtPersen}%)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-500 block">Daya Tampung SNBT</span>
                            <span className="font-bold text-slate-900 text-base">{selectedProdi.daya_tampung_snbt || '-'} Kursi</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Peminat Terakhir</span>
                            <span className="font-bold text-slate-900 text-base">
                              {selectedProdi.latestSnbt ? selectedProdi.latestSnbt.peminat.toLocaleString('id-ID') : '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MODAL TABS FOR HISTORICAL CHARTS */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <BarChart2 className="w-4 h-4 text-[#3157AC]" />
                          Grafik Tren Historis 5 Tahun
                        </h3>
                        <div className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                          <button
                            onClick={() => setActiveModalTab('SNBT')}
                            className={`px-3 py-1 rounded-md font-bold transition-all ${
                              activeModalTab === 'SNBT' ? 'bg-[#3157AC] text-white' : 'text-slate-600'
                            }`}
                          >
                            SNBT (UTBK)
                          </button>
                          <button
                            onClick={() => setActiveModalTab('SNBP')}
                            className={`px-3 py-1 rounded-md font-bold transition-all ${
                              activeModalTab === 'SNBP' ? 'bg-[#F5A623] text-white' : 'text-slate-600'
                            }`}
                          >
                            SNBP (Rapor)
                          </button>
                        </div>
                      </div>

                      {/* Active Chart */}
                      <div className="h-64 w-full bg-white p-3 rounded-2xl border border-slate-200">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={activeModalTab === 'SNBP' ? selectedProdi.historySnbp : selectedProdi.historySnbt}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="tahun" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="peminat"
                              name="Jumlah Peminat"
                              stroke={activeModalTab === 'SNBP' ? '#F5A623' : '#3157AC'}
                              fill={activeModalTab === 'SNBP' ? '#F5A623' : '#3157AC'}
                              fillOpacity={0.2}
                            />
                            <Area
                              type="monotone"
                              dataKey="daya_tampung"
                              name="Daya Tampung"
                              stroke="#10B981"
                              fill="#10B981"
                              fillOpacity={0.3}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Historical Rincian Table */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Tabel Rincian Historis {activeModalTab}
                      </h4>
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-xs text-left text-slate-700">
                          <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-200">
                            <tr>
                              <th className="p-3">Tahun</th>
                              <th className="p-3">Peminat</th>
                              <th className="p-3">Daya Tampung</th>
                              {activeModalTab === 'SNBP' && <th className="p-3">Diterima</th>}
                              <th className="p-3">Keketatan (%)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(activeModalTab === 'SNBP' ? selectedProdi.historySnbp : selectedProdi.historySnbt)?.map((h) => (
                              <tr key={h.id} className="hover:bg-slate-50">
                                <td className="p-3 font-semibold text-slate-900">{h.tahun}</td>
                                <td className="p-3">{h.peminat.toLocaleString('id-ID')} orang</td>
                                <td className="p-3">{h.daya_tampung} kursi</td>
                                {activeModalTab === 'SNBP' && <td className="p-3 font-semibold">{h.terima || h.daya_tampung} orang</td>}
                                <td className="p-3 font-bold text-[#3157AC]">{h.keketatan_persen}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Similar Major Recommendations */}
                    {selectedProdi.similarProdi && selectedProdi.similarProdi.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-sm font-bold text-slate-900">Rekomendasi PTN Lain dengan Jurusan Serupa:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedProdi.similarProdi.map((sim) => (
                            <div key={sim.kode_prodi} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                              <div className="flex justify-between items-center">
                                <h5 className="font-bold text-slate-900 text-xs">{sim.nama_prodi}</h5>
                                <span className="text-[10px] font-semibold text-[#3157AC]">{sim.jenjang}</span>
                              </div>
                              <p className="text-xs text-slate-600">{sim.nama_ptn} ({sim.provinsi_1})</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Action CTA */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-end">
                      <Link
                        href={`/kalkulator-peluang?prodi=${selectedProdi.kode_prodi}&jalur=${selectedJalur}`}
                        className="px-6 py-3 rounded-xl bg-[#F5A623] hover:bg-[#D48813] text-white font-bold text-sm shadow-md text-center flex items-center justify-center gap-2"
                      >
                        <Calculator className="w-4 h-4" /> Hitung Peluang ({selectedJalur}) Masuk Prodi Ini
                      </Link>
                    </div>
                  </div>
                )
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
