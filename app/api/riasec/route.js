import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { RIASEC_QUESTIONS, RIASEC_MASTER_MAJORS } from '@/lib/riasecQuestions';

export const dynamic = 'force-dynamic';

// GET: Return the list of quiz questions
export async function GET() {
  return NextResponse.json({
    success: true,
    count: RIASEC_QUESTIONS.length,
    questions: RIASEC_QUESTIONS
  });
}

// POST: Score answers and return RIASEC results
export async function POST(request) {
  try {
    const body = await request.json();
    const { answers } = body;
    // answers: array of answer types e.g. ['Realistic', 'Investigative', 'none', ...]
    // OR scores object e.g. { R: 4, I: 9, A: 3, S: 8, E: 5, C: 2 }

    let scores = { Realistic: 0, Investigative: 0, Artistic: 0, Social: 0, Enterprising: 0, Conventional: 0 };

    if (Array.isArray(answers)) {
      // Count full and partial matches
      answers.forEach((answer) => {
        if (!answer || answer === 'none') return;
        const baseType = answer.replace('_partial', '');
        if (scores[baseType] !== undefined) {
          scores[baseType] += answer.includes('_partial') ? 0.5 : 1;
        }
      });
    } else if (typeof answers === 'object') {
      // Direct score object { R, I, A, S, E, C } mapping
      const keyMap = { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' };
      Object.entries(answers).forEach(([key, val]) => {
        const traitName = keyMap[key] || key;
        if (scores[traitName] !== undefined) scores[traitName] = Number(val) || 0;
      });
    }

    // Normalize to percentages
    const maxPossible = 3; // 3 questions per category at max 1 point each
    const scoreEntries = Object.entries(scores).map(([trait, raw]) => ({
      trait,
      raw,
      percentage: Math.round(Math.min(100, (raw / maxPossible) * 100))
    })).sort((a, b) => b.raw - a.raw);

    const topTraits = scoreEntries.slice(0, 3).map((s) => s.trait);
    const primaryCategory = topTraits[0];

    // Fetch Prodi Recommendations from Supabase (up to 6)
    const { data: prodiRecs } = await supabase
      .from('prodi')
      .select('kode_prodi, nama_prodi, jenjang, daya_tampung_sekarang, ptn(nama_ptn, provinsi_1)')
      .limit(6);

    const recommendedProdis = (prodiRecs || []).map((p) => ({
      ...p,
      nama_ptn: p.ptn?.nama_ptn || '',
      provinsi_1: p.ptn?.provinsi_1 || ''
    }));

    // Get master majors from local constants (reliable) - primary category first, then secondary
    const primaryMajors = RIASEC_MASTER_MAJORS[primaryCategory] || [];
    const secondaryMajors = topTraits[1] ? (RIASEC_MASTER_MAJORS[topTraits[1]] || []).slice(0, 2) : [];
    const masterMajors = [...primaryMajors, ...secondaryMajors].slice(0, 6);

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
