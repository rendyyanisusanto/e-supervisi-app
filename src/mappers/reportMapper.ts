export const ReportMapper = {
  toSupervisionRecap(apiData: any) {
    return {
      summary: {
        totalSupervisions: apiData.summary?.total_supervisions || 0,
        totalCompleted: apiData.summary?.total_completed || 0,
        totalScheduled: apiData.summary?.total_scheduled || 0,
        totalDraft: apiData.summary?.total_draft || 0,
        totalCancelled: apiData.summary?.total_cancelled || 0,
        averageScore: apiData.summary?.average_score || 0
      },
      byInstrument: apiData.by_instrument?.map((i: any) => ({
        id: i.instrument_id,
        name: i.instrument_name,
        total: i.total,
        averageScore: i.average_score
      })) || [],
      bySupervisor: apiData.by_supervisor?.map((s: any) => ({
        id: s.supervisor_id,
        name: s.supervisor_name,
        total: s.total,
        averageScore: s.average_score
      })) || [],
      teacherCoverage: {
        total: apiData.teacher_coverage?.total || 0,
        supervised: apiData.teacher_coverage?.supervised || 0,
        unsupervised: apiData.teacher_coverage?.unsupervised || 0
      },
      data: (apiData.data || []).map((item: any) => ({
        id: item.id,
        teacherName: item.teacher_name,
        teacherNip: item.teacher_nip,
        supervisorName: item.supervisor_name,
        instrumentName: item.instrument_name,
        subjectName: item.subject_name,
        supervisionDate: item.supervision_date,
        finalScore: item.final_score,
        finalStatus: item.final_status,
        status: item.status,
        reflectionStatus: item.reflection_status || 'BELUM_DIISI'
      }))
    };
  },

  toTeacherReport(apiData: any) {
    return {
      teacher: apiData.teacher,
      period: apiData.period,
      summary: {
        totalSupervisions: apiData.summary.total_supervisions,
        totalCompleted: apiData.summary.total_completed,
        averageScore: apiData.summary.average_score,
        highestScore: apiData.summary.highest_score,
        lowestScore: apiData.summary.lowest_score,
        finalStatus: apiData.summary.final_status
      },
      supervisions: apiData.supervisions.map((item: any) => ({
        id: item.id,
        supervisorName: item.supervisor_name,
        instrumentName: item.instrument_name,
        supervisionDate: item.supervision_date,
        finalScore: item.final_score,
        finalStatus: item.final_status,
        status: item.status
      }))
    };
  },

  toCompetencyMap(apiData: any[]) {
    return apiData.map((item: any) => ({
      category: item.category,
      totalScore: item.total_score,
      maxScore: item.max_score,
      finalScore: item.final_score,
      status: item.status
    }));
  },

  toWeaknessMap(apiData: any) {
    return {
      weakAspects: apiData.weak_aspects.map((item: any) => ({
        category: item.category,
        averageScore: item.average_score
      })),
      weakItems: apiData.weak_items.map((item: any) => ({
        code: item.code,
        description: item.description,
        averageScore: item.average_score
      })),
      attentionTeachers: apiData.attention_teachers
    };
  },

  toBasicSummary(apiData: any) {
    let sangatBaik = 0, baik = 0, cukup = 0, kurang = 0;
    let scheduled = 0, draft = 0;

    if (apiData.supervisions) {
      apiData.supervisions.forEach((s: any) => {
        if (s.status === 'SELESAI') {
          if (s.final_score >= 91) sangatBaik++;
          else if (s.final_score >= 81) baik++;
          else if (s.final_score >= 71) cukup++;
          else kurang++;
        } else if (s.status === 'TERJADWAL') {
          scheduled++;
        } else if (s.status === 'DRAFT' || s.status === 'BELUM_TERLAKSANA') {
          draft++;
        }
      });
    }

    return {
      teachers: {
        total: apiData.summary?.total_teachers || 0,
        active: apiData.summary?.total_teachers || 0
      },
      supervisions: {
        total: apiData.summary?.total_supervisions || 0,
        completed: apiData.summary?.total_completed || 0,
        draft: draft,
        scheduled: scheduled,
        cancelled: 0,
        averageScore: apiData.summary?.average_score || 0
      },
      performance: {
        sangatBaik: sangatBaik,
        baik: baik,
        cukup: cukup,
        kurang: kurang
      },
      tableData: (apiData.supervisions || []).map((s: any) => ({
        ...s,
        status: s.status === 'SELESAI' ? 'Selesai' :
                s.status === 'TERJADWAL' ? 'Terjadwal' :
                s.status === 'DRAFT' ? 'Draft' :
                s.status === 'BELUM_TERLAKSANA' ? 'Belum Diisi' :
                s.status === 'DIBATALKAN' ? 'Dibatalkan' : s.status
      })),
      monthlyRecap: apiData.monthly_recap || []
    };
  },

  toIndicatorReport(apiData: any[]) {
    return apiData.map((item: any) => ({
      instrumentId: item.instrument_id,
      instrumentName: item.instrument_name,
      totalSupervisions: item.total_supervisions,
      averageScore: item.average_score,
      indicators: item.indicators.map((ind: any) => ({
        code: ind.code,
        description: ind.description,
        averageScore: ind.average_score
      }))
    }));
  }
};
