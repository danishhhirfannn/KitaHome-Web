<template>
  <div class="animated-gradient min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
    <!-- Logo section -->
    <div class="mb-8 sm:mb-10">
      <img 
        src="../assets/KitaHome_Logo.png" 
        alt="KitaHome Logo" 
        class="w-48 sm:w-56 md:w-64 lg:w-72 h-auto object-contain filter drop-shadow-lg"
      />
    </div>

    <!-- Form container -->
    <div class="max-w-md w-full space-y-6 p-4 sm:p-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
      <!-- Progress bar -->
      <div class="flex items-center justify-center mb-8">
        <div class="w-3/4 flex items-center justify-between">
          <template v-for="(step, index) in 3" :key="step">
            <div class="flex items-center">
              <div 
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  currentStep >= step 
                    ? 'bg-[#4D5BBF] text-white' 
                    : 'bg-[#e4e4e7] text-[#71717a]'
                ]"
              >
                {{ step }}
              </div>
              <!-- Only add line if not the last step -->
              <div 
                v-if="index < 2"
                :class="[
                  'w-12 sm:w-20 h-1 mx-2',
                  currentStep > step ? 'bg-[#4D5BBF]' : 'bg-[#e4e4e7]'
                ]"
              ></div>
            </div>
          </template>
        </div>
      </div>

      <!-- Step indicators -->
      <div class="text-center mb-6">
        <h2 class="text-2xl sm:text-3xl font-bold text-[#232959]">
          {{ stepTitles[currentStep - 1] }}
        </h2>
        <p class="text-sm sm:text-base font-medium text-[#71717a] mt-2">
          {{ stepDescriptions[currentStep - 1] }}
        </p>
      </div>

      <!-- Form steps -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Step 1: Basic Information -->
        <div v-if="currentStep === 1" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-[#3f3f46]">Full Name</label>
            <input 
              id="name" 
              v-model="formData.name" 
              type="text" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-[#e4e4e7] rounded-md shadow-sm focus:ring-[#4D5BBF] focus:border-[#4D5BBF]"
            />
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-[#3f3f46]">Email</label>
            <input 
              id="email" 
              v-model="formData.email" 
              type="email" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-[#e4e4e7] rounded-md shadow-sm focus:ring-[#4D5BBF] focus:border-[#4D5BBF]"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-[#3f3f46]">Password</label>
            <input 
              id="password" 
              v-model="formData.password" 
              type="password" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-[#e4e4e7] rounded-md shadow-sm focus:ring-[#4D5BBF] focus:border-[#4D5BBF]"
            />
          </div>
          <div>
            <label for="phone" class="block text-sm font-medium text-[#3f3f46]">Phone Number</label>
            <input 
              id="phone" 
              v-model="formData.phone" 
              type="tel" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-[#e4e4e7] rounded-md shadow-sm focus:ring-[#4D5BBF] focus:border-[#4D5BBF]"
            />
          </div>
        </div>

        <!-- Step 2: Residence Information -->
        <div v-if="currentStep === 2" class="space-y-4">
          <div>
            <label for="residence" class="block text-sm font-medium text-[#3f3f46]">Residence</label>
            <select 
              id="residence" 
              v-model="formData.residence" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-[#e4e4e7] rounded-md shadow-sm focus:ring-[#4D5BBF] focus:border-[#4D5BBF]"
            >
              <option value="">Select Residence</option>
              <option value="res1">Residence 1</option>
              <option value="res2">Residence 2</option>
            </select>
          </div>
          <div>
            <label for="unit" class="block text-sm font-medium text-[#3f3f46]">Unit Number</label>
            <input 
              id="unit" 
              v-model="formData.unit" 
              type="text" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-[#e4e4e7] rounded-md shadow-sm focus:ring-[#4D5BBF] focus:border-[#4D5BBF]"
            />
          </div>
        </div>

        <!-- Step 3: Identification -->
        <div v-if="currentStep === 3" class="space-y-4">
          <div>
            <label for="nationality" class="block text-sm font-medium text-[#3f3f46]">Nationality</label>
            <input 
              id="nationality" 
              v-model="formData.nationality" 
              type="text" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-[#e4e4e7] rounded-md shadow-sm focus:ring-[#4D5BBF] focus:border-[#4D5BBF]"
            />
          </div>
          <div>
            <label for="idNumber" class="block text-sm font-medium text-[#3f3f46]">IC/Passport Number</label>
            <input 
              id="idNumber" 
              v-model="formData.idNumber" 
              type="text" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-[#e4e4e7] rounded-md shadow-sm focus:ring-[#4D5BBF] focus:border-[#4D5BBF]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#3f3f46]">Submit your identification document</label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#e4e4e7] border-dashed rounded-md">
              <div class="space-y-1 text-center">
                <svg class="mx-auto h-12 w-12 text-[#71717a]" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="flex text-sm text-[#71717a]">
                  <label for="file-upload" class="relative cursor-pointer rounded-md font-medium text-[#4D5BBF] hover:text-[#3e49a3]">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" class="sr-only" @change="handleFileUpload">
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p class="text-xs text-[#71717a]">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation buttons -->
        <div class="flex justify-between space-x-4">
          <button 
            v-if="currentStep > 1"
            type="button"
            @click="prevStep"
            class="flex-1 py-2 px-4 border border-[#e4e4e7] text-[#3f3f46] rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D5BBF]"
          >
            Previous
          </button>
          <button 
            type="submit"
            class="flex-1 py-2 px-4 border border-transparent text-white bg-[#4D5BBF] rounded-md hover:bg-[#3e49a3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D5BBF]"
          >
            {{ currentStep === 3 ? 'Create Account' : 'Next' }}
          </button>
        </div>
      </form>

      <!-- Back to login link -->
      <div class="text-center mt-4">
        <router-link 
          to="/" 
          class="text-sm font-medium text-[#4D5BBF] hover:text-[#3e49a3] flex items-center justify-center space-x-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Login</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SignupView',
  data() {
    return {
      currentStep: 1,
      stepTitles: [
        'Personal Information',
        'Residence Details',
        'Identification'
      ],
      stepDescriptions: [
        'Please provide your basic information',
        'Enter your residence details',
        'Verify your identity'
      ],
      formData: {
        name: '',
        email: '',
        password: '',
        phone: '',
        residence: '',
        unit: '',
        nationality: '',
        idNumber: '',
        idDocument: null
      }
    }
  },
  methods: {
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },
    handleSubmit() {
      if (this.currentStep < 3) {
        this.currentStep++
      } else {
        this.submitForm()
      }
    },
    handleFileUpload(event) {
      this.formData.idDocument = event.target.files[0]
    },
    submitForm() {
      // Implement final form submission logic here
      console.log('Form submitted:', this.formData)
    }
  }
}
</script>

<style scoped>
.animated-gradient {
  background: linear-gradient(-45deg, #4D5BBF, #7683cd, #3e49a3, #333c87);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>