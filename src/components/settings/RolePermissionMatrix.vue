<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const permissions = [
  { menu: 'Dashboard', admin: true, kurikulum: true, penilai: true, guru: true },
  { menu: 'Data Supervisi', admin: true, kurikulum: true, penilai: true, guru: false },
  { menu: 'Input Penilaian', admin: true, kurikulum: false, penilai: true, guru: false },
  { menu: 'Hasil Supervisi (Pribadi)', admin: false, kurikulum: false, penilai: false, guru: true },
  { menu: 'Rapor Guru (Semua)', admin: true, kurikulum: true, penilai: true, guru: false },
  { menu: 'Rapor Guru (Pribadi)', admin: false, kurikulum: false, penilai: false, guru: true },
  { menu: 'Peta Kompetensi', admin: true, kurikulum: true, penilai: true, guru: false },
  { menu: 'Peta Kelemahan', admin: true, kurikulum: true, penilai: false, guru: false },
  { menu: 'Data Guru', admin: true, kurikulum: true, penilai: false, guru: false },
  { menu: 'Instrumen', admin: true, kurikulum: true, penilai: false, guru: false },
  { menu: 'Pengaturan Sistem', admin: true, kurikulum: false, penilai: false, guru: false },
  { menu: 'Pengaturan Cetak/Laporan', admin: true, kurikulum: true, penilai: false, guru: false }
];
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
    <div class="p-4 border-b border-gray-200 bg-slate-50">
      <h3 class="font-bold text-slate-800">Matriks Hak Akses (Role Permission)</h3>
      <p class="text-sm text-slate-500">Tabel berikut merupakan panduan hak akses default untuk masing-masing role.</p>
    </div>
    <DataTable :value="permissions" class="p-datatable-sm" stripedRows>
      <Column field="menu" header="Menu / Fitur" class="font-medium text-slate-700"></Column>
      <Column header="Admin" class="text-center w-24">
        <template #body="{ data }">
          <i v-if="data.admin" class="pi pi-check text-green-500 font-bold"></i>
          <i v-else class="pi pi-times text-slate-300"></i>
        </template>
      </Column>
      <Column header="Kurikulum" class="text-center w-24">
        <template #body="{ data }">
          <i v-if="data.kurikulum" class="pi pi-check text-green-500 font-bold"></i>
          <i v-else class="pi pi-times text-slate-300"></i>
        </template>
      </Column>
      <Column header="Penilai" class="text-center w-24">
        <template #body="{ data }">
          <i v-if="data.penilai" class="pi pi-check text-green-500 font-bold"></i>
          <i v-else class="pi pi-times text-slate-300"></i>
        </template>
      </Column>
      <Column header="Guru" class="text-center w-24">
        <template #body="{ data }">
          <i v-if="data.guru" class="pi pi-check text-green-500 font-bold"></i>
          <i v-else class="pi pi-times text-slate-300"></i>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
