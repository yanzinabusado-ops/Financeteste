import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Segurança: Prevenir acesso de outras máquinas em desenvolvimento
    host: 'localhost',
    // Adicionar headers de segurança
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },
  build: {
    // Melhorar segurança em produção
    sourcemap: false, // Não expor código fonte em produção
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remover console.logs em produção
        drop_debugger: true,
      },
    },
  },
});
