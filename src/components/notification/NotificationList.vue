<script setup lang="ts">

import type { Notification } from '../../types/notification';
import NotificationStatusTag from './NotificationStatusTag.vue';
import Skeleton from 'primevue/skeleton';
import { useRouter } from 'vue-router';

const props = defineProps<{
  notifications: Notification[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'read', id: string): void;
  (e: 'close'): void;
}>();

const router = useRouter();

const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Baru saja';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
};

const handleNotificationClick = (notif: Notification) => {
  if (!notif.isRead) {
    emit('read', notif.id);
  }
  if (notif.link) {
    router.push(notif.link);
    emit('close');
  }
};
</script>

<template>
  <div class="max-h-[400px] overflow-y-auto w-full">
    <div v-if="loading" class="p-4 space-y-4">
      <div v-for="i in 3" :key="i" class="flex gap-3">
        <Skeleton shape="circle" size="2rem" />
        <div class="flex-1 space-y-2">
          <Skeleton width="100%" height="1rem" />
          <Skeleton width="80%" height="0.8rem" />
        </div>
      </div>
    </div>
    
    <div v-else-if="notifications.length === 0" class="p-6 text-center text-slate-500">
      <i class="pi pi-bell-slash text-3xl mb-2 text-slate-300"></i>
      <p class="text-sm">Belum ada notifikasi baru</p>
    </div>

    <ul v-else class="divide-y divide-slate-100">
      <li 
        v-for="n in notifications" 
        :key="n.id" 
        class="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
        :class="{'bg-blue-50/30': !n.isRead}"
        @click="handleNotificationClick(n)"
      >
        <div class="flex gap-3">
          <NotificationStatusTag :type="n.type" />
          <div class="flex-1">
            <div class="flex justify-between items-start mb-1">
              <h4 class="text-sm font-semibold text-slate-800" :class="{'font-bold': !n.isRead}">{{ n.title }}</h4>
              <span class="text-[10px] text-slate-400 whitespace-nowrap ml-2">{{ timeAgo(n.createdAt) }}</span>
            </div>
            <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed" :class="{'text-slate-800': !n.isRead}">{{ n.message }}</p>
          </div>
          <div v-if="!n.isRead" class="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
        </div>
      </li>
    </ul>
  </div>
</template>
