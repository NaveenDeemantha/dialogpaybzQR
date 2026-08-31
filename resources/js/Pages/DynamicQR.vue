<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-rose-500 selection:text-white pb-16">
    <!-- Header Navbar -->
    <header class="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-lg shadow-rose-500/20">
            <div class="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400 text-xl tracking-tighter">
              gB
            </div>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Genie Business
              </span>
              <span class="text-xs px-2 py-0.5 rounded-full font-semibold border"
                :class="form.environment === 'live' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'">
                {{ form.environment.toUpperCase() }}
              </span>
            </div>
            <p class="text-xs text-slate-400 font-medium">DialogPay Dynamic EMVCo QR Generator</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Environment Quick Switch -->
          <div class="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-inner">
            <button 
              type="button" 
              @click="switchEnvironment('uat')"
              :class="form.environment === 'uat' 
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30' 
                : 'text-slate-400 hover:text-slate-200'"
              class="px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse" v-if="form.environment === 'uat'"></span>
              UAT Sandbox
            </button>
            <button 
              type="button" 
              @click="switchEnvironment('live')"
              :class="form.environment === 'live' 
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30' 
                : 'text-slate-400 hover:text-slate-200'"
              class="px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400" v-if="form.environment === 'live'"></span>
              Production Live
            </button>
          </div>

          <button 
            @click="loadSampleDemo" 
            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Load Sample Data
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      
      <!-- Top Alert Notification (if any) -->
      <div v-if="notification.show" 
        :class="notification.type === 'error' 
          ? 'bg-rose-950/60 border-rose-800 text-rose-200' 
          : 'bg-emerald-950/60 border-emerald-800 text-emerald-200'" 
        class="mb-6 border rounded-2xl p-4 flex items-center justify-between backdrop-blur-md transition-all shadow-lg animate-fadeIn">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-xl" :class="notification.type === 'error' ? 'bg-rose-500/20' : 'bg-emerald-500/20'">
            <svg v-if="notification.type === 'error'" class="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span class="text-sm font-medium">{{ notification.message }}</span>
        </div>
        <button @click="notification.show = false" class="text-slate-400 hover:text-white text-sm">✕</button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- LEFT COLUMN: Settings, API, and Payment Input (7 cols) -->
        <div class="lg:col-span-7 space-y-6">
          
          <!-- Card 1: API Configuration & Merchant Sync -->
          <div class="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
            <div class="flex items-center justify-between mb-5">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-base font-semibold text-white">Genie Business API Credentials</h2>
                  <p class="text-xs text-slate-400">Endpoint: <code class="text-indigo-400 bg-slate-950 px-1.5 py-0.5 rounded">{{ activeEndpointUrl }}</code></p>
                </div>
              </div>

              <span v-if="merchant.synced" class="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Synced
              </span>
            </div>

            <div class="space-y-4">
              <!-- API Key Input -->
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1.5">
                  Authorization API Key <span class="text-rose-400">*</span>
                </label>
                <div class="relative">
                  <input 
                    :type="showApiKey ? 'text' : 'password'"
                    v-model="form.apiKey" 
                    placeholder="Enter Bearer / API Authorization Key"
                    class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 transition font-mono pr-10"
                  />
                  <button 
                    type="button" 
                    @click="showApiKey = !showApiKey" 
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs">
                    {{ showApiKey ? 'Hide' : 'Show' }}
                  </button>
                </div>
              </div>

              <!-- App ID (Optional) -->
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1.5">
                  App ID <span class="text-slate-500 text-[11px]">(Optional for Sandbox / Header)</span>
                </label>
                <input 
                  type="text" 
                  v-model="form.appId" 
                  placeholder="e.g. app_live_XXXXX or app_uat_XXXXX"
                  class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 transition font-mono"
                />
              </div>

              <!-- Fetch Button -->
              <div class="pt-2 flex flex-wrap gap-3">
                <button 
                  type="button"
                  @click="fetchCompanyDetails"
                  :disabled="loading.fetchingCompany || !form.apiKey"
                  class="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]">
                  <svg v-if="loading.fetchingCompany" class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {{ loading.fetchingCompany ? 'Fetching /public/me...' : 'Fetch Company Details' }}
                </button>

                <button 
                  type="button"
                  @click="loadSampleDemo"
                  class="px-4 py-2.5 rounded-xl font-medium text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all">
                  Use Sample Merchant
                </button>
              </div>
            </div>
          </div>

          <!-- Card 2: Merchant Information & Static QR Mapping -->
          <div class="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-base font-semibold text-white">Merchant & Payment Configuration</h2>
                  <p class="text-xs text-slate-400">EMVCo tags populated from API response or custom override</p>
                </div>
              </div>

              <button 
                @click="showAdvancedMerchant = !showAdvancedMerchant"
                class="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium">
                {{ showAdvancedMerchant ? 'Collapse Details' : 'Edit Tags' }}
              </button>
            </div>

            <!-- Merchant Quick Summary Badges -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
                <div class="text-[11px] text-slate-400 font-medium">Merchant Name</div>
                <div class="text-sm font-semibold text-slate-100 truncate" :title="merchant.merchantName">
                  {{ merchant.merchantName || '—' }}
                </div>
              </div>
              <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
                <div class="text-[11px] text-slate-400 font-medium">City / Country</div>
                <div class="text-sm font-semibold text-slate-100 truncate">
                  {{ merchant.merchantCity || 'Colombo' }}, {{ merchant.merchantCountryCode || 'LK' }}
                </div>
              </div>
              <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
                <div class="text-[11px] text-slate-400 font-medium">MCC Code</div>
                <div class="text-sm font-semibold text-slate-100 font-mono">
                  {{ merchant.merchantMccCode || '5300' }}
                </div>
              </div>
              <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
                <div class="text-[11px] text-slate-400 font-medium">Currency Code</div>
                <div class="text-sm font-semibold text-slate-100 font-mono">
                  144 (LKR)
                </div>
              </div>
            </div>

            <!-- Payment Schemes Active Indicators -->
            <div class="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60 text-xs">
              <span class="text-slate-400 text-xs mr-1 font-medium">Active Rails:</span>
              <span class="px-2 py-0.5 rounded-lg border text-xs font-semibold"
                :class="merchant.visaPan ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'bg-slate-800/40 text-slate-600 border-slate-800'">
                Visa {{ merchant.visaPan ? '✓' : '✗' }}
              </span>
              <span class="px-2 py-0.5 rounded-lg border text-xs font-semibold"
                :class="merchant.mastercardPan ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-800/40 text-slate-600 border-slate-800'">
                Mastercard {{ merchant.mastercardPan ? '✓' : '✗' }}
              </span>
              <span class="px-2 py-0.5 rounded-lg border text-xs font-semibold"
                :class="merchant.unionpayPan ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' : 'bg-slate-800/40 text-slate-600 border-slate-800'">
                UnionPay {{ merchant.unionpayPan ? '✓' : '✗' }}
              </span>
              <span class="px-2 py-0.5 rounded-lg border text-xs font-semibold"
                :class="merchant.merchantGuidAcquirerId ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-slate-800/40 text-slate-600 border-slate-800'">
                LANKAQR {{ merchant.merchantGuidAcquirerId ? '✓' : '✗' }}
              </span>
            </div>

            <!-- Advanced / Editable Merchant Fields (Collapsible) -->
            <div v-if="showAdvancedMerchant" class="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-fadeIn">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-medium text-slate-400 mb-1">Tag 59 - Merchant Name</label>
                  <input v-model="merchant.merchantName" maxlength="25" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200" />
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-slate-400 mb-1">Tag 60 - Merchant City</label>
                  <input v-model="merchant.merchantCity" maxlength="15" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200" />
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-slate-400 mb-1">Tag 02/03 - Visa PAN (16 digits)</label>
                  <input v-model="merchant.visaPan" maxlength="16" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono" />
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-slate-400 mb-1">Tag 04/05 - Mastercard PAN (16 digits)</label>
                  <input v-model="merchant.mastercardPan" maxlength="16" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono" />
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-slate-400 mb-1">Tag 15/16 - UnionPay PAN</label>
                  <input v-model="merchant.unionpayPan" maxlength="31" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono" />
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-slate-400 mb-1">Tag 26 - Acquirer / Merchant GUID</label>
                  <input v-model="merchant.merchantGuidAcquirerId" maxlength="32" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono" />
                </div>
              </div>
            </div>
          </div>

          <!-- Card 3: Dynamic Transaction Amount & Reference Details -->
          <div class="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 class="text-base font-semibold text-white">Dynamic Payment Details</h2>
                <p class="text-xs text-slate-400">Enter transaction amount & reference to generate dynamic QR</p>
              </div>
            </div>

            <div class="space-y-5">
              <!-- Amount Input -->
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-2">
                  Transaction Amount (LKR) <span class="text-rose-400">* (Tag 54)</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-lg">
                    Rs.
                  </div>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="1"
                    v-model="transaction.amount" 
                    placeholder="0.00"
                    class="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 rounded-2xl pl-14 pr-4 py-3.5 text-2xl font-bold text-white placeholder-slate-700 transition"
                  />
                  <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-semibold text-slate-500">
                    LKR
                  </div>
                </div>

                <!-- Quick Amount Presets -->
                <div class="flex flex-wrap gap-2 mt-2.5">
                  <span class="text-xs text-slate-500 self-center mr-1">Quick Add:</span>
                  <button 
                    v-for="preset in [100, 250, 500, 1000, 2500, 5000]" 
                    :key="preset"
                    type="button" 
                    @click="addAmount(preset)"
                    class="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition active:scale-95">
                    +{{ preset.toLocaleString() }}
                  </button>
                  <button 
                    type="button" 
                    @click="transaction.amount = ''"
                    class="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition">
                    Clear
                  </button>
                </div>
              </div>

              <!-- Reference Label / Invoice ID (Tag 62.05) -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="text-xs font-medium text-slate-300">
                    Reference / Invoice / Bill ID <span class="text-slate-500 text-[11px]">(Tag 62.05 - Max 25 chars)</span>
                  </label>
                  <button 
                    type="button" 
                    @click="generateRandomReference" 
                    class="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                    + Auto Generate
                  </button>
                </div>
                <input 
                  type="text" 
                  v-model="transaction.referenceLabel" 
                  maxlength="25"
                  placeholder="e.g. INV-2026-8890"
                  class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 font-mono transition"
                />
              </div>

              <!-- Point of Initiation Toggle (Dynamic vs Static) -->
              <div class="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div>
                  <div class="text-xs font-semibold text-slate-200">QR Code Mode</div>
                  <div class="text-[11px] text-slate-400">
                    {{ transaction.isDynamic ? 'Dynamic QR (Specific amount pre-filled, Tag 01 = 12)' : 'Static QR (Customer types amount, Tag 01 = 11)' }}
                  </div>
                </div>
                <button 
                  type="button"
                  @click="transaction.isDynamic = !transaction.isDynamic"
                  :class="transaction.isDynamic ? 'bg-rose-600' : 'bg-slate-700'"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
                  <span 
                    :class="transaction.isDynamic ? 'translate-x-5' : 'translate-x-0'"
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN: QR Display, Standee, Actions, & EMVCo Inspector (5 cols) -->
        <div class="lg:col-span-5 space-y-6">
          
          <!-- Card: Interactive POS Standee / QR Card -->
          <div id="printableQrStandee" class="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col items-center text-center">
            
            <!-- Top Banner Header -->
            <div class="w-full flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-bold text-white text-xs">
                  gB
                </div>
                <span class="font-bold text-sm tracking-tight text-white">genie <span class="text-rose-400 font-normal">Business</span></span>
              </div>
              <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30">
                DialogPay
              </span>
            </div>

            <!-- Merchant Name & City -->
            <div class="mb-4">
              <h3 class="text-base font-bold text-slate-100 tracking-tight">{{ merchant.merchantName || 'DialogPay Merchant' }}</h3>
              <p class="text-xs text-slate-400">{{ merchant.merchantCity || 'Colombo' }}, Sri Lanka</p>
            </div>

            <!-- QR Code Canvas / Box -->
            <div class="p-4 bg-white rounded-3xl shadow-2xl border-4 border-slate-100/90 relative inline-block transition-transform hover:scale-[1.02]">
              <qrcode-vue
                ref="qrCodeRef"
                :value="qrPayload"
                :size="220"
                level="M"
                render-as="canvas"
                class="rounded-xl"
              />
              
              <!-- Center Logo Indicator (DialogPay/Genie Center Badge) -->
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="w-10 h-10 bg-white rounded-xl shadow-md border-2 border-slate-200 flex items-center justify-center font-black text-[10px] bg-gradient-to-tr from-rose-500 to-amber-500 bg-clip-text text-transparent">
                  gB
                </div>
              </div>
            </div>

            <!-- Amount Highlight Banner -->
            <div class="mt-5 w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
              <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Payable Amount</div>
              <div class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-rose-500 font-mono tracking-tight mt-0.5">
                {{ formattedDisplayAmount }}
              </div>
              <div v-if="transaction.referenceLabel" class="text-xs text-slate-400 mt-1 font-mono">
                Ref: <span class="text-indigo-300 font-semibold">{{ transaction.referenceLabel }}</span>
              </div>
            </div>

            <!-- Payment Rails Logos Banner -->
            <div class="mt-4 w-full pt-3 border-t border-slate-800/80 flex items-center justify-center gap-4 text-xs font-semibold text-slate-400">
              <span class="text-sky-400">VISA</span>
              <span class="text-amber-400">Mastercard</span>
              <span class="text-rose-400">LANKAQR</span>
              <span class="text-teal-400">UnionPay</span>
            </div>

            <p class="text-[11px] text-slate-500 mt-2">Scan with Genie, FriMi, Flash, or any LANKAQR Banking App</p>

            <!-- Action Buttons Toolbar -->
            <div class="w-full grid grid-cols-2 gap-2 mt-5">
              <button 
                type="button" 
                @click="downloadQrImage"
                class="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow transition active:scale-95">
                <svg class="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PNG
              </button>

              <button 
                type="button" 
                @click="printStandee"
                class="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs text-white bg-rose-600 hover:bg-rose-500 border border-rose-500 shadow-lg shadow-rose-600/20 transition active:scale-95">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Standee
              </button>
            </div>
          </div>

          <!-- Card: EMVCo Payload Inspector -->
          <div class="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-semibold text-white">EMVCo String & CRC Inspector</h3>
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {{ qrPayload.length }} chars
                </span>
              </div>
              <button 
                type="button" 
                @click="copyPayload" 
                class="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                {{ copied ? 'Copied!' : 'Copy String' }}
              </button>
            </div>

            <!-- Raw String Box -->
            <div class="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 text-xs font-mono text-emerald-400 break-all select-all leading-relaxed max-h-32 overflow-y-auto">
              {{ qrPayload }}
            </div>

            <!-- Decoded Tag Breakdown Accordion -->
            <div class="mt-4">
              <button 
                type="button" 
                @click="showTagBreakdown = !showTagBreakdown"
                class="w-full flex items-center justify-between text-xs font-medium text-slate-300 py-1 hover:text-white">
                <span>View Decoded TLV Tag Structure ({{ decodedTags.length }} Tags)</span>
                <span>{{ showTagBreakdown ? '▲' : '▼' }}</span>
              </button>

              <div v-if="showTagBreakdown" class="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1 animate-fadeIn">
                <div 
                  v-for="tag in decodedTags" 
                  :key="tag.tag"
                  class="bg-slate-950/70 border border-slate-800/60 rounded-xl p-2.5 text-xs">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-bold text-amber-400 font-mono">Tag {{ tag.tag }}: {{ tag.name }}</span>
                    <span class="text-[10px] text-slate-500 font-mono">Len: {{ tag.length }}</span>
                  </div>
                  <div class="font-mono text-slate-200 break-all bg-slate-900 px-2 py-1 rounded">
                    {{ tag.value }}
                  </div>

                  <!-- Sub tags for Tag 62 -->
                  <div v-if="tag.subTags && tag.subTags.length" class="mt-2 pl-3 border-l-2 border-slate-800 space-y-1.5">
                    <div v-for="sub in tag.subTags" :key="sub.tag" class="text-[11px]">
                      <span class="text-rose-400 font-mono">Sub-tag {{ sub.tag }} ({{ sub.name }}):</span>
                      <span class="text-slate-300 font-mono ml-1">{{ sub.value }}</span>
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
import { generateEmvQrPayload, parseEmvQrPayload } from '@/Utils/emvQrGenerator';

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
  if (isNaN(num) || num <= 0) return 'Any Amount (Static)';
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
  // Load saved credentials from localStorage if available
  const savedKey = localStorage.getItem(`genie_apiKey_${env}`);
  const savedAppId = localStorage.getItem(`genie_appId_${env}`);
  if (savedKey) form.apiKey = savedKey;
  if (savedAppId) form.appId = savedAppId;

  notify(`Switched to ${env.toUpperCase()} environment (${activeEndpointUrl.value})`, 'success');
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
  }, 4500);
}

// Fetch merchant details from backend proxy / GET /public/me
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
      
      // Save credentials in local storage for convenience
      localStorage.setItem(`genie_apiKey_${form.environment}`, form.apiKey);
      if (form.appId) localStorage.setItem(`genie_appId_${form.environment}`, form.appId);

      // Populate merchant details from response
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

      notify(`Successfully loaded merchant "${merchant.merchantName}" from ${form.environment.toUpperCase()} API!`, 'success');
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
  notify('Loaded sample Genie Business EMVCo merchant parameters', 'success');
}

// Copy EMVCo Payload
function copyPayload() {
  navigator.clipboard.writeText(qrPayload.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2500);
}

// Download QR as PNG
function downloadQrImage() {
  const canvas = document.querySelector('#printableQrStandee canvas');
  if (!canvas) return;

  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `genie-dynamic-qr-${merchant.merchantName.replace(/\s+/g, '_')}-${transaction.referenceLabel || 'payment'}.png`;
  a.click();
}

// Print Standee
function printStandee() {
  window.print();
}

onMounted(() => {
  // Check if saved credentials exist
  const savedKey = localStorage.getItem(`genie_apiKey_${form.environment}`);
  const savedAppId = localStorage.getItem(`genie_appId_${form.environment}`);
  if (savedKey) form.apiKey = savedKey;
  if (savedAppId) form.appId = savedAppId;
});
</script>

<style>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}

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
    width: 90%;
    max-width: 450px;
    background: white !important;
    color: black !important;
    border: 2px solid #e2e8f0 !important;
  }
}
</style>
