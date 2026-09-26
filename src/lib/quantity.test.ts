import { describe, expect, it } from 'vitest';
import { formatQuantite, formatQuota, formatQuotaParMois } from './quantity';

const ANALYSE = { unitLabel: 'analyse', unitLabelPlural: 'analyses' };
const AUDIT = { unitLabel: 'audit', unitLabelPlural: 'audits' };

describe('unités de quota (recette B9, 27/09/2026)', () => {
  it('0 et 1 au singulier, au-delà au pluriel', () => {
    expect(formatQuantite(0, 'analyse', 'analyses')).toBe('0 analyse');
    expect(formatQuantite(1, 'analyse', 'analyses')).toBe('1 analyse');
    expect(formatQuantite(2, 'analyse', 'analyses')).toBe('2 analyses');
    expect(formatQuantite(50, 'analyse', 'analyses')).toBe('50 analyses');
  });
  it('les milliers à la française', () => {
    expect(formatQuantite(1200, 'publication', 'publications')).toBe('1 200 publications');
  });
  it('le quota d’un outil, dans son unité', () => {
    expect(formatQuota(2, AUDIT)).toBe('2 audits');
    expect(formatQuota(1, AUDIT)).toBe('1 audit');
  });
  it('le quota mensuel : « 50 analyses par mois », « Sans limite » sans quota', () => {
    expect(formatQuotaParMois({ monthlyQuota: 50, ...ANALYSE })).toBe('50 analyses par mois');
    expect(formatQuotaParMois({ monthlyQuota: 2, ...AUDIT })).toBe('2 audits par mois');
    expect(formatQuotaParMois({ monthlyQuota: 1, ...AUDIT })).toBe('1 audit par mois');
    expect(formatQuotaParMois({ monthlyQuota: null, ...AUDIT })).toBe('Sans limite');
  });
});
