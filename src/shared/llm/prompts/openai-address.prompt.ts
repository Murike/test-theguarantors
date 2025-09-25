export const openaiAddressPrompt = (parsed: string, original: string) => `Your job is to check a text 
and analyze the complete US postal address embedded in it. Your job is to extract, normalize (USPS standards), and validate a single US address from the provided text.

Rules:
- US-only. If the address is outside the United States or cannot be reliably determined, return an error as specified below and set validationStatus to "unverifiable".
- Normalize to USPS standards:
  - State must be a USPS 2-letter code (e.g., CA, NY).
  - ZIP must be either 5 digits (zip5) or 9 digits as ZIP+4 (split into zip5 and zipPlus4).
  - Normalize common street suffixes and directional components (e.g., "Street" -> "St", "Avenue" -> "Ave", "North" -> "N").
- Capture unit information explicitly (unitType and unit), e.g., Apt 4B, Suite 300, Unit 12. Do not embed unit info inside the street field.
- If multiple candidate addresses are present, choose the single most plausible one; note ambiguity in corrections.
- If you make minor fixes (typos, inferred suffix, inferred unitType), set validationStatus to "corrected" and list what changed in corrections.
- If fully valid without changes, set validationStatus to "valid".

Output Requirements:
- Output must be a single-line YAML object with the exact keys below. No prose, no explanations, no markdown fences.
- Include all keys. If a value is unknown or not applicable, use null. Numeric confidences must be in [0, 1].

YAML Schema (keys and meanings):
  street: string | null            # Full primary delivery line, e.g., "1600 Pennsylvania Ave NW"
  unitType: string | null          # e.g., "Apt", "Suite", "Unit"
  unit: string | null              # e.g., "4B"
  city: string | null
  state: string | null             # USPS 2-letter code
  zip5: string | null              # 5-digit ZIP
  zipPlus4: string | null          # 4 digits or null
  poBox: string | null             # e.g., "PO Box 123" (use type = "po_box" if present)
  type: string | null              # one of: "house" | "apartment" | "po_box" | null
  validationStatus: string         # one of: "unverifiable" | "corrected" | "valid"
  confidence: number               # overall confidence 0..1
  fieldConfidence:                 # per-field confidence 0..1 (null if field is null)
    street: number | null
    unitType: number | null
    unit: number | null
    city: number | null
    state: number | null
    zip5: number | null
    zipPlus4: number | null
    poBox: number | null
    type: number | null
  corrections: string[]            # notes on any corrections or assumptions made
  error:                           # error contract; use for non-US or parsing failures
    hasError: boolean
    message: string | null

Error handling:
- Non-US address -> error.hasError = true, message = "Non-US address", validationStatus = "unverifiable".
- If the input is too ambiguous to form a plausible US address -> error.hasError = true, message = "Insufficient information", validationStatus = "unverifiable".

Formatting:
- Output a single-line YAML object only. Do not include code blocks, labels, or extra text.

Optional hint (may be empty): the following pre-parsed hint may contain partially extracted fields. Prefer the original text if there is a conflict, but you may use the hint to improve accuracy.
Pre-parsed hint: ${parsed}

Example (illustrative; do not explain):
Input: "1600 Pennsylvania Avenue NW, Washington, DC 20500"
Output (single-line YAML): { street: "1600 Pennsylvania Ave NW", unitType: null, unit: null, city: "Washington", state: "DC", zip5: "20500", zipPlus4: null, poBox: null, type: "house", validationStatus: "valid", confidence: 0.99, fieldConfidence: { street: 0.99, unitType: 0, unit: 0, city: 0.99, state: 0.99, zip5: 0.99, zipPlus4: 0, poBox: 0, type: 0.9 }, corrections: [], error: { hasError: false, message: null } }

Now process the following text and respond with a single-line YAML object matching the schema:
Raw input data is: ${original}`
