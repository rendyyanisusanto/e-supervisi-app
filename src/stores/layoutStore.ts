import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLayoutStore = defineStore('layout', () => {
  const sidebarCollapsed = ref(false);
  const mobileSidebarOpen = ref(false);
  const expandedMenus = ref<string[]>([]);

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };

  const setSidebarCollapsed = (value: boolean) => {
    sidebarCollapsed.value = value;
  };

  const toggleMobileSidebar = () => {
    mobileSidebarOpen.value = !mobileSidebarOpen.value;
  };

  const setMobileSidebarOpen = (value: boolean) => {
    mobileSidebarOpen.value = value;
  };

  const toggleMenu = (menuKey: string) => {
    const index = expandedMenus.value.indexOf(menuKey);
    if (index === -1) {
      expandedMenus.value.push(menuKey);
    } else {
      expandedMenus.value.splice(index, 1);
    }
  };

  return {
    sidebarCollapsed,
    mobileSidebarOpen,
    expandedMenus,
    toggleSidebar,
    setSidebarCollapsed,
    toggleMobileSidebar,
    setMobileSidebarOpen,
    toggleMenu
  };
});
