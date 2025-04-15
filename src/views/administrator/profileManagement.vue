<template>
  <Toast position="top-right" />
  <div class="p-8">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-[#4D5BBF]">Profile Management</h1>
        <p class="text-gray-600 mt-2">Manage all user profiles and their verification status</p>
      </div>
      <Button
        icon="pi pi-plus" 
        label="Create New User"
        raised
        class="text-sm"
        @click="openNewUserDialog"
        tooltip="Create a new user account"
        tooltipOptions="left" />
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
        :rows="10"
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

      <div class="mt-6">
        <Button 
          label="Disable User"
          icon="pi pi-ban"
          severity="danger"
          text
          class="!text-red-600 hover:!bg-red-50"
          size="small"
        />
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

  <Dialog 
    v-model:visible="userFormDialog" 
    :modal="true"
    header="Create New User"
    :style="{width: '40rem'}"
    :breakpoints="{'960px': '75vw', '640px': '90vw'}"
    class="shadow-lg rounded-lg overflow-hidden"
    :closable="true"
  >
    <div class="p-1 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="mb-2">
          <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
          <InputText id="fullName" v-model="userForm.fullName" class="w-full" />
        </div>

        <div class="mb-2">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email*</label>
          <InputText id="email" v-model="userForm.email" class="w-full" type="email" />
        </div>
      </div>

      <div class="mb-2">
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password*</label>
        <InputText id="password" v-model="userForm.password" class="w-full" type="password" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="mb-2">
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <InputText id="phone" v-model="userForm.phone" class="w-full" />
        </div>

        <div class="mb-2">
          <label for="nationality" class="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
          <InputText id="nationality" v-model="userForm.userNationality" class="w-full" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="mb-2">
          <label for="identificationNumber" class="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
          <InputText id="identificationNumber" v-model="userForm.userIdentificationNumber" class="w-full" />
        </div>

        <div class="mb-2">
          <label for="residence" class="block text-sm font-medium text-gray-700 mb-1">Residence</label>
          <Dropdown id="residence" v-model="userForm.residenceID" :options="residences" optionLabel="residenceName" 
                   optionValue="residenceID" placeholder="Select Residence" class="w-full" />
        </div>
      </div>

      <div class="mb-2">
        <label for="unitNumber" class="block text-sm font-medium text-gray-700 mb-1">Unit Number</label>
        <InputText id="unitNumber" v-model="userForm.unitNumber" class="w-full" />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">User Roles</label>
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center">
            <Checkbox id="isResident" v-model="userForm.isResident" :binary="true" />
            <label for="isResident" class="ml-2 text-sm text-gray-700">Resident</label>
          </div>
          <div class="flex items-center">
            <Checkbox id="isManagement" v-model="userForm.isManagement" :binary="true" />
            <label for="isManagement" class="ml-2 text-sm text-gray-700">Management</label>
          </div>
          <div class="flex items-center">
            <Checkbox id="isAdmin" v-model="userForm.isAdmin" :binary="true" />
            <label for="isAdmin" class="ml-2 text-sm text-gray-700">Admin</label>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
        <div class="flex gap-4">
          <div class="flex items-center">
            <RadioButton id="pending" v-model="userForm.verificationStatus" value="pending" />
            <label for="pending" class="ml-2 text-sm text-gray-700">Pending</label>
          </div>
          <div class="flex items-center">
            <RadioButton id="verified" v-model="userForm.verificationStatus" value="verified" />
            <label for="verified" class="ml-2 text-sm text-gray-700">Verified</label>
          </div>
          <div class="flex items-center">
            <RadioButton id="declined" v-model="userForm.verificationStatus" value="declined" />
            <label for="declined" class="ml-2 text-sm text-gray-700">Declined</label>
          </div>
        </div>
      </div>

      <div class="mb-2" v-if="userForm.verificationStatus === 'declined'">
        <label for="declineReason" class="block text-sm font-medium text-gray-700 mb-1">Decline Reason</label>
        <InputTextarea id="declineReason" v-model="userForm.declineReason" rows="2" class="w-full" />
      </div>
    </div>

    <template #footer>
      <div class="py-3 flex justify-end gap-2">
        <Button 
          label="Cancel" 
          icon="pi pi-times" 
          class="p-button-text text-sm"
          @click="userFormDialog = false"
        />
        <Button 
          label="Save" 
          icon="pi pi-save" 
          class="text-sm"
          @click="saveUser"
          :loading="savingUser"
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
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import InputTextarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import RadioButton from 'primevue/radiobutton'

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
const showDeclineDialog = ref(false)
const declineReason = ref('')

// New user form dialog
const userFormDialog = ref(false)
const savingUser = ref(false)
const residences = ref([])
const userForm = ref({
  fullName: '',
  email: '',
  phone: '',
  userNationality: '',
  userIdentificationNumber: '',
  residenceID: null,
  unitNumber: '',
  isResident: true,
  isManagement: false,
  isAdmin: false,
  verificationStatus: 'pending',
  declineReason: '',
  password: ''
})

const resetUserForm = () => {
  userForm.value = {
    fullName: '',
    email: '',
    phone: '',
    userNationality: '',
    userIdentificationNumber: '',
    residenceID: null,
    unitNumber: '',
    isResident: true,
    isManagement: false,
    isAdmin: false,
    verificationStatus: 'pending',
    declineReason: '',
    password: ''
  }
}

const openNewUserDialog = () => {
  resetUserForm()
  userFormDialog.value = true
}

const fetchResidences = async () => {
  try {
    const { data, error } = await supabase
      .from('Residence')
      .select('residenceID, residenceName')
      .order('residenceName')

    if (error) throw error
    residences.value = data
  } catch (error) {
    console.error('Error fetching residences:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch residences',
      life: 3000
    })
  }
}

const saveUser = async () => {
  if (!userForm.value.fullName || !userForm.value.email || !userForm.value.password) {
    toast.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Full name, email, and password are required',
      life: 3000
    })
    return
  }

  try {
    savingUser.value = true

    // First create user in Supabase Auth
    // We need to store the current session before creating a new user
    const currentSession = await supabase.auth.getSession()
    
    // Create new user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userForm.value.email,
      password: userForm.value.password,
      options: {
        emailRedirectTo: window.location.origin,
      }
    })

    if (authError) throw authError

    // Restore the admin session to avoid logging out
    if (currentSession?.data?.session) {
      await supabase.auth.setSession(currentSession.data.session)
    }

    // Get the user ID from the auth response
    const userId = authData.user.id

    // Map form status to db fields
    const isVerified = userForm.value.verificationStatus === 'verified'
    const isDeclined = userForm.value.verificationStatus === 'declined'

    // Create user object for User table (without password)
    const newUser = {
      userID: userId, // Use the auth user ID
      fullName: userForm.value.fullName,
      email: userForm.value.email,
      phone: userForm.value.phone,
      userNationality: userForm.value.userNationality,
      userIdentificationNumber: userForm.value.userIdentificationNumber,
      residenceID: userForm.value.residenceID,
      unitNumber: userForm.value.unitNumber,
      isResident: userForm.value.isResident,
      isManagement: userForm.value.isManagement,
      isAdmin: userForm.value.isAdmin,
      isVerified: isVerified,
      isDeclined: isDeclined,
      declineReason: isDeclined ? userForm.value.declineReason : null
    }

    // Insert user into User table
    const { data, error } = await supabase
      .from('User')
      .insert(newUser)
      .select(`
        *,
        Residence:residenceID (
          residenceName,
          displayPhotoUrl
        )
      `)

    if (error) throw error

    // Add to local state
    users.value.unshift(data[0])

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'New user has been created',
      life: 3000
    })

    userFormDialog.value = false
  } catch (error) {
    console.error('Error creating user:', error)
    
    let errorMessage = 'Failed to create user'
    if (error.code === '23505') {
      errorMessage = 'A user with this email already exists'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 3000
    })
  } finally {
    savingUser.value = false
  }
}

const fetchUsers = async () => {
  try {
    loading.value = true
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
      .order('fullName')

    if (error) throw error
    users.value = data
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

const viewDetails = (user) => {
  selectedUser.value = user
  showDialog.value = true
}

const onRowSelect = (event) => {
  selectedUser.value = event.data
}

const handleDeclineClick = () => {
  declineReason.value = '' // Reset the reason
  showDeclineDialog.value = true // Show the dialog
}

const updateVerificationStatus = async (action, reason = '') => {
  try {
    if (!selectedUser.value?.userID) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No user ID found',
        life: 3000
      })
      return
    }

    const updates = {
      isVerified: action === 'accept',
      isDeclined: action === 'decline',
      declineReason: action === 'decline' ? reason : null
    }

    const { error } = await supabase
      .from('User')
      .update(updates)
      .eq('userID', selectedUser.value.userID)

    if (error) throw error

    // Update local state
    selectedUser.value = {
      ...selectedUser.value,
      ...updates
    }

    // Show success toast
    toast.add({
      severity: action === 'accept' ? 'success' : 'info',
      summary: action === 'accept' ? 'Document Accepted' : 'Document Declined',
      detail: `${selectedUser.value.fullName}'s identification document has been ${action}ed.`,
      life: 3000
    })

    // Close decline dialog if open
    showDeclineDialog.value = false
    declineReason.value = ''

    // Refresh the users list
    await fetchUsers()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update verification status.',
      life: 3000
    })
    console.error('Error updating verification status:', error.message)
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
  await updateVerificationStatus('decline', declineReason.value)
}

onMounted(() => {
  fetchUsers()
  fetchResidences()
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