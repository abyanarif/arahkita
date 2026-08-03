import { NextResponse } from 'next/server';
import { RIASEC_QUESTIONS, RIASEC_MASTER_MAJORS } from '@/lib/riasecQuestions';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET: Return the quiz questions (always served from local constants - zero latency, zero failure)
export async function GET() {
  return NextResponse.json({
    success: true,
    count: RIASEC_QUESTIONS.length,
    questions: RIASEC_QUESTIONS
  });
}

// POST: Score the answers and return RIASEC personality results
export async function POST(request) {
  try {
    const body = await request.json();
    const { answers } = body;

    if (!answers) {
      return NextResponse.json({ success: false, error: 'answers is required' }, { status: 400 });
    }

    // Build score tallies from the submitted answers array
    // Each answer is a type string like 'Realistic', 'Realistic_partial', or 'none'
    const scores = {
      Realistic: 0,
      Investigative: 0,
      Artistic: 0,
      Social: 0,
      Enterprising: 0,
      Conventional: 0
    };

    const answersArray = Array.isArray(answers) ? answers : Object.values(answers);

    answersArray.forEach((answer) => {
      if (!answer || answer === 'none') return;
      const isPartial = answer.includes('_partial');
      const baseType = answer.replace('_partial', '');
      if (scores[baseType] !== undefined) {
        scores[baseType] += isPartial ? 0.5 : 1;
      }
    });

    // Normalize raw scores into percentages (max = 3 questions per category)
    const maxPossible = 3;
    const scoreEntries = Object.entries(scores)
      .map(([trait, raw]) => ({
        trait,
        raw,
        percentage: Math.round(Math.min(100, (raw / maxPossible) * 100))
      }))
      .sort((a, b) => b.raw - a.raw);

    const topTraits = scoreEntries.slice(0, 3).map((s) => s.trait);
    const primaryCategory = topTraits[0] || 'Investigative';

    // Master Majors from local constant (reliable, no network dependency)
    const primaryMajors = RIASEC_MASTER_MAJORS[primaryCategory] || [];
    const secondaryMajors = topTraits[1] ? (RIASEC_MASTER_MAJORS[topTraits[1]] || []).slice(0, 2) : [];
    const masterMajors = [...primaryMajors, ...secondaryMajors].slice(0, 6);

    // Optional Supabase prodi recommendations (graceful fallback if table unavailable)
    let recommendedProdis = [];
    try {
      const { data: prodiRecs } = await supabase
        .from('prodi')
        .select('kode_prodi, nama_prodi, jenjang, daya_tampung_sekarang, ptn(nama_ptn, provinsi_1)')
        .limit(6);

      recommendedProdis = (prodiRecs || []).map((p) => ({
        ...p,
        nama_ptn: p.ptn?.nama_ptn || '',
        provinsi_1: p.ptn?.provinsi_1 || ''
      }));
    } catch (_) {
      // Silent fallback — prodi recs are optional
    }

    return NextResponse.json({
      success: true,
      data: {
        topTraits,
        primaryCategory,
        scores: scoreEntries,
        topHollandCode: topTraits.join(''),
        masterMajors,
        recommendedProdis
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
