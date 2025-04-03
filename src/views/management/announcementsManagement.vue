<template>
  <Toast position="top-right" />
  <div class="p-8">
    <div class="flex justify-between items-center">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-[#4D5BBF]">Announcements Management</h1>
        <p class="text-gray-600 mt-2">Create and manage announcements for residents</p>
      </div>
      <Button
        icon="pi pi-plus" 
        label="New Announcement"
        raised
        class="text-sm"
        @click="openNewAnnouncementDialog"
        tooltip="Create a new announcement"
        tooltipOptions="top" />
    </div>

    <div class="card bg-white rounded-lg shadow border border-gray-200">
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <SelectButton v-model="activeTab" :options="tabs" />
        </div>
        <div class="flex space-x-2">
          <span class="p-input-icon-left relative" style="min-width: 250px;">
            <i class="pi pi-search" />
            <InputText 
              v-model="filters.global.value" 
              :placeholder="`Search ${activeTab.toLowerCase()}...`"
              class="p-inputtext-sm border-primary-200 focus:border-primary-500 w-full pl-10" 
            />
          </span>
        </div>
      </div>

      <div class="transition-wrapper">
        <Transition name="fade-slide" mode="out-in">
          <div v-if="activeTab === 'All'" key="all">
            <DataTable
              :value="announcements"
              :paginator="true"
              :rows="10"
              :loading="loading"
              v-model:filters="filters"
              responsiveLayout="scroll"
              class="p-datatable-lg border-t border-gray-200"
            >
              <Column field="announcementTitle" header="Title" sortable></Column>
              <Column field="created_at" header="Date Created" sortable>
                <template #body="{ data }">
                  <div class="flex flex-col">
                    <span class="font-medium">
                      {{ new Date(data.created_at).toLocaleDateString() }}
                    </span>
                    <span class="">
                      {{ new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                    </span>
                  </div>
                </template>
              </Column>
              <Column field="announcementStatus" header="Status" sortable>
                <template #body="{ data }">
                  <span :class="{
                    'px-3 py-1 rounded-full inline-flex justify-center items-center': true,
                    'bg-green-100 text-green-800': data.announcementStatus === 'Published',
                    'bg-yellow-100 text-yellow-800': data.announcementStatus === 'Draft',
                    'bg-red-100 text-red-800': data.announcementStatus === 'Archived'
                  }">
                    {{ data.announcementStatus }}
                  </span>
                </template>
              </Column>
              <Column field="announcementVisibility" header="Visibility" sortable>
                <template #body="{ data }">
                  <span :class="{
                    'px-3 py-1 rounded-full': true,
                    'bg-blue-100 text-blue-800': data.announcementVisibility === 'Public',
                    'bg-purple-100 text-purple-800': data.announcementVisibility === 'Private'
                  }">
                    {{ data.announcementVisibility }}
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
                    <Button 
                      icon="pi pi-pencil" 
                      class="p-button-rounded p-button-text p-button-sm text-primary-600"
                      @click="editAnnouncement(slotProps.data)"
                      tooltip="Edit"
                      tooltipOptions="top"
                    />
                    <Button 
                      icon="pi pi-trash" 
                      class="p-button-rounded p-button-text p-button-sm text-red-600"
                      @click="confirmDelete(slotProps.data)"
                      tooltip="Delete"
                      tooltipOptions="top"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
          <div v-else-if="activeTab === 'Published'" key="published">
            <DataTable
              :value="publishedAnnouncements"
              :paginator="true"
              :rows="10"
              :loading="loading"
              v-model:filters="filters"
              responsiveLayout="scroll"
              class="p-datatable-lg border-t border-gray-200"
            >
              <Column field="announcementTitle" header="Title" sortable></Column>
              <Column field="created_at" header="Date Published" sortable>
                <template #body="{ data }">
                  <div class="flex flex-col">
                    <span class="font-medium">
                      {{ new Date(data.created_at).toLocaleDateString() }}
                    </span>
                    <span class="">
                      {{ new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                    </span>
                  </div>
                </template>
              </Column>
              <Column field="announcementVisibility" header="Visibility" sortable>
                <template #body="{ data }">
                  <span :class="{
                    'px-3 py-1 rounded-full': true,
                    'bg-blue-100 text-blue-800': data.announcementVisibility === 'Public',
                    'bg-purple-100 text-purple-800': data.announcementVisibility === 'Private'
                  }">
                    {{ data.announcementVisibility }}
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
                    <Button 
                      icon="pi pi-pencil" 
                      class="p-button-rounded p-button-text p-button-sm text-primary-600"
                      @click="editAnnouncement(slotProps.data)"
                      tooltip="Edit"
                      tooltipOptions="top"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
          <div v-else-if="activeTab === 'Drafts'" key="drafts">
            <DataTable
              :value="draftAnnouncements"
              :paginator="true"
              :rows="10"
              :loading="loading"
              v-model:filters="filters"
              responsiveLayout="scroll"
              class="p-datatable-lg border-t border-gray-200"
            >
              <Column field="announcementTitle" header="Title" sortable></Column>
              <Column field="created_at" header="Date Created" sortable>
                <template #body="{ data }">
                  <div class="flex flex-col">
                    <span class="font-medium">
                      {{ new Date(data.created_at).toLocaleDateString() }}
                    </span>
                    <span class="">
                      {{ new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                    </span>
                  </div>
                </template>
              </Column>
              <Column field="announcementVisibility" header="Visibility" sortable>
                <template #body="{ data }">
                  <span :class="{
                    'px-3 py-1 rounded-full': true,
                    'bg-blue-100 text-blue-800': data.announcementVisibility === 'Public',
                    'bg-purple-100 text-purple-800': data.announcementVisibility === 'Private'
                  }">
                    {{ data.announcementVisibility }}
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
                    <Button 
                      icon="pi pi-pencil" 
                      class="p-button-rounded p-button-text p-button-sm text-primary-600"
                      @click="editAnnouncement(slotProps.data)"
                      tooltip="Edit"
                      tooltipOptions="top"
                    />
                    <Button 
                      icon="pi pi-check" 
                      class="p-button-rounded p-button-text p-button-sm text-green-600"
                      @click="publishAnnouncement(slotProps.data)"
                      tooltip="Publish"
                      tooltipOptions="top"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </Transition>
      </div>
    </div>
  </div>

  <Dialog 
    v-model:visible="detailsDialog" 
    :modal="true"
    header="Announcement Details"
    :style="{width: '30rem'}"
    :breakpoints="{'960px': '75vw', '640px': '90vw'}"
    class="shadow-lg rounded-lg overflow-hidden"
    :closable="true"
  >
    <div v-if="selectedItem" class="p-1 space-y-6">
      <!-- Title Section -->
      <div class="border-b border-gray-100 pb-4">
        <h3 class="text-xs font-medium uppercase tracking-wide text-gray-500">Title</h3>
        <p class="mt-1 text-base font-medium text-gray-800">{{ selectedItem.announcementTitle }}</p>
      </div>

      <!-- Status Section -->
      <div class="border-b border-gray-100 pb-4">
        <h3 class="text-xs font-medium uppercase tracking-wide text-gray-500">Status</h3>
        <div class="mt-2">
          <span :class="{
            'px-3 py-1.5 rounded-full inline-flex items-center text-sm font-medium': true,
            'bg-green-100 text-green-800': selectedItem.announcementStatus === 'Published',
            'bg-yellow-100 text-yellow-800': selectedItem.announcementStatus === 'Draft',
            'bg-red-100 text-red-800': selectedItem.announcementStatus === 'Archived'
          }">
            <span :class="{
              'w-2 h-2 rounded-full mr-2': true,
              'bg-green-500': selectedItem.announcementStatus === 'Published',
              'bg-yellow-500': selectedItem.announcementStatus === 'Draft',
              'bg-red-500': selectedItem.announcementStatus === 'Archived'
            }"></span>
            {{ selectedItem.announcementStatus }}
          </span>
        </div>
      </div>

      <!-- Visibility Section -->
      <div class="border-b border-gray-100 pb-4">
        <h3 class="text-xs font-medium uppercase tracking-wide text-gray-500">Visibility</h3>
        <div class="mt-2">
          <span :class="{
            'px-3 py-1.5 rounded-full inline-flex items-center text-sm font-medium': true,
            'bg-blue-100 text-blue-800': selectedItem.announcementVisibility === 'Public',
            'bg-purple-100 text-purple-800': selectedItem.announcementVisibility === 'Private'
          }">
            {{ selectedItem.announcementVisibility }}
          </span>
        </div>
      </div>

      <!-- Date Section -->
      <div class="border-b border-gray-100 pb-4">
        <h3 class="text-xs font-medium uppercase tracking-wide text-gray-500">
          Date Created
        </h3>
        <div class="mt-2 flex items-center">
          <div class="mr-3 p-2 bg-gray-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-base font-medium text-gray-800">
              {{ new Date(selectedItem.created_at).toLocaleDateString() }}
            </p>
            <p class="text-xs text-gray-500">
              {{ new Date(selectedItem.created_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="pb-2">
        <h3 class="text-xs font-medium uppercase tracking-wide text-gray-500">Content</h3>
        <div class="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
          {{ selectedItem.announcementDescription }}
        </div>
      </div>

      <!-- Attachment Section (if available) -->
      <div v-if="selectedItem.announcementAttachmentUrl" class="pb-2">
        <h3 class="text-xs font-medium uppercase tracking-wide text-gray-500">Attachment</h3>
        <div class="mt-2 space-y-2">
          <!-- Preview for image attachments -->
          <div v-if="isImageAttachment(selectedItem.announcementAttachmentUrl)" class="border border-gray-200 rounded-lg overflow-hidden">
            <img :src="selectedItem.announcementAttachmentUrl" alt="Attachment" class="max-h-48 object-contain w-full" />
          </div>
          <!-- Icon for non-image attachments -->
          <div v-else class="flex items-center text-gray-700 p-2 bg-gray-50 rounded-lg">
            <i :class="getAttachmentIcon(selectedItem.announcementAttachmentUrl)" class="text-2xl mr-2"></i>
            <span>{{ getAttachmentName(selectedItem.announcementAttachmentUrl) }}</span>
          </div>
          <!-- Download link -->
          <a :href="selectedItem.announcementAttachmentUrl" target="_blank" download class="text-primary-600 hover:underline flex items-center mt-2">
            <i class="pi pi-download mr-2"></i>
            Download Attachment
          </a>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="py-3 flex justify-end gap-2">
        <Button 
          v-if="selectedItem?.announcementStatus === 'Draft'"
          label="Publish" 
          icon="pi pi-check" 
          class="text-sm"
          @click="publishAnnouncement(selectedItem)"
        />
        <Button 
          label="Edit" 
          icon="pi pi-pencil" 
          class="text-sm"
          @click="editAnnouncement(selectedItem)"
        />
      </div>
    </template>
  </Dialog>

  <Dialog 
    v-model:visible="editorDialog" 
    :modal="true"
    :header="editMode ? 'Edit Announcement' : 'New Announcement'"
    :style="{width: '40rem'}"
    :breakpoints="{'960px': '75vw', '640px': '90vw'}"
    class="shadow-lg rounded-lg overflow-hidden"
    :closable="true"
  >
    <div class="p-1 space-y-4">
      <div class="mb-4">
        <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <InputText id="title" v-model="formModel.announcementTitle" class="w-full" />
      </div>

      <div class="mb-4">
        <label for="content" class="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <Textarea id="content" v-model="formModel.announcementDescription" rows="5" class="w-full" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="mb-4">
          <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <Dropdown id="status" v-model="formModel.announcementStatus" :options="['Draft', 'Published', 'Archived']" class="w-full" />
        </div>

        <div class="mb-4">
          <label for="visibility" class="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
          <Dropdown id="visibility" v-model="formModel.announcementVisibility" :options="['Public', 'Private']" class="w-full" />
        </div>
      </div>

      <div class="mb-4">
        <label for="attachment" class="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
        <div class="flex flex-col gap-2">
          <div v-if="formModel.announcementAttachmentUrl && !uploadFile" class="flex items-center mb-2">
            <a :href="formModel.announcementAttachmentUrl" target="_blank" class="text-primary-600 hover:underline flex items-center mr-4">
              <i class="pi pi-paperclip mr-2"></i>
              Current attachment
            </a>
            <Button 
              icon="pi pi-times" 
              severity="danger" 
              text
              aria-label="Remove attachment"
              @click="formModel.announcementAttachmentUrl = ''"
            />
          </div>
          <div v-if="!uploadFile && !uploadingFile" class="flex flex-col">
            <FileUpload 
              mode="basic" 
              :multiple="false"
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              :maxFileSize="5000000"
              chooseLabel="Choose File"
              class="mb-2"
              @select="onFileSelect"
              :auto="true"
              customUpload
              @uploader="onCustomUpload"
            />
            <small class="text-gray-500">Max size: 5MB. Accepted formats: Images, PDF, Office documents, text</small>
          </div>
          <div v-if="uploadFile && !uploadingFile" class="flex flex-col gap-2">
            <div class="flex items-center">
              <span class="text-sm mr-4">{{ uploadFile.name }} ({{ Math.round(uploadFile.size/1024) }} KB)</span>
              <Button 
                icon="pi pi-times" 
                severity="danger" 
                text
                aria-label="Remove file"
                @click="uploadFile = null"
              />
            </div>
            <!-- File preview for images -->
            <div v-if="isImageFile && filePreview" class="mt-2 border border-gray-200 rounded-lg overflow-hidden max-w-sm">
              <img :src="filePreview" class="max-h-48 object-contain w-full" />
            </div>
            <!-- PDF preview (just an icon for non-images) -->
            <div v-else-if="uploadFile" class="mt-2 flex items-center text-gray-600">
              <i :class="fileTypeIcon" class="text-2xl mr-2"></i>
              <span>File selected (preview not available)</span>
            </div>
          </div>
          <div v-if="uploadingFile" class="flex items-center">
            <i class="pi pi-spin pi-spinner mr-2"></i>
            <span>Uploading file...</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="py-3 flex justify-end gap-2">
        <Button 
          label="Cancel" 
          icon="pi pi-times" 
          class="p-button-text text-sm"
          @click="editorDialog = false"
        />
        <Button 
          label="Save" 
          icon="pi pi-save" 
          class="text-sm"
          @click="saveAnnouncement"
        />
        <Button 
          v-if="formModel.announcementStatus === 'Draft'"
          label="Save & Publish" 
          icon="pi pi-check" 
          class="p-button-success text-sm"
          @click="saveAndPublish"
        />
      </div>
    </template>
  </Dialog>

  <ConfirmDialog />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/api/supabase'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import SelectButton from 'primevue/selectbutton'
import Toast from 'primevue/toast'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import ConfirmDialog from 'primevue/confirmdialog'
import FileUpload from 'primevue/fileupload'
import { logService } from '@/api/logService'

const toast = useToast()
const confirm = useConfirm()
const authStore = useAuthStore()
const loading = ref(false)
const announcements = ref([])
const activeTab = ref('All')
const tabs = ['All', 'Published', 'Drafts']
const detailsDialog = ref(false)
const editorDialog = ref(false)
const selectedItem = ref(null)
const editMode = ref(false)
const uploadFile = ref(null)
const uploadingFile = ref(false)
const uploadProgress = ref(0)
const filePreview = ref(null)
const isImageFile = ref(false)
const fileTypeIcon = ref('pi pi-file')

const filters = ref({
  global: { value: null, matchMode: 'contains' }
})

const formModel = ref({
  announcementID: null,
  announcementTitle: '',
  announcementDescription: '',
  announcementStatus: 'Draft',
  announcementVisibility: 'Public',
  announcementAttachmentUrl: '',
  announcementUserID: authStore.user?.id || null
})

const publishedAnnouncements = computed(() => {
  return announcements.value.filter(a => a.announcementStatus === 'Published')
})

const draftAnnouncements = computed(() => {
  return announcements.value.filter(a => a.announcementStatus === 'Draft')
})

const resetForm = () => {
  formModel.value = {
    announcementID: null,
    announcementTitle: '',
    announcementDescription: '',
    announcementStatus: 'Draft',
    announcementVisibility: 'Public',
    announcementAttachmentUrl: '',
    announcementUserID: authStore.user?.id || null
  }
}

const viewDetails = (item) => {
  selectedItem.value = item
  detailsDialog.value = true
}

const openNewAnnouncementDialog = () => {
  resetForm()
  clearFileData()
  editMode.value = false
  editorDialog.value = true
}

const editAnnouncement = (item) => {
  formModel.value = { ...item }
  clearFileData()
  editMode.value = true
  detailsDialog.value = false
  editorDialog.value = true
}

const confirmDelete = (item) => {
  confirm.require({
    message: 'Are you sure you want to delete this announcement?',
    header: 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteAnnouncement(item)
    }
  })
}

const deleteAnnouncement = async (item) => {
  try {
    // First check if there's an attachment to delete
    if (item.announcementAttachmentUrl) {
      try {
        // Extract the file path from the URL
        const urlParts = item.announcementAttachmentUrl.split('/')
        const fileName = urlParts[urlParts.length - 1]
        const filePath = `announcement-attachments/${fileName}`
        
        // Delete the file from storage
        const { error: storageError } = await supabase
          .storage
          .from('announcement-attachments')
          .remove([filePath])
        
        if (storageError) {
          console.error('Warning: Could not delete attachment file:', storageError)
        }
      } catch (storageError) {
        console.error('Error parsing or deleting attachment:', storageError)
      }
    }
    
    // Delete the announcement record
    const { error } = await supabase
      .from('Announcement')
      .delete()
      .eq('announcementID', item.announcementID)
    
    if (error) throw error
    
    // Update local state
    announcements.value = announcements.value.filter(a => a.announcementID !== item.announcementID)
    
    // Close dialog if open
    if (detailsDialog.value && selectedItem.value?.announcementID === item.announcementID) {
      detailsDialog.value = false
    }
    
    // Log announcement deletion
    await logService.logAction({
      action: 'delete',
      description: `Deleted announcement: ${item.announcementTitle}`,
      targetTable: 'Announcement',
      targetID: item.announcementID,
      metadata: {
        title: item.announcementTitle,
        status: item.announcementStatus,
        visibility: item.announcementVisibility,
        deletedAt: new Date().toISOString()
      }
    })
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Announcement has been deleted',
      life: 3000
    })
  } catch (error) {
    console.error('Error deleting announcement:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete announcement',
      life: 3000
    })
  }
}

const saveAnnouncement = async () => {
  if (!formModel.value.announcementTitle) {
    toast.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Title is required',
      life: 3000
    })
    return
  }

  try {
    // Handle file upload if there's a file
    let attachmentUrl = formModel.value.announcementAttachmentUrl

    if (uploadFile.value) {
      uploadingFile.value = true
      
      // Create a unique file name using timestamp and original name
      const timestamp = new Date().getTime()
      const fileExt = uploadFile.value.name.split('.').pop()
      const safeName = uploadFile.value.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)
      const fileName = `${safeName}_${timestamp}.${fileExt}`
      const filePath = `announcement-attachments/${fileName}`
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('announcement-attachments')
        .upload(filePath, uploadFile.value)
        
      if (uploadError) throw uploadError
      
      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('announcement-attachments')
        .getPublicUrl(filePath)
        
      attachmentUrl = publicUrl
      console.log('File uploaded successfully:', attachmentUrl)
      uploadFile.value = null
    }

    const currentDate = new Date().toISOString()
    
    if (editMode.value) {
      // Update existing announcement
      const { data, error } = await supabase
        .from('Announcement')
        .update({
          announcementTitle: formModel.value.announcementTitle,
          announcementDescription: formModel.value.announcementDescription,
          announcementStatus: formModel.value.announcementStatus,
          announcementVisibility: formModel.value.announcementVisibility,
          announcementAttachmentUrl: attachmentUrl,
          updated_at: currentDate
        })
        .eq('announcementID', formModel.value.announcementID)
        .select()
      
      if (error) throw error
      
      // Update local state
      const index = announcements.value.findIndex(a => a.announcementID === formModel.value.announcementID)
      if (index !== -1) {
        announcements.value[index] = { ...data[0] }
      }
      
      // Log announcement update
      await logService.logAction({
        action: 'update',
        description: `Updated announcement: ${formModel.value.announcementTitle}`,
        targetTable: 'Announcement',
        targetID: formModel.value.announcementID,
        metadata: {
          title: formModel.value.announcementTitle,
          content: formModel.value.announcementDescription
        }
      })
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Announcement has been updated',
        life: 3000
      })
    } else {
      // Create new announcement
      const { data, error } = await supabase
        .from('Announcement')
        .insert({
          announcementTitle: formModel.value.announcementTitle,
          announcementDescription: formModel.value.announcementDescription,
          announcementStatus: formModel.value.announcementStatus,
          announcementVisibility: formModel.value.announcementVisibility,
          announcementAttachmentUrl: attachmentUrl,
          announcementUserID: authStore.userDetails?.userID
        })
        .select()
      
      if (error) throw error
      
      // Update local state
      announcements.value.unshift(data[0])
      
      // Log announcement creation
      await logService.logAction({
        action: 'create',
        description: `Created new announcement: ${formModel.value.announcementTitle}`,
        targetTable: 'Announcement',
        targetID: data[0].announcementID,
        metadata: {
          title: formModel.value.announcementTitle,
          content: formModel.value.announcementDescription
        }
      })
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'New announcement has been created',
        life: 3000
      })
    }
    
    editorDialog.value = false
    clearFileData()
    
  } catch (error) {
    console.error('Error saving announcement:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save announcement',
      life: 3000
    })
  } finally {
    uploadingFile.value = false
  }
}

const saveAndPublish = async () => {
  formModel.value.announcementStatus = 'Published'
  await saveAnnouncement()
}

const publishAnnouncement = async (item) => {
  try {
    const currentDate = new Date().toISOString()
    
    // Get previous state for logging
    const { data: previousData, error: fetchError } = await supabase
      .from('Announcement')
      .select('*')
      .eq('announcementID', item.announcementID)
      .single()
      
    if (fetchError) throw fetchError
    
    // Update the announcement status
    const { data, error } = await supabase
      .from('Announcement')
      .update({ 
        announcementStatus: 'Published',
        updated_at: currentDate
      })
      .eq('announcementID', item.announcementID)
      .select()
    
    if (error) throw error
    
    // Update local state
    const index = announcements.value.findIndex(a => a.announcementID === item.announcementID)
    if (index !== -1) {
      announcements.value[index] = { ...data[0] }
      
      if (selectedItem.value && selectedItem.value.announcementID === item.announcementID) {
        selectedItem.value = { ...data[0] }
      }
    }
    
    // Log announcement publication with more detailed metadata
    await logService.logAction({
      action: 'publish',
      description: `Published announcement: ${item.announcementTitle}`,
      targetTable: 'Announcement',
      targetID: item.announcementID,
      metadata: {
        title: item.announcementTitle,
        previousStatus: previousData.announcementStatus,
        newStatus: 'Published',
        visibility: item.announcementVisibility,
        publishedAt: currentDate,
        hasAttachment: !!item.announcementAttachmentUrl
      }
    })
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Announcement has been published',
      life: 3000
    })
  } catch (error) {
    console.error('Error publishing announcement:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to publish announcement',
      life: 3000
    })
  }
}

const fetchAnnouncements = async () => {
  try {
    loading.value = true
    
    const { data, error } = await supabase
      .from('Announcement')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    announcements.value = data || []
    console.log('Fetched announcements:', announcements.value)
    
  } catch (error) {
    console.error('Error fetching announcements:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch announcements',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// File type helpers
const getFileIcon = (fileName) => {
  const extension = fileName?.split('.').pop()?.toLowerCase()
  
  switch(extension) {
    case 'pdf': return 'pi pi-file-pdf'
    case 'doc':
    case 'docx': return 'pi pi-file-word'
    case 'xls':
    case 'xlsx': return 'pi pi-file-excel'
    case 'ppt':
    case 'pptx': return 'pi pi-file-powerpoint'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp': return 'pi pi-image'
    case 'txt': return 'pi pi-file-text'
    default: return 'pi pi-file'
  }
}

const onFileSelect = (event) => {
  const file = event.files[0]
  if (!file) return
  
  uploadFile.value = file
  
  // Update file icon
  fileTypeIcon.value = getFileIcon(file.name)
  
  // Check if the file is an image and create preview
  isImageFile.value = file.type.startsWith('image/')
  
  if (isImageFile.value) {
    const reader = new FileReader()
    reader.onload = (e) => {
      filePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    filePreview.value = null
  }
}

const onCustomUpload = (event) => {
  // This is just a placeholder as we handle the upload in saveAnnouncement
  // We need this function to prevent the error
}

// Clear file data when canceling or closing
const clearFileData = () => {
  uploadFile.value = null
  filePreview.value = null
  isImageFile.value = false
}

// Attachment display helpers
const isImageAttachment = (url) => {
  if (!url) return false
  
  const extension = url.split('.').pop()?.toLowerCase()
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  return imageExtensions.includes(extension)
}

const getAttachmentIcon = (url) => {
  if (!url) return 'pi pi-file'
  return getFileIcon(url)
}

const getAttachmentName = (url) => {
  if (!url) return 'Attachment'
  
  try {
    const urlParts = url.split('/')
    return decodeURIComponent(urlParts[urlParts.length - 1])
  } catch (error) {
    return 'Attachment'
  }
}

onMounted(async () => {
  await fetchAnnouncements()
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm;
}

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