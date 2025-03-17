<template>
  <div class="min-h-screen bg-primary-500">
    <!-- Header Section -->
    <div class="flex items-center mb-6 pt-6 px-4">
      <Avatar 
        :image="user.avatar" 
        class="mr-4" 
        size="large" 
        shape="circle"
        :style="{ 
          objectFit: 'cover',
          width: '48px',
          height: '48px'
        }"
      />
      <div>
        <h2 class="text-lg font-semibold text-white">{{ user.name }}</h2>
        <p class="text-sm text-gray-200">{{ user.residence }}</p>
      </div>
      <Button icon="pi pi-cog" class="ml-auto p-button-text p-button-rounded text-white" />
    </div>

    <!-- Content Section -->
    <div class="min-h-screen bg-white p-4 sm:p-6 rounded-tl-3xl rounded-tr-3xl shadow-lg">
      <!-- Upcoming Payment Section -->
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-base sm:text-lg font-semibold text-primary">Upcoming Payment</h3>
        <div label="View All" link class="text-primary-500 text-xs sm:text-sm flex items-center group gap-1">
          View All
          <i class="pi pi-chevron-right sm:text-xs transition-transform group-hover:translate-x-0.5" style="font-size: 14px"></i>
        </div>
      </div>
      <Card class="mb-6">
        <template #content>
          <div class="flex flex-col gap-2">
            <div class="flex justify-between items-start sm:items-center w-full flex-wrap sm:flex-nowrap">
              <h4 class="text-sm sm:text-base text-[#FBF9FE] font-semibold sm:mb-0 tracking-wide">{{ upcomingPayment.title }}</h4>
              <div class="px-3 sm:px-4 py-0.5 rounded-full bg-[#7AA1DD] text-white text-[10px] sm:text-xs flex items-center gap-2 sm:gap-2">
                <i class="pi pi-clock" style="font-size: 10px"></i>
                {{ upcomingPayment.dueIn }}
              </div>
            </div>
            <div class="flex justify-between items-end w-full">
              <p class="text-xs sm:text-sm text-surface-200 max-w-[60%] line-clamp-3 tracking-normal">{{ upcomingPayment.description }}</p>
              <p class="text-xl text-primary-50 sm:text-xl font-medium tracking-wide">{{ upcomingPayment.amount }}</p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Quick Actions Section -->
      <div class="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        <div v-for="action in quickActions" :key="action.title" 
             class="flex flex-col items-center gap-1 sm:gap-2">
          <Button 
            :icon="action.icon"
            class="p-button-rounded p-button-outlined quick-action-btn shadow-[0_1px_12px_0_rgba(0,0,0,0.1)]"
            aria-label="Quick Action" />
          <p class="text-xs sm:text-sm font-medium text-primary text-center">{{ action.title }}</p>
        </div>
      </div>

      <!-- Announcements Section -->
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-base sm:text-lg font-semibold text-primary">Announcements</h3>
        <div label="View All" link class="text-primary-500 text-xs sm:text-sm flex items-center group gap-1">
          View All
          <i class="pi pi-chevron-right sm:text-xs transition-transform group-hover:translate-x-0.5" style="font-size: 14px"></i>
        </div>
      </div>
      <Card class="mb-6">
        <template #content>
          <div v-for="announcement in announcements" :key="announcement.title" class="space-y-1 sm:space-y-2">
            <h4 class="text-sm sm:text-base text-blue-600 font-semibold">{{ announcement.title }}</h4>
            <p class="text-xs sm:text-sm text-gray-600">By {{ announcement.author }}</p>
            <p class="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">{{ announcement.description }}</p>
          </div>
        </template>
      </Card>

      <!-- Complaints Archive Section -->
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-base sm:text-lg font-semibold text-primary">Complaints Archive</h3>
        <div label="View All" link class="text-primary-500 text-xs sm:text-sm flex items-center group gap-1">
          View All
          <i class="pi pi-chevron-right sm:text-xs transition-transform group-hover:translate-x-0.5" style="font-size: 14px"></i>
        </div>
      </div>
      <Card>
        <template #content>
          <div v-for="complaint in complaints" :key="complaint.id" class="mb-4 last:mb-0">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-semibold">{{ complaint.id }}</h4>
                <p class="text-sm text-gray-700">{{ complaint.title }}</p>
                <p class="text-sm text-gray-500">{{ complaint.description }}</p>
                <p class="text-xs text-gray-400 mt-1">Submitted on {{ complaint.submittedOn }}</p>
              </div>
              <Tag :value="complaint.status" severity="info" />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Card from 'primevue/card'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'
import userAvatar from '@/assets/user-avatar.jpg' // Add this import

const user = ref({
  name: 'Lucas Lim Weng Kit',
  residence: 'Victoria Heights Residence',
  avatar: userAvatar  // Update this line
})

const quickActions = ref([
  { title: 'Finance', icon: 'pi pi-dollar' },
  { title: 'Complaint', icon: 'pi pi-comments' },
  { title: 'Message', icon: 'pi pi-envelope' }
])

const upcomingPayment = ref({
  title: 'November Maintenance Fee',
  description: 'Monthly scheduled fee for residential maintenance purposes',
  dueIn: '6 days',
  amount: 'RM 350.50'
})

const announcements = ref([
  {
    title: 'Victoria Community Meet Up',
    author: 'Ng Lee Hooi (Admin)',
    description: 'All residents of Victoria Heights are cordially invited to our 3rd community meet up on the 2nd of December, 8:00 PM at the Community Hall (Level 3)'
  }
])

const complaints = ref([
  {
    id: 'WR004-ABCG-210424',
    title: 'Water leak on 4th floor',
    description: 'The water pipe is leaking causing the floor to be extremely wet....',
    status: 'In-review',
    submittedOn: '29/11/24 at 2:56 PM'
  },
  {
    id: 'WR004-ABCG-210424',
    title: 'Water leak on 4th floor',
    description: 'The water pipe is leaking causing the floor to be extremely wet....',
    status: 'In-review',
    submittedOn: '29/11/24 at 2:56 PM'
  }
])
</script>

<style scoped>
.bg-primary {
  background-color: #4D5BBF;
}

:deep(.p-card) {
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background-color: #4D5BBF;
}

:deep(.p-button.p-button-text) {
  color: inherit;
}

:deep(.p-badge) {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

:deep(.p-tag) {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Quick Actions specific styles */
:deep(.p-card.text-center .pi) {
  color: white;
}

:deep(.p-card.text-center p) {
  color: white;
}

.rounded-tl-3xl {
  border-top-left-radius: 26px;
}

.rounded-tr-3xl {
  border-top-right-radius: 26px;
}

:deep(.p-avatar.p-avatar-circle img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.p-avatar.p-avatar-lg) {
  width: 48px;
  height: 48px;
}

:deep(.quick-action-btn) {
  width: 48px !important;
  height: 48px !important;
  @screen sm {
    width: 64px !important;
    height: 64px !important;
  }
  background: white !important;
  border: 2px solid #4D5BBF !important;
}

:deep(.quick-action-btn .pi) {
  font-size: 1.25rem;
  @screen sm {
    font-size: 1.5rem;
  }
  color: #4D5BBF !important;
}

:deep(.quick-action-btn:hover) {
  background: rgba(77, 91, 191, 0.04) !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.text-primary {
  color: #4D5BBF;
}

@media (max-width: 640px) {
  .rounded-tl-3xl {
    border-top-left-radius: 20px;
  }

  .rounded-tr-3xl {
    border-top-right-radius: 20px;
  }

  :deep(.p-card) {
    border-radius: 12px;
  }
}
</style>