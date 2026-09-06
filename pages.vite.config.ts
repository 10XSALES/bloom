import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath } from 'node:url';
export default defineConfig({
 root:fileURLToPath(new URL('./pages',import.meta.url)),
 base:'/bloom/',
 publicDir:fileURLToPath(new URL('./public',import.meta.url)),
 plugins:[react()],
 resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url))}},
 css:{postcss:{plugins:[tailwindcss()]}},
 build:{outDir:fileURLToPath(new URL('./dist-pages',import.meta.url)),emptyOutDir:true,sourcemap:false}
});
