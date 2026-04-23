/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MTMessage, ValidationResult } from '../../types';

export function validateMT(mt: MTMessage): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Mandatory fields check for MT103
  if (mt.type === 'MT103') {
    const mandatory = [':20:', ':23B:', ':32A:', ':50A:', ':59:'];
    mandatory.forEach(tag => {
      if (!mt.fields.some(f => f.tag.includes(tag.replace(':', '')))) {
        // Handle optional suffixes like 50A/50K
        const baseTag = tag.substring(1, 3);
        const hasAlternative = mt.fields.some(f => f.tag.startsWith(`:${baseTag}`));
        if (!hasAlternative) {
          errors.push(`Mandatory field ${tag} is missing.`);
        }
      }
    });
  }

  // BIC Format Check
  mt.fields.forEach(field => {
    if (field.tag.endsWith('A:')) {
      const bic = field.value.split('\n').pop()?.trim();
      if (bic && !/^[A-Z]{6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3})?$/.test(bic)) {
        errors.push(`Invalid BIC format in field ${field.tag}: ${bic}`);
      }
    }
  });

  // Currency Code Check (Simplified)
  const field32A = mt.fields.find(f => f.tag === ':32A:');
  if (field32A) {
    const ccy = field32A.value.substring(6, 9);
    if (!/^[A-Z]{3}$/.test(ccy)) {
      errors.push(`Invalid Currency Code in field :32A:: ${ccy}`);
    }
  }

  // FX Validation Bonus
  const field36 = mt.fields.find(f => f.tag === ':36:');
  if (field36) {
    const rate = parseFloat(field36.value.replace(',', '.'));
    if (isNaN(rate) || rate <= 0) {
      errors.push(`Invalid Exchange Rate in field :36:: ${field36.value}`);
    } else if (rate > 1000000) {
      warnings.push(`Extreme exchange rate detected in :36:. Please verify.`);
    }
  }

  return {
    status: errors.length > 0 ? 'FAILED' : warnings.length > 0 ? 'WARNING' : 'SUCCESS',
    errors,
    warnings
  };
}
