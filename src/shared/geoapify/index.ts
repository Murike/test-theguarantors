import axios from 'axios';
import { ValidatedAddressDto } from '../dto/validatedAddress.dto';

export async function confirmAddressGeoapify(input: ValidatedAddressDto, original: string) {
  try {
    const apiKey = process.env.GA_API_KEY;
    if (!apiKey) {
      console.warn('apiKey is not set in the environment.');
      return '';
    }
      
    // POSTCODE SEARCH
    // const response = await axios.get(`https://api.geoapify.com/v1/postcode/search?postcode=${77845}&countrycode=us&geometry=original&apiKey=${apiKey}`)
    
    const response = await axios.get(`https://api.geoapify.com/v1/geocode/autocomplete`,
    {
        params: { 
            text: original,
            format: 'json',
            apiKey: apiKey
            }
    });


    console.log("########################################## RESPONSE: ", response.data);
    // console.log("########################################## RESPONSE: ", response.data.features[0].properties);

    return ''
  } catch (e: any) {
    const status = e?.response?.status ?? e?.status;
    const message = e?.response?.data ?? e?.message ?? e;
    console.error('LLM processing error:', status, message);
    return '';
  }
}
