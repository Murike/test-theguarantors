import axios from 'axios';
import { ValidatedAddressDto } from '../dto/validatedAddress.dto';
import { openaiAddressPrompt } from './openai.prompt';

export async function extractAddressLLM(input: ValidatedAddressDto, original: string) {
  try {
    const apiKey = process.env.OA_API_KEY;
    if (!apiKey) {
      console.warn('apiKey is not set in the environment.');
      return '';
    }

    const requestData = {
        model: process.env.OA_MODEL,
        input: openaiAddressPrompt(JSON.stringify(input), original)
    };
      
    const response = await axios.post('https://api.openai.com/v1/responses', requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      })

    const data = response.data as any;
    const { billing, status, model, usage, output } = data;
    
    // console.log(`######################################### ${status}, ${model}`);
    console.log('######################################### billing: ', billing);
    // console.log('######################################### usage: ', usage);
    // console.log('######################################### output: ', output);
    console.log("########################################## RESPONSE: ", output[0].content[0]);
    console.log("########################################## FINAL JSON: ", JSON.parse(output[0].content[0].text));

    if (Array.isArray(data)) {
      return (
        data[0]?.generated_text ?? data[0]?.summary_text ?? data[0]?.text ?? ''
      );
    }
    return data?.generated_text ?? data?.summary_text ?? data?.text ?? '';
  } catch (e: any) {
    const status = e?.response?.status ?? e?.status;
    const message = e?.response?.data ?? e?.message ?? e;
    console.error('LLM processing error:', status, message);
    return '';
  }
}
