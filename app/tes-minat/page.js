'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Brain,
  BookOpen,
  Briefcase,
  Heart,
  Target,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  ASSESSMENT_MODULES,
  MODULE_ORDER,
  TOTAL_MODULES,
  calculateModuleScores,
  calculateRiasecResult,
} from '@/lib/assessmentQuestions';
import { buildStudentVector } from '@/lib/vectorMatcher';
import { supabase } from '@/lib/supabase';

// ── Ikon per modul ──────────────────────────────────────────────
const MODULE_ICONS = {
  A: Brain,
  B: BookOpen,
  C: Briefcase,
  D: Heart,
  E: Target,
};

// ── Warna per modul ──────────────────────────────────────────────
const MODULE_COLORS = {
  A: '#3157AC',
  B: '#10B981',
  C: '#F5A623',
  D: '#EC4899',
  E: '#8B5CF6',
};

// ── Skala Likert labels ──────────────────────────────────────────
const LIKERT_LABELS = {
  1: 'Sangat Tidak Setuju',
  2: 'Tidak Setuju',
  3: 'Netral',
  4: 'Setuju',
  5: 'Sangat Setuju',
};

export default function TesMinatPage() {
  const router = useRouter();

  // ── State navigasi modul ─────────────────────────────────────
  const [currentModuleId, setCurrentModuleId] = useState('A');
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // ── Jawaban per modul: { A: { A1: 4, A2: 3 }, B: { B1: 85 }, ... } ──
  const [answers, setAnswers] = useState({ A: {}, B: {}, C: {}, D: {}, E: {} });

  // ── State proses & hasil ─────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const currentModule = ASSESSMENT_MODULES[currentModuleId];
  const currentQuestions = currentModule.questions;
  const currentQ = currentQuestions[currentQIndex];
  const totalQInModule = currentQuestions.length;
  const moduleIndex = MODULE_ORDER.indexOf(currentModuleId); // 0-4
  const isLastModule = moduleIndex === TOTAL_MODULES - 1;
  const isLastQuestion = currentQIndex === totalQInModule - 1;
  const ModuleIcon = MODULE_ICONS[currentModuleId];
  const moduleColor = MODULE_COLORS[currentModuleId];

  // ── Cek apakah pertanyaan saat ini sudah dijawab ─────────────
  const getCurrentAnswer = () => answers[currentModuleId]?.[currentQ?.id];
  const isCurrentAnswered = () => {
    const ans = getCurrentAnswer();
    if (ans === undefined || ans === null || ans === '') return false;
    return true;
  };

  // ── Handler jawaban ──────────────────────────────────────────
  const handleAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentModuleId]: {
        ...prev[currentModuleId],
        [questionId]: value,
      },
    }));
  }, [currentModuleId]);

  // ── Navigasi soal dalam modul ────────────────────────────────
  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQIndex((i) => i + 1);
    } else if (!isLastModule) {
      // Pindah ke modul berikutnya
      const nextModule = MODULE_ORDER[moduleIndex + 1];
      setCurrentModuleId(nextModule);
      setCurrentQIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex((i) => i - 1);
    } else if (moduleIndex > 0) {
      // Kembali ke modul sebelumnya, soal terakhir
      const prevModuleId = MODULE_ORDER[moduleIndex - 1];
      const prevModuleQuestions = ASSESSMENT_MODULES[prevModuleId].questions;
      setCurrentModuleId(prevModuleId);
      setCurrentQIndex(prevModuleQuestions.length - 1);
    }
  };

  // ── Submit Assessment ────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Hitung skor per modul
      const moduleScores = calculateModuleScores(answers);

      // 2. Build student_vector 26 dimensi
      const studentVector = buildStudentVector({
        moduleA: moduleScores.moduleA,
        moduleB: moduleScores.moduleB,
        moduleC: moduleScores.moduleC,
        moduleD: moduleScores.moduleD,
        moduleE: moduleScores.moduleE,
      });

      // 3. Hitung RIASEC result
      const riasecResult = calculateRiasecResult(moduleScores.moduleA);

      // 4. Simpan ke Supabase jika user login (graceful fallback jika tidak)
      let savedToDb = false;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              student_vector: studentVector,
              riasec_result: riasecResult,
              academic_scores: moduleScores.moduleB,
              assessment_status: 'completed',
            })
            .eq('id', session.user.id);

          if (!updateError) savedToDb = true;
        }
      } catch (_) {
        // Tidak login atau error DB — lanjutkan ke halaman hasil tanpa simpan
      }

      // 5. Simpan ke sessionStorage untuk halaman hasil
      const resultPayload = {
        studentVector,
        riasecResult,
        moduleScores,
        savedToDb,
        assessedAt: new Date().toISOString(),
      };
      sessionStorage.setItem('arahkita_assessment_result', JSON.stringify(resultPayload));

      // 6. Redirect ke halaman hasil
      router.push('/tes-minat/hasil');
    } catch (err) {
      console.error('Submit assessment error:', err);
      setSubmitError('Terjadi kesalahan saat memproses hasil. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Progress kalkulasi ───────────────────────────────────────
  // Hitung total soal yang sudah dijawab (semua modul)
  const totalAnswered = Object.values(answers).reduce((sum, moduleAns) => {
    return sum + Object.keys(moduleAns).length;
  }, 0);
  const totalQAll = Object.values(ASSESSMENT_MODULES).reduce((s, m) => s + m.totalQuestions, 0);
  const globalProgress = Math.round((totalAnswered / totalQAll) * 100);

  // ── Per-modul progress ───────────────────────────────────────
  const moduleProgress = Math.round(((currentQIndex + 1) / totalQInModule) * 100);

  // ── Render input berdasarkan tipe soal ───────────────────────
  const renderQuestionInput = () => {
    if (!currentQ) return null;
    const currentAnswer = getCurrentAnswer();

    switch (currentQ.type) {
      // ── Likert 1-5 (Modul A) ──────────────────────────────────
      case 'likert':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((val) => {
                const active = currentAnswer === val;
                return (
                  <button
                    key={val}
                    onClick={() => handleAnswer(currentQ.id, val)}
                    className={`flex flex-col items-center p-3 sm:p-4 rounded-xl border transition-all gap-1 ${
                      active
                        ? 'border-[#3157AC] bg-[#EFF4FF] text-[#3157AC] font-semibold shadow-md ring-2 ring-[#3157AC]/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl font-extrabold">{val}</span>
                    <span className="text-[9px] sm:text-[10px] text-center leading-tight font-medium">
                      {LIKERT_LABELS[val]}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 text-center pt-1">
              Skala 1 (Sangat Tidak Setuju) hingga 5 (Sangat Setuju)
            </p>
          </div>
        );

      // ── Number Input (Modul B) ─────────────────────────────────
      case 'number_input':
        return (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="number"
                min={currentQ.min}
                max={currentQ.max}
                step="1"
                value={currentAnswer ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Math.min(currentQ.max, Math.max(currentQ.min, parseFloat(e.target.value)));
                  handleAnswer(currentQ.id, val === '' ? '' : Number(val));
                }}
                placeholder={currentQ.placeholder}
                className="w-full px-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#10B981] text-2xl font-bold text-slate-800 text-center"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#10B981] bg-emerald-50 px-2 py-1 rounded-md">
                0–100
              </span>
            </div>
            {currentQ.hint && (
              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                💡 {currentQ.hint}
              </p>
            )}
          </div>
        );

      // ── Single Choice / SJT (Modul C & E) ─────────────────────
      case 'single_choice':
        return (
          <div className="grid grid-cols-1 gap-3">
            {currentQ.opsi.map((opsi, idx) => {
              const opsiValue = opsi.dimensi || opsi.value;
              const active = currentAnswer === opsiValue;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(currentQ.id, opsiValue)}
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
        );

      // ── Forced Choice / Ipsative (Modul D) ────────────────────
      case 'forced_choice':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['A', 'B'].map((choice) => {
              const opsi = choice === 'A' ? currentQ.opsiA : currentQ.opsiB;
              const active = currentAnswer === choice;
              return (
                <button
                  key={choice}
                  onClick={() => handleAnswer(currentQ.id, choice)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all space-y-2 ${
                    active
                      ? 'border-[#EC4899] bg-pink-50 text-[#EC4899] font-semibold shadow-md ring-2 ring-[#EC4899]/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      active ? 'bg-[#EC4899] text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    Pilihan {choice}
                  </span>
                  <p className="text-sm leading-relaxed">{opsi?.text}</p>
                </button>
              );
            })}
          </div>
        );

      // ── Binary Scale (Modul E) ────────────────────────────────
      case 'binary_scale':
        return (
          <div className="space-y-5">
            <div className="flex items-stretch justify-between gap-3">
              <button
                onClick={() => handleAnswer(currentQ.id, 0.0)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all text-center ${
                  currentAnswer === 0.0
                    ? 'border-[#8B5CF6] bg-violet-50 text-[#8B5CF6] font-semibold ring-2 ring-[#8B5CF6]/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <p className="text-sm font-semibold leading-snug">{currentQ.labelA}</p>
              </button>
              <button
                onClick={() => handleAnswer(currentQ.id, 1.0)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all text-center ${
                  currentAnswer === 1.0
                    ? 'border-[#8B5CF6] bg-violet-50 text-[#8B5CF6] font-semibold ring-2 ring-[#8B5CF6]/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <p className="text-sm font-semibold leading-snug">{currentQ.labelB}</p>
              </button>
            </div>
            {currentQ.hint && (
              <p className="text-xs text-slate-500 text-center">💡 {currentQ.hint}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8EB] border border-[#F5A623]/30 text-xs font-bold text-[#D48813]">
          <Sparkles className="w-4 h-4 text-[#F5A623]" />
          Assessment Multi-Dimensi (5 Modul)
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Tes Minat & Bakat Jurusan Kuliah
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Jawab {totalQAll} pertanyaan dari 5 modul berbeda. Hasil tes akan menghasilkan profil 26 dimensi dan rekomendasi prodi yang paling cocok untukmu.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* ── Global Progress + Modul Tabs ── */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          {/* Modul tabs indicator */}
          <div className="grid grid-cols-5 gap-2">
            {MODULE_ORDER.map((modId, idx) => {
              const mod = ASSESSMENT_MODULES[modId];
              const Icon = MODULE_ICONS[modId];
              const color = MODULE_COLORS[modId];
              const isDone = moduleIndex > idx;
              const isActive = modId === currentModuleId;
              const answeredInModule = Object.keys(answers[modId] || {}).length;
              const totalInModule = mod.totalQuestions;

              return (
                <div
                  key={modId}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-slate-50 border-2 border-slate-200 shadow-sm'
                      : 'opacity-60'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: isActive || isDone ? color + '20' : '#F1F5F9' }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: isActive || isDone ? color : '#94A3B8' }}
                    />
                  </div>
                  <span
                    className="text-[9px] font-bold text-center leading-tight"
                    style={{ color: isActive ? color : isDone ? '#64748B' : '#94A3B8' }}
                  >
                    {mod.title.split(' ')[0]}
                  </span>
                  {isDone && (
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                  )}
                  {isActive && (
                    <span className="text-[8px] text-slate-400 font-medium">
                      {answeredInModule}/{totalInModule}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Per-modul progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
              <span style={{ color: moduleColor }}>
                Modul {moduleIndex + 1}/{TOTAL_MODULES}: {currentModule.title}
              </span>
              <span className="text-slate-400">
                Soal {currentQIndex + 1}/{totalQInModule}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: moduleColor }}
                initial={{ width: 0 }}
                animate={{ width: `${moduleProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Global progress */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>Progress Keseluruhan</span>
              <span>{globalProgress}% ({totalAnswered}/{totalQAll} soal)</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#3157AC] to-[#F5A623] rounded-full"
                animate={{ width: `${globalProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* ── Question Card ── */}
        <AnimatePresence mode="wait">
          {currentQ && (
            <motion.div
              key={`${currentModuleId}-${currentQ.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6"
            >
              {/* Modul badge */}
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: moduleColor + '15',
                    color: moduleColor,
                    border: `1px solid ${moduleColor}30`,
                  }}
                >
                  Modul {currentModuleId} — {currentModule.title}
                </span>
                {currentQ.category && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    {currentQ.category}
                  </span>
                )}
              </div>

              {/* Question text */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {currentQ.pertanyaan}
              </h2>

              {/* Input area */}
              {renderQuestionInput()}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={handlePrev}
                  disabled={moduleIndex === 0 && currentQIndex === 0}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>

                {/* Submit button: last module, last question */}
                {isLastModule && isLastQuestion ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!isCurrentAnswered() || submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#D48813] text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg transition-all"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menganalisis profil...
                      </>
                    ) : (
                      <>
                        Lihat Rekomendasi <Sparkles className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!isCurrentAnswered()}
                    className="px-6 py-2.5 rounded-xl bg-[#3157AC] hover:bg-[#223F82] text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-md transition-all"
                  >
                    Selanjutnya <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Error message */}
              {submitError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Module description hint ── */}
        <div
          className="p-4 rounded-2xl border text-sm text-slate-600 space-y-1"
          style={{ backgroundColor: moduleColor + '08', borderColor: moduleColor + '25' }}
        >
          <p className="font-semibold text-xs" style={{ color: moduleColor }}>
            Tentang Modul {currentModuleId}
          </p>
          <p className="text-xs leading-relaxed">{currentModule.description}</p>
        </div>
      </div>
    </div>
  );
}
