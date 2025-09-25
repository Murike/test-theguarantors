import { Injectable } from '@nestjs/common';
import type { AddressDto } from './shared/dto/address.dto';
import { ValidatedAddressDto } from './shared/dto/validatedAddress.dto';
import * as addressIt from 'addressit';
import { LlmOrchestratorService } from './shared/llm/core/llm.service';
import { SourceCheckOrchestratorService } from './shared/source-check/core/source-check.service';
// import { ConciliationService } from './shared/conciliation/core/conciliation.service';

@Injectable()
export class AppService { 
  constructor(
    private readonly llm: LlmOrchestratorService,
    private readonly sourceCheck: SourceCheckOrchestratorService,
    // private readonly conciliation: ConciliationService,
  ) {}

  async validateAddress(address: AddressDto): Promise<ValidatedAddressDto> {
    
    let confidenceRule = 0;
    let ongoingAddress: ValidatedAddressDto = await this.parseText(address.address);
    let isLLMAvailable = true;
    let isGeoapifyAvailable = true;

    // while(confidenceRule < 90 && (isLLMAvailable || isGeoapifyAvailable)){
      const addressValidationSource = await this.validationSource(ongoingAddress, address.address);
      const addressValidationLLM = await this.validationLLM(ongoingAddress, address.address);

      // Conciliation placeholder: final business rules will reconcile baseline, source, and LLM.
      // const reconciled = await this.conciliation.reconcile({
      //   original: address.address,
      //   baseline: ongoingAddress,
      //   source: addressValidationSource,
      //   llm: addressValidationLLM,
      // });
      // ongoingAddress = reconciled;
      

      console.log("ongoingAddress: ", ongoingAddress)
      console.log("addressValidationSource: ", addressValidationSource)
      console.log("addressValidationLLM: ", addressValidationLLM)
      // if (addressValidationLLM) {
      //   ongoingAddress = addressValidationLLM;
      // }
    // }

 
    return ongoingAddress;
  }

  private async parseText(address: string): Promise<ValidatedAddressDto> {
    const parsedAddress = addressIt.default(address);
    
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

    return parsedText;
  }

  private async validationLLM(address: ValidatedAddressDto, original: string): Promise<ValidatedAddressDto> {
    return this.llm.validateAddressUsingLLM(original, address);
  }

  private async validationSource(address: ValidatedAddressDto, original: string): Promise<ValidatedAddressDto> {
    const validated = await this.sourceCheck.validateAddressUsingSource(original, address);
    return validated;
  }
}
