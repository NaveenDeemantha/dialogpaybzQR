<template>
  <div class="min-h-screen bg-black text-zinc-100 font-sans antialiased selection:bg-zinc-800 selection:text-white">
    
    <!-- Top Navigation -->
    <header class="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <!-- Brand / Title -->
        <div class="flex items-center gap-3">
          <div class="h-7 w-7 rounded bg-white text-black font-mono font-bold flex items-center justify-center text-xs tracking-tighter">
            DP
          </div>
          <div class="flex items-center gap-2">
            <h1 class="text-sm font-semibold text-white tracking-tight">DialogPay Business</h1>
            <span class="text-zinc-600 font-mono text-xs">/</span>
            <span class="text-xs text-zinc-400 font-mono">Dynamic QR Terminal</span>
          </div>
        </div>

        <!-- Environment Selector & Controls -->
        <div class="flex items-center gap-3">
          <!-- Environment Tabs -->
          <div class="inline-flex p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium">
            <button 
              type="button" 
              @click="switchEnvironment('uat')"
              :class="form.environment === 'uat' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'"
              class="px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400" v-if="form.environment === 'uat'"></span>
              UAT Sandbox
            </button>
            <button 
              type="button" 
              @click="switchEnvironment('live')"
              :class="form.environment === 'live' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'"
              class="px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" v-if="form.environment === 'live'"></span>
              Production Live
            </button>
          </div>

          <button 
            type="button" 
            @click="loadSampleDemo" 
            class="text-xs text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-900 px-2.5 py-1 rounded-lg transition">
            Load Sample
          </button>
        </div>

      </div>
    </header>

    <!-- Main Workspace -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Toast / Notification Bar -->
      <div v-if="notification.show" 
        :class="notification.type === 'error' 
          ? 'bg-zinc-900 border-red-900/60 text-red-300' 
          : 'bg-zinc-900 border-zinc-700 text-zinc-200'"
        class="mb-6 border rounded-xl px-4 py-3 text-xs flex items-center justify-between font-mono">
        <div class="flex items-center gap-2">
          <span :class="notification.type === 'error' ? 'text-red-400' : 'text-zinc-400'">•</span>
          <span>{{ notification.message }}</span>
        </div>
        <button @click="notification.show = false" class="text-zinc-500 hover:text-zinc-300 text-sm">✕</button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- LEFT COLUMN: Configurations & Input Form (7 cols) -->
        <div class="lg:col-span-7 space-y-6">
          
          <!-- Section 1: API Configuration -->
          <div class="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 sm:p-6">
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/80">
              <div>
                <h2 class="text-xs font-semibold uppercase tracking-wider text-zinc-300">1. API Authentication</h2>
                <p class="text-xs text-zinc-500 mt-0.5 font-mono">Target: {{ activeEndpointUrl }}/public/me</p>
              </div>
              <span v-if="merchant.synced" class="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-emerald-400 border border-zinc-800">
                Connected
              </span>
            </div>

            <div class="space-y-4">
              <div>
                <div class="flex justify-between items-center mb-1.5">
                  <label class="text-xs font-medium text-zinc-300">Authorization Key</label>
                  <button 
                    type="button" 
                    @click="showApiKey = !showApiKey" 
                    class="text-[11px] text-zinc-500 hover:text-zinc-300 font-mono">
                    [{{ showApiKey ? 'Hide' : 'Reveal' }}]
                  </button>
                </div>
                <input 
                  :type="showApiKey ? 'text' : 'password'"
                  v-model="form.apiKey" 
                  placeholder="Paste your API key or token"
                  class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-zinc-300 mb-1.5">
                  App ID <span class="text-zinc-600 font-normal">(Optional header: x-app-id)</span>
                </label>
                <input 
                  type="text" 
                  v-model="form.appId" 
                  placeholder="e.g. app_live_XXXXX or app_uat_XXXXX"
                  class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition"
                />
              </div>

              <div class="pt-2 flex items-center gap-3">
                <button 
                  type="button"
                  @click="fetchCompanyDetails"
                  :disabled="loading.fetchingCompany || !form.apiKey"
                  class="flex-1 bg-white hover:bg-zinc-200 text-black font-medium text-xs py-2 px-4 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
                  <span v-if="loading.fetchingCompany" class="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>{{ loading.fetchingCompany ? 'Connecting to API...' : 'Fetch Merchant Profile' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Section 2: Merchant Metadata -->
          <div class="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 sm:p-6">
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/80">
              <div>
                <h2 class="text-xs font-semibold uppercase tracking-wider text-zinc-300">2. Merchant Details</h2>
                <p class="text-xs text-zinc-500 mt-0.5">Parameters encoded into EMVCo tags (02, 04, 26, 52, 59, 60)</p>
              </div>
              <button 
                type="button" 
                @click="showAdvancedMerchant = !showAdvancedMerchant"
                class="text-[11px] text-zinc-400 hover:text-white font-mono underline">
                {{ showAdvancedMerchant ? 'Collapse' : 'Manual Override' }}
              </button>
            </div>

            <!-- Profile Summary Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div class="bg-zinc-900/60 border border-zinc-800/60 rounded-lg p-3">
                <span class="text-[10px] text-zinc-500 uppercase font-mono block">Merchant (Tag 59)</span>
                <span class="font-medium text-zinc-200 truncate block mt-0.5" :title="merchant.merchantName">{{ merchant.merchantName || '—' }}</span>
              </div>
              <div class="bg-zinc-900/60 border border-zinc-800/60 rounded-lg p-3">
                <span class="text-[10px] text-zinc-500 uppercase font-mono block">City / Country (60, 58)</span>
                <span class="font-medium text-zinc-200 truncate block mt-0.5">{{ merchant.merchantCity || 'Colombo' }}, {{ merchant.merchantCountryCode || 'LK' }}</span>
              </div>
              <div class="bg-zinc-900/60 border border-zinc-800/60 rounded-lg p-3">
                <span class="text-[10px] text-zinc-500 uppercase font-mono block">MCC (Tag 52)</span>
                <span class="font-mono text-zinc-200 block mt-0.5">{{ merchant.merchantMccCode || '5300' }}</span>
              </div>
            </div>

            <!-- Rails Checklist -->
            <div class="mt-4 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span class="text-zinc-500">Configured Rails:</span>
              <span class="px-2 py-0.5 rounded border" :class="merchant.visaPan ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-transparent text-zinc-600 border-zinc-800'">
                Visa {{ merchant.visaPan ? '✓' : '—' }}
              </span>
              <span class="px-2 py-0.5 rounded border" :class="merchant.mastercardPan ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-transparent text-zinc-600 border-zinc-800'">
                Mastercard {{ merchant.mastercardPan ? '✓' : '—' }}
              </span>
              <span class="px-2 py-0.5 rounded border" :class="merchant.unionpayPan ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-transparent text-zinc-600 border-zinc-800'">
                UnionPay {{ merchant.unionpayPan ? '✓' : '—' }}
              </span>
              <span class="px-2 py-0.5 rounded border" :class="merchant.merchantGuidAcquirerId ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-transparent text-zinc-600 border-zinc-800'">
                LANKAQR {{ merchant.merchantGuidAcquirerId ? '✓' : '—' }}
              </span>
            </div>

            <!-- Manual Override Inputs -->
            <div v-if="showAdvancedMerchant" class="mt-4 pt-4 border-t border-zinc-800 space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label class="text-[11px] text-zinc-400 block mb-1">Tag 59: Merchant Name</label>
                  <input v-model="merchant.merchantName" maxlength="25" class="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200" />
                </div>
                <div>
                  <label class="text-[11px] text-zinc-400 block mb-1">Tag 60: Merchant City</label>
                  <input v-model="merchant.merchantCity" maxlength="15" class="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200" />
                </div>
                <div>
                  <label class="text-[11px] text-zinc-400 block mb-1">Tag 02/03: Visa PAN</label>
                  <input v-model="merchant.visaPan" maxlength="16" class="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 font-mono" />
                </div>
                <div>
                  <label class="text-[11px] text-zinc-400 block mb-1">Tag 04/05: Mastercard PAN</label>
                  <input v-model="merchant.mastercardPan" maxlength="16" class="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 font-mono" />
                </div>
                <div>
                  <label class="text-[11px] text-zinc-400 block mb-1">Tag 15/16: UnionPay PAN</label>
                  <input v-model="merchant.unionpayPan" maxlength="31" class="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 font-mono" />
                </div>
                <div>
                  <label class="text-[11px] text-zinc-400 block mb-1">Tag 26: Acquirer / Merchant GUID</label>
                  <input v-model="merchant.merchantGuidAcquirerId" maxlength="32" class="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 font-mono" />
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Dynamic Transaction Details -->
          <div class="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 sm:p-6">
            <div class="pb-4 mb-4 border-b border-zinc-800/80">
              <h2 class="text-xs font-semibold uppercase tracking-wider text-zinc-300">3. Transaction Parameters</h2>
              <p class="text-xs text-zinc-500 mt-0.5">Amount (Tag 54) and Reference Label (Tag 62.05)</p>
            </div>

            <div class="space-y-4">
              <!-- Amount Entry -->
              <div>
                <label class="block text-xs font-medium text-zinc-300 mb-1.5">
                  Payment Amount (LKR)
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 font-mono text-sm">
                    LKR
                  </span>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    v-model="transaction.amount" 
                    placeholder="0.00"
                    class="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-14 pr-4 py-2.5 text-xl font-mono font-semibold text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                  />
                </div>

                <!-- Quick Presets -->
                <div class="flex items-center gap-1.5 mt-2 text-xs">
                  <span class="text-[11px] text-zinc-500 font-mono mr-1">Presets:</span>
                  <button 
                    v-for="amt in [100, 500, 1000, 2500, 5000]" 
                    :key="amt"
                    type="button" 
                    @click="addAmount(amt)"
                    class="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[11px] font-mono transition">
                    +{{ amt }}
                  </button>
                  <button 
                    type="button" 
                    @click="transaction.amount = ''"
                    class="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-500 hover:text-zinc-300 text-[11px] font-mono ml-auto">
                    Clear
                  </button>
                </div>
              </div>

              <!-- Reference ID -->
              <div>
                <div class="flex justify-between items-center mb-1.5">
                  <label class="text-xs font-medium text-zinc-300">Reference / Invoice ID (Tag 62.05)</label>
                  <button 
                    type="button" 
                    @click="generateRandomReference" 
                    class="text-[11px] text-zinc-400 hover:text-white font-mono underline">
                    Auto-Generate
                  </button>
                </div>
                <input 
                  type="text" 
                  v-model="transaction.referenceLabel" 
                  maxlength="25"
                  placeholder="e.g. INV-89201"
                  class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                />
              </div>

              <!-- QR Mode (Dynamic vs Static) -->
              <div class="flex items-center justify-between pt-3 border-t border-zinc-800/60">
                <div>
                  <div class="text-xs font-medium text-zinc-200">Point of Initiation</div>
                  <div class="text-[11px] text-zinc-500 font-mono">
                    {{ transaction.isDynamic ? 'Tag 01 = 12 (Dynamic QR with fixed amount)' : 'Tag 01 = 11 (Static QR, customer enters amount)' }}
                  </div>
                </div>
                <button 
                  type="button"
                  @click="transaction.isDynamic = !transaction.isDynamic"
                  :class="transaction.isDynamic ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'"
                  class="px-3 py-1 rounded text-xs font-medium border border-zinc-700 transition">
                  {{ transaction.isDynamic ? 'Dynamic' : 'Static' }}
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN: Professional POS Display & QR Code (5 cols) -->
        <div class="lg:col-span-5 space-y-6">
          
          <!-- Terminal / POS Standee Card -->
          <div id="printableQrStandee" class="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center">
            
            <!-- Terminal Header -->
            <div class="w-full pb-3 mb-4 border-b border-zinc-800 flex justify-between items-center">
              <span class="text-[10px] font-mono uppercase tracking-widest text-zinc-400">EMVCo LANKAQR</span>
              <span class="text-[10px] font-mono text-zinc-500 uppercase">{{ form.environment }}</span>
            </div>

            <!-- Merchant Title -->
            <div class="mb-4">
              <div class="text-sm font-semibold text-zinc-100 tracking-tight">{{ merchant.merchantName || 'Genie Business Merchant' }}</div>
              <div class="text-xs text-zinc-500">{{ merchant.merchantCity || 'Colombo' }}, LK</div>
            </div>

            <!-- High-Contrast Clean QR Code Box -->
            <div class="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm inline-block">
              <qrcode-vue
                ref="qrCodeRef"
                :value="qrPayload"
                :size="220"
                level="M"
                render-as="canvas"
              />
            </div>

            <!-- Amount Display -->
            <div class="mt-4 w-full bg-zinc-900 border border-zinc-800/80 rounded-xl p-3.5">
              <div class="text-[10px] font-mono text-zinc-500 uppercase">Amount Due</div>
              <div class="text-2xl font-bold font-mono text-white mt-0.5">
                {{ formattedDisplayAmount }}
              </div>
              <div v-if="transaction.referenceLabel" class="text-xs text-zinc-400 font-mono mt-1">
                Ref: {{ transaction.referenceLabel }}
              </div>
            </div>

            <!-- Supported Rails Bar -->
            <div class="mt-3 w-full text-[10px] font-mono text-zinc-500 flex justify-center gap-3">
              <span>VISA</span>
              <span>•</span>
              <span>MASTERCARD</span>
              <span>•</span>
              <span>LANKAQR</span>
              <span>•</span>
              <span>UNIONPAY</span>
            </div>

            <!-- Actions Toolbar -->
            <div class="w-full grid grid-cols-2 gap-2.5 mt-5">
              <button 
                type="button" 
                @click="downloadQrImage"
                class="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium py-2 px-3 rounded-lg transition">
                Download PNG
              </button>

              <button 
                type="button" 
                @click="printStandee"
                class="bg-white hover:bg-zinc-200 text-black text-xs font-medium py-2 px-3 rounded-lg transition">
                Print Standee
              </button>
            </div>
          </div>

          <!-- EMVCo Payload Inspector -->
          <div class="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold uppercase tracking-wider text-zinc-300">Payload String</span>
                <span class="text-[10px] font-mono text-zinc-500">({{ qrPayload.length }} chars)</span>
              </div>
              <button 
                type="button" 
                @click="copyPayload" 
                class="text-xs font-mono text-zinc-400 hover:text-white underline">
                {{ copied ? 'Copied' : 'Copy' }}
              </button>
            </div>

            <div class="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-[11px] font-mono text-zinc-300 break-all select-all leading-relaxed max-h-24 overflow-y-auto">
              {{ qrPayload }}
            </div>

            <!-- Tag Breakdown Toggle -->
            <div class="mt-3 pt-3 border-t border-zinc-800/80">
              <button 
                type="button" 
                @click="showTagBreakdown = !showTagBreakdown"
                class="w-full flex items-center justify-between text-xs text-zinc-400 hover:text-zinc-200 font-mono">
                <span>Decoded Tag Structure ({{ decodedTags.length }} Tags)</span>
                <span>{{ showTagBreakdown ? '▲' : '▼' }}</span>
              </button>

              <div v-if="showTagBreakdown" class="mt-3 space-y-1.5 max-h-56 overflow-y-auto font-mono text-xs pr-1">
                <div 
                  v-for="tag in decodedTags" 
                  :key="tag.tag"
                  class="bg-zinc-900 border border-zinc-800/60 rounded p-2 text-[11px]">
                  <div class="flex justify-between text-zinc-400 mb-0.5">
                    <span class="text-white font-semibold">Tag {{ tag.tag }}: {{ tag.name }}</span>
                    <span class="text-zinc-500">Len: {{ tag.length }}</span>
                  </div>
                  <div class="text-zinc-300 break-all">{{ tag.value }}</div>

                  <!-- Sub tags -->
                  <div v-if="tag.subTags && tag.subTags.length" class="mt-1.5 pl-2 border-l border-zinc-700 space-y-1">
                    <div v-for="sub in tag.subTags" :key="sub.tag" class="text-[10px] text-zinc-400">
                      <span>Sub-tag {{ sub.tag }} ({{ sub.name }}):</span>
                      <span class="text-zinc-200 ml-1">{{ sub.value }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import QrcodeVue from 'qrcode.vue';
import axios from 'axios';
import { generateEmvQrPayload } from '@/Utils/emvQrGenerator';

const props = defineProps({
  defaultEnvironment: {
    type: String,
    default: 'uat',
  },
  defaultAppId: {
    type: String,
    default: '',
  },
  environments: {
    type: Array,
    default: () => [
      { id: 'uat', name: 'UAT Sandbox (api.uat.geniebiz.lk)', url: 'https://api.uat.geniebiz.lk' },
      { id: 'live', name: 'Production Live (api.geniebiz.lk)', url: 'https://api.geniebiz.lk' },
    ],
  },
});

// State
const qrCodeRef = ref(null);
const showApiKey = ref(false);
const showAdvancedMerchant = ref(false);
const showTagBreakdown = ref(false);
const copied = ref(false);

const loading = reactive({
  fetchingCompany: false,
});

const notification = reactive({
  show: false,
  message: '',
  type: 'success',
});

// Form state
const form = reactive({
  environment: props.defaultEnvironment || 'uat',
  apiKey: '',
  appId: props.defaultAppId || '',
});

// Merchant details (populated via API or sample)
const merchant = reactive({
  synced: false,
  merchantName: 'Genie Integrations',
  merchantCity: 'Colombo 03',
  merchantCountryCode: 'LK',
  merchantMccCode: '5300',
  trxCurrencyCode: '144',
  visaPan: '4325511220026799',
  mastercardPan: '2227132220026797',
  unionpayPan: '3950014400520446111111722002679',
  merchantGuidAcquirerId: '00281699500162022121311121661165',
});

// Transaction state
const transaction = reactive({
  amount: '1500.00',
  referenceLabel: 'INV-' + Math.floor(100000 + Math.random() * 900000),
  isDynamic: true,
});

// Active Base URL computed
const activeEndpointUrl = computed(() => {
  return form.environment === 'live' ? 'https://api.geniebiz.lk' : 'https://api.uat.geniebiz.lk';
});

// Display Amount formatted
const formattedDisplayAmount = computed(() => {
  const num = parseFloat(transaction.amount);
  if (isNaN(num) || num <= 0) return 'Variable Amount';
  return `LKR ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
});

// Reactive QR Payload generation
const qrData = computed(() => {
  return generateEmvQrPayload({
    isDynamic: transaction.isDynamic,
    pointOfInitiationMethod: transaction.isDynamic ? '12' : '11',
    amount: transaction.isDynamic ? transaction.amount : null,
    referenceLabel: transaction.referenceLabel,
    merchantName: merchant.merchantName,
    merchantCity: merchant.merchantCity,
    merchantCountryCode: merchant.merchantCountryCode,
    merchantMccCode: merchant.merchantMccCode,
    trxCurrencyCode: merchant.trxCurrencyCode,
    visaPan: merchant.visaPan,
    mastercardPan: merchant.mastercardPan,
    unionpayPan: merchant.unionpayPan,
    merchantGuidAcquirerId: merchant.merchantGuidAcquirerId,
  });
});

const qrPayload = computed(() => qrData.value.payload);
const decodedTags = computed(() => qrData.value.decodedTags);

// Methods
function switchEnvironment(env) {
  form.environment = env;
  const savedKey = localStorage.getItem(`genie_apiKey_${env}`);
  const savedAppId = localStorage.getItem(`genie_appId_${env}`);
  if (savedKey) form.apiKey = savedKey;
  if (savedAppId) form.appId = savedAppId;

  notify(`Switched to ${env.toUpperCase()} environment`, 'success');
}

function addAmount(val) {
  const current = parseFloat(transaction.amount) || 0;
  transaction.amount = (current + val).toFixed(2);
}

function generateRandomReference() {
  transaction.referenceLabel = 'INV-' + Math.floor(100000 + Math.random() * 900000);
}

function notify(msg, type = 'success') {
  notification.message = msg;
  notification.type = type;
  notification.show = true;
  setTimeout(() => {
    notification.show = false;
  }, 4000);
}

// Fetch merchant details from backend proxy
async function fetchCompanyDetails() {
  if (!form.apiKey) {
    notify('Please enter an API Key first', 'error');
    return;
  }

  loading.fetchingCompany = true;

  try {
    const response = await axios.post('/api/genie/fetch-company', {
      environment: form.environment,
      apiKey: form.apiKey,
      appId: form.appId,
    });

    if (response.data.success && response.data.data) {
      const data = response.data.data;
      
      localStorage.setItem(`genie_apiKey_${form.environment}`, form.apiKey);
      if (form.appId) localStorage.setItem(`genie_appId_${form.environment}`, form.appId);

      const staticQr = data.staticQrDetails || {};

      merchant.merchantName = staticQr.merchantName || data.tradingName || data.registeredName || 'Genie Merchant';
      merchant.merchantCity = staticQr.merchantCity || (data.tradingAddress && data.tradingAddress.town) || 'Colombo';
      merchant.merchantCountryCode = staticQr.merchantCountryCode || data.country || 'LK';
      merchant.merchantMccCode = staticQr.merchantMccCode || '5300';
      merchant.trxCurrencyCode = staticQr.trxCurrencyCode || '144';
      merchant.visaPan = staticQr.visaPan || '';
      merchant.mastercardPan = staticQr.mastercardPan || '';
      merchant.unionpayPan = staticQr.unionpayPan || '';
      merchant.merchantGuidAcquirerId = staticQr.merchantGuidAcquirerId || staticQr.merchantAcquiringBankId || '';
      merchant.synced = true;

      notify(`Loaded merchant "${merchant.merchantName}" from ${form.environment.toUpperCase()} API`, 'success');
    } else {
      notify(response.data.message || 'Failed to parse company details', 'error');
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Network error fetching company details';
    notify(msg, 'error');
  } finally {
    loading.fetchingCompany = false;
  }
}

// Load sample demo merchant
function loadSampleDemo() {
  merchant.merchantName = 'Genie Integrations';
  merchant.merchantCity = 'Colombo 03';
  merchant.merchantCountryCode = 'LK';
  merchant.merchantMccCode = '5300';
  merchant.trxCurrencyCode = '144';
  merchant.visaPan = '4325511220026799';
  merchant.mastercardPan = '2227132220026797';
  merchant.unionpayPan = '3950014400520446111111722002679';
  merchant.merchantGuidAcquirerId = '00281699500162022121311121661165';
  merchant.synced = true;
  transaction.amount = '1500.00';
  transaction.referenceLabel = 'INV-2026-8890';
  notify('Loaded sample merchant parameters', 'success');
}

// Copy EMVCo Payload
function copyPayload() {
  navigator.clipboard.writeText(qrPayload.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

// Download QR as PNG
function downloadQrImage() {
  const canvas = document.querySelector('#printableQrStandee canvas');
  if (!canvas) return;

  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `dynamic-qr-${(merchant.merchantName || 'merchant').replace(/\s+/g, '_')}-${transaction.referenceLabel || 'pay'}.png`;
  a.click();
}

// Print Standee
function printStandee() {
  window.print();
}

onMounted(() => {
  const savedKey = localStorage.getItem(`genie_apiKey_${form.environment}`);
  const savedAppId = localStorage.getItem(`genie_appId_${form.environment}`);
  if (savedKey) form.apiKey = savedKey;
  if (savedAppId) form.appId = savedAppId;
});
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #printableQrStandee, #printableQrStandee * {
    visibility: visible;
  }
  #printableQrStandee {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 320px;
    background: white !important;
    color: black !important;
    border: 1px solid #000000 !important;
  }
}
</style>
