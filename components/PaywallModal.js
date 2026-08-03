'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, CheckCircle2, Ticket, QrCode, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function PaywallModal({ isOpen, onClose, onUnlocked }) {
  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage({ type: 'error', text: 'Silakan login terlebih dahulu untuk klaim voucher' });
        setLoading(false);
        return;
      }

      const res = await fetch('/api/vouchers/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ code: voucherCode })
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: json.message });
        if (onUnlocked) onUnlocked(json.data);
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setMessage({ type: 'error', text: json.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengaktifkan voucher' });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage({ type: 'error', text: 'Silakan login untuk memproses pembayaran' });
        setLoading(false);
        return;
      }

      // Simulate instantly upgrading user using default promo code
      const res = await fetch('/api/vouchers/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ code: 'ARAHKITASMB2026' })
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: 'Pembayaran QRIS Berhasil! Akses Premium 90 hari telah aktif.' });
        if (onUnlocked) onUnlocked(json.data);
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setMessage({ type: 'error', text: json.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl overflow-hidden border border-amber-200"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center space-y-3 pt-2">
            <div className="w-12 h-12 bg-gradient-to-tr from-[#F5A623] to-amber-300 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-200">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#FFF8EB] border border-[#F5A623]/30 text-xs font-extrabold text-[#D48813]">
              Fitur Eksklusif ArahKita Premium
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Buka Akses Lengkap Peta Persaingan PTN 2026
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Dapatkan analisis grafik historis 5 tahun SNBP & SNBT, kalkulasi simulasi ketat, serta unduh laporan PDF rekomendasi jurusan.
            </p>
          </div>

          {/* Benefits Comparison */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Akses Peta Historis 5 Tahun SNBP (Rapor) & SNBT (UTBK)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Analisis Risiko Bentrokan Pilihan Jurusan Antar-Siswa</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Tes Minat Bakat RIASEC Tanpa Batas + Unduh Laporan PDF</span>
            </div>
          </div>

          {/* Alert Message */}
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

          {/* Voucher Code Form */}
          <form onSubmit={handleRedeem} className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Punya Kode Voucher Sekolah / Promo?</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Ticket className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Misal: ARAHKITASMB2026"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#F5A623] text-xs font-bold uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !voucherCode.trim()}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all shrink-0"
              >
                Klaim Voucher
              </button>
            </div>
          </form>

          {/* Instant QRIS Activation */}
          <div className="pt-2 border-t border-slate-100 flex flex-col items-center space-y-3">
            <div className="flex items-center justify-between w-full">
              <div className="text-left">
                <span className="text-[11px] text-slate-400 block font-semibold">Langganan Akses Siswa</span>
                <span className="text-lg font-extrabold text-slate-900">Rp 49.000 <span className="text-xs text-slate-500 font-normal">/ 3 Bulan</span></span>
              </div>
              <button
                onClick={handleSimulatePayment}
                disabled={loading}
                className="px-5 py-3 rounded-xl bg-[#F5A623] hover:bg-[#D48813] text-white font-bold text-xs shadow-lg shadow-amber-200 transition-all flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4" /> Bayar via QRIS (Aktifkan Langsung)
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
