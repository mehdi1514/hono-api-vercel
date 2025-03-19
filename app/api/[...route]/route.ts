import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import productApp from './products';

export const runtime = 'nodejs'

const app = new Hono().basePath('/api');

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello from Hono!'
  })
});

app.route('/products', productApp);
export const GET = handle(app)
