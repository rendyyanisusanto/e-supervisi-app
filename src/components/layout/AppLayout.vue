<script setup lang="ts">
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';
import { useLayoutStore } from '../../stores/layoutStore';

const layoutStore = useLayoutStore();
</script>

<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden">
    <!-- Mobile Sidebar Overlay -->
    <div v-if="layoutStore.mobileSidebarOpen" 
         class="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
         @click="layoutStore.setMobileSidebarOpen(false)">
    </div>

    <!-- Sidebar -->
    <AppSidebar 
      class="fixed inset-y-0 left-0 z-50 transform lg:transform-none transition-transform duration-300 lg:flex"
      :class="[layoutStore.mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full', 'lg:translate-x-0']" 
    />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col transition-all duration-300 h-screen w-full lg:w-auto"
         :class="[layoutStore.sidebarCollapsed ? 'lg:pl-[84px]' : 'lg:pl-72']">
      <AppTopbar />
      
      <main class="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6 print:p-0 print:bg-white">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
