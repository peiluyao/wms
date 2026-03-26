<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap gap-6">
      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">物料搜索</label>
        <div class="relative w-64">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input v-model="filters.search" type="text" placeholder="物料名称/编码" class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium" />
        </div>
      </div>
      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">库区</label>
        <select v-model="filters.area" class="w-40 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium">
          <option value="">全部</option>
          <option value="A">A区</option>
          <option value="B">B区</option>
          <option value="C">C区</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-slate-50/50">
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">物料</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">库位</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">库区</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">当前库存</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">最后更新</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in filteredInventory" :key="item.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-bold text-slate-800">{{ item.material_name }}</span>
                  <span class="text-xs text-slate-400 font-medium">{{ item.material_code }}</span>
                </div>
              </td>
              <td class="px-6 py-4 font-bold text-slate-700">{{ item.location_name }}</td>
              <td class="px-6 py-4">
                <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">{{ item.area }}区</span>
              </td>
              <td class="px-6 py-4">
                <span :class="[
                  item.qty < 10 ? 'text-red-600 font-black' : 'text-slate-900 font-bold',
                  'text-lg'
                ]">{{ item.qty }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-400 font-medium">{{ formatDate(item.last_updated_at) }}</td>
            </tr>
            <tr v-if="filteredInventory.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-400 font-medium">暂无库存数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { Search } from 'lucide-vue-next';
import axios from 'axios';

const inventory = ref([]);
const filters = reactive({
  search: '',
  area: ''
});

const filteredInventory = computed(() => {
  return inventory.value.filter(item => {
    const matchesSearch = item.material_name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         item.material_code.toLowerCase().includes(filters.search.toLowerCase());
    const matchesArea = !filters.area || item.area === filters.area;
    return matchesSearch && matchesArea;
  });
});

const fetchInventory = async () => {
  try {
    const res = await axios.get('/api/inventory');
    inventory.value = res.data;
  } catch (err) {
    console.error('Failed to fetch inventory:', err);
  }
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};

onMounted(fetchInventory);
</script>