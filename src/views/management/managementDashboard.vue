<template>
  <!-- If user hasn't accepted the agreement, show the agreement screen -->
  <div v-if="!isAgreementAccepted" class="min-h-screen bg-white p-4 sm:p-6 rounded-tl-3xl rounded-tr-3xl shadow-lg flex flex-col items-center justify-center content-scale-in">
    <div class="agreement-container w-full max-w-2xl animation-fade-in p-8 relative bg-white rounded-xl border border-[var(--p-primary-100)] shadow-sm">
      <div class="flex flex-col items-center text-center mb-6">
        <div class="agreement-icon-container mb-6">
          <i class="pi pi-shield text-4xl text-[var(--p-primary-600)]"></i>
        </div>
        <h2 class="text-2xl font-bold text-[var(--p-primary-700)] mb-4">Management Verification</h2>
        <p class="text-gray-600 mb-6">
          Before gaining access to the management dashboard, you must verify your account by accepting the management code of conduct and responsibilities.
        </p>
      </div>
      
      <div class="bg-[var(--p-primary-50)] p-4 rounded-lg mb-6 text-left max-h-[300px] overflow-y-auto">
        <h3 class="font-semibold text-[var(--p-primary-700)] mb-3">Management Code of Conduct</h3>
        <div class="space-y-3 text-sm text-gray-700">
          <p>1. <strong>Confidentiality Agreement:</strong> I understand that all resident information, financial data, and internal communications are strictly confidential. I will not share this information with unauthorized parties.</p>
          <p>2. <strong>Data Privacy:</strong> I will adhere to all data protection regulations when handling resident personal data and ensure compliance with relevant privacy laws.</p>
          <p>3. <strong>Ethical Conduct:</strong> I will perform my duties with integrity and transparency, avoiding any conflicts of interest or actions that may compromise the trust placed in me.</p>
          <p>4. <strong>Professional Responsibility:</strong> I will respond to resident inquiries and complaints in a timely and professional manner, treating all residents with respect and fairness.</p>
          <p>5. <strong>Financial Integrity:</strong> I will ensure accurate record-keeping of all financial transactions and maintain transparency in all financial matters of the residence.</p>
          <p>6. <strong>System Security:</strong> I will take reasonable precautions to secure my account and prevent unauthorized access to the management system.</p>
          <p>7. <strong>Regulatory Compliance:</strong> I will ensure that all actions taken under my authority comply with relevant housing laws and regulations.</p>
          <p>8. <strong>Continuous Improvement:</strong> I will participate in necessary training and updates to improve service quality for residents.</p>
        </div>
      </div>
      
      <div class="flex items-center text-left mb-6">
        <Checkbox v-model="agreementChecked" :binary="true" inputId="agreement" />
        <label for="agreement" class="ml-2 text-gray-700">I have read, understood, and agree to adhere to the above code of conduct in my role as a management staff member. I understand this is part of my account verification process.</label>
      </div>
      
      <div class="flex justify-center">
        <Button 
          label="Accept & Verify Account" 
          icon="pi pi-check" 
          @click="acceptAgreement" 
          :disabled="!agreementChecked"
          class="p-button-primary" />
      </div>
    </div>
  </div>

  <!-- Main dashboard content - only show when agreement is accepted -->
  <div v-else class="p-4 bg-[var(--p-primary-50)]">
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
import { ref, computed, onMounted, watch } from 'vue';
import Chart from 'primevue/chart';
import Dropdown from 'primevue/dropdown';
import ProgressBar from 'primevue/progressbar';
import StatsCard from '@/components/StatsCard.vue';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import { supabase } from '@/api/supabase';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const emit = defineEmits(['update:sidenavVisibility']);

// Agreement state
const isAgreementAccepted = ref(false);
const agreementChecked = ref(false);

// Chart animation control
const isChartVisible = ref(false);

// Dummy data
const selectedYear = ref(2023);
const years = [2021, 2022, 2023, 2024];

// Stats data
const totalResidents = ref(147);
const totalMaintenanceFees = ref(285750);

// Check if user has already accepted the agreement
onMounted(async () => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (authUser) {
      // Get user details
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('userID, isVerified')
        .eq('userID', authUser.id)
        .single();
      
      if (!userError && userData) {
        // For management users, isVerified indicates agreement acceptance
        isAgreementAccepted.value = userData.isVerified || false;
        
        // Emit event to show/hide sidenav based on verification status
        emit('update:sidenavVisibility', isAgreementAccepted.value);
      }
    }
    
    // Only initialize charts if agreement is accepted
    if (isAgreementAccepted.value) {
      initializeCharts();
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
});

// Watch for changes in agreement acceptance to update sidenav visibility
watch(isAgreementAccepted, (newValue) => {
  emit('update:sidenavVisibility', newValue);
});

// Function to accept agreement
const acceptAgreement = async () => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (authUser) {
      // Update user record to mark as verified (agreement accepted)
      const { error } = await supabase
        .from('User')
        .update({ isVerified: true })
        .eq('userID', authUser.id);
      
      if (error) throw error;
      
      // Update local state
      isAgreementAccepted.value = true;
      
      // Update sidenav visibility
      emit('update:sidenavVisibility', true);
      
      // Initialize charts after a short delay
      setTimeout(() => {
        initializeCharts();
      }, 300);
    }
  } catch (error) {
    console.error('Error updating agreement status:', error);
  }
};

// Initialize charts with animation
const initializeCharts = () => {
  console.log('Dashboard mounted, fetching data...');
  
  // Add a small delay before showing charts to ensure DOM is ready
  setTimeout(() => {
    isChartVisible.value = true;
  }, 300);
};

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

/* Agreement styles */
.agreement-container {
  max-width: 800px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}

.agreement-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(77, 91, 191, 0.1);
}

.agreement-icon-container::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(77, 91, 191, 0.05);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  
  50% {
    transform: scale(1.05);
    opacity: 0.3;
  }
  
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
}

.animation-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.content-scale-in {
  animation: content-scale 0.5s ease-out forwards;
  transform-origin: top center;
}

@keyframes content-scale {
  0% {
    opacity: 0;
    transform: scaleY(0.97);
  }
  100% {
    opacity: 1;
    transform: scaleY(1);
  }
}
</style>