import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';

const app = new Hono();

app.use(
    '/*',
    bearerAuth({
        verifyToken: async (token, c) => {
            const responce = await fetch('http://acme.127.0.0.1.sslip.io/auth/v1/users/me', {
                method: 'get',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            return responce.status === 200;
        },
    })
);

app.get('/', (c) => {
    return c.text('Hello Hono!');
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port,
});
