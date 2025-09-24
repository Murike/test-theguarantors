# Tech Test - theGuarantors' API for address validation

## Initializing

Node.js and Docker are required to run this project.

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
- Swagger


## Dev tools
- Windsurf for IDE
- Nest.js, practical and had some 
- Perplexity for general research
- Bruno for API testing


### Implementation
Data is processed by three different resources:
1. **Parsing** extract data as best as possible, quick and simple; Currently using **addressit**;
2. **Source data search** cross-references the results obtained with official data. Currently using **Geoapify**, with the address completion endpoint;
3. **Validation** uses previous data as guardrails to improve response from an LLM, to minimize allucinations. Currently using **GPT 3.5-turbo**;


#### Parsing
The [addressit](https://github.com/DamonOehlman/addressit) package can parse most properly typed strings, but quality falls steeply with missing context for the information provided. Numbers easily confused betweeen address and postcode, and names in random position can't be figured for street, city, etc. 


#### [Geoapify](https://www.geoapify.com/) search
Address completion had good results, costs 1 credit per address completion request (with 30000 credits in free tier, limited to 5 searches/second). This has yielded mostly good results for reasonably typed strings, much better than parsing but failing in cases of excessive typos to LLMs.


#### LLM Validation
Data sent to LLM in YAML to save on tokens (again, probably overkill in current use case). 


### Design Choices
Used Axios instead of OpenAI's own client because I intended to implement other requests as well. For time constraint reasons, I prefered to keep it only on OpenAI.

OpenAI prompt was added as code instead of a separate markdown to simplify bundling and limit container size, but with more complex prompts they could be used as templates (Handlebars package helps with that) to add the necessary dynamic values. That would also add the complexity of reading the files during the process.


### Costs

- GPT3.5-turbo - US$ 0.5 per x tokens; 
- Geoapify - 3,000 credits / day, each request for address completion counts as 1 credit, so there's plenty of room there in the free tier;




