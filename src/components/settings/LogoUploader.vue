<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { useSchoolProfileStore } from '../../stores/schoolProfileStore';

const props = defineProps<{
  currentLogo?: string | null;
}>();

const toast = useToast();
const store = useSchoolProfileStore();
const fileInput = ref<HTMLInputElement | null>(null);

const triggerUpload = () => {
  fileInput.value?.click();
};

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 512;
        const MAX_HEIGHT = 512;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file); // Fallback to original if canvas fails
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to webp for better transparency and size
        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, 'image/webp', 0.8);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    try {
      // Compress the image before uploading
      const compressedFile = await compressImage(file);
      await store.uploadLogo(compressedFile);
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Logo berhasil diupload', life: 3000 });
    } catch (err: any) {
      toast.add({ severity: 'error', summary: 'Gagal', detail: err.message || 'Gagal mengupload logo', life: 3000 });
    }
  }
};

const handleRemove = () => {
  toast.add({ severity: 'info', summary: 'Info', detail: 'Fitur hapus logo belum tersedia', life: 3000 });
};
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center h-full">
    <div class="w-32 h-32 rounded-full border-4 border-slate-100 overflow-hidden mb-4 bg-slate-50 flex items-center justify-center shadow-inner relative group">
      <img v-if="currentLogo" :src="currentLogo" alt="Logo Sekolah" class="w-full h-full object-cover" />
      <div v-else class="text-slate-400 flex flex-col items-center">
        <i class="pi pi-image text-3xl mb-1"></i>
        <span class="text-xs font-medium">Logo</span>
      </div>
      
      <!-- Hover overlay -->
      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Button icon="pi pi-upload" rounded text class="text-white hover:bg-white/20" @click="triggerUpload" />
      </div>
    </div>
    
    <h3 class="font-bold text-slate-800 mb-1">Logo Sekolah</h3>
    <p class="text-sm text-slate-500 mb-4 max-w-[200px]">Format disarankan: PNG transparan, ukuran ideal 256x256 px.</p>
    
    <div class="flex gap-2">
      <Button label="Upload" size="small" icon="pi pi-upload" outlined @click="triggerUpload" />
      <Button v-if="currentLogo" icon="pi pi-trash" size="small" severity="danger" text @click="handleRemove" />
    </div>
    
    <input type="file" ref="fileInput" class="hidden" accept="image/png, image/jpeg" @change="handleFileChange" />
  </div>
</template>
