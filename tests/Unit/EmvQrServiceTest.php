<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\EmvQrService;

class EmvQrServiceTest extends TestCase
{
    public function test_sample_crc_calculation_matches_document()
    {
        $service = new EmvQrService();
        
        // Sample from page 6 without CRC
        $samplePayloadWithoutCrc = '0002010102110216432551122002679903164325511220026799041622271322200267970516222713222002679715313950014400520446111111722002679163139500144005204461111117220026792632002816995001620221213111216611655204530053031445802LK5918Genie Integrations6010Colombo 0362150511000000000006304';
        
        $crc = $service->calculateCrc16($samplePayloadWithoutCrc);
        
        $this->assertEquals('271F', $crc);
    }

    public function test_dynamic_qr_generation_with_amount_and_reference()
    {
        $service = new EmvQrService();

        $params = [
            'pointOfInitiationMethod' => '12',
            'visaPan' => '4325511220026799',
            'mastercardPan' => '2227132220026797',
            'unionpayPan' => '3950014400520446111111722002679',
            'merchantGuidAcquirerId' => '00281699500162022121311121661165',
            'merchantMccCode' => '5300',
            'trxCurrencyCode' => '144',
            'amount' => '1500.50',
            'merchantCountryCode' => 'LK',
            'merchantName' => 'Genie Integrations',
            'merchantCity' => 'Colombo 03',
            'referenceLabel' => 'INV-2026-001',
        ];

        $result = $service->generateDynamicQrPayload($params);

        $this->assertNotEmpty($result['payload']);
        $this->assertEquals(4, strlen($result['crc']));
        $this->assertStringContainsString('54071500.50', $result['payload']);
        $this->assertStringContainsString('010212', $result['payload']);
        $this->assertStringContainsString('05110INV2026001', $result['payload']);
        $this->assertStringEndsWith('6304' . $result['crc'], $result['payload']);
    }

    public function test_dynamic_qr_with_terminal_id()
    {
        $service = new EmvQrService();

        $params = [
            'pointOfInitiationMethod' => '12',
            'visaPan' => '4325511220026799',
            'merchantGuidAcquirerId' => '00281699500162022121311121661165',
            'amount' => '250.00',
            'merchantName' => 'My Live Store',
            'merchantCity' => 'Colombo',
            'referenceLabel' => 'BILL-1001',
            'qrTerminalId' => 'TERM001',
            'includeTerminalId' => true,
        ];

        $result = $service->generateDynamicQrPayload($params);

        $this->assertNotEmpty($result['payload']);
        $this->assertStringContainsString('0511000BILL1001', $result['payload']);
        $this->assertStringContainsString('0707TERM001', $result['payload']);
    }
}
