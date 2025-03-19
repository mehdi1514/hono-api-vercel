import { Hono } from 'hono';
import { z } from 'zod';

const productApp = new Hono();

// Define a product interface (for type safety)
interface Product {
    id: number;
    name: string;
    description: string; // Description is now required
    price: number;
}

// Hardcoded product data (simulating a database)
let products: Product[] = [
    { id: 1, name: 'Product 1', description: 'Description for Product 1', price: 10.99 },
    { id: 2, name: 'Product 2', description: 'Description for Product 2', price: 24.50 },
    { id: 3, name: 'Product 3', description: 'Description for Product 3', price: 5.99 },
];

// Product ID counter (to simulate auto-incrementing IDs)
let nextProductId = 4;

// Zod schema for product validation
const productSchema = z.object({
    name: z.string().min(1),
    description: z.string(), // Description is now required in the schema
    price: z.number().positive(),
});

// --- Routes ---

// GET all products
productApp.get('/', (c) => {
    return c.json(products);
});

// GET a single product by ID
productApp.get('/:id', (c) => {
    const id = parseInt(c.req.param('id'));
    const product = products.find((p) => p.id === id);

    if (!product) {
        return c.json({ message: 'Product not found' }, 404);
    }

    return c.json(product);
});

// CREATE a new product
productApp.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const validatedData = productSchema.parse(body);

        const newProduct: Product = {
            id: nextProductId++,
            ...validatedData,
        };

        products.push(newProduct);
        return c.json(newProduct, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ message: 'Validation error', errors: error.errors }, 400);
        }
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// EDIT an existing product
productApp.put('/:id', async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        const body = await c.req.json();
        const validatedData = productSchema.parse(body);

        const productIndex = products.findIndex((p) => p.id === id);

        if (productIndex === -1) {
            return c.json({ message: 'Product not found' }, 404);
        }

        products[productIndex] = {
            id,
            ...validatedData,
        };

        return c.json(products[productIndex]);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ message: 'Validation error', errors: error.errors }, 400);
        }
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// DELETE a product
productApp.delete('/:id', (c) => {
    const id = parseInt(c.req.param('id'));
    const productIndex = products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
        return c.json({ message: 'Product not found' }, 404);
    }

    products.splice(productIndex, 1);
    return c.json({ message: 'Product deleted' });
});

export default productApp;