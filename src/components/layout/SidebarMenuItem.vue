<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLayoutStore } from '../../stores/layoutStore';

const props = defineProps<{
  item: any;
  depth?: number;
}>();

const layoutStore = useLayoutStore();
const route = useRoute();
const router = useRouter();

const currentDepth = computed(() => props.depth || 0);

const isExpanded = computed(() => {
  return layoutStore.expandedMenus.includes(props.item.key);
});

const checkActive = (targetPath: string) => {
  if (route.path === targetPath) return true;
  
  // Handle dynamic sub-routes matching their parent list
  if (targetPath === '/supervisi' && route.path.match(/^\/supervisi\/[^\/]+\/input$/)) return true;
  if (targetPath === '/supervisi/hasil' && route.path.match(/^\/supervisi\/[^\/]+\/hasil$/)) return true;
  if (targetPath === '/instrumen' && route.path.match(/^\/instrumen\/[^\/]+\/builder$/)) return true;
  if (targetPath === '/guru' && route.path.match(/^\/guru\/[^\/]+$/) && !route.path.includes('/peta') && !route.path.includes('/rapor')) return true;
  
  return false;
};

const isActive = computed(() => {
  let active = false;
  if (props.item.to) {
    active = checkActive(props.item.to);
  }
  if (!active && props.item.items) {
    active = props.item.items.some((child: any) => checkActive(child.to));
  }
  return active;
});

const toggleMenu = () => {
  if (props.item.items) {
    layoutStore.toggleMenu(props.item.key);
  }
  if (props.item.to) {
    // Only navigate if we're not already on that route to avoid redundant pushes
    if (route.path !== props.item.to) {
      router.push(props.item.to);
    }
  }
};
</script>

<template>
  <div class="mb-1">
    <template v-if="!item.items">
      <router-link :to="item.to" class="flex items-center px-4 py-2.5 rounded-lg transition-colors group relative"
                   :class="[isActive ? 'bg-white/10 text-white' : 'text-blue-100 hover:bg-white/5 hover:text-white', currentDepth > 0 ? 'pl-11' : '']">
        <i :class="[item.icon, 'text-lg', isActive ? 'text-white' : 'text-blue-200 group-hover:text-white']"></i>
        <span class="ml-3 font-medium text-sm whitespace-nowrap transition-opacity duration-300"
              :class="{'opacity-0 hidden': layoutStore.sidebarCollapsed}">
          {{ item.label }}
        </span>
        
        <!-- Tooltip for collapsed sidebar -->
        <div v-if="layoutStore.sidebarCollapsed" 
             class="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible whitespace-nowrap z-50">
          {{ item.label }}
        </div>
      </router-link>
    </template>
    
    <template v-else>
      <div @click="toggleMenu" class="flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer transition-colors group relative"
           :class="[isActive ? 'bg-white/5 text-white' : 'text-blue-100 hover:bg-white/5 hover:text-white', currentDepth > 0 ? 'pl-11' : '']">
        <div class="flex items-center">
          <i :class="[item.icon, 'text-lg', isActive ? 'text-white' : 'text-blue-200 group-hover:text-white']"></i>
          <span class="ml-3 font-medium text-sm whitespace-nowrap transition-opacity duration-300"
                :class="{'opacity-0 hidden': layoutStore.sidebarCollapsed}">
            {{ item.label }}
          </span>
        </div>
        <i v-if="!layoutStore.sidebarCollapsed" 
           class="pi text-xs transition-transform duration-200" 
           :class="isExpanded ? 'pi-chevron-down' : 'pi-chevron-right'"></i>
           
        <!-- Tooltip for collapsed sidebar -->
        <div v-if="layoutStore.sidebarCollapsed" 
             class="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible whitespace-nowrap z-50">
          {{ item.label }}
        </div>
      </div>
      
      <!-- Submenu -->
      <div v-show="isExpanded && !layoutStore.sidebarCollapsed" class="mt-1 space-y-1">
        <SidebarMenuItem v-for="child in item.items" :key="child.key" :item="child" :depth="currentDepth + 1" />
      </div>
    </template>
  </div>
</template>
