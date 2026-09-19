import type { Server } from "node:net";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { ExtensionSession } from "./extension-fixture";

export function setupExtensionSuite() {
  let server: Awaited<ReturnType<typeof startGuideServer>> | undefined;
  const state = {
    extension: new ExtensionSession(),
    get server() {
      if (!server) {
        throw new Error("Guide server has not started");
      }
      return server;
    },
  };

  beforeAll(async () => {
    server = await startGuideServer();
  });

  // A new browser profile isolates cookies, storage, routes, permissions and
  // pending popup writes, including when the preceding test failed midway.
  beforeEach(async () => {
    state.extension = new ExtensionSession();
    await state.extension.start();
  });

  afterEach(async ({ task }) => {
    try {
      if (task.result?.state === "fail" && state.extension.context) {
        const directory = resolve("test-results", task.id);
        await mkdir(directory, { recursive: true });
        await writeFile(resolve(directory, "test.json"), JSON.stringify({ file: task.file.filepath, name: task.name }, null, 2));
        await state.extension.context.tracing.stop({ path: resolve(directory, "trace.zip") });
      }
    } finally {
      await state.extension.close();
    }
  });

  afterAll(async () => {
    await server?.close();
  });

  return state;
}

async function startGuideServer() {
  const server = createServer((request, response) => {
    response.setHeader("access-control-allow-origin", "*");
    response.setHeader("access-control-expose-headers", "*");
    response.setHeader("cache-control", "no-store");

    const url = new URL(request.url ?? "/", "http://localhost");
    if (url.pathname === "/response") {
      response.setHeader("x-guide-response", "original");
      response.setHeader("x-response-append", "original");
      response.setHeader("x-remove-response", "remove-me");
      response.end("response headers");
      return;
    }

    if (url.pathname === "/redirect-target") {
      response.setHeader("content-type", "text/html");
      response.end("<h1>redirect target</h1>");
      return;
    }

    if (url.pathname === "/allow-frame") {
      response.setHeader("content-type", "text/html");
      response.end("<script src=\"/blocked-child.js\"></script><h1>allowed frame</h1>");
      return;
    }

    if (url.pathname === "/blocked-child.js") {
      response.setHeader("content-type", "text/javascript");
      response.end("window.guideChildLoaded = true;");
      return;
    }

    if (url.pathname === "/inspect-script.js") {
      response.setHeader("content-type", "text/javascript");
      response.end(`window.e2eScriptHeader = ${JSON.stringify(request.headers["x-resource-type"] ?? null)};`);
      return;
    }

    if (url.pathname === "/frame") {
      response.setHeader("content-type", "text/html");
      response.end("<h1>child frame</h1>");
      return;
    }

    if (url.pathname === "/echo" || url.pathname.startsWith("/path/")) {
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({
        headers: request.headers,
        method: request.method,
        path: url.pathname,
      }));
      return;
    }

    response.setHeader("content-type", "text/html");
    response.end(`<h1>${url.pathname}</h1>`);
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Guide server did not bind to a TCP port");
  }
  const { port } = address;
  return {
    close: () => closeServer(server),
    localhostOrigin: `http://localhost:${port}`,
    loopbackOrigin: `http://127.0.0.1:${port}`,
  };
}
async function closeServer(server: Server) {
  await new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
}
