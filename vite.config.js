import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import https from 'https'

function readEnvLocal() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local')
    const contents = fs.readFileSync(envPath, 'utf8')
    const match = contents.match(/ANTHROPIC_API_KEY=(.+)/)
    return match ? match[1].trim() : null
  } catch {
    return null
  }
}

const anthropicKey = readEnvLocal()

if (!anthropicKey) {
  console.warn('WARNING: ANTHROPIC_API_KEY not found in .env.local')
} else {
  console.log('OK: ANTHROPIC_API_KEY loaded for proxy')
}

function anthropicProxyPlugin(apiKey) {
  return {
    name: 'anthropic-proxy',
    configureServer(server) {
      server.middlewares.use('/api/anthropic', (req, res) => {
        const targetPath = req.url === '/' ? '/v1/messages' : req.url

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          const bodyBuffer = Buffer.from(body, 'utf8')

          const options = {
            hostname: 'api.anthropic.com',
            path: targetPath,
            method: req.method,
            headers: {
              'content-type': 'application/json',
              'content-length': bodyBuffer.length,
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
          }

          console.log(`[anthropic-proxy] → ${options.method} ${options.hostname}${options.path}`)

          const proxyReq = https.request(options, proxyRes => {
            console.log(`[anthropic-proxy] ← status ${proxyRes.statusCode}`)

            // Collect full response then send — avoids pipe/flush issues
            const chunks = []
            proxyRes.on('data', chunk => chunks.push(chunk))
            proxyRes.on('end', () => {
              const responseBody = Buffer.concat(chunks)
              console.log(`[anthropic-proxy] ← ${responseBody.length} bytes received`)

              res.writeHead(proxyRes.statusCode, {
                'content-type': 'application/json',
                'content-length': responseBody.length,
                'access-control-allow-origin': '*',
              })
              res.end(responseBody)
            })
          })

          proxyReq.on('error', err => {
            console.error('[anthropic-proxy] error:', err.message)
            res.writeHead(500, { 'content-type': 'application/json' })
            res.end(JSON.stringify({ error: err.message }))
          })

          proxyReq.write(bodyBuffer)
          proxyReq.end()
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    anthropicProxyPlugin(anthropicKey),
  ],
  server: {
    host: true
  },
})