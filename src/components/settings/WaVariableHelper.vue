<script setup lang="ts">
const emit = defineEmits<{
  (e: 'select', variable: string): void;
}>();

const variables = [
  { code: 'nama_guru', desc: 'Nama lengkap guru' },
  { code: 'nama_penilai', desc: 'Nama supervisor' },
  { code: 'nama_instrumen', desc: 'Judul instrumen supervisi' },
  { code: 'tanggal', desc: 'Tanggal pelaksanaan' },
  { code: 'jam', desc: 'Waktu pelaksanaan' },
  { code: 'periode', desc: 'Nama periode akademik' },
  { code: 'nilai', desc: 'Nilai akhir supervisi' },
  { code: 'status', desc: 'Predikat akhir' },
  { code: 'target_tanggal', desc: 'Batas waktu refleksi' },
  { code: 'nama_sekolah', desc: 'Nama institusi' },
  { code: 'link', desc: 'Tautan ke aplikasi' }
];
</script>

<template>
  <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
    <h4 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
      <i class="pi pi-code"></i> Variabel Dinamis
    </h4>
    <p class="text-xs text-slate-500 mb-3">Klik variabel untuk menyisipkan ke dalam editor pesan.</p>
    
    <div class="flex flex-wrap gap-2">
      <div 
        v-for="v in variables" 
        :key="v.code"
        class="bg-white border border-slate-300 rounded px-2 py-1 text-xs cursor-pointer hover:border-blue-500 hover:text-blue-600 transition-colors"
        @click="emit('select', v.code)"
        v-tooltip.top="v.desc"
      >
        {{"{" + v.code + "}"}}
      </div>
    </div>
  </div>
</template>
