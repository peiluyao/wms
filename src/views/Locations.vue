<template>
  <div class="space-y-6">
    <!-- Action Bar -->
    <div class="flex items-center justify-between">
      <div class="relative w-72">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="搜索库位名称或编码..."
          class="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
        />
      </div>
      <button 
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center"
      >
        <Plus class="w-4 h-4 mr-2" />
        新增库位
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-slate-50/50">
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">库位编码</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">库位名称</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">所属库区</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">最大容量</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">备注</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in filteredLocations" :key="item.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4 font-bold text-slate-700">{{ item.code }}</td>
              <td class="px-6 py-4 font-medium text-slate-800">{{ item.name }}</td>
              <td class="px-6 py-4">
                <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">{{ item.area }}区</span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500 font-medium">{{ item.max_capacity }}</td>
              <td class="px-6 py-4 text-sm text-slate-400 font-medium">{{ item.remark || '-' }}</td>
              <td class="px-6 py-4">
                <button class="text-blue-600 hover:text-blue-800 font-bold text-sm">编辑</button>
              </td>
            </tr>
            <tr v-if="filteredLocations.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-400 font-medium">暂无库位数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Search, Plus } from 'lucide-vue-next';
import axios from 'axios';

const locations = ref([]);
const searchQuery = ref('');

const filteredLocations = computed(() => {
  return locations.value.filter(l => 
    l.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    l.code.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const fetchLocations = async () => {
  try {
    const res = await axios.get('/api/locations');
    locations.value = res.data;
  } catch (err) {
    console.error('Failed to fetch locations:', err);
  }
};

onMounted(fetchLocations);
</script>