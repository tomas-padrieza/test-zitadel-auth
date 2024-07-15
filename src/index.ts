import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';

const app = new Hono();

const users: Record<string, any> = {
    '276071138566602755': {
        permissions: ['user'],
    },
    '01j2v273vq5wf4yhnw5sgb97sv': {
        permissions: ['user', 'admin'],
    },
};

async function verifyToken(token: string, tenantId: string, permission: string) {
    const response = await fetch(`http://${tenantId}.127.0.0.1.sslip.io/auth/v1/users/me`, {
        method: 'get',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status !== 200) {
        return false;
    }

    const data = await response.json();

    return users[data.user.id].permissions.indexOf(permission) !== -1;
}

app.use(
    '/admin/*',
    bearerAuth({
        verifyToken: async (token, c) => {
            // TODO: typebox transforms/checks
            const { payload } = await c.req.json();

            return verifyToken(token, payload.tenantId, 'admin');
        },
    })
);

app.use(
    '/user/*',
    bearerAuth({
        verifyToken: async (token, c) => {
            // TODO: typebox transforms/checks
            const { payload } = await c.req.json();

            return verifyToken(token, payload.tenantId, 'user');
        },
    })
);

app.post('/user', (c) => {
    return c.text('Hello User!');
});

app.post('/admin', (c) => {
    return c.text('Hello Admin!');
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port,
});
