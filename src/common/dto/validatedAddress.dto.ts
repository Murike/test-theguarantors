import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ValidatedAddressSchema = z.object({
  street: z.string(),
	complement: z.string().optional(),
	neighbourhood: z.string(),
	number: z.number(),
	city: z.string(),
	state: z.string(),
	zipCode: z.string(),
	type: z.enum(['house', 'apartment', 'po_box', 'unknown']),
	validationStatus: z.enum(['valid', 'corrected', 'unverifiable', 'parsed'])
});

export type ValidatedAddressType = z.infer<typeof ValidatedAddressSchema>;
export class ValidatedAddressDto extends createZodDto(ValidatedAddressSchema) {}
