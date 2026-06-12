<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTeacherStore } from '../../stores/teacherStore';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { ROLES } from '../../constants/roles';

import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import MultiSelect from 'primevue/multiselect';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';

import BasePageHeader from '../../components/common/BasePageHeader.vue';
import BaseToolbarFilter from '../../components/common/BaseToolbarFilter.vue';
import BaseStatusTag from '../../components/common/BaseStatusTag.vue';
import BaseActionMenu from '../../components/common/BaseActionMenu.vue';
import BaseLoadingSkeleton from '../../components/common/BaseLoadingSkeleton.vue';
import BaseEmptyState from '../../components/common/BaseEmptyState.vue';
import BaseErrorState from '../../components/common/BaseErrorState.vue';
import BaseAvatarName from '../../components/common/BaseAvatarName.vue';
import RolePermissionMatrix from '../../components/settings/RolePermissionMatrix.vue';

const teacherStore = useTeacherStore();
const toast = useToast();
const confirm = useConfirm();

const breadcrumbs = ref([
  { label: 'E-Supervisi', to: '/' },
  { label: 'Pengaturan' },
  { label: 'Akun & Hak Akses' }
]);

const searchQuery = ref('');
const selectedRole = ref<string | null>(null);

const dialogVisible = ref(false);
const dialogMode = ref<'add' | 'edit'>('edit');
const submitted = ref(false);

const roleOptions = [
  { label: 'Admin', value: ROLES.ADMIN },
  { label: 'Kurikulum', value: ROLES.KURIKULUM },
  { label: 'Penilai', value: ROLES.PENILAI },
  { label: 'Guru', value: ROLES.GURU }
];

const form = ref<any>({
  id: '',
  name: '',
  userAccount: {
    username: '',
    roles: [],
    isActive: true
  }
});

onMounted(() => {
  teacherStore.fetchTeachers();
});

const accountList = computed(() => {
  if (!teacherStore.teachers) return [];
  // Hanya ambil guru yang punya akun
  let result = teacherStore.teachers.filter(t => !!t.userAccount);
  
  if (selectedRole.value) {
    result = result.filter(t => t.userAccount?.roles.includes(selectedRole.value as any));
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.userAccount?.username.toLowerCase().includes(q)
    );
  }
  
  return result;
});

const teachersWithoutAccount = computed(() => {
  if (!teacherStore.teachers) return [];
  return teacherStore.teachers.filter(t => !t.userAccount);
});

const openAddAccountDialog = () => {
  form.value = {
    id: '',
    name: '',
    userAccount: {
      username: '',
      roles: [ROLES.GURU],
      isActive: true
    }
  };
  dialogMode.value = 'add';
  submitted.value = false;
  dialogVisible.value = true;
};

const openEditRoleDialog = (data: any) => {
  form.value = { 
    id: data.id, 
    name: data.name,
    userAccount: { ...data.userAccount }
  };
  dialogMode.value = 'edit';
  submitted.value = false;
  dialogVisible.value = true;
};

const saveAccount = async () => {
  submitted.value = true;
  
  if (dialogMode.value === 'add') {
    if (!form.value.id) {
      toast.add({ severity: 'error', summary: 'Validasi Gagal', detail: 'Pilih guru terlebih dahulu', life: 3000 });
      return;
    }
    if (!form.value.userAccount.username) {
      toast.add({ severity: 'error', summary: 'Validasi Gagal', detail: 'Username wajib diisi', life: 3000 });
      return;
    }
  }

  if (!form.value.userAccount.roles.length) {
    toast.add({ severity: 'error', summary: 'Validasi Gagal', detail: 'User minimal harus memiliki 1 role', life: 3000 });
    return;
  }

  try {
    await teacherStore.updateTeacher(form.value.id, { userAccount: form.value.userAccount } as any);
    toast.add({ severity: 'success', summary: 'Berhasil', detail: dialogMode.value === 'add' ? 'Akun berhasil dibuat' : 'Hak akses diperbarui', life: 3000 });
    dialogVisible.value = false;
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: error.message || 'Terjadi kesalahan', life: 3000 });
  }
};

const toggleAccountStatus = async (data: any) => {
  const currentStatus = data.userAccount.isActive;
  confirm.require({
    message: `Apakah Anda yakin ingin ${currentStatus ? 'menonaktifkan' : 'mengaktifkan'} akun milik ${data.name}?`,
    header: 'Konfirmasi',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        const payload = {
          userAccount: { ...data.userAccount, isActive: !currentStatus }
        };
        await teacherStore.updateTeacher(data.id, payload as any);
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Status akun diperbarui', life: 3000 });
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memperbarui status', life: 3000 });
      }
    }
  });
};

const resetPassword = (data: any) => {
  confirm.require({
    message: `Reset password akun ${data.userAccount.username} ke default (admin123)?`,
    header: 'Reset Password',
    icon: 'pi pi-key',
    accept: () => {
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Password berhasil direset (dummy)', life: 3000 });
    }
  });
};

const getActionItems = (data: any) => [
  { label: 'Edit Role', icon: 'pi pi-users', command: () => openEditRoleDialog(data) },
  { label: 'Reset Password', icon: 'pi pi-key', command: () => resetPassword(data) },
  { label: data.userAccount.isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun', icon: data.userAccount.isActive ? 'pi pi-lock' : 'pi pi-unlock', command: () => toggleAccountStatus(data) }
];
</script>

<template>
  <div>
    <BasePageHeader 
      title="Akun & Hak Akses" 
      subtitle="Kelola username, password default, dan role akses setiap pengguna."
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <Button label="Tambah Akun" icon="pi pi-plus" @click="openAddAccountDialog" />
      </template>
    </BasePageHeader>

    <BaseErrorState 
      v-if="teacherStore.error" 
      title="Gagal Memuat Data" 
      :description="teacherStore.error" 
      @retry="teacherStore.fetchTeachers" 
    />

    <div v-else class="space-y-6">
      <RolePermissionMatrix />

      <Card class="border-none shadow-sm">
        <template #content>
        <BaseLoadingSkeleton v-if="teacherStore.loading && teacherStore.teachers.length === 0" type="table" />
        
        <div v-else>
          <BaseToolbarFilter v-model:searchValue="searchQuery" searchPlaceholder="Cari nama atau username...">
            <template #filters>
              <Select v-model="selectedRole" :options="roleOptions" optionLabel="label" optionValue="value" placeholder="Semua Role" showClear class="w-full md:w-48" />
            </template>
          </BaseToolbarFilter>

          <DataTable 
            :value="accountList" 
            :paginator="true" 
            :rows="10" 
            dataKey="id" 
            responsiveLayout="scroll"
            :loading="teacherStore.loading"
          >
            <template #empty>
              <BaseEmptyState 
                title="Tidak ada akun" 
                description="Tidak ada data akun yang sesuai dengan pencarian Anda." 
                icon="pi pi-shield"
              />
            </template>

            <Column header="Nama Guru" sortable sortField="name">
              <template #body="{ data }">
                <BaseAvatarName :name="data.name" :subtitle="data.nip" :image-url="data.photo" />
              </template>
            </Column>
            <Column field="userAccount.username" header="Username" sortable>
              <template #body="{ data }">
                <span class="font-medium text-slate-800">{{ data.userAccount.username }}</span>
              </template>
            </Column>
            <Column header="Role Akses">
              <template #body="{ data }">
                <div class="flex gap-1 flex-wrap">
                  <Tag v-for="role in data.userAccount.roles" :key="role" :value="role" severity="info" rounded />
                </div>
              </template>
            </Column>
            <Column field="userAccount.isActive" header="Status Akun">
              <template #body="{ data }">
                <BaseStatusTag :status="data.userAccount.isActive ? 'Aktif' : 'Tidak Aktif'" />
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
    </div>

    <Dialog v-model:visible="dialogVisible" :style="{width: '450px'}" :header="dialogMode === 'add' ? 'Tambah Akun' : 'Edit Hak Akses'" :modal="true" class="p-fluid">
      <div class="space-y-4 pt-2">
        <div v-if="dialogMode === 'edit'" class="p-4 bg-slate-50 rounded-lg mb-4">
          <div class="text-sm text-slate-500">Pengguna</div>
          <div class="font-semibold text-slate-800">{{ form.name }} ({{ form.userAccount.username }})</div>
        </div>

        <div v-if="dialogMode === 'add'" class="flex flex-col gap-1">
          <label class="block text-sm font-medium text-slate-700">Pilih Guru <span class="text-red-500">*</span></label>
          <Select v-model="form.id" :options="teachersWithoutAccount" optionLabel="name" optionValue="id" placeholder="Pilih Guru yang Belum Punya Akun" filter :class="{'p-invalid': submitted && !form.id}" />
          <small class="text-red-500" v-if="submitted && !form.id">Silakan pilih guru.</small>
        </div>

        <div v-if="dialogMode === 'add'" class="flex flex-col gap-1">
          <label class="block text-sm font-medium text-slate-700">Username <span class="text-red-500">*</span></label>
          <InputText v-model.trim="form.userAccount.username" placeholder="Masukkan username unik" :class="{'p-invalid': submitted && !form.userAccount.username}" />
          <small class="text-red-500" v-if="submitted && !form.userAccount.username">Username wajib diisi.</small>
        </div>

        <div class="flex flex-col gap-1">
          <label class="block text-sm font-medium text-slate-700">Peran (Role) <span class="text-red-500">*</span></label>
          <MultiSelect v-model="form.userAccount.roles" :options="roleOptions" optionLabel="label" optionValue="value" placeholder="Pilih Role" display="chip" :class="{'p-invalid': submitted && !form.userAccount.roles.length}" />
          <small class="text-red-500" v-if="submitted && !form.userAccount.roles.length">Minimal harus memilih 1 role.</small>
        </div>

        <div v-if="dialogMode === 'add'" class="p-3 bg-blue-50 text-blue-800 text-sm rounded mt-2 flex items-start gap-2">
          <i class="pi pi-info-circle mt-0.5"></i>
          <span>Password default untuk akun baru adalah <strong>admin123</strong>.</span>
        </div>

        <div v-if="dialogMode === 'edit'" class="flex flex-col gap-1 flex items-center mt-4">
          <Checkbox id="accountActive" v-model="form.userAccount.isActive" :binary="true" />
          <label for="accountActive" class="ml-2 text-sm text-slate-700 cursor-pointer">Akun Aktif</label>
        </div>
      </div>

      <template #footer>
        <Button label="Batal" icon="pi pi-times" text @click="dialogVisible = false" />
        <Button :label="dialogMode === 'add' ? 'Simpan' : 'Simpan Perubahan'" icon="pi pi-check" @click="saveAccount" :loading="teacherStore.loading" />
      </template>
    </Dialog>
  </div>
</template>
