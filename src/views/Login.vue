<template>
  <div class="w-full max-w-md p-10 bg-white rounded-3xl shadow-2xl border border-slate-100">
    <div class="flex flex-col items-center mb-10">
      <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-200">
        <Package class="text-white w-8 h-8" />
      </div>
      <h1 class="text-3xl font-bold text-slate-900 tracking-tight">WMS 仓库管理系统</h1>
      <p class="text-slate-500 mt-2 font-medium">请登录您的账号以继续</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-6">
      <div class="space-y-2">
        <label class="text-sm font-semibold text-slate-700 ml-1">用户名</label>
        <div class="relative group">
          <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            v-model="form.username"
            type="text" 
            placeholder="请输入用户名"
            class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            required
          />
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-semibold text-slate-700 ml-1">密码</label>
        <div class="relative group">
          <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            v-model="form.password"
            type="password" 
            placeholder="请输入密码"
            class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            required
          />
        </div>
      </div>

      <div v-if="error" class="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center">
        <AlertCircle class="w-4 h-4 mr-2" />
        {{ error }}
      </div>

      <button 
        type="submit"
        :disabled="loading"
        class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? '登录中...' : '立即登录' }}
      </button>
    </form>

    <div class="mt-10 text-center">
      <p class="text-slate-400 text-sm font-medium">默认账号: admin / admin123</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { Package, User, Lock, AlertCircle } from 'lucide-vue-next';
import axios from 'axios';

const router = useRouter();
const auth = useAuthStore();

const form = reactive({
  username: '',
  password: ''
});

const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await axios.post('/api/login', form);
    if (res.data.success) {
      auth.login(res.data.user);
      router.push('/');
    }
  } catch (err) {
    error.value = err.response?.data?.message || '登录失败，请检查网络连接';
  } finally {
    loading.value = false;
  }
};
</script>
