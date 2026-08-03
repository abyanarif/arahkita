'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Search,
  Calculator,
  Users,
  CheckCircle2,
  TrendingUp,
  Award,
  ArrowRight,
  ShieldAlert,
  BarChart,
  BookOpen,
  Target,
  Building2
} from 'lucide-react';

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EFF4FF] via-white to-slate-50 pt-12 pb-20 border-b border-slate-200/60">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F5A623]/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3157AC]/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto space-y-6"
          >
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#F5A623]/40 shadow-sm text-xs font-semibold text-[#D48813]">
              <Sparkles className="w-4 h-4 text-[#F5A623] animate-pulse" />
              Platform Rekomendasi Jurusan & Analisis Persaingan PTN SNBT 2026
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Tentukan Jurusan Kuliah Sesuai <span className="bg-gradient-to-r from-[#3157AC] to-indigo-600 bg-clip-text text-transparent">Minat & Bakat</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Temukan jurusan PTN impianmu lewat Tes Holland Code (RIASEC), analisis tren persaingan 5 tahun terakhir, dan kalkulator peluang berbasis data resmi SNPMB.
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/tes-minat"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#3157AC] hover:bg-[#223F82] text-white font-bold text-base shadow-lg shadow-[#3157AC]/20 hover:shadow-xl hover:scale-105 transition-all"
              >
                <Sparkles className="w-5 h-5 text-[#F5A623]" />
                Mulai Tes Minat Bakat (Gratis)
              </Link>
              <Link
                href="/direktori-ptn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-300 shadow-sm transition-all"
              >
                <Search className="w-5 h-5 text-[#3157AC]" />
                Cari Kampus & Jurusan
              </Link>
            </div>

            {/* Feature Checkmarks */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 140+ PTN Se-Indonesia
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Data SNPMB Historis 5 Tahun
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Fitur Khusus Guru BK
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* QUICK STATS CARD BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-lg">
          <div className="text-center p-3 border-r border-slate-100 last:border-0">
            <p className="text-2xl sm:text-3xl font-extrabold text-[#3157AC]">146+</p>
            <p className="text-xs text-slate-500 font-medium">PTN Akademik & Vokasi</p>
          </div>
          <div className="text-center p-3 border-r border-slate-100 last:border-0">
            <p className="text-2xl sm:text-3xl font-extrabold text-[#F5A623]">5 Tahun</p>
            <p className="text-xs text-slate-500 font-medium">Data Historis Peminat</p>
          </div>
          <div className="text-center p-3 border-r border-slate-100 last:border-0">
            <p className="text-2xl sm:text-3xl font-extrabold text-[#3157AC]">6 Tipe</p>
            <p className="text-xs text-slate-500 font-medium">Kepribadian RIASEC</p>
          </div>
          <div className="text-center p-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">100%</p>
            <p className="text-xs text-slate-500 font-medium">Akses Gratis untuk Siswa</p>
          </div>
        </div>
      </section>

      {/* FITUR UTAMA GRID SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">4 Fitur Unggulan Smart Choose</h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Dirancang khusus untuk membantu siswa memilih jurusan secara terukur dan rasional.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Feature 1: Tes Minat Bakat */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#3157AC]/40 hover:shadow-xl transition-all group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#EFF4FF] flex items-center justify-center text-[#3157AC] group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-[#F5A623]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">1. Kuis Minat & Bakat (RIASEC Holland Code)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                10-15 pertanyaan sederhana untuk mengidentifikasi 3 Tipe Kepribadian teratasmu (Realistic, Investigative, Artistic, Social, Enterprising, Conventional) dilengkapi rekomendasi jurusan yang sangat pas.
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/tes-minat"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#3157AC] group-hover:text-indigo-700"
              >
                Ikuti Kuis Minat <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Feature 2: Direktori & Peta Persaingan */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#3157AC]/40 hover:shadow-xl transition-all group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#EFF4FF] flex items-center justify-center text-[#3157AC] group-hover:scale-110 transition-transform">
                <BarChart className="w-6 h-6 text-[#3157AC]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">2. Peta Persaingan SNBT & Tren 5 Tahun</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Cari prodi berdasarkan nama jurusan, lokasi provinsi, atau jenis PTN. Lengkap dengan grafik statistik peminat vs daya tampung 5 tahun terakhir & status keketatan (Sangat Ketat, Ketat, Sedang).
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/direktori-ptn"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#3157AC] group-hover:text-indigo-700"
              >
                Jelajahi Direktori PTN <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Feature 3: Chance Calculator */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#3157AC]/40 hover:shadow-xl transition-all group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF8EB] flex items-center justify-center text-[#D48813] group-hover:scale-110 transition-transform">
                <Calculator className="w-6 h-6 text-[#F5A623]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">3. Kalkulator Peluang SNBT (Chance Calculator)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Input rata-rata nilai Rapor atau Simulasi Skor UTBK milikmu. Sistem akan mengalkulasi estimasi tingkat persaingan dan kategori peluang: <span className="font-bold text-emerald-600">Safe</span>, <span className="font-bold text-blue-600">Target</span>, atau <span className="font-bold text-rose-600">Reach</span>.
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/kalkulator-peluang"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#3157AC] group-hover:text-indigo-700"
              >
                Hitung Peluang Masuk <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Feature 4: BK Teacher Dashboard */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#3157AC]/40 hover:shadow-xl transition-all group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">4. Dashboard Guru BK (Fitur Kerjasama Sekolah)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Fitur B2B khusus guru BK untuk memantau rekap tes minat siswa per kelas, distribusi tipe kepribadian, serta <span className="font-semibold text-amber-700">Deteksi Bentrokan Pilihan ("Sikut-sikutan")</span> antar siswa satu sekolah.
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/dashboard-bk"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#3157AC] group-hover:text-indigo-700"
              >
                Buka Dashboard Guru BK <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* HOLLAND RIASEC INFOGRAPHIC BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#3157AC] to-indigo-900 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#F5A623]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <span className="px-3 py-1 rounded-full bg-[#F5A623] text-slate-900 font-bold text-xs">
                METODOLOGI HOLLAND CODE
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
                Kenapa Tes RIASEC Penting Sebelum Memilih Jurusan?
              </h2>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                Penelitian menunjukkan bahwa 87% mahasiswa merasa salah jurusan karena memilih hanya berdasarkan tren atau dorongan orang lain. Tes RIASEC mencocokkan pola kerja otak dan minat alami kamu dengan profil tuntutan studi tiap program studi.
              </p>
            </div>
            <div className="flex flex-col gap-3 bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20">
              <div className="flex items-center justify-between text-sm">
                <span>Realistic (Praktis & Fisik)</span>
                <span className="font-bold text-[#F5A623]">R</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Investigative (Analitis & Sains)</span>
                <span className="font-bold text-[#F5A623]">I</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Artistic (Kreatif & Seni)</span>
                <span className="font-bold text-[#F5A623]">A</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Social (Empati & Pelayanan)</span>
                <span className="font-bold text-[#F5A623]">S</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Enterprising (Bisnis & Visi)</span>
                <span className="font-bold text-[#F5A623]">E</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Conventional (Teratur & Data)</span>
                <span className="font-bold text-[#F5A623]">C</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
