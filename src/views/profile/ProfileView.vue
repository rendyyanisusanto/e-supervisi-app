<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from 'primevue/usetoast';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';

const authStore = useAuthStore();
const toast = useToast();

const loading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const formData = ref({
  name: '',
  username: '',
  email: '',
  password: ''
});

const currentPhoto = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);

onMounted(() => {
  if (authStore.user) {
    formData.value.name = authStore.user.name;
    formData.value.username = authStore.user.username;
    formData.value.email = authStore.user.email || '';
    if (authStore.user.avatar) {
      currentPhoto.value = 'http://localhost:3000' + authStore.user.avatar; // adjust based on API URL
    }
  }
});

const triggerUpload = () => {
  fileInput.value?.click();
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(selectedFile.value);
  }
};

const getInitials = (name: string) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const saveProfile = async () => {
  loading.value = true;
  try {
    const data = new FormData();
    data.append('name', formData.value.name);
    data.append('username', formData.value.username);
    if (formData.value.email) {
      data.append('email', formData.value.email);
    }
    if (formData.value.password) {
      data.append('password', formData.value.password);
    }
    if (selectedFile.value) {
      data.append('photo', selectedFile.value);
    }

    const success = await authStore.updateProfile(data);
    if (success) {
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Profil berhasil diperbarui', life: 3000 });
      formData.value.password = '';
      if (authStore.user?.avatar) {
        currentPhoto.value = 'http://localhost:3000' + authStore.user.avatar;
        previewUrl.value = null;
        selectedFile.value = null;
      }
    }
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: error.message || 'Gagal memperbarui profil', life: 3000 });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <BasePageHeader 
      title="Profil Saya" 
      description="Kelola informasi akun dan profil Anda."
      icon="pi pi-user"
    />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-1">
        <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center h-full">
          <div class="w-32 h-32 rounded-full border-4 border-slate-100 overflow-hidden mb-4 bg-slate-50 flex items-center justify-center shadow-inner relative group">
            <img v-if="previewUrl" :src="previewUrl" alt="Preview Foto" class="w-full h-full object-cover" />
            <img v-else-if="currentPhoto" :src="currentPhoto" alt="Foto Profil" class="w-full h-full object-cover" />
            <Avatar v-else :label="getInitials(authStore.user?.name || '')" class="w-full h-full text-4xl bg-primary-soft text-primary font-bold" />
            
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" @click="triggerUpload">
              <i class="pi pi-camera text-white text-2xl"></i>
            </div>
          </div>
          
          <h3 class="font-bold text-slate-800 mb-1">{{ authStore.user?.name }}</h3>
          <p class="text-sm text-slate-500 mb-4">{{ authStore.user?.position || authStore.user?.roles.join(', ') }}</p>
          
          <Button label="Ganti Foto" size="small" outlined icon="pi pi-upload" @click="triggerUpload" />
          <input type="file" ref="fileInput" class="hidden" accept="image/png, image/jpeg, image/jpg" @change="handleFileChange" />
        </div>
      </div>
      
      <div class="md:col-span-2">
        <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Informasi Dasar</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap <span class="text-red-500">*</span></label>
              <InputText v-model="formData.name" class="w-full" placeholder="Masukkan nama lengkap" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <InputText v-model="formData.email" class="w-full" placeholder="email@contoh.com" type="email" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Username <span class="text-red-500">*</span></label>
              <InputText v-model="formData.username" class="w-full" placeholder="Masukkan username" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
              <Password v-model="formData.password" class="w-full" :feedback="true" toggleMask placeholder="Kosongkan jika tidak ingin mengubah password" />
              <small class="text-slate-500 mt-1 block">Minimal 6 karakter jika ingin mengganti password.</small>
            </div>
            
            <div class="pt-4 flex justify-end gap-2 border-t mt-6">
              <Button label="Simpan Perubahan" icon="pi pi-save" :loading="loading" @click="saveProfile" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-password input) {
  width: 100%;
}
</style>
