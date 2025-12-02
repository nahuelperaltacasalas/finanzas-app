import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the Finanzas App.
// This enables the React plugin so we can use JSX and React Fast Refresh
// during development.
export default defineConfig({
  plugins: [react()],
});