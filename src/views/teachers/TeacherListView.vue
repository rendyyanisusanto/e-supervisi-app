<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTeacherStore } from '../../stores/teacherStore';
import { useSubjectStore } from '../../stores/subjectStore';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { ROLES } from '../../constants/roles';

import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import Tag from 'primevue/tag';
import MultiSelect from 'primevue/multiselect';
import Avatar from 'primevue/avatar';
import Skeleton from 'primevue/skeleton';
import Divider from 'primevue/divider';

import BasePageHeader from '../../components/common/BasePageHeader.vue';
import BaseToolbarFilter from '../../components/common/BaseToolbarFilter.vue';
import BaseStatusTag from '../../components/common/BaseStatusTag.vue';
import BaseActionMenu from '../../components/common/BaseActionMenu.vue';
import BaseLoadingSkeleton from '../../components/common/BaseLoadingSkeleton.vue';
import BaseEmptyState from '../../components/common/BaseEmptyState.vue';
import BaseErrorState from '../../components/common/BaseErrorState.vue';
import BaseAvatarName from '../../components/common/BaseAvatarName.vue';
import BaseFormSection from '../../components/common/BaseFormSection.vue';

const teacherStore = useTeacherStore();
const subjectStore = useSubjectStore();
const toast = useToast();
const confirm = useConfirm();

const breadcrumbs = ref([
  { label: 'E-Supervisi', to: '/' },
  { label: 'Guru', to: '/guru' },
  { label: 'Data Guru' }
]);

const searchQuery = ref('');
const selectedSubject = ref<string | null>(null);
const selectedRole = ref<string | null>(null);

const dialogVisible = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const submitted = ref(false);

const genderOptions = [
  { label: 'Laki-laki', value: 'L' },
  { label: 'Perempuan', value: 'P' }
];

const roleOptions = [
  { label: 'Admin', value: ROLES.ADMIN },
  { label: 'Kurikulum', value: ROLES.KURIKULUM },
  { label: 'Penilai', value: ROLES.PENILAI },
  { label: 'Guru', value: ROLES.GURU }
];

const form = ref<any>({
  id: '',
  name: '',
  nip: '',
  nuptk: '',
  nik: '',
  gender: 'L',
  email: '',
  phone: '',
  mainSubjectId: '',
  position: 'Guru Mata Pelajaran',
  isActive: true,
  enableAccount: false,
  username: '',
  password: '',
  roles: [ROLES.GURU]
});

onMounted(() => {
  teacherStore.fetchTeachers();
  subjectStore.fetchSubjects();
});

const subjectOptions = computed(() => {
  return subjectStore.subjects.map(s => ({ label: s.name, value: s.id }));
});

const filteredTeachers = computed(() => {
  if (!teacherStore.teachers) return [];
  let result = teacherStore.teachers;
  
  if (selectedSubject.value) result = result.filter(t => t.mainSubjectId === selectedSubject.value);
  if (selectedRole.value) {
    result = result.filter(t => t.userAccount?.roles.includes(selectedRole.value as any));
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(t => 
      (t.name && t.name.toLowerCase().includes(q)) || 
      (t.nip && t.nip.toLowerCase().includes(q))
    );
  }
  // Sort by id descending
  result = result.sort((a, b) => Number(b.id) - Number(a.id));
  
  return result;
});

const getSubjectName = (id: string) => {
  return subjectStore.subjects.find(s => s.id === id)?.name || '-';
};

const openAddDialog = () => {
  form.value = {
    id: '', name: '', nip: '', nuptk: '', nik: '', gender: 'L', email: '', phone: '',
    mainSubjectId: '', position: 'Guru Mata Pelajaran', isActive: true,
    enableAccount: false, username: '', password: 'admin123', roles: [ROLES.GURU]
  };
  dialogMode.value = 'add';
  submitted.value = false;
  dialogVisible.value = true;
};

const openEditDialog = (data: any) => {
  form.value = { 
    ...data,
    enableAccount: !!data.userAccount,
    hasExistingAccount: !!data.userAccount,
    username: data.userAccount?.username || '',
    roles: data.userAccount?.roles || [ROLES.GURU],
    password: '' // Don't show password on edit
  };
  dialogMode.value = 'edit';
  submitted.value = false;
  dialogVisible.value = true;
};

const saveTeacher = async () => {
  submitted.value = true;
  
  if (!form.value.name || !form.value.phone) {
    toast.add({ severity: 'error', summary: 'Validasi Gagal', detail: 'Nama dan No WA wajib diisi', life: 3000 });
    return;
  }
  
  if (form.value.enableAccount && !form.value.username) {
    toast.add({ severity: 'error', summary: 'Validasi Gagal', detail: 'Username wajib diisi jika akun diaktifkan', life: 3000 });
    return;
  }

  const payload: any = {
    name: form.value.name,
    nip: form.value.nip,
    nuptk: form.value.nuptk,
    nik: form.value.nik,
    gender: form.value.gender,
    email: form.value.email,
    phone: form.value.phone,
    mainSubjectId: form.value.mainSubjectId,
    position: form.value.position,
    isActive: form.value.isActive,
  };

  if (form.value.enableAccount) {
    payload.userAccount = {
      username: form.value.username,
      roles: form.value.roles.length > 0 ? form.value.roles : [ROLES.GURU],
      isActive: true
    };
  }

  try {
    if (dialogMode.value === 'add') {
      await teacherStore.addTeacher(payload);
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Guru berhasil ditambahkan', life: 3000 });
    } else {
      await teacherStore.updateTeacher(form.value.id, payload);
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data guru diperbarui', life: 3000 });
    }
    dialogVisible.value = false;
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: error.message || 'Terjadi kesalahan', life: 3000 });
  }
};

const toggleStatus = async (data: any) => {
  confirm.require({
    message: `Apakah Anda yakin ingin ${data.isActive ? 'menonaktifkan' : 'mengaktifkan'} guru ini?`,
    header: 'Konfirmasi',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await teacherStore.updateTeacher(data.id, { isActive: !data.isActive });
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Status guru diperbarui', life: 3000 });
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memperbarui status', life: 3000 });
      }
    }
  });
};

const uploadPhotoInput = ref<HTMLInputElement | null>(null);
const selectedTeacherForPhoto = ref<any>(null);

const triggerUploadPhoto = (data: any) => {
  selectedTeacherForPhoto.value = data;
  uploadPhotoInput.value?.click();
};

const handlePhotoUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0 && selectedTeacherForPhoto.value) {
    const file = target.files[0];
    try {
      await teacherStore.uploadPhoto(selectedTeacherForPhoto.value.id, file);
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Foto guru berhasil diupload', life: 3000 });
      // Refresh list to show new photo
      teacherStore.fetchTeachers();
    } catch (err: any) {
      toast.add({ severity: 'error', summary: 'Gagal', detail: err.message || 'Gagal mengupload foto', life: 3000 });
    }
  }
};

// ========================
// Detail Modal
// ========================
const detailDialogVisible = ref(false);

const openDetailDialog = async (data: any) => {
  detailDialogVisible.value = true;
  try {
    await teacherStore.fetchTeacherById(data.id);
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message || 'Gagal memuat detail guru', life: 3000 });
    detailDialogVisible.value = false;
  }
};

const getInitials = (name: string) => {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
};

const formatGender = (gender: string) => {
  if (gender === 'L') return 'Laki-laki';
  if (gender === 'P') return 'Perempuan';
  return '-';
};

const getActionItems = (data: any) => [
  { label: 'Lihat Detail', icon: 'pi pi-eye', command: () => openDetailDialog(data) },
  { label: 'Upload Foto', icon: 'pi pi-camera', command: () => triggerUploadPhoto(data) },
  { label: 'Edit', icon: 'pi pi-pencil', command: () => openEditDialog(data) },
  { label: data.isActive ? 'Nonaktifkan' : 'Aktifkan', icon: data.isActive ? 'pi pi-times-circle' : 'pi pi-check-circle', command: () => toggleStatus(data) }
];

const importDialogVisible = ref(false);
const importFile = ref<File | null>(null);

const downloadTemplate = () => {
  import('..//../services/teacherService').then(m => m.teacherService.downloadImportTemplate());
};

const handleImportUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    importFile.value = target.files[0];
  }
};

const submitImport = async () => {
  if (!importFile.value) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Silakan pilih file Excel terlebih dahulu', life: 3000 });
    return;
  }

  try {
    const res = await teacherStore.importTeachers(importFile.value);
    const detailMsg = `Berhasil: ${res.data?.successCount || 0}, Gagal: ${res.data?.failedCount || 0}. \n${res.data?.errors?.join('\n') || ''}`;
    if (res.data?.failedCount > 0) {
      toast.add({ severity: 'warn', summary: 'Import Selesai dengan Beberapa Error', detail: detailMsg, life: 6000 });
    } else {
      toast.add({ severity: 'success', summary: 'Import Berhasil', detail: res.message, life: 3000 });
    }
    importDialogVisible.value = false;
    importFile.value = null;
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Import Gagal', detail: error.message || 'Terjadi kesalahan saat import', life: 5000 });
  }
};
</script>

<template>
  <div>
    <BasePageHeader 
      title="Data Guru" 
      subtitle="Kelola data profil, kompetensi, dan beban mengajar guru."
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <Button label="Import Excel" icon="pi pi-file-excel" severity="success" outlined @click="importDialogVisible = true" class="mr-2" />
        <Button label="Tambah Guru" icon="pi pi-plus" @click="openAddDialog" />
      </template>
    </BasePageHeader>

    <BaseErrorState 
      v-if="teacherStore.error" 
      title="Gagal Memuat Data" 
      :description="teacherStore.error" 
      @retry="teacherStore.fetchTeachers" 
    />

    <Card v-else class="border-none shadow-sm">
      <template #content>
        <BaseLoadingSkeleton v-if="teacherStore.loading && teacherStore.teachers.length === 0" type="table" />
        
        <div v-else>
          <BaseToolbarFilter v-model:searchValue="searchQuery" searchPlaceholder="Cari nama atau NIP...">
            <template #filters>
              <Select v-model="selectedSubject" :options="subjectOptions" optionLabel="label" optionValue="value" placeholder="Semua Mapel" showClear class="w-full md:w-48" />
              <Select v-model="selectedRole" :options="roleOptions" optionLabel="label" optionValue="value" placeholder="Semua Role" showClear class="w-full md:w-48" />
            </template>
          </BaseToolbarFilter>

          <DataTable 
            :value="filteredTeachers" 
            :paginator="true" 
            :rows="10" 
            dataKey="id" 
            responsiveLayout="scroll"
            :loading="teacherStore.loading"
          >
            <template #empty>
              <BaseEmptyState 
                title="Tidak ada data guru" 
                description="Belum ada data guru yang ditambahkan atau tidak ada yang sesuai kriteria." 
                icon="pi pi-users"
              />
            </template>

            <Column header="Guru" sortable sortField="name">
              <template #body="{ data }">
                <BaseAvatarName :name="data.name" :subtitle="data.nip" :image-url="data.photo" />
              </template>
            </Column>
            <Column field="mainSubjectId" header="Mapel Utama">
              <template #body="{ data }">
                <span class="text-slate-600">{{ getSubjectName(data.mainSubjectId) }}</span>
              </template>
            </Column>
            <Column field="position" header="Jabatan" sortable>
              <template #body="{ data }">
                <span class="text-slate-700 font-medium">{{ data.position }}</span>
              </template>
            </Column>
            <Column header="Role">
              <template #body="{ data }">
                <div class="flex gap-1 flex-wrap" v-if="data.userAccount?.roles?.length">
                  <Tag v-for="role in data.userAccount.roles" :key="role" :value="role" severity="info" rounded class="!text-[10px]" />
                </div>
                <span v-else class="text-slate-400 text-xs italic">Tidak ada akun</span>
              </template>
            </Column>
            <Column field="phone" header="No WA">
              <template #body="{ data }">
                <span class="text-slate-600 text-sm">{{ data.phone || '-' }}</span>
              </template>
            </Column>
            <Column field="isActive" header="Status" sortable>
              <template #body="{ data }">
                <BaseStatusTag :status="data.isActive ? 'Aktif' : 'Tidak Aktif'" />
              </template>
            </Column>
            <Column header="Aksi" :exportable="false" style="min-width:4rem">
              <template #body="{ data }">
                <BaseActionMenu :items="getActionItems(data)" />
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </Card>

    <Dialog v-model:visible="dialogVisible" :style="{width: '800px'}" :header="dialogMode === 'add' ? 'Tambah Guru' : 'Edit Guru'" :modal="true" class="p-fluid">
      <div class="pt-2">
        <BaseFormSection title="1. Informasi Pribadi" description="Data utama profil guru.">
          <div class="flex flex-col gap-1 col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-slate-700">Nama Lengkap & Gelar <span class="text-red-500">*</span></label>
            <InputText class="w-full" v-model.trim="form.name" required autofocus :class="{'p-invalid': submitted && !form.name}" />
            <small class="text-red-500" v-if="submitted && !form.name">Nama wajib diisi.</small>
          </div>
          <div class="flex flex-col gap-1 col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-slate-700">NIP</label>
            <InputText class="w-full" v-model.trim="form.nip" />
          </div>
          <div class="flex flex-col gap-1 col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-slate-700">NUPTK</label>
            <InputText class="w-full" v-model.trim="form.nuptk" />
          </div>
          <div class="flex flex-col gap-1 col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-slate-700">NIK</label>
            <InputText class="w-full" v-model.trim="form.nik" />
          </div>
          <div class="flex flex-col gap-1 col-span-2">
            <label class="block text-sm font-medium text-slate-700">Jenis Kelamin</label>
            <Select class="w-full" v-model="form.gender" :options="genderOptions" optionLabel="label" optionValue="value" />
          </div>
        </BaseFormSection>

        <BaseFormSection title="2. Kontak" description="Informasi komunikasi guru.">
          <div class="flex flex-col gap-1 col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-slate-700">No. HP / WhatsApp <span class="text-red-500">*</span></label>
            <InputText class="w-full" v-model.trim="form.phone" :class="{'p-invalid': submitted && !form.phone}" />
            <small class="text-red-500" v-if="submitted && !form.phone">No WA wajib diisi.</small>
          </div>
          <div class="flex flex-col gap-1 col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-slate-700">Email</label>
            <InputText class="w-full" v-model.trim="form.email" type="email" />
          </div>
        </BaseFormSection>

        <BaseFormSection title="3. Kepegawaian" description="Tugas dan posisi struktural.">
          <div class="flex flex-col gap-1 col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-slate-700">Mata Pelajaran Utama</label>
            <Select class="w-full" v-model="form.mainSubjectId" :options="subjectOptions" optionLabel="label" optionValue="value" filter showClear />
          </div>
          <div class="flex flex-col gap-1 col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-slate-700">Jabatan / Tugas Tambahan</label>
            <InputText class="w-full" v-model.trim="form.position" />
          </div>
          <div class="flex flex-col gap-1 col-span-2 mt-2">
            <div class="flex items-center">
              <Checkbox id="isActiveGuru" v-model="form.isActive" :binary="true" />
              <label for="isActiveGuru" class="ml-2 text-sm text-slate-700 cursor-pointer">Guru Aktif Mengajar</label>
            </div>
          </div>
        </BaseFormSection>

        <BaseFormSection title="4. Akun & Hak Akses" description="Konfigurasi login ke dalam sistem.">
          <div class="flex flex-col gap-1 col-span-2 mb-2">
            <div class="flex items-center">
              <Checkbox id="enableAccount" v-model="form.enableAccount" :binary="true" />
              <label for="enableAccount" class="ml-2 font-medium text-slate-700 cursor-pointer">Aktifkan Akses Login</label>
            </div>
          </div>
          
          <template v-if="form.enableAccount">
            <div class="flex flex-col gap-1 col-span-2 md:col-span-1">
              <label class="block text-sm font-medium text-slate-700">Username <span class="text-red-500">*</span></label>
              <InputText class="w-full" v-model.trim="form.username" :class="{'p-invalid': submitted && form.enableAccount && !form.username}" :disabled="form.hasExistingAccount" />
              <small class="text-red-500" v-if="submitted && form.enableAccount && !form.username">Username wajib diisi.</small>
              <small class="text-blue-500 block mt-1" v-if="dialogMode === 'edit'">Username tidak dapat diubah setelah dibuat.</small>
            </div>
            <div class="flex flex-col gap-1 col-span-2 md:col-span-1">
              <label class="block text-sm font-medium text-slate-700">Password Dummy <span v-if="dialogMode==='add'" class="text-red-500">*</span></label>
              <InputText class="w-full" v-model="form.password" :disabled="dialogMode === 'edit'" placeholder="admin123" />
              <small class="text-blue-500 block mt-1" v-if="dialogMode === 'add'">Biarkan default untuk percobaan: admin123</small>
              <small class="text-slate-400 block mt-1" v-else>Reset password bisa dilakukan di menu Akun & Hak Akses.</small>
            </div>
            <div class="flex flex-col gap-1 col-span-2">
              <label class="block text-sm font-medium text-slate-700">Peran (Role) dalam Aplikasi</label>
              <MultiSelect v-model="form.roles" :options="roleOptions" optionLabel="label" optionValue="value" placeholder="Pilih Role" display="chip" class="w-full" />
              <small class="text-slate-500 block mt-1">Gunakan role "Penilai" jika guru bertugas mensupervisi rekan lain.</small>
            </div>
          </template>
        </BaseFormSection>
      </div>

      <template #footer>
        <div class="border-t border-slate-100 pt-4 mt-2">
          <Button label="Batal" icon="pi pi-times" text @click="dialogVisible = false" />
          <Button label="Simpan Data Guru" icon="pi pi-check" @click="saveTeacher" :loading="teacherStore.loading" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="importDialogVisible" :style="{width: '500px'}" header="Import Data Guru" :modal="true" class="p-fluid">
      <div class="pt-4 space-y-4">
        <div class="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-3">
          <i class="pi pi-info-circle text-xl mt-0.5"></i>
          <div class="text-sm">
            <p class="font-bold mb-1">Panduan Import:</p>
            <ul class="list-disc pl-4 space-y-1">
              <li>Pastikan format data sesuai dengan template yang disediakan.</li>
              <li>Kolom <strong>Nama Lengkap</strong> dan <strong>No WA</strong> wajib diisi.</li>
              <li>Jika kolom <strong>Username</strong> diisi, sistem akan otomatis membuatkan akun dengan password default: <code>admin123</code>.</li>
            </ul>
          </div>
        </div>
        
        <div class="flex justify-center my-4">
          <Button label="Unduh Template Excel" icon="pi pi-download" severity="secondary" outlined @click="downloadTemplate" />
        </div>

        <div class="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
          <input type="file" id="importFile" class="hidden" accept=".xlsx, .xls" @change="handleImportUpload" />
          <label for="importFile" class="cursor-pointer flex flex-col items-center gap-2">
            <i class="pi pi-cloud-upload text-3xl text-slate-400"></i>
            <span class="text-slate-700 font-medium">{{ importFile ? importFile.name : 'Pilih file Excel (.xlsx)' }}</span>
            <span class="text-xs text-slate-500">Maksimal ukuran file: 5MB</span>
          </label>
        </div>
      </div>
      <template #footer>
        <div class="border-t border-slate-100 pt-4 mt-2">
          <Button label="Batal" icon="pi pi-times" text @click="importDialogVisible = false" />
          <Button label="Mulai Import" icon="pi pi-check" @click="submitImport" :loading="teacherStore.loading" :disabled="!importFile" />
        </div>
      </template>
    </Dialog>

    <input type="file" ref="uploadPhotoInput" class="hidden" accept="image/jpeg, image/png, image/webp" @change="handlePhotoUpload" />

    <!-- Modal Detail Guru -->
    <Dialog 
      v-model:visible="detailDialogVisible" 
      :style="{width: '680px'}" 
      header="Detail Guru" 
      :modal="true"
      :closable="true"
      class="p-fluid"
    >
      <!-- Loading State -->
      <div v-if="teacherStore.detailLoading" class="pt-4 space-y-4">
        <div class="flex items-center gap-4">
          <Skeleton shape="circle" size="4rem" />
          <div class="flex-1 space-y-2">
            <Skeleton width="55%" height="1.1rem" />
            <Skeleton width="35%" height="0.9rem" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3 mt-4">
          <Skeleton v-for="i in 6" :key="i" height="2rem" />
        </div>
      </div>

      <!-- Content -->
      <div v-else-if="teacherStore.selectedTeacher" class="pt-2">

        <!-- Header: Avatar + Nama + Status -->
        <div class="flex items-center gap-4 pb-4 mb-4 border-b border-slate-200">
          <img 
            v-if="teacherStore.selectedTeacher.photo" 
            :src="teacherStore.selectedTeacher.photo" 
            :alt="teacherStore.selectedTeacher.name"
            class="w-14 h-14 rounded-full object-cover flex-shrink-0 border border-slate-200"
          />
          <div v-else class="teacher-detail-initials flex-shrink-0">
            {{ getInitials(teacherStore.selectedTeacher.name) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-base font-semibold text-slate-800 truncate">{{ teacherStore.selectedTeacher.name }}</p>
            <p class="text-sm text-slate-500">{{ teacherStore.selectedTeacher.position || 'Guru' }}</p>
            <div class="flex items-center gap-2 mt-1.5 flex-wrap">
              <BaseStatusTag :status="teacherStore.selectedTeacher.isActive ? 'Aktif' : 'Tidak Aktif'" />
              <Tag 
                v-for="role in teacherStore.selectedTeacher.userAccount?.roles" 
                :key="role" 
                :value="role" 
                severity="secondary" 
                rounded 
                class="!text-[10px]"
              />
            </div>
          </div>
        </div>

        <!-- Informasi Pribadi -->
        <div class="mb-4 pb-1 border-b border-slate-200">
          <h3 class="text-sm font-semibold text-slate-800 mb-3">Informasi Pribadi</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <div class="detail-row">
              <span class="detail-label">NIP</span>
              <span class="detail-value">{{ teacherStore.selectedTeacher.nip || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">NUPTK</span>
              <span class="detail-value">{{ teacherStore.selectedTeacher.nuptk || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">NIK</span>
              <span class="detail-value">{{ teacherStore.selectedTeacher.nik || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Jenis Kelamin</span>
              <span class="detail-value">{{ formatGender(teacherStore.selectedTeacher.gender) }}</span>
            </div>
          </div>
        </div>

        <!-- Kontak -->
        <div class="mb-4 pb-1 border-b border-slate-200">
          <h3 class="text-sm font-semibold text-slate-800 mb-3">Kontak</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <div class="detail-row">
              <span class="detail-label">No. WhatsApp</span>
              <span class="detail-value">
                <a 
                  v-if="teacherStore.selectedTeacher.phone" 
                  :href="'https://wa.me/' + teacherStore.selectedTeacher.phone?.replace(/[^0-9]/g, '')"
                  target="_blank"
                  class="detail-link"
                >{{ teacherStore.selectedTeacher.phone }}</a>
                <span v-else class="text-slate-400">-</span>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email</span>
              <span class="detail-value">
                <a 
                  v-if="teacherStore.selectedTeacher.email" 
                  :href="'mailto:' + teacherStore.selectedTeacher.email"
                  class="detail-link"
                >{{ teacherStore.selectedTeacher.email }}</a>
                <span v-else class="text-slate-400">-</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Kepegawaian -->
        <div :class="teacherStore.selectedTeacher.userAccount ? 'mb-4 pb-1 border-b border-slate-200' : 'mb-2'">
          <h3 class="text-sm font-semibold text-slate-800 mb-3">Kepegawaian</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <div class="detail-row">
              <span class="detail-label">Mata Pelajaran Utama</span>
              <span class="detail-value">{{ teacherStore.selectedTeacher.mainSubjectName || getSubjectName(teacherStore.selectedTeacher.mainSubjectId || '') || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Jabatan</span>
              <span class="detail-value">{{ teacherStore.selectedTeacher.position || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Akun & Hak Akses -->
        <template v-if="teacherStore.selectedTeacher.userAccount">
          <div class="mb-2">
            <h3 class="text-sm font-semibold text-slate-800 mb-3">Akun &amp; Hak Akses</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <div class="detail-row">
                <span class="detail-label">Username</span>
                <span class="detail-value font-mono text-sm">{{ teacherStore.selectedTeacher.userAccount.username }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Role</span>
                <div class="flex gap-1 flex-wrap">
                  <Tag 
                    v-for="role in teacherStore.selectedTeacher.userAccount.roles" 
                    :key="role" 
                    :value="role" 
                    severity="secondary" 
                    rounded 
                    class="!text-[10px]"
                  />
                </div>
              </div>
              <div class="detail-row" v-if="teacherStore.selectedTeacher.userAccount.lastLoginAt">
                <span class="detail-label">Login Terakhir</span>
                <span class="detail-value">{{ new Date(teacherStore.selectedTeacher.userAccount.lastLoginAt as string).toLocaleString('id-ID') }}</span>
              </div>
            </div>
          </div>
        </template>

      </div>

      <template #footer>
        <div class="border-t border-slate-100 pt-4 mt-2">
          <Button label="Batal" icon="pi pi-times" text @click="detailDialogVisible = false" />
          <Button 
            label="Edit Data" 
            icon="pi pi-pencil" 
            @click="() => { detailDialogVisible = false; openEditDialog(teacherStore.selectedTeacher); }"
            v-if="teacherStore.selectedTeacher"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.teacher-detail-initials {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 600;
  flex-shrink: 0;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.35rem 0;
}

.detail-label {
  font-size: 0.72rem;
  font-weight: 500;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.detail-value {
  font-size: 0.875rem;
  color: #334155;
}

.detail-link {
  color: #334155;
  text-decoration: none;
}

.detail-link:hover {
  text-decoration: underline;
  color: #1e293b;
}
</style>
