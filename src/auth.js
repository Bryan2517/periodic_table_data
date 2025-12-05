// Google OAuth 2.0 Authentication using Google Identity Services
export const CLIENT_ID = "982479228273-chrjvpnqjktj752qmobu7p8eu1lkhbc7.apps.googleusercontent.com";

const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/userinfo.profile'
].join(' ');

let tokenClient = null;

/**
 * Initialize Google Sign-In
 * Sets up the OAuth token client for requesting Sheets API access
 * Creates the button immediately, initializes token client when Google is available
 */
export function initializeGoogleSignIn() {
  // Create button immediately so it's visible
  createSignInButton();

  // Initialize token client if Google is available
  if (typeof window.google !== 'undefined') {
    initTokenClient();
  } else {
    // Wait for Google to load, then initialize token client
    const checkGoogle = setInterval(() => {
      if (typeof window.google !== 'undefined') {
        clearInterval(checkGoogle);
        initTokenClient();
      }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => clearInterval(checkGoogle), 10000);
  }
}

/**
 * Initialize the OAuth token client
 */
function initTokenClient() {
  if (typeof window.google === 'undefined') {
    console.warn('Google Identity Services not available for token client initialization');
    return;
  }

  try {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: OAUTH_SCOPES,
      callback: handleTokenResponse,
    });
    console.log('Google token client initialized');
  } catch (error) {
    console.error('Error initializing token client:', error);
  }
}

/**
 * Handle OAuth token response
 * @param {Object} tokenResponse - Response from Google OAuth
 */
function handleTokenResponse(tokenResponse) {
  if (tokenResponse.error) {
    console.error('Token error:', tokenResponse.error);
    const errorMessage = tokenResponse.error === 'popup_closed_by_user' 
      ? 'Sign-in was cancelled. Please try again.'
      : `Sign-in failed: ${tokenResponse.error}`;
    alert(errorMessage);
    return;
  }
  
  // Dispatch event with access token
  const event = new CustomEvent('googleTokenReceived', {
    detail: {
      accessToken: tokenResponse.access_token,
    }
  });
  window.dispatchEvent(event);
}

/**
 * Create and render the custom Google Sign-In button
 */
function createSignInButton() {
  const buttonContainer = document.getElementById("google-signin-button");
  if (!buttonContainer) {
    console.warn('Sign-in button container not found');
    return;
  }

  // Don't recreate if button already exists
  if (buttonContainer.querySelector('.google-signin-custom')) {
    return;
  }

  buttonContainer.innerHTML = '';
  const button = document.createElement('button');
  button.className = 'google-signin-custom';
  button.type = 'button';
  button.setAttribute('aria-label', 'Sign in with Google');
  button.innerHTML = `
    <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g fill="#000" fill-rule="evenodd">
        <path d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z" fill="#EA4335"/>
        <path d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.21 1.18-.84 2.18-1.79 2.85l2.78 2.16c2.08-1.92 3.28-4.74 3.28-8.51z" fill="#4285F4"/>
        <path d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z" fill="#FBBC05"/>
        <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.78-2.16c-.76.53-1.78.9-3.18.9-2.38 0-4.4-1.57-5.12-3.74L.96 13.04C2.45 15.98 5.48 18 9 18z" fill="#34A853"/>
      </g>
    </svg>
    <span>Sign in with Google</span>
  `;
  
  button.addEventListener('click', handleButtonClick);
  
  buttonContainer.appendChild(button);
  console.log('Sign-in button created');
}

/**
 * Handle button click - request access token
 */
function handleButtonClick() {
  if (!tokenClient) {
    // Try to initialize token client if not already done
    if (typeof window.google !== 'undefined') {
      initTokenClient();
    } else {
      alert('Google Sign-In is still loading. Please wait a moment and try again.');
      return;
    }
  }

  if (!tokenClient) {
    alert('Unable to initialize Google Sign-In. Please refresh the page.');
    return;
  }

  try {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } catch (error) {
    console.error('Error requesting access token:', error);
    alert('An error occurred while signing in. Please try again.');
  }
}

