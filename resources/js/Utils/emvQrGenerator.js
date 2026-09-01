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
 * Format GUID Subtag 00 inside Tag 26 (Merchant Account Information / LANKAQR GUID).
 *
 * @param {string} guid
 * @returns {string}
 */
export function formatTag26Guid(guid) {
    if (!guid) return '';
    const str = String(guid).trim();
    if (!str) return '';

    // If already formatted as Sub-tag 00 (starts with 00 and length matches length indicator)
    if (str.startsWith('00') && str.length >= 4) {
        const subLen = parseInt(str.substring(2, 4), 10);
        if (!isNaN(subLen) && str.length === subLen + 4) {
            return formatTlv('26', str);
        }
    }

    // Otherwise wrap raw GUID in Sub-tag 00
    return formatTlv('26', formatTlv('00', str));
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

    // Tag 01: Point of Initiation Method ('11' is default per DialogPay spec, '12' for Dynamic)
    const poi = params.pointOfInitiationMethod || '11';
    elements.push(formatTlv('01', poi));

    // Tag 02: Visa Active (16 chars)
    if (params.visaPan && String(params.visaPan).trim() !== '') {
        elements.push(formatTlv('02', String(params.visaPan).trim().slice(0, 16)));
    }

    // Tag 03: Visa Reserved (16 chars) - Matches Tag 02 as per DialogPay guide specification
    const visaRes = params.visaReserved || params.visaPan;
    if (visaRes && String(visaRes).trim() !== '') {
        elements.push(formatTlv('03', String(visaRes).trim().slice(0, 16)));
    }

    // Tag 04: Mastercard Active (16 chars)
    if (params.mastercardPan && String(params.mastercardPan).trim() !== '') {
        elements.push(formatTlv('04', String(params.mastercardPan).trim().slice(0, 16)));
    }

    // Tag 05: Mastercard Reserved (16 chars) - Matches Tag 04 as per DialogPay guide specification
    const mcRes = params.mastercardReserved || params.mastercardPan;
    if (mcRes && String(mcRes).trim() !== '') {
        elements.push(formatTlv('05', String(mcRes).trim().slice(0, 16)));
    }

    // Tag 15: UnionPay Active (31 chars)
    if (params.unionpayPan && String(params.unionpayPan).trim() !== '') {
        elements.push(formatTlv('15', String(params.unionpayPan).trim().slice(0, 31)));
    }

    // Tag 16: UnionPay Reserved (31 chars) - Matches Tag 15 as per DialogPay guide specification
    const upRes = params.unionpayReserved || params.unionpayPan;
    if (upRes && String(upRes).trim() !== '') {
        elements.push(formatTlv('16', String(upRes).trim().slice(0, 31)));
    }

    // Tag 26: Globally unique identifier data object / Merchant Account Info (LANKAQR GUID)
    const rawGuid = params.merchantGuidAcquirerId || params.merchantAcquiringBankId;
    if (rawGuid && String(rawGuid).trim() !== '') {
        const tag26 = formatTag26Guid(rawGuid);
        if (tag26) {
            elements.push(tag26);
        }
    }

    // Tag 52: Merchant Category Code (MCC, 4 chars e.g. 5300)
    const mcc = params.merchantMccCode ? String(params.merchantMccCode).trim().padStart(4, '0') : '5300';
    elements.push(formatTlv('52', mcc.slice(0, 4)));

    // Tag 53: Transaction Currency (3 chars, '144' for LKR)
    let currency = params.trxCurrencyCode || params.currency || '144';
    if (String(currency).toUpperCase().trim() === 'LKR') currency = '144';
    elements.push(formatTlv('53', String(currency).trim().padStart(3, '0').slice(0, 3)));

    // Tag 54: Transaction Amount (Mandatory for Dynamic QR with amount)
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

    // Tag 59: Merchant Name (Up to 25 chars, sanitized)
    const rawName = String(params.merchantName || params.tradingName || 'Genie Merchant').trim();
    const cleanName = rawName.replace(/[^a-zA-Z0-9\s\-._]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 25);
    elements.push(formatTlv('59', cleanName || 'Genie Merchant'));

    // Tag 60: Merchant City (Up to 15 chars, sanitized)
    const rawCity = String(params.merchantCity || 'Colombo').trim();
    const cleanCity = rawCity.replace(/[^a-zA-Z0-9\s\-._]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 15);
    elements.push(formatTlv('60', cleanCity || 'Colombo'));

    // Tag 62: Additional Data Field Template (Strictly Sub-tag 05 Reference ONLY as per guide)
    const rawRef = params.referenceLabel ? String(params.referenceLabel).trim() : '00000000000';
    const cleanRef = rawRef.replace(/[^a-zA-Z0-9\-_.]/g, '').slice(0, 25) || '00000000000';
    const tag62Sub05 = formatTlv('05', cleanRef);
    elements.push(formatTlv('62', tag62Sub05));

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
        '01': { name: 'Point of Initiation Method', desc: '11 = Universal / Static, 12 = Dynamic' },
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

/**
 * Extract merchant parameters from any raw EMVCo / LANKAQR string.
 *
 * @param {string} rawQrString
 * @returns {Object|null} Extracted merchant configuration
 */
export function parseStaticQrToMerchant(rawQrString) {
    if (!rawQrString || typeof rawQrString !== 'string') return null;
    const cleanStr = rawQrString.trim();
    if (!cleanStr.startsWith('000201')) return null;

    const tags = parseEmvQrPayload(cleanStr);
    const tagMap = {};
    for (const t of tags) {
        tagMap[t.tag] = t;
    }

    const merchantData = {
        pointOfInitiationMethod: tagMap['01'] ? tagMap['01'].value : '11',
        visaPan: tagMap['02'] ? tagMap['02'].value : '',
        visaReserved: tagMap['03'] ? tagMap['03'].value : '',
        mastercardPan: tagMap['04'] ? tagMap['04'].value : '',
        mastercardReserved: tagMap['05'] ? tagMap['05'].value : '',
        unionpayPan: tagMap['15'] ? tagMap['15'].value : '',
        unionpayReserved: tagMap['16'] ? tagMap['16'].value : '',
        merchantGuidAcquirerId: tagMap['26'] ? tagMap['26'].value : '',
        merchantMccCode: tagMap['52'] ? tagMap['52'].value : '5300',
        trxCurrencyCode: tagMap['53'] ? tagMap['53'].value : '144',
        amount: tagMap['54'] ? tagMap['54'].value : '',
        merchantCountryCode: tagMap['58'] ? tagMap['58'].value : 'LK',
        merchantName: tagMap['59'] ? tagMap['59'].value : '',
        merchantCity: tagMap['60'] ? tagMap['60'].value : '',
        referenceLabel: '',
        qrTerminalId: '',
    };

    // Parse Tag 62 subtags
    if (tagMap['62'] && tagMap['62'].subTags) {
        for (const sub of tagMap['62'].subTags) {
            if (sub.tag === '05') merchantData.referenceLabel = sub.value;
            if (sub.tag === '07') merchantData.qrTerminalId = sub.value;
        }
    }

    return merchantData;
}
