import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/forbidden',
      name: 'forbidden',
      component: () => import('../views/errors/ForbiddenView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      component: () => import('../components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/dashboard/DashboardView.vue'),
          meta: { title: 'Dashboard' }
        },
        {
          path: 'supervisi',
          name: 'supervisi-list',
          component: () => import('../views/supervision/SupervisionListView.vue'),
          meta: { title: 'Data Supervisi' }
        },
        {
          path: 'supervisi/mulai',
          name: 'supervisi-mulai',
          component: () => import('../views/supervision/SupervisionCreateView.vue'),
          meta: { title: 'Mulai Supervisi' }
        },
        {
          path: 'supervisi/:id/input',
          name: 'supervisi-input',
          component: () => import('../views/supervision/SupervisionInputView.vue'),
          meta: { title: 'Input Penilaian' }
        },
        {
          path: 'supervisi/:id/hasil',
          name: 'supervisi-hasil',
          component: () => import('../views/supervision/SupervisionResultView.vue'),
          meta: { title: 'Hasil Supervisi' }
        },
        {
          path: 'supervisi/hasil',
          name: 'supervisi-hasil-list',
          component: () => import('../views/supervision/SupervisionResultListView.vue'),
          meta: { title: 'Daftar Hasil Supervisi' }
        },
        {
          path: 'guru',
          name: 'teacher-list',
          component: () => import('../views/teachers/TeacherListView.vue'),
          meta: { title: 'Data Guru' }
        },
        // Sprint 4 Routes
        { path: 'refleksi', component: () => import('../views/reflection/ReflectionListView.vue'), meta: { title: 'Daftar Refleksi' } },
        { path: 'refleksi/:id', component: () => import('../views/reflection/ReflectionFormView.vue'), meta: { title: 'Isi Refleksi' } },
        { path: 'guru/peta-kompetensi', component: () => import('../views/competency/TeacherCompetencyView.vue'), meta: { title: 'Peta Kompetensi' } },
        { path: 'guru/rapor', component: () => import('../views/reports/TeacherReportView.vue'), meta: { title: 'Rapor Guru' } },
        { path: 'laporan/rekap-supervisi', component: () => import('../views/reports/SupervisionRecapView.vue'), meta: { title: 'Rekap Supervisi' } },
        { path: 'laporan/dasar', component: () => import('../views/reports/BasicSummaryView.vue'), meta: { title: 'Laporan Dasar' } },
        { path: 'laporan/indikator', component: () => import('../views/reports/IndicatorReportView.vue'), meta: { title: 'Laporan Per Indikator' } },
        { path: 'laporan/rapor-guru', component: () => import('../views/reports/TeacherReportView.vue'), meta: { title: 'Rapor Guru' } },
        { path: 'laporan/peta-kelemahan', component: () => import('../views/reports/WeaknessMapView.vue'), meta: { title: 'Peta Kelemahan' } },

        // Generic placeholders for other routes
        { path: 'instrumen', component: () => import('../views/instruments/InstrumentListView.vue'), meta: { title: 'Instrumen Supervisi' } },
        { path: 'instrumen/:id/builder', component: () => import('../views/instruments/InstrumentBuilderView.vue'), meta: { title: 'Form Builder' } },
        { path: 'instrumen/rentang-nilai', component: () => import('../views/instruments/ScoreRangeView.vue'), meta: { title: 'Rentang Nilai' } },
        { path: 'master/periode', component: () => import('../views/master/PeriodView.vue'), meta: { title: 'Periode' } },
        { path: 'master/mata-pelajaran', component: () => import('../views/master/SubjectView.vue'), meta: { title: 'Mata Pelajaran' } },
        { path: 'master/kelas', component: () => import('../views/master/ClassroomView.vue'), meta: { title: 'Kelas / Rombel' } },
        // Settings Routes (Admin & Kurikulum only)
        { path: 'pengaturan/profil-sekolah', component: () => import('../views/settings/SchoolProfileView.vue'), meta: { title: 'Profil Sekolah', roles: ['admin', 'kurikulum'] } },
        { path: 'pengaturan/akun-hak-akses', component: () => import('../views/settings/UserAccessView.vue'), meta: { title: 'Akun & Hak Akses', roles: ['admin', 'kurikulum'] } },
        { path: 'pengaturan/template-wa', component: () => import('../views/settings/WaTemplateView.vue'), meta: { title: 'Template WA', roles: ['admin', 'kurikulum'] } },
        { path: 'pengaturan/format-laporan', component: () => import('../views/settings/ReportFormatView.vue'), meta: { title: 'Format Laporan', roles: ['admin', 'kurikulum'] } },
        { path: 'pengaturan/notifikasi-wa', component: () => import('../views/settings/WaLogView.vue'), meta: { title: 'Log WA', roles: ['admin', 'kurikulum'] } },
        { path: 'pengaturan/audit-log', component: () => import('../views/settings/AuditLogView.vue'), meta: { title: 'Audit Log', roles: ['admin', 'kurikulum'] } },
        { path: 'pengaturan/preferensi', component: () => import('../views/settings/AppPreferenceView.vue'), meta: { title: 'Preferensi Sistem', roles: ['admin'] } }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard'
    }
  ]
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' });
  } else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'dashboard' });
  } else if (to.meta.roles && isAuthenticated) {
    // Check if user has required role
    if (authStore.canAccessAnyRole(to.meta.roles as any[])) {
      next();
    } else {
      next({ name: 'forbidden' });
    }
  } else {
    next();
  }
});

export default router;
