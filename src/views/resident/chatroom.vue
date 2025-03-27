<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- Chat Header -->
    <div class="bg-white shadow p-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Button 
          icon="pi pi-arrow-left" 
          class="p-button-rounded p-button-text" 
          @click="goBack"
        />
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
            {{ getManagementInitial() }}
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-800">{{ chatroomName }}</h2>
            <p class="text-xs text-gray-500">{{ chatroomSubtitle }}</p>
          </div>
        </div>
      </div>
      <Button 
        icon="pi pi-ellipsis-v" 
        class="p-button-rounded p-button-text" 
        @click="toggleChatroomMenu"
        aria-haspopup="true" 
        aria-controls="chatroom-menu"
      />
      <Menu id="chatroom-menu" ref="chatroomMenu" :model="chatroomMenuItems" :popup="true" />
    </div>
    
    <!-- Messages Container -->
    <div class="flex-1 overflow-y-auto p-4 bg-slate-50" ref="messagesContainer">
      <div v-if="loading" class="flex justify-center items-center h-full">
        <i class="pi pi-spin pi-spinner text-primary-500 text-2xl"></i>
      </div>
      
      <div v-else-if="messages.length === 0" class="flex flex-col justify-center items-center h-full text-gray-500">
        <i class="pi pi-inbox text-4xl mb-3"></i>
        <p>No messages yet</p>
        <p class="mt-2 text-sm">Start a conversation with management!</p>
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
              {{ getUserInitial() }}
            </div>
          </div>
        </div>
      </transition-group>
    </div>
    
    <!-- Attachment Preview Area -->
    <div v-if="selectedFile" class="bg-white border-t border-gray-200 p-2">
      <div class="flex items-center gap-2">
        <div class="flex-1 flex items-center">
          <!-- Image preview -->
          <div v-if="attachmentType === 'image'" class="relative h-16 w-16 bg-gray-100 rounded border border-gray-300 mr-2 overflow-hidden">
            <img :src="attachmentPreviewUrl" alt="Preview" class="h-full w-full object-cover" />
          </div>
          
          <!-- File preview for non-images -->
          <div v-else class="relative h-16 w-16 bg-gray-100 rounded border border-gray-300 mr-2 flex items-center justify-center">
            <i class="pi pi-file text-primary-500 text-2xl"></i>
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
    
    <!-- Message Input -->
    <div class="bg-white border-t border-gray-200">
      <div class="flex gap-2 items-center p-2 border border-gray-300 py-4">
        <Button 
          icon="pi pi-paperclip" 
          class="p-button-rounded p-button-text" 
          @click="handleAttachment"
          :disabled="!!selectedFile || uploadingAttachment"
          aria-label="Attach file"
        />
        <span class="p-input-icon-right flex-1 relative">
          <i v-if="sending || uploadingAttachment" class="pi pi-spin pi-spinner"></i>
          <InputText 
            v-model="newMessage" 
            placeholder="Type your message..." 
            class="w-full p-2 border-0"
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
    
    <!-- Add the image preview dialog at the end of the template -->
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
            @click="window.open(previewImageUrl, '_blank')" 
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
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import { supabase } from '@/api/supabase';
import Dialog from 'primevue/dialog';

// Router for navigation
const router = useRouter();

// Auth store
const authStore = useAuthStore();
const currentUserId = ref(authStore.user?.id);

// References
const messages = ref([]);
const chatroomName = ref('Management');
const chatroomSubtitle = ref('Property Management');
const newMessage = ref('');
const messagesContainer = ref(null);
const loading = ref(true);
const sending = ref(false);
const chatroomMenu = ref(null);
const chatroomId = ref(null);
const managementUserId = ref(null);
const fileInput = ref(null);
const selectedFile = ref(null);
const filePreview = ref(null);
const uploadingAttachment = ref(false);
const attachmentType = ref('');
const attachmentPreviewUrl = ref('');
const imagePreviewDialog = ref(false);
const previewImageUrl = ref('');
const previewFileUrl = ref('');
const filePreviewDialog = ref(false);

// Menu items for the chatroom menu
const chatroomMenuItems = ref([
  {
    label: 'Clear Chat History',
    icon: 'pi pi-trash',
    command: () => confirmClearHistory()
  },
  {
    label: 'Mark All as Read',
    icon: 'pi pi-check-circle',
    command: () => markAllAsRead()
  }
]);

// Functions
function goBack() {
  router.go(-1);
}

function toggleChatroomMenu(event) {
  chatroomMenu.value.toggle(event);
}

function confirmClearHistory() {
  // In a real app, you'd show a confirmation dialog
  if (confirm('Are you sure you want to clear chat history? This cannot be undone.')) {
    clearChatHistory();
  }
}

async function clearChatHistory() {
  try {
    console.log('Clearing chat history for chatroom:', chatroomId.value);
    
    // Delete all messages in the chatroom (in reality, you might want to just mark them as deleted)
    const { error } = await supabase
      .from('Message')
      .delete()
      .eq('messageChatroomID', chatroomId.value);
      
    if (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
    
    // Clear messages array
    messages.value = [];
    
    console.log('Chat history cleared successfully');
  } catch (error) {
    console.error('Error clearing chat history:', error);
    alert('Error clearing chat history: ' + (error.message || 'Unknown error'));
  }
}

async function fetchChatroom() {
  loading.value = true;
  
  try {
    console.log('Fetching chatroom for resident:', currentUserId.value);
    
    // Get chatroom where the current user is the resident
    const { data: chatroomData, error: chatroomError } = await supabase
      .from('Chatroom')
      .select(`
        chatroomID,
        chatroomResidenceID,
        chatroomResidentID,
        chatroomManagementID
      `)
      .eq('chatroomResidentID', currentUserId.value)
      .limit(1);
      
    if (chatroomError) throw chatroomError;
    
    if (!chatroomData || chatroomData.length === 0) {
      // No chatroom found, create a new one
      console.log('No chatroom found, creating a new one...');
      await createNewChatroom();
      return;
    }
    
    console.log('Chatroom found:', chatroomData[0]);
    
    // Set chatroom ID and management user ID
    chatroomId.value = chatroomData[0].chatroomID;
    managementUserId.value = chatroomData[0].chatroomManagementID;
    
    // Get management user info
    const { data: managementUser, error: userError } = await supabase
      .from('User')
      .select('userID, fullName, email, residenceID')
      .eq('userID', managementUserId.value)
      .single();
      
    if (userError) {
      console.error('Error fetching management user:', userError);
    } else if (managementUser) {
      chatroomName.value = managementUser.fullName || managementUser.email || 'Management';
      
      // Get residence name
      if (managementUser.residenceID) {
        const { data: residenceData, error: residenceError } = await supabase
          .from('Residence')
          .select('residenceName')
          .eq('residenceID', managementUser.residenceID)
          .single();
          
        if (residenceError) {
          console.error('Error fetching residence:', residenceError);
        } else if (residenceData) {
          chatroomSubtitle.value = residenceData.residenceName || 'Property Management';
        } else {
          chatroomSubtitle.value = 'Property Management';
        }
      } else {
        chatroomSubtitle.value = 'Property Management';
      }
    }
    
    // Fetch messages
    await fetchMessages(chatroomId.value);
    
    loading.value = false;
  } catch (error) {
    console.error('Error in fetchChatroom:', error);
    loading.value = false;
  }
}

async function createNewChatroom() {
  try {
    console.log('Creating new chatroom for resident');
    
    // Get the residence ID for the current user
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('residenceID')
      .eq('userID', currentUserId.value)
      .single();
      
    if (userError) throw userError;
    
    if (!userData || !userData.residenceID) {
      throw new Error('No residence ID found for user');
    }
    
    // Get residence name
    let residenceName = 'Property Management';
    const { data: residenceData, error: residenceError } = await supabase
      .from('Residence')
      .select('residenceName')
      .eq('residenceID', userData.residenceID)
      .single();
      
    if (!residenceError && residenceData && residenceData.residenceName) {
      residenceName = residenceData.residenceName;
    } else if (residenceError) {
      console.error('Error fetching residence:', residenceError);
    }
    
    // Find a management user for this residence
    const { data: managementData, error: managementError } = await supabase
      .from('User')
      .select('userID, fullName, email')
      .eq('residenceID', userData.residenceID)
      .eq('isManager', true)
      .limit(1);
      
    if (managementError) throw managementError;
    
    if (!managementData || managementData.length === 0) {
      throw new Error('No management user found for this residence');
    }
    
    const managementUser = managementData[0];
    managementUserId.value = managementUser.userID;
    chatroomName.value = managementUser.fullName || managementUser.email || 'Management';
    chatroomSubtitle.value = residenceName;
    
    // Create the chatroom
    const { data: chatroomData, error: chatroomError } = await supabase
      .from('Chatroom')
      .insert({
        chatroomResidentID: currentUserId.value,
        chatroomManagementID: managementUserId.value,
        chatroomResidenceID: userData.residenceID
      })
      .select();
      
    if (chatroomError) throw chatroomError;
    
    if (!chatroomData || chatroomData.length === 0) {
      throw new Error('Failed to create chatroom');
    }
    
    console.log('New chatroom created:', chatroomData[0]);
    
    // Set the chatroom ID
    chatroomId.value = chatroomData[0].chatroomID;
    
    // Create initial welcome message from management
    const { error: messageError } = await supabase
      .from('Message')
      .insert({
        messageChatroomID: chatroomId.value,
        messageUserID: managementUserId.value,
        messageDescription: 'Welcome! How can I help you today?',
        messageStatus: 'sent'
      });
      
    if (messageError) {
      console.error('Error creating welcome message:', messageError);
    }
    
    // Fetch messages
    await fetchMessages(chatroomId.value);
    
    loading.value = false;
  } catch (error) {
    console.error('Error creating chatroom:', error);
    loading.value = false;
    alert('Error setting up chat: ' + (error.message || 'Unknown error'));
  }
}

async function fetchMessages(chatroomId) {
  try {
    console.log('Fetching messages for chatroom:', chatroomId);
    
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
        sender: isCurrentUser ? 'You' : (user.name || 'Management'),
        content: message.messageDescription,
        timestamp: message.created_at,
        read: message.messageStatus === 'read',
        attachmentUrl: message.messageAttachmentUrl
      };
    });
    
    // Mark messages from management as read
    markIncomingMessagesAsRead();
    
    // Scroll to bottom
    nextTick(() => {
      scrollToBottom();
    });
    
    console.log('Messages processed:', messages.value);
  } catch (error) {
    console.error('Error in fetchMessages:', error);
    messages.value = [];
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

async function sendMessage() {
  if ((!newMessage.value.trim() && !selectedFile.value) || !chatroomId.value) return;
  
  sending.value = true;
  const messageContent = newMessage.value;
  newMessage.value = ''; // Clear input right away for better UX
  
  try {
    console.log('Sending message:', messageContent);
    
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
        messageChatroomID: chatroomId.value,
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
    
    // Scroll to the bottom
    nextTick(() => {
      scrollToBottom();
    });
    
    console.log('Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Error sending message. Please try again.');
  } finally {
    sending.value = false;
    uploadingAttachment.value = false;
    selectedFile.value = null;
  }
}

async function markIncomingMessagesAsRead() {
  try {
    console.log('Marking incoming messages as read');
    
    // Get all unread messages from management
    const unreadMessages = messages.value
      .filter(msg => !msg.read && msg.senderId !== currentUserId.value)
      .map(msg => msg.id);
      
    if (unreadMessages.length === 0) {
      return;
    }
    
    console.log('Unread messages to mark as read:', unreadMessages.length);
    
    // Update message status to read in the database
    const updatePromises = unreadMessages.map(messageId => 
      supabase
        .from('Message')
        .update({ messageStatus: 'read' })
        .eq('messageID', messageId)
    );
    
    await Promise.all(updatePromises);
    
    // Add read receipts
    const readReceipts = unreadMessages.map(messageId => ({
      messageID: messageId,
      userID: currentUserId.value,
      read_at: new Date().toISOString()
    }));
    
    const { error: readError } = await supabase
      .from('Message_Read_Receipts')
      .insert(readReceipts);
      
    if (readError) {
      console.error('Error creating read receipts:', readError);
    }
    
    // Update UI
    messages.value = messages.value.map(msg => {
      if (msg.senderId !== currentUserId.value) {
        return { ...msg, read: true };
      }
      return msg;
    });
    
    console.log('Messages marked as read successfully');
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
}

async function markAllAsRead() {
  await markIncomingMessagesAsRead();
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

function getManagementInitial() {
  return chatroomName.value ? chatroomName.value.charAt(0).toUpperCase() : 'M';
}

function getUserInitial() {
  const name = authStore.user?.fullName || authStore.user?.email;
  return name ? name.charAt(0).toUpperCase() : 'U';
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

// Helper functions for attachments
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

// Lifecycle hooks
onMounted(async () => {
  console.log('Chatroom component mounted, initializing...');
  await fetchChatroom();
  
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
      
      // Check if this message belongs to our chatroom and is not from current user
      const messageData = payload.new;
      
      if (messageData.messageChatroomID === chatroomId.value && 
          messageData.messageUserID !== currentUserId.value) {
        console.log('Incoming message for this chatroom');
        
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
          sender: userData?.fullName || userData?.email || 'Management',
          content: messageData.messageDescription,
          timestamp: messageData.created_at,
          read: false
        };
        
        messages.value.push(newMessage);
        
        // Mark as read since we're viewing it
        markIncomingMessagesAsRead();
        
        // Scroll to bottom
        nextTick(() => {
          scrollToBottom();
        });
      }
    })
    .subscribe();
    
  // Clean up subscription on unmount
  onUnmounted(() => {
    console.log('Chatroom component unmounted, cleaning up subscriptions');
    supabase.removeChannel(messageSubscription);
  });
});
</script>

<style scoped>
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
  overflow-wrap: break-word;
  word-break: break-word;
}

/* File attachment styles */
a[target="_blank"] {
  display: flex;
  align-items: center;
  max-width: 100%;
}

a[target="_blank"] .pi-file {
  flex-shrink: 0;
}

a[target="_blank"] span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

/* Mobile-specific styles */
@media (max-width: 640px) {
  /* Message bubble adjustments */
  .message-bubble {
    max-width: 85%;
  }
  
  /* File attachment mobile adjustments */
  a[target="_blank"] span {
    max-width: 120px;
  }
  
  /* Improve dialog appearance on mobile */
  :deep(.image-preview-dialog) {
    max-height: 90vh;
  }
  
  :deep(.image-preview-dialog .p-dialog-content) {
    padding: 0.75rem;
  }

  /* Fix attachment display */
  img {
    max-width: 100%;
    height: auto;
  }
}

:deep(.image-preview-dialog .p-dialog-content) {
  padding: 1rem;
  overflow: hidden;
}
</style>