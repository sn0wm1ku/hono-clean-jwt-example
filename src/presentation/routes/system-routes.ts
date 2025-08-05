import { createFactory } from 'hono/factory'
import { serveStatic } from '@hono/node-server/serve-static'

// Create system routes with factory pattern (Hono best practice)
export const createSystemRoutes = () => {
  const factory = createFactory()
  const app = factory.createApp()

  // Static file serving middleware
  app.use('/static/*', serveStatic({ 
    root: './public',
    rewriteRequestPath: (path) => path.replace(/^\/static/, '')
  }))

  // Home endpoint handler using factory.createHandlers()
  const homeHandlers = factory.createHandlers(async (c) => {
    return c.redirect('/static/index.html')
  })

  // Health check handler using factory.createHandlers()
  const healthHandlers = factory.createHandlers(async (c) => {
    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    })
  })

  // System routes
  app.get('/', ...homeHandlers)
  app.get('/health', ...healthHandlers)

  return app
}
