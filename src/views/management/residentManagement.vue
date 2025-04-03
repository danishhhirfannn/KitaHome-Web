<template>
  <Toast position="top-right" />
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-[#4D5BBF]">Resident Management</h1>
      <p class="text-gray-600 mt-2">Manage all your residents and their verification status</p>
    </div>

    <div class="card bg-white rounded-lg shadow border border-gray-200">
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-[#4D5BBF]">User Profiles</h2>
        <div class="flex space-x-2">
          <span class="p-input-icon-left relative" style="min-width: 250px;">
            <InputText 
              v-model="filters.global.value" 
              placeholder="Search users..." 
              class="p-inputtext-sm border-primary-200 focus:border-primary-500 w-full pl-10" 
            />
          </span>
        </div>
      </div>
      
      <DataTable
        :value="users"
        :paginator="true"
        :rows="5"
        :loading="loading"
        v-model:filters="filters"
        filterDisplay="menu"
        responsiveLayout="scroll"
        class="p-datatable-lg border-t border-gray-200"
      >
        <Column field="fullName" header="Name" sortable>
          <template #body="{ data }">
            <div class="flex items-center gap-4">
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                {{ data.fullName.charAt(0).toUpperCase() }}
              </div>
              {{ data.fullName }}
            </div>
          </template>
        </Column>
        <Column field="email" header="Email" sortable></Column>
        <Column field="phone" header="Phone"></Column>
        <Column field="Residence.residenceName" header="Residence" sortable>
          <template #body="{ data }">
            {{ data.Residence?.residenceName || 'Not assigned' }}
          </template>
        </Column>
        <Column field="unitNumber" header="Unit"></Column>
        <Column header="Roles">
          <template #body="slotProps">
            <div class="flex gap-2">
              <span v-if="slotProps.data.isAdmin" 
                class="px-2 py-1 text-xs rounded-full bg-pink-100 text-pink-700 w-full inline-flex justify-center items-center">
                Admin
              </span>
              <span v-if="slotProps.data.isManagement" 
                class="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 w-full inline-flex justify-center items-center">
                Management
              </span>
              <span v-if="slotProps.data.isResident" 
                class="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-700 w-full inline-flex justify-center items-center">
                Resident
              </span>
            </div>
          </template>
        </Column>
        <Column header="Status">
          <template #body="slotProps">
            <span :class="{
              'px-2 py-1 text-xs rounded-full': true,
              'bg-green-100 text-green-800 w-full inline-flex justify-center items-center': slotProps.data.isVerified,
              'bg-red-100 text-red-800 w-full inline-flex justify-center items-center': slotProps.data.isDeclined,
              'bg-yellow-100 text-yellow-800 w-full inline-flex justify-center items-center': !slotProps.data.isVerified && !slotProps.data.isDeclined
            }">
              {{ slotProps.data.isVerified ? 'Verified' : slotProps.data.isDeclined ? 'Declined' : 'Pending' }}
            </span>
          </template>
        </Column>
        <Column header="Actions">
          <template #body="slotProps">
            <div class="flex justify-center">
              <Button 
                icon="pi pi-eye" 
                class="p-button-rounded p-button-text p-button-sm text-primary-600"
                @click="viewDetails(slotProps.data)"
                tooltip="View Details"
                tooltipOptions="top"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <Dialog 
    v-model:visible="showDialog"
    modal
    :style="{ width: '50vw' }"
    :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
    header="User Details"
    class="user-details-dialog"
    :draggable="false"
    :closeOnEscape="true"
    :dismissableMask="true"
  >
    <div v-if="selectedUser" class="space-y-6">
      <!-- User Basic Info with Roles & Status -->
      <div class="flex items-start gap-6">
        <!-- Left side - Avatar -->
        <div class="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-4xl font-semibold">
          {{ selectedUser.fullName?.charAt(0).toUpperCase() }}
        </div>

        <!-- Middle - User Info -->
        <div class="flex-1">
          <h3 class="text-xl font-semibold text-gray-900">{{ selectedUser.fullName }}</h3>
          <div class="mt-2 space-y-1">
            <div class="flex items-center text-sm text-gray-600">
              <i class="pi pi-envelope mr-2"></i>
              {{ selectedUser.email }}
            </div>
            <div class="flex items-center text-sm text-gray-600">
              <i class="pi pi-phone mr-2"></i>
              {{ selectedUser.phone || 'No phone number' }}
            </div>
          </div>
        </div>

        <!-- Right side - Roles & Status -->
        <div class="flex flex-col items-end">
          <!-- Roles and Status -->
          <div class="flex gap-2">
            <!-- Roles -->
            <div class="flex flex-col gap-1">
              <span v-if="selectedUser.isAdmin" 
                class="px-3 py-1 text-xs rounded-full bg-pink-100 text-pink-700 font-medium inline-flex items-center justify-center w-full">
                Admin
              </span>
              <span v-if="selectedUser.isManagement" 
                class="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-medium inline-flex items-center justify-center w-full">
                Management
              </span>
              <span v-if="selectedUser.isResident" 
                class="px-3 py-1 text-xs rounded-full bg-primary-100 text-primary-700 font-medium inline-flex items-center justify-center w-full">
                Resident
              </span>
            </div>
            <!-- Status -->
            <div class="flex flex-col justify-start">
              <span :class="{
                'px-3 py-1 text-xs rounded-full inline-flex items-center justify-center w-full font-medium': true,
                'bg-green-100 text-green-800': selectedUser.isVerified,
                'bg-red-100 text-red-800': selectedUser.isDeclined,
                'bg-yellow-100 text-yellow-800': !selectedUser.isVerified && !selectedUser.isDeclined
              }">
                {{ selectedUser.isVerified ? 'Verified' : selectedUser.isDeclined ? 'Declined' : 'Pending' }}
              </span>
            </div> 
          </div>
          <!-- Additional User Info -->
          <div class="pt-4 w-full">
            <div class="flex items-center gap-3 mb-2">
              <div v-if="selectedUser.Residence?.displayPhotoUrl" 
                class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                <img 
                  :src="selectedUser.Residence.displayPhotoUrl" 
                  alt="Residence photo"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex-1">
                <div class="text-sm text-surface-900 font-medium">
                  {{ selectedUser.Residence?.residenceName || 'Not assigned' }}
                </div>
                <div class="text-sm text-surface-500">
                  {{ selectedUser.unitNumber || 'Not assigned' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center mb-4">
        <SelectButton v-model="value" :options="options" size="small"/>
        <Button 
          label="Disable User"
          icon="pi pi-ban"
          severity="danger"
          text
          class="!text-red-600 hover:!bg-red-50"
          size="small"
        />
      </div>

      <div class="transition-wrapper">
        <TransitionGroup name="fade-slide">
          <!-- Identity Section -->
          <div v-if="value === 'Identity'" :key="'identity'" class="border border-gray-200 p-4 rounded-2xl w-full">
            <h4 class="text-lg font-semibold text-gray-900">Personal Information</h4>
            <div class="space-y-4">
              <div>
                <p class="text-sm font-medium text-gray-500">Verification Documents</p>
                <ul class="mt-2 space-y-2">
                  <li v-if="selectedUser.identification_url" class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <i class="pi pi-file text-primary-500"></i>
                      <a :href="selectedUser.identification_url" 
                         target="_blank"
                         class="text-primary-600 hover:text-primary-700">
                        Identification Document
                      </a>
                    </div>
                    <div class="flex gap-2">
                      <Button 
                        label="Accept"
                        icon="pi pi-check"
                        size="small"
                        class="!bg-transparent !border-none !shadow-none hover:!bg-green-50 !text-green-600"
                        @click="updateVerificationStatus('accept', selectedUser.userID)"
                      />
                      <Button 
                        label="Decline"
                        icon="pi pi-times"
                        size="small"
                        class="!bg-transparent !border-none !shadow-none hover:!bg-red-50 !text-red-600"
                        @click="handleDeclineClick"
                      />
                    </div>
                  </li>
                  <li v-else class="flex items-center gap-2 text-gray-400">
                    <i class="pi pi-file"></i>
                    <span>No ID Submitted</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Finance Section -->
          <div v-if="value === 'Finance'" :key="'finance'" class="border border-gray-200 p-4 rounded-2xl w-full">
            <h4 class="text-lg font-semibold text-gray-900">Financial Information</h4>
            <div class="space-y-6">
              <!-- Transaction History -->
              <div>
                <h5 class="text-sm font-medium text-gray-500 mb-3">Transaction History</h5>
                <ul class="space-y-3">
                  <li v-for="(transaction, index) in [
                    { date: 'Mar 1, 2024', type: 'March Maintenance Fee', amount: 250.00, status: 'paid' },
                    { date: 'Feb 1, 2024', type: 'February Maintenance Fee', amount: 250.00, status: 'paid' },
                    { date: 'Jan 1, 2024', type: 'January Maintenance Fee', amount: 250.00, status: 'paid' },
                    { date: 'Dec 1, 2023', type: 'December Maintenance Fee', amount: 250.00, status: 'paid' }, // Fixed this line
                    { date: 'Nov 1, 2023', type: 'November Maintenance Fee', amount: 250.00, status: 'paid' }
                  ]" :key="index"
                  class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
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

          <!-- Complaints Section -->
          <div v-if="value === 'Complaints'" :key="'complaints'" class="border border-gray-200 p-4 rounded-2xl w-full">
            <h4 class="text-lg font-semibold text-gray-900">Complaint History</h4>
            <div class="space-y-6">
              <!-- Complaints List -->
              <div>
                <h5 class="text-sm font-medium text-gray-500 mb-3">Recent Complaints</h5>
                <ul class="space-y-3">
                  <li v-for="complaint in [
                    {
                      complainID: 'CMP001',
                      complainDescription: 'Noise disturbance from upper floor unit during late hours. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                      complainStatus: 'Resolved',
                      complainSeverity: 'High',
                      complainSentimentScore: -0.8,
                      complainMagnitude: 0.9,
                      complainCreatedAt: '2024-03-15T08:30:00'
                    },
                    {
                      complainID: 'CMP002',
                      complainDescription: 'Water leakage from ceiling in master bedroom',
                      complainStatus: 'In Progress',
                      complainSeverity: 'Medium',
                      complainSentimentScore: -0.6,
                      complainMagnitude: 0.7,
                      complainCreatedAt: '2024-03-10T14:15:00'
                    },
                    {
                      complainID: 'CMP003',
                      complainDescription: 'Elevator maintenance needed on Block A',
                      complainStatus: 'Pending',
                      complainSeverity: 'Low',
                      complainSentimentScore: -0.3,
                      complainMagnitude: 0.4,
                      complainCreatedAt: '2024-03-05T11:20:00'
                    }
                  ]" :key="complaint.complainID" 
                    class="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div class="flex justify-between items-start h-full">
                      <!-- Left side content -->
                      <div class="flex items-start gap-3 flex-1">
                        <div class="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                          <i class="pi pi-exclamation-circle text-red-500 text-sm"></i>
                        </div>
                        <div class="flex-1">
                          <span class="text-sm font-medium text-gray-900">{{ complaint.complainID }}</span>
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
                            <!-- Created at timestamp -->
                            <span class="text-xs text-gray-500">
                              {{ new Date(complaint.complainCreatedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <!-- Right side with status and timestamp -->
                      <div class="flex flex-col items-end gap-4">
                        <div class="flex gap-2">
                          <span :class="{
                            'px-2 py-1 text-xs rounded-full font-medium text-center': true,
                            'bg-green-100 text-green-700': complaint.complainStatus === 'Resolved',
                            'bg-yellow-100 text-yellow-700': complaint.complainStatus === 'In Progress',
                            'bg-gray-100 text-gray-700': complaint.complainStatus === 'Pending'
                          }">{{ complaint.complainStatus }}</span>
                          <span :class="{
                            'px-2 py-1 text-xs rounded-full font-medium text-center': true,
                            'bg-red-100 text-red-700': complaint.complainSeverity === 'High',
                            'bg-orange-100 text-orange-700': complaint.complainSeverity === 'Medium',
                            'bg-blue-100 text-blue-700': complaint.complainSeverity === 'Low'
                          }">{{ complaint.complainSeverity }}</span>
                        </div>
                        
                        
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </Dialog>

  <Dialog
    v-model:visible="showDeclineDialog"
    modal
    header="Decline Reason"
    :style="{ width: '30rem' }"
    :closable="false"
  >
    <div class="flex flex-col gap-4">
      <p class="text-gray-600">Please provide a reason for declining this user's verification.</p>
      <InputTextarea
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
import { ref, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { supabase } from '@/api/supabase'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import SelectButton from 'primevue/selectbutton'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import InputTextarea from 'primevue/textarea'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { logService } from '@/api/logService'

// Move toast initialization here
const toast = useToast()

// Rest of your component logic
const users = ref([])
const loading = ref(true)
const selectedUser = ref(null)
const filters = ref({
  global: { value: null, matchMode: 'contains' }
})

const showDialog = ref(false)
const value = ref('Identity')
const options = ref(['Identity', 'Finance', 'Complaints'])

const showDeclineDialog = ref(false)
const declineReason = ref('')

const authStore = useAuthStore()
const router = useRouter()

const fetchUsers = async () => {
  try {
    loading.value = true

    // First, get the current user's residenceID
    const { data: currentUser, error: currentUserError } = await supabase
      .from('User')
      .select('residenceID')
      .eq('userID', authStore.user.id)
      .single()

    if (currentUserError) throw currentUserError
    if (!currentUser?.residenceID) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No residence assigned to current user',
        life: 3000
      })
      return
    }

    // Then query users with the same residenceID
    const { data, error } = await supabase
      .from('User')
      .select(`
        *,
        identification_url,
        Residence:residenceID (
          residenceName,
          displayPhotoUrl
        )
      `)
      .eq('residenceID', currentUser.residenceID)
      .neq('userID', authStore.user.id) // Exclude current user
      .order('fullName')

    if (error) throw error
    users.value = data
  } catch (error) {
    console.error('Error fetching users:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch users',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const viewDetails = (user) => {
  router.push({
    name: 'ResidentDetails', // Make sure this matches your route name
    params: { id: user.userID },
    state: { user } // Optionally pass user data through state
  })
}

const onRowSelect = (event) => {
  selectedUser.value = event.data
}

const handleDeclineClick = () => {
  declineReason.value = '' // Reset the reason
  showDeclineDialog.value = true // Show the dialog
}

const updateVerificationStatus = async (action, userId, reason = '') => {
  try {
    const updates = {
      isVerified: action === 'accept',
      isDeclined: action === 'decline',
      declineReason: action === 'decline' ? reason : null
    }

    const { data, error } = await supabase
      .from('User')
      .update(updates)
      .eq('userID', userId)
      .select('*')
      .single()

    if (error) throw error

    // Update local state
    const index = users.value.findIndex(u => u.userID === userId)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...updates }
    }

    // Log the action
    const user = users.value.find(u => u.userID === userId)
    await logService.logAction({
      action: action === 'accept' ? 'verify' : 'reject',
      description: `${action === 'accept' ? 'Verified' : 'Declined'} resident: ${user?.fullName || 'Unknown'} (${user?.email || 'No email'})`,
      targetTable: 'User',
      targetID: userId,
      metadata: {
        action,
        reason: reason || null
      }
    })

    // Show success toast
    toast.add({
      severity: action === 'accept' ? 'success' : 'info',
      summary: action === 'accept' ? 'User Verified' : 'User Declined',
      detail: `The user has been ${action}ed.`,
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
  await updateVerificationStatus('decline', selectedUser.value.userID, declineReason.value)
}

const updateUserRole = async (userId, roleUpdates) => {
  try {
    // Fetch current user data for comparison and logging
    const { data: currentUserData, error: fetchError } = await supabase
      .from('User')
      .select('*')
      .eq('userID', userId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Update the user roles
    const { data, error } = await supabase
      .from('User')
      .update(roleUpdates)
      .eq('userID', userId)
      .select('*')
      .single();
      
    if (error) throw error;
    
    // Update local state
    const index = users.value.findIndex(u => u.userID === userId);
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...roleUpdates };
    }
    
    // If this is the selected user, update that too
    if (selectedUser.value && selectedUser.value.userID === userId) {
      selectedUser.value = { ...selectedUser.value, ...roleUpdates };
    }
    
    // Determine which roles were added or removed
    const roleChanges = {
      isAdmin: roleUpdates.isAdmin !== undefined && roleUpdates.isAdmin !== currentUserData.isAdmin,
      isManagement: roleUpdates.isManagement !== undefined && roleUpdates.isManagement !== currentUserData.isManagement,
      isResident: roleUpdates.isResident !== undefined && roleUpdates.isResident !== currentUserData.isResident
    };
    
    // Create descriptive message for the action
    let roleDiff = [];
    if (roleChanges.isAdmin) {
      roleDiff.push(`Admin role ${roleUpdates.isAdmin ? 'added' : 'removed'}`);
    }
    if (roleChanges.isManagement) {
      roleDiff.push(`Management role ${roleUpdates.isManagement ? 'added' : 'removed'}`);
    }
    if (roleChanges.isResident) {
      roleDiff.push(`Resident role ${roleUpdates.isResident ? 'added' : 'removed'}`);
    }
    
    // Log the role change action
    await logService.logAction({
      action: 'update',
      description: `Updated roles for ${data.fullName || 'user'}: ${roleDiff.join(', ')}`,
      targetTable: 'User',
      targetID: userId,
      metadata: {
        previousRoles: {
          isAdmin: currentUserData.isAdmin,
          isManagement: currentUserData.isManagement,
          isResident: currentUserData.isResident
        },
        newRoles: {
          isAdmin: roleUpdates.isAdmin !== undefined ? roleUpdates.isAdmin : currentUserData.isAdmin,
          isManagement: roleUpdates.isManagement !== undefined ? roleUpdates.isManagement : currentUserData.isManagement,
          isResident: roleUpdates.isResident !== undefined ? roleUpdates.isResident : currentUserData.isResident
        },
        userName: data.fullName,
        userEmail: data.email
      }
    });
    
    // Show success toast
    toast.add({
      severity: 'success',
      summary: 'Roles Updated',
      detail: `User roles have been updated successfully`,
      life: 3000
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user roles:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update user roles',
      life: 3000
    });
    return false;
  }
};

const assignRole = async (userId, role) => {
  const roleUpdate = {};
  roleUpdate[role] = true;
  return updateUserRole(userId, roleUpdate);
};

const removeRole = async (userId, role) => {
  const roleUpdate = {};
  roleUpdate[role] = false;
  return updateUserRole(userId, roleUpdate);
};

const updateUserUnit = async (userId, unitNumber) => {
  try {
    // Get current unit info for logging
    const { data: currentData, error: fetchError } = await supabase
      .from('User')
      .select('unitNumber, fullName')
      .eq('userID', userId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Update the unit number
    const { data, error } = await supabase
      .from('User')
      .update({ unitNumber })
      .eq('userID', userId)
      .select()
      .single();
      
    if (error) throw error;
    
    // Update local state
    const index = users.value.findIndex(u => u.userID === userId);
    if (index !== -1) {
      users.value[index].unitNumber = unitNumber;
    }
    
    // If this is the selected user, update that too
    if (selectedUser.value && selectedUser.value.userID === userId) {
      selectedUser.value.unitNumber = unitNumber;
    }
    
    // Log the unit update
    await logService.logAction({
      action: 'update',
      description: `Updated unit for ${data.fullName} from ${currentData.unitNumber || 'none'} to ${unitNumber || 'none'}`,
      targetTable: 'User',
      targetID: userId,
      metadata: {
        previousUnit: currentData.unitNumber,
        newUnit: unitNumber,
        userName: data.fullName,
        userEmail: data.email
      }
    });
    
    toast.add({
      severity: 'success',
      summary: 'Unit Updated',
      detail: `Unit has been updated successfully`,
      life: 3000
    });
    
    return true;
  } catch (error) {
    console.error('Error updating unit:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update unit',
      life: 3000
    });
    return false;
  }
};

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
:deep(.p-datatable .p-datatable-thead > tr > th) {
  @apply bg-primary-50 text-primary-700 font-semibold;
}

:deep(.p-button.p-button-text) {
  @apply text-primary-600;
}

:deep(.p-button.p-button-text:hover) {
  @apply bg-primary-50;
}

:deep(.p-paginator) {
  @apply bg-transparent;
}

:deep(.p-inputtext:focus) {
  @apply border-primary-500 ring-1 ring-primary-200;
}

.p-datatable.p-datatable-striped .p-datatable-tbody > tr:nth-child(even) {
  @apply bg-primary-50/30;
}

.p-datatable .p-datatable-tbody > tr:hover {
  @apply bg-primary-50/50;
}

.card {
  @apply bg-white rounded-lg shadow-sm;
}

/* PrimeVue Dialog Custom Styles */
:deep(.user-details-dialog) {
  @apply rounded-lg overflow-hidden;
}

:deep(.user-details-dialog .p-dialog-header) {
  @apply bg-primary-50 border-b border-primary-100 px-6 py-4;
}

:deep(.user-details-dialog .p-dialog-content) {
  @apply p-6;
}

:deep(.user-details-dialog .p-dialog-footer) {
  @apply p-4 bg-gray-50 border-t border-gray-100;
}

:deep(.user-details-dialog .p-dialog-title) {
  @apply text-lg font-semibold text-primary-700;
}

/* Animation classes provided by PrimeVue */
:deep(.p-dialog-enter-active) {
  transition: all 0.3s ease-out;
}

:deep(.p-dialog-leave-active) {
  transition: all 0.2s ease-in;
}

:deep(.p-dialog-enter-from),
:deep(.p-dialog-leave-from) {
  opacity: 0;
  transform: translateY(-50px);
}

:deep(.p-dialog-enter-to),
:deep(.p-dialog-leave-to) {
  opacity: 1;
  transform: translateY(0);
}

/* Mask animation */
:deep(.p-dialog-mask.p-component-overlay-enter) {
  animation: dialog-mask-in 0.2s;
}

:deep(.p-dialog-mask.p-component-overlay-leave-to) {
  animation: dialog-mask-out 0.2s;
}

@keyframes dialog-mask-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes dialog-mask-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Content transition animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease-out;
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Add this wrapper style */
.transition-wrapper {
  position: relative;
  min-height: 300px;
  overflow: hidden;
}
</style>