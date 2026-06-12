<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from '../../stores/notificationStore';
import NotificationList from './NotificationList.vue';
import Badge from 'primevue/badge';
import Button from 'primevue/button';

const notificationStore = useNotificationStore();
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && notificationStore.notifications.length === 0) {
    notificationStore.fetchNotifications();
  }
};

const closeDropdown = () => {
  isOpen.value = false;
};

const handleMarkAllRead = async () => {
  await notificationStore.markAllAsRead();
};

const handleRead = async (id: string) => {
  await notificationStore.markAsRead(id);
};

// Close on click outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
  // Initial fetch for badge
  notificationStore.fetchNotifications();
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <button 
      class="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 focus:outline-none"
      @click="toggleDropdown"
    >
      <i class="pi pi-bell text-xl"></i>
      <Badge 
        v-if="notificationStore.unreadCount > 0" 
        :value="notificationStore.unreadCount" 
        severity="danger" 
        class="absolute top-0 right-0 !text-[10px] !min-w-[1.2rem] !h-[1.2rem] !leading-[1.2rem]"
      />
    </button>

    <!-- Dropdown Panel -->
    <div 
      v-if="isOpen" 
      class="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 flex flex-col"
    >
      <!-- Header -->
      <div class="p-3 md:p-4 border-b border-slate-100 flex justify-between items-center bg-white">
        <h3 class="font-bold text-slate-800">Notifikasi</h3>
        <Button 
          v-if="notificationStore.unreadCount > 0"
          label="Tandai semua dibaca" 
          text 
          size="small" 
          class="!p-0 !text-xs !font-medium"
          @click="handleMarkAllRead" 
        />
      </div>

      <!-- List -->
      <NotificationList 
        :notifications="notificationStore.notifications" 
        :loading="notificationStore.loading" 
        @read="handleRead"
        @close="closeDropdown"
      />

      <!-- Footer -->
      <div class="p-2 border-t border-slate-100 bg-slate-50 text-center">
        <Button label="Lihat Semua Notifikasi" text size="small" class="w-full !text-xs" @click="closeDropdown" />
      </div>
    </div>
  </div>
</template>
