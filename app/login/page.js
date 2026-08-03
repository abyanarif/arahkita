'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message || 'Email atau password salah');
        setLoading(false);
        return;
      }

      // Check user profile role
      const res = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${data.session.access_token}` }
      });
      const json = await res.json();
      const role = json.data?.role || 'siswa';

      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'guru_bk') {
        router.push('/dashboard-bk');
      } else {
        router.push('/direktori-ptn');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/direktori-ptn`
        }
      });
    } catch (err) {
      setErrorMessage(err.message);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF4FF] border border-[#3157AC]/30 text-xs font-bold text-[#3157AC]">
            <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
            Masuk Platform Smart Choose
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Selamat Datang Kembali
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Masuk ke akunmu untuk mengakses analisis PTN, skor kelulusan, dan rekomendasi jurusan.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Email Sekolah / Pribadi</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@siswa.sma.sch.id"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
              <span>Memproses...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Masuk ke Akun
              </>
            )}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400 font-semibold">atau masuk dengan</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.15C3.25 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.28C.46 8.21 0 10.05 0 12s.46 3.79 1.28 5.42l4-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.58l4 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          Google Workspace Account
        </button>

        <div className="text-center pt-2 text-xs text-slate-600">
          Belum punya akun?{' '}
          <Link href="/register" className="font-bold text-[#3157AC] hover:underline">
            Daftar Sekarang
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
