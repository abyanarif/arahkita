'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  BarChart2,
  BookOpen,
  Building,
  RotateCcw,
  Compass,
  Award
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function TesMinatPage() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch('/api/riasec')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQuestions(data.questions);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSelectOption = (questionId, optionType) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionType
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    const answersArray = questions.map((q) => answers[q.id]).filter(Boolean);

    try {
      const res = await fetch('/api/riasec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersArray })
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#3157AC] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-600 font-medium">Memuat Kuis Minat & Bakat RIASEC...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const isSelected = answers[currentQ?.id];

  // Custom colors for RIASEC chart bars
  const RIASEC_BAR_COLORS = {
    Realistic: '#3157AC',
    Investigative: '#6366F1',
    Artistic: '#EC4899',
    Social: '#10B981',
    Enterprising: '#F5A623',
    Conventional: '#64748B'
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8EB] border border-[#F5A623]/30 text-xs font-bold text-[#D48813]">
          <Sparkles className="w-4 h-4 text-[#F5A623]" />
          Holland Code (RIASEC) Personality Quiz
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Tes Minat & Bakat Jurusan Kuliah
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Jawab pertanyaan berikut sesuai kondisi aslimu tanpa tekanan. Hasil tes akan memetakan tipe kepribadian dan rekomendasi jurusan yang paling cocok.
        </p>
      </div>

      {/* QUIZ INTERACTIVE VIEW */}
      {!result ? (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Progress Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
              <span>Pertanyaan {currentIndex + 1} dari {questions.length}</span>
              <span className="text-[#3157AC]">{progressPercent}% Selesai</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#3157AC] to-[#F5A623]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ?.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {currentQ?.pertanyaan}
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {currentQ?.opsi.map((opsi, idx) => {
                  const active = answers[currentQ.id] === opsi.type;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(currentQ.id, opsi.type)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        active
                          ? 'border-[#3157AC] bg-[#EFF4FF] text-[#3157AC] font-semibold shadow-md ring-2 ring-[#3157AC]/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-sm sm:text-base leading-relaxed">{opsi.text}</span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          active ? 'border-[#3157AC] bg-[#3157AC] text-white' : 'border-slate-300'
                        }`}
                      >
                        {active && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={!isSelected}
                    className="px-6 py-2.5 rounded-xl bg-[#3157AC] hover:bg-[#223F82] text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-md transition-all"
                  >
                    Selanjutnya <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(answers).length < questions.length || submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#D48813] text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg transition-all"
                  >
                    {submitting ? 'Mengalkulasi...' : 'Lihat Hasil Quiz'} <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        /* QUIZ RESULT VIEW */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Top Result Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#3157AC] to-indigo-900 text-white shadow-2xl relative overflow-hidden space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/20 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#F5A623] bg-white/10 px-3 py-1 rounded-full">
                  Hasil Analisis Minat Bakat
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">
                  Top 3 RIASEC: {result.topTraits.join(' - ')}
                </h2>
              </div>
              <button
                onClick={resetQuiz}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 border border-white/20 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Ulangi Tes
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-100">
              {result.scores.slice(0, 3).map((item, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold text-[#F5A623]">
                    <span>Peringkat #{idx + 1}</span>
                    <span>{item.percentage}% Score</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{item.trait}</h3>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#3157AC]" />
              <h3 className="text-lg font-bold text-slate-900">Grafik Distribusi Tipe Kepribadian RIASEC</h3>
            </div>
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.scores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="trait" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Persentase Match']} />
                  <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                    {result.scores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RIASEC_BAR_COLORS[entry.trait] || '#3157AC'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommended Master Majors */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#F5A623]" />
              <h3 className="text-xl font-bold text-slate-900">Rekomendasi Master Jurusan Kuliah</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.masterMajors.map((jurusan) => (
                <div
                  key={jurusan.id_jurusan_master}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 hover:border-[#3157AC]/30 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-900 text-base">{jurusan.nama_jurusan}</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFF4FF] text-[#3157AC]">
                      {jurusan.kategori_riasec}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{jurusan.deskripsi}</p>
                  <div className="pt-2 text-xs font-semibold text-slate-500">
                    <span className="text-slate-700 font-bold">Prospek Karir:</span> {jurusan.prospek_karir}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Actual PTN Prodis */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#3157AC]" />
                <h3 className="text-xl font-bold text-slate-900">Prodi PTN Terkait di Indonesia</h3>
              </div>
              <Link
                href="/direktori-ptn"
                className="text-xs font-bold text-[#3157AC] hover:underline flex items-center gap-1"
              >
                Lihat Semua Prodi <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {result.recommendedProdis.map((p) => (
                <div
                  key={p.kode_prodi}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {p.jenjang} - {p.provinsi_1}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{p.nama_prodi}</h4>
                    <p className="text-xs font-medium text-[#3157AC]">{p.nama_ptn}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Daya Tampung: {p.daya_tampung_sekarang} kursi</span>
                    <Link
                      href={`/kalkulator-peluang?prodi=${p.kode_prodi}`}
                      className="font-bold text-[#D48813] hover:underline"
                    >
                      Cek Peluang →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
