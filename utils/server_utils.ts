// utils/ws_utils.tsx
import { WebSocketServer, WebSocket } from 'ws';
import { fetchEc2Instances } from './ec2_utils';
import { fetchS3Settings } from './s3_utils';
import { Pool } from "pg";

export const pgPool = new Pool({
  user: process.env.PG_USER ?? "pg",
  host: process.env.PG_HOST ?? "db",
  database: process.env.PG_DB ?? "test",
  password: process.env.PG_PASSWORD ?? "test1234",
  port: Number(process.env.PG_PORT ?? 5432),
});

//invoke instance so that you can use it in many places
const wss = new WebSocketServer({port: 8085});
// keep last broadcast payload to avoid sending unchanged data
let lastBroadcastPayload = '';

// on initial render - better to split these two and they also serve a different scenario, although using the same fetch
const startWSServer = () => {
  wss.on('connection', async (ws: WebSocket) => {

    const message = await buildPayload();
    //sent as string
    ws.send(message);

    // update lastBroadcastPayload so subsequent broadcasts know current state
    lastBroadcastPayload = message;

    ws.on('close', () => {
      console.log('web socket client disconnected')
    })
  });
}

//broadcast to all the clients - called with a interval again and again
const broadcastUpdates = async () => {
  // don't make AWS calls if no clients connected
  if (wss.clients.size === 0) return;

    const message = await buildPayload();

  // only broadcast when something changed
  if (message === lastBroadcastPayload) return;

  lastBroadcastPayload = message;
  //array of clients, objects
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

const buildPayload = async () => {
  const [instances, maxFileSizeMb] = await Promise.all([
    fetchEc2Instances(),
    fetchS3Settings(),
  ]);

  return JSON.stringify({ instances, maxFileSizeMb });
};

//start server once in render and fetch and send periodically
startWSServer();
setInterval(broadcastUpdates, 5000);