# Validation workflow
- Parsing
- Source check
- If conciliation between the two has low reliability, use LLM
- If LLM x Source check has low reliability, convert LLM result to text and use in Source check
- Compare final LLM x refetched Source check


# Rules
- For every field comparison, resort to levenshtein distance max 2, to make sure small typos don't interfere with comparison;
- Whenever possible, source check should take priority in having its values used for filling the final data, even if they have a match with other providers (due to levenshtein, source check is more prone to have the fields correctly spelled);
- All sources' fields should have a confidence value assigned to them. Part of this value should be if the field value is found in the original text (levenshtein max 2). The provider data should also have a general confidence level specifically accounting for how much new data (not existant in original text, levenshtein distance 2) is found;
- If parsing and source check have high match confidence, process ends and source check data is used as final result;
- If LLM is involved, the only data to be used from now on is LLM and source check, since LLM will count as a more efficient parser;
