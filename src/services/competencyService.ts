import { supervisionService } from './supervisionService';
import { calculateCompetencyByTeacher } from '../utils/competency';
import type { TeacherCompetency } from '../types/competency';
import { isApiMode } from './dataSource';

export const competencyService = {
  async getTeacherCompetency(teacherId: string, periodId: string): Promise<TeacherCompetency> {
    const res = await supervisionService.getSupervisions({
      teacher_id: teacherId,
      period_id: periodId,
      status: 'SELESAI',
      limit: 100
    });

    let supervisions = res.data;

    // In API mode, list endpoints do not return nested items.
    // We must fetch the details for each finished supervision.
    if (isApiMode()) {
      const detailedSupervisions = await Promise.all(
        supervisions.map(async (s) => {
          try {
            const detailRes = await supervisionService.getSupervisionById(s.id);
            return detailRes.data;
          } catch (e) {
            console.error('Failed to fetch supervision detail for id', s.id, e);
            return s;
          }
        })
      );
      supervisions = detailedSupervisions as any;
    }

    return calculateCompetencyByTeacher(teacherId, periodId, supervisions);
  }
};
