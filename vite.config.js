import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Serve /login from public/login.html in `vite dev` / `vite preview`, the
// same way Vercel's cleanUrls does in production.
const loginPage = () => {
  const rewrite = (req, _res, next) => {
    if (req.url === '/login' || req.url.startsWith('/login?')) req.url = req.url.replace('/login', '/login.html')
    next()
  }
  return {
    name: 'login-page',
    configureServer: (server) => server.middlewares.use(rewrite),
    configurePreviewServer: (server) => server.middlewares.use(rewrite),
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [loginPage(), react(), tailwindcss()],
})
