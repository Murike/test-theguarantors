import { Injectable } from '@nestjs/common';
import type { AddressDto } from './common/dto/address.dto';
import { ValidatedAddressDto } from './common/dto/validatedAddress.dto';
import { LlmOrchestratorService } from './modules/llm/llm.service';
import { SourceCheckOrchestratorService } from './modules/source-check/source-check.service';
import { ParsingService } from './modules/parsing/parsing.service';
import { ConciliationService } from './modules/conciliation/conciliation.service';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AppService { 
  constructor(
    private readonly llm: LlmOrchestratorService,
    private readonly sourceCheck: SourceCheckOrchestratorService,
    private readonly parsing: ParsingService,
    private readonly conciliation: ConciliationService,
    private readonly logger: PinoLogger,
  ) {}

  async validateAddress(address: AddressDto): Promise<ValidatedAddressDto> {
    // 1) Parsing (baseline)
    const baseline = await this.parsing.validateAddressUsingParsing(address.address);
    this.logger.info(baseline, 'Baseline result');

    // 2) Source-check using original text and baseline
    const source = await this.sourceCheck.validateAddressUsingSource(address.address, baseline);
    this.logger.info(source, 'Source-check result');

    // 3) Conciliation between parsing and source-check
    const firstPass = await this.conciliation.reconcileWithMeta({
      original: address.address,
      baseline,
      source,
    });

    // If early-exit applied inside conciliation or all fields are resolved, return now
    if (firstPass.unresolvedFields.length === 0) {
      return firstPass.dto;
    }

    // 4) Escalate to LLM only for ambiguous cases per rules
    const llm = await this.llm.validateAddressUsingLLM(address.address, baseline);
    this.logger.info(llm, 'LLM result');

    // 5) When LLM is involved, convert LLM result to text and re-run source-check
    const llmText = this.formatAddressAsText(llm);
    const sourceAfterLlm = await this.sourceCheck.validateAddressUsingSource(llmText, llm);
    this.logger.info(sourceAfterLlm, 'Source-check result after LLM');

    // 6) Final conciliation: only LLM and (re)source-check are considered by service when LLM present
    const finalPass = await this.conciliation.reconcileWithMeta({
      original: address.address,
      baseline, // retained for context; service ignores parsing weights when llm is present
      source: sourceAfterLlm ?? source,
      llm,
    });

    return finalPass.dto;
  }

  // Convert a ValidatedAddressDto to a single-line textual address for source-check refetching
  private formatAddressAsText(dto: ValidatedAddressDto): string {
    return `${dto.street} ${dto.number ? String(dto.number) : ''}, ${dto.complement} - ${dto.city}, ${dto.state} - zip code ${dto.zipCode}`;
  }
}
