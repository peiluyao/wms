<template>
  <div class="space-y-6">
    <!-- Action Bar -->
    <div class="flex items-center justify-between">
      <div class="relative w-72">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="搜索物料名称或编码..."
          class="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
        />
      </div>
      <button 
        @click="showAddModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center"
      >
        <Plus class="w-4 h-4 mr-2" />
        新增物料
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-slate-50/50">
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">物料编码</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">物料名称</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">规格型号</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">单位</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">单重 (kg)</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">备注</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in filteredMaterials" :key="item.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4 font-bold text-slate-700">{{ item.code }}</td>
              <td class="px-6 py-4 font-medium text-slate-800">{{ item.name }}</td>
              <td class="px-6 py-4 text-sm text-slate-500 font-medium">{{ item.spec }}</td>
              <td class="px-6 py-4 text-sm text-slate-500 font-medium">{{ item.unit }}</td>
              <td class="px-6 py-4 text-sm text-slate-500 font-medium">{{ item.weight }}</td>
              <td class="px-6 py-4 text-sm text-slate-400 font-medium">{{ item.remark || '-' }}</td>
              <td class="px-6 py-4">
                <button class="text-blue-600 hover:text-blue-800 font-bold text-sm">编辑</button>
              </td>
            </tr>
            <tr v-if="filteredMaterials.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-slate-400 font-medium">未找到相关物料</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800 text-xl">新增物料</h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600">
            <X class="w-6 h-6" />
          </button>
        </div>
        <form @submit.prevent="handleAdd" class="p-8 space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">物料编码</label>
              <input v-model="newMaterial.code" type="text" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" required />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">物料名称</label>
              <input v-model="newMaterial.name" type="text" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" required />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">规格型号</label>
              <input v-model="newMaterial.spec" type="text" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">单位</label>
              <input v-model="newMaterial.unit" type="text" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" required />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">单重 (kg)</label>
              <input v-model="newMaterial.weight" type="number" step="0.01" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">备注</label>
            <textarea v-model="newMaterial.remark" rows="3" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"></textarea>
          </div>
          <div class="flex space-x-4 pt-4">
            <button type="button" @click="showAddModal = false" class="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">取消</button>
            <button type="submit" class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">确认保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { Search, Plus, X } from 'lucide-vue-next';
import axios from 'axios';

const materials = ref([]);
const searchQuery = ref('');
const showAddModal = ref(false);

const newMaterial = reactive({
  code: '',
  name: '',
  spec: '',
  unit: '件',
  weight: 0,
  remark: ''
});

const filteredMaterials = computed(() => {
  return materials.value.filter(m => 
    m.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    m.code.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const fetchMaterials = async () => {
  try {
    const res = await axios.get('/api/materials');
    materials.value = res.data;
  } catch (err) {
    console.error('Failed to fetch materials:', err);
  }
};

const handleAdd = async () => {
  try {
    await axios.post('/api/materials', newMaterial);
    showAddModal.value = false;
    fetchMaterials();
    // Reset form
    Object.assign(newMaterial, { code: '', name: '', spec: '', unit: '件', weight: 0, remark: '' });
  } catch (err) {
    alert('保存失败');
  }
};

onMounted(fetchMaterials);
</script>