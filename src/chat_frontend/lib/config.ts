/**
 * Configuration for CipherNest Frontend
 * 
 * This file handles environment variables and configuration settings
 * for connecting to the Internet Computer and chat backend canister.
 */

export interface Config {
  chatBackendCanisterId: string;
  icHost: string;
  isProduction: boolean;
}

/**
 * Get the configuration from environment variables
 */
export function getConfig(): Config {
  // Get canister ID from environment variable
  const chatBackendCanisterId = process.env.NEXT_PUBLIC_CHAT_BACKEND_CANISTER_ID;
  
  if (!chatBackendCanisterId) {
    console.error(
      'NEXT_PUBLIC_CHAT_BACKEND_CANISTER_ID environment variable is not set.\n' +
      'Please set it to your chat_backend canister ID.\n' +
      'You can find it by running: dfx canister id chat_backend'
    );
    
    // Fallback to a placeholder for development
    // This will need to be replaced with the actual canister ID
    return {
      chatBackendCanisterId: 'rdmx6-jaaaa-aaaaa-aaadq-cai', // Placeholder
      icHost: 'http://localhost:4943',
      isProduction: false,
    };
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const icHost = process.env.NEXT_PUBLIC_IC_HOST || 
    (isProduction ? 'https://ic0.app' : 'http://localhost:4943');

  return {
    chatBackendCanisterId,
    icHost,
    isProduction,
  };
}

// Export a singleton config instance
export const config = getConfig();

export default config;
