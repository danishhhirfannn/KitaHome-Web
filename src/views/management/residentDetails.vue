<template>
  <Toast />
  <div class="p-8">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-[#4D5BBF]">Resident Details</h1>
        <p class="text-gray-600 mt-2">View and manage resident information</p>
      </div>
      <Button
        icon="pi pi-arrow-left"
        label="Back to Residents"
        text
        @click="router.back()"
      />
    </div>

    <div v-if="user" class="space-y-6">
      <div class="flex flex-row gap-6">

        <!-- User Basic Info with Roles & Status -->
      <div class="bg-white rounded-lg shadow border border-gray-200 p-6 w-full">
        <div class="flex items-start gap-6">
          <!-- Left side - Avatar -->
          <div class="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-4xl font-semibold">
            {{ user.fullName?.charAt(0).toUpperCase() }}
          </div>

          <!-- Middle - User Info -->
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-900">{{ user.fullName }}</h3>
            <div class="mt-2 space-y-1">
              <div class="flex items-center text-sm text-gray-600">
                <i class="pi pi-envelope mr-2"></i>
                {{ user.email }}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="pi pi-phone mr-2"></i>
                {{ user.phone || 'No phone number' }}
              </div>
            </div>
          </div>

          <!-- Right side - Roles & Status -->
          <div class="flex flex-col items-end gap-2">
            <div class="flex gap-2">
              <span v-if="user.isAdmin" 
                class="px-3 py-1 text-xs rounded-full bg-pink-100 text-pink-700 font-medium">
                Admin
              </span>
              <span v-if="user.isManagement" 
                class="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-medium">
                Management
              </span>
              <span v-if="user.isResident" 
                class="px-3 py-1 text-xs rounded-full bg-primary-100 text-primary-700 font-medium">
                Resident
              </span>
            </div>
            <span :class="{
              'px-3 py-1 text-xs rounded-full font-medium': true,
              'bg-green-100 text-green-800': user.isVerified,
              'bg-red-100 text-red-800': user.isDeclined,
              'bg-yellow-100 text-yellow-800': !user.isVerified && !user.isDeclined
            }">
              {{ user.isVerified ? 'Verified' : user.isDeclined ? 'Declined' : 'Pending' }}
            </span>
          </div>
        </div>
      </div>
        <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <div v-if="user.Residence?.displayPhotoUrl" 
                class="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                <img 
                  :src="user.Residence.displayPhotoUrl" 
                  alt="Residence photo"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex-1">
                <div class="text-md text-surface-900 font-medium">
                  {{ user.Residence?.residenceName || 'Not assigned' }}
                </div>
                <div class="text-sm text-surface-500">
                  {{ user.unitNumber || 'Not assigned' }}
                </div>
                <div class="text-xs text-surface-500 mt-1">
                  {{ user.Residence?.residenceAddress }}
                </div>
              </div>
            </div>
        </div>
      </div>

      </div>

      <!-- Tabs for different sections -->
      <div class="border border-gray-200 rounded-lg bg-white overflow-hidden shadow">
        <div class="border-b border-gray-200 flex justify-between items-center">
          <SelectButton v-model="activeSection" :options="sections" class="m-4" />
          <div>
            <Button
            label="Chat"
            icon="pi pi-comments"
            text
            class=""
            size="small" />

            <Button
            label="Disable User"
            icon="pi pi-ban"
            severity="danger"
            text
            class="!text-red-600 hover:!bg-red-50 mr-4"
            size="small" />
          </div>
        </div>

        <!-- Replace the existing content div with this -->
        <div class="p-6">
          <div class="transition-wrapper">
            <TransitionGroup name="fade-slide">
              <!-- Identity Section -->
              <div v-if="activeSection === 'Identity'" :key="'identity'" class="w-full">
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <h4 class="text-lg font-semibold text-gray-900">Identity Verification</h4>
                    <div v-if="user.identification_url && !user.isVerified && !user.isDeclined" class="flex gap-2">
                      <Button
                        label="Accept"
                        icon="pi pi-check"
                        severity="success"
                        text
                        size="small"
                        @click="updateVerificationStatus('accept')"
                      />
                      <Button
                        label="Decline"
                        icon="pi pi-times"
                        severity="danger"
                        text
                        size="small"
                        @click="handleDeclineClick"
                      />
                    </div>
                  </div>
                  <div v-if="user.identification_url" class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <i class="pi pi-id-card text-primary-500"></i>
                        <a 
                          href="#" 
                          class="text-sm font-medium text-primary-600 hover:text-primary-700"
                          @click.prevent="viewDocument(user.identification_url)"
                        >
                          View Identification Document
                        </a>
                      </div>
                      <Button
                        icon="pi pi-external-link"
                        text
                        @click="viewDocument(user.identification_url)"
                        class="!text-primary-600"
                      />
                    </div>
                  </div>
                  <div v-else class="flex items-center gap-2 text-gray-400 p-4 border border-gray-200 rounded-lg">
                    <i class="pi pi-file"></i>
                    <span>No ID Submitted</span>
                  </div>
                </div>
              </div>

              <!-- Finance Section -->
              <div v-if="activeSection === 'Finance'" :key="'finance'" class="w-full">
                <div class="space-y-4">
                  <h4 class="text-lg font-semibold text-gray-900">Financial Information</h4>
                  <div class="space-y-6">
                    <div>
                      <h5 class="text-sm font-medium text-gray-500 mb-3">Transaction History</h5>
                      <ul class="space-y-3">
                        <li v-for="(transaction, index) in [
                          { date: 'Mar 1, 2024', type: 'March Maintenance Fee', amount: 250.00, status: 'paid' },
                          { date: 'Feb 1, 2024', type: 'February Maintenance Fee', amount: 250.00, status: 'paid' },
                          { date: 'Jan 1, 2024', type: 'January Maintenance Fee', amount: 250.00, status: 'paid' },
                          { date: 'Dec 1, 2023', type: 'December Maintenance Fee', amount: 250.00, status: 'paid' },
                          { date: 'Nov 1, 2023', type: 'November Maintenance Fee', amount: 250.00, status: 'paid' }
                        ]" :key="index"
                          class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                        >
                          <div class="flex items-start gap-3">
                            <div class="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                              <i class="pi pi-wallet text-primary-500 text-sm"></i>
                            </div>
                            <div>
                              <p class="text-sm font-medium text-gray-900">{{ transaction.type }}</p>
                              <p class="text-xs text-gray-500">{{ transaction.date }}</p>
                            </div>
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="text-base font-semibold text-green-600">RM {{ transaction.amount.toFixed(2) }}</span>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Complaints Section -->
              <div v-if="activeSection === 'Complaints'" :key="'complaints'" class="w-full">
                <div class="space-y-4">
                  <h4 class="text-lg font-semibold text-gray-900">Complaint History</h4>
                  <ul class="space-y-3">
                    <li v-for="complaint in [
                      {
                        complainID: 'CMP001',
                        complainDescription: 'Persistent noise disturbance from unit above (A-15-02) during late hours between 11 PM to 2 AM. The disturbances include heavy furniture dragging, loud footsteps, and excessive music volume that reverberates through the ceiling. This has been occurring consistently for the past week, significantly impacting the sleep quality and daily routines of all household members. Multiple attempts to communicate with the upstairs neighbors have been unsuccessful.',
                        complainStatus: 'Resolved',
                        complainSeverity: 'High',
                        complainSentimentScore: -0.8,
                        complainMagnitude: 0.9,
                        complainCreatedAt: '2024-03-15T08:30:00'
                      },
                      {
                        complainID: 'CMP002',
                        complainDescription: 'Severe water leakage detected in the master bedroom ceiling, specifically near the air-conditioning unit and extending towards the window area. The leak has caused visible water stains, paint bubbling, and concerning moisture damage to the ceiling structure. During heavy rainfall, water actively drips onto the bed and carpet area, creating potential safety hazards and promoting mold growth. Emergency temporary fixes have been ineffective.',
                        complainStatus: 'In Progress',
                        complainSeverity: 'Medium',
                        complainSentimentScore: -0.6,
                        complainMagnitude: 0.7,
                        complainCreatedAt: '2024-03-10T14:15:00'
                      }
                    ]" :key="complaint.complainID" 
                      class="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div class="flex justify-between items-start">
                        <div class="flex items-start gap-3">
                          <div class="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                            <i class="pi pi-exclamation-circle text-red-500 text-sm"></i>
                          </div>
                          <div class="flex-1">
                            <span class="text-md font-medium text-gray-900">{{ complaint.complainID }}</span>
                            <p class="text-sm text-gray-700 mt-1">{{ complaint.complainDescription }}</p>
                            <div class="flex items-center gap-4 mt-2">
                              <div class="flex items-center gap-2">
                                <span class="text-xs text-gray-500">Sentiment:</span>
                                <span :class="{
                                  'text-xs font-medium': true,
                                  'text-red-600': complaint.complainSentimentScore < -0.5,
                                  'text-orange-600': complaint.complainSentimentScore >= -0.5 && complaint.complainSentimentScore < 0,
                                  'text-green-600': complaint.complainSentimentScore >= 0
                                }">{{ complaint.complainSentimentScore.toFixed(2) }}</span>
                              </div>
                              <div class="flex items-center gap-2">
                                <span class="text-xs text-gray-500">Magnitude:</span>
                                <span class="text-xs font-medium text-primary-600">{{ complaint.complainMagnitude.toFixed(2) }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="flex flex-col items-end gap-2">
                          <div class="flex flex-row gap-2 whitespace-nowrap">
                            <span :class="{
                              'px-2 py-1 text-xs rounded-full font-medium inline-block': true,
                              'bg-green-100 text-green-700': complaint.complainStatus === 'Resolved',
                              'bg-yellow-100 text-yellow-700': complaint.complainStatus === 'In Progress',
                              'bg-gray-100 text-gray-700': complaint.complainStatus === 'Pending'
                            }">{{ complaint.complainStatus }}</span>
                            <span :class="{
                              'px-2 py-1 text-xs rounded-full font-medium inline-block': true,
                              'bg-red-100 text-red-700': complaint.complainSeverity === 'High',
                              'bg-orange-100 text-orange-700': complaint.complainSeverity === 'Medium',
                              'bg-blue-100 text-blue-700': complaint.complainSeverity === 'Low'
                            }">{{ complaint.complainSeverity }}</span>
                          </div>
                          <div class="flex flex-col items-end text-xs text-gray-500">
                            <span>
                              {{ new Date(complaint.complainCreatedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) }}
                            </span>
                            <span>
                              {{ new Date(complaint.complainCreatedAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add the decline dialog -->
  <Dialog
    v-model:visible="showDeclineDialog"
    modal
    header="Decline Reason"
    :style="{ width: '30rem' }"
    :closable="false"
  >
    <div class="flex flex-col gap-4">
      <p class="text-gray-600">Please provide a reason for declining this user's verification.</p>
      <Textarea
        v-model="declineReason"
        rows="3"
        placeholder="Enter decline reason..."
        class="w-full"
        autoResize
      />
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="showDeclineDialog = false"
          text
        />
        <Button
          label="Confirm"
          icon="pi pi-check"
          @click="confirmDecline"
          severity="danger"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import Toast from 'primevue/toast'
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/api/supabase'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { TransitionGroup } from 'vue'

const router = useRouter()
const route = useRoute()
const user = ref(null)
const showDeclineDialog = ref(false)
const declineReason = ref('')
const toast = useToast()

const fetchUserDetails = async () => {
  try {
    const { data, error } = await supabase
      .from('User')
      .select(`
        *,
        Residence!inner (
          residenceName,
          displayPhotoUrl,
          residenceAddress
        )
      `)
      .eq('userID', route.params.id)
      .single()

    if (error) throw error
    user.value = data
    
    // Log the response to help with debugging
    console.log('User data:', data)
  } catch (error) {
    console.error('Error fetching user details:', error.message)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to fetch user details: ${error.message}`,
      life: 3000
    })
  }
}

const activeSection = ref('Identity')
const sections = ['Identity', 'Finance', 'Complaints']

const viewDocument = (url) => {
  window.open(url, '_blank')
}

const updateVerificationStatus = async (action, reason = '') => {
  try {
    const updates = {
      isVerified: action === 'accept',
      isDeclined: action === 'decline',
      declineReason: action === 'decline' ? reason : null
    }

    const { error } = await supabase
      .from('User')
      .update(updates)
      .eq('userID', user.value.userID)

    if (error) throw error

    // Update local state
    user.value = {
      ...user.value,
      ...updates
    }

    // Show success toast
    toast.add({
      severity: action === 'accept' ? 'success' : 'info',
      summary: action === 'accept' ? 'User Verified' : 'User Declined',
      detail: `${user.value.fullName}'s verification has been ${action}ed.`,
      life: 3000
    })

    showDeclineDialog.value = false
    declineReason.value = ''

  } catch (error) {
    console.error('Error updating verification status:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update verification status.',
      life: 3000
    })
  }
}

const handleDeclineClick = () => {
  declineReason.value = ''
  showDeclineDialog.value = true
}

const confirmDecline = async () => {
  if (!declineReason.value.trim()) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Please provide a reason for declining',
      life: 3000
    })
    return
  }
  await updateVerificationStatus('decline', declineReason.value)
}

onMounted(() => {
  fetchUserDetails()
})
</script>

<style>
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