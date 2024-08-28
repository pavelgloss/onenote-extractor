export const userPrompts = {
  v4RewrittenWithClaude: (pageContent: string): string => `
Analyze content of onenote page (note). Define categories like business, product management, buy books, product idea, ai courses, dev learn and much more, according to what is the content of the note.

Figure out if note contains some project/project idea, MVP or business idea/concept, or experiment to validate or measure market demand of some product idea.
I am really interested in collecting all product and business ideas, which might be vital to build some SaaS product (it can be micro SaaS) or build a company. 
Identify such notes with businessPriority 0 to 100 (100 means it definitely contains information about some potential project / saas product to be build / business to try / experiment / mvp to build). 

Many notes combines a lot of topics, urls, snippets etc. Determine chaotic level from 0 to 100 (0 is just one topic, very structured note, 100 is very chaotic with many topics combined.
Put effort into recognizing if note contains mention about AI, LLM, language models, ai agents, gpt, openai, etc. and classify it as AI related note with field "aiRelated" set to true (or false otherwise).

Output will be json object. Analysis explanation (or any messages related to) classification / businessPriority / aiRelatedInfo / chaoticLevel / classificationInfo / businessPriorityInfo / aiRelatedInfo / chaoticLevelInfo will be provided in the output json object in dedicated fields.
If there is no mention of AI, LLM, or related technologies in the note, keep "aiRelatedInfo" field empty "".

IMPORTANT: Create a complete and structured response in json format. You MUST include ALL specified fields: classification, businessPriority, aiRelated, chaoticLevel, classificationInfo, businessPriorityInfo, aiRelatedInfo, chaoticLevelInfo. Partial updates or placeholders like 'rest of fields here' are STRICTLY FORBIDDEN. Failure to provide a complete response with all required fields will result in an invalid and unusable output.

Example of correct output:
{"classification": ["product management", "business", "developer tools"],
"businessPriority": 50,
"aiRelated": true,
"chaoticLevel": 80,
"classificationInfo": "The note discusses job advertisements and provides critical commentary on their content, which fits into business and job market analysis. Additionally, it reflects on how job postings may influence potential candidates, which can relate to product management in terms of human resources tools or SaaS job platforms.",
"businessPriorityInfo": "Set to 70 because the note indicates ongoing development (Admin console features, coding requirements) that could lead towards an MVP for a business product. It shows significant potential for realizing an idea, with enough structure to suggest its viability in a SaaS context.",
"aiRelatedInfo": "The note mentions machine learning algorithms for job matching, indicating AI-related content.",
"chaoticLevelInfo": "Rated 60. While it does contain several topics, they are related and structured around the development of an admin console, which gives the note some cohesion despite having various details mentioned."}

Example of wrong output1 - not all fields are present (INVALID):
{"classification": ["product management", "business", "developer tools"],
"businessPriority": 50,
"aiRelated": false}

Example of wrong output2 - additional textual message mixed with json object (INVALID):
some explanation or additional message instead of solo json object, {"classification": ["product management", "business", "developer tools"],
"businessPriority": 50,
"chaoticLevel": 80}

Example of wrong output3 - incomplete fields or placeholders (INVALID):
{"classification": ["product management", "business", "developer tools"],
"businessPriority": 50,
"aiRelated": true,
"chaoticLevel": 80,
"classificationInfo": "The note discusses job advertisements...",
"businessPriorityInfo": "Set to 70 because...",
"aiRelatedInfo": "...",
"chaoticLevelInfo": "Rated 60..."}

WARNING: Providing incomplete responses or using placeholders will result in unusable output and may lead to errors in subsequent processing. Always ensure that your response is complete and includes all required fields with full information.

Input note content for processing:
"""
${pageContent}
"""`,

  // ===========================================================================================================

  v3: (pageContent: string): string => `
Analyze content of onenote page (note). Define categories like business, product management, buy books, product idea, ai courses, dev learn and much more, according to what is the content of the note.

Figure out if note contains some project/project idea, MVP or business idea/concept, or experiment to validate or measure market demand of some product idea.
I am really interested in collecting all product and business ideas, which might be vital to build some SaaS product (it can be micro SaaS) or build a company. 
Identify such notes with businessPriority 0 to 100 (100 means it definitely contains information about some potential project / saas product to be build / business to try / experiment / mvp to build). 

Many notes combines a lot of topics, urls, snippets etc. Determine chaotic level from 0 to 100 (0 is just one topic, very structured note, 100 is very chaotic with many topics combined.
Put effort into recognizing if note contains mention about AI, LLM, language models, ai agents, gpt, openai, etc. and classify it as AI related note with field "aiRelated" set to true (or false otherwise).

Output will be json object. Analysis explanation (or any messages related to) classification / businessPriority / aiRelatedInfo / chaoticLevel / classificationInfo / businessPriorityInfo / aiRelatedInfo / chaoticLevelInfo will be provided in the output json object in dedicated fields.
If there is no mention of AI, LLM, or related technologies in the note, keep "aiRelatedInfo" field empty "".

Create a structured response in json format with always provided fields: classification, businessPriority, aiRelated, chaoticLevel, classificationInfo, businessPriorityInfo, aiRelatedInfo, chaoticLevelInfo.
Example of correct output:
{"classification": ["product management", "business", "developer tools"],
"businessPriority": 50,
"aiRelated": true,
"chaoticLevel": 80,
"classificationInfo": "The note discusses job advertisements and provides critical commentary on their content, which fits into business and job market analysis. Additionally, it reflects on how job postings may influence potential candidates, which can relate to product management in terms of human resources tools or SaaS job platforms.",
"businessPriorityInfo": "Set to **70** because the note indicates ongoing development (Admin console features, coding requirements) that could lead towards an MVP for a business product. It shows significant potential for realizing an 
idea, with enough structure to suggest its viability in a SaaS context.",
"aiRelatedInfo": explanation or additional message, only if it is ai related,
"chaoticLevelInfo": "Rated **60**. While it does contain several topics, they are related and structured around the development of an admin console, which gives the note some cohesion despite having various details mentioned."}

Example of wrong output1 - not all fields are present:
{"classification": ["product management", "business", "developer tools"],
"businessPriority": 50,
"aiRelated": false}

Example of wrong output2 - addditional textual message mixed with json object:
some explanation or additional message instead of solo json object, {"classification": ["product management", "business", "developer tools"],
"businessPriority": 50,
"chaoticLevel": 80}

Input note content for processing:
"""
${pageContent}
"""`,

  // ===========================================================================================================

  v2: (pageContent: string): string => `
Analyze content of onenote page (note). Define categories like business, product management, buy books, product idea, ai courses, dev learn and much more, according to what is the content of the note.

Figure out if note contains some project/project idea, MVP or business idea/concept, or experiment to validate or measure market demand of some product idea.
I am really interested in collecting all product and business ideas, which might be vital to build some SaaS product (it can be micro SaaS) or build a company. 
Identify such notes with businessPriority 0 to 100 (100 means it definitely contains information about some potential project / saas product to be build / business to try / experiment / mvp to build). 

Many notes combines a lot of topics, urls, snippets etc. Determine chaotic level from 0 to 100 (0 is just one topic, very structured note, 100 is very chaotic with many topics combined.
Put effort into recognizing if note contains mention about AI, LLM, language models, ai agents, gpt, openai, etc. and classify it as AI related note with field "aiRelated" set to true (or false otherwise).

Output will be json object. Analysis explanation (or any messages related to) classification / businessPriority / aiRelatedInfo / chaoticLevel / classificationInfo / businessPriorityInfo / aiRelatedInfo / chaoticLevelInfo will be provided in the output json object in dedicated fields.

Create a structured response in json format with always provided fields: classification, businessPriority, aiRelated, chaoticLevel, classificationInfo, businessPriorityInfo, aiRelatedInfo, chaoticLevelInfo.
Example of correct output:
{"classification": ["product management", "business", "developer tools"],
"businessPriority": 50,
"aiRelated": true,
"chaoticLevel": 80,
"classificationInfo": "The note discusses job advertisements and provides critical commentary on their content, which fits into business and job market analysis. Additionally, it reflects on how job postings may influence potential candidates, which can relate to product management in terms of human resources tools or SaaS job platforms.",
"businessPriorityInfo": "Set to **70** because the note indicates ongoing development (Admin console features, coding requirements) that could lead towards an MVP for a business product. It shows significant potential for realizing an 
idea, with enough structure to suggest its viability in a SaaS context.",
"aiRelatedInfo": some explanation or additional message,
"chaoticLevelInfo": "Rated **60**. While it does contain several topics, they are related and structured around the development of an admin console, which gives the note some cohesion despite having various details mentioned."}

Example of wrong output1 - not all fields are present:
{"classification": ["product management", "business", "developer tools"],
"businessPriority": 50,
"aiRelated": false}

Example of wrong output2 - addditional textual message mixed with json object:
some explanation or additional message instead of solo json object, {"classification": ["product management", "business", "developer tools"],
"businessPriority": 50,
"chaoticLevel": 80}

Input note content for processing:
"""
${pageContent}
"""`,

  // ===========================================================================================================

  v1: (pageContent: string): string => `
xxx
`,


};
