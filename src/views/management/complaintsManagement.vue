<template>
  <div class="p-8">
    <div class="flex justify-between items-end mb-6">
      <div>
        <h1 class="text-2xl font-bold text-[#4D5BBF]">Complaints Management</h1>
        <p class="text-gray-600 mt-2">Manage and track complaints from residents</p>
      </div>
      <div class="flex items-center gap-3">
        <label class="text-md text-gray-600">Smart Prioritisation</label>
        <InputSwitch
          v-model="smartPrioritisation"
          class=" "
          @change="handlePrioritisationToggle"
        />
      </div>
    </div>

    <div class="card bg-white rounded-lg shadow border border-gray-200">
      <div class="p-4 border-b border-gray-200 flex justify-between items-center"> 
        <h2 class="text-xl font-semibold text-[#4D5BBF]">Complaints List</h2>
        <div class="flex space-x-2">
          <span class="p-input-icon-left relative" style="min-width: 250px;">
            <InputText 
              v-model="filters.global.value" 
              placeholder="Search complaints..." 
              class="p-inputtext-sm border-primary-200 focus:border-primary-500 w-full pl-10" 
            />
          </span>
        </div>
      </div>

      <DataTable
        :value="complaints"
        :paginator="true"
        :rows="10"
        :loading="loading"
        v-model:filters="filters"
        responsiveLayout="scroll"
        class="p-datatable-lg border-t border-gray-200"
      >
        <Column field="complaintID" header="ID" sortable></Column>
        <Column field="complaintTitle" header="Title" sortable></Column>
        <Column field="User.fullName" header="Resident" sortable>
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                {{ data.User?.fullName?.charAt(0).toUpperCase() }}
              </div>
              {{ data.User?.fullName || 'Unknown User' }}
            </div>
          </template>
        </Column>
        <Column field="complaintMagnitude" header="Magnitude" sortable>
          <template #body="{ data }">
            <span :class="{
              'px-3 py-1 rounded-full': true,
              'bg-red-100 text-red-800': data.complaintMagnitude === 'High',
              'bg-yellow-100 text-yellow-800': data.complaintMagnitude === 'Medium',
              'bg-green-100 text-green-800': data.complaintMagnitude === 'Low'
            }">
              {{ data.complaintMagnitude }}
            </span>
          </template>
        </Column>
        <Column field="complaintSeverity" header="Severity" sortable>
          <template #body="{ data }">
            <span :class="{
              'px-3 py-1 rounded-full': true,
              'bg-red-100 text-red-800': data.complaintSeverity === 'Critical',
              'bg-yellow-100 text-yellow-800': data.complaintSeverity === 'Moderate',
              'bg-green-100 text-green-800': data.complaintSeverity === 'Minor'
            }">
              {{ data.complaintSeverity }}
            </span>
          </template>
        </Column>
        <Column field="complaintPriority" header="Priority" sortable>
          <template #body="{ data }">
            <span :class="{
              'px-3 py-1 rounded-full': true,
              'bg-red-100 text-red-800': data.complaintPriority === 'High',
              'bg-yellow-100 text-yellow-800': data.complaintPriority === 'Moderate',
              'bg-green-100 text-green-800': data.complaintPriority === 'Low'
            }">
              {{ data.complaintPriority }}
            </span>
          </template>
        </Column>
        <Column field="isResolved" header="Status" sortable>
          <template #body="{ data }">
            <span :class="{
              'py-1 rounded-full': true,
              'text-green-800': data.isResolved && data.isPending,
              'text-blue-800': !data.isResolved && data.isPending,
              'text-yellow-800': !data.isPending
            }">
              {{ getStatusText(data) }}
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

    <!-- Complaint Details Dialog -->
    <Dialog 
      v-model:visible="displayDialog" 
      :header="'Complaint Details'" 
      :style="{width: '60vw'}"
      :modal="true"
      :closable="true"
      :dismissableMask="true"
      class="complaint-dialog"
    >
      <div v-if="selectedComplaint" class="p-4">
        <!-- Complaint header -->
        <div class="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
          <div class="w-12 h-12 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center text-primary-700 font-semibold text-lg">
            {{ selectedComplaint.User?.fullName?.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-semibold text-gray-800">{{ selectedComplaint.complaintTitle }}</h2>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-gray-600">{{ selectedComplaint.User?.fullName || 'Unknown User' }}</span>
              <span class="text-gray-400">•</span>
              <span :class="{
                'px-2 py-0.5 rounded-full text-sm': true,
                'bg-green-100 text-green-800': selectedComplaint.isResolved && selectedComplaint.isPending,
                'bg-blue-100 text-blue-800': !selectedComplaint.isResolved && selectedComplaint.isPending,
                'bg-yellow-100 text-yellow-800': !selectedComplaint.isPending
              }">
                {{ getStatusText(selectedComplaint) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Complaint metadata -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div :class="{
            'rounded-lg shadow-sm p-3 border transition-all duration-200': true,
            'bg-red-50 border-red-100': selectedComplaint.complaintMagnitude === 'High',
            'bg-yellow-50 border-yellow-100': selectedComplaint.complaintMagnitude === 'Medium',
            'bg-green-50 border-green-100': selectedComplaint.complaintMagnitude === 'Low',
            'bg-white border-gray-100': !['High', 'Medium', 'Low'].includes(selectedComplaint.complaintMagnitude)
          }">
            <div class="flex items-start justify-between">
              <div>
                <div class="text-xs font-medium text-gray-500">Magnitude</div>
                <div :class="{
                  'text-lg font-bold mt-1': true,
                  'text-red-600': selectedComplaint.complaintMagnitude === 'High',
                  'text-yellow-600': selectedComplaint.complaintMagnitude === 'Medium',
                  'text-green-600': selectedComplaint.complaintMagnitude === 'Low'
                }">
                  {{ selectedComplaint.complaintMagnitude }}
                </div>
              </div>
              <div :class="{
                'h-8 w-8 rounded-full flex items-center justify-center': true,
                'bg-red-100 text-red-500': selectedComplaint.complaintMagnitude === 'High',
                'bg-yellow-100 text-yellow-500': selectedComplaint.complaintMagnitude === 'Medium',
                'bg-green-100 text-green-500': selectedComplaint.complaintMagnitude === 'Low'
              }">
                <i class="pi pi-exclamation-circle text-sm"></i>
              </div>
            </div>
          </div>
          
          <div :class="{
            'rounded-lg shadow-sm p-3 border transition-all duration-200': true,
            'bg-red-50 border-red-100': selectedComplaint.complaintSeverity === 'Critical',
            'bg-yellow-50 border-yellow-100': selectedComplaint.complaintSeverity === 'Moderate',
            'bg-green-50 border-green-100': selectedComplaint.complaintSeverity === 'Minor',
            'bg-white border-gray-100': !['Critical', 'Moderate', 'Minor'].includes(selectedComplaint.complaintSeverity)
          }">
            <div class="flex items-start justify-between">
              <div>
                <div class="text-xs font-medium text-gray-500">Severity</div>
                <div :class="{
                  'text-lg font-bold mt-1': true,
                  'text-red-600': selectedComplaint.complaintSeverity === 'Critical',
                  'text-yellow-600': selectedComplaint.complaintSeverity === 'Moderate',
                  'text-green-600': selectedComplaint.complaintSeverity === 'Minor'
                }">
                  {{ selectedComplaint.complaintSeverity }}
                </div>
              </div>
              <div :class="{
                'h-8 w-8 rounded-full flex items-center justify-center': true,
                'bg-red-100 text-red-500': selectedComplaint.complaintSeverity === 'Critical',
                'bg-yellow-100 text-yellow-500': selectedComplaint.complaintSeverity === 'Moderate',
                'bg-green-100 text-green-500': selectedComplaint.complaintSeverity === 'Minor'
              }">
                <i class="pi pi-flag text-sm"></i>
              </div>
            </div>
          </div>
          
          <div :class="{
            'rounded-lg shadow-sm p-3 border transition-all duration-200': true,
            'bg-red-50 border-red-100': selectedComplaint.complaintPriority === 'High',
            'bg-yellow-50 border-yellow-100': selectedComplaint.complaintPriority === 'Moderate',
            'bg-green-50 border-green-100': selectedComplaint.complaintPriority === 'Low',
            'bg-white border-gray-100': !['High', 'Moderate', 'Low'].includes(selectedComplaint.complaintPriority)
          }">
            <div class="flex items-start justify-between">
              <div>
                <div class="text-xs font-medium text-gray-500">Priority</div>
                <div :class="{
                  'text-lg font-bold mt-1': true,
                  'text-red-600': selectedComplaint.complaintPriority === 'High',
                  'text-yellow-600': selectedComplaint.complaintPriority === 'Moderate',
                  'text-green-600': selectedComplaint.complaintPriority === 'Low'
                }">
                  {{ selectedComplaint.complaintPriority }}
                </div>
              </div>
              <div :class="{
                'h-8 w-8 rounded-full flex items-center justify-center': true,
                'bg-red-100 text-red-500': selectedComplaint.complaintPriority === 'High',
                'bg-yellow-100 text-yellow-500': selectedComplaint.complaintPriority === 'Moderate',
                'bg-green-100 text-green-500': selectedComplaint.complaintPriority === 'Low'
              }">
                <i class="pi pi-sort-amount-down text-sm"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Conversation section -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Complaint Review</h3>
          <div class="bg-gray-50 rounded-lg p-4 max-h-[50vh] overflow-y-auto conversation-container">
            <!-- Original complaint -->
            <div class="flex gap-3 mb-6">
              <div class="w-10 h-10 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center text-primary-700 font-semibold">
                {{ selectedComplaint.User?.fullName?.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1">
                <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <p class="text-gray-800">{{ selectedComplaint.complaintDescription || 'No description provided.' }}</p>
                </div>
                <div class="flex items-center mt-2">
                  <span class="text-sm text-gray-500">
                    {{ selectedComplaint.User?.fullName || 'Unknown User' }}
                  </span>
                  <span class="mx-2 text-gray-300">•</span>
                  <span class="text-sm text-gray-500">
                    {{ new Date(selectedComplaint.created_at).toLocaleString() || 'Date not available' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Previous responses -->
            <div v-if="selectedComplaint.complaintFeedbacks && selectedComplaint.complaintFeedbacks.length > 0">
              <div v-for="(feedback, index) in selectedComplaint.complaintFeedbacks" :key="index" class="flex gap-3 mb-6 justify-end">
                <div class="flex-1">
                  <div class="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100">
                    <p class="text-gray-800">{{ feedback.feedbackDescription }}</p>
                  </div>
                  <div class="flex items-center justify-end mt-2">
                    <span class="text-sm text-gray-500">
                      Staff
                    </span>
                    <span class="mx-2 text-gray-300">•</span>
                    <span class="text-xs text-gray-500">
                      {{ new Date(feedback.created_at).toLocaleString() || 'Date not available' }}
                    </span>
                  </div>
                </div>
                <div class="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-700 font-semibold">
                  {{ feedback.feedbackUserID === auth.user.id ? getCurrentUserInitial() : 'S' }}
                </div>
              </div>
            </div>

            <!-- Reply input area -->
            <div v-if="!selectedComplaint.isResolved" class="mt-6 pt-4 border-t border-gray-200">
              <div class="flex gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-700 font-semibold">
                  {{ getCurrentUserInitial() }}
                </div>
                <div class="flex-1">
                  <Textarea 
                    v-model="replyMessage" 
                    rows="3" 
                    placeholder="Type your response here..." 
                    class="w-full p-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200"
                  />
                  <div class="flex justify-end mt-3">
                    <Button 
                      label="Send Reply" 
                      icon="pi pi-send" 
                      class="p-button-primary" 
                      @click="sendReply"
                      :disabled="!replyMessage.trim()"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button 
            label="Close" 
            icon="pi pi-times" 
            class="p-button-outlined p-button-secondary" 
            @click="closeDialog"
          />
          <Button 
            v-if="!selectedComplaint.isResolved && selectedComplaint.isPending" 
            label="Mark as Resolved" 
            icon="pi pi-check" 
            class="p-button-success" 
            @click="markAsResolved"
          />
          <Button 
            v-if="!selectedComplaint.isPending" 
            label="Mark as Reviewed" 
            icon="pi pi-check" 
            class="p-button-primary" 
            @click="markAsUnderReview"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/api/supabase'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import InputSwitch from 'primevue/inputswitch'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const complaints = ref([])
const loading = ref(true)
const filters = ref({
  global: { value: null, matchMode: 'contains' }
})
const smartPrioritisation = ref(true)
const displayDialog = ref(false)
const selectedComplaint = ref(null)
const replyMessage = ref('')

const fetchComplaintsData = async () => {
  try {
    loading.value = true

    // First, get the current user's residenceID
    const { data: currentUser, error: currentUserError } = await supabase
      .from('User')
      .select('residenceID')
      .eq('userID', auth.user.id)
      .single()

    if (currentUserError) throw currentUserError
    if (!currentUser?.residenceID) {
      console.error('No residence assigned to current user')
      return
    }

    // Fetch users with the same residenceID
    const { data: users, error: usersError } = await supabase
      .from('User')
      .select('userID')
      .eq('residenceID', currentUser.residenceID)

    if (usersError) throw usersError
    const userIds = users.map(user => user.userID)

    // Fetch complaints for these users
    const { data: complaintsData, error: complaintsError } = await supabase
      .from('Complaint')
      .select(`
        *,
        User:complaintUserID (
          fullName
        ),
        complaintFeedbacks:Complaint_Feedback (
          feedbackID,
          feedbackDescription,
          created_at,
          feedbackUserID
        )
      `)
      .in('complaintUserID', userIds)
      .order('created_at', { foreignTable: 'complaintFeedbacks', ascending: true })

    if (complaintsError) throw complaintsError
    complaints.value = complaintsData

  } catch (error) {
    console.error('Error fetching complaints data:', error)
    complaints.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchComplaintsData()
})

const viewDetails = (complaint) => {
  selectedComplaint.value = complaint
  displayDialog.value = true
  replyMessage.value = ''
}

const closeDialog = () => {
  displayDialog.value = false
  selectedComplaint.value = null
}

const markAsUnderReview = async () => {
  try {
    loading.value = true
    
    if (!selectedComplaint.value?.complaintID) return
    
    const { error } = await supabase
      .from('Complaint')
      .update({ isResolved: false, isPending: true })
      .eq('complaintID', selectedComplaint.value.complaintID)
    
    if (error) throw error
    
    // Update local data
    if (selectedComplaint.value) {
      selectedComplaint.value.isResolved = false
      selectedComplaint.value.isPending = true
    }
    
    // Refresh the complaints list
    await fetchComplaintsData()
    
  } catch (error) {
    console.error('Error updating complaint:', error)
  } finally {
    loading.value = false
  }
}

const markAsResolved = async () => {
  try {
    loading.value = true
    
    if (!selectedComplaint.value?.complaintID) return
    
    const { error } = await supabase
      .from('Complaint')
      .update({ isResolved: true, isPending: true })
      .eq('complaintID', selectedComplaint.value.complaintID)
    
    if (error) throw error
    
    // Update local data
    if (selectedComplaint.value) {
      selectedComplaint.value.isResolved = true
      selectedComplaint.value.isPending = true
    }
    
    // Refresh the complaints list
    await fetchComplaintsData()
    
  } catch (error) {
    console.error('Error updating complaint:', error)
  } finally {
    loading.value = false
  }
}

const getStatusText = (data) => {
  if (data.isResolved && data.isPending) return 'Resolved'
  if (!data.isResolved && data.isPending) return 'Reviewed'
  return 'Submitted'
}

const handlePrioritisationToggle = (event) => {
  console.log('Smart Prioritisation:', event.value)
  // Implement prioritisation logic here
}

const sendReply = async () => {
  if (!replyMessage.value.trim() || !selectedComplaint.value?.complaintID) return
  
  try {
    loading.value = true
    
    // Add feedback to Complaint_Feedback table
    const { error } = await supabase
      .from('Complaint_Feedback')
      .insert({
        feedbackDescription: replyMessage.value,
        feedbackComplaintID: selectedComplaint.value.complaintID,
        feedbackUserID: auth.user.id,
        created_at: new Date().toISOString()
      })
    
    if (error) throw error
    
    // If this is the first response, mark as under review
    if (!selectedComplaint.value.isPending) {
      await markAsUnderReview()
    }
    
    // Clear the reply field
    replyMessage.value = ''
    
    // Refresh complaint data
    await fetchComplaintsData()
    
    // Update the selected complaint with fresh data
    const updatedComplaint = complaints.value.find(c => c.complaintID === selectedComplaint.value.complaintID)
    if (updatedComplaint) {
      selectedComplaint.value = updatedComplaint
    }
    
  } catch (error) {
    console.error('Error sending feedback:', error)
  } finally {
    loading.value = false
  }
}

// Get the initial of a user by ID
const getUserInitial = (userID) => {
  if (userID === auth.user.id) {
    return getCurrentUserInitial();
  }
  return 'S'; // Default fallback for other staff
}

// Get the initial of the current logged in user
const getCurrentUserInitial = () => {
  if (!auth.user) return 'U';
  
  const fullName = auth.user.user_metadata?.full_name || 
                   auth.user.email || 
                   'User';
                   
  return fullName.charAt(0).toUpperCase();
}
</script>

<style scoped>
/* PrimeVue customizations */
:deep(.p-datatable .p-datatable-thead > tr > th) {
  @apply bg-primary-50 text-primary-700 font-semibold;
}

:deep(.p-datatable-header) {
  background-color: transparent;
  border: none;
  padding: 1.5rem;
}

:deep(.p-column-header-content) {
  justify-content: flex-start;
}

.p-button.p-button-text:hover {
  background: rgba(var(--primary-500), 0.04);
}

:deep(.p-inputswitch.p-inputswitch-checked .p-inputswitch-slider) {
  @apply bg-primary-500;
}

:deep(.p-inputswitch:not(.p-disabled):hover .p-inputswitch-slider) {
  @apply bg-primary-600;
}

:deep(.p-dialog .p-dialog-header) {
  @apply bg-primary-50 text-primary-800 font-bold;
}

.conversation-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.conversation-container::-webkit-scrollbar {
  width: 6px;
}

.conversation-container::-webkit-scrollbar-track {
  background: transparent;
}

.conversation-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}
</style>