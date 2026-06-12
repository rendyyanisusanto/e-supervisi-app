<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

const router = useRouter();

const goBack = () => {
  router.push('/dashboard');
};
</script>

<template>
  <div class="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
    <div class="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
      <i class="pi pi-lock text-red-500 text-4xl"></i>
    </div>
    
    <h1 class="text-3xl font-bold text-slate-800 mb-2">Akses Ditolak</h1>
    <p class="text-slate-500 max-w-md mb-8">
      Maaf, Anda tidak memiliki izin (hak akses) yang memadai untuk melihat atau menggunakan halaman ini.
    </p>
    
    <Button label="Kembali ke Dashboard" icon="pi pi-home" @click="goBack" />
  </div>
</template>
