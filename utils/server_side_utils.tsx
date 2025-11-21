//.utils/server_side_utils.tsx
import fs from 'fs';
import path from 'path';
import * as AWS from 'aws-sdk';
//in server side you need to import these
import { WebSocketServer, WebSocket } from 'ws';

export interface InitialServerSideInstance {
  instanceID: string;
  name: string | 'N/A';
  publicIP: string | "N/A";
  privateIP: string | "N/A";
}
//invoke instance so that you can use it in many places
const wss = new WebSocketServer({port: 8081});

// on initial render - better to split these two and they also serve a different scenario, although using the same fetch
const startWSServer = () => {
  wss.on('connection', async (ws: WebSocket) => {

    const instances = await fetchEc2Instances();
    //sent as string
    ws.send(JSON.stringify(instances));
    ws.on('close', () => {
      console.log('web socket client disconnected')
    })
  });
}

//broadcast to all the clients - called with a interval again and again
const broadcastUpdates = async () => {
  const instances = await fetchEc2Instances();
  //again, as string
  const message = JSON.stringify(instances);
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

AWS.config.update({
  accessKeyId: process.env.AWS_SDK_ID,
  secretAccessKey: process.env.AWS_SDK_KEY,
  region: "eu-north-1",
});

const ec2 = new AWS.EC2();

export const fetchEc2Instances = async () => {
   // return mock data if enabled
  if (process.env.MOCK_EC2 === 'true') {
    console.log('MOCK_EC2=true — returning mock instances from', MOCK_FILE);
    return readMockInstances();
  }

  try {
    // console.log("fetching promise...");
    const data = await ec2.describeInstances().promise();
    // console.log("fetched promise...");
    const instances: InitialServerSideInstance[] = data.Reservations?.flatMap(
      (reservation) => {
        return reservation.Instances?.map((instance) => ({
          instanceID: instance.InstanceId || 'N/A',
          name: instance.Tags?.find(tag => tag.Key == 'Name')?.Value || "N/A",
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