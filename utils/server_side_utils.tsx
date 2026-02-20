//.utils/server_side_utils.tsx
import fs from 'fs';
import path from 'path';
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
//in server side you need to import these
import { WebSocketServer, WebSocket } from 'ws';
import { Client } from 'pg';

export interface InitialServerSideInstance {
  instanceID: string;
  name: string | 'N/A';
  status: string | 'N/A';
  publicIP: string | "N/A";
  privateIP: string | "N/A";
}

export const pgClient = new Client({
  user: process.env.PG_USER ?? "pg",
  host: process.env.PG_HOST ?? "db",
  database: process.env.PG_DB ?? "test",
  password: process.env.PG_PASSWORD ?? "test1234",
  port: Number(process.env.PG_PORT ?? 5432),
});

export const connectPG = async () => {
    await pgClient.connect();
    (pgClient as any)._connected = true; // optional flag to track connection
};

export const queryPG = async (sql: string, values?: any[]) => {
  await connectPG();
  return pgClient.query(sql, values);
};

//invoke instance so that you can use it in many places
const wss = new WebSocketServer({port: 8085});
// keep last broadcast payload to avoid sending unchanged data
let lastBroadcastPayload = '';

// on initial render - better to split these two and they also serve a different scenario, although using the same fetch
const startWSServer = () => {
  wss.on('connection', async (ws: WebSocket) => {

    const instances = await fetchEc2Instances();
    //sent as string
    const message = JSON.stringify(instances);
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

  const instances = await fetchEc2Instances();
  //again, as string
  const message = JSON.stringify(instances);

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

const MOCK_FILE = path.resolve(process.cwd(), 'tests', 'mock-ec2.json');

const readMockInstances = async (): Promise<InitialServerSideInstance[]> => {
  try {
    const raw = await fs.promises.readFile(MOCK_FILE, 'utf8');
    return JSON.parse(raw) as InitialServerSideInstance[];
  } catch (err: any) {
    console.warn('Could not read mock EC2 file:', MOCK_FILE, (err && err.message) || err);
    return [];
  }
};

//only seen on server side
//console.log("Attempting with the following credentials:");
//console.log("accessKeyId:", process.env.AWS_SDK_ID);
//console.log("secretAccessKey:", process.env.AWS_SDK_KEY);

// if (!process.env.AWS_SDK_ID || !process.env.AWS_SDK_KEY) {
//   throw new Error("Missing AWS credentials in environment variables");
// }

const ec2 = new EC2Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_SDK_ID!,
    secretAccessKey: process.env.AWS_SDK_KEY!,
  },
});

export const fetchEc2Instances = async () => {
   // return mock data if enabled
  if (process.env.MOCK_EC2 === 'true') {
    console.log('MOCK_EC2=true — returning mock instances from', MOCK_FILE);
    return readMockInstances();
  }

  try {
    // console.log("fetching promise...");
    const data = await ec2.send(
    new DescribeInstancesCommand({})
);

    // console.log("fetched promise...");

    // ADDED: log summary of raw response so you can see why instances array is empty
    // const reservations = data.Reservations || [];
    // console.log(`describeInstances returned ${reservations.length} reservation(s).`);
    // reservations.forEach((res, idx) => {
    //   const ids = (res.Instances || []).map(i => ({ id: i.InstanceId, state: i.State?.Name, region: i.Placement?.AvailabilityZone }));
    //   console.log(` reservation[${idx}] instances:`, ids);
    // });

    const instances: InitialServerSideInstance[] = data.Reservations?.flatMap(
      (reservation) => {
        return reservation.Instances?.map((instance) => ({
          instanceID: instance.InstanceId || 'N/A',
          name: instance.Tags?.find(tag => tag.Key == 'Name')?.Value || "N/A",
          status: instance.State?.Name || "N/A",
          publicIP: instance.PublicIpAddress || "N/A",
          privateIP: instance.PrivateIpAddress || "N/A",
        })) || [];
      }
    ) || [];
    return instances;
  } catch (error: any) {
    console.log("error fetching ec2...", (error && error.message) || error);
    throw error;
  }
};

//start server once in render and fetch and send periodically
startWSServer();
setInterval(broadcastUpdates, 5000);