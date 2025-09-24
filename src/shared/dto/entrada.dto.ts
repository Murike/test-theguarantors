import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const Dimensao = z.object({
  altura: z.number().positive(),
  largura: z.number().positive(),
  comprimento: z.number().positive(),
});

const Produto = z.object({
  produto_id: z.string().min(1, 'Id de produto obrigatório'),
  dimensoes: Dimensao,
});

const PedidoEntrada = z.object({
  pedido_id: z.number(),
  produtos: z
    .array(Produto)
    .min(1, 'Obrigatório pelo menos um produto no pedido'),
});

const PedidosEntrada = z.object({
  pedidos: z.array(PedidoEntrada).min(1, 'Obrigatório pelo menos um pedido'),
});

export class EntradaDto extends createZodDto(PedidosEntrada) {}
