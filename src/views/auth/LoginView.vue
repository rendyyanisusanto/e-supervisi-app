<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from 'primevue/usetoast';


import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Message from 'primevue/message';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const form = reactive({
  username: '',
  password: '',
  rememberMe: false
});

const submitLogin = async () => {
  if (!form.username || !form.password) {
    authStore.error = 'Username dan password wajib diisi';
    return;
  }

  const success = await authStore.login(form.username, form.password);
  
  if (success) {
    toast.add({ severity: 'success', summary: 'Login Berhasil', detail: `Selamat datang, ${authStore.displayName}`, life: 3000 });
    router.push('/dashboard');
  } else {
    toast.add({ severity: 'error', summary: 'Login Gagal', detail: authStore.error || 'Terjadi kesalahan', life: 3000 });
  }
};

const demoAccounts = [
  { role: 'Admin', username: 'admin', pass: 'admin123' },
  { role: 'Kurikulum', username: 'kurikulum', pass: 'admin123' },
  { role: 'Penilai', username: 'penilai', pass: 'admin123' },
  { role: 'Guru', username: 'guru', pass: 'admin123' },
];

const useDemoAccount = (username: string) => {
  form.username = username;
  form.password = 'admin123';
};
</script>

<template>
  <div class="flex min-h-screen bg-slate-50">
    <!-- Left Panel: Login Form -->
    <div class="w-full lg:w-5/12 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 bg-white shadow-xl z-10">
      <div class="w-full max-w-md mx-auto">
        <!-- Logo & Header -->
        <div class="mb-8 text-center lg:text-left">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-soft text-primary mb-4">
            <i class="pi pi-desktop text-2xl"></i>
          </div>
          <h1 class="text-3xl font-bold text-slate-900 mb-2">Masuk ke E-Supervisi</h1>
          <p class="text-slate-500">Kelola supervisi guru, instrumen, hasil, dan laporan secara digital.</p>
        </div>

        <Message v-if="authStore.error" severity="error" :closable="false" class="mb-6">{{ authStore.error }}</Message>

        <!-- Form -->
        <form @submit.prevent="submitLogin" class="space-y-6">
          <div class="space-y-1">
            <label for="username" class="block text-sm font-medium text-slate-700">Username</label>
            <InputText id="username" v-model="form.username" class="w-full" placeholder="Masukkan username" :disabled="authStore.loading" autofocus />
          </div>

          <div class="space-y-1">
            <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
            <Password id="password" v-model="form.password" :feedback="false" toggleMask class="w-full" inputClass="w-full" placeholder="Masukkan password" :disabled="authStore.loading" />
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <Checkbox id="remember" v-model="form.rememberMe" :binary="true" />
              <label for="remember" class="ml-2 text-sm text-slate-600 cursor-pointer">Ingat saya</label>
            </div>
            <a href="#" class="text-sm font-medium text-primary hover:text-primary-hover">Lupa password?</a>
          </div>

          <Button type="submit" label="Masuk" class="w-full !py-3 !text-lg" :loading="authStore.loading" :disabled="authStore.loading" />
        </form>

        <!-- Demo Accounts -->
        <div class="mt-10">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-200"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-slate-500">Akun Demo Sprint 1</span>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3 mt-6">
            <div v-for="acc in demoAccounts" :key="acc.role" 
                 @click="useDemoAccount(acc.username)"
                 class="border border-slate-200 rounded-xl p-3 cursor-pointer hover:border-primary hover:bg-primary-soft transition-colors text-center">
              <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{{ acc.role }}</div>
              <div class="text-sm font-medium text-slate-900">{{ acc.username }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel: Visual Illustration -->
    <div class="hidden lg:flex lg:w-7/12 bg-primary relative overflow-hidden flex-col justify-center items-center p-12">
      <!-- Background Decorative Elements -->
      <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl"></div>
      <div class="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-white opacity-10 blur-2xl"></div>
      
      <div class="relative z-10 w-full max-w-2xl">
        <h2 class="text-4xl font-bold text-white mb-6 leading-tight">Supervisi Guru<br/>Berbasis Data</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <!-- Benefit Cards -->
          <div class="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white">
            <i class="pi pi-chart-line text-3xl mb-4 text-blue-200"></i>
            <h3 class="text-lg font-semibold mb-2">Terukur & Objektif</h3>
            <p class="text-blue-100 text-sm">Supervisi guru lebih terukur dengan instrumen digital yang terstandarisasi.</p>
          </div>
          
          <div class="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white">
            <i class="pi pi-folder-open text-3xl mb-4 text-blue-200"></i>
            <h3 class="text-lg font-semibold mb-2">Terdokumentasi</h3>
            <p class="text-blue-100 text-sm">Hasil penilaian dan bukti pelaksanaan tersimpan aman di cloud.</p>
          </div>
          
          <div class="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white">
            <i class="pi pi-users text-3xl mb-4 text-blue-200"></i>
            <h3 class="text-lg font-semibold mb-2">Peta Kompetensi</h3>
            <p class="text-blue-100 text-sm">Peta kompetensi guru mudah dianalisis untuk tindak lanjut pembinaan.</p>
          </div>
          
          <div class="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white">
            <i class="pi pi-file-export text-3xl mb-4 text-blue-200"></i>
            <h3 class="text-lg font-semibold mb-2">Laporan Cepat</h3>
            <p class="text-blue-100 text-sm">Pembuatan laporan kurikulum lebih cepat dan otomatis hanya dengan satu klik.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
