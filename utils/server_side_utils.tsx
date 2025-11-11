//.utils/server_side_utils.tsx
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
  try {
    // console.log("fetching promise...");
    const data = await ec2.describeInstances().promise();
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
          publicIP: instance.PublicIpAddress || "N/A",
          privateIP: instance.PrivateIpAddress || "N/A",
        })) || [];
      }
    ) || [];
    return instances;
  } catch (error) {
    console.log("error fetching ec2...");
    throw error;
  }
};

//start server once in render and fetch and send periodically
startWSServer();
setInterval(broadcastUpdates, 5000);