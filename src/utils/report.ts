import type { Supervision } from '../types/supervision';
import type { TeacherReportSummary } from '../types/teacherReport';
import type { WeaknessMap, WeaknessItem, WeaknessAspect, TeacherAttention } from '../types/weaknessMap';
import type { SupervisionRecapSummary } from '../types/report';
import type { Teacher } from '../types/teacher';

export const summarizeTeacherReport = (supervisions: Supervision[]): TeacherReportSummary => {
  const completed = supervisions.filter(s => s.status === 'SELESAI');
  
  if (completed.length === 0) {
    return {
      totalSupervisions: supervisions.length,
      averageScore: 0,
      generalStatus: 'Belum Ada Penilaian',
      highestScore: 0,
      lowestScore: 0,
      assessedInstruments: []
    };
  }

  const scores = completed.map(s => s.finalScore || 0);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  let generalStatus = 'Sangat Baik';
  if (avg < 70) generalStatus = 'Perlu Pembinaan';
  else if (avg < 80) generalStatus = 'Cukup';
  else if (avg < 90) generalStatus = 'Baik';

  return {
    totalSupervisions: supervisions.length,
    averageScore: avg,
    generalStatus,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    assessedInstruments: [...new Set(completed.flatMap(s => s.instrumentIds))]
  };
};

export const buildWeaknessMap = (periodId: string, supervisions: Supervision[], teachers: Teacher[]): WeaknessMap => {
  const completed = supervisions.filter(s => s.status === 'SELESAI' && s.periodId === periodId);
  
  const weaknessThreshold = 0.75; // items < 75% of max score
  
  const weakItemsMap = new Map<string, { desc: string, cat: string, teachers: Set<string>, scores: number[], maxScore: number }>();
  const weakAspectsMap = new Map<string, { teachers: Set<string>, scores: number[] }>();
  const teacherWeaknessMap = new Map<string, { teacherName: string, subjectName: string, itemsCount: number, weakAspects: Set<string>, scores: number[] }>();

  let schoolTotalScore = 0;
  let schoolTotalMax = 0;

  completed.forEach(s => {
    if (!s.finalScore) return;
    
    // For school average
    schoolTotalScore += s.totalScore || 0;
    schoolTotalMax += s.maxScore || 0;

    const teacher = teachers.find(t => t.id === s.teacherId);
    if (!teacher) return;



    s.items.forEach(item => {
      if (item.score !== null && item.score !== undefined && item.maxScore) {
        const percentage = item.score / item.maxScore;
        const cat = item.itemCategory || 'Lainnya';
        
        // Track aspects generally for school average
        const aspectEntry = weakAspectsMap.get(cat) || { teachers: new Set(), scores: [] };
        aspectEntry.scores.push(percentage * 100);
        
        if (percentage < weaknessThreshold) {

          
          // Track weak item
          const wItem = weakItemsMap.get(item.itemCode) || { desc: item.itemDescription, cat, teachers: new Set(), scores: [], maxScore: item.maxScore };
          wItem.teachers.add(s.teacherId);
          wItem.scores.push(item.score);
          weakItemsMap.set(item.itemCode, wItem);

          // Track weak aspect
          aspectEntry.teachers.add(s.teacherId);

          // Track teacher attention
          const tw = teacherWeaknessMap.get(s.teacherId) || { teacherName: teacher.name, subjectName: teacher.position, itemsCount: 0, weakAspects: new Set(), scores: [] };
          tw.itemsCount++;
          tw.weakAspects.add(cat);
          tw.scores.push(percentage * 100);
          teacherWeaknessMap.set(s.teacherId, tw);
        }
        
        weakAspectsMap.set(cat, aspectEntry);
      }
    });
  });

  const itemsList: WeaknessItem[] = [];
  weakItemsMap.forEach((val, key) => {
    const avg = val.scores.reduce((a, b) => a + b, 0) / val.scores.length;
    itemsList.push({
      itemCode: key,
      itemDescription: val.desc,
      category: val.cat,
      affectedTeachersCount: val.teachers.size,
      averageScore: avg,
      maxScore: val.maxScore,
      percentage: (avg / val.maxScore) * 100
    });
  });

  const aspectsList: WeaknessAspect[] = [];
  weakAspectsMap.forEach((val, key) => {
    const avg = val.scores.reduce((a, b) => a + b, 0) / val.scores.length;
    // An aspect is weak if its average is < 80
    if (avg < 80) {
      aspectsList.push({
        category: key,
        averageScore: avg,
        affectedTeachersCount: val.teachers.size,
        status: avg < 70 ? 'Kritis' : 'Perlu Perbaikan',
        recommendation: `Pembinaan khusus pada aspek ${key}`
      });
    }
  });

  const attentionList: TeacherAttention[] = [];
  teacherWeaknessMap.forEach((val, key) => {
    attentionList.push({
      teacherId: key,
      teacherName: val.teacherName,
      subjectName: val.subjectName,
      averageScore: val.scores.reduce((a, b) => a + b, 0) / val.scores.length,
      weakAspects: Array.from(val.weakAspects),
      weakItemsCount: val.itemsCount
    });
  });

  // Sort by severity
  itemsList.sort((a, b) => a.percentage - b.percentage);
  aspectsList.sort((a, b) => a.averageScore - b.averageScore);
  attentionList.sort((a, b) => b.weakItemsCount - a.weakItemsCount);

  return {
    periodId,
    weakItemsCount: itemsList.length,
    weakestAspect: aspectsList.length > 0 ? aspectsList[0].category : 'Tidak Ada',
    teachersNeedingAttentionCount: attentionList.length,
    schoolAverageScore: schoolTotalMax > 0 ? (schoolTotalScore / schoolTotalMax) * 100 : 0,
    aspects: aspectsList,
    items: itemsList,
    teachersAttention: attentionList
  };
};

export const summarizeSupervisionRecap = (supervisions: Supervision[]): SupervisionRecapSummary => {
  const summary = {
    totalSupervisions: supervisions.length,
    completed: 0,
    scheduled: 0,
    draft: 0,
    canceled: 0,
    averageScore: 0
  };

  let totalScore = 0;
  let countScore = 0;

  supervisions.forEach(s => {
    if (s.status === 'SELESAI') { summary.completed++; totalScore += s.finalScore || 0; countScore++; }
    else if (s.status === 'TERJADWAL') summary.scheduled++;
    else if (s.status === 'DRAFT') summary.draft++;
    else if (s.status === 'DIBATALKAN') summary.canceled++;
  });

  if (countScore > 0) summary.averageScore = totalScore / countScore;

  return summary;
};
