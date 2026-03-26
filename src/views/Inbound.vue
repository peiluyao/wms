<template>
  <div class="space-y-6">
    <!-- Action Bar -->
    <div class="flex items-center justify-between">
      <div class="flex space-x-4">
        <button 
          @click="activeTab = 'LIST'"
          :class="[
            activeTab === 'LIST' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-50',
            'px-6 py-2.5 rounded-xl font-bold text-sm transition-all'
          ]"
        >
          入库单列表
        </button>
        <button 
          @click="activeTab = 'CREATE'"
          :class="[
            activeTab === 'CREATE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-50',
            'px-6 py-2.5 rounded-xl font-bold text-sm transition-all'
          ]"
        >
          创建入库单
        </button>
      </div>
    </div>

    <!-- List View -->
    <div v-if="activeTab === 'LIST'" class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-slate-50/50">
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">单号</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">状态</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">备注</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">创建时间</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="order in inboundOrders" :key="order.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4 font-bold text-slate-700">{{ order.order_no }}</td>
              <td class="px-6 py-4">
                <span class="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">已完成</span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500 font-medium">{{ order.remark || '-' }}</td>
              <td class="px-6 py-4 text-sm text-slate-400 font-medium">{{ formatDate(order.created_at) }}</td>
              <td class="px-6 py-4">
                <button class="text-blue-600 hover:text-blue-800 font-bold text-sm">详情</button>
              </td>
            </tr>
            <tr v-if="inboundOrders.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-400 font-medium">暂无入库记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create View -->
    <div v-else class="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-4xl mx-auto">
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <div class="grid grid-cols-2 gap-8">
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">入库单号</label>
            <input v-model="newOrder.order_no" type="text" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" placeholder="RK-YYYYMMDD-XXX" required />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">备注</label>
            <input v-model="newOrder.remark" type="text" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" />
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-slate-800">物料明细</h4>
            <button type="button" @click="addItem" class="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center">
              <Plus class="w-4 h-4 mr-1" />
              添加明细
            </button>
          </div>
          
          <div v-for="(item, index) in newOrder.items" :key="index" class="grid grid-cols-12 gap-4 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div class="col-span-4 space-y-2">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">选择物料</label>
              <select v-model="item.material_id" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium" required>
                <option v-for="m in materials" :key="m.id" :value="m.id">{{ m.name }} ({{ m.code }})</option>
              </select>
            </div>
            <div class="col-span-4 space-y-2">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">目标库位</label>
              <select v-model="item.location_id" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium" required>
                <option v-for="l in locations" :key="l.id" :value="l.id">{{ l.name }} ({{ l.code }})</option>
              </select>
            </div>
            <div class="col-span-3 space-y-2">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">入库数量</label>
              <input v-model.number="item.qty" type="number" min="1" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium" required />
            </div>
            <div class="col-span-1 flex justify-center pb-2">
              <button type="button" @click="removeItem(index)" class="text-red-400 hover:text-red-600">
                <Trash2 class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-4 pt-6">
          <button type="button" @click="activeTab = 'LIST'" class="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">取消</button>
          <button type="submit" class="px-12 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">提交入库</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import axios from 'axios';

const activeTab = ref('LIST');
const orders = ref([]);
const materials = ref([]);
const locations = ref([]);

const newOrder = reactive({
  order_no: `RK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
  remark: '',
  items: [{ material_id: null, location_id: null, qty: 1 }]
});

const inboundOrders = computed(() => orders.value.filter(o => o.type === 'INBOUND'));

const fetchData = async () => {
  try {
    const [ordersRes, materialsRes, locationsRes] = await Promise.all([
      axios.get('/api/orders'),
      axios.get('/api/materials'),
      axios.get('/api/locations')
    ]);
    orders.value = ordersRes.data;
    materials.value = materialsRes.data;
    locations.value = locationsRes.data;
  } catch (err) {
    console.error('Failed to fetch data:', err);
  }
};

const addItem = () => {
  newOrder.items.push({ material_id: null, location_id: null, qty: 1 });
};

const removeItem = (index) => {
  if (newOrder.items.length > 1) {
    newOrder.items.splice(index, 1);
  }
};

const handleSubmit = async () => {
  try {
    await axios.post('/api/orders', { ...newOrder, type: 'INBOUND' });
    activeTab.value = 'LIST';
    fetchData();
    // Reset form
    Object.assign(newOrder, {
      order_no: `RK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      remark: '',
      items: [{ material_id: null, location_id: null, qty: 1 }]
    });
  } catch (err) {
    alert('提交失败: ' + (err.response?.data?.message || err.message));
  }
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString();
};

onMounted(fetchData);
</script>