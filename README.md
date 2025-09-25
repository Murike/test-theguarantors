# Tech Test - theGuarantors' API for address validation

## Initializing

Node.js and Docker are required to run this project. OpenAI LLM processing requires api key (variable `OA_API_KEY`), model can be changed by adding name in `OA_MODEL`, and Geoapify requires api key (variable `GA_API_KEY`). Service runs without those, but depends on parsing alone, which works poorly unless text is very well formated.

```bash
$ npm run docker:start
```

The API will be available at http://localhost:3000.


## Stack
- NestJS
- TypeScript
- Zod
- Docker
- Webpack
- Swagger/OpenAPI


## Dev tools
- Windsurf for IDE
- Perplexity for general research
- Bruno for API testing


## Implementation
Data is processed by three different resources:
1. **Parsing** extract data as best as possible, quick and simple; Currently using **addressit**;
2. **Source data search** cross-references the results obtained with official data. Currently using **Geoapify**, with the address completion endpoint;
3. **Validation** uses previous data as guardrails to improve response from an LLM, to minimize allucinations. Currently using **GPT 3.5-turbo**;


### Parsing
The [addressit](https://github.com/DamonOehlman/addressit) package can parse most properly typed strings, but quality falls steeply with missing context for the information provided. Numbers easily confused betweeen address and postcode, and names in random position can't be figured for street, city, etc. 

- node-postal - overly complex installation and requirements;
- @zerodep/address-parse - worse results than addressit;


### [Geoapify](https://www.geoapify.com/) search
Address completion had good results, costs 1 credit per address completion request (with 30000 credits in free tier, limited to 5 searches/second). This has yielded mostly good results for reasonably typed strings, much better than parsing but failing in cases of excessive typos to LLMs.


### LLM Validation
Originally considered gpt-3.5-turbo, but gpt-4o-mini had better performance and cost. Data sent to LLM in YAML to save on tokens (probably overkill, but worth the exercise).
Actual model can be changed by updating the environment variable `OA_MODEL`, but defaults to gpt-4o-mini. API key still expected to be in `OA_API_KEY`.


## Design Choices
Used Axios instead of OpenAI's own client because I intended to implement other requests as well. For time constraint reasons, I prefered to keep it only on OpenAI.

OpenAI prompt was added as code instead of a separate markdown to simplify bundling and limit container size, but with more complex prompts they could be used as templates (Handlebars package helps with that) to add the necessary dynamic values. That would also add the complexity of reading the files during the process.


## Costs
- gpt-4o-mini - US$ 0.5 per x tokens; 
- Geoapify - 3,000 credits / day, each request for address completion counts as 1 credit, so there's plenty of room there in the free tier;




Google (Address) and Anthropic are stubs for possible alternatives to the services used.


