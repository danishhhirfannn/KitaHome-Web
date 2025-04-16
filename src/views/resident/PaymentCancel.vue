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
        <div class="cancel-icon-container">
          <div class="cancel-icon">
            <div class="icon-circle"></div>
            <span class="icon-line1"></span>
            <span class="icon-line2"></span>
          </div>
        </div>
        
        <h3 class="text-xl font-semibold text-gray-900 mt-8 mb-2">Payment Cancelled</h3>
        <p class="text-gray-600 text-center max-w-sm mb-6">
          Your payment has been cancelled. No charges have been made to your account.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-3 mt-4">
          <Button 
            label="Back to Invoices" 
            icon="pi pi-file" 
            class="p-button-outlined p-button-primary" 
            @click="goToInvoices"
          />
          <Button 
            label="Try Again" 
            icon="pi pi-refresh" 
            class="p-button-primary" 
            @click="goToFinance"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()

const goToFinance = () => {
  router.push('/resident/financialManagementResident')
}

const goToInvoices = () => {
  router.push('/resident/financialManagementResident')
  // Set active tab to invoices (index 0)
  localStorage.setItem('financeActiveTab', '0')
}
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

/* Cancel animation */
.cancel-icon-container {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  transform: scale(1.5);
  margin-bottom: 1.5rem;
  position: relative;
}

.cancel-icon {
  width: 80px;
  height: 80px;
  position: relative;
  border-radius: 50%;
  box-sizing: content-box;
  border: 4px solid #ef4444;
}

.cancel-icon .icon-circle {
  top: -4px;
  left: -4px;
  z-index: 10;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: absolute;
  box-sizing: content-box;
  border: 4px solid rgba(239, 68, 68, 0.5);
}

.cancel-icon .icon-line1, .cancel-icon .icon-line2 {
  height: 5px;
  background-color: #ef4444;
  display: block;
  border-radius: 2px;
  position: absolute;
  top: 38px;
  left: 17px;
  width: 46px;
  z-index: 10;
}

.cancel-icon .icon-line1 {
  transform: rotate(45deg);
  animation: icon-line-cross1 0.75s;
}

.cancel-icon .icon-line2 {
  transform: rotate(-45deg);
  animation: icon-line-cross2 0.75s;
}

@keyframes icon-line-cross1 {
  0% {
    width: 0;
    left: 40px;
    top: 40px;
  }
  54% {
    width: 0;
    left: 40px;
    top: 40px;
  }
  100% {
    width: 46px;
    left: 17px;
    top: 38px;
  }
}

@keyframes icon-line-cross2 {
  0% {
    width: 0;
    left: 40px;
    top: 40px;
  }
  54% {
    width: 0;
    left: 40px;
    top: 40px;
  }
  100% {
    width: 46px;
    left: 17px;
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