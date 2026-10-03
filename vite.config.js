import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'node:path';
export default defineConfig({plugins:[react()],base:'./',publicDir:'public',build:{rollupOptions:{input:{home:resolve(import.meta.dirname,'index.html'),downloads:resolve(import.meta.dirname,'downloads.html'),speaker:resolve(import.meta.dirname,'speaker.html'),concepts:resolve(import.meta.dirname,'concepts.html'),workflows:resolve(import.meta.dirname,'workflows.html'),tools:resolve(import.meta.dirname,'tools.html')}}}});
