import { supabase } from './supabase'
import { useAuthStore } from '@/stores/auth'

/**
 * General log action function
 * @param {Object} logData - The log data to save
 * @param {string} logData.action - The action performed (create, update, delete, etc.)
 * @param {string} logData.description - A description of the action
 * @param {string} logData.targetTable - The table that was affected
 * @param {string} logData.targetID - The ID of the record that was affected
 * @param {Object} logData.metadata - Additional metadata about the action
 * @returns {Promise<Object>} The result of the operation
 */
const logAction = async (logData) => {
  try {
    const authStore = useAuthStore()
    
    if (!authStore.user) {
      console.error('Cannot log action: User not authenticated')
      return { success: false, error: 'User not authenticated' }
    }
    
    // Get the user's residenceID
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('residenceID')
      .eq('userID', authStore.user.id)
      .single()
      
    if (userError) {
      console.error('Error getting user residence ID:', userError)
      return { success: false, error: userError.message }
    }
    
    if (!userData?.residenceID) {
      console.error('Cannot log action: User has no residence ID')
      return { success: false, error: 'User has no residence ID' }
    }
    
    // Create the log entry
    const { data, error } = await supabase
      .from('logs')
      .insert({
        "userID": authStore.user.id,
        "residenceID": userData.residenceID,
        "action": logData.action,
        "description": logData.description,
        "targetTable": logData.targetTable,
        "targetID": logData.targetID,
        "metadata": logData.metadata || {}
      })
      .select()
      
    if (error) {
      console.error('Error logging action:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error in logAction:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get logs for the current user's residence
 * @param {Object} filters - Optional filters for the logs
 * @param {string} filters.userID - Filter by user ID
 * @param {string} filters.action - Filter by action type
 * @param {string} filters.targetTable - Filter by target table
 * @param {Date} filters.startDate - Filter by start date
 * @param {Date} filters.endDate - Filter by end date
 * @returns {Promise<Object>} The logs
 */
const getLogs = async (filters = {}) => {
  try {
    const authStore = useAuthStore()
    
    if (!authStore.user) {
      console.error('Cannot get logs: User not authenticated')
      return { success: false, error: 'User not authenticated' }
    }
    
    // Get the user's residenceID
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('residenceID')
      .eq('userID', authStore.user.id)
      .single()
      
    if (userError) {
      console.error('Error getting user residence ID:', userError)
      return { success: false, error: userError.message }
    }
    
    if (!userData?.residenceID) {
      console.error('Cannot get logs: User has no residence ID')
      return { success: false, error: 'User has no residence ID' }
    }
    
    // Build query
    let query = supabase
      .from('logs')
      .select(`
        *,
        User:userID (
          fullName,
          email
        )
      `)
      .eq('residenceID', userData.residenceID)
      .order('created_at', { ascending: false })
      
    // Apply filters
    if (filters.userID) {
      query = query.eq('userID', filters.userID)
    }
    
    if (filters.action) {
      query = query.eq('action', filters.action)
    }
    
    if (filters.targetTable) {
      query = query.eq('targetTable', filters.targetTable)
    }
    
    if (filters.startDate) {
      query = query.gte('created_at', new Date(filters.startDate).toISOString())
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', new Date(filters.endDate).toISOString())
    }
    
    // Execute query
    const { data, error } = await query
    
    if (error) {
      console.error('Error getting logs:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error in getLogs:', error)
    return { success: false, error: error.message }
  }
}

// Specialized log functions for specific management actions

/**
 * Log a resident management action
 * @param {string} actionType - The type of action (verify, update, add, remove)
 * @param {Object} resident - The resident details
 * @param {Object} changes - The changes made (for updates)
 * @returns {Promise<Object>} The result of the operation
 */
const logResidentAction = async (actionType, resident, changes = {}) => {
  let description = '';
  let metadata = {};
  
  switch (actionType) {
    case 'verify':
      description = `Verified resident: ${resident.fullName || 'Unknown'} (${resident.email || 'No email'})`;
      metadata = { action: 'verify' };
      break;
    case 'reject':
      description = `Declined resident verification: ${resident.fullName || 'Unknown'} (${resident.email || 'No email'})`;
      metadata = { 
        action: 'reject',
        reason: changes.reason || null
      };
      break;
    case 'update':
      description = `Updated resident information: ${resident.fullName || 'Unknown'}`;
      metadata = {
        changes,
        previousValues: resident
      };
      break;
    case 'add':
      description = `Added new resident: ${resident.fullName || 'Unknown'} (${resident.email || 'No email'})`;
      metadata = {
        unitNumber: resident.unitNumber,
        email: resident.email
      };
      break;
    case 'remove':
      description = `Removed resident: ${resident.fullName || 'Unknown'} (${resident.email || 'No email'})`;
      metadata = {
        reason: changes.reason || null
      };
      break;
    default:
      description = `Performed action on resident: ${resident.fullName || 'Unknown'}`;
      metadata = changes;
  }
  
  return logAction({
    action: actionType,
    description,
    targetTable: 'User',
    targetID: resident.userID,
    metadata
  });
};

/**
 * Log a complaint management action
 * @param {string} actionType - The type of action (review, resolve, respond)
 * @param {Object} complaint - The complaint details
 * @param {Object} additionalData - Additional data for the log
 * @returns {Promise<Object>} The result of the operation
 */
const logComplaintAction = async (actionType, complaint, additionalData = {}) => {
  let description = '';
  let action = actionType;
  let metadata = {};
  
  switch (actionType) {
    case 'review':
      description = `Reviewed complaint: ${complaint.complaintTitle || 'Untitled'}`;
      metadata = {
        previousStatus: complaint.complaintStatus,
        newStatus: 'reviewed',
        residentName: `${complaint.firstName || ''} ${complaint.lastName || ''}`.trim() || 'Unknown Resident'
      };
      action = 'update';
      break;
    case 'resolve':
      description = `Resolved complaint: ${complaint.complaintTitle || 'Untitled'}`;
      metadata = {
        previousStatus: complaint.complaintStatus,
        newStatus: 'resolved',
        residentName: `${complaint.firstName || ''} ${complaint.lastName || ''}`.trim() || 'Unknown Resident',
        resolution: additionalData.resolution || null
      };
      action = 'update';
      break;
    case 'respond':
      description = `Responded to complaint: ${complaint.complaintTitle || 'Untitled'}`;
      metadata = {
        response: additionalData.response,
        residentName: `${complaint.firstName || ''} ${complaint.lastName || ''}`.trim() || 'Unknown Resident'
      };
      action = 'create';
      break;
    default:
      description = `Performed action on complaint: ${complaint.complaintTitle || 'Untitled'}`;
      metadata = additionalData;
  }
  
  return logAction({
    action,
    description,
    targetTable: 'Complaint',
    targetID: complaint.complaintID,
    metadata
  });
};

/**
 * Log a communication action
 * @param {string} actionType - The type of action (send, create_chatroom)
 * @param {Object} data - The message or chatroom data
 * @returns {Promise<Object>} The result of the operation
 */
const logCommunicationAction = async (actionType, data) => {
  let description = '';
  let targetTable = '';
  let targetID = '';
  let metadata = {};
  let action = actionType;
  
  switch (actionType) {
    case 'send':
      description = `Sent message to ${data.recipientName || 'a resident'}${data.hasAttachment ? ' with attachment' : ''}`;
      targetTable = 'Message';
      targetID = data.messageID;
      metadata = {
        chatRoomID: data.chatRoomID,
        recipientName: data.recipientName,
        hasAttachment: !!data.attachmentUrl,
        messageType: data.attachmentUrl ? 'attachment' : 'text'
      };
      break;
    case 'create_chatroom':
      description = `Created new chatroom with ${data.residentName || 'a resident'}`;
      targetTable = 'Chatroom';
      targetID = data.chatroomID;
      metadata = {
        residentName: data.residentName,
        residentID: data.residentID
      };
      action = 'create';
      break;
    default:
      description = `Performed communication action: ${actionType}`;
      targetTable = data.targetTable || 'Message';
      targetID = data.targetID;
      metadata = data;
  }
  
  return logAction({
    action,
    description,
    targetTable,
    targetID,
    metadata
  });
};

/**
 * Log a financial management action
 * @param {string} actionType - The type of action (create_invoice, mark_paid, create_transaction)
 * @param {Object} data - The financial data
 * @returns {Promise<Object>} The result of the operation
 */
const logFinancialAction = async (actionType, data) => {
  let description = '';
  let targetTable = '';
  let targetID = '';
  let metadata = {};
  let action = '';
  
  switch (actionType) {
    case 'create_invoice':
      description = `Created invoice: ${data.description || 'New Invoice'} for ${data.amount}`;
      targetTable = 'Invoice';
      targetID = data.invoiceID;
      action = 'create';
      metadata = {
        amount: data.amount,
        description: data.description,
        dueDate: data.dueDate,
        residentID: data.userID
      };
      break;
    case 'mark_paid':
      description = `Marked invoice as paid: ${data.invoiceTitle || 'Invoice'}`;
      targetTable = 'Invoice';
      targetID = data.invoiceID;
      action = 'update';
      metadata = {
        invoiceTitle: data.invoiceTitle,
        amount: data.amount,
        paidAt: new Date().toISOString(),
        previousStatus: 'pending',
        newStatus: 'paid',
        residentName: data.residentName || 'Unknown Resident'
      };
      break;
    case 'create_transaction':
      description = `Created transaction: ${data.title || 'New Transaction'}`;
      targetTable = 'Transaction';
      targetID = data.transactionID;
      action = 'create';
      metadata = {
        amount: data.amount,
        title: data.title,
        description: data.description,
        isManual: !!data.isManual,
        residentID: data.userID
      };
      break;
    default:
      description = `Performed financial action: ${actionType}`;
      targetTable = data.targetTable || 'Financial';
      targetID = data.targetID;
      action = data.action || 'update';
      metadata = data;
  }
  
  return logAction({
    action,
    description,
    targetTable,
    targetID,
    metadata
  });
};

/**
 * Log an announcement action
 * @param {string} actionType - The type of action (create, update, publish, delete)
 * @param {Object} announcement - The announcement data
 * @returns {Promise<Object>} The result of the operation
 */
const logAnnouncementAction = async (actionType, announcement) => {
  let description = '';
  let metadata = {};
  let action = actionType;
  
  switch (actionType) {
    case 'create':
      description = `Created new announcement: ${announcement.announcementTitle || 'Untitled'}`;
      metadata = {
        title: announcement.announcementTitle,
        content: announcement.announcementDescription,
        visibility: announcement.announcementVisibility,
        status: announcement.announcementStatus,
        hasAttachment: !!announcement.announcementAttachmentUrl
      };
      break;
    case 'update':
      description = `Updated announcement: ${announcement.announcementTitle || 'Untitled'}`;
      metadata = {
        title: announcement.announcementTitle,
        content: announcement.announcementDescription,
        visibility: announcement.announcementVisibility,
        status: announcement.announcementStatus,
        hasAttachment: !!announcement.announcementAttachmentUrl
      };
      break;
    case 'publish':
      description = `Published announcement: ${announcement.announcementTitle || 'Untitled'}`;
      metadata = {
        title: announcement.announcementTitle,
        previousStatus: announcement.previousStatus || 'Draft',
        newStatus: 'Published',
        visibility: announcement.announcementVisibility,
        publishedAt: new Date().toISOString(),
        hasAttachment: !!announcement.announcementAttachmentUrl
      };
      break;
    case 'delete':
      description = `Deleted announcement: ${announcement.announcementTitle || 'Untitled'}`;
      metadata = {
        title: announcement.announcementTitle,
        status: announcement.announcementStatus,
        visibility: announcement.announcementVisibility,
        deletedAt: new Date().toISOString()
      };
      break;
    default:
      description = `Performed action on announcement: ${announcement.announcementTitle || 'Untitled'}`;
      metadata = announcement;
  }
  
  return logAction({
    action,
    description,
    targetTable: 'Announcement',
    targetID: announcement.announcementID,
    metadata
  });
};

// Export the service
export const logService = {
  logAction,
  getLogs,
  logResidentAction,
  logComplaintAction,
  logCommunicationAction,
  logFinancialAction,
  logAnnouncementAction
}