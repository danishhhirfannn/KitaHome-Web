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
        <Column field="created_at" header="Received At" sortable>
          <template #body="{ data }">
            <span class="text-gray-700 flex flex-col">
              <span>{{ new Date(data.created_at).toLocaleDateString() }}</span>
              <span class=" text-gray-700">{{ new Date(data.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
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

        <!-- Complaint Review section -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            Complaint Review
          </h3>
          
          <!-- Ticket container -->
          <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <!-- Original complaint as a ticket -->
            <div class="border-b border-gray-200">
              <!-- Ticket header -->
              <div class="bg-gradient-to-r from-primary-50 to-primary-100 px-5 py-4 flex justify-between items-center">
                <div class="flex-col items-center gap-3">
                  <p class="text-gray-700 font-medium text-xs">Ticket ID:</p>
                  <div class="text-sm font-bold text-primary-600">
                    #{{ selectedComplaint.complaintID }}
                  </div>
                  
                </div>
              </div>
              
              <!-- Ticket content -->
              <div class="p-5">
                <p class="text-gray-800 whitespace-pre-line">{{ selectedComplaint.complaintDescription || 'No description provided.' }}</p>
                
                <!-- Display complaint image if available -->
                <div v-if="selectedComplaint.complaintImageUrl" class="mt-4">
                  <img 
                    :src="selectedComplaint.complaintImageUrl" 
                    alt="Complaint image" 
                    class="max-w-full h-auto rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all"
                    @click="openImagePreview(selectedComplaint.complaintImageUrl)"
                  />
                </div>
              </div>
            </div>
            
            <!-- Ticket status tracker -->
            <div class="bg-gray-50 px-5 py-4 border-b border-gray-200">
              <!-- Status track with better spacing -->
              <div class="flex justify-center items-center">
                <div class="flex items-center">
                  <!-- Step 1: Submitted -->
                  <div class="flex flex-col items-center w-24">
                    <div class="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center text-sm font-medium mb-1 shadow-sm">
                      <i class="pi pi-check"></i>
                    </div>
                    <span class="text-xs font-medium text-yellow-600">Submitted</span>
                  </div>
                  
                  <!-- Connector line 1-2 -->
                  <div class="w-16 h-1 mx-1" :class="{
                    'bg-blue-500': selectedComplaint.isPending,
                    'bg-gray-300': !selectedComplaint.isPending
                  }"></div>
                  
                  <!-- Step 2: Reviewed -->
                  <div class="flex flex-col items-center w-24">
                    <div :class="{
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-1 shadow-sm': true,
                      'bg-blue-500 text-white': selectedComplaint.isPending,
                      'bg-gray-200 text-gray-600': !selectedComplaint.isPending
                    }">
                      <i v-if="selectedComplaint.isPending" class="pi pi-check"></i>
                      <span v-else>2</span>
                    </div>
                    <span :class="{
                      'text-xs font-medium': true, 
                      'text-blue-600': selectedComplaint.isPending,
                      'text-gray-500': !selectedComplaint.isPending
                    }">Reviewed</span>
                  </div>
                  
                  <!-- Connector line 2-3 -->
                  <div class="w-16 h-1 mx-1" :class="{
                    'bg-green-500': selectedComplaint.isResolved && selectedComplaint.isPending,
                    'bg-gray-300': !selectedComplaint.isResolved || !selectedComplaint.isPending
                  }"></div>
                  
                  <!-- Step 3: Resolved -->
                  <div class="flex flex-col items-center w-24">
                    <div :class="{
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-1 shadow-sm': true,
                      'bg-green-500 text-white': selectedComplaint.isResolved && selectedComplaint.isPending,
                      'bg-gray-200 text-gray-600': !selectedComplaint.isResolved || !selectedComplaint.isPending
                    }">
                      <i v-if="selectedComplaint.isResolved && selectedComplaint.isPending" class="pi pi-check"></i>
                      <span v-else>3</span>
                    </div>
                    <span :class="{
                      'text-xs font-medium': true,
                      'text-green-600': selectedComplaint.isResolved && selectedComplaint.isPending,
                      'text-gray-500': !selectedComplaint.isResolved || !selectedComplaint.isPending
                    }">Resolved</span>
                  </div>
                </div>
              </div>
              
              <!-- Status indicator - centered below tracker -->
              <div class="mt-3 flex items-center justify-center">
                <div :class="{
                  'px-4 py-1.5 text-sm font-medium rounded-full inline-flex items-center': true,
                  'bg-green-100 text-green-800': selectedComplaint.isResolved && selectedComplaint.isPending,
                  'bg-blue-100 text-blue-800': !selectedComplaint.isResolved && selectedComplaint.isPending,
                  'bg-yellow-100 text-yellow-800': !selectedComplaint.isPending
                }">
                  <i :class="{
                    'mr-2': true,
                    'pi pi-check-circle': selectedComplaint.isResolved && selectedComplaint.isPending,
                    'pi pi-sync': !selectedComplaint.isResolved && selectedComplaint.isPending,
                    'pi pi-inbox': !selectedComplaint.isPending
                  }"></i>
                  Current status: <span class="font-bold ml-1">{{ getStatusText(selectedComplaint) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Response section header -->
            <div class="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h4 class="font-medium text-gray-700 flex items-center">
                <i class="pi pi-ticket text-primary-500 mr-2"></i>
                Ticket Responses
              </h4>
              <span class="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                {{ selectedComplaint.complaintFeedbacks?.length || 0 }} response(s)
              </span>
            </div>
            
            <!-- Responses as tickets -->
            <div v-if="selectedComplaint.complaintFeedbacks && selectedComplaint.complaintFeedbacks.length > 0">
              <div v-for="feedback in selectedComplaint.complaintFeedbacks" :key="feedback.feedbackID" class="border-b border-gray-200 last:border-b-0">
                <div class="py-5 px-5 relative">
                  <!-- Left side vertical line -->
                  <div class="absolute left-10 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  <!-- Response content with timestamp -->
                  <div class="flex">
                    <!-- Residence logo or default icon -->
                    <div class="relative mr-4">
                      <div class="w-7 h-7 rounded-full flex items-center justify-center z-10 relative border border-gray-200 overflow-hidden bg-gray-100">
                        <img v-if="getResidencePhoto(selectedComplaint)" :src="getResidencePhoto(selectedComplaint)" class="w-full h-full object-cover" alt="Residence" />
                        <i v-else class="pi pi-building text-gray-500 text-sm"></i>
                      </div>
                      <!-- Horizontal connector -->
                      <div class="absolute top-3.5 left-7 w-3 h-0.5 bg-gray-200"></div>
                    </div>
                    
                    <!-- Response content -->
                    <div class="flex-1">
                      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                        <div class="flex justify-between items-start mb-2">
                          <div class="flex-col items-center gap-2">
                            <p class="text-gray-700 font-medium text-xs">Response ID:</p>
                            <div class="text-sm font-bold text-primary-600">
                              #{{ feedback.feedbackID }}
                            </div>
                          </div>
                          <div class="text-xs text-gray-500">
                            {{ new Date(feedback.created_at).toLocaleString() }}
                          </div>
                        </div>
                        <p class="text-gray-800 whitespace-pre-line break-words">{{ feedback.feedbackDescription }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Empty state for no responses -->
            <div v-if="!selectedComplaint.complaintFeedbacks || selectedComplaint.complaintFeedbacks.length === 0" class="p-8 text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-3">
                <i class="pi pi-inbox text-3xl"></i>
              </div>
              <h4 class="text-gray-600 font-medium">No Responses Yet</h4>
              <p class="text-gray-500 text-sm mt-1 max-w-md mx-auto">This ticket hasn't received any responses. Add a response to address this complaint.</p>
            </div>
            
            <!-- Reply input area -->
            <div v-if="!selectedComplaint.isResolved" class="border-t border-gray-200 p-5 bg-gray-50">
              <div class="flex items-center gap-2 mb-3">
                <i class="pi pi-plus-circle text-primary-500"></i>
                <span class="font-medium text-gray-700">Add New Response</span>
              </div>
              <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-7 h-7 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-700 font-semibold text-sm border border-blue-200">
                    {{ getCurrentUserInitial() }}
                  </div>
                  <span class="text-sm text-gray-600">Responding as Staff</span>
                </div>
                <Textarea 
                  v-model="replyMessage" 
                  rows="3" 
                  placeholder="Type your response here..." 
                  class="w-full p-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200"
                />
                <div class="flex justify-end mt-3">
                  <Button 
                    label="Submit Response" 
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

    <!-- Image Preview Modal -->
    <div v-if="isImagePreviewVisible" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4" @click.self="closeImagePreview">
      <div class="relative bg-white rounded-lg shadow-lg max-w-3xl w-full">
        <button class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all" @click="closeImagePreview">
          <i class="pi pi-times"></i>
        </button>
        <div class="p-2">
          <img :src="previewImageUrl" alt="Image Preview" class="w-full h-auto rounded" />
        </div>
      </div>
    </div>
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
const isImagePreviewVisible = ref(false)
const previewImageUrl = ref('')

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
          fullName,
          residenceID,
          Residence:residenceID (
            displayPhotoUrl
          )
        ),
        complaintFeedbacks:Complaint_Feedback (
          feedbackID,
          feedbackDescription,
          created_at,
          feedbackUserID,
          User:feedbackUserID (
            fullName
          )
        )
      `)
      .in('complaintUserID', userIds)
      .order('created_at', { ascending: false })
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

// Open image preview
const openImagePreview = (imageUrl) => {
  previewImageUrl.value = imageUrl
  isImagePreviewVisible.value = true
}

// Close image preview
const closeImagePreview = () => {
  isImagePreviewVisible.value = false
}

// Get residence photo URL
const getResidencePhoto = (complaint) => {
  return complaint?.User?.Residence?.displayPhotoUrl || null;
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

/* Complaint image styling */
.complaint-image {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.complaint-image:hover {
  transform: scale(1.01);
  border-color: var(--primary-500);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>