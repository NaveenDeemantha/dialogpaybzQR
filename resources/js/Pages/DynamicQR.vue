<template>
  <div :class="isDark ? 'dark bg-zinc-950 text-zinc-100' : 'bg-zinc-100/80 text-zinc-900'" class="h-screen w-screen overflow-hidden flex flex-col font-sans antialiased selection:bg-zinc-200 selection:text-black">
    
    <!-- Top Navbar (56px) -->
    <header :class="isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'" class="h-14 border-b flex-shrink-0 flex items-center justify-between px-4 sm:px-6 backdrop-blur z-30">
      
      <!-- Brand & Merchant Title -->
      <div class="flex items-center gap-3">
        <div :class="isDark ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-zinc-900 text-white border-zinc-800'" class="h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm border">
          DP
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold tracking-tight truncate max-w-[180px] sm:max-w-xs">{{ merchant.merchantName || 'Genie Business Merchant' }}</span>
          <span class="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border"
            :class="form.environment === 'live' 
              ? (isDark ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
              : (isDark ? 'bg-amber-950/80 text-amber-400 border-amber-800' : 'bg-amber-50 text-amber-700 border-amber-200')">
            {{ form.environment.toUpperCase() }}
          </span>
          <span class="hidden md:inline text-xs text-zinc-400 font-mono">• {{ merchant.merchantCity || 'Colombo' }}, LK</span>
        </div>
      </div>

      <!-- Controls: Environment Switcher, API Config & Theme -->
      <div class="flex items-center gap-2">
        <!-- Environment Switcher -->
        <div :class="isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'" class="inline-flex p-0.5 rounded-lg border text-xs font-medium">
          <button 
            type="button" 
            @click="switchEnvironment('uat')"
            :class="form.environment === 'uat' 
              ? (isDark ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-900 shadow-sm border border-zinc-200') 
              : 'text-zinc-500 hover:text-zinc-900'"
            class="px-2.5 py-1 rounded-md text-[11px] font-mono transition">
            UAT Sandbox
          </button>
          <button 
            type="button" 
            @click="switchEnvironment('live')"
            :class="form.environment === 'live' 
              ? (isDark ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-900 shadow-sm border border-zinc-200') 
              : 'text-zinc-500 hover:text-zinc-900'"
            class="px-2.5 py-1 rounded-md text-[11px] font-mono transition">
            Live
          </button>
        </div>

        <!-- API Config Modal Trigger -->
        <button 
          type="button" 
          @click="showSettingsDrawer = true"
          :class="isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:text-zinc-900 shadow-sm'"
          class="h-8 px-2.5 rounded-lg border text-xs flex items-center gap-1.5 transition">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="text-xs">API Config</span>
        </button>

        <!-- Theme Switcher -->
        <button 
          type="button" 
          @click="toggleTheme" 
          :class="isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:text-zinc-900 shadow-sm'"
          class="h-8 w-8 rounded-lg border text-xs flex items-center justify-center transition"
          :title="isDark ? 'Switch to Light' : 'Switch to Dark'">
          <span v-if="isDark">☀️</span>
          <span v-else>🌙</span>
        </button>
      </div>

    </header>

    <!-- Main Workspace (3-Column Viewport Fit Grid) -->
    <main class="flex-1 p-4 sm:p-5 overflow-hidden max-w-[1600px] w-full mx-auto flex flex-col">
      
      <!-- Toast Notification (if active) -->
      <div v-if="notification.show" 
        :class="notification.type === 'error' 
          ? (isDark ? 'bg-red-950/80 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700') 
          : (isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-200' : 'bg-zinc-900 text-white')"
        class="mb-3 border rounded-xl px-4 py-2 text-xs flex items-center justify-between shadow-sm flex-shrink-0">
        <div class="flex items-center gap-2">
          <span>•</span>
          <span>{{ notification.message }}</span>
        </div>
        <button @click="notification.show = false" class="text-zinc-400 hover:text-white text-xs">✕</button>
      </div>

      <!-- 3-Column Zero-Scroll Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 flex-1 min-h-0 items-stretch">
        
        <!-- COLUMN 1: Cashier Payment Register (4 cols) -->
        <div :class="isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200/90 shadow-sm'" class="lg:col-span-4 border rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
          
          <!-- Amount Box -->
          <div>
            <div class="flex items-center justify-between pb-2 mb-2.5 border-b" :class="isDark ? 'border-zinc-800' : 'border-zinc-100'">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Cashier Register</span>
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] text-zinc-500 font-mono">Tag 01:</span>
                <button 
                  type="button" 
                  @click="transaction.poiMode = transaction.poiMode === '11' ? '12' : '11'"
                  :class="isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'"
                  class="px-2 py-0.5 rounded border text-[10px] font-mono hover:border-zinc-400 transition"
                  title="Toggle Tag 01 initiation mode">
                  {{ transaction.poiMode === '11' ? '11 (Universal)' : '12 (Dynamic)' }}
                </button>
              </div>
            </div>

            <div :class="isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'" class="border rounded-xl py-2.5 px-3 text-center">
              <div class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Total Charge</div>
              <div class="flex items-baseline justify-center gap-1.5 mt-0.5">
                <span class="text-sm font-mono font-medium text-zinc-400">Rs.</span>
                <input 
                  type="number" 
                  step="0.01" 
                  min="1"
                  v-model="transaction.amount" 
                  class="bg-transparent text-2xl sm:text-3xl font-bold font-mono text-center focus:outline-none w-36 max-w-full"
                  :class="isDark ? 'text-white' : 'text-zinc-900'"
                />
              </div>
            </div>

            <!-- Quick Add Amount Chips -->
            <div class="mt-2 flex items-center justify-between gap-1">
              <div class="flex flex-wrap items-center gap-1">
                <button 
                  v-for="amt in [10, 50, 100, 500, 1000]" 
                  :key="amt"
                  type="button" 
                  @click="addAmount(amt)"
                  :class="isDark 
                    ? 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-300' 
                    : 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-700 shadow-sm'"
                  class="px-2 py-1 rounded border text-[11px] font-mono font-medium transition active:scale-95">
                  +{{ amt }}
                </button>
              </div>
              <button 
                type="button" 
                @click="transaction.amount = '10.00'"
                :class="isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'"
                class="px-1 py-0.5 text-[11px] font-mono underline">
                Reset
              </button>
            </div>
          </div>

          <!-- Touch Keypad Grid -->
          <div class="my-2">
            <div class="grid grid-cols-3 gap-1.5">
              <button 
                v-for="key in ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '00']" 
                :key="key"
                type="button"
                @click="handleKeypad(key)"
                :class="key === 'C' 
                  ? (isDark ? 'bg-red-950/40 text-red-400 border-red-900/50 hover:bg-red-900/30' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100')
                  : (isDark ? 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-200' : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800 shadow-sm')"
                class="py-2.5 rounded-xl border font-mono font-semibold text-sm transition active:scale-95 flex items-center justify-center">
                {{ key }}
              </button>
            </div>
          </div>

          <!-- Invoice Reference Row -->
          <div class="pt-2 border-t" :class="isDark ? 'border-zinc-800' : 'border-zinc-100'">
            <div class="flex items-center justify-between mb-1">
              <label class="text-[11px] font-medium" :class="isDark ? 'text-zinc-400' : 'text-zinc-600'">Invoice Reference (Tag 62.05)</label>
              <button 
                type="button" 
                @click="generateRandomReference" 
                :class="isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'"
                class="text-[10px] font-mono underline">
                New Ref
              </button>
            </div>
            <input 
              type="text" 
              v-model="transaction.referenceLabel" 
              maxlength="25"
              placeholder="e.g. INV-10023"
              :class="isDark 
                ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-700 focus:border-zinc-600' 
                : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900'"
              class="w-full border rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-zinc-500 transition"
            />
          </div>

        </div>

        <!-- COLUMN 2: Customer Standee & Live QR Code (4 cols) -->
        <div :class="isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200/90 shadow-md'" class="lg:col-span-4 border rounded-2xl p-4 sm:p-5 flex flex-col justify-between items-center text-center overflow-hidden">
          
          <!-- Standee Header -->
          <div class="w-full pb-2 border-b flex justify-between items-center" :class="isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-100 text-zinc-500'">
            <div class="flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="text-[10px] font-mono uppercase tracking-widest font-semibold">Ready to Scan</span>
            </div>
            <span class="text-[10px] font-mono uppercase font-bold text-zinc-400">LANKAQR</span>
          </div>

          <!-- Merchant Title -->
          <div class="my-0.5">
            <h2 class="text-sm font-bold tracking-tight truncate max-w-[240px]" :class="isDark ? 'text-white' : 'text-zinc-900'">
              {{ merchant.merchantName || 'Genie Business Merchant' }}
            </h2>
            <p class="text-[11px] text-zinc-400">{{ merchant.merchantCity || 'Colombo' }}, Sri Lanka</p>
          </div>

          <!-- Dynamic QR Code Canvas -->
          <div id="printableQrStandee" class="bg-white p-3 rounded-2xl border-2 border-zinc-200 shadow-sm inline-block my-1">
            <qrcode-vue
              ref="qrCodeRef"
              :value="qrPayload"
              :size="190"
              :margin="2"
              level="M"
              render-as="canvas"
            />
          </div>

          <!-- Total Amount Highlight -->
          <div :class="isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'" class="w-full border rounded-xl py-2 px-3 my-0.5">
            <div class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Payable Amount</div>
            <div class="text-2xl font-black font-mono mt-0.5" :class="isDark ? 'text-white' : 'text-zinc-900'">
              {{ formattedDisplayAmount }}
            </div>
            <div v-if="transaction.referenceLabel" class="text-[10px] text-zinc-500 font-mono">
              Ref: <span class="font-semibold" :class="isDark ? 'text-zinc-300' : 'text-zinc-700'">{{ transaction.referenceLabel }}</span>
            </div>
          </div>

          <!-- Payment Rails Strip -->
          <div class="w-full text-[10px] font-mono text-zinc-400 flex items-center justify-center gap-2">
            <span>VISA</span>
            <span>•</span>
            <span>MASTERCARD</span>
            <span>•</span>
            <span>LANKAQR</span>
            <span>•</span>
            <span>UNIONPAY</span>
          </div>

          <!-- Standee Action Buttons -->
          <div class="w-full grid grid-cols-2 gap-2 pt-2 border-t" :class="isDark ? 'border-zinc-800' : 'border-zinc-100'">
            <button 
              type="button" 
              @click="downloadQrImage"
              :class="isDark 
                ? 'bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border-zinc-800' 
                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200 shadow-sm'"
              class="border text-[11px] font-medium py-2 rounded-lg transition flex items-center justify-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>

            <button 
              type="button" 
              @click="printStandee"
              :class="isDark 
                ? 'bg-white hover:bg-zinc-200 text-black' 
                : 'bg-zinc-900 hover:bg-black text-white shadow-sm'"
              class="text-[11px] font-medium py-2 rounded-lg transition flex items-center justify-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
          </div>

        </div>

        <!-- COLUMN 3: Real-Time EMVCo Payload & Tag Inspector (4 cols) -->
        <div :class="isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200/90 shadow-sm'" class="lg:col-span-4 border rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
          
          <!-- Inspector Header -->
          <div class="flex items-center justify-between pb-2 mb-2.5 border-b" :class="isDark ? 'border-zinc-800' : 'border-zinc-100'">
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">EMVCo Inspector</span>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded border" :class="isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'">
                {{ qrPayload.length }} chars
              </span>
            </div>
            <button 
              type="button" 
              @click="copyPayload" 
              :class="isDark ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'"
              class="text-[11px] font-mono underline flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>

          <!-- Raw String Box -->
          <div :class="isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-800'" class="border rounded-xl p-2.5 text-[11px] font-mono break-all select-all leading-relaxed max-h-24 overflow-y-auto mb-2.5">
            {{ qrPayload }}
          </div>

          <!-- Decoded TLV Tag Breakdown (Scrollable Tree) -->
          <div class="flex-1 min-h-0 flex flex-col">
            <div class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5 flex justify-between items-center">
              <span>Decoded TLV Tags ({{ decodedTags.length }})</span>
              <span class="text-zinc-500 font-mono">CRC: {{ qrData.crc }}</span>
            </div>
            <div class="space-y-1.5 overflow-y-auto flex-1 font-mono text-xs pr-1">
              <div 
                v-for="tag in decodedTags" 
                :key="tag.tag"
                :class="isDark ? 'bg-zinc-950 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200/90'"
                class="border rounded-lg p-2 text-[11px]">
                <div class="flex justify-between items-center mb-0.5">
                  <span class="font-semibold" :class="isDark ? 'text-zinc-200' : 'text-zinc-900'">
                    Tag {{ tag.tag }}: {{ tag.name }}
                  </span>
                  <span class="text-zinc-400 text-[10px]">Len: {{ tag.length }}</span>
                </div>
                <div class="break-all text-[11px]" :class="isDark ? 'text-zinc-400' : 'text-zinc-600'">{{ tag.value }}</div>

                <!-- Sub-tags (Tag 26 / Tag 62) -->
                <div v-if="tag.subTags && tag.subTags.length" :class="isDark ? 'border-zinc-800' : 'border-zinc-200'" class="mt-1 pl-2 border-l space-y-0.5">
                  <div v-for="sub in tag.subTags" :key="sub.tag" class="text-[10px] text-zinc-500">
                    <span class="text-zinc-400 font-medium">Sub-tag {{ sub.tag }}:</span>
                    <span class="ml-1" :class="isDark ? 'text-zinc-300' : 'text-zinc-700'">{{ sub.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Footer Details -->
          <div class="pt-2 border-t mt-2 flex items-center justify-between text-[10px] font-mono text-zinc-400" :class="isDark ? 'border-zinc-800' : 'border-zinc-100'">
            <span>ISO/IEC 13239 CRC-16</span>
            <span>Max 512 Bytes</span>
          </div>

        </div>

      </div>
    </main>

    <!-- Settings Modal Drawer -->
    <div v-if="showSettingsDrawer" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div :class="isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'" class="border rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        <div class="flex items-center justify-between pb-4 mb-4 border-b" :class="isDark ? 'border-zinc-800' : 'border-zinc-100'">
          <div>
            <h3 class="text-sm font-semibold">API Credentials & Merchant Configuration</h3>
            <p class="text-xs text-zinc-500 font-mono mt-0.5">{{ activeEndpointUrl }}/public/me</p>
          </div>
          <button @click="showSettingsDrawer = false" class="text-zinc-400 hover:text-zinc-600 text-lg">✕</button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-xs font-medium block mb-1">Authorization API Key</label>
            <input 
              type="password" 
              v-model="form.apiKey" 
              placeholder="Enter your Genie Business API key"
              :class="isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'"
              class="w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
            />
          </div>

          <div>
            <label class="text-xs font-medium block mb-1">App ID (Optional header: x-app-id)</label>
            <input 
              type="text" 
              v-model="form.appId" 
              placeholder="e.g. app_live_XXXXX"
              :class="isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'"
              class="w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
            />
          </div>

          <div class="pt-2 flex gap-2">
            <button 
              type="button" 
              @click="fetchCompanyDetails" 
              :disabled="loading.fetchingCompany || !form.apiKey"
              :class="isDark ? 'bg-white text-black' : 'bg-zinc-900 text-white'"
              class="flex-1 py-2 px-3 rounded-lg text-xs font-medium disabled:opacity-40 transition">
              {{ loading.fetchingCompany ? 'Connecting...' : 'Fetch Company Details' }}
            </button>
            <button 
              type="button" 
              @click="loadSampleDemo" 
              :class="isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-700'"
              class="py-2 px-3 rounded-lg text-xs font-medium transition">
              Load Doc Sample
            </button>
          </div>

          <!-- Merchant manual fields -->
          <div class="pt-4 border-t space-y-3" :class="isDark ? 'border-zinc-800' : 'border-zinc-100'">
            <div class="text-xs font-semibold text-zinc-400 uppercase">Merchant Overrides</div>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label class="text-[11px] text-zinc-500 block mb-1">Merchant Name (59)</label>
                <input v-model="merchant.merchantName" maxlength="25" :class="isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'" class="w-full border rounded px-2.5 py-1.5" />
              </div>
              <div>
                <label class="text-[11px] text-zinc-500 block mb-1">City (60)</label>
                <input v-model="merchant.merchantCity" maxlength="15" :class="isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'" class="w-full border rounded px-2.5 py-1.5" />
              </div>
              <div>
                <label class="text-[11px] text-zinc-500 block mb-1">Visa PAN (02/03)</label>
                <input v-model="merchant.visaPan" maxlength="16" :class="isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'" class="w-full border rounded px-2.5 py-1.5 font-mono" />
              </div>
              <div>
                <label class="text-[11px] text-zinc-500 block mb-1">Mastercard PAN (04/05)</label>
                <input v-model="merchant.mastercardPan" maxlength="16" :class="isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'" class="w-full border rounded px-2.5 py-1.5 font-mono" />
              </div>
              <div>
                <label class="text-[11px] text-zinc-500 block mb-1">UnionPay PAN (15/16)</label>
                <input v-model="merchant.unionpayPan" maxlength="31" :class="isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'" class="w-full border rounded px-2.5 py-1.5 font-mono" />
              </div>
              <div>
                <label class="text-[11px] text-zinc-500 block mb-1">Acquirer GUID (26)</label>
                <input v-model="merchant.merchantGuidAcquirerId" maxlength="32" :class="isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'" class="w-full border rounded px-2.5 py-1.5 font-mono" />
              </div>
            </div>
          </div>

          <div class="pt-4 border-t flex justify-end" :class="isDark ? 'border-zinc-800' : 'border-zinc-100'">
            <button 
              type="button" 
              @click="showSettingsDrawer = false" 
              :class="isDark ? 'bg-white text-black' : 'bg-zinc-900 text-white'"
              class="py-2 px-5 rounded-lg text-xs font-medium">
              Done
            </button>
          </div>

        </div>

      </div>
    </div>

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

// Theme state
const isDark = ref(false);

function toggleTheme() {
  isDark.value = !isDark.value;
  localStorage.setItem('dp_theme', isDark.value ? 'dark' : 'light');
}

// Modals
const showSettingsDrawer = ref(false);
const copied = ref(false);
const qrCodeRef = ref(null);

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

// Merchant details
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
  qrTerminalId: '',
});

// Transaction state: DEFAULT AMOUNT IS 10.00, DEFAULT POI IS '11'
const transaction = reactive({
  amount: '10.00',
  referenceLabel: 'INV-' + Math.floor(100000 + Math.random() * 900000),
  poiMode: '11',
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

// Keypad handler for rapid cashier interaction
function handleKeypad(key) {
  if (key === 'C') {
    transaction.amount = '';
    return;
  }
  const current = String(transaction.amount || '');
  if (current === '0' || current === '10.00' || current === '10') {
    transaction.amount = key;
  } else {
    transaction.amount = current + key;
  }
}

// Reactive QR Payload generation
const qrData = computed(() => {
  return generateEmvQrPayload({
    pointOfInitiationMethod: transaction.poiMode,
    amount: transaction.amount,
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
    qrTerminalId: merchant.qrTerminalId,
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
      merchant.qrTerminalId = staticQr.qrTerminalId || '';
      merchant.synced = true;

      showSettingsDrawer.value = false;
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
  merchant.qrTerminalId = '';
  merchant.synced = true;
  transaction.amount = '10.00';
  transaction.referenceLabel = 'INV-10023';
  showSettingsDrawer.value = false;
  notify('Loaded sample merchant parameters from official DialogPay specification', 'success');
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
  const savedTheme = localStorage.getItem('dp_theme');
  if (savedTheme) {
    isDark.value = savedTheme === 'dark';
  } else {
    isDark.value = false;
  }

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
