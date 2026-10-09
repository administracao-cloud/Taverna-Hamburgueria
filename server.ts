import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json());

  // Mercado Pago API Validation Proxy Route
  app.post('/api/mercadopago/validate', async (req, res) => {
    try {
      const { accessToken } = req.body;
      if (!accessToken || typeof accessToken !== 'string' || accessToken.trim() === '') {
        return res.status(400).json({ success: false, error: 'Access Token não fornecido.' });
      }

      // If it's a test/example token
      if (accessToken.includes('EXAMPLE') || accessToken.includes('TEST-ACCESS-TOKEN')) {
        return res.json({
          success: true,
          mode: 'test',
          user: { nickname: 'Taverna Burger (Modo Teste)' }
        });
      }

      const response = await fetch('https://api.mercadopago.com/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken.trim()}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(400).json({
          success: false,
          error: data.message || data.error || 'Token inválido ou sem permissões suficientes.'
        });
      }

      return res.json({
        success: true,
        mode: 'production',
        user: {
          id: data.id,
          nickname: data.nickname || data.first_name || 'Conta Mercado Pago',
          email: data.email
        }
      });
    } catch (err: any) {
      console.error('Erro ao validar token do Mercado Pago:', err);
      return res.status(500).json({ success: false, error: err.message || 'Erro interno ao validar credenciais.' });
    }
  });

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
