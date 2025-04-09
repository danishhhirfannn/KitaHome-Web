<template>
  <Toast position="top-right" />
  <div class="p-8">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-[#4D5BBF]">Residence Management</h1>
        <p class="text-gray-600 mt-2">Manage all residences and their information</p>
      </div>
      <Button
        icon="pi pi-plus" 
        label="Add New Residence"
        raised
        class="text-sm"
        @click="openNewResidenceDialog"
        tooltip="Add a new residence"
        tooltipOptions="left" />
    </div>

    <div class="card bg-white rounded-lg shadow border border-gray-200">
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-[#4D5BBF]">Residences</h2>
        <div class="flex space-x-2">
          <span class="p-input-icon-left relative" style="min-width: 250px;">
            <InputText 
              v-model="filters.global.value" 
              placeholder="Search residences..." 
              class="p-inputtext-sm border-primary-200 focus:border-primary-500 w-full pl-10" 
            />
          </span>
        </div>
      </div>
      
      <DataTable
        :value="residences"
        :paginator="true"
        :rows="5"
        :loading="loading"
        v-model:filters="filters"
        filterDisplay="menu"
        responsiveLayout="scroll"
        class="p-datatable-lg border-t border-gray-200"
      >
        <Column field="residenceName" header="Name" sortable>
          <template #body="{ data }">
            <div class="flex items-center gap-4">
              <div v-if="data.displayPhotoUrl" class="w-8 h-8 rounded-full overflow-hidden">
                <img :src="data.displayPhotoUrl" :alt="data.residenceName" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                {{ data.residenceName.charAt(0).toUpperCase() }}
              </div>
              {{ data.residenceName }}
            </div>
          </template>
        </Column>
        <Column field="residenceAddress" header="Address"></Column>
        <Column field="residenceTotalUnit" header="Total Units" sortable></Column>
        <Column header="Occupancy">
          <template #body="{ data }">
            <div class="flex flex-col items-left">
              <div class="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                <div 
                  class="bg-primary-600 h-2.5 rounded-full"
                  :style="{ width: calculateOccupancyPercentage(data) + '%' }"
                ></div>
              </div>
              <div class="text-xs text-gray-500 pt-2">
                {{ data.residenceTotalOccupiedUnits }} / {{ data.residenceTotalUnit }}
              </div>
            </div>
          </template>
        </Column>
        <Column field="residenceTotalResident" header="Residents" sortable></Column>
        <Column header="Management">
          <template #body="{ data }">
            <div class="flex items-center">
              <div v-if="data.managementUser" class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-xs font-medium">
                  {{ data.managementUser.fullName.charAt(0).toUpperCase() }}
                </div>
                <span class="text-sm">{{ data.managementUser.fullName }}</span>
              </div>
              <span v-else class="text-sm text-gray-500">Not assigned</span>
            </div>
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
              <Button 
                icon="pi pi-pencil" 
                class="p-button-rounded p-button-text p-button-sm text-primary-600"
                @click="editResidence(slotProps.data)"
                tooltip="Edit"
                tooltipOptions="top"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <!-- Residence Details Dialog -->
  <Dialog 
    v-model:visible="showDetailsDialog"
    modal
    :style="{ width: '50vw' }"
    :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
    header="Residence Details"
    class="residence-details-dialog"
    :draggable="false"
    :closeOnEscape="true"
    :dismissableMask="true"
  >
    <div v-if="selectedResidence" class="space-y-6">
      <!-- Residence Basic Info -->
      <div class="flex items-start gap-6">
        <!-- Left side - Photo -->
        <div v-if="selectedResidence.displayPhotoUrl" class="w-44 h-40 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <img :src="selectedResidence.displayPhotoUrl" :alt="selectedResidence.residenceName" class="w-full h-full object-cover" />
        </div>
        <div v-else class="w-32 h-32 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 text-4xl font-semibold border border-primary-200 shadow-sm">
          {{ selectedResidence.residenceName.charAt(0).toUpperCase() }}
        </div>

        <!-- Middle - Info -->
        <div class="flex-1">
          <h3 class="text-xl font-semibold text-gray-900">{{ selectedResidence.residenceName }}</h3>
          <div class="mt-4 space-y-3">
            <div class="flex items-center text-sm text-gray-600">
              <i class="pi pi-map-marker mr-2 text-primary-500"></i>
              {{ selectedResidence.residenceAddress }}
            </div>
            <div class="flex items-center text-sm text-gray-600">
              <i class="pi pi-home mr-2 text-primary-500"></i>
              {{ selectedResidence.residenceTotalUnit }} Units ({{ selectedResidence.residenceTotalOccupiedUnits }} Occupied)
            </div>
            <div class="flex items-center text-sm text-gray-600">
              <i class="pi pi-users mr-2 text-primary-500"></i>
              {{ selectedResidence.residenceTotalResident }} Residents
            </div>
            <div class="flex items-center text-sm text-gray-600">
              <i class="pi pi-calendar mr-2 text-primary-500"></i>
              Added on {{ formatDate(selectedResidence.created_at) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Occupancy Visual Gauge -->
      <div class="mt-6 p-5 border border-gray-200 rounded-lg bg-gray-50">
        <div class="flex justify-between items-center mb-2">
          <h4 class="text-lg font-semibold text-gray-900">Occupancy Overview</h4>
          <span class="text-sm font-medium" :class="{
            'text-green-600': calculateOccupancyPercentage(selectedResidence) > 80,
            'text-orange-600': calculateOccupancyPercentage(selectedResidence) >= 50 && calculateOccupancyPercentage(selectedResidence) <= 80,
            'text-red-600': calculateOccupancyPercentage(selectedResidence) < 50
          }">
            {{ calculateOccupancyPercentage(selectedResidence) }}% Occupied
          </span>
        </div>
        
        <!-- Occupancy Bar -->
        <div class="w-full bg-gray-200 rounded-full h-4 mb-6">
          <div 
            class="h-4 rounded-full"
            :class="{
              'bg-green-500': calculateOccupancyPercentage(selectedResidence) > 80,
              'bg-orange-500': calculateOccupancyPercentage(selectedResidence) >= 50 && calculateOccupancyPercentage(selectedResidence) <= 80,
              'bg-red-500': calculateOccupancyPercentage(selectedResidence) < 50
            }"
            :style="{ width: calculateOccupancyPercentage(selectedResidence) + '%' }"
          ></div>
        </div>

        <!-- Occupancy Stats -->
        <div class="grid grid-cols-4 gap-4">
          <div class="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
            <h5 class="text-sm font-medium text-gray-500 mb-1">Total Units</h5>
            <p class="text-2xl font-bold text-primary-600">{{ selectedResidence.residenceTotalUnit }}</p>
          </div>
          <div class="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
            <h5 class="text-sm font-medium text-gray-500 mb-1">Occupied</h5>
            <p class="text-2xl font-bold text-green-600">{{ selectedResidence.residenceTotalOccupiedUnits }}</p>
          </div>
          <div class="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
            <h5 class="text-sm font-medium text-gray-500 mb-1">Vacant</h5>
            <p class="text-2xl font-bold text-red-600">{{ selectedResidence.residenceTotalUnit - selectedResidence.residenceTotalOccupiedUnits }}</p>
          </div>
          <div class="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
            <h5 class="text-sm font-medium text-gray-500 mb-1">Residents</h5>
            <p class="text-2xl font-bold text-orange-600">{{ selectedResidence.residenceTotalResident }}</p>
          </div>
        </div>
      </div>

      <!-- Management User Section -->
      <div v-if="selectedResidence.managementUser" class="mt-6 p-5 border border-gray-200 rounded-lg">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">Management User</h4>
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-xl font-semibold">
            {{ selectedResidence.managementUser.fullName.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h5 class="text-base font-medium text-gray-900">{{ selectedResidence.managementUser.fullName }}</h5>
            <div class="mt-2 space-y-1">
              <div class="flex items-center text-sm text-gray-600">
                <i class="pi pi-envelope mr-2 text-orange-500"></i>
                {{ selectedResidence.managementUser.email }}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="pi pi-phone mr-2 text-orange-500"></i>
                {{ selectedResidence.managementUser.phone || 'No phone number' }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="mt-6 p-5 border border-gray-200 rounded-lg border-dashed">
        <div class="flex items-center justify-center py-4">
          <div class="text-center">
            <i class="pi pi-user-plus text-4xl text-gray-300 mb-2"></i>
            <p class="text-gray-500">No management user assigned to this residence</p>
            <Button 
              label="Assign Manager" 
              icon="pi pi-user-edit"
              class="p-button-sm mt-3"
              @click="editFromDetails"
            />
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="p-4 flex justify-end gap-3">
        <Button 
          label="Close" 
          icon="pi pi-times" 
          class="p-button-text p-button-sm"
          @click="showDetailsDialog = false"
        />
        <Button 
          label="Edit Residence" 
          icon="pi pi-pencil" 
          class="p-button-sm"
          @click="editFromDetails"
        />
      </div>
    </template>
  </Dialog>

  <!-- Add/Edit Residence Dialog -->
  <Dialog 
    v-model:visible="residenceFormDialog" 
    :modal="true"
    :header="isEditing ? 'Edit Residence' : 'Add New Residence'"
    :style="{width: '40rem'}"
    :breakpoints="{'960px': '75vw', '640px': '90vw'}"
    class="shadow-lg rounded-lg overflow-hidden"
    :closable="true"
  >
    <div class="p-4 space-y-6">
      <div class="mb-4">
        <label for="residenceName" class="block text-sm font-medium text-gray-700 mb-2">Residence Name*</label>
        <InputText id="residenceName" v-model="residenceForm.residenceName" class="w-full p-inputtext-sm" />
      </div>

      <div class="mb-4">
        <label for="residenceAddress" class="block text-sm font-medium text-gray-700 mb-2">Address*</label>
        <InputTextarea 
          id="residenceAddress" 
          v-model="residenceForm.residenceAddress" 
          rows="2" 
          autoResize 
          class="w-full p-inputtext-sm" 
        />
      </div>

      <div class="field mb-6">
        <label for="displayPhoto" class="block text-sm font-medium text-gray-700 mb-2">Display Photo</label>
        <div class="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col items-center">
          <!-- Preview section - only show when there's an image -->
          <div v-if="previewUrl || residenceForm.displayPhotoUrl" class="mb-4 w-full flex justify-center">
            <div class="w-48 h-40 rounded-lg overflow-hidden border-2 border-primary-100 shadow-sm">
              <img :src="previewUrl || residenceForm.displayPhotoUrl" 
                   class="w-full h-full object-cover" 
                   :alt="residenceForm.residenceName || 'Residence photo'" />
            </div>
          </div>
          
          <!-- Upload control -->
          <FileUpload
            mode="basic"
            :auto="false"
            accept="image/*"
            :maxFileSize="1000000"
            class="mb-2"
            chooseLabel="Select Image"
            chooseIcon="pi pi-upload"
            :style="{ width: '200px' }"
            @select="onFileSelect"
          />
          <div class="text-xs text-gray-500 mt-1">
            Max size: 1MB. Formats: JPG, PNG, GIF
          </div>
          
          <!-- Upload progress -->
          <div v-if="isUploading" class="mt-4 w-full max-w-xs">
            <ProgressBar :value="uploadProgress" class="h-2" />
            <div class="text-center mt-1">
              <span class="text-xs font-medium text-primary-600">{{ uploadProgress }}% uploading...</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <div>
          <label for="residenceTotalUnit" class="block text-sm font-medium text-gray-700 mb-2">Total Units*</label>
          <InputNumber 
            id="residenceTotalUnit" 
            v-model="residenceForm.residenceTotalUnit" 
            class="w-full" 
            :min="0"
            :useGrouping="false"
            inputClass="p-inputtext-sm w-full"
          />
        </div>

        <div>
          <label for="residenceTotalOccupiedUnits" class="block text-sm font-medium text-gray-700 mb-2">Occupied Units</label>
          <InputNumber 
            id="residenceTotalOccupiedUnits" 
            v-model="residenceForm.residenceTotalOccupiedUnits" 
            class="w-full" 
            :min="0"
            :max="residenceForm.residenceTotalUnit"
            :useGrouping="false"
            inputClass="p-inputtext-sm w-full"
          />
        </div>

        <div>
          <label for="residenceTotalResident" class="block text-sm font-medium text-gray-700 mb-2">Total Residents</label>
          <InputNumber 
            id="residenceTotalResident" 
            v-model="residenceForm.residenceTotalResident" 
            class="w-full" 
            :min="0"
            :useGrouping="false"
            inputClass="p-inputtext-sm w-full"
          />
        </div>
      </div>

      <div class="mb-4">
        <label for="managementUser" class="block text-sm font-medium text-gray-700 mb-2">Management User</label>
        <Dropdown
          id="managementUser"
          v-model="residenceForm.selectedManagerID"
          :options="availableManagers"
          optionLabel="fullName"
          optionValue="userID"
          placeholder="Select a management user"
          class="w-full"
          :filter="true"
          :showClear="true"
          emptyMessage="No management users available. Create users with Management role first."
          emptyFilterMessage="No management users match your search."
        />
        <small class="text-gray-500 mt-1 block">
          <span v-if="isEditing && residenceForm.currentManagerID">
            Current manager: {{ managementUsers.value.find(u => u.userID === residenceForm.currentManagerID)?.fullName || 'None' }}
          </span>
          <span v-else-if="availableManagers.length === 0">
            No management users available. Create users with Management role first.
          </span>
          <span v-else>
            Assign a management user to this residence 
          </span>
        </small>
      </div>
    </div>

    <template #footer>
      <div class="p-4 flex justify-end gap-3 border-t border-gray-200">
        <Button 
          label="Cancel" 
          icon="pi pi-times" 
          class="p-button-text p-button-sm"
          @click="residenceFormDialog = false"
        />
        <Button 
          :label="isEditing ? 'Update' : 'Save'" 
          icon="pi pi-save" 
          class="p-button-sm"
          @click="saveResidence"
          :loading="savingResidence"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { supabase } from '@/api/supabase'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import InputTextarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import FileUpload from 'primevue/fileupload'
import ProgressBar from 'primevue/progressbar'

// Toast initialization
const toast = useToast()

// Data
const residences = ref([])
const loading = ref(true)
const selectedResidence = ref(null)
const filters = ref({
  global: { value: null, matchMode: 'contains' }
})
const managementUsers = ref([])

// Dialog states
const showDetailsDialog = ref(false)
const residenceFormDialog = ref(false)
const savingResidence = ref(false)
const isEditing = ref(false)

// Form
const residenceForm = ref({
  residenceID: null,
  residenceName: '',
  residenceAddress: '',
  displayPhotoUrl: '',
  residenceTotalUnit: 0,
  residenceTotalOccupiedUnits: 0,
  residenceTotalResident: 0,
  selectedManagerID: null,
  currentManagerID: null
})

// File upload related variables
const uploadedImage = ref(null)
const previewUrl = ref('')
const isUploading = ref(false)
const uploadProgress = ref(0)

// Reset form
const resetResidenceForm = () => {
  residenceForm.value = {
    residenceID: null,
    residenceName: '',
    residenceAddress: '',
    displayPhotoUrl: '',
    residenceTotalUnit: 0,
    residenceTotalOccupiedUnits: 0,
    residenceTotalResident: 0,
    selectedManagerID: null,
    currentManagerID: null
  }
  // Reset file upload values
  uploadedImage.value = null
  previewUrl.value = ''
  isUploading.value = false
  uploadProgress.value = 0
}

// Open dialog for new residence
const openNewResidenceDialog = () => {
  resetResidenceForm()
  isEditing.value = false
  residenceFormDialog.value = true
}

// Fetch management users from database
const fetchManagementUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('User')
      .select('userID, fullName, email, phone, residenceID')
      .eq('isManagement', true)
      .order('fullName')

    if (error) throw error
    
    console.log('Fetched management users:', data)
    managementUsers.value = data || []
    
    // Log how many management users are available to assign
    const unassignedManagers = managementUsers.value.filter(user => !user.residenceID)
    console.log(`Found ${unassignedManagers.length} unassigned management users`)
  } catch (error) {
    console.error('Error fetching management users:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch management users',
      life: 3000
    })
  }
}

// Computed property for available managers (not already assigned to a residence)
const availableManagers = computed(() => {
  // For debugging
  console.log('Computing available managers. Total:', managementUsers.value.length)
  console.log('Current editing state:', isEditing.value)
  console.log('Current residence ID:', residenceForm.value.residenceID)
  
  // When editing, include the current manager and unassigned managers
  if (isEditing.value) {
    // Get managers who are either unassigned or assigned to the current residence
    const availableUsers = managementUsers.value.filter(user => 
      !user.residenceID || 
      user.residenceID === residenceForm.value.residenceID ||
      user.userID === residenceForm.value.currentManagerID
    );
    
    console.log('Available managers when editing:', availableUsers.length)
    return availableUsers;
  }
  
  // For new residences, show all management users regardless of assignment
  // This allows reassignment of managers if needed
  console.log('Available managers when creating new:', managementUsers.value.length)
  return managementUsers.value;
})

// Open dialog to edit residence
const editResidence = (residence) => {
  isEditing.value = true
  // Find current manager if any
  const currentManager = managementUsers.value.find(user => user.residenceID === residence.residenceID);
  
  residenceForm.value = { 
    ...residence,
    currentManagerID: currentManager?.userID || null,
    selectedManagerID: currentManager?.userID || null
  }
  
  // Reset file upload variables but maintain displayPhotoUrl
  uploadedImage.value = null
  previewUrl.value = ''
  isUploading.value = false
  uploadProgress.value = 0
  
  residenceFormDialog.value = true
}

// Edit from details dialog
const editFromDetails = () => {
  if (selectedResidence.value) {
    isEditing.value = true
    // Find current manager if any
    const currentManager = selectedResidence.value.managementUser;
    
    residenceForm.value = { 
      ...selectedResidence.value,
      currentManagerID: currentManager?.userID || null,
      selectedManagerID: currentManager?.userID || null
    }
    
    // Reset file upload variables but maintain displayPhotoUrl
    uploadedImage.value = null
    previewUrl.value = ''
    isUploading.value = false
    uploadProgress.value = 0
    
    showDetailsDialog.value = false
    residenceFormDialog.value = true
  }
}

// View residence details
const viewDetails = (residence) => {
  selectedResidence.value = residence
  showDetailsDialog.value = true
}

// Save or update residence
const saveResidence = async () => {
  if (!residenceForm.value.residenceName || !residenceForm.value.residenceAddress || !residenceForm.value.residenceTotalUnit) {
    toast.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Residence name, address, and total units are required',
      life: 3000
    })
    return
  }

  try {
    savingResidence.value = true

    // Upload image if selected
    if (uploadedImage.value) {
      const photoUrl = await uploadImageToSupabase()
      if (photoUrl) {
        residenceForm.value.displayPhotoUrl = photoUrl
      }
    }

    // Create residence object - don't include manager info in the residence record
    const residenceData = {
      residenceName: residenceForm.value.residenceName,
      residenceAddress: residenceForm.value.residenceAddress,
      displayPhotoUrl: residenceForm.value.displayPhotoUrl,
      residenceTotalUnit: residenceForm.value.residenceTotalUnit,
      residenceTotalOccupiedUnits: residenceForm.value.residenceTotalOccupiedUnits,
      residenceTotalResident: residenceForm.value.residenceTotalResident
    }

    let result

    if (isEditing.value) {
      // Update existing residence
      const { data, error } = await supabase
        .from('Residence')
        .update(residenceData)
        .eq('residenceID', residenceForm.value.residenceID)
        .select()

      if (error) throw error
      result = data[0]

      // Update manager assignment if needed
      if (residenceForm.value.currentManagerID !== residenceForm.value.selectedManagerID) {
        // If there was a previous manager, remove their assignment
        if (residenceForm.value.currentManagerID) {
          await supabase
            .from('User')
            .update({ residenceID: null })
            .eq('userID', residenceForm.value.currentManagerID)
        }
        
        // If a new manager is selected, assign them to this residence
        if (residenceForm.value.selectedManagerID) {
          await supabase
            .from('User')
            .update({ residenceID: result.residenceID })
            .eq('userID', residenceForm.value.selectedManagerID)
        }
      }

      // Refresh data to get updated management users
      await fetchManagementUsers()
      
      // Find updated manager
      const updatedManager = managementUsers.value.find(
        user => user.residenceID === result.residenceID
      );
      
      result = {
        ...result,
        managementUser: updatedManager || null
      }

      // Update in local array
      const index = residences.value.findIndex(r => r.residenceID === result.residenceID)
      if (index !== -1) {
        residences.value[index] = result
      }

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Residence has been updated',
        life: 3000
      })
    } else {
      // Insert new residence
      const { data, error } = await supabase
        .from('Residence')
        .insert(residenceData)
        .select()

      if (error) throw error
      result = data[0]

      // If a manager is selected, assign them to this residence
      if (residenceForm.value.selectedManagerID) {
        await supabase
          .from('User')
          .update({ residenceID: result.residenceID })
          .eq('userID', residenceForm.value.selectedManagerID)
      }

      // Refresh data to get updated management users
      await fetchManagementUsers()
      
      // Find assigned manager
      const assignedManager = managementUsers.value.find(
        user => user.residenceID === result.residenceID
      );
      
      result = {
        ...result,
        managementUser: assignedManager || null
      }

      // Add to local array
      residences.value.unshift(result)

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'New residence has been created',
        life: 3000
      })
    }

    residenceFormDialog.value = false
  } catch (error) {
    console.error('Error saving residence:', error)
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save residence',
      life: 3000
    })
  } finally {
    savingResidence.value = false
  }
}

// Fetch residences from database
const fetchResidences = async () => {
  try {
    loading.value = true
    // First, fetch all residences
    const { data, error } = await supabase
      .from('Residence')
      .select('*')
      .order('residenceName')

    if (error) throw error
    
    // Then match the management users assigned to this residence
    const enhancedResidences = data.map(residence => {
      // Find management users assigned to this residence
      const managementUser = managementUsers.value.find(user => 
        user.residenceID === residence.residenceID
      );
      
      return {
        ...residence,
        managementUser
      };
    });
    
    residences.value = enhancedResidences;
  } catch (error) {
    console.error('Error fetching residences:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch residences',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// Calculate occupancy percentage
const calculateOccupancyPercentage = (residence) => {
  if (!residence.residenceTotalUnit) return 0
  return Math.round((residence.residenceTotalOccupiedUnits / residence.residenceTotalUnit) * 100)
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Lifecycle hooks
onMounted(async () => {
  await fetchManagementUsers()
  await fetchResidences()
})

// File handling methods
const onFileSelect = (event) => {
  uploadedImage.value = event.files[0]
  if (uploadedImage.value) {
    // Create a preview URL
    previewUrl.value = URL.createObjectURL(uploadedImage.value)
  }
}

const uploadImageToSupabase = async () => {
  if (!uploadedImage.value) return null
  
  try {
    isUploading.value = true
    uploadProgress.value = 0
    
    const file = uploadedImage.value
    const fileExt = file.name.split('.').pop()
    // Generate a unique file name using timestamp and random string
    const timestamp = new Date().getTime()
    const random = Math.floor(Math.random() * 10000)
    const fileName = `residence_${timestamp}_${random}.${fileExt}`
    const filePath = `image/${fileName}`
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 300)
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('residence')
      .upload(filePath, file)
    
    clearInterval(progressInterval)
    
    if (error) throw error
    
    // Set final progress
    uploadProgress.value = 100
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('residence')
      .getPublicUrl(filePath)
    
    // Return the public URL
    return publicUrlData.publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    toast.add({
      severity: 'error',
      summary: 'Upload Failed',
      detail: 'Failed to upload image. Please try again.',
      life: 3000
    })
    return null
  } finally {
    isUploading.value = false
  }
}
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
:deep(.residence-details-dialog) {
  @apply rounded-lg overflow-hidden;
}

:deep(.residence-details-dialog .p-dialog-header) {
  @apply bg-primary-50 border-b border-primary-100 px-6 py-4;
}

:deep(.residence-details-dialog .p-dialog-content) {
  @apply p-6;
}

:deep(.residence-details-dialog .p-dialog-footer) {
  @apply p-4 border-t border-gray-100;
}

:deep(.residence-details-dialog .p-dialog-title) {
  @apply text-lg font-semibold text-primary-700;
}
</style> 