<template>
  <div class="space-y-8">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in statsItems" :key="stat.label" class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
        <div class="flex items-center justify-between mb-4">
          <div :class="[stat.color, 'w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-current/10']">
            <component :is="stat.icon" class="w-6 h-6 text-white" />
          </div>
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">{{ stat.label }}</span>
        </div>
        <div class="flex items-baseline space-x-2">
          <span class="text-3xl font-black text-slate-900">{{ stat.value }}</span>
          <span class="text-slate-400 text-sm font-medium">{{ stat.unit }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Recent Orders -->
      <div class="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800 text-lg">最近单据</h3>
          <router-link to="/inbound" class="text-blue-600 text-sm font-bold hover:underline">查看全部</router-link>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50/50">
                <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">单号</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">类型</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">状态</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">时间</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-slate-50/50 transition-colors">
                <td class="px-6 py-4 font-bold text-slate-700">{{ order.order_no }}</td>
                <td class="px-6 py-4">
                  <span :class="[
                    order.type === 'INBOUND' ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50',
                    'px-3 py-1 rounded-full text-xs font-bold'
                  ]">
                    {{ order.type === 'INBOUND' ? '入库' : '出库' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="flex items-center text-sm font-medium text-slate-600">
                    <div class="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                    已完成
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-slate-400 font-medium">{{ formatDate(order.created_at) }}</td>
              </tr>
              <tr v-if="recentOrders.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-slate-400 font-medium">暂无最近单据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Inventory Distribution -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h3 class="font-bold text-slate-800 text-lg mb-6">库存概览</h3>
        <div class="space-y-6">
          <div v-for="item in inventorySummary" :key="item.name" class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="font-bold text-slate-700">{{ item.name }}</span>
              <span class="font-medium text-slate-400">{{ item.value }}%</span>
            </div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                :class="[item.color, 'h-full rounded-full transition-all duration-1000']"
                :style="{ width: item.value + '%' }"
              ></div>
            </div>
          </div>
        </div>
        
        <div class="mt-10 p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Zap class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="text-xs font-bold text-blue-400 uppercase tracking-wider">系统提示</p>
              <p class="text-sm font-bold text-blue-900">当前库位利用率良好</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Package, MapPin, ClipboardList, Database, Zap } from 'lucide-vue-next';
import axios from 'axios';

const stats = ref({
  materialCount: 0,
  locationCount: 0,
  orderCount: 0,
  totalInventory: 0
});

const recentOrders = ref([]);

const statsItems = computed(() => [
  { label: '物料总数', value: stats.value.materialCount, unit: '种', icon: Package, color: 'bg-blue-600' },
  { label: '库位总数', value: stats.value.locationCount, unit: '个', icon: MapPin, color: 'bg-indigo-600' },
  { label: '单据总数', value: stats.value.orderCount, unit: '单', icon: ClipboardList, color: 'bg-emerald-600' },
  { label: '当前库存', value: stats.value.totalInventory, unit: '件', icon: Database, color: 'bg-amber-600' },
]);

const inventorySummary = [
  { name: '原材料', value: 65, color: 'bg-blue-600' },
  { name: '半成品', value: 25, color: 'bg-emerald-600' },
  { name: '成品', value: 10, color: 'bg-amber-600' },
];

const fetchData = async () => {
  try {
    const [statsRes, ordersRes] = await Promise.all([
      axios.get('/api/stats'),
      axios.get('/api/orders')
    ]);
    stats.value = statsRes.data;
    recentOrders.value = ordersRes.data.slice(0, 5);
  } catch (err) {
    console.error('Failed to fetch stats:', err);
  }
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
};

onMounted(fetchData);
</script>
