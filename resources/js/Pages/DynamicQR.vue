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

            <div :class="isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'" class="border rounded-xl py-2.5 px-4 text-center">
              <div class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Total Charge</div>
              <div class="flex items-center justify-center gap-2 mt-0.5 w-full">
                <span class="text-base font-mono font-semibold text-zinc-400 flex-shrink-0">Rs.</span>
                <input 
                  type="text" 
                  inputmode="decimal"
                  v-model="transaction.amount" 
                  placeholder="0.00"
                  class="bg-transparent text-2xl sm:text-3xl font-bold font-mono text-center focus:outline-none w-full border-none p-0 tracking-tight"
                  :class="isDark ? 'text-white placeholder-zinc-700' : 'text-zinc-900 placeholder-zinc-300'"
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
              placeholder="e.g. INV00764414 (11 chars)"
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
              <span class="h-2 w-2 rounded-full" :class="hasPaymentRails ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'"></span>
              <span class="text-[10px] font-mono uppercase tracking-widest font-semibold">
                {{ form.environment === 'live' ? 'LIVE PRODUCTION QR' : 'SANDBOX / UAT QR' }}
              </span>
            </div>
            <span class="text-[10px] font-mono uppercase font-bold text-zinc-400">LANKAQR</span>
          </div>

          <!-- Live Mode Sandbox Mock Warning Banner -->
          <div v-if="form.environment === 'live' && isUsingSandboxMockData" 
            class="w-full mt-1.5 p-2 rounded-lg text-left text-[11px] leading-tight border bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400">
            <div class="font-semibold flex items-center gap-1">
              <span>⚠️</span>
              <span>Live Mode using Sandbox Mock Data</span>
            </div>
            <p class="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
              Live banking apps will reject sandbox test IDs as "Invalid QR". Open <button type="button" @click="showSettingsDrawer = true" class="underline font-semibold text-amber-600 dark:text-amber-300">API Config</button> to fetch your live merchant details.
            </p>
          </div>

          <!-- Missing Payment Rails Alert -->
          <div v-if="!hasPaymentRails" 
            class="w-full mt-1.5 p-2 rounded-lg text-left text-[11px] leading-tight border bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400">
            <div class="font-semibold flex items-center gap-1">
              <span>🚨</span>
              <span>No Merchant Account / PAN Found</span>
            </div>
            <p class="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
              This QR code has no payment rail (Visa/Mastercard/GUID) and cannot be scanned. Configure your merchant details in API Config.
            </p>
          </div>

          <!-- Merchant Title -->
          <div class="my-0.5">
            <h2 class="text-sm font-bold tracking-tight truncate max-w-[240px]" :class="isDark ? 'text-white' : 'text-zinc-900'">
              {{ merchant.merchantName || 'Genie Business Merchant' }}
            </h2>
            <p class="text-[11px] text-zinc-400">{{ merchant.merchantCity || 'Colombo' }}, Sri Lanka</p>
          </div>

          <!-- Dynamic QR Code Canvas with ISO Quiet Zone -->
          <div id="printableQrStandee" class="bg-white p-5 rounded-2xl border-2 border-zinc-200 shadow-sm inline-block my-1">
            <qrcode-vue
              ref="qrCodeRef"
              :value="qrPayload"
              :size="240"
              :margin="4"
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
            <span :class="merchant.visaPan ? 'text-emerald-500 font-semibold' : 'text-zinc-400'">VISA</span>
            <span>•</span>
            <span :class="merchant.mastercardPan ? 'text-emerald-500 font-semibold' : 'text-zinc-400'">MASTERCARD</span>
            <span>•</span>
            <span :class="merchant.merchantGuidAcquirerId ? 'text-emerald-500 font-semibold' : 'text-zinc-400'">LANKAQR</span>
            <span>•</span>
            <span :class="merchant.unionpayPan ? 'text-emerald-500 font-semibold' : 'text-zinc-400'">UNIONPAY</span>
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
          <div class="flex items-center justify-between pb-2 mb-2 border-b" :class="isDark ? 'border-zinc-800' : 'border-zinc-100'">
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">EMVCo Tag Inspector</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full font-medium" :class="isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'">
                {{ decodedTags.length }} Tags • {{ qrPayload.length }} Chars
              </span>
            </div>
            <button 
              type="button" 
              @click="copyPayload" 
              :class="isDark ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'"
              class="text-[11px] font-mono underline flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {{ copied ? 'Copied All!' : 'Copy Full Payload' }}
            </button>
          </div>

          <!-- Raw String Box with Expand / Copy -->
          <div class="mb-2">
            <div class="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 flex justify-between">
              <span>Raw EMVCo Payload</span>
              <span class="font-semibold text-emerald-500">CRC-16: {{ qrData.crc }}</span>
            </div>
            <div :class="isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-800'" class="border rounded-xl p-2.5 text-[11px] font-mono break-all select-all leading-relaxed max-h-20 overflow-y-auto">
              {{ qrPayload }}
            </div>
          </div>

          <!-- Decoded TLV Tag Breakdown (Scrollable Detailed Cards) -->
          <div class="flex-1 min-h-0 flex flex-col">
            <div class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5 flex justify-between items-center">
              <span>TLV Breakdown (Tag • Length • Value)</span>
              <span class="text-zinc-500 text-[10px]">ISO/IEC 13239</span>
            </div>
            <div class="space-y-2 overflow-y-auto flex-1 font-mono text-xs pr-1">
              <div 
                v-for="tag in decodedTags" 
                :key="tag.tag"
                :class="isDark ? 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700' : 'bg-zinc-50/80 border-zinc-200 hover:border-zinc-300'"
                class="border rounded-xl p-2.5 transition">
                
                <!-- Tag Header -->
                <div class="flex items-start justify-between gap-2 mb-1.5">
                  <div class="flex items-center gap-2">
                    <span 
                      class="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wide"
                      :class="[
                        tag.tag === '00' || tag.tag === '01' ? (isDark ? 'bg-sky-950 text-sky-400 border border-sky-800' : 'bg-sky-50 text-sky-700 border border-sky-200') : '',
                        tag.tag === '02' || tag.tag === '03' || tag.tag === '04' || tag.tag === '05' || tag.tag === '15' || tag.tag === '16' ? (isDark ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-emerald-50 text-emerald-700 border border-emerald-200') : '',
                        tag.tag === '26' ? (isDark ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-amber-50 text-amber-700 border border-amber-200') : '',
                        tag.tag === '54' ? (isDark ? 'bg-violet-950 text-violet-400 border border-violet-800' : 'bg-violet-50 text-violet-700 border border-violet-200') : '',
                        tag.tag === '52' || tag.tag === '53' || tag.tag === '58' || tag.tag === '59' || tag.tag === '60' ? (isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-800') : '',
                        tag.tag === '62' ? (isDark ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-rose-50 text-rose-700 border border-rose-200') : '',
                        tag.tag === '63' ? (isDark ? 'bg-teal-950 text-teal-400 border border-teal-800' : 'bg-teal-50 text-teal-700 border border-teal-200') : '',
                      ]">
                      TAG {{ tag.tag }}
                    </span>
                    <span class="font-semibold text-xs truncate max-w-[170px]" :class="isDark ? 'text-zinc-100' : 'text-zinc-900'">
                      {{ tag.name }}
                    </span>
                  </div>
                  <span class="text-zinc-400 text-[10px] font-mono flex-shrink-0">
                    Len: <span class="font-bold" :class="isDark ? 'text-zinc-300' : 'text-zinc-700'">{{ tag.length }}</span>
                  </span>
                </div>

                <!-- Tag Value Box -->
                <div :class="isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-900 shadow-2xs'" class="border rounded-lg px-2.5 py-1.5 text-xs font-mono break-all select-all flex items-center justify-between gap-2">
                  <span class="leading-relaxed">{{ tag.value }}</span>
                </div>

                <!-- Sub-tags (Tag 26 LankaQR / Tag 62 Reference) -->
                <div v-if="tag.subTags && tag.subTags.length" class="mt-2 pl-2 border-l-2 space-y-1.5" :class="isDark ? 'border-zinc-800' : 'border-zinc-200'">
                  <div 
                    v-for="sub in tag.subTags" 
                    :key="sub.tag" 
                    :class="isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-white border-zinc-100'"
                    class="border rounded-md p-1.5 text-[11px]">
                    <div class="flex items-center justify-between mb-0.5 text-[10px]">
                      <span class="font-semibold" :class="isDark ? 'text-zinc-300' : 'text-zinc-700'">
                        Sub-tag {{ sub.tag }}: {{ sub.name }}
                      </span>
                      <span class="text-zinc-400">Len: {{ sub.length }}</span>
                    </div>
                    <div class="break-all font-mono text-[11px]" :class="isDark ? 'text-zinc-200' : 'text-zinc-900'">
                      {{ sub.value }}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- Bottom Footer Details -->
          <div class="pt-2 border-t mt-2 flex items-center justify-between text-[10px] font-mono text-zinc-400" :class="isDark ? 'border-zinc-800' : 'border-zinc-100'">
            <span>EMVCo / CBSL LANKAQR</span>
            <span>Max 512 Bytes</span>
          </div>

        </div>

      </div>
    </main>

    <!-- Bottom Footer Credits -->
    <footer class="h-8 border-t flex-shrink-0 flex items-center justify-center px-4 text-[11px] font-mono" :class="isDark ? 'bg-zinc-950 border-zinc-900 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-500'">
      <span>System developed by 
        <a 
          href="https://hoomansdigital.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          :class="isDark ? 'text-zinc-200 hover:text-white border-zinc-700 hover:border-white' : 'text-zinc-700 hover:text-black border-zinc-300 hover:border-black'"
          class="font-semibold border-b transition-colors pb-0.5 ml-1">
          hoomansdigital.com
        </a>
      </span>
    </footer>

    <!-- Settings Modal Drawer (Wide 2-Column Layout - No Scroll) -->
    <div v-if="showSettingsDrawer" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div :class="isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'" class="border rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-3 mb-4 border-b" :class="isDark ? 'border-zinc-800' : 'border-zinc-100'">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs" :class="isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-900'">
              ⚙️
            </div>
            <div>
              <h3 class="text-sm font-semibold">API Credentials & Merchant Configuration</h3>
              <p class="text-[11px] text-zinc-500 font-mono">Environment: {{ form.environment.toUpperCase() }} ({{ activeEndpointUrl }})</p>
            </div>
          </div>
          <button @click="showSettingsDrawer = false" class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">✕</button>
        </div>

        <!-- 2-Column Wide Body -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <!-- LEFT COLUMN: API Connect & Standee Importer -->
          <div class="space-y-3.5 flex flex-col justify-between">
            
            <!-- API Connect Box -->
            <div :class="isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50/80 border-zinc-200'" class="border rounded-xl p-3.5 space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold uppercase tracking-wider text-zinc-400">DialogPay API Connect</span>
                <span class="text-[10px] font-mono px-1.5 py-0.5 rounded border" :class="isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'">
                  GET /public/me
                </span>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="text-[11px] font-medium">Authorization API Key</label>
                  <span class="text-[10px] font-mono text-zinc-400">{{ form.apiKey ? form.apiKey.length + ' chars' : '' }}</span>
                </div>
                <textarea 
                  v-model="form.apiKey" 
                  rows="3"
                  placeholder="Paste your full Genie Business / DialogPay API key here..."
                  :class="isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-zinc-500' : 'bg-white border-zinc-200 text-zinc-900 focus:border-zinc-900'"
                  class="w-full border rounded-lg px-2.5 py-1.5 text-xs font-mono break-all leading-relaxed focus:outline-none transition resize-none"
                ></textarea>
              </div>

              <div>
                <label class="text-[11px] font-medium block mb-1">App ID (Header: x-app-id)</label>
                <input 
                  type="text" 
                  v-model="form.appId" 
                  placeholder="e.g. 4c6def30-f5a1-4043-8bc1-940c369fe796"
                  :class="isDark ? 'bg-zinc-900 border-zinc-700 text-white focus:border-zinc-500' : 'bg-white border-zinc-200 text-zinc-900 focus:border-zinc-900'"
                  class="w-full border rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none transition"
                />
              </div>

              <div class="flex gap-2 pt-1">
                <button 
                  type="button" 
                  @click="fetchCompanyDetails" 
                  :disabled="loading.fetchingCompany || !form.apiKey"
                  :class="isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'"
                  class="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium disabled:opacity-40 transition flex items-center justify-center gap-1.5">
                  <svg v-if="loading.fetchingCompany" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>{{ loading.fetchingCompany ? 'Connecting...' : 'Fetch Company Details' }}</span>
                </button>
                <button 
                  type="button" 
                  @click="loadSampleDemo" 
                  :class="isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'"
                  class="py-1.5 px-2.5 rounded-lg text-xs font-medium transition flex-shrink-0">
                  Sample
                </button>
              </div>
            </div>

            <!-- Import Standee QR Box -->
            <div :class="isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50/80 border-zinc-200'" class="border rounded-xl p-3.5 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Import Standee QR</span>
                <span class="text-[10px] text-zinc-500 font-mono">Standee / PDF</span>
              </div>

              <div class="flex gap-1.5">
                <input 
                  type="text" 
                  v-model="rawStaticQrInput" 
                  placeholder="Paste 000201... raw string" 
                  :class="isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'"
                  class="flex-1 border rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                />
                <button 
                  type="button" 
                  @click="importStaticQrString" 
                  :disabled="!rawStaticQrInput"
                  :class="isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-800 hover:bg-zinc-900 text-white'"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40 transition flex-shrink-0">
                  Import
                </button>
              </div>

              <div>
                <input 
                  type="file" 
                  ref="fileInputRef" 
                  accept="image/*" 
                  class="hidden" 
                  @change="handleFileUpload" 
                />
                <button 
                  type="button" 
                  @click="fileInputRef?.click()"
                  :disabled="scanningImage"
                  :class="isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-700'"
                  class="w-full py-1.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition">
                  <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{{ scanningImage ? 'Scanning Image...' : 'Upload & Decode Standee Photo / QR Image' }}</span>
                </button>
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN: Merchant Parameters & Payment Rails -->
          <div :class="isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50/80 border-zinc-200'" class="border rounded-xl p-3.5 flex flex-col justify-between space-y-2.5">
            <div class="flex items-center justify-between border-b pb-1.5" :class="isDark ? 'border-zinc-800' : 'border-zinc-200'">
              <span class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Merchant EMVCo Parameters</span>
              <span class="text-[10px] font-mono" :class="merchant.synced ? 'text-emerald-500 font-semibold' : 'text-zinc-500'">
                {{ merchant.synced ? '● Profile Active' : '○ Standee Mode' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label class="text-[10px] text-zinc-500 block mb-0.5">Merchant Name (Tag 59)</label>
                <input v-model="merchant.merchantName" maxlength="25" :class="isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'" class="w-full border rounded-lg px-2.5 py-1 text-xs" />
              </div>
              <div>
                <label class="text-[10px] text-zinc-500 block mb-0.5">City (Tag 60)</label>
                <input v-model="merchant.merchantCity" maxlength="15" :class="isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'" class="w-full border rounded-lg px-2.5 py-1 text-xs" />
              </div>
              <div>
                <label class="text-[10px] text-zinc-500 block mb-0.5">Currency (Tag 53)</label>
                <input v-model="merchant.trxCurrencyCode" maxlength="3" placeholder="144" :class="isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'" class="w-full border rounded-lg px-2.5 py-1 text-xs font-mono" />
              </div>
              <div>
                <label class="text-[10px] text-zinc-500 block mb-0.5">Country (Tag 58)</label>
                <input v-model="merchant.merchantCountryCode" maxlength="2" placeholder="LK" :class="isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'" class="w-full border rounded-lg px-2.5 py-1 text-xs font-mono uppercase" />
              </div>
              <div>
                <label class="text-[10px] text-zinc-500 block mb-0.5">MCC Code (Tag 52)</label>
                <input v-model="merchant.merchantMccCode" maxlength="4" placeholder="5300" :class="isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'" class="w-full border rounded-lg px-2.5 py-1 text-xs font-mono" />
              </div>
              <div>
                <label class="text-[10px] text-zinc-500 block mb-0.5">Acquirer GUID (Tag 26)</label>
                <input v-model="merchant.merchantGuidAcquirerId" maxlength="32" placeholder="002816995..." :class="isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'" class="w-full border rounded-lg px-2.5 py-1 text-xs font-mono" />
              </div>
              <div>
                <label class="text-[10px] text-zinc-500 block mb-0.5">Visa Active / Reserved (02/03)</label>
                <input v-model="merchant.visaPan" maxlength="16" placeholder="16-digit Visa PAN" :class="isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'" class="w-full border rounded-lg px-2.5 py-1 text-xs font-mono" />
              </div>
              <div>
                <label class="text-[10px] text-zinc-500 block mb-0.5">Mastercard Active / Reserved (04/05)</label>
                <input v-model="merchant.mastercardPan" maxlength="16" placeholder="16-digit MC PAN" :class="isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'" class="w-full border rounded-lg px-2.5 py-1 text-xs font-mono" />
              </div>
              <div>
                <label class="text-[10px] text-zinc-500 block mb-0.5">UnionPay Active / Reserved (15/16)</label>
                <input v-model="merchant.unionpayPan" maxlength="31" placeholder="Optional UnionPay" :class="isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'" class="w-full border rounded-lg px-2.5 py-1 text-xs font-mono" />
              </div>
              <div>
                <label class="text-[10px] text-zinc-500 block mb-0.5">Terminal ID (Tag 62.07)</label>
                <input v-model="merchant.qrTerminalId" maxlength="25" placeholder="Optional Terminal ID" :class="isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'" class="w-full border rounded-lg px-2.5 py-1 text-xs font-mono" />
              </div>
            </div>

            <!-- Footer Inside Right Column -->
            <div class="pt-2 border-t flex items-center justify-between" :class="isDark ? 'border-zinc-800' : 'border-zinc-200'">
              <span class="text-[10px] text-zinc-500">Auto-calculated ISO/IEC 13239 CRC-16</span>
              <button 
                type="button" 
                @click="closeAndSaveSettings" 
                :class="isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'"
                class="py-1.5 px-4 rounded-lg text-xs font-medium shadow-sm transition">
                Save & Done
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import QrcodeVue from 'qrcode.vue';
import axios from 'axios';
import { 
  generateEmvQrPayload, 
  parseStaticQrToMerchant, 
  findQrStringInObject, 
  decodeQrImageFile 
} from '@/Utils/emvQrGenerator';

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

// Modals & UI Refs
const showSettingsDrawer = ref(false);
const copied = ref(false);
const qrCodeRef = ref(null);
const fileInputRef = ref(null);
const scanningImage = ref(false);
const rawStaticQrInput = ref('');

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

// Detect whether current merchant is using the UAT sandbox mock sample
const isUsingSandboxMockData = computed(() => {
  return merchant.visaPan === '4325511220026799' || merchant.merchantGuidAcquirerId === '00281699500162022121311121661165';
});

// Check if at least one payment rail is present
const hasPaymentRails = computed(() => {
  return Boolean(
    (merchant.visaPan && merchant.visaPan.trim()) ||
    (merchant.mastercardPan && merchant.mastercardPan.trim()) ||
    (merchant.unionpayPan && merchant.unionpayPan.trim()) ||
    (merchant.merchantGuidAcquirerId && merchant.merchantGuidAcquirerId.trim())
  );
});

// Transaction state: DEFAULT AMOUNT IS 10.00, DEFAULT POI IS '11' (DialogPay standard)
const transaction = reactive({
  amount: '10.00',
  referenceLabel: 'INV' + String(Math.floor(10000000 + Math.random() * 90000000)),
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

// Helper to load merchant profile from storage or fallback
function loadMerchantForEnvironment(env) {
  const stored = localStorage.getItem(`genie_merchant_${env}`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      Object.assign(merchant, parsed);
      return true;
    } catch (e) {
      console.error('Failed to parse cached merchant profile', e);
    }
  }

  if (env === 'uat') {
    loadSampleDemo(false);
  } else {
    // Live defaults for Bean & Beyond CO
    merchant.merchantName = 'Bean & Beyond CO';
    merchant.merchantCity = 'Colombo 10';
    merchant.merchantCountryCode = 'LK';
    merchant.merchantMccCode = '5499';
    merchant.trxCurrencyCode = '144';
    merchant.visaPan = '4325511260706292';
    merchant.mastercardPan = '2227132260706290';
    merchant.unionpayPan = '3950014400520446111111726070629';
    merchant.merchantGuidAcquirerId = '1699500162026083004089770444';
    merchant.qrTerminalId = '0444';
    merchant.synced = true;
    transaction.poiMode = '11';
    transaction.amount = '10.00';
  }
  return false;
}

// Methods
function switchEnvironment(env) {
  form.environment = env;
  const savedKey = localStorage.getItem(`genie_apiKey_${env}`);
  const savedAppId = localStorage.getItem(`genie_appId_${env}`);
  if (savedKey) form.apiKey = savedKey;
  else form.apiKey = '';
  if (savedAppId) form.appId = savedAppId;
  else form.appId = '';

  const loaded = loadMerchantForEnvironment(env);

  if (env === 'live') {
    if (!loaded && !form.apiKey && !hasPaymentRails.value) {
      notify('Switched to LIVE mode. Please import your Standee QR or API Key to scan live.', 'error');
      showSettingsDrawer.value = true;
    } else {
      notify(`Switched to LIVE environment`, 'success');
    }
  } else {
    notify(`Switched to UAT Sandbox environment`, 'success');
  }
}

function addAmount(val) {
  const current = parseFloat(transaction.amount) || 0;
  transaction.amount = (current + val).toFixed(2);
}

function generateRandomReference() {
  transaction.referenceLabel = 'INV' + String(Math.floor(10000000 + Math.random() * 90000000));
}

function notify(msg, type = 'success') {
  notification.message = msg;
  notification.type = type;
  notification.show = true;
  setTimeout(() => {
    notification.show = false;
  }, 5000);
}

// Handle Standee QR photo / image file upload & decode
async function handleFileUpload(event) {
  const file = event.target?.files?.[0];
  if (!file) return;

  scanningImage.value = true;
  try {
    const decoded = await decodeQrImageFile(file);
    if (decoded) {
      rawStaticQrInput.value = decoded;
      importStaticQrString();
      notify('Successfully scanned and imported Standee QR!', 'success');
    }
  } catch (err) {
    notify(err.message || 'Could not detect QR code in image. Please ensure photo is clear or paste the text string.', 'error');
  } finally {
    scanningImage.value = false;
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
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

      // 1. First check if any EMVCo QR string (000201...) exists anywhere in response
      const rawString = findQrStringInObject(data);

      if (rawString) {
        const parsed = parseStaticQrToMerchant(rawString);
        if (parsed) {
          Object.assign(merchant, parsed);
        }
      } else {
        const staticQr = data.staticQrDetails || data.qrDetails || data.staticQRDetails || data.merchantQrDetails || data.qr || data.data || {};

        merchant.merchantName = staticQr.merchantName || data.tradingName || data.registeredName || data.businessName || data.name || merchant.merchantName || 'Genie Merchant';
        merchant.merchantCity = staticQr.merchantCity || (data.tradingAddress && (data.tradingAddress.town || data.tradingAddress.city)) || (data.registeredAddress && data.registeredAddress.town) || merchant.merchantCity || 'Colombo';
        merchant.merchantCountryCode = staticQr.merchantCountryCode || data.countryCode || data.country || 'LK';
        merchant.merchantMccCode = staticQr.merchantMccCode || data.mcc || data.mccCode || '5300';
        merchant.trxCurrencyCode = staticQr.trxCurrencyCode || data.currency || '144';
        merchant.visaPan = staticQr.visaPan || staticQr.visa_pan || data.visaPan || data.visa_pan || merchant.visaPan || '';
        merchant.visaReserved = staticQr.visaReserved || staticQr.visa_reserved || data.visaReserved || '';
        merchant.mastercardPan = staticQr.mastercardPan || staticQr.mastercard_pan || data.mastercardPan || data.mastercard_pan || merchant.mastercardPan || '';
        merchant.mastercardReserved = staticQr.mastercardReserved || staticQr.mastercard_reserved || data.mastercardReserved || '';
        merchant.unionpayPan = staticQr.unionpayPan || staticQr.unionpay_pan || data.unionpayPan || data.unionpay_pan || merchant.unionpayPan || '';
        if (staticQr.qrMerchantId) {
          const bankId = String(staticQr.merchantAcquiringBankId || '6995').padStart(4, '0').slice(-3);
          const subAcq = String(staticQr.merchantSubAcquirerId || '001').padStart(3, '0');
          const qMid = String(staticQr.qrMerchantId);
          const qTid = String(staticQr.qrTerminalId || '0000').padStart(4, '0');
          merchant.merchantGuidAcquirerId = `16${bankId}${subAcq}${qMid}${qTid}`.slice(0, 28);
        } else {
          merchant.merchantGuidAcquirerId = staticQr.merchantGuidAcquirerId || staticQr.merchantAcquiringBankId || data.merchantGuidAcquirerId || data.merchantAcquiringBankId || data.guid || data.merchantGuid || merchant.merchantGuidAcquirerId || '';
        }
        merchant.qrTerminalId = staticQr.qrTerminalId || staticQr.terminalId || data.terminalId || data.tid || merchant.qrTerminalId || '';
      }
      merchant.synced = true;

      // Save profile for this environment
      localStorage.setItem(`genie_merchant_${form.environment}`, JSON.stringify(merchant));

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

// Save settings and close modal
function closeAndSaveSettings() {
  localStorage.setItem(`genie_merchant_${form.environment}`, JSON.stringify(merchant));
  if (form.apiKey) localStorage.setItem(`genie_apiKey_${form.environment}`, form.apiKey);
  if (form.appId) localStorage.setItem(`genie_appId_${form.environment}`, form.appId);
  showSettingsDrawer.value = false;
  notify('Saved configuration settings', 'success');
}

// Import merchant parameters from raw static QR string
function importStaticQrString() {
  if (!rawStaticQrInput.value) return;

  const parsed = parseStaticQrToMerchant(rawStaticQrInput.value);
  if (!parsed) {
    notify('Invalid EMVCo QR string. Must start with 000201...', 'error');
    return;
  }

  merchant.merchantName = parsed.merchantName || merchant.merchantName || 'Genie Merchant';
  merchant.merchantCity = parsed.merchantCity || merchant.merchantCity || 'Colombo';
  merchant.merchantCountryCode = parsed.merchantCountryCode || 'LK';
  merchant.merchantMccCode = parsed.merchantMccCode || '5300';
  merchant.trxCurrencyCode = parsed.trxCurrencyCode || '144';
  merchant.visaPan = parsed.visaPan || '';
  merchant.visaReserved = parsed.visaReserved || '';
  merchant.mastercardPan = parsed.mastercardPan || '';
  merchant.mastercardReserved = parsed.mastercardReserved || '';
  merchant.unionpayPan = parsed.unionpayPan || '';
  merchant.unionpayReserved = parsed.unionpayReserved || '';
  merchant.merchantGuidAcquirerId = parsed.merchantGuidAcquirerId || '';
  merchant.qrTerminalId = parsed.qrTerminalId || '';
  merchant.synced = true;

  // Persist for current environment
  localStorage.setItem(`genie_merchant_${form.environment}`, JSON.stringify(merchant));
  
  rawStaticQrInput.value = '';
  showSettingsDrawer.value = false;
  notify(`Successfully imported merchant parameters for "${merchant.merchantName}"!`, 'success');
}

// Load sample demo merchant
function loadSampleDemo(showToast = true) {
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
  transaction.referenceLabel = 'INV' + String(Math.floor(10000000 + Math.random() * 90000000));
  transaction.poiMode = '11';
  
  localStorage.setItem('genie_merchant_uat', JSON.stringify(merchant));
  
  if (showToast) {
    showSettingsDrawer.value = false;
    notify('Loaded sample merchant parameters from official DialogPay specification', 'success');
  }
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

  loadMerchantForEnvironment(form.environment);

  // If live mode has legacy short GUID, upgrade to verified 28-char LankaQR GUID
  if (form.environment === 'live' && (!merchant.merchantGuidAcquirerId || merchant.merchantGuidAcquirerId.length < 20)) {
    merchant.merchantName = 'Bean & Beyond CO';
    merchant.merchantGuidAcquirerId = '1699500162026083004089770444';
    merchant.visaPan = '4325511260706292';
    merchant.mastercardPan = '2227132260706290';
    merchant.unionpayPan = '3950014400520446111111726070629';
    merchant.merchantMccCode = '5499';
    merchant.qrTerminalId = '0444';
    merchant.merchantCity = 'Colombo 10';
    merchant.synced = true;
    localStorage.setItem('genie_merchant_live', JSON.stringify(merchant));
  }
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
