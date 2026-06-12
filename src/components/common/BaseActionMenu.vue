<script setup lang="ts">
import { ref } from 'vue';
import Menu from 'primevue/menu';
import Button from 'primevue/button';

defineProps<{
  items: any[];
}>();

const menuRef = ref();

const toggle = (event: Event) => {
  menuRef.value.toggle(event);
};
</script>

<template>
  <div>
    <Button type="button" icon="pi pi-ellipsis-v" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" text rounded severity="secondary" />
    <Menu ref="menuRef" id="overlay_menu" :model="items" :popup="true" />
  </div>
</template>
