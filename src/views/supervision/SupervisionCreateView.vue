<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSupervisionStore } from '../../stores/supervisionStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useInstrumentStore } from '../../stores/instrumentStore';
import { usePeriodStore } from '../../stores/periodStore';
import { useSubjectStore } from '../../stores/subjectStore';
import { useClassroomStore } from '../../stores/classroomStore';
import { useAuthStore } from '../../stores/authStore';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import RadioButton from 'primevue/radiobutton';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const supervisionStore = useSupervisionStore();
const teacherStore = useTeacherStore();
const instrumentStore = useInstrumentStore();
const periodStore = usePeriodStore();
const subjectStore = useSubjectStore();
const classroomStore = useClassroomStore();

const breadcrumbs = ref([
  { label: 'E-Supervisi', to: '/' },
  { label: 'Supervisi', to: '/supervisi' },
  { label: 'Mulai Supervisi' }
]);

const loading = ref(false);
const activeStep = ref(0);

const formData = ref({
  supervisionType: 'LANGSUNG',
  periodId: '',
  teacherId: '',
  supervisorId: '1', // default based on dummy auth
  instrumentIds: [] as string[],
  subjectId: '',
  classroomId: '',
  date: new Date(),
  time: new Date(),
  location: '',
  initialNote: ''
});

onMounted(async () => {
  await Promise.all([
    teacherStore.fetchTeachers(),
    instrumentStore.fetchInstruments(),
    periodStore.fetchPeriods(),
    subjectStore.fetchSubjects(),
    classroomStore.fetchClassrooms()
  ]);
  
  const activePeriod = periodStore.periods.find(p => p.isActive);
  if (activePeriod) {
    formData.value.periodId = activePeriod.id;
  }
  
  if (authStore.user?.username === 'kurikulum' || authStore.user?.username === 'penilai') {
    // In real app, we'd find the teacherId that matches the auth user.
    // Here we hardcode to Rendy (1) for dummy
    formData.value.supervisorId = '1';
  }
});


const isStep2Valid = computed(() => {
  const d = formData.value;
  let valid = !!d.periodId && !!d.teacherId && !!d.supervisorId && (d.instrumentIds?.length > 0) && !!d.date;
  if (d.supervisionType === 'TERJADWAL') {
    valid = valid && !!d.time;
  }
  return valid;
});

const getTeacherName = (id: string) => teacherStore.teachers.find(t => t.id === id)?.name || '-';
const getInstrumentNames = (ids: string[]) => {
  if (!ids || ids.length === 0) return '-';
  return ids.map(id => instrumentStore.instruments.find(i => i.id === id)?.name || '-').join(', ');
};
const getPeriodName = (id: string) => periodStore.periods.find(p => p.id === id)?.name || '-';
const getSubjectName = (id: string) => subjectStore.subjects.find(s => s.id === id)?.name || '-';
const getClassroomName = (id: string) => classroomStore.classrooms.find(c => c.id === id)?.name || '-';

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

const formatTime = (date: Date) => {
  return date.toTimeString().split(' ')[0].substring(0, 5);
};

const submitForm = async () => {
  if (!isStep2Valid.value) return;
  
  loading.value = true;
  try {
    const payload: any = {
      supervisionType: formData.value.supervisionType,
      periodId: formData.value.periodId,
      teacherId: formData.value.teacherId,
      supervisorId: formData.value.supervisorId,
      instrumentIds: formData.value.instrumentIds,
      subjectId: formData.value.subjectId,
      classroomId: formData.value.classroomId,
      location: formData.value.location,
      initialNote: formData.value.initialNote,
    };
    
    if (payload.supervisionType === 'LANGSUNG') {
      payload.status = 'DRAFT';
      payload.supervisionDate = formatDate(formData.value.date);
    } else {
      payload.status = 'TERJADWAL';
      payload.scheduledDate = formatDate(formData.value.date);
      payload.scheduledTime = formatTime(formData.value.time);
    }

    const newSupervision = await supervisionStore.createSupervision(payload);
    if (!newSupervision) throw new Error('Gagal membuat supervisi (tidak ada data yang dikembalikan)');
    
    if (payload.supervisionType === 'LANGSUNG') {
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Supervisi dimulai, mengarahkan ke form penilaian...', life: 2000 });
      setTimeout(() => {
        router.push(`/supervisi/${newSupervision.id}/input`);
      }, 1000);
    } else {
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Jadwal supervisi berhasil dibuat.', life: 2000 });
      setTimeout(() => {
        router.push('/supervisi');
      }, 1000);
    }
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message || 'Gagal membuat supervisi', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const nextStep = () => {
  if (activeStep.value < 2) activeStep.value++;
};

const prevStep = () => {
  if (activeStep.value > 0) activeStep.value--;
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <BasePageHeader 
      title="Mulai Supervisi" 
      subtitle="Pilih mode dan isi informasi supervisi."
      :breadcrumbs="breadcrumbs"
    />

    <Card class="border-none shadow-sm">
      <template #content>
        <!-- Custom Stepper Header -->
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center flex-1">
            <div class="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm" :class="activeStep >= 0 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'">1</div>
            <div class="ml-2 font-semibold" :class="activeStep >= 0 ? 'text-primary' : 'text-gray-500'">Pilih Mode</div>
            <div class="flex-1 h-1 mx-4 rounded" :class="activeStep >= 1 ? 'bg-primary' : 'bg-gray-200'"></div>
          </div>
          <div class="flex items-center flex-1">
            <div class="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm" :class="activeStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'">2</div>
            <div class="ml-2 font-semibold" :class="activeStep >= 1 ? 'text-primary' : 'text-gray-500'">Informasi Supervisi</div>
            <div class="flex-1 h-1 mx-4 rounded" :class="activeStep >= 2 ? 'bg-primary' : 'bg-gray-200'"></div>
          </div>
          <div class="flex items-center">
            <div class="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm" :class="activeStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'">3</div>
            <div class="ml-2 font-semibold" :class="activeStep >= 2 ? 'text-primary' : 'text-gray-500'">Ringkasan</div>
          </div>
        </div>

        <!-- Step 1: Pilih Mode -->
        <div v-if="activeStep === 0" class="flex flex-col gap-6 py-4 animate-fadein">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              class="border-2 rounded-lg p-6 cursor-pointer transition-all duration-200"
              :class="formData.supervisionType === 'LANGSUNG' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-blue-300'"
              @click="formData.supervisionType = 'LANGSUNG'"
            >
              <div class="flex items-center gap-3 mb-2">
                <RadioButton v-model="formData.supervisionType" inputId="mode1" value="LANGSUNG" />
                <label for="mode1" class="font-bold text-lg cursor-pointer">Supervisi Langsung</label>
              </div>
              <p class="text-gray-600 ml-8">Lakukan supervisi dan input nilai sekarang juga. Status awal akan menjadi Draft.</p>
            </div>
            
            <div 
              class="border-2 rounded-lg p-6 cursor-pointer transition-all duration-200"
              :class="formData.supervisionType === 'TERJADWAL' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-blue-300'"
              @click="formData.supervisionType = 'TERJADWAL'"
            >
              <div class="flex items-center gap-3 mb-2">
                <RadioButton v-model="formData.supervisionType" inputId="mode2" value="TERJADWAL" />
                <label for="mode2" class="font-bold text-lg cursor-pointer">Supervisi Terjadwal</label>
              </div>
              <p class="text-gray-600 ml-8">Buat jadwal supervisi terlebih dahulu. Penilaian akan dilakukan nanti pada waktu yang ditentukan.</p>
            </div>
          </div>
          
          <div class="flex justify-end mt-4">
            <Button label="Lanjut" icon="pi pi-arrow-right" iconPos="right" @click="nextStep" />
          </div>
        </div>

        <!-- Step 2: Informasi Supervisi -->
        <div v-if="activeStep === 1" class="flex flex-col gap-4 py-4 animate-fadein">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-medium">Periode <span class="text-red-500">*</span></label>
              <Dropdown v-model="formData.periodId" :options="periodStore.periods" optionLabel="name" optionValue="id" placeholder="Pilih Periode" />
            </div>
            <div class="flex flex-col gap-2 md:col-span-2">
              <label class="font-medium">Instrumen <span class="text-red-500">*</span></label>
              <div class="flex flex-col gap-2 p-3 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                <div v-for="instrument in instrumentStore.activeInstruments" :key="instrument.id" class="flex items-center gap-2">
                  <Checkbox v-model="formData.instrumentIds" :inputId="'inst-' + instrument.id" :value="instrument.id" />
                  <label :for="'inst-' + instrument.id" class="cursor-pointer">{{ instrument.name }}</label>
                </div>
                <div v-if="instrumentStore.activeInstruments.length === 0" class="text-sm text-gray-500 italic">Tidak ada instrumen aktif.</div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-medium">Guru yang Dinilai <span class="text-red-500">*</span></label>
              <Dropdown v-model="formData.teacherId" :options="teacherStore.teachers" optionLabel="name" optionValue="id" placeholder="Pilih Guru" filter />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium">Penilai <span class="text-red-500">*</span></label>
              <Dropdown v-model="formData.supervisorId" :options="teacherStore.teachers" optionLabel="name" optionValue="id" placeholder="Pilih Penilai" filter />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-medium">Mata Pelajaran</label>
              <Dropdown v-model="formData.subjectId" :options="subjectStore.subjects" optionLabel="name" optionValue="id" placeholder="Pilih Mata Pelajaran" filter showClear />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium">Kelas / Rombel</label>
              <Dropdown v-model="formData.classroomId" :options="classroomStore.classrooms" optionLabel="name" optionValue="id" placeholder="Pilih Kelas" filter showClear />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-medium">Tanggal <span class="text-red-500">*</span></label>
              <Calendar v-model="formData.date" dateFormat="dd/mm/yy" :showIcon="true" />
            </div>
            <div class="flex flex-col gap-2" v-if="formData.supervisionType === 'TERJADWAL'">
              <label class="font-medium">Jam <span class="text-red-500">*</span></label>
              <Calendar v-model="formData.time" timeOnly />
            </div>
          </div>
          
          <div class="grid grid-cols-1 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-medium">Lokasi</label>
              <InputText v-model="formData.location" placeholder="Contoh: Ruang Kelas X TKJ 1, Lab Komputer" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium">Catatan Awal</label>
              <Textarea v-model="formData.initialNote" rows="3" placeholder="Catatan tambahan sebelum supervisi" />
            </div>
          </div>

          <div class="flex justify-between mt-4">
            <Button label="Kembali" severity="secondary" icon="pi pi-arrow-left" @click="prevStep" />
            <Button label="Lanjut" icon="pi pi-arrow-right" iconPos="right" @click="nextStep" :disabled="!isStep2Valid" />
          </div>
        </div>

        <!-- Step 3: Ringkasan -->
        <div v-if="activeStep === 2" class="flex flex-col gap-4 py-4 animate-fadein">
          <div class="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 class="font-bold text-lg mb-4">Ringkasan Supervisi</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4">
              <div>
                <div class="text-sm text-gray-500">Mode Supervisi</div>
                <div class="font-medium">{{ formData.supervisionType === 'LANGSUNG' ? 'Langsung (Draft)' : 'Terjadwal' }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">Periode</div>
                <div class="font-medium">{{ getPeriodName(formData.periodId) }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">Guru yang Dinilai</div>
                <div class="font-medium">{{ getTeacherName(formData.teacherId) }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">Penilai</div>
                <div class="font-medium">{{ getTeacherName(formData.supervisorId) }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">Instrumen</div>
                <div class="font-medium">{{ getInstrumentNames(formData.instrumentIds) }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">Tanggal & Waktu</div>
                <div class="font-medium">
                  {{ formData.date ? formatDate(formData.date) : '-' }}
                  <span v-if="formData.supervisionType === 'TERJADWAL'">
                    {{ formData.time ? formatTime(formData.time) : '' }}
                  </span>
                </div>
              </div>
              <div v-if="formData.subjectId">
                <div class="text-sm text-gray-500">Mata Pelajaran</div>
                <div class="font-medium">{{ getSubjectName(formData.subjectId) }}</div>
              </div>
              <div v-if="formData.classroomId">
                <div class="text-sm text-gray-500">Kelas / Rombel</div>
                <div class="font-medium">{{ getClassroomName(formData.classroomId) }}</div>
              </div>
            </div>
          </div>

          <div class="flex justify-between mt-4">
            <Button label="Kembali" severity="secondary" icon="pi pi-arrow-left" @click="prevStep" />
            <Button 
              :label="formData.supervisionType === 'LANGSUNG' ? 'Mulai Penilaian' : 'Simpan Jadwal'" 
              :icon="formData.supervisionType === 'LANGSUNG' ? 'pi pi-play' : 'pi pi-save'" 
              :loading="loading"
              @click="submitForm" 
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
