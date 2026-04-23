/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { KnowledgeItem, MappingInfo } from '../types';

export const SWIFT_MAPPINGS: MappingInfo[] = [
  {
    mtField: ':20:',
    mxPath: 'GrpHdr/MsgId',
    description: 'Sender\'s Reference - Unique identification of the message.',
    example: ':20:REF123456789'
  },
  {
    mtField: ':32A:',
    mxPath: 'CdtTrfTxInf/IntrBkSttlmAmt',
    description: 'Value Date, Currency Code, and Amount.',
    example: ':32A:260422USD1500,50'
  },
  {
    mtField: ':50A:',
    mxPath: 'CdtTrfTxInf/Dbtr',
    description: 'Ordering Customer - Party that originates the payment.',
    example: ':50A:/12345678\nBANKUS33'
  },
  {
    mtField: ':59:',
    mxPath: 'CdtTrfTxInf/Cdtr',
    description: 'Beneficiary Customer - Ultimate recipient of the funds.',
    example: ':59:/98765432\nJOHN DOE'
  }
];

export const KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'mt103',
    title: 'MT 103 Single Customer Credit Transfer',
    category: 'MT',
    tags: ['payment', 'retail', 'customer'],
    content: 'The MT 103 is a SWIFT message format used for making single customer credit transfers. It is the most common message for international payments.',
    related: ['pacs.008', 'field-32a']
  },
  {
    id: 'mt202',
    title: 'MT 202 General Financial Institution Transfer',
    category: 'MT',
    tags: ['bank-to-bank', 'wholesale'],
    content: 'The MT 202 is used for financial institution transfers where the funds are transferred between banks without a customer involvement in the payment chain.',
    related: ['pacs.009', 'field-20']
  },
  {
    id: 'pacs.008',
    title: 'pacs.008 Customer Credit Transfer',
    category: 'MX',
    tags: ['iso20022', 'customer'],
    content: 'The ISO 20022 equivalent of MT 103. It supports much richer data including extended remittance information and structured addresses.',
    related: ['mt103']
  },
  {
    id: 'correspondent-banking',
    title: 'Correspondent Banking',
    category: 'CONCEPT',
    tags: ['banking', 'liquidity', 'vostro', 'nostro'],
    content: 'A relationship where one financial institution (the correspondent) holds deposits owned by another financial institution (the respondent) and provides payment and other services to those respondents.',
    related: ['mt202', 'nostro-account']
  }
];
