import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();

  // In development, the AI Studio proxy routes external traffic to port 3000.
  // In deployed Cloud Run production, Cloud Run injects process.env.PORT (e.g. 8080).
  const PORT =
    process.env.NODE_ENV === 'production' && process.env.PORT
      ? parseInt(process.env.PORT, 10)
      : 3000;

  // Basic middleware
  app.use(express.json());

  // Health check endpoint for Cloud Run readiness & liveness probes
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  const findPublicOrDistFile = (relPath: string): string | null => {
    const cleanRel = relPath.replace(/^\/+/, '');
    const publicPath = path.join(process.cwd(), 'public', cleanRel);
    if (fs.existsSync(publicPath)) return publicPath;
    const distPath = path.join(process.cwd(), 'dist', cleanRel);
    if (fs.existsSync(distPath)) return distPath;
    return null;
  };

  const servePngFile = (filename: string) => (_req: express.Request, res: express.Response) => {
    const filePath = findPublicOrDistFile(filename);
    if (filePath) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.sendFile(filePath);
    } else {
      res.status(404).type('text/plain').send('Icon not found');
    }
  };

  // 1. Explicit PWA Icon routes directly returning image/png content
  app.get('/icon-192.png', servePngFile('icon-192.png'));
  app.get('/icon-512.png', servePngFile('icon-512.png'));
  app.get('/icon-maskable-512.png', servePngFile('icon-maskable-512.png'));
  app.get('/apple-touch-icon.png', servePngFile('apple-touch-icon.png'));
  app.get('/screenshot-wide.png', servePngFile('screenshot-wide.png'));
  app.get('/screenshot-narrow.png', servePngFile('screenshot-narrow.png'));

  // 2. Direct PWA Service Worker & Manifest routes with correct headers
  app.get('/sw.js', (_req, res) => {
    const swPath = findPublicOrDistFile('sw.js');
    if (swPath) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(swPath);
    } else {
      res.status(404).type('text/plain').send('Service worker not found');
    }
  });

  app.get('/manifest.json', (_req, res) => {
    const manifestPath = findPublicOrDistFile('manifest.json');
    if (manifestPath) {
      res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.sendFile(manifestPath);
    } else {
      res.status(404).type('text/plain').send('Manifest not found');
    }
  });

  // 3. Catch-all image router: ensure requests for image files directly return image content and NEVER fall back to index.html
  app.get(/\.(png|jpe?g|svg|ico|webp|gif)$/i, (req, res) => {
    const filePath = findPublicOrDistFile(req.path);
    if (filePath) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
      };
      res.setHeader('Content-Type', mimeTypes[ext] || 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.sendFile(filePath);
    } else {
      res.status(404).type('text/plain').send('Image not found');
    }
  });

  // Serve static assets from public/ directory
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware in dev; static file serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      // Prevent static assets or images from falling back to index.html
      if (path.extname(req.path)) {
        res.status(404).type('text/plain').send('File not found');
        return;
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
