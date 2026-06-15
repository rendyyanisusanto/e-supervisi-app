import type { SupervisionItem } from '../types/supervision';
import type { ScoreRange } from '../types/scoreRange';

export const calculateTotalScore = (items: SupervisionItem[]): number => {
  return items.reduce((total, item) => total + (item.score || 0), 0);
};

export const calculateMaxScore = (items: SupervisionItem[]): number => {
  return items.reduce((total, item) => total + (item.maxScore || 0), 0);
};

export const calculateFinalScore = (totalScore: number, maxScore: number): number => {
  if (maxScore === 0) return 0;
  return Number(((totalScore / maxScore) * 100).toFixed(2));
};

export const getScoreStatus = (finalScore: number, scoreRanges: ScoreRange[]): string => {
  if (finalScore === 0) return '-';
  
  const range = scoreRanges.find(r => finalScore >= r.minScore && finalScore <= r.maxScore);
  return range ? range.name : 'Kurang';
};

export const getItemStatus = (score: number | null, maxScore: number): string | null => {
  if (score === null) return null;
  if (maxScore === 0) return null;
  
  const percentage = (score / maxScore) * 100;
  if (percentage === 100) return 'Optimal';
  if (percentage >= 80) return 'Baik';
  if (percentage >= 60) return 'Cukup';
  return 'Perlu Pembinaan';
};

export const calculateCategoryScores = (items: SupervisionItem[], scoreRanges: ScoreRange[]) => {
  const categories = new Map<string, { totalScore: number; maxScore: number }>();
  
  items.forEach(item => {
    const key = item.instrumentName || item.itemCategory;
    if (!categories.has(key)) {
      categories.set(key, { totalScore: 0, maxScore: 0 });
    }
    
    const cat = categories.get(key)!;
    cat.totalScore += (item.score || 0);
    cat.maxScore += item.maxScore;
  });
  
  const result: any[] = [];
  categories.forEach((value, key) => {
    const finalScore = calculateFinalScore(value.totalScore, value.maxScore);
    result.push({
      category: key,
      totalScore: value.totalScore,
      maxScore: value.maxScore,
      finalScore,
      status: getScoreStatus(finalScore, scoreRanges)
    });
  });
  
  return result;
};

export const countFilledItems = (items: SupervisionItem[]): number => {
  return items.filter(item => item.score !== null).length;
};

export const countLowScoreItems = (items: SupervisionItem[]): number => {
  return items.filter(item => item.score !== null && item.score < item.maxScore).length;
};
