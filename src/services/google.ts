// src/services/google.ts

const CLIENT_ID = '262522136132-jc3mikanhf0kqj0jm22vphr224l3sam7.apps.googleusercontent.com'; // TODO: Replace with actual Client ID
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

let tokenClient: google.accounts.oauth2.TokenClient;
let accessToken: string | null = null;

export const initGoogleAuth = (callback: (response: google.accounts.oauth2.TokenResponse) => void) => {
  if (window.google) {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error !== undefined) {
          throw (response);
        }
        accessToken = response.access_token;
        callback(response);
      },
    });
  } else {
    console.error('Google Identity Services script not loaded');
  }
};

export const requestAccessToken = () => {
  tokenClient.requestAccessToken();
};

export const getAccessToken = () => accessToken;

export const loadGoogleScript = () => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
    document.head.appendChild(script);
  });
};

export const loadGapiScript = () => {
    return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
             gapi.load('client', () => {
                resolve();
             });
        };
        script.onerror = () => reject(new Error('Failed to load GAPI script'));
        document.head.appendChild(script);
    });
}
