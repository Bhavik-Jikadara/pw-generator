// src/config/environment.js

// Development mode check (can be adjusted based on your build setup)
export const isDevelopment = false;

// Base configuration
const baseConfig = {
  development: {
    apiUrl: 'http://localhost:8080',
    environment: 'development'
  },
  production: {
    apiUrl: 'https://your-production-url.com',
    environment: 'production'
  }
};

// Export the configuration based on environment
export const config = baseConfig[isDevelopment ? 'development' : 'production'];