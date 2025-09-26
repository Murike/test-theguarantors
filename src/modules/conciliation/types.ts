export type AddressField = 'street' | 'complement' | 'neighbourhood' | 'number' | 'city' | 'state' | 'zipCode' | 'type' | 'validationStatus';

export type Provenance = 'parsing' | 'source_check' | 'llm' | 'consensus';

export interface FieldDecision<T> {
  value: T;
  confidence: number; // 0..1
  provenance: Provenance;
  sources: Partial<Record<Provenance, T>>;
}

export interface ConciliationResultMeta {
  fields: {
    street: FieldDecision<string>;
    complement: FieldDecision<string>;
    neighbourhood: FieldDecision<string>;
    number: FieldDecision<number>;
    city: FieldDecision<string>;
    state: FieldDecision<string>;
    zipCode: FieldDecision<string>;
    type: FieldDecision<'house' | 'apartment' | 'po_box' | 'unknown'>;
    validationStatus: FieldDecision<'valid' | 'corrected' | 'unverifiable' | 'parsed'>;
  };
  overallConfidence: number;
}

export interface SourceWeights {
  parsing: number;
  source_check: number;
  llm: number;
}

export interface ConciliationPolicy {
  weights: SourceWeights;
  agreementBoost: number; // added when two sources agree post-normalization
  conflictPenalty: number; // applied when three-way conflict
  acceptThreshold: number; // accept field if >= threshold
  // Fuzzy parameters and bonuses
  fuzzyMaxDistance: number; // Levenshtein threshold for agreement (per field)
  foundInOriginalBonus: number; // confidence bonus when value is found in original text (approx)
  earlyExitAgreementRatio: number; // threshold ratio for early exit using source-check when parsing agrees
}
