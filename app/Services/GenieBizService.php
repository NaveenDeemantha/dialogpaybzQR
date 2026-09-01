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
     * Fetch merchant / company details from Genie Business API (/public/me).
     */
    public function getCompanyDetails(string $environment, string $apiKey, ?string $appId = null): array
    {
        $baseUrl = $this->getBaseUrl($environment);
        $endpoint = rtrim($baseUrl, '/') . '/public/me';

        $authHeader = trim($apiKey);
        $headers = [
            'Authorization' => $authHeader,
            'Accept'        => 'application/json',
        ];

        if (!empty($appId)) {
            $headers['x-app-id'] = trim($appId);
        }

        try {
            $response = Http::withHeaders($headers)
                ->timeout(15)
                ->get($endpoint);

            if (!$response->successful() && $response->status() === 401 && !str_starts_with(strtolower($authHeader), 'bearer ')) {
                $headers['Authorization'] = 'Bearer ' . $authHeader;
                $response = Http::withHeaders($headers)
                    ->timeout(15)
                    ->get($endpoint);
            }

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data'    => $response->json(),
                    'status'  => $response->status(),
                ];
            }

            return [
                'success' => false,
                'status'  => $response->status(),
                'message' => $response->json('message') ?? $response->body() ?? 'Failed to fetch company details from Genie Business API',
                'error'   => $response->json(),
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'status'  => 500,
                'message' => 'Network error connecting to Genie Business API: ' . $e->getMessage(),
            ];
        }
    }
}
