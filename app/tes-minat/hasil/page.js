'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Brain,
  Target,
  ShieldCheck,
  Zap,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Building,
  BookOpen,
  Star,
  Compass,
  Award,
  ArrowRight,
  Info,
  BarChart2,
  Shield,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

// ── Badge warna per strategi ──────────────────────────────────────
const STRATEGY_CONFIG = {
  Aman: {
    label: 'Aman',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#10B981',
    icon: ShieldCheck,
    desc: 'Peluang sangat besar dengan profil kamu saat ini.',
  },
  Target: {
    label: 'Target',
    color: '#3157AC',
    bg: '#EFF4FF',
    border: '#3157AC',
    icon: Target,
    desc: 'Peluang wajar — perlu persiapan optimal di bidang kunci.',
  },
  Reach: {
    label: 'Reach',
    color: '#F5A623',
    bg: '#FFF8EB',
    border: '#F5A623',
    icon: Zap,
    desc: 'Prodi ambisius — butuh peningkatan signifikan. Siapkan rencana B.',
  },
  reach: {
    label: 'Reach',
    color: '#F5A623',
    bg: '#FFF8EB',
    border: '#F5A623',
    icon: Zap,
    desc: 'Prodi ambisius — butuh peningkatan signifikan. Siapkan rencana B.',
  },
  aman: {
    label: 'Aman',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#10B981',
    icon: ShieldCheck,
    desc: 'Peluang sangat besar dengan profil kamu saat ini.',
  },
  target: {
    label: 'Target',
    color: '#3157AC',
    bg: '#EFF4FF',
    border: '#3157AC',
    icon: Target,
    desc: 'Peluang wajar — perlu persiapan optimal di bidang kunci.',
  },
};

const RIASEC_COLORS = {
  Realistic: '#3157AC',
  Investigative: '#6366F1',
  Artistic: '#EC4899',
  Social: '#10B981',
  Enterprising: '#F5A623',
  Conventional: '#64748B',
};

const RIASEC_CODE_LABELS = { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' };

// ──────────────────────────────────────────────────────────────────
// KOMPONEN UTAMA
// ──────────────────────────────────────────────────────────────────
export default function HasilAssessmentPage() {
  const [localResult, setLocalResult] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [recError, setRecError] = useState(null);
  const [showExpertView, setShowExpertView] = useState(false);
  const [showCrossRumpun, setShowCrossRumpun] = useState(false);

  // ── Load hasil dari sessionStorage ──────────────────────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('arahkita_assessment_result');
      if (raw) {
        const parsed = JSON.parse(raw);
        setLocalResult(parsed);
      }
    } catch (_) {}
  }, []);

  // ── Fetch rekomendasi dari API setelah local result tersedia ──
  useEffect(() => {
    if (!localResult) return;

    const fetchRecommendations = async () => {
      setLoadingRec(true);
      setRecError(null);
      try {
        const res = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_vector: localResult.studentVector,
            riasec_result: localResult.riasecResult,
            academic_scores: localResult.moduleScores?.moduleB || {},
          }),
        });
        const json = await res.json();
        if (json.success) {
          setRecommendations(json.data);
          if (json.data.isFlat) setShowCrossRumpun(true);
        } else {
          setRecError(json.error || 'Gagal mengambil rekomendasi.');
        }
      } catch (err) {
        setRecError('Terjadi kesalahan koneksi. Pastikan kamu terhubung ke internet.');
      } finally {
        setLoadingRec(false);
      }
    };

    fetchRecommendations();
  }, [localResult]);

  // ── Tidak ada data hasil ──────────────────────────────────────
  if (!localResult) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
          <Brain className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Belum ada hasil assessment</h1>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          Kamu perlu menyelesaikan tes minat terlebih dahulu untuk melihat rekomendasi jurusan.
        </p>
        <Link
          href="/tes-minat"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3157AC] text-white font-bold text-sm shadow-md hover:bg-[#223F82] transition-all"
        >
          <Sparkles className="w-4 h-4" /> Mulai Tes Minat
        </Link>
      </div>
    );
  }

  const { riasecResult, moduleScores, studentVector } = localResult;
  const riasecScores = riasecResult?.scoreEntries || [];
  const topTraits = riasecResult?.topTraits || [];
  const hollandCode = riasecResult?.topHollandCode || '';

  // ── Data untuk Radar Chart (RIASEC 6 dimensi) ────────────────
  const radarData = riasecScores.map((s) => ({
    subject: s.trait.slice(0, 5),
    fullName: s.trait,
    score: s.percentage,
  }));

  // ── Data untuk Bar Chart (RIASEC) ────────────────────────────
  const barData = riasecScores.map((s) => ({
    trait: s.trait.slice(0, 3),
    fullTrait: s.trait,
    percentage: s.percentage,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ── Page Header ── */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8EB] border border-[#F5A623]/30 text-xs font-bold text-[#D48813]">
          <Sparkles className="w-4 h-4 text-[#F5A623]" />
          Laporan Hasil Assessment Multi-Dimensi
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Rekomendasi Jurusan Kuliahmu
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Berdasarkan profil 26 dimensi dari 5 modul assessment yang kamu selesaikan.
        </p>
      </div>

      {/* ── RIASEC Top Result Card ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#3157AC] to-indigo-900 text-white shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/20 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#F5A623] bg-white/10 px-3 py-1 rounded-full">
              Kode Holland: {hollandCode}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">
              Top 3 RIASEC: {topTraits.join(' — ')}
            </h2>
          </div>
          <Link
            href="/tes-minat"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 border border-white/20 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Ulangi Tes
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-100">
          {riasecScores.slice(0, 3).map((item, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold text-[#F5A623]">
                <span>Peringkat #{idx + 1}</span>
                <span>{item.percentage}% Score</span>
              </div>
              <h3 className="text-lg font-bold text-white">{item.trait}</h3>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F5A623] rounded-full"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Flat Profile Warning / Cross-Rumpun Explorer ── */}
      {recommendations?.isFlat && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-[#F5A623]/40 bg-[#FFF8EB] space-y-3"
        >
          <div className="flex items-start gap-3">
            <Compass className="w-5 h-5 text-[#D48813] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#D48813] text-sm">Mode Jelajahi Semua Rumpun Diaktifkan</p>
              <p className="text-xs text-[#92620A] mt-1">{recommendations.flatMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setShowCrossRumpun((v) => !v)}
            className="flex items-center gap-1 text-xs font-bold text-[#D48813] hover:underline"
          >
            {showCrossRumpun ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showCrossRumpun ? 'Sembunyikan' : 'Lihat'} Rekomendasi Cross-Rumpun
          </button>
          <AnimatePresence>
            {showCrossRumpun && recommendations.crossRumpunSuggestions?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2"
              >
                {recommendations.crossRumpunSuggestions.map((s, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-[#F5A623]/30 space-y-1.5">
                    <span className="text-[10px] font-bold text-[#D48813] uppercase tracking-wide">
                      {s.rumpun}
                    </span>
                    <p className="text-sm font-bold text-slate-900">{s.prodiNama}</p>
                    <p className="text-xs text-slate-500">{s.ptnNama}</p>
                    <Link
                      href={`/kalkulator-peluang?prodi=${s.kodeProdi}`}
                      className="text-xs font-bold text-[#3157AC] hover:underline flex items-center gap-1"
                    >
                      Cek Peluang <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── TOP 3 REKOMENDASI (Simple View) ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-[#F5A623]" />
          <h2 className="text-xl font-bold text-slate-900">Top 3 Rekomendasi Jurusan</h2>
        </div>

        {loadingRec ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#3157AC]" />
            <span className="text-slate-500 text-sm">Menganalisis kecocokan prodi...</span>
          </div>
        ) : recError ? (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Gagal memuat rekomendasi</p>
              <p className="text-xs mt-1">{recError}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(recommendations?.topMatches || []).map((match, idx) => {
              const cfg = STRATEGY_CONFIG[match.strategi] || STRATEGY_CONFIG['Target'];
              const StratIcon = cfg.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-5 rounded-2xl border shadow-md flex flex-col space-y-4"
                  style={{ borderColor: cfg.border + '40' }}
                >
                  {/* Strategi badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}40` }}
                    >
                      <StratIcon className="w-3 h-3" /> {cfg.label}
                    </span>
                    <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                  </div>

                  {/* Prodi info */}
                  <div className="flex-1 space-y-1">
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {match.prodi.nama_prodi}
                    </h3>
                    <p className="text-xs font-medium text-[#3157AC]">{match.prodi.nama_ptn}</p>
                    <p className="text-[10px] text-slate-500">{match.prodi.jenjang} · {match.prodi.provinsi_1}</p>
                  </div>

                  {/* Match score bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500">Skor Kecocokan</span>
                      <span style={{ color: cfg.color }}>{match.finalScorePercent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: cfg.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${match.finalScorePercent}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 + 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Rekomendasi singkat */}
                  <p className="text-xs text-slate-600 leading-relaxed p-3 rounded-xl"
                    style={{ backgroundColor: cfg.bg }}>
                    {match.recommendation}
                  </p>

                  {/* Warnings ringkas */}
                  {match.warnings?.length > 0 && (
                    <div className="space-y-1.5">
                      {match.warnings.slice(0, 2).map((w, wi) => (
                        <div key={wi} className="flex items-start gap-1.5 text-xs text-amber-700">
                          <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-amber-500" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <Link
                    href={`/kalkulator-peluang?prodi=${match.prodi.kode_prodi}`}
                    className="w-full text-center py-2 rounded-xl font-bold text-xs text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: cfg.color }}
                  >
                    Cek Peluang Masuk →
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── TOMBOL DETAIL ANALISIS EXPERT ── */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowExpertView((v) => !v)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-[#3157AC]/30 text-[#3157AC] font-bold text-sm hover:bg-[#EFF4FF] transition-all"
        >
          <BarChart2 className="w-4 h-4" />
          {showExpertView ? 'Sembunyikan' : 'Lihat'} Detail Analisis Expert
          {showExpertView ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* ── EXPERT VIEW (Collapsed by default) ── */}
      <AnimatePresence>
        {showExpertView && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 overflow-hidden"
          >
            {/* Radar Chart RIASEC */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#3157AC]" />
                <h3 className="text-lg font-bold text-slate-900">Radar Chart Profil RIASEC</h3>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
                    <PolarGrid gridType="polygon" stroke="#E2E8F0" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fontSize: 9, fill: '#94A3B8' }}
                    />
                    <Radar
                      name="Profil RIASEC"
                      dataKey="score"
                      stroke="#3157AC"
                      fill="#3157AC"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Tooltip
                      formatter={(value, name, props) => [`${value}%`, props?.payload?.fullName || name]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart RIASEC Distribution */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#3157AC]" />
                <h3 className="text-lg font-bold text-slate-900">Distribusi Skor RIASEC Detail</h3>
              </div>
              <div className="h-64 sm:h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="trait" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value, name, props) => [`${value}%`, props?.payload?.fullTrait || 'Score']}
                    />
                    <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={RIASEC_COLORS[riasecScores[index]?.trait] || '#3157AC'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Skor Per Dimensi (26D) */}
            {studentVector && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-4">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#3157AC]" />
                  <h3 className="text-lg font-bold text-slate-900">Profil 26 Dimensi Student Vector</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Akademik Matematika', idx: 6 },
                    { label: 'Akademik Fisika', idx: 7 },
                    { label: 'Akademik Kimia', idx: 8 },
                    { label: 'Akademik Biologi', idx: 9 },
                    { label: 'Akademik B. Indo', idx: 10 },
                    { label: 'Akademik B. Ing', idx: 11 },
                    { label: 'Gaya: Outdoor', idx: 12 },
                    { label: 'Gaya: Teamwork', idx: 13 },
                    { label: 'Gaya: Analytical', idx: 14 },
                    { label: 'Gaya: Creative', idx: 15 },
                    { label: 'Gaya: Leadership', idx: 16 },
                    { label: 'Gaya: Detail-oriented', idx: 17 },
                    { label: 'Nilai: Autonomy', idx: 18 },
                    { label: 'Nilai: Stability', idx: 19 },
                    { label: 'Nilai: Helping Others', idx: 20 },
                    { label: 'Nilai: Innovation', idx: 21 },
                    { label: 'Nilai: Prestige', idx: 22 },
                    { label: 'Nilai: Social Impact', idx: 23 },
                  ].map(({ label, idx }) => {
                    const val = Math.round((studentVector[idx] || 0) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600 font-medium">{label}</span>
                          <span className="font-bold text-slate-800">{val}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#3157AC] rounded-full"
                            style={{ width: `${val}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Career Roadmap Expert View */}
            {recommendations?.careerRoadmap?.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#F5A623]" />
                  <h3 className="text-lg font-bold text-slate-900">Career Roadmap — Top Matches</h3>
                </div>
                <div className="space-y-4">
                  {recommendations.careerRoadmap.map((cr, idx) => {
                    const cfg = STRATEGY_CONFIG[cr.category] || STRATEGY_CONFIG['Target'];
                    return (
                      <div key={idx} className="p-4 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{cr.prodi}</p>
                            <p className="text-xs text-slate-500">{cr.ptn}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-bold"
                              style={{ backgroundColor: cfg.bg, color: cfg.color }}
                            >
                              {cfg.label}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                cr.aiResistanceScore >= 0.7
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : cr.aiResistanceScore >= 0.4
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              <Shield className="inline w-3 h-3 mr-0.5" />
                              AI Resistance: {cr.aiResistanceLabel}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <p className="font-bold text-slate-600 uppercase tracking-wide text-[10px]">Entry Roles</p>
                            <ul className="space-y-0.5">
                              {cr.entryRoles.map((r, ri) => (
                                <li key={ri} className="text-slate-700">• {r}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-slate-600 uppercase tracking-wide text-[10px]">Mid-Level Roles</p>
                            <ul className="space-y-0.5">
                              {cr.midRoles.map((r, ri) => (
                                <li key={ri} className="text-slate-700">• {r}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>AI Resistance Score</span>
                            <span className="font-bold">{Math.round(cr.aiResistanceScore * 100)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.round(cr.aiResistanceScore * 100)}%`,
                                backgroundColor:
                                  cr.aiResistanceScore >= 0.7
                                    ? '#10B981'
                                    : cr.aiResistanceScore >= 0.4
                                    ? '#F5A623'
                                    : '#EF4444',
                              }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-500">{cr.aiResistanceDesc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ALTERNATIVE / PIVOT MAJORS ── */}
      {recommendations?.alternatives?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#3157AC]" />
            <h2 className="text-xl font-bold text-slate-900">Pilihan Alternatif (Pivot Major)</h2>
            <span className="text-xs text-slate-500 ml-1">— Prodi dengan jalur karir yang saling overlap</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recommendations.alternatives.map((match, idx) => {
              const cfg = STRATEGY_CONFIG[match.category] || STRATEGY_CONFIG['Target'];
              return (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Alternatif #{idx + 1}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: cfg.bg, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{match.prodi.nama_prodi}</h4>
                    <p className="text-xs text-[#3157AC] font-medium">{match.prodi.nama_ptn}</p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed flex-1">
                    {match.pivotReason}
                  </p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-400">Skor: <strong className="text-slate-700">{match.finalScorePercent}%</strong></span>
                    <Link
                      href={`/kalkulator-peluang?prodi=${match.prodi.kode_prodi}`}
                      className="font-bold text-[#D48813] hover:underline"
                    >
                      Cek Peluang →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── WARNINGS & RED FLAGS ── */}
      {recommendations?.warnings?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900">Peringatan & Hal yang Perlu Diperhatikan</h2>
          </div>
          <div className="space-y-2">
            {recommendations.warnings.map((w, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
                  w.severity === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-xs">{w.prodiNama}</p>
                  <p className="text-xs mt-0.5">{w.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CTA Links ── */}
      <div className="flex flex-wrap gap-3 justify-center pt-4">
        <Link
          href="/kalkulator-peluang"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#3157AC] text-[#3157AC] font-bold text-sm hover:bg-[#EFF4FF] transition-all"
        >
          <BarChart2 className="w-4 h-4" /> Kalkulator Peluang SNBT/SNBP
        </Link>
        <Link
          href="/direktori-ptn"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
        >
          <Building className="w-4 h-4" /> Direktori PTN
        </Link>
        <Link
          href="/tes-minat"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3157AC] text-white font-bold text-sm hover:bg-[#223F82] transition-all shadow-md"
        >
          <RotateCcw className="w-4 h-4" /> Ulangi Assessment
        </Link>
      </div>
    </div>
  );
}
