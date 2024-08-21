const port = 3891;

export const config = {
  tenantId: 'app-tenant-id',
  clientId: 'app-client-id',
  clientSecret: 'app-client-secret',
  graphApiUrl: 'https://graph.microsoft.com/v1.0/me/onenote',
  port: port,
  redirectUri: `http://localhost:${port}/microsoft-authorize`
};
