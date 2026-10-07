import { Hono } from "hono";

export const app = new Hono()

app.get('/', (c) => {
    return c.json({
        name: "trackdawear",
        status: "running"
    });
});

app.get('/health', (c) =>{
    return c.json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
} );
export default app