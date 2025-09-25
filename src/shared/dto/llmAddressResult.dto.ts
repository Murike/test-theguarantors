import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Zod schema for the LLM's YAML output (single-line YAML parsed to object)
export const LlmAddressResultSchema = z.object({
  street: z.string().nullable(),
  unitType: z.string().nullable(),
  unit: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(), // USPS 2-letter code or null
  zip5: z.string().nullable(),
  zipPlus4: z.string().nullable(),
  poBox: z.string().nullable(),
  type: z.enum(['house', 'apartment', 'po_box']).nullable(),
  validationStatus: z.enum(['unverifiable', 'corrected', 'valid']),
  confidence: z.number().min(0).max(1),
  fieldConfidence: z.object({
    street: z.number().min(0).max(1).nullable(),
    unitType: z.number().min(0).max(1).nullable(),
    unit: z.number().min(0).max(1).nullable(),
    city: z.number().min(0).max(1).nullable(),
    state: z.number().min(0).max(1).nullable(),
    zip5: z.number().min(0).max(1).nullable(),
    zipPlus4: z.number().min(0).max(1).nullable(),
    poBox: z.number().min(0).max(1).nullable(),
    type: z.number().min(0).max(1).nullable(),
  }),
  corrections: z.array(z.string()),
  error: z.object({
    hasError: z.boolean(),
    message: z.string().nullable(),
  }),
});

export type LlmAddressResult = z.infer<typeof LlmAddressResultSchema>;
export class LlmAddressResultDto extends createZodDto(LlmAddressResultSchema) {}
