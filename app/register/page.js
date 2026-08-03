'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Building,
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink,
  LogIn,
  Inbox
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ─── Email Verification Modal ────────────────────────────────────────────────
function EmailVerificationModal({ email, onClose }) {
  const router = useRouter();

  const handleClose = () => {
    onClose();
    router.push('/login');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 relative space-y-6"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#3157AC] to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Inbox className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900">
              Email Verifikasi Telah Dikirim! 📩
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Kami telah mengirimkan link konfirmasi ke{' '}
              <span className="font-bold text-[#3157AC] break-all">{email}</span>.{' '}
              Silakan buka inbox atau folder <strong>spam</strong> emailmu dan klik tautan
              verifikasi sebelum masuk ke akun.
            </p>
          </div>

          {/* Tips box */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 space-y-1">
            <p className="font-bold">💡 Tips:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Cek folder <strong>Spam / Junk</strong> jika email tidak muncul di Inbox.</li>
              <li>Email biasanya tiba dalam 1–3 menit.</li>
              <li>Klik "Confirm your mail" pada email dari Supabase / ArahKita.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl bg-[#3157AC] hover:bg-[#223F82] text-white font-bold text-sm shadow-md text-center flex items-center justify-center gap-2 transition-all"
            >
              <ExternalLink className="w-4 h-4" /> Buka Gmail
            </a>
            <button
              onClick={handleClose}
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm text-center flex items-center justify-center gap-2 transition-all border border-slate-200"
            >
              <LogIn className="w-4 h-4" /> Ke Halaman Login
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [role, setRole] = useState('siswa'); // 'siswa' or 'guru_bk'

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

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

      // Show email verification modal instead of immediate redirect
      setRegisteredEmail(email);
      setShowVerificationModal(true);
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat registrasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Email Verification Modal */}
      {showVerificationModal && (
        <EmailVerificationModal
          email={registeredEmail}
          onClose={() => setShowVerificationModal(false)}
        />
      )}

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
              Pilih peranmu untuk memulai pemetaan minat &amp; strategi lolos PTN 2026.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
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
                  <UserPlus className="w-4 h-4" /> Registrasi Akun{' '}
                  {role === 'guru_bk' ? 'Guru BK' : 'Siswa'}
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
    </>
  );
}
