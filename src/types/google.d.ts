// src/types/google.d.ts
declare namespace google.accounts.oauth2 {
  interface TokenResponse {
    access_token: string;
    error?: string;
    expires_in: string;
    prompt: string;
    scope: string;
    state: string;
  }

  interface TokenClient {
    requestAccessToken(overrideConfig?: any): void;
  }

  function initTokenClient(config: {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
  }): TokenClient;
}

declare interface Window {
  google?: {
    accounts: {
      oauth2: typeof google.accounts.oauth2;
    };
  };
}

declare const gapi: any;
