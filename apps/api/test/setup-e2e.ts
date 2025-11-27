import { vi } from 'vitest';

// Setup para testes E2E - usa o banco real de teste
// Certifique-se de ter DATABASE_URL_TEST configurado no .env.test

// Aumentar timeout para testes E2E
vi.setConfig({ testTimeout: 30000 });

// Cleanup após todos os testes
afterAll(async () => {
  // Limpar conexões
});
