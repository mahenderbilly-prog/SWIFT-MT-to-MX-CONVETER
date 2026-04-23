/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MTMessage, SWIFTField } from '../../types';

export function parseMT(raw: string): MTMessage {
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Basic block extraction (simplified for this tool)
  // In a real app, we'd use a robust state-machine parser for {1:}{2:}{3:}{4:}{5:}
  
  const mtTypeMatch = raw.match(/\{2:I(\d{3})/);
  const type = mtTypeMatch ? `MT${mtTypeMatch[1]}` : 'MT103'; // Default to 103 if block 2 missing

  const fields: SWIFTField[] = [];
  const fieldRegex = /:(\d{2}[A-Z]*):([\s\S]*?)(?=\n:\d{2}[A-Z]*:|$)/g;
  
  let match;
  while ((match = fieldRegex.exec(raw)) !== null) {
    fields.push({
      tag: `:${match[1]}:`,
      name: getFieldName(match[1]),
      value: match[2].trim()
    });
  }

  // Extract Sender/Receiver if available in blocks
  const senderMatch = raw.match(/\{1:F01([A-Z0-9]{12})/);
  const receiverMatch = raw.match(/\{2:I\d{3}([A-Z0-9]{12})/);

  return {
    type,
    sender: senderMatch ? senderMatch[1] : 'SENDERXXX',
    receiver: receiverMatch ? receiverMatch[1] : 'RECEIVERXXX',
    fields,
    raw
  };
}

function getFieldName(tag: string): string {
  const names: Record<string, string> = {
    '20': 'Sender\'s Reference',
    '23B': 'Bank Operation Code',
    '32A': 'Value Date/Currency/Interbank Settled Amount',
    '33B': 'Currency/Instructed Amount',
    '36': 'Exchange Rate',
    '50A': 'Ordering Customer',
    '50K': 'Ordering Customer',
    '52A': 'Ordering Institution',
    '53A': 'Sender\'s Correspondent',
    '54A': 'Receiver\'s Correspondent',
    '57A': 'Account With Institution',
    '59': 'Beneficiary Customer',
    '70': 'Remittance Information',
    '71A': 'Details of Charges',
    '21': 'Related Reference',
  };
  return names[tag] || 'Unknown Field';
}
