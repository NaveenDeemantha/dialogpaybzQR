<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GenieBizService;
use App\Services\EmvQrService;
use Inertia\Inertia;
use Inertia\Response;

class GenieBizController extends Controller
{
    protected GenieBizService $genieBizService;
    protected EmvQrService $emvQrService;

    public function __construct(GenieBizService $genieBizService, EmvQrService $emvQrService)
    {
        $this->genieBizService = $genieBizService;
        $this->emvQrService = $emvQrService;
    }

    /**
     * Render the Dynamic QR generator page.
     */
    public function index(): Response
    {
        return Inertia::render('DynamicQR', [
            'defaultEnvironment' => config('services.geniebiz.default_env', 'uat'),
            'defaultAppId'       => config('services.geniebiz.default_app_id', ''),
            'environments'       => [
                ['id' => 'uat', 'name' => 'UAT Sandbox (api.uat.geniebiz.lk)', 'url' => 'https://api.uat.geniebiz.lk'],
                ['id' => 'live', 'name' => 'Production Live (api.geniebiz.lk)', 'url' => 'https://api.geniebiz.lk'],
            ],
        ]);
    }

    /**
     * Fetch merchant / company details via GET /public/me.
     */
    public function fetchCompany(Request $request)
    {
        $validated = $request->validate([
            'environment' => 'required|string|in:live,uat',
            'apiKey'      => 'required|string',
            'appId'       => 'nullable|string',
        ]);

        $result = $this->genieBizService->getCompanyDetails(
            $validated['environment'],
            $validated['apiKey'],
            $validated['appId'] ?? null
        );

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Failed to retrieve company details',
                'error'   => $result['error'] ?? null,
            ], $result['status'] ?? 400);
        }

        return response()->json([
            'success' => true,
            'data'    => $result['data'],
        ]);
    }

    /**
     * Generate / validate EMVCo Dynamic QR Payload.
     */
    public function generatePayload(Request $request)
    {
        $validated = $request->validate([
            'amount'                   => 'nullable|numeric|min:0',
            'referenceLabel'           => 'nullable|string|max:25',
            'pointOfInitiationMethod'  => 'nullable|string|in:11,12',
            'merchantName'             => 'nullable|string|max:25',
            'merchantCity'             => 'nullable|string|max:15',
            'merchantCountryCode'      => 'nullable|string|max:2',
            'merchantMccCode'          => 'nullable|string|max:4',
            'trxCurrencyCode'          => 'nullable|string|max:3',
            'visaPan'                  => 'nullable|string',
            'visaReserved'             => 'nullable|string',
            'mastercardPan'            => 'nullable|string',
            'mastercardReserved'       => 'nullable|string',
            'unionpayPan'              => 'nullable|string',
            'unionpayReserved'         => 'nullable|string',
            'merchantGuidAcquirerId'   => 'nullable|string',
            'merchantAcquiringBankId'  => 'nullable|string',
        ]);

        $payloadData = $this->emvQrService->generateDynamicQrPayload($validated);

        return response()->json([
            'success' => true,
            'data'    => $payloadData,
        ]);
    }
}
