How to build the project
--------------------------

1) npm install
2) rename config.sample.ts to config.ts and fill your credentials
3) "npm run start"  (which runs ts-node)


- tenantId, clientId and clientSecret are the values you got from registering the app in Azure AD
- redirectUri and port is the for server app listening for authorization callbacks where user will be redirected after authorizing the app via OAuth2


TODO
---------------------

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
