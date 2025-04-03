<template>
  <div class="p-8">
    <div class="flex justify-between items-end mb-6">
      <div>
        <h1 class="text-2xl font-bold text-[#4D5BBF]">Communication Management</h1>
        <p class="text-gray-600 mt-2">Direct messaging with residents</p>
      </div>
    </div>

    <div class="flex gap-6 h-[75vh]">
      <!-- Residents List - Left Column -->
      <div class="w-1/3 bg-white rounded-lg shadow border border-gray-200 flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-[#4D5BBF]">Residents</h2>
          <div class="mt-3">
            <span class="p-input-icon-left w-full">
              <InputText v-model="searchQuery" placeholder="Search residents..." class="w-full p-2 text-sm" />
            </span>
          </div>
        </div>
        
        <div class="overflow-y-auto flex-1">
          <div v-if="loading" class="flex justify-center items-center h-full">
            <i class="pi pi-spin pi-spinner text-primary-500 text-2xl"></i>
          </div>
          
          <div v-else-if="chatrooms.length === 0" class="flex flex-col justify-center items-center h-full text-gray-500">
            <i class="pi pi-user text-4xl mb-3"></i>
            <p>No residents available</p>
          </div>
          
          <div 
            v-else
            v-for="chatroom in filteredChatrooms" 
            :key="chatroom.id"
            @click="selectChatroom(chatroom)"
            :class="[
              'p-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50',
              selectedChatroom && selectedChatroom.id === chatroom.id ? 'bg-primary-50' : ''
            ]"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                {{ getChatroomInitial(chatroom) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center">
                  <h3 class="font-medium text-gray-800 truncate">{{ chatroom.name }}</h3>
                  <span class="text-xs text-gray-500">{{ formatTime(chatroom.lastMessageTime) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <p class="text-sm text-gray-500 truncate flex-1">{{ chatroom.lastMessage || 'No messages yet' }}</p>
                  <span v-if="chatroom.unreadCount" class="flex-shrink-0 px-2 py-0.5 rounded-full bg-primary-500 text-white text-xs">
                    {{ chatroom.unreadCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-3 border-t border-gray-200">
          <Button 
            label="Message New Resident" 
            icon="pi pi-plus" 
            class="p-button-primary w-full"
            @click="openNewChatroomDialog"
          />
        </div>
      </div>
      
      <!-- Chat Messages - Right Column -->
      <div class="w-2/3 bg-white rounded-lg shadow border border-gray-200 flex flex-col">
        <div v-if="!selectedChatroom" class="flex flex-col justify-center items-center h-full text-gray-500">
          <i class="pi pi-comments text-6xl mb-4 opacity-30"></i>
          <p class="text-xl">Select a resident to view conversation</p>
          <p class="mt-2">Start messaging with residents directly</p>
        </div>
        
        <transition 
          name="chatroom-transition"
          mode="out-in"
        >
          <template v-if="selectedChatroom">
            <div :key="selectedChatroom.id" class="flex flex-col h-full">
              <!-- Chat Header -->
              <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                    {{ getChatroomInitial(selectedChatroom) }}
                  </div>
                  <div>
                    <h2 class="text-xl font-semibold text-gray-800">{{ selectedChatroom.name }}</h2>
                    <p class="text-sm text-gray-500">{{ selectedChatroom.residenceUnit || 'Unit information not available' }}</p>
                  </div>
                </div>
                <div>
                  <Button 
                    icon="pi pi-ellipsis-h" 
                    class="p-button-text p-button-rounded" 
                    @click="toggleChatroomMenu"
                    aria-haspopup="true" 
                    aria-controls="chatroom-menu"
                  />
                  <Menu id="chatroom-menu" ref="chatroomMenu" :model="chatroomMenuItems" :popup="true" />
                </div>
              </div>
              
              <!-- Chat Messages -->
              <div class="flex-1 overflow-y-auto p-4 conversation-container" ref="messagesContainer">
                <div v-if="loading" class="flex justify-center items-center h-full">
                  <i class="pi pi-spin pi-spinner text-primary-500 text-2xl"></i>
                </div>
                
                <div v-else-if="messages.length === 0" class="flex flex-col justify-center items-center h-full text-gray-500">
                  <i class="pi pi-inbox text-4xl mb-3"></i>
                  <p>No messages yet</p>
                  <p class="mt-2 text-sm">Be the first to send a message!</p>
                </div>
                
                <transition-group 
                  name="message-list" 
                  tag="div"
                  class="message-container"
                >
                  <div v-for="(message, index) in messages" :key="message.id" class="mb-4">
                    <div v-if="showDateDivider(message, index)" class="flex justify-center my-4">
                      <div class="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
                        {{ formatMessageDate(message.timestamp) }}
                      </div>
                    </div>
                    
                    <div :class="[
                      'flex gap-3 max-w-[80%]',
                      message.senderId === currentUserId ? 'ml-auto justify-end' : ''
                    ]">
                      <div v-if="message.senderId !== currentUserId" class="w-8 h-8 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center text-primary-700 font-semibold">
                        {{ message.sender.charAt(0).toUpperCase() }}
                      </div>
                      
                      <div :class="[
                        'py-2 px-3 rounded-lg message-bubble',
                        message.senderId === currentUserId 
                          ? 'bg-primary-100 text-primary-800' 
                          : 'bg-gray-100 text-gray-800'
                      ]">
                        <p v-if="message.content">{{ message.content }}</p>
                        
                        <!-- Attachment preview -->
                        <div v-if="message.attachmentUrl" class="mt-2">
                          <!-- Show image attachments -->
                          <a 
                            v-if="isImageAttachment(message.attachmentUrl)" 
                            href="javascript:void(0)"
                            class="block"
                            @click="showImagePreview(message.attachmentUrl)"
                          >
                            <img 
                              :src="message.attachmentUrl" 
                              alt="Attachment" 
                              class="max-w-full rounded-lg max-h-48 object-contain"
                            />
                          </a>
                          
                          <!-- Show other file types as links -->
                          <a 
                            v-else 
                            :href="message.attachmentUrl" 
                            target="_blank" 
                            class="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200"
                          >
                            <i class="pi pi-file text-primary-500"></i>
                            <span class="text-sm text-primary-700 truncate">{{ getAttachmentName(message.attachmentUrl) }}</span>
                          </a>
                        </div>
                        
                        <div class="flex justify-end items-center mt-1">
                          <span class="text-xs opacity-70">{{ formatMessageTime(message.timestamp) }}</span>
                          <i v-if="message.senderId === currentUserId" :class="[
                            'pi text-xs ml-1',
                            message.read ? 'pi-check-circle text-green-500' : 'pi-check text-gray-400'
                          ]"></i>
                        </div>
                      </div>
                      
                      <div v-if="message.senderId === currentUserId" class="w-8 h-8 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center text-primary-700 font-semibold">
                        {{ getCurrentUserInitial() }}
                      </div>
                    </div>
                  </div>
                </transition-group>
              </div>
              
              <!-- Message Input -->
              <div class="p-3 border-t border-gray-200">
                <!-- Attachment Preview Area -->
                <div v-if="selectedFile" class="bg-white border border-gray-200 p-2 mb-2 rounded">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 flex items-center">
                      <!-- Image preview -->
                      <div v-if="attachmentType === 'image'" class="relative h-12 w-12 bg-gray-100 rounded border border-gray-300 mr-2 overflow-hidden">
                        <img :src="attachmentPreviewUrl" alt="Preview" class="h-full w-full object-cover" />
                      </div>
                      
                      <!-- File preview for non-images -->
                      <div v-else class="relative h-12 w-12 bg-gray-100 rounded border border-gray-300 mr-2 flex items-center justify-center">
                        <i class="pi pi-file text-primary-500 text-xl"></i>
                      </div>
                      
                      <div class="flex-1">
                        <p class="text-sm font-medium truncate">{{ selectedFile.name }}</p>
                        <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
                      </div>
                    </div>
                    <Button
                      icon="pi pi-times"
                      class="p-button-rounded p-button-text p-button-sm"
                      @click="clearAttachmentPreview"
                      aria-label="Remove attachment"
                    />
                  </div>
                </div>
                
                <div class="flex gap-2">
                  <Button 
                    icon="pi pi-paperclip" 
                    class="p-button-text" 
                    @click="handleAttachment"
                    :disabled="!!selectedFile || uploadingAttachment"
                    aria-label="Attach file"
                  />
                  <span class="p-input-icon-right flex-1">
                    <i v-if="sending || uploadingAttachment" class="pi pi-spin pi-spinner"></i>
                    <InputText 
                      v-model="newMessage" 
                      placeholder="Type your message..." 
                      class="w-full p-3"
                      @keydown.enter="sendMessage"
                      :disabled="uploadingAttachment"
                    />
                  </span>
                  <Button 
                    icon="pi pi-send" 
                    class="p-button-primary" 
                    @click="sendMessage"
                    :disabled="(!newMessage.trim() && !selectedFile) || sending || uploadingAttachment"
                  />
                </div>
                <input
                  type="file"
                  ref="fileInput"
                  class="hidden"
                  @change="onFileSelected"
                  accept="image/*,.pdf,.doc,.docx"
                />
              </div>
            </div>
          </template>
        </transition>
      </div>
    </div>
    
    <!-- New Chatroom Dialog -->
    <Dialog 
      v-model:visible="newChatroomDialogVisible" 
      header="Message New Resident" 
      :modal="true" 
      :closable="true"
      :style="{width: '450px'}"
    >
      <div class="p-fluid">
        <div class="field mb-4">
          <label for="residentSelect" class="font-medium block mb-2">Select Resident</label>
          <Dropdown
            id="residentSelect"
            v-model="selectedResident"
            :options="availableResidents"
            optionLabel="name"
            placeholder="Select a resident"
            class="w-full"
            :class="{'p-invalid': newChatroomNameError}"
          />
          <small v-if="newChatroomNameError" class="p-error">{{ newChatroomNameError }}</small>
        </div>
        
        <div class="field mb-4">
          <label for="initialMessage" class="font-medium block mb-2">Initial Message (optional)</label>
          <Textarea 
            id="initialMessage" 
            v-model="newChatroomDescription" 
            placeholder="Enter your first message"
            rows="3"
          />
        </div>
      </div>
      
      <template #footer>
        <Button 
          label="Cancel" 
          icon="pi pi-times" 
          class="p-button-text" 
          @click="newChatroomDialogVisible = false"
        />
        <Button 
          label="Start Conversation" 
          icon="pi pi-comments" 
          class="p-button-primary" 
          @click="createNewChatroom"
          :disabled="!selectedResident"
        />
      </template>
    </Dialog>
    
    <!-- Image Preview Dialog -->
    <Dialog 
      v-model:visible="imagePreviewDialog" 
      :modal="true" 
      :dismissableMask="true"
      :closable="false"
      :style="{ width: '90vw', maxWidth: '900px' }"
      class="image-preview-dialog"
    >
      <div class="flex justify-center">
        <img :src="previewImageUrl" alt="Full size image" class="max-w-full max-h-[80vh] object-contain" />
      </div>
      <template #footer>
        <div class="flex justify-end">
          <Button 
            label="Close" 
            icon="pi pi-times" 
            @click="imagePreviewDialog = false" 
            class="p-button-text"
          />
          <Button 
            label="Download" 
            icon="pi pi-download" 
            @click="downloadFile(previewImageUrl)" 
            class="p-button-text ml-2"
          />
        </div>
      </template>
    </Dialog>
    
    <!-- File Viewer Dialog -->
    <Dialog 
      v-model:visible="filePreviewDialog" 
      :modal="true" 
      :dismissableMask="true"
      :closable="false"
      :style="{ width: '90vw', maxWidth: '900px', height: '80vh' }"
      class="file-preview-dialog"
    >
      <template #header>
        <div class="flex items-center">
          <i class="pi pi-file mr-2 text-primary-500"></i>
          <span class="font-bold">{{ getAttachmentName(previewFileUrl) }}</span>
        </div>
      </template>
      <div class="file-viewer-container">
        <iframe 
          :src="previewFileUrl" 
          class="file-viewer-frame" 
          frameborder="0"
        ></iframe>
      </div>
      <template #footer>
        <div class="flex justify-between w-full">
          <Button 
            label="Close" 
            icon="pi pi-times" 
            @click="filePreviewDialog = false" 
            class="p-button-text"
          />
          <div>
            <Button 
              label="Open in New Tab" 
              icon="pi pi-external-link" 
              @click="window.open(previewFileUrl, '_blank')" 
              class="p-button-text mr-2"
            />
            <Button 
              label="Download" 
              icon="pi pi-download" 
              @click="downloadFile(previewFileUrl)" 
              class="p-button-text"
            />
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import Menu from 'primevue/menu';
import Dropdown from 'primevue/dropdown';
import { supabase } from '@/api/supabase';
import { useToast } from 'primevue/usetoast';
import { logService } from '@/api/logService';

const authStore = useAuthStore();
const currentUserId = ref(authStore.user?.id);

// References
const chatrooms = ref([]);
const messages = ref([]);
const selectedChatroom = ref(null);
const newMessage = ref('');
const searchQuery = ref('');
const messagesContainer = ref(null);
const loading = ref(true);
const sending = ref(false);
const chatroomMenu = ref(null);
const newChatroomDialogVisible = ref(false);
const newChatroomName = ref('');
const newChatroomDescription = ref('');
const newChatroomNameError = ref('');
const selectedResident = ref(null);
const fileInput = ref(null);
const selectedFile = ref(null);
const uploadingAttachment = ref(false);
const attachmentType = ref('');
const attachmentPreviewUrl = ref('');
const imagePreviewDialog = ref(false);
const previewImageUrl = ref('');
const filePreviewDialog = ref(false);
const previewFileUrl = ref('');

// Available residents for the dropdown
const availableResidents = ref([
  { id: 1, name: 'John Smith', unit: 'Unit 101' },
  { id: 2, name: 'Maria Garcia', unit: 'Unit 202' },
  { id: 3, name: 'David Wong', unit: 'Unit 305' },
  { id: 4, name: 'Sarah Johnson', unit: 'Unit 401' }
]);

// Computed properties
const filteredChatrooms = computed(() => {
  if (!searchQuery.value.trim()) {
    return chatrooms.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return chatrooms.value.filter(chatroom => {
    return chatroom.name.toLowerCase().includes(query) || 
           (chatroom.lastMessage && chatroom.lastMessage.toLowerCase().includes(query)) ||
           (chatroom.residenceUnit && chatroom.residenceUnit.toLowerCase().includes(query));
  });
});

// Menu items for the chatroom menu
const chatroomMenuItems = ref([
  {
    label: 'View Resident Details',
    icon: 'pi pi-user',
    command: () => viewResidentDetails()
  },
  {
    label: 'Mark All as Read',
    icon: 'pi pi-check-circle',
    command: () => markAllAsRead()
  },
  { separator: true },
  {
    label: 'Delete Conversation',
    icon: 'pi pi-trash',
    command: () => deleteChatroom()
  }
]);

// Functions
function selectChatroom(chatroom) {
  selectedChatroom.value = chatroom;
  newMessage.value = ''; // Clear message input
  loading.value = true;
  
  // Fetch messages for the selected chatroom
  fetchMessages(chatroom.id)
    .then(() => {
      loading.value = false;
      nextTick(() => {
        scrollToBottom();
      });
      
      // Mark messages as read when opening a chatroom
      if (chatroom.unreadCount > 0) {
        markChatroomAsRead(chatroom.id);
        chatroom.unreadCount = 0;
      }
    })
    .catch(error => {
      console.error('Error fetching messages:', error);
      loading.value = false;
    });
}

async function fetchChatrooms() {
  loading.value = true;
  
  try {
    console.log('Fetching chatrooms from database...');
    
    // Get chatrooms where the current user is the management contact
    const { data: chatData, error: chatError } = await supabase
      .from('Chatroom')
      .select(`
        chatroomID,
        chatroomResidenceID,
        chatroomResidentID,
        chatroomManagementID,
        created_at
      `)
      .eq('chatroomManagementID', currentUserId.value);
      
    if (chatError) throw chatError;
    
    if (!chatData || chatData.length === 0) {
      chatrooms.value = [];
      loading.value = false;
      return;
    }
    
    console.log('Chatrooms found:', chatData.length);
    
    // Get resident info (need to fetch User information)
    const residentIds = chatData.map(chat => chat.chatroomResidentID);
    const { data: residents, error: residentError } = await supabase
      .from('User')
      .select('userID, fullName, email, residenceID, unitNumber')
      .in('userID', residentIds);
      
    if (residentError) console.error('Error fetching residents:', residentError);
    
    console.log('Residents data:', residents);
    
    // Create a map of resident info for easier lookup
    const residentMap = {};
    const unitMap = {};
    
    if (residents && residents.length > 0) {
      residents.forEach(resident => {
        residentMap[resident.userID] = {
          name: resident.fullName || resident.email || 'Unknown Resident',
          email: resident.email,
          residenceID: resident.residenceID
        };
        
        // Store unit number directly from User table
        if (resident.unitNumber) {
          unitMap[resident.userID] = resident.unitNumber;
        }
      });
    }
    
    // Get the last message for each chatroom
    const chatroomIds = chatData.map(chat => chat.chatroomID);
    const lastMessagesPromises = chatroomIds.map(async (chatroomId) => {
      const { data, error } = await supabase
        .from('Message')
        .select('messageID, messageDescription, created_at')
        .eq('messageChatroomID', chatroomId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error) {
        console.error(`Error fetching last message for chatroom ${chatroomId}:`, error);
        return { chatroomId, message: null };
      }
      
      return { 
        chatroomId, 
        message: data && data.length > 0 ? {
          text: data[0].messageDescription,
          time: data[0].created_at
        } : null 
      };
    });
    
    const lastMessagesResults = await Promise.all(lastMessagesPromises);
    const lastMessagesMap = {};
    
    lastMessagesResults.forEach(result => {
      lastMessagesMap[result.chatroomId] = result.message;
    });
    
    // Get unread counts for each chatroom
    const unreadCountPromises = chatroomIds.map(async (chatroomId) => {
      const { data, error, count } = await supabase
        .from('Message')
        .select('messageID', { count: 'exact' })
        .eq('messageChatroomID', chatroomId)
        .neq('messageUserID', currentUserId.value)
        .neq('messageStatus', 'read');
        
      if (error) {
        console.error(`Error fetching unread count for chatroom ${chatroomId}:`, error);
        return { chatroomId, count: 0 };
      }
      
      return { chatroomId, count: count || 0 };
    });
    
    const unreadCountsResults = await Promise.all(unreadCountPromises);
    const unreadCountsMap = {};
    
    unreadCountsResults.forEach(result => {
      unreadCountsMap[result.chatroomId] = result.count;
    });
    
    // Transform the data into our chatroom format
    chatrooms.value = chatData.map(chat => {
      const resident = residentMap[chat.chatroomResidentID] || {};
      const lastMessage = lastMessagesMap[chat.chatroomID];
      
      return {
        id: chat.chatroomID,
        name: resident.name || 'Unnamed Resident',
        residenceUnit: unitMap[chat.chatroomResidentID] || 'Unit not specified',
        lastMessage: lastMessage?.text || 'No messages yet',
        lastMessageTime: lastMessage?.time || chat.created_at,
        unreadCount: unreadCountsMap[chat.chatroomID] || 0,
        residentId: chat.chatroomResidentID
      };
    });
    
    console.log('Processed chatrooms:', chatrooms.value);
    loading.value = false;
  } catch (error) {
    console.error('Error in fetchChatrooms:', error);
    chatrooms.value = [];
    loading.value = false;
  }
}

async function fetchMessages(chatroomId) {
  try {
    console.log('Fetching messages from database for chatroom:', chatroomId);
    
    // Get messages for the chatroom
    const { data, error } = await supabase
      .from('Message')
      .select(`
        messageID,
        messageUserID,
        messageDescription,
        messageStatus,
        messageAttachmentUrl,
        created_at
      `)
      .eq('messageChatroomID', chatroomId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching messages:', error);
      messages.value = [];
      return;
    }
    
    console.log('Messages found:', data?.length || 0);
    
    if (!data || data.length === 0) {
      messages.value = [];
      return;
    }
    
    // Get unique user IDs to fetch sender information
    const userIds = [...new Set(data.map(message => message.messageUserID))];
    
    // Fetch sender information
    const { data: users, error: userError } = await supabase
      .from('User')
      .select('userID, fullName, email')
      .in('userID', userIds);
      
    if (userError) {
      console.error('Error fetching user info:', userError);
    }
    
    // Create a map of user info for easier lookup
    const userMap = {};
    if (users && users.length > 0) {
      users.forEach(user => {
        userMap[user.userID] = {
          name: user.fullName || user.email || 'Unknown User',
          email: user.email
        };
      });
    }
    
    // Transform messages data
    messages.value = data.map(message => {
      const user = userMap[message.messageUserID] || {};
      const isCurrentUser = message.messageUserID === currentUserId.value;
      
      return {
        id: message.messageID,
        senderId: message.messageUserID,
        sender: isCurrentUser ? 'You' : (user.name || 'Unknown User'),
        content: message.messageDescription,
        timestamp: message.created_at,
        read: message.messageStatus === 'read',
        attachmentUrl: message.messageAttachmentUrl
      };
    });
    
    console.log('Processed messages:', messages.value);
  } catch (error) {
    console.error('Error in fetchMessages:', error);
    messages.value = [];
  }
}

async function sendMessage() {
  if ((!newMessage.value.trim() && !selectedFile.value) || !selectedChatroom.value) return;
  
  sending.value = true;
  const messageContent = newMessage.value;
  newMessage.value = ''; // Clear input right away for better UX
  
  try {
    console.log('Sending message to database:', messageContent);
    
    // Handle file upload if there's a file
    let attachmentUrl = null;
    if (selectedFile.value) {
      uploadingAttachment.value = true;
      
      // Create a unique file name using timestamp and original name
      const timestamp = new Date().getTime();
      const fileExt = selectedFile.value.name.split('.').pop();
      const fileName = `${currentUserId.value}_${timestamp}.${fileExt}`;
      const filePath = `chat-attachments/${fileName}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('chat-attachments')
        .upload(filePath, selectedFile.value);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('chat-attachments')
        .getPublicUrl(filePath);
        
      attachmentUrl = publicUrl;
      console.log('File uploaded successfully:', attachmentUrl);
      
      // Clear attachment preview
      clearAttachmentPreview();
    }
    
    // Insert the message into the database
    const { data, error } = await supabase
      .from('Message')
      .insert({
        messageChatroomID: selectedChatroom.value.id,
        messageUserID: currentUserId.value,
        messageDescription: messageContent,
        messageStatus: 'sent',
        messageAttachmentUrl: attachmentUrl
      })
      .select();
      
    if (error) throw error;
    
    console.log('Message saved to database:', data);
    
    // Create a new message object
    const newMessageObj = {
      id: data[0].messageID,
      senderId: currentUserId.value,
      sender: 'You',
      content: messageContent,
      timestamp: data[0].created_at || new Date().toISOString(),
      read: false,
      attachmentUrl: attachmentUrl
    };
    
    // Add message to the messages array
    messages.value.push(newMessageObj);
    
    // Update the chatroom's last message in the UI
    selectedChatroom.value.lastMessage = messageContent || 'Attachment';
    selectedChatroom.value.lastMessageTime = newMessageObj.timestamp;
    
    // Log this message action
    await logService.logAction({
      action: 'send',
      description: `Sent message to ${selectedChatroom.value.name || 'a resident'}${attachmentUrl ? ' with attachment' : ''}`,
      targetTable: 'Message',
      targetID: data[0].messageID,
      metadata: {
        chatRoomID: selectedChatroom.value.id,
        recipientName: selectedChatroom.value.name,
        hasAttachment: !!attachmentUrl,
        messageType: attachmentUrl ? 'attachment' : 'text'
      }
    });
    
    // Scroll to the bottom
    nextTick(() => {
      scrollToBottom();
    });
    
    console.log('Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
    // Show error notification
    alert('Error sending message. Please try again.');
  } finally {
    sending.value = false;
    uploadingAttachment.value = false;
    selectedFile.value = null;
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    // Today: Show time
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInDays === 1) {
    // Yesterday
    return 'Yesterday';
  } else if (diffInDays < 7) {
    // This week: Show day of week
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    // Older: Show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatMessageDate(timestamp) {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  }
}

function showDateDivider(message, index) {
  if (index === 0) return true;
  
  const prevDate = new Date(messages.value[index - 1].timestamp);
  const currentDate = new Date(message.timestamp);
  
  return prevDate.toDateString() !== currentDate.toDateString();
}

function getChatroomInitial(chatroom) {
  if (!chatroom || !chatroom.name) return '?';
  return chatroom.name.charAt(0).toUpperCase();
}

function getCurrentUserInitial() {
  const name = authStore.user?.fullName || authStore.user?.email;
  return name ? name.charAt(0).toUpperCase() : 'M';
}

function toggleChatroomMenu(event) {
  chatroomMenu.value.toggle(event);
}

function viewResidentDetails() {
  // Navigate to resident details page or show a modal
  console.log('View resident details:', selectedChatroom.value);
}

function markAllAsRead() {
  if (!selectedChatroom.value) return;
  
  // Mark all messages in the chatroom as read
  messages.value.forEach(message => {
    if (!message.read && message.senderId !== currentUserId.value) {
      message.read = true;
    }
  });
  
  // Update the database
  markChatroomAsRead(selectedChatroom.value.id);
}

async function markChatroomAsRead(chatroomId) {
  try {
    console.log('Marking chatroom as read:', chatroomId);
    
    // Get all unread messages from other users
    const { data: unreadMessages, error: fetchError } = await supabase
      .from('Message')
      .select('messageID')
      .eq('messageChatroomID', chatroomId)
      .neq('messageUserID', currentUserId.value) // Not from current user
      .eq('messageStatus', 'sent'); // Not already read
      
    if (fetchError) {
      console.error('Error fetching unread messages:', fetchError);
      return;
    }
    
    console.log('Unread messages found:', unreadMessages?.length || 0);
    
    if (!unreadMessages || unreadMessages.length === 0) {
      return;
    }
    
    // Update message status to read
    const updatePromises = unreadMessages.map(msg => 
      supabase
        .from('Message')
        .update({ messageStatus: 'read' })
        .eq('messageID', msg.messageID)
    );
    
    await Promise.all(updatePromises);
    
    // Add read receipts
    const readReceipts = unreadMessages.map(msg => ({
      messageID: msg.messageID,
      userID: currentUserId.value,
      read_at: new Date().toISOString()
    }));
    
    const { error: readError } = await supabase
      .from('Message_Read_Receipts')
      .insert(readReceipts);
      
    if (readError) {
      console.error('Error creating read receipts:', readError);
    }
    
    // Update UI state
    messages.value = messages.value.map(msg => {
      if (msg.senderId !== currentUserId.value) {
        return { ...msg, read: true };
      }
      return msg;
    });
    
    // Update chatroom unread count
    const chatroomIndex = chatrooms.value.findIndex(c => c.id === chatroomId);
    if (chatroomIndex !== -1) {
      chatrooms.value[chatroomIndex].unreadCount = 0;
    }
    
    console.log('Chatroom marked as read successfully');
  } catch (error) {
    console.error('Error marking chatroom as read:', error);
  }
}

async function deleteChatroom() {
  if (!selectedChatroom.value) return;
  
  try {
    console.log('Deleting chatroom:', selectedChatroom.value.id);
    
    // First delete all messages in the chatroom
    const { error: messagesError } = await supabase
      .from('Message')
      .delete()
      .eq('messageChatroomID', selectedChatroom.value.id);
      
    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      throw messagesError;
    }
    
    // Then delete any read receipts for messages in this chatroom
    // (This might not be needed if you've set up cascading deletes)
    
    // Finally, delete the chatroom itself
    const { error: chatroomError } = await supabase
      .from('Chatroom')
      .delete()
      .eq('chatroomID', selectedChatroom.value.id);
      
    if (chatroomError) {
      console.error('Error deleting chatroom:', chatroomError);
      throw chatroomError;
    }
    
    // Update local state
    chatrooms.value = chatrooms.value.filter(c => c.id !== selectedChatroom.value.id);
    selectedChatroom.value = null;
    messages.value = [];
    
    console.log('Chatroom deleted successfully');
  } catch (error) {
    console.error('Error deleting chatroom:', error);
    alert('Error deleting chatroom: ' + (error.message || 'Unknown error'));
  }
}

function openNewChatroomDialog() {
  newChatroomName.value = '';
  newChatroomDescription.value = '';
  newChatroomNameError.value = '';
  selectedResident.value = null;
  newChatroomDialogVisible.value = true;
}

async function createNewChatroom() {
  if (!selectedResident.value) {
    newChatroomNameError.value = 'Please select a resident';
    return;
  }

  newChatroomNameError.value = '';
  
  try {
    loading.value = true;
    console.log('Creating new chatroom in database with resident:', selectedResident.value);
    
    // Create the chatroom in the database
    const { data, error } = await supabase
      .from('Chatroom')
      .insert({
        chatroomResidentID: selectedResident.value.id,
        chatroomManagementID: currentUserId.value,
        chatroomResidenceID: selectedResident.value.residenceID || null
      })
      .select();
      
    if (error) throw error;
    
    console.log('Chatroom created in database:', data);
    
    if (!data || data.length === 0) {
      throw new Error('No chatroom data returned from database');
    }
    
    // Create a new chatroom object for the UI
    const newChatroom = {
      id: data[0].chatroomID,
      name: selectedResident.value.name,
      residenceUnit: selectedResident.value.unit,
      lastMessage: newChatroomDescription.value ? newChatroomDescription.value : 'No messages yet',
      lastMessageTime: data[0].created_at || new Date().toISOString(),
      unreadCount: 0,
      residentId: selectedResident.value.id
    };
    
    // Add the chatroom to the array at the beginning
    chatrooms.value.unshift(newChatroom);
    
    // If initial message was provided, save it to the database
    let initialMessageId = null;
    
    if (newChatroomDescription.value.trim()) {
      console.log('Creating initial message in database:', newChatroomDescription.value);
      
      // Insert the initial message
      const { data: messageData, error: messageError } = await supabase
        .from('Message')
        .insert({
          messageChatroomID: newChatroom.id,
          messageUserID: currentUserId.value,
          messageDescription: newChatroomDescription.value,
          messageStatus: 'sent'
        })
        .select();
        
      if (messageError) {
        console.error('Error saving initial message:', messageError);
      } else if (messageData && messageData.length > 0) {
        initialMessageId = messageData[0].messageID;
        console.log('Initial message saved with ID:', initialMessageId);
      }
    }
    
    // Select the new chatroom
    selectChatroom(newChatroom);
    
    // Close the dialog and reset fields
    newChatroomDialogVisible.value = false;
    newChatroomDescription.value = '';
    selectedResident.value = null;
    
    console.log('New chatroom setup complete');
  } catch (error) {
    console.error('Error creating chatroom:', error);
    newChatroomNameError.value = error.message || 'Error creating chatroom';
    alert('Error creating chatroom: ' + (error.message || 'Unknown error'));
  } finally {
    loading.value = false;
  }
}

// Add this function to get available residents from the database
async function fetchAvailableResidents() {
  try {
    console.log('Fetching available residents from database...');
    
    // Get the current management user's residence ID
    const { data: currentUser, error: userError } = await supabase
      .from('User')
      .select('residenceID')
      .eq('userID', currentUserId.value)
      .single();
      
    if (userError) {
      console.error('Error getting current user:', userError);
      return;
    }
    
    if (!currentUser?.residenceID) {
      console.error('Current user has no residence ID');
      return;
    }
    
    // Get residents in the same residence
    const { data: residentsData, error: residentsError } = await supabase
      .from('User')
      .select(`
        userID,
        fullName,
        email,
        residenceID,
        unitNumber
      `)
      .eq('residenceID', currentUser.residenceID)
      .eq('isResident', true);
      
    if (residentsError) {
      console.error('Error fetching residents:', residentsError);
      return;
    }
    
    console.log('Found residents:', residentsData);
    
    // Find existing chatrooms to exclude residents that already have chatrooms
    const { data: existingChatrooms, error: chatError } = await supabase
      .from('Chatroom')
      .select('chatroomResidentID')
      .eq('chatroomManagementID', currentUserId.value);
      
    if (chatError) {
      console.error('Error fetching existing chatrooms:', chatError);
    }
    
    // Create a set of resident IDs that already have chatrooms
    const existingResidentIds = new Set((existingChatrooms || []).map(chat => chat.chatroomResidentID));
    
    // Transform data for dropdown
    availableResidents.value = residentsData
      .filter(resident => !existingResidentIds.has(resident.userID)) // Exclude residents with existing chatrooms
      .map(resident => ({
        id: resident.userID,
        name: resident.fullName || resident.email || 'Unnamed Resident',
        unit: resident.unitNumber || 'Unit not specified',
        email: resident.email,
        residenceID: resident.residenceID
      }));
      
    console.log('Processed available residents:', availableResidents.value);
  } catch (error) {
    console.error('Error fetching available residents:', error);
    availableResidents.value = []; // Reset to empty array on error
  }
}

// Lifecycle hooks
onMounted(() => {
  console.log('Component mounted, initializing...');
  
  // Fetch chatrooms
  fetchChatrooms();
  
  // Fetch available residents for new chatroom dialog
  fetchAvailableResidents();
  
  console.log('Setting up real-time subscription for messages...');
  
  // Subscribe to new messages
  const messageSubscription = supabase
    .channel('public:Message')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'Message'
    }, async (payload) => {
      console.log('Real-time message received:', payload);
      
      // Check if this message belongs to a chatroom we have open
      const messageData = payload.new;
      
      // If message is not from current user (we already added those manually)
      if (messageData.messageUserID !== currentUserId.value) {
        
        // If we have the chatroom open, add the message to the conversation
        if (selectedChatroom.value && selectedChatroom.value.id === messageData.messageChatroomID) {
          console.log('Message for current chatroom, adding to conversation');
          
          // Get user info
          const { data: userData, error: userError } = await supabase
            .from('User')
            .select('userID, fullName, email')
            .eq('userID', messageData.messageUserID)
            .single();
            
          if (userError) {
            console.error('Error fetching message sender:', userError);
          }
          
          // Add to messages array
          const newMessage = {
            id: messageData.messageID,
            senderId: messageData.messageUserID,
            sender: userData?.fullName || userData?.email || 'Unknown User',
            content: messageData.messageDescription,
            timestamp: messageData.created_at,
            read: false
          };
          
          messages.value.push(newMessage);
          
          // Automatically mark as read since we're viewing it
          markMessageAsRead(messageData.messageID);
          
          // Scroll to bottom
          nextTick(() => {
            scrollToBottom();
          });
        }
        
        // Update the chatroom list
        updateChatroomWithMessage(messageData);
      }
    })
    .subscribe();
    
  // Clean up subscription on unmount
  onUnmounted(() => {
    console.log('Component unmounted, cleaning up subscriptions');
    supabase.removeChannel(messageSubscription);
  });
});

// Helper function to mark a single message as read
async function markMessageAsRead(messageId) {
  try {
    console.log('Marking single message as read:', messageId);
    
    // Update message status
    const { error: updateError } = await supabase
      .from('Message')
      .update({ messageStatus: 'read' })
      .eq('messageID', messageId);
      
    if (updateError) {
      console.error('Error updating message status:', updateError);
    }
    
    // Add read receipt
    const { error: receiptError } = await supabase
      .from('Message_Read_Receipts')
      .insert({
        messageID: messageId,
        userID: currentUserId.value,
        read_at: new Date().toISOString()
      });
      
    if (receiptError) {
      console.error('Error creating read receipt:', receiptError);
    }
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
}

// Helper function to update chatroom list when new message arrives
async function updateChatroomWithMessage(messageData) {
  try {
    // Find the chatroom in our list
    const chatroomIndex = chatrooms.value.findIndex(c => c.id === messageData.messageChatroomID);
    
    if (chatroomIndex !== -1) {
      console.log('Updating chatroom in list with new message');
      
      // Update the chatroom's last message
      chatrooms.value[chatroomIndex].lastMessage = messageData.messageDescription;
      chatrooms.value[chatroomIndex].lastMessageTime = messageData.created_at;
      
      // If not currently viewing this chatroom, increment unread count
      if (!selectedChatroom.value || selectedChatroom.value.id !== messageData.messageChatroomID) {
        chatrooms.value[chatroomIndex].unreadCount++;
      }
      
      // Move the chatroom to the top of the list
      const chatroom = chatrooms.value.splice(chatroomIndex, 1)[0];
      chatrooms.value.unshift(chatroom);
    } else {
      // This is a new chatroom not in our list, refresh chatrooms
      console.log('New chatroom detected, refreshing chatroom list');
      await fetchChatrooms();
    }
  } catch (error) {
    console.error('Error updating chatroom with new message:', error);
  }
}

function isImageAttachment(url) {
  if (!url) return false;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}

function getAttachmentName(url) {
  if (!url) return 'File';
  try {
    const path = new URL(url).pathname;
    const fileName = path.split('/').pop();
    // Try to decode the filename if it's URL encoded
    return decodeURIComponent(fileName);
  } catch (e) {
    return 'File';
  }
}

function showImagePreview(url) {
  previewImageUrl.value = url;
  imagePreviewDialog.value = true;
}

function showFilePreview(url) {
  previewFileUrl.value = url;
  filePreviewDialog.value = true;
}

function downloadFile(url) {
  const link = document.createElement('a');
  link.href = url;
  link.download = getAttachmentName(url);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function handleAttachment() {
  fileInput.value.click();
}

function onFileSelected(event) {
  selectedFile.value = event.target.files[0];
  if (!selectedFile.value) return;
  
  // Determine file type
  const fileType = selectedFile.value.type;
  attachmentType.value = fileType.split('/')[0]; // 'image', 'application', etc.
  
  // For images, create a preview URL
  if (fileType.startsWith('image/')) {
    attachmentPreviewUrl.value = URL.createObjectURL(selectedFile.value);
  } else {
    // For non-images, just show the file name
    attachmentPreviewUrl.value = '';
  }
}

function clearAttachmentPreview() {
  selectedFile.value = null;
  attachmentPreviewUrl.value = '';
  attachmentType.value = '';
}

// Helper function for file size formatting
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
</script>

<style scoped>
.chatroom-transition-enter-active,
.chatroom-transition-leave-active {
  transition: all 0.3s ease;
}

.chatroom-transition-enter-from,
.chatroom-transition-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.message-list-enter-active,
.message-list-leave-active {
  transition: all 0.3s ease;
}

.message-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.message-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.message-list-move {
  transition: transform 0.3s ease;
}

.message-bubble {
  position: relative;
  max-width: 100%;
  word-wrap: break-word;
}

:deep(.image-preview-dialog .p-dialog-content) {
  padding: 1rem;
  overflow: hidden;
}

.conversation-container {
  scroll-behavior: smooth;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-viewer-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.file-viewer-frame {
  width: 100%;
  height: 100%;
  border: none;
}

:deep(.file-preview-dialog .p-dialog-content) {
  padding: 0;
  overflow: hidden;
}
</style>