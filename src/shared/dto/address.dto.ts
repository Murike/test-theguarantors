import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const addressDto = z.object({
  address: z.string().nonempty('Address must be provided for validation.'),
});

export class AddressDto extends createZodDto(addressDto) {}
