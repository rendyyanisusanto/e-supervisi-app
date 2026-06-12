<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import BaseEmptyState from '../../components/common/BaseEmptyState.vue';
import Card from 'primevue/card';

const route = useRoute();
const router = useRouter();

const title = computed(() => route.meta.title || 'Halaman Belum Tersedia');

const breadcrumbs = computed(() => [
  { label: 'E-Supervisi', to: '/' },
  { label: title.value }
]);
</script>

<template>
  <div>
    <BasePageHeader 
      :title="title as string" 
      subtitle="Halaman ini sedang dalam tahap pengembangan."
      :breadcrumbs="breadcrumbs"
    />
    
    <Card class="border-none shadow-sm mt-4">
      <template #content>
        <BaseEmptyState 
          title="Fitur Segera Hadir" 
          description="Halaman ini akan dikembangkan dan dapat diakses sepenuhnya pada rilis berikutnya (Sprint 2)." 
          icon="pi pi-compass"
          actionLabel="Kembali ke Dashboard"
          @action="router.push('/dashboard')"
        />
      </template>
    </Card>
  </div>
</template>
