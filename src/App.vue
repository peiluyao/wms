<template>
  <div v-if="isLoginPage" class="min-h-screen bg-slate-50 flex items-center justify-center">
    <router-view />
  </div>
  <div v-else class="min-h-screen bg-slate-50 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
      <div class="h-16 flex items-center px-6 border-b border-slate-800">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
          <Package class="text-white w-5 h-5" />
        </div>
        <span class="text-white font-bold text-lg tracking-tight">WMS 系统</span>
      </div>
      
      <nav class="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="flex items-center px-4 py-3 rounded-xl transition-all duration-200 group"
          :class="[
            $route.path === item.path 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
              : 'hover:bg-slate-800 hover:text-white'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3 opacity-80 group-hover:opacity-100" />
          <span class="font-medium">{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="p-4 border-t border-slate-800">
        <button 
          @click="handleLogout"
          class="flex items-center w-full px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 text-slate-400"
        >
          <LogOut class="w-5 h-5 mr-3" />
          <span class="font-medium">退出登录</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
        <div class="flex items-center space-x-4">
          <h2 class="text-slate-800 font-semibold text-lg">{{ currentRouteName }}</h2>
        </div>
        
        <div class="flex items-center space-x-6">
          <div class="flex items-center space-x-3 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
            <div class="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
              <User class="w-4 h-4 text-blue-600" />
            </div>
            <span class="text-sm font-medium text-slate-700">{{ auth.user?.name }}</span>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-8">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './store/auth';
import { 
  LayoutDashboard, 
  Package, 
  MapPin, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Search, 
  LogOut,
  User,
  Database
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const isLoginPage = computed(() => route.name === 'Login');

const menuItems = [
  { name: '仪表盘', path: '/', icon: LayoutDashboard },
  { name: '物料管理', path: '/materials', icon: Package },
  { name: '库位管理', path: '/locations', icon: MapPin },
  { name: '入库管理', path: '/inbound', icon: ArrowDownCircle },
  { name: '出库管理', path: '/outbound', icon: ArrowUpCircle },
  { name: '库存查询', path: '/inventory', icon: Search },
];

const currentRouteName = computed(() => {
  const item = menuItems.find(m => m.path === route.path);
  return item ? item.name : '系统管理';
});

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<style>
@reference "tailwindcss";
.router-link-active {
  @apply bg-blue-600 text-white shadow-lg shadow-blue-900/20;
}
</style>