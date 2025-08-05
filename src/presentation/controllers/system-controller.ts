import type { Context } from 'hono'

// Pure functional system controller
export const createSystemController = () => ({
  health: (c: Context) => {
    return c.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    })
  },

  home: (c: Context) => {
    return c.redirect('/static/index.html')
  }
})
