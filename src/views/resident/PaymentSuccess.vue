<template>
  <div class="min-h-screen bg-primary-500">
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-4 pt-7 px-4 slide-in-top">
      <Button 
        icon="pi pi-arrow-left" 
        class="p-button-rounded p-button-plain back-button" 
        @click="goToFinance"
        aria-label="Go back"
      />
      <div class="flex-1 text-center">
        <h2 class="text-md font-normal text-white tracking-wide">Payment Status</h2>
      </div>
      <div class="w-10"></div> <!-- Empty div for balanced spacing -->
    </div>

    <!-- Content Section -->
    <div class="min-h-screen bg-white p-4 sm:p-6 rounded-tl-3xl rounded-tr-3xl shadow-lg">
      <div class="flex flex-col items-center justify-center py-8 mt-8">
        <div class="success-checkmark">
          <div class="check-icon">
            <span class="icon-line line-tip"></span>
            <span class="icon-line line-long"></span>
            <div class="icon-circle"></div>
            <div class="icon-fix"></div>
          </div>
        </div>
        
        <h3 class="text-xl font-semibold text-gray-900 mt-8 mb-2">Payment Successful!</h3>
        <p class="text-gray-600 text-center max-w-sm mb-6">
          Your payment has been processed successfully. A confirmation has been sent to your email.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-3 mt-4">
          <Button 
            label="View Payment History" 
            icon="pi pi-history" 
            class="p-button-outlined p-button-primary" 
            @click="goToTransactions"
          />
          <Button 
            label="Return to Home" 
            icon="pi pi-home" 
            class="p-button-primary" 
            @click="goHome"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import { supabase } from '@/api/supabase'
import { verifyStripeSession, processSuccessfulPayment } from '@/api/stripe'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const isProcessing = ref(false)

const goToFinance = () => {
  router.push('/resident/financialManagementResident')
}

const goToTransactions = () => {
  router.push('/resident/financialManagementResident')
  // Set active tab to transactions (index 1)
  localStorage.setItem('financeActiveTab', '1')
}

const goHome = () => {
  router.push('/resident/residentDashboard')
}

// Function to handle successful payment and update database
const handlePaymentSuccess = async () => {
  // Check if we have a session_id in the URL (if returning from Stripe)
  const sessionId = route.query.session_id
  const invoiceIdFromUrl = route.query.invoice_id
  
  if (!sessionId) {
    console.log('No session ID found in URL, skipping payment verification')
    return
  }
  
  try {
    isProcessing.value = true
    toast.add({
      severity: 'info',
      summary: 'Processing',
      detail: 'Verifying your payment status...',
      life: 3000
    })
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('User not authenticated')
      toast.add({
        severity: 'error',
        summary: 'Authentication Error',
        detail: 'User not authenticated. Please log in and try again.',
        life: 5000
      })
      return
    }
    
    // If we have an invoice ID in the URL, check that specific invoice
    let invoice = null
    
    if (invoiceIdFromUrl) {
      console.log('Using invoice ID from URL:', invoiceIdFromUrl)
      const { data, error } = await supabase
        .from('Invoice')
        .select('*')
        .eq('invoiceID', invoiceIdFromUrl)
        .eq('invoiceUserID', user.id)
        .single()
      
      if (error) {
        console.error('Error fetching specific invoice:', error)
      } else if (data) {
        invoice = data
      }
    }
    
    // If no invoice found by ID, fall back to most recent unpaid invoice
    if (!invoice) {
      console.log('Falling back to most recent unpaid invoice')
      const { data: pendingInvoices, error: invoiceError } = await supabase
        .from('Invoice')
        .select('*')
        .eq('invoiceUserID', user.id)
        .eq('isPaid', false)
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (invoiceError) {
        console.error('Error fetching invoices:', invoiceError)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not verify payment status. Please contact support.',
          life: 5000
        })
        return
      }
      
      if (!pendingInvoices || pendingInvoices.length === 0) {
        console.log('No pending invoices found or payment already processed')
        return
      }
      
      invoice = pendingInvoices[0]
    }
    
    // Check if the invoice is already paid
    if (invoice.isPaid) {
      console.log('Invoice already marked as paid', invoice.invoiceID)
      return
    }
    
    console.log('Processing payment for invoice:', invoice)
    
    // Create transaction record for this payment
    const { data: transaction, error: transactionError } = await supabase
      .from('Transaction')
      .insert({
        transactionUserID: invoice.invoiceUserID,
        transactionTitle: `Payment for ${invoice.invoiceTitle || 'Invoice'}`,
        transactionAmount: invoice.invoiceAmount,
        transactionDescription: `Payment for invoice #${invoice.invoiceID}`,
        transactionInvoiceID: invoice.invoiceID,
        isLate: new Date(invoice.invoiceDueAt) < new Date() // Check if payment was late
      })
      .select()
    
    if (transactionError) {
      console.error('Error creating transaction:', transactionError)
      toast.add({
        severity: 'error',
        summary: 'Transaction Error',
        detail: 'Could not record transaction. Please contact support.',
        life: 5000
      })
      return
    }
    
    console.log('Transaction created:', transaction[0])
    
    // Update invoice to mark as paid
    const { error: updateError } = await supabase
      .from('Invoice')
      .update({ 
        isPaid: true,
        invoiceTransactionID: transaction[0].transactionID
      })
      .eq('invoiceID', invoice.invoiceID)
    
    if (updateError) {
      console.error('Error updating invoice:', updateError)
      toast.add({
        severity: 'error',
        summary: 'Update Error',
        detail: 'Could not update invoice status. Please contact support.',
        life: 5000
      })
      return
    }
    
    console.log('Payment processed successfully for invoice:', invoice.invoiceID)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Payment recorded successfully!',
      life: 3000
    })
  } catch (error) {
    console.error('Error handling payment success:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Payment processing error: ${error.message}`,
      life: 5000
    })
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => {
  // Process payment when component mounts
  handlePaymentSuccess()
})
</script>

<style scoped>
.bg-primary-500 {
  background-color: #4D5BBF;
}

.slide-in-top {
  animation: slide-in-from-top 0.5s ease-out forwards;
}

@keyframes slide-in-from-top {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.rounded-tl-3xl {
  border-top-left-radius: 26px;
}

.rounded-tr-3xl {
  border-top-right-radius: 26px;
}

/* Back Button */
:deep(.back-button) {
  color: white !important;
  background-color: transparent !important;
  border: none !important;
}

:deep(.back-button:hover) {
  background-color: transparent !important;
  color: white !important;
  box-shadow: none !important;
}

:deep(.back-button .pi) {
  font-size: 1.25rem;
}

/* Success animation */
.success-checkmark {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  transform: scale(1.5);
  margin-bottom: 1.5rem;
}

.success-checkmark .check-icon {
  width: 80px;
  height: 80px;
  position: relative;
  border-radius: 50%;
  box-sizing: content-box;
  border: 4px solid #4caf50;
}

.success-checkmark .check-icon::before {
  top: 3px;
  left: -2px;
  width: 30px;
  transform-origin: 100% 50%;
  border-radius: 100px 0 0 100px;
}

.success-checkmark .check-icon::after {
  top: 0;
  left: 30px;
  width: 60px;
  transform-origin: 0 50%;
  border-radius: 0 100px 100px 0;
  animation: rotate-circle 4.25s ease-in;
}

.success-checkmark .check-icon::before, .success-checkmark .check-icon::after {
  content: '';
  height: 100px;
  position: absolute;
  background: #ffffff;
}

.success-checkmark .check-icon .icon-line {
  height: 5px;
  background-color: #4caf50;
  display: block;
  border-radius: 2px;
  position: absolute;
  z-index: 10;
}

.success-checkmark .check-icon .icon-line.line-tip {
  top: 46px;
  left: 14px;
  width: 25px;
  transform: rotate(45deg);
  animation: icon-line-tip 0.75s;
}

.success-checkmark .check-icon .icon-line.line-long {
  top: 38px;
  right: 8px;
  width: 47px;
  transform: rotate(-45deg);
  animation: icon-line-long 0.75s;
}

.success-checkmark .check-icon .icon-circle {
  top: -4px;
  left: -4px;
  z-index: 10;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: absolute;
  box-sizing: content-box;
  border: 4px solid rgba(76, 175, 80, 0.5);
}

.success-checkmark .check-icon .icon-fix {
  top: 8px;
  width: 5px;
  left: 26px;
  z-index: 1;
  height: 85px;
  position: absolute;
  transform: rotate(-45deg);
  background-color: #ffffff;
}

@keyframes rotate-circle {
  0% {
    transform: rotate(-45deg);
  }
  5% {
    transform: rotate(-45deg);
  }
  12% {
    transform: rotate(-405deg);
  }
  100% {
    transform: rotate(-405deg);
  }
}

@keyframes icon-line-tip {
  0% {
    width: 0;
    left: 1px;
    top: 19px;
  }
  54% {
    width: 0;
    left: 1px;
    top: 19px;
  }
  70% {
    width: 50px;
    left: -8px;
    top: 37px;
  }
  84% {
    width: 17px;
    left: 21px;
    top: 48px;
  }
  100% {
    width: 25px;
    left: 14px;
    top: 45px;
  }
}

@keyframes icon-line-long {
  0% {
    width: 0;
    right: 46px;
    top: 54px;
  }
  65% {
    width: 0;
    right: 46px;
    top: 54px;
  }
  84% {
    width: 55px;
    right: 0px;
    top: 35px;
  }
  100% {
    width: 47px;
    right: 8px;
    top: 38px;
  }
}

.p-button-primary {
  background-color: #4D5BBF !important;
  border-color: #4D5BBF !important;
}

.p-button-outlined.p-button-primary {
  color: #4D5BBF !important;
  border-color: #4D5BBF !important;
  background-color: transparent !important;
}

.p-button-outlined.p-button-primary:hover {
  background-color: rgba(77, 91, 191, 0.04) !important;
}
</style> 