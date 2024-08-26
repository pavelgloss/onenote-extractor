How to build the project
---

1) npm install
2) rename config.sample.ts to config.ts and fill your credentials
3) "npm run start"  (which runs ts-node)


- tenantId, clientId and clientSecret are the values you got from registering the app in Azure AD
- redirectUri and port is the for server app listening for authorization callbacks where user will be redirected after authorizing the app via OAuth2


Output of notes analysis:
---


```json
...
{
  "classification": ["product management", "business", "developer tools"],
  "businessPriority": 60,
  "aiRelated": false,
  "chaoticLevel": 65,
  "classificationInfo": "The note focuses on the development of an admin console, including various tasks like image upload, code organization, and environment setup, all of which align with product management and developer tools.",
  "businessPriorityInfo": "Set to **60** because the note contains actionable items and ideas related to building a software product (admin console), though it lacks detail on market validation or customer engagement, indicating potentiality for an MVP.",
  "aiRelatedInfo": "The note does not mention terms related to AI, LLM, or similar, leading to a classification of false for AI-related content.",
  "chaoticLevelInfo": "Rated **65**. The note has multiple related topics around product development but lacks a cohesive structure, presenting various technical details that contribute to the perception of chaos."
},
{
  "classification": ["product idea", "web development"],
  "businessPriority": 30,
  "aiRelated": false,
  "chaoticLevel": 20,
  "classificationInfo": "The note briefly mentions an editor similar to Codecademy, suggesting it could be a web-based product idea focused on providing coding education or tools for developers.",
  "businessPriorityInfo": "Set to **30** because while it hints at a potential product idea related to coding education, it lacks concrete details or an associated MVP concept.",
  "aiRelatedInfo": "The note does not mention any AI concepts, tools, or technologies.",
  "chaoticLevelInfo": "Rated **20**. The note is relatively structured, focusing on a single product idea without significant deviation into unrelated topics."
}
```
and is stored in document database

TODO
---------------------

version and test analyzed result

connectors / integrations
  - evernote connector
  - notion
  - obsidian local file
  - obsidian api
  - onenote connector (done)

get refresh token  (AAA)
  problem is that access token works for one hour only 
  and the response (when exchanging auth code for access token) dont contain refresh token

use expand
  according to https://devblogs.microsoft.com/microsoft365dev/onenote-api-throttling-and-how-to-avoid-it/
  there is a better way to get all notebooks and its sections, instead of recursive iteration
  use expand and reduce network roundtrips

  https://learn.microsoft.com/en-us/graph/onenote-best-practices
  
  Call GET ~/api/v1.0/me/notes/notebooks?$expand=sections,sectionGroups($expand=sections)

try note tags
```
    <p data-tag="to-do:completed" data-id="prep">Till garden bed</p>
    <p data-tag="to-do" data-id="spring">Plant peas and spinach</p>
    <p data-tag="to-do" data-id="summer">Plant tomatoes and peppers</p>
```
