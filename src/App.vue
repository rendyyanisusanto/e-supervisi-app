<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { RouterView } from 'vue-router';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useSchoolProfileStore } from './stores/schoolProfileStore';

const schoolStore = useSchoolProfileStore();

onMounted(() => {
  schoolStore.fetchProfile();
});

watch(() => schoolStore.profile, (profile) => {
  if (profile) {
    if (profile.primaryColor) {
      document.documentElement.style.setProperty('--color-primary', profile.primaryColor);
      // Derive hover and soft colors from primary color or leave default CSS to handle it if we only override main
    }
    if (profile.appName) {
      document.title = profile.appName;
    }
    if (profile.logo) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = profile.logo;
    }
  }
}, { deep: true, immediate: true });
</script>

<template>
  <Toast />
  <ConfirmDialog />
  <RouterView />
</template>

<style>
#app {
  min-height: 100vh;
}
</style>
