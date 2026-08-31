<template>
  <div :class="isDark ? 'dark bg-black text-zinc-100 selection:bg-zinc-800 selection:text-white' : 'bg-zinc-50 text-zinc-900 selection:bg-zinc-200 selection:text-black'" class="min-h-screen font-sans antialiased transition-colors duration-150">
    
    <!-- Top Navigation -->
    <header :class="isDark ? 'border-zinc-800/80 bg-zinc-950/80' : 'border-zinc-200/80 bg-white/80'" class="border-b backdrop-blur sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <!-- Brand / Title -->
        <div class="flex items-center gap-3">
          <div :class="isDark ? 'bg-white text-black' : 'bg-black text-white'" class="h-7 w-7 rounded font-mono font-bold flex items-center justify-center text-xs tracking-tighter shadow-sm">
            DP
          </div>
          <div class="flex items-center gap-2">
            <h1 :class="isDark ? 'text-white' : 'text-zinc-900'" class="text-sm font-semibold tracking-tight">DialogPay Business</h1>
            <span :class="isDark ? 'text-zinc-600' : 'text-zinc-400'" class="font-mono text-xs">/</span>
            <span :class="isDark ? 'text-zinc-400' : 'text-zinc-500'" class="text-xs font-mono">Dynamic QR Terminal</span>
          </div>
        </div>

        <!-- Controls: Environment Selector, Theme Toggle, Sample Loader -->
        <div class="flex items-center gap-2.5">
          
          <!-- Environment Tabs -->
          <div :class="isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'" class="inline-flex p-0.5 rounded-lg border text-xs font-medium">
            <button 
              type="button" 
              @click="switchEnvironment('uat')"
              :class="form.environment === 'uat' 
                ? (isDark ? 'bg-zinc-800 text-white shadow-sm' : 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60') 
                : (isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900')"
              class="px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500" v-if="form.environment === 'uat'"></span>
              UAT Sandbox
            </button>
            <button 
              type="button" 
              @click="switchEnvironment('live')"
              :class="form.environment === 'live' 
                ? (isDark ? 'bg-zinc-800 text-white shadow-sm' : 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60') 
                : (isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900')"
              class="px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" v-if="form.environment === 'live'"></span>
              Production Live
            </button>
          </div>

          <button 
            type="button" 
            @click="loadSampleDemo" 
            :class="isDark ? 'text-zinc-400 hover:text-white border-zinc-800 bg-zinc-900' : 'text-zinc-600 hover:text-zinc-900 border-zinc-200 bg-white hover:bg-zinc-50 shadow-sm'"
            class="text-xs border px-2.5 py-1 rounded-lg transition font-medium">
            Load Doc Sample
          </button>

          <!-- Light / Dark Toggle -->
          <button 
            type="button" 
            @click="toggleTheme" 
            :class="isDark ? 'text-zinc-400 hover:text-white border-zinc-800 bg-zinc-900' : 'text-zinc-600 hover:text-zinc-900 border-zinc-200 bg-white shadow-sm'"
            class="p-1.5 rounded-lg border text-xs transition"
            :title="isDark ? 'Switch to Light theme' : 'Switch to Dark theme'">
            <span v-if="isDark">☀️</span>
            <span v-else>🌙</span>
          </button>
        </div>

      </div>
    </header>

    <!-- Main Content Workspace -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Guidance / Scanner Compatibility Notice -->
      <div :class="form.environment === 'uat' 
        ? (isDark ? 'bg-amber-950/40 border-amber-900/50 text-amber-200' : 'bg-amber-50/80 border-amber-200 text-amber-900')
        : (isDark ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-200' : 'bg-emerald-50/80 border-emerald-200 text-emerald-900')"
        class="mb-6 border rounded-xl p-4 text-xs flex items-start gap-3 shadow-sm">
        <div class="mt-0.5 font-bold">ℹ️</div>
        <div>
          <div class="font-semibold mb-0.5">
            {{ form.environment === 'uat' ? 'UAT Sandbox Mode Active' : 'Production Live Mode Active' }}
          </div>
          <div class="opacity-90 leading-relaxed">
            <span v-if="form.environment === 'uat'">
              UAT test merchant PANs and test GUIDs are only recognized by <strong>Genie UAT / Stage test apps</strong> or general EMVCo QR analyzers. Commercial consumer banking apps on App Store / Play Store connect to the Live central switch and will report test sandbox IDs as invalid.
            </span>
            <span v-else>
              Production Live QRs connect to real merchant accounts and can be scanned directly with any Sri Lankan fintech or banking app (Genie, FriMi, Flash, Commercial Bank Q+, Sampath WePay, etc.).
            </span>
          </div>
        </div>
      </div>

      <!-- Toast Notification Bar -->
      <div v-if="notification.show" 
        :class="notification.type === 'error' 
          ? (isDark ? 'bg-zinc-900 border-red-900 text-red-300' : 'bg-red-50 border-red-200 text-red-700') 
          : (isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-200' : 'bg-zinc-100 border-zinc-300 text-zinc-800')"
        class="mb-6 border rounded-xl px-4 py-3 text-xs flex items-center justify-between font-mono shadow-sm">
        <div class="flex items-center gap-2">
          <span :class="notification.type === 'error' ? 'text-red-500' : (isDark ? 'text-zinc-400' : 'text-zinc-600')">•</span>
          <span>{{ notification.message }}</span>
        </div>
        <button @click="notification.show = false" :class="isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'" class="text-sm">✕</button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- LEFT COLUMN: Configurations & Input Form (7 cols) -->
        <div class="lg:col-span-7 space-y-6">
          
          <!-- Section 1: API Authentication -->
          <div :class="isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'" class="border rounded-2xl p-5 sm:p-6">
            <div :class="isDark ? 'border-zinc-800' : 'border-zinc-100'" class="flex items-center justify-between pb-4 mb-4 border-b">
              <div>
                <h2 :class="isDark ? 'text-zinc-300' : 'text-zinc-800'" class="text-xs font-semibold uppercase tracking-wider">1. API Authentication</h2>
                <p :class="isDark ? 'text-zinc-500' : 'text-zinc-400'" class="text-xs mt-0.5 font-mono">Target: {{ activeEndpointUrl }}/public/me</p>
              </div>
              <span v-if="merchant.synced" :class="isDark ? 'bg-zinc-900 text-emerald-400 border-zinc-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200'" class="text-[11px] font-mono px-2 py-0.5 rounded border">
                Connected
              </span>
            </div>

            <div class="space-y-4">
              <div>
                <div class="flex justify-between items-center mb-1.5">
                  <label :class="isDark ? 'text-zinc-300' : 'text-zinc-700'" class="text-xs font-medium">Authorization Key</label>
                  <button 
                    type="button" 
                    @click="showApiKey = !showApiKey" 
                    :class="isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'"
                    class="text-[11px] font-mono">
                    [{{ showApiKey ? 'Hide' : 'Reveal' }}]
                  </button>
                </div>
                <input 
                  :type="showApiKey ? 'text' : 'password'"
                  v-model="form.apiKey" 
                  placeholder="Paste your API key or token"
                  :class="isDark 
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:ring-zinc-600' 
                    : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-zinc-900'"
                  class="w-full border rounded-lg px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-1 transition"
                />
              </div>

              <div>
                <label :class="isDark ? 'text-zinc-300' : 'text-zinc-700'" class="block text-xs font-medium mb-1.5">
                  App ID <span :class="isDark ? 'text-zinc-600' : 'text-zinc-400'" class="font-normal">(Optional header: x-app-id)</span>
                </label>
                <input 
                  type="text" 
                  v-model="form.appId" 
                  placeholder="e.g. app_live_XXXXX or app_uat_XXXXX"
                  :class="isDark 
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:ring-zinc-600' 
                    : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-zinc-900'"
                  class="w-full border rounded-lg px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-1 transition"
                />
              </div>

              <div class="pt-2 flex items-center gap-3">
                <button 
                  type="button"
                  @click="fetchCompanyDetails"
                  :disabled="loading.fetchingCompany || !form.apiKey"
                  :class="isDark 
                    ? 'bg-white hover:bg-zinc-200 text-black' 
                    : 'bg-zinc-900 hover:bg-black text-white shadow-sm'"
                  class="flex-1 font-medium text-xs py-2 px-4 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
                  <span v-if="loading.fetchingCompany" class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  <span>{{ loading.fetchingCompany ? 'Connecting to API...' : 'Fetch Merchant Profile' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Section 2: Merchant Metadata -->
          <div :class="isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'" class="border rounded-2xl p-5 sm:p-6">
            <div :class="isDark ? 'border-zinc-800' : 'border-zinc-100'" class="flex items-center justify-between pb-4 mb-4 border-b">
              <div>
                <h2 :class="isDark ? 'text-zinc-300' : 'text-zinc-800'" class="text-xs font-semibold uppercase tracking-wider">2. Merchant Details</h2>
                <p :class="isDark ? 'text-zinc-500' : 'text-zinc-400'" class="text-xs mt-0.5">Parameters encoded into EMVCo tags (02, 04, 26, 52, 59, 60)</p>
              </div>
              <button 
                type="button" 
                @click="showAdvancedMerchant = !showAdvancedMerchant"
                :class="isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'"
                class="text-[11px] font-mono underline">
                {{ showAdvancedMerchant ? 'Collapse' : 'Manual Override' }}
              </button>
            </div>

            <!-- Profile Summary Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div :class="isDark ? 'bg-zinc-900/60 border-zinc-800/60' : 'bg-zinc-50 border-zinc-200/80'" class="border rounded-lg p-3">
                <span :class="isDark ? 'text-zinc-500' : 'text-zinc-400'" class="text-[10px] uppercase font-mono block">Merchant (Tag 59)</span>
                <span :class="isDark ? 'text-zinc-200' : 'text-zinc-800'" class="font-medium truncate block mt-0.5" :title="merchant.merchantName">{{ merchant.merchantName || '—' }}</span>
              </div>
              <div :class="isDark ? 'bg-zinc-900/60 border-zinc-800/60' : 'bg-zinc-50 border-zinc-200/80'" class="border rounded-lg p-3">
                <span :class="isDark ? 'text-zinc-500' : 'text-zinc-400'" class="text-[10px] uppercase font-mono block">City / Country (60, 58)</span>
                <span :class="isDark ? 'text-zinc-200' : 'text-zinc-800'" class="font-medium truncate block mt-0.5">{{ merchant.merchantCity || 'Colombo' }}, {{ merchant.merchantCountryCode || 'LK' }}</span>
              </div>
              <div :class="isDark ? 'bg-zinc-900/60 border-zinc-800/60' : 'bg-zinc-50 border-zinc-200/80'" class="border rounded-lg p-3">
                <span :class="isDark ? 'text-zinc-500' : 'text-zinc-400'" class="text-[10px] uppercase font-mono block">MCC (Tag 52)</span>
                <span :class="isDark ? 'text-zinc-200' : 'text-zinc-800'" class="font-mono block mt-0.5">{{ merchant.merchantMccCode || '5300' }}</span>
              </div>
            </div>

            <!-- Rails Checklist -->
            <div :class="isDark ? 'border-zinc-800/60' : 'border-zinc-100'" class="mt-4 pt-3 border-t flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span :class="isDark ? 'text-zinc-500' : 'text-zinc-400'">Configured Rails:</span>
              <span class="px-2 py-0.5 rounded border" :class="merchant.visaPan ? (isDark ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-zinc-100 text-zinc-800 border-zinc-300 font-medium') : (isDark ? 'text-zinc-600 border-zinc-800' : 'text-zinc-400 border-zinc-200')">
                Visa {{ merchant.visaPan ? '✓' : '—' }}
              </span>
              <span class="px-2 py-0.5 rounded border" :class="merchant.mastercardPan ? (isDark ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-zinc-100 text-zinc-800 border-zinc-300 font-medium') : (isDark ? 'text-zinc-600 border-zinc-800' : 'text-zinc-400 border-zinc-200')">
                Mastercard {{ merchant.mastercardPan ? '✓' : '—' }}
              </span>
              <span class="px-2 py-0.5 rounded border" :class="merchant.unionpayPan ? (isDark ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-zinc-100 text-zinc-800 border-zinc-300 font-medium') : (isDark ? 'text-zinc-600 border-zinc-800' : 'text-zinc-400 border-zinc-200')">
                UnionPay {{ merchant.unionpayPan ? '✓' : '—' }}
              </span>
              <span class="px-2 py-0.5 rounded border" :class="merchant.merchantGuidAcquirerId ? (isDark ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-zinc-100 text-zinc-800 border-zinc-300 font-medium') : (isDark ? 'text-zinc-600 border-zinc-800' : 'text-zinc-400 border-zinc-200')">
                LANKAQR {{ merchant.merchantGuidAcquirerId ? '✓' : '—' }}
              </span>
            </div>

            <!-- Manual Override Inputs -->
            <div v-if="showAdvancedMerchant" :class="isDark ? 'border-zinc-800' : 'border-zinc-200'" class="mt-4 pt-4 border-t space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label :class="isDark ? 'text-zinc-400' : 'text-zinc-600'" class="text-[11px] block mb-1">Tag 59: Merchant Name</label>
                  <input v-model="merchant.merchantName" maxlength="25" :class="isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-900'" class="w-full border rounded px-2.5 py-1.5" />
                </div>
                <div>
                  <label :class="isDark ? 'text-zinc-400' : 'text-zinc-600'" class="text-[11px] block mb-1">Tag 60: Merchant City</label>
                  <input v-model="merchant.merchantCity" maxlength="15" :class="isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-900'" class="w-full border rounded px-2.5 py-1.5" />
                </div>
                <div>
                  <label :class="isDark ? 'text-zinc-400' : 'text-zinc-600'" class="text-[11px] block mb-1">Tag 02/03: Visa PAN</label>
                  <input v-model="merchant.visaPan" maxlength="16" :class="isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-900'" class="w-full border rounded px-2.5 py-1.5 font-mono" />
                </div>
                <div>
                  <label :class="isDark ? 'text-zinc-400' : 'text-zinc-600'" class="text-[11px] block mb-1">Tag 04/05: Mastercard PAN</label>
                  <input v-model="merchant.mastercardPan" maxlength="16" :class="isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-900'" class="w-full border rounded px-2.5 py-1.5 font-mono" />
                </div>
                <div>
                  <label :class="isDark ? 'text-zinc-400' : 'text-zinc-600'" class="text-[11px] block mb-1">Tag 15/16: UnionPay PAN</label>
                  <input v-model="merchant.unionpayPan" maxlength="31" :class="isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-900'" class="w-full border rounded px-2.5 py-1.5 font-mono" />
                </div>
                <div>
                  <label :class="isDark ? 'text-zinc-400' : 'text-zinc-600'" class="text-[11px] block mb-1">Tag 26: Acquirer / Merchant GUID</label>
                  <input v-model="merchant.merchantGuidAcquirerId" maxlength="32" :class="isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-900'" class="w-full border rounded px-2.5 py-1.5 font-mono" />
                </div>
                <div>
                  <label :class="isDark ? 'text-zinc-400' : 'text-zinc-600'" class="text-[11px] block mb-1">Tag 62.07: Terminal ID</label>
                  <input v-model="merchant.qrTerminalId" maxlength="25" :class="isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-900'" class="w-full border rounded px-2.5 py-1.5 font-mono" />
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Dynamic Transaction Details -->
          <div :class="isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'" class="border rounded-2xl p-5 sm:p-6">
            <div :class="isDark ? 'border-zinc-800' : 'border-zinc-100'" class="pb-4 mb-4 border-b">
              <h2 :class="isDark ? 'text-zinc-300' : 'text-zinc-800'" class="text-xs font-semibold uppercase tracking-wider">3. Transaction Parameters</h2>
              <p :class="isDark ? 'text-zinc-500' : 'text-zinc-400'" class="text-xs mt-0.5">Amount (Tag 54) and Reference Label (Tag 62.05)</p>
            </div>

            <div class="space-y-4">
              <!-- Amount Entry -->
              <div>
                <label :class="isDark ? 'text-zinc-300' : 'text-zinc-700'" class="block text-xs font-medium mb-1.5">
                  Payment Amount (LKR)
                </label>
                <div class="relative">
                  <span :class="isDark ? 'text-zinc-500' : 'text-zinc-400'" class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none font-mono text-sm">
                    LKR
                  </span>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    v-model="transaction.amount" 
                    placeholder="0.00"
                    :class="isDark 
                      ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-700 focus:border-zinc-500 focus:ring-zinc-500' 
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-300 focus:border-zinc-900 focus:ring-zinc-900'"
                    class="w-full border rounded-lg pl-14 pr-4 py-2.5 text-xl font-mono font-semibold focus:outline-none focus:ring-1 transition"
                  />
                </div>

                <!-- Quick Presets -->
                <div class="flex items-center gap-1.5 mt-2 text-xs">
                  <span :class="isDark ? 'text-zinc-500' : 'text-zinc-400'" class="text-[11px] font-mono mr-1">Presets:</span>
                  <button 
                    v-for="amt in [100, 500, 1000, 2500, 5000]" 
                    :key="amt"
                    type="button" 
                    @click="addAmount(amt)"
                    :class="isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'"
                    class="px-2 py-0.5 rounded border text-[11px] font-mono transition">
                    +{{ amt }}
                  </button>
                  <button 
                    type="button" 
                    @click="transaction.amount = ''"
                    :class="isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-500 hover:text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-500 hover:text-zinc-800'"
                    class="px-2 py-0.5 rounded border text-[11px] font-mono ml-auto">
                    Clear
                  </button>
                </div>
              </div>

              <!-- Reference ID -->
              <div>
                <div class="flex justify-between items-center mb-1.5">
                  <label :class="isDark ? 'text-zinc-300' : 'text-zinc-700'" class="text-xs font-medium">Reference / Invoice ID (Tag 62.05)</label>
                  <button 
                    type="button" 
                    @click="generateRandomReference" 
                    :class="isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'"
                    class="text-[11px] font-mono underline">
                    Auto-Generate
                  </button>
                </div>
                <input 
                  type="text" 
                  v-model="transaction.referenceLabel" 
                  maxlength="25"
                  placeholder="e.g. INV-89201"
                  :class="isDark 
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-200 placeholder-zinc-700 focus:border-zinc-500 focus:ring-zinc-500' 
                    : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-zinc-900'"
                  class="w-full border rounded-lg px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-1 transition"
                />
              </div>

              <!-- QR Mode (Dynamic vs Static) -->
              <div :class="isDark ? 'border-zinc-800/60' : 'border-zinc-100'" class="flex items-center justify-between pt-3 border-t">
                <div>
                  <div :class="isDark ? 'text-zinc-200' : 'text-zinc-800'" class="text-xs font-medium">Point of Initiation</div>
                  <div :class="isDark ? 'text-zinc-500' : 'text-zinc-400'" class="text-[11px] font-mono">
                    {{ transaction.isDynamic ? 'Tag 01 = 12 (Dynamic QR with fixed amount)' : 'Tag 01 = 11 (Static QR, customer enters amount)' }}
                  </div>
                </div>
                <button 
                  type="button"
                  @click="transaction.isDynamic = !transaction.isDynamic"
                  :class="transaction.isDynamic 
                    ? (isDark ? 'bg-white text-black border-white' : 'bg-zinc-900 text-white border-zinc-900') 
                    : (isDark ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : 'bg-zinc-100 text-zinc-600 border-zinc-200')"
                  class="px-3 py-1 rounded text-xs font-medium border transition">
                  {{ transaction.isDynamic ? 'Dynamic (12)' : 'Static (11)' }}
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN: Professional POS Display & QR Code (5 cols) -->
        <div class="lg:col-span-5 space-y-6">
          
          <!-- Terminal / POS Standee Card -->
          <div id="printableQrStandee" :class="isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200 shadow-md'" class="border rounded-2xl p-6 flex flex-col items-center text-center">
            
            <!-- Terminal Header -->
            <div :class="isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-100 text-zinc-500'" class="w-full pb-3 mb-4 border-b flex justify-between items-center">
              <span class="text-[10px] font-mono uppercase tracking-widest font-semibold">EMVCo LANKAQR</span>
              <span class="text-[10px] font-mono uppercase">{{ form.environment }}</span>
            </div>

            <!-- Merchant Title -->
            <div class="mb-4">
              <div :class="isDark ? 'text-zinc-100' : 'text-zinc-900'" class="text-sm font-semibold tracking-tight">{{ merchant.merchantName || 'Genie Business Merchant' }}</div>
              <div :class="isDark ? 'text-zinc-500' : 'text-zinc-400'" class="text-xs">{{ merchant.merchantCity || 'Colombo' }}, LK</div>
            </div>

            <!-- High-Contrast Clean QR Code Box (with quiet zone padding) -->
            <div class="bg-white p-4 rounded-xl border border-zinc-300 shadow-sm inline-block">
              <qrcode-vue
                ref="qrCodeRef"
                :value="qrPayload"
                :size="240"
                :margin="2"
                level="M"
                render-as="canvas"
              />
            </div>

            <!-- Amount Display -->
            <div :class="isDark ? 'bg-zinc-900 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'" class="mt-4 w-full border rounded-xl p-3.5">
              <div :class="isDark ? 'text-zinc-500' : 'text-zinc-400'" class="text-[10px] font-mono uppercase">Amount Due</div>
              <div :class="isDark ? 'text-white' : 'text-zinc-900'" class="text-2xl font-bold font-mono mt-0.5">
                {{ formattedDisplayAmount }}
              </div>
              <div v-if="transaction.referenceLabel" :class="isDark ? 'text-zinc-400' : 'text-zinc-500'" class="text-xs font-mono mt-1">
                Ref: {{ transaction.referenceLabel }}
              </div>
            </div>

            <!-- Supported Rails Bar -->
            <div :class="isDark ? 'text-zinc-500' : 'text-zinc-400'" class="mt-3 w-full text-[10px] font-mono flex justify-center gap-3">
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
                :class="isDark 
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800' 
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'"
                class="border text-xs font-medium py-2 px-3 rounded-lg transition">
                Download PNG
              </button>

              <button 
                type="button" 
                @click="printStandee"
                :class="isDark 
                  ? 'bg-white hover:bg-zinc-200 text-black' 
                  : 'bg-zinc-900 hover:bg-black text-white shadow-sm'"
                class="text-xs font-medium py-2 px-3 rounded-lg transition">
                Print Standee
              </button>
            </div>
          </div>

          <!-- EMVCo Payload Inspector -->
          <div :class="isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'" class="border rounded-2xl p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span :class="isDark ? 'text-zinc-300' : 'text-zinc-800'" class="text-xs font-semibold uppercase tracking-wider">Payload String</span>
                <span :class="isDark ? 'text-zinc-500' : 'text-zinc-400'" class="text-[10px] font-mono">({{ qrPayload.length }} chars)</span>
              </div>
              <button 
                type="button" 
                @click="copyPayload" 
                :class="isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'"
                class="text-xs font-mono underline">
                {{ copied ? 'Copied' : 'Copy' }}
              </button>
            </div>

            <div :class="isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'" class="border rounded-lg p-3 text-[11px] font-mono break-all select-all leading-relaxed max-h-24 overflow-y-auto">
              {{ qrPayload }}
            </div>

            <!-- Tag Breakdown Toggle -->
            <div :class="isDark ? 'border-zinc-800/80' : 'border-zinc-100'" class="mt-3 pt-3 border-t">
              <button 
                type="button" 
                @click="showTagBreakdown = !showTagBreakdown"
                :class="isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-800'"
                class="w-full flex items-center justify-between text-xs font-mono">
                <span>Decoded Tag Structure ({{ decodedTags.length }} Tags)</span>
                <span>{{ showTagBreakdown ? '▲' : '▼' }}</span>
              </button>

              <div v-if="showTagBreakdown" class="mt-3 space-y-1.5 max-h-56 overflow-y-auto font-mono text-xs pr-1">
                <div 
                  v-for="tag in decodedTags" 
                  :key="tag.tag"
                  :class="isDark ? 'bg-zinc-900 border-zinc-800/60' : 'bg-zinc-50 border-zinc-200'"
                  class="border rounded p-2 text-[11px]">
                  <div :class="isDark ? 'text-zinc-400' : 'text-zinc-500'" class="flex justify-between mb-0.5">
                    <span :class="isDark ? 'text-white' : 'text-zinc-900'" class="font-semibold">Tag {{ tag.tag }}: {{ tag.name }}</span>
                    <span>Len: {{ tag.length }}</span>
                  </div>
                  <div :class="isDark ? 'text-zinc-300' : 'text-zinc-700'" class="break-all">{{ tag.value }}</div>

                  <!-- Sub tags -->
                  <div v-if="tag.subTags && tag.subTags.length" :class="isDark ? 'border-zinc-700' : 'border-zinc-300'" class="mt-1.5 pl-2 border-l space-y-1">
                    <div v-for="sub in tag.subTags" :key="sub.tag" :class="isDark ? 'text-zinc-400' : 'text-zinc-500'" class="text-[10px]">
                      <span>Sub-tag {{ sub.tag }} ({{ sub.name }}):</span>
                      <span :class="isDark ? 'text-zinc-200' : 'text-zinc-900'" class="ml-1">{{ sub.value }}</span>
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

// Theme state: default to Light theme
const isDark = ref(false);

function toggleTheme() {
  isDark.value = !isDark.value;
  localStorage.setItem('dp_theme', isDark.value ? 'dark' : 'light');
}

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
  qrTerminalId: '',
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
  if (isNaN(num) || num <= 0) return 'Variable Amount (Static)';
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

// Load sample demo merchant matching the DialogPay EMVCo spec page 6
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
  transaction.amount = '1500.00';
  transaction.referenceLabel = '00000000000';
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
