export const userPrompts = {
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
  // ***********************************************************************************************************

  v1: (pageContent: string): string => `
xxx
`,


};
