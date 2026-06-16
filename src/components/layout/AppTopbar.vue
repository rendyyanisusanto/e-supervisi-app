<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { useLayoutStore } from '../../stores/layoutStore';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

import InputText from 'primevue/inputtext';
import Avatar from 'primevue/avatar';
import Menu from 'primevue/menu';
import NotificationDropdown from '../notification/NotificationDropdown.vue';

const router = useRouter();
const authStore = useAuthStore();
const layoutStore = useLayoutStore();
const toast = useToast();
const confirm = useConfirm();

const user = computed(() => authStore.user);

const getInitials = (name: string) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const menuItems = [
  {
    label: 'Profil Saya',
    icon: 'pi pi-user',
    command: () => {
      router.push('/profil');
    }
  },
  {
    label: 'Pengaturan',
    icon: 'pi pi-cog',
    command: () => {
      router.push('/pengaturan/profil-sekolah');
    }
  },
  {
    separator: true
  },
  {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    command: () => {
      confirm.require({
        message: 'Apakah Anda yakin ingin keluar dari aplikasi?',
        header: 'Konfirmasi Logout',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Ya, Keluar',
        rejectLabel: 'Batal',
        acceptClass: 'p-button-danger',
        accept: () => {
          authStore.logout();
          router.push('/login');
          toast.add({ severity: 'success', summary: 'Logout', detail: 'Anda telah berhasil keluar', life: 3000 });
        }
      });
    }
  }
];

const toggleMenu = (event: Event) => {
  // PrimeVue menu toggle logic will be handled by ref
  menuRef.value.toggle(event);
};

// We need a ref for the menu
import { ref } from 'vue';
const menuRef = ref();

</script>

<template>
  <div class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
    <div class="flex items-center gap-4">
      <button @click="layoutStore.toggleSidebar" class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors hidden lg:block">
        <i class="pi pi-bars text-xl"></i>
      </button>
      <button @click="layoutStore.toggleMobileSidebar" class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors lg:hidden">
        <i class="pi pi-bars text-xl"></i>
      </button>

      <!-- Breadcrumbs / Title Placeholder -->
      <div class="hidden md:flex flex-col">
        <h2 class="text-lg font-semibold text-slate-800">{{ $route.meta.title || 'E-Supervisi' }}</h2>
      </div>
    </div>

    <div class="flex items-center gap-3 lg:gap-5">
      <!-- Search -->
      <span class="relative hidden md:block">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <InputText placeholder="Cari..." class="pl-10 !rounded-full !bg-slate-100 border-none w-64 text-sm" />
      </span>

      <!-- Notifications -->
      <NotificationDropdown />

      <div class="w-px h-8 bg-slate-200 hidden md:block"></div>

      <!-- Profile Dropdown -->
      <div class="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-slate-50 transition-colors" @click="toggleMenu" aria-haspopup="true" aria-controls="overlay_menu">
        <Avatar v-if="user?.avatar" :image="'http://localhost:3000' + user.avatar" shape="circle" class="bg-slate-100" />
        <Avatar v-else :label="getInitials(user?.name || '')" shape="circle" class="bg-primary-soft text-primary font-semibold" />
        <div class="hidden md:block text-left mr-2">
          <div class="text-sm font-semibold text-slate-800 leading-tight">{{ user?.name }}</div>
          <div class="text-xs text-slate-500">{{ user?.position }}</div>
        </div>
        <i class="pi pi-angle-down text-slate-400 text-sm hidden md:block"></i>
      </div>
      <Menu ref="menuRef" id="overlay_menu" :model="menuItems" :popup="true" />
    </div>
  </div>
</template>
