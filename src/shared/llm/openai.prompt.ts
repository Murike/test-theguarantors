
export const openaiAddressPrompt = (parsed: string, original: string) => `Your job is to check a data format 
and analyze the complete address embedded in it. There is some level of pre-formating in it, but the expectation 
is to validate and extract any pending information, according to the format below. It should be a single line, stringified JSON in this format:
[{
    street,
    complement,
    neighbourhood,
    number,
    city,
    state,
    zipCode,
    type,
    validationStatus
}]

complement: Any additional information to the street name
Type: house or apartment
validationStatus: 'unverifiable' if address couldn't be fully figured; 'corrected' if small adjustments were made (typos, additional data); or 'valid'. 
Invalidate if address outside US.

For any error or unexpected behaviour, response format should be a json string with a 'error' key and a 'message' key. That includes if address is not USA.
Your answer should be only a json string formatted according to definition above, no code markdown formatting or anything. Parsed input data to analyze is below: 
${parsed}

Raw input data is: ${original}`;