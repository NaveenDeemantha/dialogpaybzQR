<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Exception;

class GenieBizService
{
    /**
     * Base URLs for Genie Business environments.
     */
    public const ENVIRONMENTS = [
        'live' => 'https://api.geniebiz.lk',
        'uat'  => 'https://api.uat.geniebiz.lk',
    ];

    /**
     * Get the base URL for the given environment.
     */
    public function getBaseUrl(string $environment): string
    {
        $env = strtolower(trim($environment));
        return self::ENVIRONMENTS[$env] ?? self::ENVIRONMENTS['uat'];
    }

    /**
     * Fetch merchant / company details from Genie Business API.
     */
    public function getCompanyDetails(string $environment, string $apiKey, ?string $appId = null): array
    {
        $baseUrl = $this->getBaseUrl($environment);
        $cleanKey = preg_replace('/^bearer\s+/i', '', trim($apiKey));
        $cleanAppId = !empty($appId) ? trim($appId) : null;

        $endpoints = [
            rtrim($baseUrl, '/') . '/public/me',
            rtrim($baseUrl, '/') . '/public/v2/me',
            rtrim($baseUrl, '/') . '/public/v1/me',
            rtrim($baseUrl, '/') . '/public/merchant',
            rtrim($baseUrl, '/') . '/public/v2/merchant',
            rtrim($baseUrl, '/') . '/public/v1/merchant',
            rtrim($baseUrl, '/') . '/v1/merchant',
            rtrim($baseUrl, '/') . '/public/qr/static',
        ];

        $headerVariants = [
            // Variant 1: Raw API key in Authorization (Required by DialogPay live gateway)
            array_filter([
                'Authorization' => $cleanKey,
                'Accept'        => 'application/json',
                'x-app-id'      => $cleanAppId,
                'appId'         => $cleanAppId,
            ]),
            // Variant 2: Bearer + x-app-id
            array_filter([
                'Authorization' => 'Bearer ' . $cleanKey,
                'x-app-id'      => $cleanAppId,
                'appId'         => $cleanAppId,
                'Accept'        => 'application/json',
            ]),
            // Variant 3: x-api-key + x-app-id
            array_filter([
                'x-api-key'     => $cleanKey,
                'apiKey'        => $cleanKey,
                'x-app-id'      => $cleanAppId,
                'appId'         => $cleanAppId,
                'Accept'        => 'application/json',
            ]),
        ];

        $lastResponse = null;
        $lastError = null;

        foreach ($endpoints as $endpoint) {
            foreach ($headerVariants as $headers) {
                try {
                    $response = Http::withoutVerifying()
                        ->timeout(10)
                        ->withHeaders($headers)
                        ->get($endpoint);

                    if ($response->successful()) {
                        return [
                            'success'  => true,
                            'data'     => $response->json() ?? $response->body(),
                            'status'   => $response->status(),
                            'endpoint' => $endpoint,
                        ];
                    }

                    $lastResponse = $response;
                } catch (Exception $e) {
                    $lastError = $e->getMessage();
                }
            }
        }

        if ($lastResponse) {
            $msg = $lastResponse->json('message') ?? $lastResponse->json('error') ?? $lastResponse->body();
            if ($lastResponse->status() === 401) {
                $msg = 'Unauthorized (401): Please verify your API Key and check if your App ID (x-app-id) is required from your Dialog Pay Business dashboard.';
            }
            return [
                'success' => false,
                'status'  => $lastResponse->status(),
                'message' => $msg,
                'error'   => $lastResponse->json(),
            ];
        }

        return [
            'success' => false,
            'status'  => 500,
            'message' => 'Network error connecting to Dialog Pay Business API: ' . ($lastError ?? 'Unknown connection failure'),
        ];
    }
}
