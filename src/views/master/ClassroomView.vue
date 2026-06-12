<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useClassroomStore } from '../../stores/classroomStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';

import BasePageHeader from '../../components/common/BasePageHeader.vue';
import BaseToolbarFilter from '../../components/common/BaseToolbarFilter.vue';
import BaseStatusTag from '../../components/common/BaseStatusTag.vue';
import BaseActionMenu from '../../components/common/BaseActionMenu.vue';
import BaseLoadingSkeleton from '../../components/common/BaseLoadingSkeleton.vue';
import BaseEmptyState from '../../components/common/BaseEmptyState.vue';
import BaseErrorState from '../../components/common/BaseErrorState.vue';

const classroomStore = useClassroomStore();
const teacherStore = useTeacherStore();
const toast = useToast();
const confirm = useConfirm();

const breadcrumbs = ref([
  { label: 'E-Supervisi', to: '/' },
  { label: 'Master Data' },
  { label: 'Kelas / Rombel' }
]);

const searchQuery = ref('');
const selectedGrade = ref<string | null>(null);
const selectedMajor = ref<string | null>(null);
const dialogVisible = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const submitted = ref(false);

const gradeOptions = [
  { label: 'Tingkat X', value: 'X' },
  { label: 'Tingkat XI', value: 'XI' },
  { label: 'Tingkat XII', value: 'XII' }
];

const majorOptions = [
  { label: 'TKJ', value: 'TKJ' },
  { label: 'RPL', value: 'RPL' },
  { label: 'TKR', value: 'TKR' },
  { label: 'DKV', value: 'DKV' },
  { label: 'Kuliner', value: 'Kuliner' },
  { label: 'Bisnis Digital', value: 'Bisnis Digital' }
];

const form = ref({
  id: '',
  name: '',
  grade: 'X',
  major: 'TKJ',
  homeroomTeacherId: '',
  isActive: true
});

onMounted(() => {
  classroomStore.fetchClassrooms();
  teacherStore.fetchTeachers(); // Fetch teachers for homeroom dropdown
});

const teacherOptions = computed(() => {
  return teacherStore.teachers.map(t => ({ label: t.name, value: t.id }));
});

const filteredClassrooms = computed(() => {
  if (!classroomStore.classrooms) return [];
  let result = classroomStore.classrooms;
  
  if (selectedGrade.value) result = result.filter(c => c.grade === selectedGrade.value);
  if (selectedMajor.value) result = result.filter(c => c.major === selectedMajor.value);
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(c => c.name.toLowerCase().includes(q));
  }
  
  return result;
});

const getTeacherName = (id: string) => {
  return teacherStore.teachers.find(t => t.id === id)?.name || '-';
};

const openAddDialog = () => {
  form.value = { id: '', name: '', grade: 'X', major: 'TKJ', homeroomTeacherId: '', isActive: true };
  dialogMode.value = 'add';
  submitted.value = false;
  dialogVisible.value = true;
};

const openEditDialog = (data: any) => {
  form.value = { ...data };
  dialogMode.value = 'edit';
  submitted.value = false;
  dialogVisible.value = true;
};

const saveClassroom = async () => {
  submitted.value = true;
  
  if (!form.value.name || !form.value.grade || !form.value.major) {
    toast.add({ severity: 'error', summary: 'Validasi Gagal', detail: 'Harap isi semua field wajib', life: 3000 });
    return;
  }

  const payload = { ...form.value };

  try {
    if (dialogMode.value === 'add') {
      await classroomStore.addClassroom(payload);
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Kelas berhasil ditambahkan', life: 3000 });
    } else {
      await classroomStore.updateClassroom(form.value.id, payload);
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Kelas berhasil diperbarui', life: 3000 });
    }
    dialogVisible.value = false;
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: error.message || 'Terjadi kesalahan', life: 3000 });
  }
};

const toggleStatus = async (data: any) => {
  confirm.require({
    message: `Apakah Anda yakin ingin ${data.isActive ? 'menonaktifkan' : 'mengaktifkan'} kelas ini?`,
    header: 'Konfirmasi',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await classroomStore.updateClassroom(data.id, { isActive: !data.isActive });
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Status diperbarui', life: 3000 });
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memperbarui status', life: 3000 });
      }
    }
  });
};

const getActionItems = (data: any) => [
  { label: 'Edit', icon: 'pi pi-pencil', command: () => openEditDialog(data) },
  { label: data.isActive ? 'Nonaktifkan' : 'Aktifkan', icon: data.isActive ? 'pi pi-times-circle' : 'pi pi-check-circle', command: () => toggleStatus(data) }
];
</script>

<template>
  <div>
    <BasePageHeader 
      title="Kelas / Rombel" 
      subtitle="Kelola data kelas dan wali kelas."
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <Button label="Tambah Kelas" icon="pi pi-plus" @click="openAddDialog" />
      </template>
    </BasePageHeader>

    <BaseErrorState 
      v-if="classroomStore.error" 
      title="Gagal Memuat Data" 
      :description="classroomStore.error" 
      @retry="classroomStore.fetchClassrooms" 
    />

    <Card v-else class="border-none shadow-sm">
      <template #content>
        <BaseLoadingSkeleton v-if="classroomStore.loading && classroomStore.classrooms.length === 0" type="table" />
        
        <div v-else>
          <BaseToolbarFilter v-model:searchValue="searchQuery" searchPlaceholder="Cari nama kelas...">
            <template #filters>
              <Select v-model="selectedGrade" :options="gradeOptions" optionLabel="label" optionValue="value" placeholder="Semua Tingkat" showClear class="w-full md:w-40" />
              <Select v-model="selectedMajor" :options="majorOptions" optionLabel="label" optionValue="value" placeholder="Semua Jurusan" showClear class="w-full md:w-48" />
            </template>
          </BaseToolbarFilter>

          <DataTable 
            :value="filteredClassrooms" 
            :paginator="true" 
            :rows="10" 
            dataKey="id" 
            responsiveLayout="scroll"
            :loading="classroomStore.loading"
          >
            <template #empty>
              <BaseEmptyState 
                title="Tidak ada data kelas" 
                description="Belum ada data kelas yang sesuai dengan kriteria." 
                icon="pi pi-users"
              />
            </template>

            <Column field="name" header="Nama Kelas" sortable>
              <template #body="{ data }">
                <span class="font-bold text-slate-800">{{ data.name }}</span>
              </template>
            </Column>
            <Column field="grade" header="Tingkat" sortable />
            <Column field="major" header="Jurusan" sortable />
            <Column field="homeroomTeacherId" header="Wali Kelas" sortable>
              <template #body="{ data }">
                <span class="text-slate-600">{{ getTeacherName(data.homeroomTeacherId) }}</span>
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

    <Dialog v-model:visible="dialogVisible" :style="{width: '450px'}" :header="dialogMode === 'add' ? 'Tambah Kelas' : 'Edit Kelas'" :modal="true" class="p-fluid">
      <div class="space-y-4 pt-2">
        <div class="flex flex-col gap-1">
          <label for="name" class="block text-sm font-medium text-slate-700">Nama Kelas <span class="text-red-500">*</span></label>
          <InputText id="name" v-model.trim="form.name" required autofocus :class="[{'p-invalid': submitted && !form.name}, 'w-full']" placeholder="Contoh: X TKJ 1" />
          <small class="text-red-500" v-if="submitted && !form.name">Nama kelas wajib diisi.</small>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label for="grade" class="block text-sm font-medium text-slate-700">Tingkat <span class="text-red-500">*</span></label>
            <Select id="grade" v-model="form.grade" :options="gradeOptions" optionLabel="label" optionValue="value" :class="[{'p-invalid': submitted && !form.grade}, 'w-full']" />
          </div>
          <div class="flex flex-col gap-1">
            <label for="major" class="block text-sm font-medium text-slate-700">Jurusan <span class="text-red-500">*</span></label>
            <Select id="major" v-model="form.major" :options="majorOptions" optionLabel="label" optionValue="value" :class="[{'p-invalid': submitted && !form.major}, 'w-full']" />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label for="homeroom" class="block text-sm font-medium text-slate-700">Wali Kelas</label>
          <Select id="homeroom" v-model="form.homeroomTeacherId" :options="teacherOptions" optionLabel="label" optionValue="value" placeholder="Pilih Wali Kelas" showClear filter class="w-full" />
        </div>

        <div class="field flex items-center mt-4">
          <Checkbox id="isActive" v-model="form.isActive" :binary="true" />
          <label for="isActive" class="ml-2 text-sm text-slate-700 cursor-pointer">Aktif</label>
        </div>
      </div>

      <template #footer>
        <Button label="Batal" icon="pi pi-times" text @click="dialogVisible = false" />
        <Button label="Simpan" icon="pi pi-check" @click="saveClassroom" :loading="classroomStore.loading" />
      </template>
    </Dialog>
  </div>
</template>
