//.utils/server_side_utils.tsx
import AWS from 'aws-sdk';
//in server side you need to import these
import { WebSocketServer, WebSocket } from 'ws';

export interface InitialServerSideInstance {
  instanceID: string;
  name: string | 'N/A';
  publicIP: string | "N/A";
  privateIP: string | "N/A";
}
//invoke instance so that you can use it in many places
const wss = new WebSocketServer({port: 8080});

// on initial render TODO: could these two be done better?
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

//broadcast to all the clients
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
    console.log("fetching promise...");
    const data = await ec2.describeInstances().promise();
    console.log("fetched promise...");
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