// .utils/server_side_utils.tsx
import AWS from 'aws-sdk';

export interface ServerSideInstances {
    instanceID: string;
    state: string;
    publicIP: string | "N/A";
    privateIP: string | "N/A";
  }
  
//   only seen on server side
  console.log("Attempting with the following credentials:");
  console.log("accessKeyId:", process.env.AWS_SDK_ID);
  console.log("secretAccessKey:", process.env.AWS_SDK_KEY);
  
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
      const instances: ServerSideInstances[] = data.Reservations?.flatMap(
        (reservation) => {
          console.log('reservation is:', reservation);
          return reservation.Instances?.map((instance) => ({
            instanceID: instance.InstanceId || 'N/A',
            state: instance.State?.Name || "N/A",
            publicIP: instance.PublicIpAddress || "N/A",
            privateIP: instance.PrivateIpAddress || "N/A",
          })) || [];
        }
      );
      return instances;
    } catch (error) {
      console.log("error fetching ec2...");
      throw error;
    }
  };