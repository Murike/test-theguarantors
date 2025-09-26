import type { ConciliationPolicy } from './types';

// Initial, tunable policy. Future: load from config or DB.
export const defaultConciliationPolicy: ConciliationPolicy = {
  weights: {
    parsing: 0.2,
    source_check: 0.7,
    llm: 0.6,
  },
  agreementBoost: 0.15,
  conflictPenalty: 0.1,
  acceptThreshold: 0.65,
  // Fuzzy comparison configuration per conciliation rules
  fuzzyMaxDistance: 2,
  foundInOriginalBonus: 0.1, // bonus if the chosen string is present (approx) in original input
  earlyExitAgreementRatio: 0.8, // if parsing vs source-check agree on >=80% of core fields, prefer source-check and stop
};
