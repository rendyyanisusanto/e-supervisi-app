import type { Supervision, SupervisionItem } from '../types/supervision';
import type { TeacherCompetency, CompetencyAspect } from '../types/competency';

export const calculateCompetencyByCategory = (items: SupervisionItem[]): CompetencyAspect[] => {
  const categories = new Map<string, { totalScore: number, maxScore: number }>();
  
  items.forEach(item => {
    // Only count items with scores
    if (item.score !== null && item.score !== undefined) {
      const cat = item.itemCategory || 'Lainnya';
      const current = categories.get(cat) || { totalScore: 0, maxScore: 0 };
      categories.set(cat, {
        totalScore: current.totalScore + item.score,
        maxScore: current.maxScore + (item.maxScore || 4)
      });
    }
  });

  const aspects: CompetencyAspect[] = [];
  categories.forEach((data, category) => {
    const finalScore = data.maxScore > 0 ? (data.totalScore / data.maxScore) * 100 : 0;
    
    // Status logic based on standard ranges
    let status = 'Sangat Baik';
    if (finalScore < 70) status = 'Perlu Pembinaan';
    else if (finalScore < 80) status = 'Cukup';
    else if (finalScore < 90) status = 'Baik';

    aspects.push({
      category,
      totalScore: data.totalScore,
      maxScore: data.maxScore,
      finalScore,
      status
    });
  });

  return aspects.sort((a, b) => b.finalScore - a.finalScore);
};

export const getStrongestAspects = (aspects: CompetencyAspect[]): CompetencyAspect[] => {
  if (!aspects.length) return [];
  // top 2
  return [...aspects].sort((a, b) => b.finalScore - a.finalScore).slice(0, 2);
};

export const getWeakestAspects = (aspects: CompetencyAspect[]): CompetencyAspect[] => {
  if (!aspects.length) return [];
  // bottom 2
  return [...aspects].sort((a, b) => a.finalScore - b.finalScore).slice(0, 2);
};

export const calculateCompetencyByTeacher = (
  teacherId: string, 
  periodId: string, 
  supervisions: Supervision[]
): TeacherCompetency => {
  
  // Filter finished supervisions for this teacher and period
  const relevantSupervisions = supervisions.filter(s => 
    String(s.teacherId) === String(teacherId) && 
    String(s.periodId) === String(periodId) && 
    s.status === 'SELESAI'
  );

  const allItems = relevantSupervisions.flatMap(s => s.items);
  const aspects = calculateCompetencyByCategory(allItems);
  
  const totalAspectScore = aspects.reduce((sum, a) => sum + a.finalScore, 0);
  const averageScore = aspects.length > 0 ? totalAspectScore / aspects.length : 0;

  return {
    teacherId,
    periodId,
    aspects,
    strongestAspects: getStrongestAspects(aspects),
    weakestAspects: getWeakestAspects(aspects),
    averageScore
  };
};

export const calculateTeacherAverageScore = (teacherId: string, periodId: string, supervisions: Supervision[]): number => {
  const comp = calculateCompetencyByTeacher(teacherId, periodId, supervisions);
  return comp.averageScore;
};
