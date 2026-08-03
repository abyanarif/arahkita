'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calculator,
  Target,
  ShieldCheck,
  Zap,
  Building,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  BarChart,
  ArrowRight,
  Award,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

function CalculatorContent() {
  const searchParams = useSearchParams();
  const initialProdiCode = searchParams.get('prodi') || '';
  const initialJalur = (searchParams.get('jalur') || 'SNBT').toUpperCase();

  const [jalur, setJalur] = useState(initialJalur); // 'SNBT' or 'SNBP'
  const [scoreInput, setScoreInput] = useState(initialJalur === 'SNBP' ? '88.5' : '675');
  const [prodiList, setProdiList] = useState([]);
  const [choice1Kode, setChoice1Kode] = useState(initialProdiCode);
  const [choice2Kode, setChoice2Kode] = useState('');
  
  const [loadingProdi, setLoadingProdi] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);

  const handleJalurChange = (newJalur) => {
    setJalur(newJalur);
    setScoreInput(newJalur === 'SNBP' ? '88.5' : '675');
    setResult(null);
  };

  useEffect(() => {
    fetch('/api/prodi')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProdiList(data.data);
          if (!initialProdiCode && data.data.length > 0) {
            setChoice1Kode(data.data[0].kode_prodi);
            if (data.data.length > 1) {
              setChoice2Kode(data.data[1].kode_prodi);
            }
          }
        }
        setLoadingProdi(false);
      })
      .catch((e) => {
        console.error(e);
        setLoadingProdi(false);
      });
  }, [initialProdiCode]);

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!choice1Kode) return;

    setCalculating(true);
    try {
      const res = await fetch('/api/chance-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentScore: parseFloat(scoreInput),
          choice1Kode,
          choice2Kode,
          jalur
        })
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* INPUT CALCULATOR FORM */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg max-w-3xl mx-auto space-y-6">
        {/* Jalur Selector Toggle */}
        <div className="space-y-2 pb-4 border-b border-slate-100">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pilih Jalur Seleksi yang Ingin Diukur:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleJalurChange('SNBT')}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center gap-2 font-bold text-sm ${
                jalur === 'SNBT'
                  ? 'border-[#3157AC] bg-[#EFF4FF] text-[#3157AC] shadow-sm ring-2 ring-[#3157AC]/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#F5A623]" />
              SNBT (Skor UTBK 300-1000)
            </button>
            <button
              type="button"
              onClick={() => handleJalurChange('SNBP')}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center gap-2 font-bold text-sm ${
                jalur === 'SNBP'
                  ? 'border-[#F5A623] bg-[#FFF8EB] text-[#D48813] shadow-sm ring-2 ring-[#F5A623]/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Award className="w-4 h-4 text-[#F5A623]" />
              SNBP (Nilai Rapor 60-100)
            </button>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="space-y-6">
          {/* Step 1: Input Score */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-900">
              {jalur === 'SNBP'
                ? '1. Masukkan Rata-rata Nilai Rapor Semester 1 - 5 (Skala 60 - 100)'
                : '1. Masukkan Skor Simulasi UTBK (Skala 300 - 1000)'}
            </label>
            <div className="relative">
              <input
                type="number"
                step={jalur === 'SNBP' ? '0.1' : '1'}
                min={jalur === 'SNBP' ? '60' : '300'}
                max={jalur === 'SNBP' ? '100' : '1000'}
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#3157AC] text-lg font-bold text-slate-800"
                placeholder={jalur === 'SNBP' ? 'misal: 89.2' : 'misal: 685'}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#3157AC] bg-[#EFF4FF] px-2.5 py-1 rounded-md">
                {jalur === 'SNBP' ? 'Nilai Rapor' : 'Poin UTBK'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {jalur === 'SNBP'
                ? '*Tips SNBP: Nilai gabungan rata-rata seluruh mata pelajaran dari semester 1 hingga 5.'
                : '*Tips SNBT: Gunakan rerata skor Tryout SNBT terakhir atau estimasi hasil pengerjaan soal.'}
            </p>
          </div>

          {/* Step 2: Select Choice 1 */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-900">
              2. Pilih Prodi Pilihan Ke-1 (Target Utama)
            </label>
            {loadingProdi ? (
              <div className="h-12 bg-slate-100 animate-pulse rounded-xl" />
            ) : (
              <select
                value={choice1Kode}
                onChange={(e) => setChoice1Kode(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-[#3157AC] text-sm"
              >
                <option value="" disabled>-- Pilih Prodi Pilihan 1 --</option>
                {prodiList.map((p) => (
                  <option key={p.kode_prodi} value={p.kode_prodi}>
                    {p.nama_prodi} ({p.jenjang}) - {p.nama_ptn} (Quota {jalur}: {jalur === 'SNBP' ? (p.daya_tampung_snbp || p.daya_tampung_sekarang) : (p.daya_tampung_snbt || p.daya_tampung_sekarang)})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Step 3: Select Choice 2 */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-900">
              3. Pilih Prodi Pilihan Ke-2 (Pilihan Cadangan / Opsional)
            </label>
            {loadingProdi ? (
              <div className="h-12 bg-slate-100 animate-pulse rounded-xl" />
            ) : (
              <select
                value={choice2Kode}
                onChange={(e) => setChoice2Kode(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-[#3157AC] text-sm"
              >
                <option value="">-- Tanpa Pilihan Ke-2 --</option>
                {prodiList.map((p) => (
                  <option key={`c2-${p.kode_prodi}`} value={p.kode_prodi}>
                    {p.nama_prodi} ({p.jenjang}) - {p.nama_ptn} (Quota {jalur}: {jalur === 'SNBP' ? (p.daya_tampung_snbp || p.daya_tampung_sekarang) : (p.daya_tampung_snbt || p.daya_tampung_sekarang)})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Action Submit */}
          <button
            type="submit"
            disabled={calculating || !choice1Kode}
            className={`w-full py-4 rounded-2xl text-white font-bold text-base shadow-xl transition-all flex items-center justify-center gap-2 ${
              jalur === 'SNBP' ? 'bg-[#F5A623] hover:bg-[#D48813]' : 'bg-[#3157AC] hover:bg-[#223F82]'
            }`}
          >
            {calculating ? (
              <span>Mengalkulasi Peluang ({jalur})...</span>
            ) : (
              <>
                <Zap className="w-5 h-5 text-white" />
                Kalkulasi Estimasi Peluang {jalur}
              </>
            )}
          </button>
        </form>
      </div>

      {/* CALCULATOR RESULT SECTION */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Hasil Analisis Peluang Kelulusan {result.jalur}
            </h2>
            <p className="text-sm text-slate-600">
              {result.jalur === 'SNBP' ? 'Nilai Rapor Siswa' : 'Skor UTBK Siswa'}:{' '}
              <span className="font-bold text-[#3157AC]">
                {result.studentScore} {result.jalur === 'SNBP' ? 'Rerata Rapor' : 'Poin'}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Choice 1 Result */}
            {result.choice1 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EFF4FF] text-[#3157AC]">
                      PILIHAN 1 ({result.jalur})
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${result.choice1.badgeColor}`}>
                      {result.choice1.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{result.choice1.prodi.nama_prodi}</h3>
                    <p className="text-xs font-medium text-slate-600">{result.choice1.prodi.nama_ptn}</p>
                  </div>

                  {/* Progress Bar Probability */}
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500">Estimasi Peluang Masuk:</span>
                      <span className="text-[#3157AC]">{result.choice1.probabilityPercent}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#3157AC] to-emerald-500 rounded-full"
                        style={{ width: `${result.choice1.probabilityPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block">Ambang Batas Nilai</span>
                      <span className="font-bold text-slate-800">~{result.choice1.estimatedPassingScore}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Selisih Skor Kamu</span>
                      <span className={`font-bold ${result.choice1.scoreDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {result.choice1.scoreDiff >= 0 ? `+${result.choice1.scoreDiff}` : result.choice1.scoreDiff}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-[#EFF4FF] p-3 rounded-xl border border-[#3157AC]/20">
                    {result.choice1.summaryAdvice}
                  </p>
                </div>
              </div>
            )}

            {/* Choice 2 Result */}
            {result.choice2 ? (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                      PILIHAN 2 ({result.jalur})
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${result.choice2.badgeColor}`}>
                      {result.choice2.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{result.choice2.prodi.nama_prodi}</h3>
                    <p className="text-xs font-medium text-slate-600">{result.choice2.prodi.nama_ptn}</p>
                  </div>

                  {/* Progress Bar Probability */}
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500">Estimasi Peluang Masuk:</span>
                      <span className="text-[#3157AC]">{result.choice2.probabilityPercent}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#3157AC] to-emerald-500 rounded-full"
                        style={{ width: `${result.choice2.probabilityPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block">Ambang Batas Nilai</span>
                      <span className="font-bold text-slate-800">~{result.choice2.estimatedPassingScore}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Selisih Skor Kamu</span>
                      <span className={`font-bold ${result.choice2.scoreDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {result.choice2.scoreDiff >= 0 ? `+${result.choice2.scoreDiff}` : result.choice2.scoreDiff}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-[#EFF4FF] p-3 rounded-xl border border-[#3157AC]/20">
                    {result.choice2.summaryAdvice}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-3">
                <HelpCircle className="w-8 h-8 text-slate-400" />
                <h4 className="font-bold text-slate-700 text-sm">Belum Ada Pilihan 2</h4>
                <p className="text-xs text-slate-500">
                  Pilih prodi cadangan pada formulir di atas untuk membandingkan strategi urutan pilihan {result.jalur}.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function ChanceCalculatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8EB] border border-[#F5A623]/30 text-xs font-bold text-[#D48813]">
          <Calculator className="w-4 h-4 text-[#F5A623]" />
          Kalkulator Peluang SNBT & SNBP 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Kalkulator Peluang Masuk PTN (SNBP / SNBT)
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Ukur estimasi kelulusanmu lewat Jalur Prestasi (SNBP Rapor) maupun Jalur Tes UTBK (SNBT) secara rasional.
        </p>
      </div>

      <Suspense fallback={
        <div className="text-center py-12 space-y-3">
          <div className="w-8 h-8 border-4 border-[#3157AC] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-xs">Memuat modul kalkulator...</p>
        </div>
      }>
        <CalculatorContent />
      </Suspense>
    </div>
  );
}
