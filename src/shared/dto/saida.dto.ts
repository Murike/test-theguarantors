import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CaixaSchema = z.object({
  caixa_id: z.string().nullable(),
  produtos: z.array(z.string()),
  observacao: z.string().optional(),
});

export const PedidoSaidaSchema = z.object({
  pedido_id: z.string(),
  caixas: z.array(CaixaSchema).min(1),
});

export const PedidosSaidaSchema = z.object({
  pedidos: z.array(PedidoSaidaSchema),
});

export type Caixa = z.infer<typeof CaixaSchema>;
export type PedidoSaida = z.infer<typeof PedidoSaidaSchema>;
export type PedidosSaida = z.infer<typeof PedidosSaidaSchema>;

export class SaidaDto extends createZodDto(PedidosSaidaSchema) {}
