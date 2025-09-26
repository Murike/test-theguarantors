import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppService } from './app.service';
import { AddressDto } from './common/dto/address.dto';
import type { ValidatedAddressDto } from './common/dto/validatedAddress.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('validate-address')
  @ApiOperation({ summary: 'Lista de caixas para comportar cada pedido.' })
  @UsePipes(new ZodValidationPipe())
  async validateAddress(@Body() address: AddressDto): Promise<ValidatedAddressDto> {
    return await this.appService.validateAddress(address);
  }
}
