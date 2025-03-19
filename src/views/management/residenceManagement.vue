<template>
  <Toast position="top-right" />
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-[#4D5BBF]">Residence Management</h1>
      <p class="text-gray-600 mt-2">View and manage residence information</p>
    </div>

    <!-- Residence Info Card -->
    <div v-if="residence" class="space-y-6">
      <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div class="flex items-start gap-6">
          <div class="w-72 h-48 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              :src="residence.displayPhotoUrl" 
              alt="Residence photo"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-semibold text-gray-900">{{ residence.residenceName }}</h3>
                <Button
                label="Edit Details"
                icon="pi pi-pencil"
                text
                class="!text-primary-600"
                size="small"
                />
            </div>
            <div class="mt-2 space-y-2">
              <div class="flex items-center text-sm text-gray-600">
                <i class="pi pi-map-marker mr-2"></i>
                {{ residence.residenceAddress }}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="pi pi-building mr-2"></i>
                {{ residence.residenceTotalUnit || 0 }} Total Units
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="pi pi-users mr-2"></i>
                {{ residence.residenceTotalResident || 0 }} Residents
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Section -->
      <div class="border border-gray-200 rounded-lg bg-white overflow-hidden shadow">
        <div class="border-b border-gray-200 flex justify-between items-center">
          <SelectButton v-model="activeSection" :options="sections" class="m-4" />
          <div class="flex gap-2 mr-4">
            <Button
              label="Edit Details"
              icon="pi pi-pencil"
              text
              class="!text-primary-600"
              size="small"
            />
          </div>
        </div>

        <div class="p-6">
          <div class="transition-wrapper">
            <TransitionGroup name="fade-slide">
              <!-- Overview Section -->
              <div v-if="activeSection === 'Overview'" :key="'overview'" class="w-full">
                <div class="grid grid-cols-3 gap-6">
                  <StatsCard
                    title="Total Units"
                    :count="residence.residenceTotalUnit || 0"
                    bgColor="bg-violet-50"
                    textColor="text-violet-900"
                    iconClass="pi pi-building"
                    iconColor="text-violet-500"
                  />
                  <StatsCard
                    title="Occupied Units"
                    :count="residence.residenceTotalOccupiedUnits || 0"
                    bgColor="bg-emerald-50"
                    textColor="text-emerald-900"
                    iconClass="pi pi-check-circle"
                    iconColor="text-emerald-500"
                  />
                  <StatsCard
                    title="Total Residents"
                    :count="residence.residenceTotalResident || 0"
                    bgColor="bg-blue-50"
                    textColor="text-blue-900"
                    iconClass="pi pi-users"
                    iconColor="text-blue-500"
                  />
                </div>
              </div>

              <!-- Units Section -->
              <div v-if="activeSection === 'Units'" :key="'units'" class="w-full">
                <div class="space-y-4">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium text-gray-900">Unit Occupancy</h3>
                    <Button
                      label="Add Unit"
                      icon="pi pi-plus"
                      size="small"
                      class="p-button-outlined"
                    />
                  </div>

                  <div class="grid grid-cols-4 gap-4">
                    <div v-for="unit in residenceUnits" 
                      :key="unit.userID"
                      class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-lg font-semibold text-gray-900">Unit {{ unit.unitNumber }}</span>
                        <span :class="{
                          'px-2 py-1 text-xs rounded-full': true,
                          'bg-green-100 text-green-800': unit.isVerified,
                          'bg-yellow-100 text-yellow-800': !unit.isVerified
                        }">
                          {{ unit.isVerified ? 'Verified' : 'Pending' }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-600">{{ unit.fullName }}</p>
                    </div>
                  </div>

                  <!-- Empty state -->
                  <div v-if="residenceUnits.length === 0" class="text-center py-8">
                    <div class="text-gray-400">No units assigned yet</div>
                  </div>
                </div>
              </div>

            </TransitionGroup>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from 'vue'
import { supabase } from '@/api/supabase'
import { useAuthStore } from '@/stores/auth'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import { TransitionGroup } from 'vue'
import StatsCard from '@/components/StatsCard.vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const toast = useToast()
const residence = ref(null)
const activeSection = ref('Overview')
const sections = ['Overview', 'Units']
const router = useRouter()
const residenceUnits = ref([])

const fetchResidenceUnits = async (residenceID) => {
  try {
    const { data, error } = await supabase
      .from('User')
      .select(`
        userID,
        fullName,
        unitNumber,
        isVerified
      `)
      .eq('residenceID', residenceID)
      .not('unitNumber', 'is', null)
      .order('unitNumber')

    if (error) throw error
    residenceUnits.value = data || []
  } catch (error) {
    console.error('Error fetching residence units:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch residence units',
      life: 3000
    })
  }
}

const fetchResidence = async () => {
  residence.value = null // Reset the residence data before fetching
  try {
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('residenceID')
      .eq('userID', authStore.user.id)
      .single()

    if (userError) throw userError
    if (!userData?.residenceID) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No residence assigned to current user',
        life: 3000
      })
      return
    }

    const { data: residenceData, error: residenceError } = await supabase
      .from('Residence')
      .select(`
        *,
        residenceTotalUnit,
        residenceTotalResident,
        residenceTotalOccupiedUnits
      `)
      .eq('residenceID', userData.residenceID)
      .single()

    if (residenceError) throw residenceError
    residence.value = residenceData
    
    await fetchResidenceUnits(userData.residenceID)

  } catch (error) {
    console.error('Error fetching residence:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch residence details',
      life: 3000
    })
  }
}

// Add a router beforeRouteEnter guard using the router
router.beforeResolve((to, from, next) => {
  if (to.name === 'residenceManagement') {
    fetchResidence()
  }
  next()
})

// Keep the onMounted hook as a backup
onMounted(() => {
  fetchResidence()
})
</script>

<style scoped>
.transition-wrapper {
  position: relative;
  min-height: 200px;
}

.fade-slide-move,
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-active {
  position: absolute;
  width: 100%;
}
</style>