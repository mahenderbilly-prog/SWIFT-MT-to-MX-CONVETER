/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MTMessage } from '../../types';

export function generateMX(mt: MTMessage): string {
  if (mt.type === 'MT103') {
    return generatePacs008(mt);
  } else if (mt.type === 'MT202') {
    return generatePacs009(mt);
  }
  return '<!-- Unsupported MT Type for MX Generation -->';
}

function generatePacs008(mt: MTMessage): string {
  const ref = getFieldValue(mt, ':20:');
  const amountData = parse32A(getFieldValue(mt, ':32A:'));
  const ordering = getFieldValue(mt, ':50A:') || getFieldValue(mt, ':50K:');
  const beneficiary = getFieldValue(mt, ':59:');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>${ref}</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>IND</SttlmMtd>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <InstrId>${ref}</InstrId>
        <EndToEndId>${ref}</EndToEndId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="${amountData.currency}">${amountData.amount}</IntrBkSttlmAmt>
      <IntrBkSttlmDt>${amountData.date}</IntrBkSttlmDt>
      <Dbtr>
        <Nm>${ordering.split('\n')[0]}</Nm>
      </Dbtr>
      <Cdtr>
        <Nm>${beneficiary.split('\n')[0]}</Nm>
      </Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`;
}

function generatePacs009(mt: MTMessage): string {
  const ref = getFieldValue(mt, ':20:');
  const amountData = parse32A(getFieldValue(mt, ':32A:'));

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.009.001.08">
  <FICdtTrf>
    <GrpHdr>
      <MsgId>${ref}</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>IND</SttlmMtd>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <InstrId>${ref}</InstrId>
        <EndToEndId>${ref}</EndToEndId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="${amountData.currency}">${amountData.amount}</IntrBkSttlmAmt>
      <IntrBkSttlmDt>${amountData.date}</IntrBkSttlmDt>
    </CdtTrfTxInf>
  </FICdtTrf>
</Document>`;
}

function getFieldValue(mt: MTMessage, tag: string): string {
  const field = mt.fields.find(f => f.tag === tag);
  return field ? field.value : '';
}

function parse32A(val: string) {
  // Format: YYMMDDCCYAmount (e.g., 260422USD1500,50)
  if (!val || val.length < 9) return { date: '', currency: '', amount: '' };
  
  const yy = val.substring(0, 2);
  const mm = val.substring(2, 4);
  const dd = val.substring(4, 6);
  const ccy = val.substring(6, 9);
  const amt = val.substring(9).replace(',', '.');
  
  return {
    date: `20${yy}-${mm}-${dd}`,
    currency: ccy,
    amount: amt
  };
}
