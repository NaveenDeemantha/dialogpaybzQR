/**
 * EMVCo QR Code Generator & Parser (ISO/IEC 13239 CRC-16)
 * Compliant with Genie Business / DialogPay / LANKAQR EMVCo QR Specifications
 */

/**
 * Compute CRC16-CCITT (ISO/IEC 13239)
 * Polynomial: 0x1021, Initial: 0xFFFF
 *
 * @param {string} data
 * @returns {string} 4-character uppercase hexadecimal
 */
export function calculateCrc16(data) {
    let crc = 0xffff;
    const polynomial = 0x1021;

    for (let i = 0; i < data.length; i++) {
        const byte = data.charCodeAt(i);
        crc ^= (byte << 8);
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = ((crc << 1) ^ polynomial) & 0xffff;
            } else {
                crc = (crc << 1) & 0xffff;
            }
        }
    }

    return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Format a single TLV (Tag-Length-Value) string.
 *
 * @param {string} tag 2-digit tag ID
 * @param {string} value Value string
 * @returns {string}
 */
export function formatTlv(tag, value) {
    if (value === undefined || value === null) return '';
    const strVal = String(value);
    const lengthStr = String(strVal.length).padStart(2, '0');
    return `${tag}${lengthStr}${strVal}`;
}

/**
 * Generate EMVCo Dynamic QR Payload from parameters.
 *
 * @param {Object} params
 * @returns {Object} { payload, crc, length, tags }
 */
export function generateEmvQrPayload(params) {
    let elements = [];

    // Tag 00: Payload Format Indicator (Mandatory: '01')
    elements.push(formatTlv('00', '01'));

    // Tag 01: Point of Initiation Method ('12' for Dynamic, '11' for Static)
    const poi = params.pointOfInitiationMethod || (params.isDynamic === false ? '11' : '12');
    elements.push(formatTlv('01', poi));

    // Tag 02: Visa Active (16 chars)
    if (params.visaPan && String(params.visaPan).trim() !== '') {
        elements.push(formatTlv('02', String(params.visaPan).trim().slice(0, 16)));
    }

    // Tag 03: Visa Reserved (16 chars)
    if (params.visaReserved && String(params.visaReserved).trim() !== '') {
        elements.push(formatTlv('03', String(params.visaReserved).trim().slice(0, 16)));
    } else if (params.visaPan && String(params.visaPan).trim() !== '') {
        elements.push(formatTlv('03', String(params.visaPan).trim().slice(0, 16)));
    }

    // Tag 04: Mastercard Active (16 chars)
    if (params.mastercardPan && String(params.mastercardPan).trim() !== '') {
        elements.push(formatTlv('04', String(params.mastercardPan).trim().slice(0, 16)));
    }

    // Tag 05: Mastercard Reserved (16 chars)
    if (params.mastercardReserved && String(params.mastercardReserved).trim() !== '') {
        elements.push(formatTlv('05', String(params.mastercardReserved).trim().slice(0, 16)));
    } else if (params.mastercardPan && String(params.mastercardPan).trim() !== '') {
        elements.push(formatTlv('05', String(params.mastercardPan).trim().slice(0, 16)));
    }

    // Tag 15: UnionPay Active (31 chars)
    if (params.unionpayPan && String(params.unionpayPan).trim() !== '') {
        elements.push(formatTlv('15', String(params.unionpayPan).trim().slice(0, 31)));
    }

    // Tag 16: UnionPay Reserved (31 chars)
    if (params.unionpayReserved && String(params.unionpayReserved).trim() !== '') {
        elements.push(formatTlv('16', String(params.unionpayReserved).trim().slice(0, 31)));
    } else if (params.unionpayPan && String(params.unionpayPan).trim() !== '') {
        elements.push(formatTlv('16', String(params.unionpayPan).trim().slice(0, 31)));
    }

    // Tag 26: Globally unique identifier data object / Merchant Account Info (Length: 32)
    // Note: In LANKAQR/EMVCo, Tag 26 contains Sub-tag 00 (GUID).
    const rawGuid = params.merchantGuidAcquirerId || params.merchantAcquiringBankId;
    if (rawGuid && String(rawGuid).trim() !== '') {
        const guidStr = String(rawGuid).trim();
        let tag26Val = '';
        if (guidStr.startsWith('00') && guidStr.length >= 30) {
            tag26Val = guidStr;
        } else {
            // Wrap in Sub-tag 00
            tag26Val = formatTlv('00', guidStr);
        }
        elements.push(formatTlv('26', tag26Val));
    }

    // Tag 52: Merchant Category Code (MCC, 4 chars e.g. 5300)
    const mcc = params.merchantMccCode ? String(params.merchantMccCode).trim().padStart(4, '0') : '5300';
    elements.push(formatTlv('52', mcc.slice(0, 4)));

    // Tag 53: Transaction Currency (3 chars, '144' for LKR)
    let currency = params.trxCurrencyCode || params.currency || '144';
    if (String(currency).toUpperCase().trim() === 'LKR') currency = '144';
    elements.push(formatTlv('53', String(currency).trim().padStart(3, '0').slice(0, 3)));

    // Tag 54: Transaction Amount (Required for Dynamic QR '12')
    if (params.amount !== undefined && params.amount !== null && String(params.amount).trim() !== '') {
        const num = parseFloat(params.amount);
        if (!isNaN(num) && num > 0) {
            const formattedAmount = num.toFixed(2);
            elements.push(formatTlv('54', formattedAmount));
        }
    }

    // Tag 58: Country Code (2 chars, 'LK')
    const country = (params.merchantCountryCode || params.country || 'LK').toUpperCase().trim().slice(0, 2);
    elements.push(formatTlv('58', country));

    // Tag 59: Merchant Name (Up to 25 chars)
    const name = String(params.merchantName || params.tradingName || 'Genie Merchant').trim().slice(0, 25);
    elements.push(formatTlv('59', name));

    // Tag 60: Merchant City (Up to 15 chars)
    const city = String(params.merchantCity || 'Colombo').trim().slice(0, 15);
    elements.push(formatTlv('60', city));

    // Tag 62: Additional Data Field Template
    // Sub-tag 05: Reference Label (Up to 25 chars)
    const subTags62 = [];
    const ref = params.referenceLabel ? String(params.referenceLabel).trim() : '00000000000';
    subTags62.push(formatTlv('05', ref.slice(0, 25)));

    if (params.qrTerminalId && String(params.qrTerminalId).trim() !== '') {
        subTags62.push(formatTlv('07', String(params.qrTerminalId).trim().slice(0, 25)));
    }

    elements.push(formatTlv('62', subTags62.join('')));

    // Assemble payload without CRC and append '6304'
    const payloadWithoutCrc = elements.join('') + '6304';
    const crc = calculateCrc16(payloadWithoutCrc);
    const fullPayload = payloadWithoutCrc + crc;

    return {
        payload: fullPayload,
        crc,
        length: fullPayload.length,
        decodedTags: parseEmvQrPayload(fullPayload),
    };
}

/**
 * Parse an EMVCo string into formatted tags & descriptions.
 *
 * @param {string} payload
 * @returns {Array}
 */
export function parseEmvQrPayload(payload) {
    if (!payload || typeof payload !== 'string') return [];

    const tagNames = {
        '00': { name: 'Payload Format Indicator', desc: 'EMVCo Version (01)' },
        '01': { name: 'Point of Initiation Method', desc: '11 = Static (Reusable), 12 = Dynamic (Specific Amount)' },
        '02': { name: 'Visa Active PAN', desc: 'Visa Merchant Identifier' },
        '03': { name: 'Visa Reserved PAN', desc: 'Visa Reserved Identifier' },
        '04': { name: 'Mastercard Active PAN', desc: 'Mastercard Merchant Identifier' },
        '05': { name: 'Mastercard Reserved PAN', desc: 'Mastercard Reserved Identifier' },
        '15': { name: 'UnionPay Active PAN', desc: 'UnionPay Merchant Identifier' },
        '16': { name: 'UnionPay Reserved PAN', desc: 'UnionPay Reserved Identifier' },
        '26': { name: 'Merchant Account Info / Acquirer GUID', desc: 'Globally Unique Identifier (LANKAQR)' },
        '52': { name: 'Merchant Category Code', desc: 'MCC Classification (ISO 18245)' },
        '53': { name: 'Transaction Currency', desc: 'ISO 4217 Currency (144 = LKR)' },
        '54': { name: 'Transaction Amount', desc: 'Payment Amount' },
        '58': { name: 'Country Code', desc: 'ISO 3166-1 alpha-2 (LK = Sri Lanka)' },
        '59': { name: 'Merchant Name', desc: 'Registered Merchant Name' },
        '60': { name: 'Merchant City', desc: 'City of Operation' },
        '62': { name: 'Additional Data Field', desc: 'Invoice / Reference Metadata' },
        '63': { name: 'CRC-16 Checksum', desc: 'ISO/IEC 13239 Error Checking' },
    };

    const subTagNames = {
        '00': 'Globally Unique Identifier (GUID)',
        '01': 'Bill Number',
        '02': 'Mobile Number',
        '03': 'Store Label',
        '04': 'Loyalty Number',
        '05': 'Reference Label / Invoice ID',
        '06': 'Customer Label',
        '07': 'Terminal Label',
        '08': 'Purpose of Transaction',
    };

    const result = [];
    let i = 0;

    while (i < payload.length) {
        if (i + 4 > payload.length) break;

        const tag = payload.substring(i, i + 2);
        const len = parseInt(payload.substring(i + 2, i + 4), 10);
        if (isNaN(len)) break;

        const value = payload.substring(i + 4, i + 4 + len);
        i += 4 + len;

        const info = tagNames[tag] || { name: `Tag ${tag}`, desc: 'Custom / Reserved Tag' };

        const entry = {
            tag,
            name: info.name,
            desc: info.desc,
            length: len,
            value,
            subTags: [],
        };

        if (tag === '26') {
            let subI = 0;
            while (subI + 4 <= value.length) {
                const sTag = value.substring(subI, subI + 2);
                const sLen = parseInt(value.substring(subI + 2, subI + 4), 10);
                if (isNaN(sLen)) break;

                const sVal = value.substring(subI + 4, subI + 4 + sLen);
                subI += 4 + sLen;

                entry.subTags.push({
                    tag: sTag,
                    name: subTagNames[sTag] || `Sub-tag ${sTag}`,
                    length: sLen,
                    value: sVal,
                });
            }
        }

        if (tag === '62') {
            let subI = 0;
            while (subI + 4 <= value.length) {
                const sTag = value.substring(subI, subI + 2);
                const sLen = parseInt(value.substring(subI + 2, subI + 4), 10);
                if (isNaN(sLen)) break;

                const sVal = value.substring(subI + 4, subI + 4 + sLen);
                subI += 4 + sLen;

                entry.subTags.push({
                    tag: sTag,
                    name: subTagNames[sTag] || `Sub-tag ${sTag}`,
                    length: sLen,
                    value: sVal,
                });
            }
        }

        result.push(entry);
    }

    return result;
}
