import { Hono } from "jsr:@hono/hono";
import { serveStatic } from "jsr:@hono/hono/deno";
const app = new Hono();

app.use("/*", serveStatic({ root: "../dist" }));
app.use("/favicon.ico", serveStatic({ path: "../dist/favicon.ico" }));
// app.get("/", (c) => c.text("Hono!"));
// app.get("/", serveStatic({ path: "./static/index.html" }));

// export default app;
Deno.serve(app.fetch);
