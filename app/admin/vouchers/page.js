'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Plus, Trash2, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Voucher Form
  const [code, setCode] = useState('');
  const [validDays, setValidDays] = useState('90');
  const [maxUses, setMaxUses] = useState('500');
  
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/vouchers');
      const json = await res.json();
      if (json.success) {
        setVouchers(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          valid_days: validDays,
          max_uses: maxUses
        })
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: json.message });
        setCode('');
        fetchVouchers();
      } else {
        setMessage({ type: 'error', text: json.message });
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus voucher ini?')) return;
    try {
      const res = await fetch(`/api/admin/vouchers?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchVouchers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(''), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Voucher & License Key Generator</h1>
        <p className="text-xs text-slate-500">Buat dan kelola kode voucher aktivasi akses Premium untuk sekolah & siswa.</p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form Generator */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-purple-600" />
          Generate Kode Voucher Baru
        </h3>

        <form onSubmit={handleCreateVoucher} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Kode Voucher</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="misal: ARAHKITASMB2026"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold uppercase focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Durasi Aktif (Hari)</label>
            <input
              type="number"
              required
              value={validDays}
              onChange={(e) => setValidDays(e.target.value)}
              placeholder="30"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Maksimal Kuota Pakai</label>
            <input
              type="number"
              required
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="500"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting || !code.trim()}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {submitting ? 'Membuat...' : '+ Generate Voucher'}
            </button>
          </div>
        </form>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Daftar Voucher Aktif</h3>
          <span className="text-xs text-slate-500 font-semibold">Total {vouchers.length} Voucher</span>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Memuat voucher...</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">Belum ada voucher yang dibuat.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                <tr>
                  <th className="p-3.5">Kode Voucher</th>
                  <th className="p-3.5">Durasi Akses</th>
                  <th className="p-3.5">Penggunaan / Kuota</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-extrabold text-purple-700 flex items-center gap-2">
                      <span className="bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">{v.code}</span>
                      <button
                        onClick={() => copyToClipboard(v.code)}
                        className="text-slate-400 hover:text-slate-600"
                        title="Salin Kode"
                      >
                        {copiedCode === v.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">{v.valid_days} Hari Premium</td>
                    <td className="p-3.5 font-medium text-slate-700">
                      {v.used_count || 0} / {v.max_uses || '∞'} Penggunaan
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        AKTIF
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Voucher"
                      >
                        <Trash2 className="w-4 h-4" />
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
