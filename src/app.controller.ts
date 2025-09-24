import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppService } from './app.service';
import { EntradaDto } from './shared/dto/entrada.dto';
import type { SaidaDto } from './shared/dto/saida.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('validate-address')
  @ApiOperation({ summary: 'Lista de caixas para comportar cada pedido.' })
  @UsePipes(new ZodValidationPipe())
  getBoxFit(@Body() pedidos: EntradaDto): SaidaDto {
    return this.appService.provisionOrderBoxes(pedidos);
  }
}
