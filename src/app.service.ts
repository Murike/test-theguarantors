import { Injectable } from '@nestjs/common';
import type { AddressDto } from './shared/dto/address.dto';
import { ValidatedAddressDto } from './shared/dto/validatedAddress.dto';
import * as addressIt from 'addressit';
import { extractAddressLLM } from './shared/llm/llm.module';
import { confirmAddressGeoapify } from './shared/geoapify';

@Injectable()
export class AppService { 
  async validateAddress(address: AddressDto): Promise<ValidatedAddressDto> {
    
    const parsedAddress = await this.parseText(address.address);
    const validatedAddress = this.validateText(parsedAddress, address.address);
    // const refinedAddress = await this.refineText(parsedAddress, address.address);
    
    return new ValidatedAddressDto();
  }

  private async parseText(address: string): Promise<ValidatedAddressDto> {
    const parsedAddress = addressIt.default(address);
    
    console.log("parsedAddress: ", parsedAddress);

    const parsedText: ValidatedAddressDto = {
      street: parsedAddress.street || '',
      complement: parsedAddress.complement || '',
      neighbourhood: parsedAddress.neighbourhood || '',
      number: parsedAddress.number || 0,
      city: parsedAddress.city || '',
      state: parsedAddress.state || '',
      zipCode: parsedAddress.postalcode || '',
      type: 'unknown',
      validationStatus: 'parsed'
    };

    return new ValidatedAddressDto();
  }

  private async refineText(address: ValidatedAddressDto, original: string): Promise<ValidatedAddressDto> {
    const refinedAddress: ValidatedAddressDto = await extractAddressLLM(address, original);  
    return new ValidatedAddressDto();
  }

  private async validateText(address: ValidatedAddressDto, original: string): Promise<ValidatedAddressDto> {
    await confirmAddressGeoapify(address, original);
    return new ValidatedAddressDto();
  }
}
