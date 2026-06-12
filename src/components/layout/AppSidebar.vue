<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { useLayoutStore } from '../../stores/layoutStore';
import SidebarMenuItem from './SidebarMenuItem.vue';
import Avatar from 'primevue/avatar';

const authStore = useAuthStore();
const layoutStore = useLayoutStore();
const router = useRouter();

const user = computed(() => authStore.user);

const getInitials = (name: string) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const menuItems = computed(() => {
  const role = authStore.role;
  
  const items = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      to: '/dashboard',
      key: 'dashboard',
      visible: true
    },
    {
      label: 'Supervisi',
      icon: 'pi pi-desktop',
      key: 'supervisi',
      to: '/supervisi',
      visible: ['admin', 'kurikulum', 'penilai', 'guru'].includes(role),
      items: [
        { label: 'Data Supervisi', to: '/supervisi', key: 'supervisi-data', visible: ['admin', 'kurikulum', 'penilai'].includes(role) },
        { label: 'Mulai Supervisi', to: '/supervisi/mulai', key: 'supervisi-mulai', visible: ['admin', 'kurikulum', 'penilai'].includes(role) },
        { label: 'Hasil Supervisi', to: '/supervisi/hasil', key: 'supervisi-hasil', visible: true }
      ]
    },
    {
      label: 'Guru',
      icon: 'pi pi-users',
      key: 'guru',
      to: '/guru',
      visible: ['admin', 'kurikulum', 'penilai', 'guru'].includes(role),
      items: [
        { label: 'Data Guru', to: '/guru', key: 'guru-data', visible: ['admin', 'kurikulum', 'penilai'].includes(role) },
        { label: 'Peta Kompetensi', to: '/guru/peta-kompetensi', key: 'guru-peta', visible: ['admin', 'kurikulum', 'penilai'].includes(role) },
        { label: 'Rapor Guru', to: '/guru/rapor', key: 'guru-rapor', visible: true }
      ]
    },
    {
      label: 'Instrumen',
      icon: 'pi pi-file-edit',
      key: 'instrumen',
      to: '/instrumen',
      visible: ['admin', 'kurikulum'].includes(role),
      items: [
        { label: 'Instrumen Supervisi', to: '/instrumen', key: 'instrumen-data', visible: true },
        { label: 'Rentang Nilai', to: '/instrumen/rentang-nilai', key: 'instrumen-rentang', visible: true }
      ]
    },
    {
      label: 'Laporan',
      icon: 'pi pi-chart-bar',
      key: 'laporan',
      to: '/laporan/rekap-supervisi', // Default child route
      visible: ['admin', 'kurikulum', 'penilai'].includes(role),
      items: [
        { label: 'Laporan Dasar', to: '/laporan/dasar', key: 'laporan-dasar', visible: true },
        { label: 'Rekap Supervisi', to: '/laporan/rekap-supervisi', key: 'laporan-rekap', visible: true },
        { label: 'Laporan Per Indikator', to: '/laporan/indikator', key: 'laporan-indikator', visible: true },
        { label: 'Peta Kelemahan', to: '/laporan/peta-kelemahan', key: 'laporan-peta', visible: true },
        { label: 'Rapor Guru', to: '/laporan/rapor-guru', key: 'laporan-rapor', visible: true }
      ]
    },
    {
      label: 'Master Data',
      icon: 'pi pi-database',
      key: 'master',
      to: '/master/periode', // Default child route
      visible: ['admin', 'kurikulum'].includes(role),
      items: [
        { label: 'Periode', to: '/master/periode', key: 'master-periode', visible: true },
        { label: 'Mata Pelajaran', to: '/master/mata-pelajaran', key: 'master-mapel', visible: true },
        { label: 'Kelas / Rombel', to: '/master/kelas', key: 'master-kelas', visible: true }
      ]
    },
    {
      label: 'Pengaturan',
      icon: 'pi pi-cog',
      key: 'pengaturan',
      to: '/pengaturan/profil-sekolah', // Default child route
      visible: ['admin', 'kurikulum'].includes(role),
      items: [
        { label: 'Profil Sekolah', to: '/pengaturan/profil-sekolah', key: 'pengaturan-profil', visible: true },
        { label: 'Akun & Hak Akses', to: '/pengaturan/akun-hak-akses', key: 'pengaturan-akun', visible: true },
        { label: 'Template WA', to: '/pengaturan/template-wa', key: 'pengaturan-wa', visible: true },
        { label: 'Format Laporan', to: '/pengaturan/format-laporan', key: 'pengaturan-laporan', visible: true },
        { label: 'Log Notifikasi WA', to: '/pengaturan/notifikasi-wa', key: 'pengaturan-log-wa', visible: true },
        { label: 'Audit Log', to: '/pengaturan/audit-log', key: 'pengaturan-audit-log', visible: true }
      ]
    }
  ];

  // Filter based on visibility
  return items.filter(item => {
    if (!item.visible) return false;
    if (item.items) {
      item.items = item.items.filter(child => child.visible);
      return item.items.length > 0;
    }
    return true;
  });
});

</script>

<template>
  <div class="h-screen bg-primary flex flex-col transition-all duration-300 z-30"
       :class="[layoutStore.sidebarCollapsed ? 'w-[84px]' : 'w-72']">
    <!-- Header -->
    <div class="h-16 flex items-center px-4 shrink-0 mt-2">
      <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white shrink-0">
        <i class="pi pi-desktop text-xl"></i>
      </div>
      <div class="ml-3 overflow-hidden whitespace-nowrap transition-opacity duration-300"
           :class="{'opacity-0 w-0': layoutStore.sidebarCollapsed}">
        <div class="font-bold text-white text-lg tracking-tight leading-none">E-Supervisi</div>
        <div class="text-blue-200 text-[10px] uppercase tracking-wider font-semibold mt-1">Supervisi Berbasis Data</div>
      </div>
    </div>

    <!-- Menus -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 custom-scrollbar">
      <SidebarMenuItem v-for="item in menuItems" :key="item.key" :item="item" />
    </div>

    <!-- User Card -->
    <div class="p-3 shrink-0 mb-2">
      <div class="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex items-center justify-between"
           :class="{'flex-col gap-2 p-3': layoutStore.sidebarCollapsed}">
        
        <div class="flex items-center overflow-hidden" :class="{'justify-center w-full': layoutStore.sidebarCollapsed}">
          <Avatar :label="getInitials(user?.name || '')" shape="circle" class="bg-blue-600 text-white shrink-0" />
          <div class="ml-3 overflow-hidden whitespace-nowrap" v-if="!layoutStore.sidebarCollapsed">
            <div class="text-sm font-semibold text-white truncate">{{ user?.name }}</div>
            <div class="text-xs text-blue-200 truncate">{{ user?.position }}</div>
          </div>
        </div>

        <button @click="handleLogout" 
                class="w-8 h-8 rounded-full flex items-center justify-center text-blue-200 hover:bg-white/10 hover:text-white transition-colors shrink-0"
                :title="'Logout'">
          <i class="pi pi-sign-out"></i>
        </button>

      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
}
</style>
