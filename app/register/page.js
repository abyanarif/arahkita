'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Building, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [role, setRole] = useState('siswa'); // 'siswa' or 'guru_bk'
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            school_name: schoolName || 'SMA Negeri 1 Indonesia',
            role: role
          }
        }
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setSuccessMessage('Pendaftaran akun berhasil! Silakan login untuk mengaktifkan akses.');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat registrasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8EB] border border-[#F5A623]/30 text-xs font-bold text-[#D48813]">
            <UserPlus className="w-3.5 h-3.5 text-[#F5A623]" />
            Buat Akun Baru ArahKita
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Registrasi Pengguna
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Pilih peranmu untuk memulai pemetaan minat & strategi lolos PTN 2026.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Role Choice */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Tipe Peran Akun:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('siswa')}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  role === 'siswa'
                    ? 'border-[#3157AC] bg-[#EFF4FF] text-[#3157AC] shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🎓 Siswa SMA/K
              </button>
              <button
                type="button"
                onClick={() => setRole('guru_bk')}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  role === 'guru_bk'
                    ? 'border-[#F5A623] bg-[#FFF8EB] text-[#D48813] shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                👨‍🏫 Guru BK / Pembimbing
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Nama Lengkap</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="misal: Muhammad Rizky"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#3157AC] text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Asal Sekolah</label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="misal: SMAN 1 Surabaya"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#3157AC] text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Email Utama</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@gmail.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#3157AC] text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#3157AC] text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#3157AC] hover:bg-[#223F82] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Mendaftarkan...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Registrasi Akun {role === 'guru_bk' ? 'Guru BK' : 'Siswa'}
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-600">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="font-bold text-[#3157AC] hover:underline">
            Masuk Sekarang
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
