import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { SourceCheckProvider, SourceCheckResult } from '../core/source-check.types';
import type { ValidatedAddressDto } from '../../dto/validatedAddress.dto';

@Injectable()
export class GeoapifyProvider implements SourceCheckProvider {
  constructor(private readonly config: ConfigService) {}

  async checkAddress(original: string, hint?: ValidatedAddressDto): Promise<SourceCheckResult> {
    const apiKey = this.config.get<string>('GA_API_KEY');
    if (!apiKey) {
      return { hasError: true, message: 'Missing Geoapify API key', provider: 'geoapify', data: null };
    }

    try {
      const response = await axios.get('https://api.geoapify.com/v1/geocode/autocomplete', {
        params: {
          text: original,
          format: 'json',
          apiKey,
        },
      });

      return {
        hasError: false,
        message: null,
        provider: 'geoapify',
        data: response.data,
      };
    } catch (e: any) {
      const status = e?.response?.status ?? e?.status;
      const message = e?.response?.data ?? e?.message ?? e;
      console.error('Geoapify error:', status, message);
      return { hasError: true, message: 'Geoapify request failed', provider: 'geoapify', data: null };
    }
  }
}
