/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SWIFTField {
  tag: string;
  name: string;
  value: string;
  description?: string;
}

export interface MTMessage {
  type: string; // MT103, MT202
  sender: string;
  receiver: string;
  fields: SWIFTField[];
  raw: string;
}

export interface ValidationResult {
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  errors: string[];
  warnings: string[];
}

export interface MappingInfo {
  mtField: string;
  mxPath: string;
  description: string;
  example: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  category: 'MT' | 'MX' | 'FIELD' | 'CONCEPT';
  tags: string[];
  content: string;
  related?: string[];
}
