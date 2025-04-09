<template>
  <div class="p-4 bg-[var(--p-primary-50)]">
    <div class="flex justify-between items-end mb-6">
      <div>
        <h1 class="text-2xl font-bold text-[var(--p-primary-700)]">Administrator Dashboard</h1>
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
        title="Total Users"
        :count="userStats.total"
        iconClass="pi pi-users"
        iconColor="text-[var(--p-primary-600)]"
        bgColor="bg-gradient-to-br from-white to-[#f0f5ff]"
        :trend="8"
        trendPeriod="vs last month"
      />
      <StatsCard
        title="Active Users"
        :count="userStats.active"
        iconClass="pi pi-user-plus"
        iconColor="text-[var(--p-primary-500)]"
        bgColor="bg-gradient-to-br from-white to-[#e9efff]"
        :trend="12"
        trendPeriod="vs last month"
      />
      <StatsCard
        title="Inactive Users"
        :count="userStats.inactive"
        iconClass="pi pi-user-minus"
        iconColor="text-[#5d7ce5]"
        bgColor="bg-gradient-to-br from-white to-[#f0f5ff]"
        :trend="-4"
        trendPeriod="vs last month"
      />
      <StatsCard
        title="New Registrations"
        :count="userStats.newUsers"
        iconClass="pi pi-user-edit"
        iconColor="text-[#5d7ce5]"
        bgColor="bg-gradient-to-br from-white to-[#e9efff]"
        :trend="15"
        trendPeriod="vs last month"
      />
    </div>

    <!-- User Growth and Engagement Charts -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- User Growth Line Chart -->
      <div class="bg-white p-4 rounded-lg shadow-sm chart-container border border-[var(--p-surface-200)]">
        <h2 class="text-lg font-semibold mb-4 text-[var(--p-primary-700)]">User Growth Trends</h2>
        <div :class="{'animate-chart': isChartVisible}">
          <Chart type="line" :data="userGrowthData" :options="lineOptions" class="h-80" />
        </div>
      </div>

      <!-- User Activity Bar Chart -->
      <div class="bg-white p-4 rounded-lg shadow-sm chart-container border border-[var(--p-surface-200)]">
        <h2 class="text-lg font-semibold mb-4 text-[var(--p-primary-700)]">Monthly User Activity</h2>
        <div :class="{'animate-chart': isChartVisible, 'animation-delay-300': true}">
          <Chart type="bar" :data="userActivityData" :options="barOptions" class="h-80" />
        </div>
      </div>
    </div>

    <!-- User Roles and Activity Timeline -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- User Role Distribution -->
      <div class="bg-white p-4 rounded-lg shadow-sm chart-container border border-[var(--p-surface-200)]">
        <h2 class="text-lg font-semibold mb-4 text-[var(--p-primary-700)]">User Roles Distribution</h2>
        <div :class="{'animate-chart': isChartVisible, 'animation-delay-600': true}">
          <Chart type="doughnut" :data="userRoleData" :options="doughnutOptions" class="h-80" />
        </div>
      </div>
      
      <!-- User Activity Timeline -->
      <div class="bg-white p-4 rounded-lg shadow-sm chart-container border border-[var(--p-surface-200)]">
        <h2 class="text-lg font-semibold mb-4 text-[var(--p-primary-700)]">User Activity Timeline</h2>
        <div :class="{'animate-chart': isChartVisible, 'animation-delay-900': true}">
          <Chart type="line" :data="userTimelineData" :options="trendOptions" class="h-80" />
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

// Dropdown year options
const selectedYear = ref(2023);
const years = [2021, 2022, 2023, 2024];

// User statistics data
const userStats = ref({
  total: 368,
  active: 312,
  inactive: 56,
  newUsers: 42
});

// User roles data
const roles = ['Residents', 'Management Admin', 'System Admin'];
const roleColors = ['#A7C5FF', '#FFB7B7', '#B4F0B4'];

const userRoleData = computed(() => ({
  labels: roles,
  datasets: [
    {
      data: [285, 68, 15],
      backgroundColor: roleColors,
      hoverBackgroundColor: roleColors.map(color => color),
      borderWidth: 1,
      borderColor: '#fff'
    }
  ]
}));

// Monthly user growth data
const monthlyUserGrowth = {
  2023: [285, 298, 310, 325, 336, 342, 348, 352, 356, 360, 365, 368]
};

// User growth line chart data
const userGrowthData = computed(() => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Total Users',
      data: monthlyUserGrowth[selectedYear.value] || monthlyUserGrowth[2023],
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

// User activity data
const monthlyUserActivity = {
  2023: {
    newUsers: [15, 16, 18, 21, 14, 12, 10, 8, 9, 8, 12, 14],
    activeUsers: [240, 245, 252, 260, 265, 270, 275, 280, 285, 290, 298, 312]
  }
};

const userActivityData = computed(() => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'New Registrations',
      data: (monthlyUserActivity[selectedYear.value] || monthlyUserActivity[2023]).newUsers,
      backgroundColor: '#B4F0B4'
    },
    {
      label: 'Active Users',
      data: (monthlyUserActivity[selectedYear.value] || monthlyUserActivity[2023]).activeUsers,
      backgroundColor: '#A7C5FF'
    }
  ]
}));

// User activity timeline data - last 6 months
const userTimelineData = computed(() => ({
  labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Logins',
      data: [245, 258, 240, 265, 272, 285],
      fill: false,
      borderColor: '#FFB7B7',
      tension: 0.4,
      pointBackgroundColor: '#FFB7B7'
    },
    {
      label: 'Profile Updates',
      data: [65, 72, 58, 82, 78, 94],
      fill: false,
      borderColor: '#FFE5A8',
      tension: 0.4,
      pointBackgroundColor: '#FFE5A8',
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
      display: true,
      position: 'top',
      align: 'center',
      labels: {
        usePointStyle: true,
        padding: 15
      }
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
      position: 'top',
      align: 'center',
      labels: {
        usePointStyle: true,
        padding: 15
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
  console.log('Admin Dashboard mounted, fetching user data...');
  
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