import path from "node:path";
import AutoLoad from "@fastify/autoload";
import cors from "@fastify/cors";
import { fileURLToPath } from "url";
import pino from "pino";
import websocket from "@fastify/websocket";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pass --options via CLI arguments in command to enable these options.
export const options = {
  abc: "def",
  logger: {
    timestamp: pino.stdTimeFunctions.isoTime,
  },
};

async function app(fastify, opts) {
  // Place here your custom code!
  fastify.register(cors, {
    origin: [
      "http://localhost:3001",
      "http://127.0.0.1:3001",
      "https://localhost:3001",
      "https://127.0.0.1:3001",
      "https://ft.ruisheng.me:8443",
    ],
  });

  await fastify.register(websocket, {
    options: {
      maxPayload: 5 * 1024 * 1024 + 1024, //Max messages size to 5 MB++ (include 1024 bytes buffer for JSON body)
    },
  });
  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: Object.assign({}, opts),
  });
}

export default app;
