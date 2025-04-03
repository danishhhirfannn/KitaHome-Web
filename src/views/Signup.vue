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
              @input="validateField('name')"
            />
            <p v-if="validationErrors.name" class="mt-1 text-sm text-red-600">{{ validationErrors.name }}</p>
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-[#3f3f46]">Email</label>
            <input 
              id="email" 
              v-model="formData.email" 
              type="email" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-[#e4e4e7] rounded-md shadow-sm focus:ring-[#4D5BBF] focus:border-[#4D5BBF]"
              @input="validateField('email')"
            />
            <p v-if="validationErrors.email" class="mt-1 text-sm text-red-600">{{ validationErrors.email }}</p>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-[#3f3f46]">Password</label>
            <div class="relative mt-1">
              <input 
                id="password" 
                v-model="formData.password" 
                :type="showPassword ? 'text' : 'password'" 
                required 
                class="block w-full px-3 py-2 border border-[#e4e4e7] rounded-md shadow-sm focus:ring-[#4D5BBF] focus:border-[#4D5BBF]"
                @input="validateField('password')"
              />
              <button 
                type="button" 
                @click="showPassword = !showPassword" 
                class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <p v-if="validationErrors.password" class="mt-1 text-sm text-red-600">{{ validationErrors.password }}</p>
          </div>
          <div>
            <label for="phone" class="block text-sm font-medium text-[#3f3f46]">Phone Number</label>
            <input 
              id="phone" 
              v-model="formData.phone" 
              type="tel" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-[#e4e4e7] rounded-md shadow-sm focus:ring-[#4D5BBF] focus:border-[#4D5BBF]"
              @input="validateField('phone')"
            />
            <p v-if="validationErrors.phone" class="mt-1 text-sm text-red-600">{{ validationErrors.phone }}</p>
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
              @change="validateField('residence')"
            >
              <option value="">Select Residence</option>
              <option v-for="residence in residences" :key="residence.residenceID" :value="residence.residenceID">
                {{ residence.residenceName }}
              </option>
            </select>
            <p v-if="validationErrors.residence" class="mt-1 text-sm text-red-600">{{ validationErrors.residence }}</p>
            <div v-if="isLoading.residences" class="mt-2 text-sm text-[#71717a]">
              <i class="pi pi-spinner animate-spin mr-1"></i> Loading residences...
            </div>
            <div v-if="loadError" class="mt-2 text-sm text-red-500">
              {{ loadError }}
            </div>
          </div>
          <div>
            <label for="unit" class="block text-sm font-medium text-[#3f3f46]">Unit Number</label>
            <input 
              id="unit" 
              v-model="formData.unit" 
              type="text" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-[#e4e4e7] rounded-md shadow-sm focus:ring-[#4D5BBF] focus:border-[#4D5BBF]"
              @input="validateField('unit')"
            />
            <p v-if="validationErrors.unit" class="mt-1 text-sm text-red-600">{{ validationErrors.unit }}</p>
          </div>
        </div>

        <!-- Step 3: Identification -->
        <div v-if="currentStep === 3" class="space-y-4">
          <div>
            <label for="nationality" class="block text-sm font-medium text-[#3f3f46]">Nationality</label>
            <select 
              id="nationality" 
              v-model="formData.nationality" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-[#e4e4e7] rounded-md shadow-sm focus:ring-[#4D5BBF] focus:border-[#4D5BBF]"
              @change="validateField('nationality')"
            >
              <option value="">Select Country</option>
              <option v-for="country in countries" :key="country" :value="country">
                {{ country }}
              </option>
            </select>
            <p v-if="validationErrors.nationality" class="mt-1 text-sm text-red-600">{{ validationErrors.nationality }}</p>
          </div>
          <div>
            <label for="idNumber" class="block text-sm font-medium text-[#3f3f46]">IC/Passport Number</label>
            <input 
              id="idNumber" 
              v-model="formData.idNumber" 
              type="text" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-[#e4e4e7] rounded-md shadow-sm focus:ring-[#4D5BBF] focus:border-[#4D5BBF]"
              @input="validateField('idNumber')"
            />
            <p v-if="validationErrors.idNumber" class="mt-1 text-sm text-red-600">{{ validationErrors.idNumber }}</p>
          </div>

          <!-- Consent Section -->
          <div class="space-y-4">
            <div class="text-sm text-[#71717a]">
              <p class="mb-2">Before uploading your identification document, please read and agree to the following:</p>
              <div class="bg-gray-50 p-4 rounded-md text-left">
                <p class="text-sm text-gray-700 mb-2">By uploading your identification document, you consent to:</p>
                <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Collection and storage of your identification document for verification purposes</li>
                  <li>Processing of your personal information in accordance with our Privacy Policy</li>
                  <li>Verification of your identity by our management team</li>
                  <li>Storage of your document for the duration of your residency</li>
                </ul>
              </div>
            </div>
            <div class="flex items-center">
              <input
                type="checkbox"
                id="consent"
                v-model="formData.consent"
                class="h-4 w-4 text-[#4D5BBF] focus:ring-[#4D5BBF] border-gray-300 rounded"
              />
              <label for="consent" class="ml-2 block text-sm text-gray-700">
                I have read and agree to the above terms
              </label>
            </div>
            <p v-if="validationErrors.consent" class="text-sm text-red-600">{{ validationErrors.consent }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-[#3f3f46]">Submit your identification document</label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#e4e4e7] border-dashed rounded-md">
              <div class="space-y-1 text-center">
                <svg v-if="!formData.idDocument" class="mx-auto h-12 w-12 text-[#71717a]" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div v-if="formData.idDocument" class="flex flex-col items-center justify-center">
                  <div class="bg-[#e2e8f0] px-4 py-3 rounded flex items-center mb-3">
                    <svg class="h-5 w-5 text-[#4D5BBF] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="text-sm text-[#3f3f46] truncate max-w-[200px]">{{ formData.idDocument.name }}</span>
                  </div>
                  <button 
                    type="button" 
                    @click="removeFile" 
                    class="text-sm text-[#4D5BBF] hover:text-[#ef4444] flex items-center"
                  >
                    <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove file
                  </button>
                </div>
                <div v-else class="flex text-sm text-[#71717a]">
                  <label for="file-upload" class="relative cursor-pointer rounded-md font-medium text-[#4D5BBF] hover:text-[#3e49a3]">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" class="sr-only" @change="handleFileUpload" :disabled="!formData.consent">
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p v-if="!formData.idDocument" class="text-xs text-[#71717a]">PNG, JPG, PDF up to 10MB</p>
                <p v-if="validationErrors.idDocument" class="mt-1 text-sm text-red-600">{{ validationErrors.idDocument }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Registration Success Message -->
        <div v-if="registrationComplete" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">Registration successful!</h3>
              <div class="mt-2 text-sm text-green-700">
                <p>You will be redirected to the login page.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Registration Error Message -->
        <div v-if="registrationError" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">An error occurred</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ registrationError }}</p>
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
            :disabled="isLoading.submission"
            class="flex-1 py-2 px-4 border border-[#e4e4e7] text-[#3f3f46] rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D5BBF] disabled:opacity-50"
          >
            Previous
          </button>
          <button 
            type="submit"
            :disabled="isLoading.submission"
            class="flex-1 py-2 px-4 border border-transparent text-white bg-[#4D5BBF] rounded-md hover:bg-[#3e49a3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D5BBF] disabled:opacity-50 flex items-center justify-center"
          >
            <svg v-if="isLoading.submission" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
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
import { supabase } from '@/api/supabase';

export default {
  name: 'SignupView',
  data() {
    return {
      currentStep: 1,
      showPassword: false,
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
        idDocument: null,
        consent: false
      },
      userId: null, // To store the created user ID after step 2
      residences: [],
      countries: [
        'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 
        'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 
        'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 
        'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 
        'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 
        'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 
        'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 
        'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 
        'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 
        'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 
        'Korea, South', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 
        'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 
        'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 
        'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 
        'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway', 'Oman', 
        'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 
        'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 
        'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 
        'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 
        'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 
        'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 
        'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 
        'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 
        'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
      ],
      isLoading: {
        residences: false,
        submission: false
      },
      loadError: null,
      registrationError: null,
      validationErrors: {},
      registrationComplete: false
    }
  },
  methods: {
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    async handleSubmit() {
      // First validate the current step
      if (!this.validateStep()) {
        return; // Stop if validation fails
      }
      
      if (this.currentStep === 1) {
        // Just proceed to next step for basic info
        if (this.residences.length === 0) {
          await this.fetchResidences();
        }
        this.currentStep++;
      } 
      else if (this.currentStep === 2) {
        // Create user account after step 2
        try {
          this.isLoading.submission = true;
          this.registrationError = null;
          
          // 1. Create authentication account
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: this.formData.email,
            password: this.formData.password,
            options: {
              data: {
                full_name: this.formData.name
              }
            }
          });
          
          if (authError) throw authError;
          
          if (!authData.user) {
            throw new Error('Failed to create user account');
          }
          
          this.userId = authData.user.id;
          
          // 2. Create user profile record (without identification details yet)
          const { error: profileError } = await supabase
            .from('User')
            .insert([
              {
                userID: this.userId,
                email: this.formData.email,
                fullName: this.formData.name,
                phone: this.formData.phone,
                isResident: true,
                isManagement: false,
                isAdmin: false,
                isVerified: false,
                isDeclined: false,
                residenceID: this.formData.residence,
                unitNumber: this.formData.unit,
                created_at: new Date()
              }
            ]);
          
          if (profileError) throw profileError;
          
          // Move to identification step
          this.currentStep++;
        } catch (error) {
          console.error('Registration error (step 2):', error);
          this.registrationError = error.message || 'Failed to create account. Please try again.';
        } finally {
          this.isLoading.submission = false;
        }
      } 
      else if (this.currentStep === 3) {
        // Complete registration with identification details
        try {
          this.isLoading.submission = true;
          this.registrationError = null;
          
          // 1. Upload ID document if provided
          let documentPath = null;
          if (this.formData.idDocument) {
            documentPath = await this.uploadIdDocument(this.userId);
          }
          
          // 2. Update user profile with identification details
          const { error: updateError } = await supabase
            .from('User')
            .update({
              userNationality: this.formData.nationality,
              userIdentificationNumber: this.formData.idNumber,
              identification_url: documentPath
            })
            .eq('userID', this.userId);
          
          if (updateError) throw updateError;
          
          // Registration successful
          this.registrationComplete = true;
          
          // Sign out the user before redirecting to prevent automatic login
          await supabase.auth.signOut();
          
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            this.$router.push('/');
          }, 3000);
          
        } catch (error) {
          console.error('Registration error (step 3):', error);
          this.registrationError = error.message || 'Failed to complete registration. Please try again.';
        } finally {
          this.isLoading.submission = false;
        }
      }
    },
    validateStep() {
      this.validationErrors = {};
      
      if (this.currentStep === 1) {
        // Name validation
        if (!this.formData.name.trim()) {
          this.validationErrors.name = 'Name is required';
        } else if (!/^[a-zA-Z\s'-]+$/.test(this.formData.name)) {
          this.validationErrors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
        } else if (this.formData.name.length < 2) {
          this.validationErrors.name = 'Name must be at least 2 characters long';
        }
        
        // Email validation
        if (!this.formData.email.trim()) {
          this.validationErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
          this.validationErrors.email = 'Please enter a valid email address';
        }
        
        // Password validation
        if (!this.formData.password) {
          this.validationErrors.password = 'Password is required';
        } else if (this.formData.password.length < 8) {
          this.validationErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])/.test(this.formData.password)) {
          this.validationErrors.password = 'Password must include at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(this.formData.password)) {
          this.validationErrors.password = 'Password must include at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(this.formData.password)) {
          this.validationErrors.password = 'Password must include at least one number';
        }
        
        // Phone number validation
        if (!this.formData.phone.trim()) {
          this.validationErrors.phone = 'Phone number is required';
        } else if (!/^\+?[\d\s-()]+$/.test(this.formData.phone)) {
          this.validationErrors.phone = 'Please enter a valid phone number';
        } else if (this.formData.phone.replace(/[\s-()]/g, '').length < 8) {
          this.validationErrors.phone = 'Phone number must be at least 8 digits';
        }
      } else if (this.currentStep === 2) {
        // Residence validation
        if (!this.formData.residence) {
          this.validationErrors.residence = 'Please select a residence';
        }
        
        // Unit number validation
        if (!this.formData.unit.trim()) {
          this.validationErrors.unit = 'Unit number is required';
        } else if (!/^[a-zA-Z0-9\s-]+$/.test(this.formData.unit)) {
          this.validationErrors.unit = 'Unit number can only contain letters, numbers, spaces, and hyphens';
        }
      } else if (this.currentStep === 3) {
        // Nationality validation
        if (!this.formData.nationality) {
          this.validationErrors.nationality = 'Please select your nationality';
        }
        
        // ID number validation
        if (!this.formData.idNumber.trim()) {
          this.validationErrors.idNumber = 'ID number is required';
        } else if (!/^[a-zA-Z0-9]+$/.test(this.formData.idNumber)) {
          this.validationErrors.idNumber = 'ID number can only contain letters and numbers';
        } else if (this.formData.idNumber.length < 5) {
          this.validationErrors.idNumber = 'ID number must be at least 5 characters';
        }
        
        // Consent validation
        if (!this.formData.consent) {
          this.validationErrors.consent = 'Please agree to the terms before proceeding';
        }
        
        // Required document
        if (!this.formData.idDocument) {
          this.validationErrors.idDocument = 'Please upload an identification document';
        }
      }
      
      return Object.keys(this.validationErrors).length === 0;
    },
    handleFileUpload(event) {
      if (!this.formData.consent) {
        this.validationErrors.consent = 'Please agree to the terms before uploading your document';
        return;
      }

      const file = event.target.files[0];
      if (!file) return;
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPG, PNG, or PDF files are allowed');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      this.formData.idDocument = file;
      delete this.validationErrors.consent;
    },
    removeFile() {
      this.formData.idDocument = null;
    },
    async fetchResidences() {
      this.isLoading.residences = true;
      this.loadError = null;
      
      try {
        const { data, error } = await supabase
          .from('Residence')
          .select('residenceID, residenceName')
          .order('residenceName');
          
        if (error) throw error;
        
        this.residences = data || [];
        
        if (this.residences.length === 0) {
          this.loadError = 'No residences found in the system';
        }
      } catch (error) {
        console.error('Error fetching residences:', error);
        this.loadError = 'Failed to load residences. Please try again.';
      } finally {
        this.isLoading.residences = false;
      }
    },
    async uploadIdDocument(userId) {
      if (!this.formData.idDocument) return null;
      
      const file = this.formData.idDocument;
      const filePath = `identifications/${userId}-${file.name}`;
      
      try {
        const { error: uploadError } = await supabase.storage
          .from('identifications')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: fileData } = supabase.storage
          .from('identifications')
          .getPublicUrl(filePath);
        
        if (!fileData) throw new Error('Failed to fetch uploaded file URL.');
        
        return fileData.publicUrl;
      } catch (error) {
        console.error('Error uploading document:', error);
        throw new Error('Failed to upload identification document');
      }
    },
    validateField(field) {
      if (this.currentStep === 1) {
        if (field === 'name') {
          if (!this.formData.name.trim()) {
            this.validationErrors.name = 'Name is required';
          } else if (!/^[a-zA-Z\s'-]+$/.test(this.formData.name)) {
            this.validationErrors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
          } else if (this.formData.name.length < 2) {
            this.validationErrors.name = 'Name must be at least 2 characters long';
          } else {
            delete this.validationErrors.name;
          }
        } else if (field === 'email') {
          if (!this.formData.email.trim()) {
            this.validationErrors.email = 'Email is required';
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
            this.validationErrors.email = 'Please enter a valid email address';
          } else {
            delete this.validationErrors.email;
          }
        } else if (field === 'password') {
          if (!this.formData.password) {
            this.validationErrors.password = 'Password is required';
          } else if (this.formData.password.length < 8) {
            this.validationErrors.password = 'Password must be at least 8 characters';
          } else if (!/(?=.*[a-z])/.test(this.formData.password)) {
            this.validationErrors.password = 'Password must include at least one lowercase letter';
          } else if (!/(?=.*[A-Z])/.test(this.formData.password)) {
            this.validationErrors.password = 'Password must include at least one uppercase letter';
          } else if (!/(?=.*\d)/.test(this.formData.password)) {
            this.validationErrors.password = 'Password must include at least one number';
          } else {
            delete this.validationErrors.password;
          }
        } else if (field === 'phone') {
          if (!this.formData.phone.trim()) {
            this.validationErrors.phone = 'Phone number is required';
          } else if (!/^\+?[\d\s-()]+$/.test(this.formData.phone)) {
            this.validationErrors.phone = 'Please enter a valid phone number';
          } else if (this.formData.phone.replace(/[\s-()]/g, '').length < 8) {
            this.validationErrors.phone = 'Phone number must be at least 8 digits';
          } else {
            delete this.validationErrors.phone;
          }
        }
      } else if (this.currentStep === 2) {
        if (field === 'residence') {
          if (!this.formData.residence) {
            this.validationErrors.residence = 'Please select a residence';
          } else {
            delete this.validationErrors.residence;
          }
        } else if (field === 'unit') {
          if (!this.formData.unit.trim()) {
            this.validationErrors.unit = 'Unit number is required';
          } else if (!/^[a-zA-Z0-9\s-]+$/.test(this.formData.unit)) {
            this.validationErrors.unit = 'Unit number can only contain letters, numbers, spaces, and hyphens';
          } else {
            delete this.validationErrors.unit;
          }
        }
      } else if (this.currentStep === 3) {
        if (field === 'nationality') {
          if (!this.formData.nationality) {
            this.validationErrors.nationality = 'Please select your nationality';
          } else {
            delete this.validationErrors.nationality;
          }
        } else if (field === 'idNumber') {
          if (!this.formData.idNumber.trim()) {
            this.validationErrors.idNumber = 'ID number is required';
          } else if (!/^[a-zA-Z0-9]+$/.test(this.formData.idNumber)) {
            this.validationErrors.idNumber = 'ID number can only contain letters and numbers';
          } else if (this.formData.idNumber.length < 5) {
            this.validationErrors.idNumber = 'ID number must be at least 5 characters';
          } else {
            delete this.validationErrors.idNumber;
          }
        }
      }
    }
  },
  async mounted() {
    // Only fetch residences if on step 2
    if (this.currentStep === 2) {
      this.fetchResidences();
    }
    
    // No session check needed for signup page
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