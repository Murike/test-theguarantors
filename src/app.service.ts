import { Injectable } from '@nestjs/common';
import type { EntradaDto } from './shared/dto/entrada.dto';
import type { SaidaDto, Caixa } from './shared/dto/saida.dto';
import { caixas } from './shared/data/caixas';
import {
  Container,
  Item,
  PackingService,
  ContainerPackingResult,
} from '3d-bin-packing-ts';

@Injectable()
export class AppService {
  provisionOrderBoxes(pedidos: EntradaDto): SaidaDto {
    const resultadoPedidos: SaidaDto = { pedidos: [] };
    const caixasDisponiveis: Container[] = [];
    for (const caixaTipo of caixas) {
      caixasDisponiveis.push(
        new Container(
          caixaTipo.caixa_id,
          caixaTipo.dimensoes.largura,
          caixaTipo.dimensoes.altura,
          caixaTipo.dimensoes.comprimento,
        ),
      );
    }

    for (const pedido of pedidos.pedidos) {
      const items: Item[] = [];
      for (const produto of pedido.produtos) {
        const item = new Item(
          produto.produto_id,
          produto.dimensoes.largura,
          produto.dimensoes.altura,
          produto.dimensoes.comprimento,
          1,
        );
        items.push(item);
      }

      const caixasUsadas = this.findBestBoxConfiguration(
        items,
        caixasDisponiveis,
      );

      resultadoPedidos.pedidos.push({
        pedido_id: pedido.pedido_id.toString(),
        caixas: caixasUsadas,
      });
    }

    return resultadoPedidos;
  }

  private findBestBoxConfiguration(
    items: Item[],
    caixasDisponiveis: Container[],
  ): Caixa[] {
    const solution: Caixa[] = [];
    let temporarySolution: Caixa | null = null;
    let packingResult: ContainerPackingResult | null = null;

    while (items.length > 0) {
      for (const caixa of caixasDisponiveis) {
        packingResult = PackingService.packSingle(caixa, items);

        temporarySolution = {
          caixa_id: caixa.id,
          produtos: packingResult.algorithmPackingResults[0].packedItems.map(
            (produto) => produto.id,
          ),
        };

        if (packingResult.algorithmPackingResults[0].isCompletePacked) {
          solution.push(temporarySolution);
          items = [];
          break;
        }
      }

      if (
        packingResult &&
        packingResult?.algorithmPackingResults[0].packedItems.length == 0
      ) {
        solution.push({
          caixa_id: null,
          produtos: packingResult.algorithmPackingResults[0].unpackedItems.map(
            (produto) => produto.id,
          ),
          observacao: 'Produtos não couberam nas caixas disponíveis',
        });

        break;
      }

      if (
        packingResult &&
        temporarySolution &&
        !packingResult?.algorithmPackingResults[0].isCompletePacked &&
        packingResult?.algorithmPackingResults[0].packedItems.length > 0
      ) {
        solution.push(temporarySolution);
        const packedItems =
          packingResult?.algorithmPackingResults[0].packedItems || [];

        for (const packedItem of packedItems) {
          const productIndex = items.findIndex(
            (item) => item.id === packedItem.id,
          );

          items.splice(productIndex, 1);
        }
      }
    }

    return solution;
  }
}
