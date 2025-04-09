<template>
  <div class="p-4 bg-[var(--p-primary-50)]">
    <div class="flex justify-between items-end mb-6">
      <div>
        <h1 class="text-2xl font-bold text-[var(--p-primary-700)]">Management Dashboard</h1>
      </div>
      <div>
        <Dropdown 
          v-model="selectedYear" 
          :options="years" 
          placeholder="Select Year"
          class="p-inputtext-sm"
        />
      </div>
    </div>

    <!-- Stats Cards Row -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatsCard
        title="Total Residents"
        :count="totalResidents"
        iconClass="pi pi-users"
        iconColor="text-[var(--p-primary-600)]"
        bgColor="bg-gradient-to-br from-white to-[#f0f5ff]"
        :trend="12"
        trendPeriod="vs last month"
      />
      <StatsCard
        title="Total Maintenance Fees"
        :count="formatCurrency(totalMaintenanceFees)"
        iconClass="pi pi-dollar"
        iconColor="text-[var(--p-primary-500)]"
        bgColor="bg-gradient-to-br from-white to-[#e9efff]"
        :trend="8"
        trendPeriod="vs last month"
      />
      <StatsCard
        title="Total Complaints"
        :count="complaintsStats.total"
        iconClass="pi pi-exclamation-circle"
        iconColor="text-[#5d7ce5]"
        bgColor="bg-gradient-to-br from-white to-[#f0f5ff]"
        :trend="-5"
        trendPeriod="vs last month"
      />
      <StatsCard
        title="Resolution Rate"
        :count="complaintsStats.resolutionRate + '%'"
        iconClass="pi pi-check-circle"
        iconColor="text-[#5d7ce5]"
        bgColor="bg-gradient-to-br from-white to-[#e9efff]"
        :trend="3"
        trendPeriod="vs last month"
      />
    </div>

    <!-- Financial Charts Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Revenue Trends Line Chart -->
      <div class="bg-white p-4 rounded-lg shadow-sm chart-container border border-[var(--p-surface-200)]">
        <h2 class="text-lg font-semibold mb-4 text-[var(--p-primary-700)]">Monthly Revenue Trends</h2>
        <div :class="{'animate-chart': isChartVisible}">
          <Chart type="line" :data="revenueData" :options="lineOptions" class="h-80" />
        </div>
      </div>

      <!-- Collected vs Outstanding Bar Chart -->
      <div class="bg-white p-4 rounded-lg shadow-sm chart-container border border-[var(--p-surface-200)]">
        <h2 class="text-lg font-semibold mb-4 text-[var(--p-primary-700)]">Collected vs Outstanding</h2>
        <div :class="{'animate-chart': isChartVisible, 'animation-delay-300': true}">
          <Chart type="bar" :data="invoiceComparisonData" :options="barOptions" class="h-80" />
        </div>
      </div>
    </div>

    <!-- Invoice Status Doughnut Chart -->
    <div class="bg-white p-4 rounded-lg shadow-sm mb-6 chart-container border border-[var(--p-surface-200)]">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-[var(--p-primary-700)]">Invoice Status</h2>
        <div class="flex gap-4">
          <div class="flex items-center">
            <div class="h-3 w-3 rounded-full bg-[var(--p-primary-400)] mr-2"></div>
            <span class="text-sm text-[var(--p-text-color)]">Paid ({{ invoiceStats.paid }})</span>
          </div>
          <div class="flex items-center">
            <div class="h-3 w-3 rounded-full bg-[var(--p-primary-300)] mr-2"></div>
            <span class="text-sm text-[var(--p-text-color)]">Unpaid ({{ invoiceStats.unpaid }})</span>
          </div>
          <div class="flex items-center">
            <div class="h-3 w-3 rounded-full bg-[var(--p-primary-600)] mr-2"></div>
            <span class="text-sm text-[var(--p-text-color)]">Overdue ({{ invoiceStats.overdue }})</span>
          </div>
        </div>
      </div>
      <div class="flex flex-col md:flex-row">
        <div class="w-full md:w-1/3">
          <div :class="{'animate-chart': isChartVisible, 'animation-delay-600': true}">
            <Chart type="doughnut" :data="invoiceStatusData" :options="doughnutOptions" class="h-64" />
          </div>
        </div>
        <div class="w-full md:w-2/3 md:pl-8 mt-4 md:mt-0">
          <h3 class="font-medium mb-3 text-[var(--p-primary-600)]">Invoice Summary</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-[var(--p-primary-50)] p-3 rounded-lg">
              <div class="text-sm text-[var(--p-text-muted-color)]">Total Invoices</div>
              <div class="text-xl font-bold text-[var(--p-primary-700)]">{{ invoiceStats.total }}</div>
            </div>
            <div class="bg-[var(--p-primary-100)] p-3 rounded-lg">
              <div class="text-sm text-[var(--p-text-muted-color)]">Collection Rate</div>
              <div class="text-xl font-bold text-[var(--p-primary-700)]">{{ invoiceStats.collectionRate }}%</div>
            </div>
            <div class="bg-[var(--p-primary-50)] p-3 rounded-lg">
              <div class="text-sm text-[var(--p-text-muted-color)]">Overdue Rate</div>
              <div class="text-xl font-bold text-[var(--p-primary-700)]">{{ invoiceStats.overdueRate }}%</div>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex justify-between mb-1">
              <span class="text-sm font-medium text-[var(--p-text-color)]">Collection Progress</span>
              <span class="text-sm font-medium text-[var(--p-text-color)]">{{ invoiceStats.collectionRate }}%</span>
            </div>
            <div :class="{'animate-progress': isChartVisible, 'animation-delay-900': true}">
              <ProgressBar :value="invoiceStats.collectionRate" class="h-2" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Complaints Analytics Row -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-4 text-[var(--p-primary-700)]">Complaints Analytics</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <!-- Complaint Resolution Stats -->
        <div class="bg-white p-4 rounded-lg shadow-sm border border-[var(--p-surface-200)]">
          <h3 class="text-base font-medium mb-4 text-[var(--p-primary-600)]">Complaint Resolution</h3>
          
          <div class="space-y-4">
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm text-[var(--p-text-color)]">Average Resolution Time</span>
                <span class="text-sm font-medium text-[var(--p-primary-600)]">{{ complaintsStats.avgResolutionTime }} days</span>
              </div>
              <ProgressBar :value="(complaintsStats.avgResolutionTime / 5) * 100" class="h-2" />
            </div>
            
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm text-[var(--p-text-color)]">Same Day Resolution</span>
                <span class="text-sm font-medium text-[var(--p-primary-600)]">{{ complaintsStats.sameDayResolution }}%</span>
              </div>
              <ProgressBar :value="complaintsStats.sameDayResolution" class="h-2" />
            </div>
            
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm text-[var(--p-text-color)]">Pending Complaints</span>
                <span class="text-sm font-medium text-[var(--p-primary-600)]">{{ complaintsStats.pending }} ({{ Math.round((complaintsStats.pending / complaintsStats.total) * 100) }}%)</span>
              </div>
              <ProgressBar :value="Math.round((complaintsStats.pending / complaintsStats.total) * 100)" class="h-2" />
            </div>
            
            <div class="grid grid-cols-2 gap-3 mt-4">
              <div class="bg-[var(--p-primary-50)] p-3 rounded-lg">
                <div class="text-sm text-[var(--p-text-muted-color)]">Month-to-date</div>
                <div class="text-lg font-bold text-[var(--p-primary-700)]">{{ complaintsStats.monthToDate }}</div>
              </div>
              <div class="bg-[var(--p-primary-50)] p-3 rounded-lg">
                <div class="text-sm text-[var(--p-text-muted-color)]">Critical Issues</div>
                <div class="text-lg font-bold text-[var(--p-primary-700)]">{{ complaintsStats.critical }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Complaints by Category Chart -->
        <div class="bg-white p-4 rounded-lg shadow-sm chart-container border border-[var(--p-surface-200)]">
          <h3 class="text-base font-medium mb-4 text-[var(--p-primary-600)]">Complaints by Category</h3>
          <div :class="{'animate-chart': isChartVisible, 'animation-delay-1200': true}">
            <Chart type="pie" :data="complaintsByCategoryData" :options="pieOptions" class="h-64" />
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
            <div v-for="(category, index) in complaintCategories" :key="index" class="flex items-center">
              <div class="h-3 w-3 rounded-full mr-2" :style="{backgroundColor: categoryColors[index]}"></div>
              <span class="text-xs text-[var(--p-text-color)]">{{ category }}</span>
            </div>
          </div>
        </div>
        
        <!-- Complaints Trend Chart -->
        <div class="bg-white p-4 rounded-lg shadow-sm chart-container border border-[var(--p-surface-200)]">
          <h3 class="text-base font-medium mb-4 text-[var(--p-primary-600)]">Complaints Trend</h3>
          <div :class="{'animate-chart': isChartVisible, 'animation-delay-1500': true}">
            <Chart type="line" :data="complaintsTrendData" :options="trendOptions" class="h-80" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Chart from 'primevue/chart';
import Dropdown from 'primevue/dropdown';
import ProgressBar from 'primevue/progressbar';
import StatsCard from '@/components/StatsCard.vue';

// Chart animation control
const isChartVisible = ref(false);

// Dummy data
const selectedYear = ref(2023);
const years = [2021, 2022, 2023, 2024];

// Stats data
const totalResidents = ref(147);
const totalMaintenanceFees = ref(285750);

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0
  }).format(value);
};

// Monthly revenue data
const monthlyRevenue = {
  2023: [19500, 21000, 22800, 24500, 23000, 25500, 27000, 28500, 26000, 27500, 29000, 31500]
};

// Revenue line chart data
const revenueData = computed(() => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Monthly Revenue',
      data: monthlyRevenue[selectedYear.value] || monthlyRevenue[2023],
      fill: true,
      backgroundColor: 'rgba(167, 197, 255, 0.5)',
      borderColor: '#A7C5FF',
      tension: 0.4,
      pointBackgroundColor: '#A7C5FF',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#89ABDF'
    }
  ]
}));

// Invoice comparison data
const invoiceData = {
  2023: {
    collected: [17000, 18500, 20000, 21500, 19000, 22000, 24000, 25500, 23000, 24500, 26000, 28000],
    outstanding: [2500, 2500, 2800, 3000, 4000, 3500, 3000, 3000, 3000, 3000, 3000, 3500]
  }
};

const invoiceComparisonData = computed(() => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Collected',
      data: (invoiceData[selectedYear.value] || invoiceData[2023]).collected,
      backgroundColor: '#A7C5FF'
    },
    {
      label: 'Outstanding',
      data: (invoiceData[selectedYear.value] || invoiceData[2023]).outstanding,
      backgroundColor: '#FFB7B7'
    }
  ]
}));

// Invoice status data
const invoiceStats = ref({
  paid: 125,
  unpaid: 15,
  overdue: 7,
  total: 147,
  collectionRate: 85,
  overdueRate: 5
});

const invoiceStatusData = computed(() => ({
  labels: ['Paid', 'Unpaid', 'Overdue'],
  datasets: [
    {
      data: [invoiceStats.value.paid, invoiceStats.value.unpaid, invoiceStats.value.overdue],
      backgroundColor: [
        '#A7C5FF',
        '#FFB7B7',
        '#B4F0B4'
      ],
      hoverBackgroundColor: [
        '#89ABDF',
        '#E09F9F',
        '#9CD89C'
      ],
      borderWidth: 1,
      borderColor: ['#fff', '#fff', '#fff']
    }
  ]
}));

// Complaints data
const complaintsStats = ref({
  total: 42,
  pending: 8,
  resolutionRate: 81,
  avgResolutionTime: 2.3,
  sameDayResolution: 65,
  monthToDate: 12,
  critical: 3
});

const complaintCategories = ['Maintenance', 'Noise', 'Security', 'Facilities', 'Cleanliness', 'Other'];
const categoryColors = ['#A7C5FF', '#FFB7B7', '#B4F0B4', '#FFE5A8', '#D9BBFF', '#A8E5FF'];

const complaintsByCategoryData = computed(() => ({
  labels: complaintCategories,
  datasets: [
    {
      data: [15, 8, 6, 5, 5, 3],
      backgroundColor: categoryColors,
      hoverBackgroundColor: categoryColors.map(color => color),
      borderWidth: 1,
      borderColor: '#fff'
    }
  ]
}));

// Complaints trend data - last 6 months
const complaintsTrendData = computed(() => ({
  labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'New Complaints',
      data: [38, 45, 40, 35, 48, 42],
      fill: false,
      borderColor: '#FFB7B7',
      tension: 0.4,
      pointBackgroundColor: '#FFB7B7'
    },
    {
      label: 'Resolved',
      data: [32, 40, 35, 30, 42, 34],
      fill: false,
      borderColor: '#B4F0B4',
      tension: 0.4,
      pointBackgroundColor: '#B4F0B4',
      borderDash: [5, 5]
    }
  ]
}));

// Chart options with animations
const lineOptions = {
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => formatCurrency(value)
      },
      grid: {
        color: 'rgba(200, 200, 200, 0.2)'
      }
    },
    x: {
      grid: {
        color: 'rgba(200, 200, 200, 0.2)'
      }
    }
  },
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    delay: (context) => {
      return context.dataIndex * 100;
    },
    duration: 1000,
    easing: 'easeOutQuart'
  }
};

const barOptions = {
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => formatCurrency(value)
      },
      grid: {
        color: 'rgba(200, 200, 200, 0.2)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  },
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    delay: (context) => {
      return context.dataIndex * 100 + (context.datasetIndex * 500);
    },
    duration: 800,
    easing: 'easeOutQuart'
  }
};

const doughnutOptions = {
  cutout: '70%',
  plugins: {
    legend: {
      display: false
    }
  },
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    animateRotate: true,
    animateScale: false,
    delay: (context) => context.dataIndex * 300,
    duration: 1000,
    easing: 'easeOutQuart'
  }
};

const pieOptions = {
  plugins: {
    legend: {
      display: false
    }
  },
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    animateRotate: true,
    animateScale: false,
    delay: (context) => context.dataIndex * 150,
    duration: 800,
    easing: 'easeOutQuart'
  }
};

const trendOptions = {
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 10
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(200, 200, 200, 0.2)'
      }
    },
    x: {
      grid: {
        color: 'rgba(200, 200, 200, 0.2)'
      }
    }
  },
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    delay: (context) => {
      return context.dataIndex * 150 + (context.datasetIndex * 600);
    },
    duration: 800,
    easing: 'easeOutQuart'
  }
};

onMounted(() => {
  // Simulate API call to get data
  console.log('Dashboard mounted, fetching data...');
  
  // Add a small delay before showing charts to ensure DOM is ready
  setTimeout(() => {
    isChartVisible.value = true;
  }, 300);
});
</script>

<style>
.p-dropdown {
  background: var(--p-surface-0);
}

.p-dropdown-item.p-highlight {
  background-color: var(--p-highlight-background) !important;
  color: var(--p-highlight-color) !important;
}

:deep(.p-dropdown-panel .p-dropdown-items .p-dropdown-item.p-highlight) {
  background-color: var(--p-highlight-background) !important;
  color: var(--p-highlight-color) !important;
}

/* Chart animation classes */
.animate-chart {
  animation: growIn 1s ease-out forwards;
  opacity: 0;
  transform: scale(0.5);
}

.animation-delay-300 {
  animation-delay: 300ms;
}

.animation-delay-600 {
  animation-delay: 600ms;
}

.animation-delay-900 {
  animation-delay: 900ms;
}

.animation-delay-1200 {
  animation-delay: 1200ms;
}

.animation-delay-1500 {
  animation-delay: 1500ms;
}

.animate-progress {
  animation: fadeIn 1s ease-out forwards;
  opacity: 0;
}

@keyframes growIn {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  70% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* Ensure chart containers maintain height during animation */
.chart-container {
  overflow: hidden;
}

:deep(.p-progressbar) {
  background: #EDF3FF;
}

:deep(.p-progressbar-value) {
  background: #A7C5FF;
}
</style>