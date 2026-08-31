<?php

namespace App\Services;

class EmvQrService
{
    /**
     * Build an EMVCo compliant Dynamic QR payload string from merchant details and payment params.
     *
     * @param array $params
     * @return array
     */
    public function generateDynamicQrPayload(array $params): array
    {
        $tags = [];

        // 00: Payload Format Indicator (Mandatory: '01')
        $tags[] = $this->formatTlv('00', '01');

        // 01: Point of Initiation Method ('12' for Dynamic QR, '11' for Static QR)
        $pointOfInitiation = $params['pointOfInitiationMethod'] ?? (isset($params['isDynamic']) && !$params['isDynamic'] ? '11' : '12');
        $tags[] = $this->formatTlv('01', $pointOfInitiation);

        // 02: Visa Active (Length: 16)
        if (!empty($params['visaPan'])) {
            $tags[] = $this->formatTlv('02', substr(trim($params['visaPan']), 0, 16));
        }

        // 03: Visa Reserved (Length: 16)
        if (!empty($params['visaReserved'])) {
            $tags[] = $this->formatTlv('03', substr(trim($params['visaReserved']), 0, 16));
        } elseif (!empty($params['visaPan'])) {
            $tags[] = $this->formatTlv('03', substr(trim($params['visaPan']), 0, 16));
        }

        // 04: Mastercard Active (Length: 16)
        if (!empty($params['mastercardPan'])) {
            $tags[] = $this->formatTlv('04', substr(trim($params['mastercardPan']), 0, 16));
        }

        // 05: Mastercard Reserved (Length: 16)
        if (!empty($params['mastercardReserved'])) {
            $tags[] = $this->formatTlv('05', substr(trim($params['mastercardReserved']), 0, 16));
        } elseif (!empty($params['mastercardPan'])) {
            $tags[] = $this->formatTlv('05', substr(trim($params['mastercardPan']), 0, 16));
        }

        // 15: UnionPay Active (Optional, Length: 31)
        if (!empty($params['unionpayPan'])) {
            $tags[] = $this->formatTlv('15', substr(trim($params['unionpayPan']), 0, 31));
        }

        // 16: UnionPay Reserved (Optional, Length: 31)
        if (!empty($params['unionpayReserved'])) {
            $tags[] = $this->formatTlv('16', substr(trim($params['unionpayReserved']), 0, 31));
        } elseif (!empty($params['unionpayPan'])) {
            $tags[] = $this->formatTlv('16', substr(trim($params['unionpayPan']), 0, 31));
        }

        // 26: Globally unique identifier data object / Merchant Account Information (Length: 32)
        // Note: In LANKAQR/EMVCo, Tag 26 contains Sub-tag 00 (GUID).
        $guid = $params['merchantGuidAcquirerId'] ?? $params['merchantAcquiringBankId'] ?? null;
        if (!empty($guid)) {
            $guid = trim($guid);
            if (str_starts_with($guid, '00') && strlen($guid) >= 30) {
                $tag26Value = $guid;
            } else {
                // Wrap raw GUID in Sub-tag 00
                $tag26Value = $this->formatTlv('00', $guid);
            }
            $tags[] = $this->formatTlv('26', $tag26Value);
        }

        // 52: Merchant Category Code (Mandatory, 4 digits e.g. '5300')
        $mcc = !empty($params['merchantMccCode']) ? str_pad(trim($params['merchantMccCode']), 4, '0', STR_PAD_LEFT) : '5300';
        $tags[] = $this->formatTlv('52', substr($mcc, 0, 4));

        // 53: Transaction Currency (Mandatory, 3 digits e.g. '144' for LKR)
        $currency = $params['trxCurrencyCode'] ?? $params['currency'] ?? '144';
        if (strtoupper(trim($currency)) === 'LKR') {
            $currency = '144';
        }
        $tags[] = $this->formatTlv('53', str_pad(substr(trim($currency), 0, 3), 3, '0', STR_PAD_LEFT));

        // 54: Transaction Amount (Mandatory for Dynamic QR '12', formatted up to 13 chars e.g. '1500.00')
        if (isset($params['amount']) && $params['amount'] !== '' && $params['amount'] !== null) {
            $num = (float)$params['amount'];
            if ($num > 0) {
                $amountVal = number_format($num, 2, '.', '');
                $tags[] = $this->formatTlv('54', $amountVal);
            }
        }

        // 58: Country Code (Mandatory: 'LK')
        $countryCode = !empty($params['merchantCountryCode']) ? strtoupper(substr(trim($params['merchantCountryCode']), 0, 2)) : 'LK';
        $tags[] = $this->formatTlv('58', $countryCode);

        // 59: Merchant Name (Mandatory, max 25 chars)
        $merchantName = !empty($params['merchantName']) ? trim($params['merchantName']) : 'Genie Merchant';
        $tags[] = $this->formatTlv('59', substr($merchantName, 0, 25));

        // 60: Merchant City (Mandatory, max 15 chars)
        $merchantCity = !empty($params['merchantCity']) ? trim($params['merchantCity']) : 'Colombo';
        $tags[] = $this->formatTlv('60', substr($merchantCity, 0, 15));

        // 62: Additional Data Field Template (Mandatory)
        // Sub-tag 05: Reference Label
        $subTags62 = [];
        $reference = !empty($params['referenceLabel']) ? trim($params['referenceLabel']) : '00000000000';
        $subTags62[] = $this->formatTlv('05', substr($reference, 0, 25));

        if (!empty($params['qrTerminalId'])) {
            $subTags62[] = $this->formatTlv('07', substr(trim($params['qrTerminalId']), 0, 25));
        }

        $tag62Value = implode('', $subTags62);
        $tags[] = $this->formatTlv('62', $tag62Value);

        // Assemble payload string without CRC
        $payloadWithoutCrc = implode('', $tags) . '6304';

        // Calculate CRC-16 (ISO/IEC 13239)
        $crc = $this->calculateCrc16($payloadWithoutCrc);
        $fullPayload = $payloadWithoutCrc . $crc;

        return [
            'payload'       => $fullPayload,
            'crc'           => $crc,
            'length'        => strlen($fullPayload),
            'decoded_tags'  => $this->parseTlv($fullPayload),
        ];
    }

    /**
     * Format single TLV element.
     */
    public function formatTlv(string $tag, string $value): string
    {
        $length = str_pad(strlen($value), 2, '0', STR_PAD_LEFT);
        return $tag . $length . $value;
    }

    /**
     * Compute CRC16-CCITT (ISO/IEC 13239 with polynomial 0x1021, init 0xFFFF).
     */
    public function calculateCrc16(string $data): string
    {
        $crc = 0xFFFF;
        $polynomial = 0x1021;
        $length = strlen($data);

        for ($i = 0; $i < $length; $i++) {
            $crc ^= (ord($data[$i]) << 8);
            for ($j = 0; $j < 8; $j++) {
                if (($crc & 0x8000) !== 0) {
                    $crc = (($crc << 1) ^ $polynomial) & 0xFFFF;
                } else {
                    $crc = ($crc << 1) & 0xFFFF;
                }
            }
        }

        return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
    }

    /**
     * Parse and decode an EMVCo QR string into readable tags.
     */
    public function parseTlv(string $payload): array
    {
        $tags = [];
        $i = 0;
        $len = strlen($payload);

        $tagNames = [
            '00' => 'Payload Format Indicator',
            '01' => 'Point of Initiation Method (Static=11, Dynamic=12)',
            '02' => 'Visa Active PAN',
            '03' => 'Visa Reserved PAN',
            '04' => 'Mastercard Active PAN',
            '05' => 'Mastercard Reserved PAN',
            '15' => 'UnionPay Active PAN',
            '16' => 'UnionPay Reserved PAN',
            '26' => 'Merchant Account Info / Acquirer GUID',
            '52' => 'Merchant Category Code (MCC)',
            '53' => 'Transaction Currency (144=LKR)',
            '54' => 'Transaction Amount',
            '58' => 'Country Code',
            '59' => 'Merchant Name',
            '60' => 'Merchant City',
            '62' => 'Additional Data Template',
            '63' => 'CRC Checksum',
        ];

        while ($i < $len) {
            if ($i + 4 > $len) {
                break;
            }
            $tag = substr($payload, $i, 2);
            $length = (int)substr($payload, $i + 2, 2);
            $value = substr($payload, $i + 4, $length);
            $i += 4 + $length;

            $entry = [
                'tag'         => $tag,
                'name'        => $tagNames[$tag] ?? "Tag $tag",
                'length'      => $length,
                'value'       => $value,
                'sub_tags'    => [],
            ];

            // If tag 26, parse sub-tags
            if ($tag === '26') {
                $subI = 0;
                $subLen = strlen($value);
                while ($subI + 4 <= $subLen) {
                    $sTag = substr($value, $subI, 2);
                    $sLength = (int)substr($value, $subI + 2, 2);
                    $sValue = substr($value, $subI + 4, $sLength);
                    $subI += 4 + $sLength;

                    $entry['sub_tags'][] = [
                        'tag'    => $sTag,
                        'name'   => $sTag === '00' ? 'Globally Unique Identifier (GUID)' : "Sub-Tag $sTag",
                        'length' => $sLength,
                        'value'  => $sValue,
                    ];
                }
            }

            // If tag 62, parse sub-tags
            if ($tag === '62') {
                $subI = 0;
                $subLen = strlen($value);
                while ($subI + 4 <= $subLen) {
                    $sTag = substr($value, $subI, 2);
                    $sLength = (int)substr($value, $subI + 2, 2);
                    $sValue = substr($value, $subI + 4, $sLength);
                    $subI += 4 + $sLength;

                    $subNames = [
                        '01' => 'Bill Number',
                        '02' => 'Mobile Number',
                        '03' => 'Store Label',
                        '04' => 'Loyalty Number',
                        '05' => 'Reference Label',
                        '06' => 'Customer Label',
                        '07' => 'Terminal Label',
                        '08' => 'Purpose of Transaction',
                    ];

                    $entry['sub_tags'][] = [
                        'tag'    => $sTag,
                        'name'   => $subNames[$sTag] ?? "Sub-Tag $sTag",
                        'length' => $sLength,
                        'value'  => $sValue,
                    ];
                }
            }

            $tags[] = $entry;
        }

        return $tags;
    }
}
