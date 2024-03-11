import AWS from "aws-sdk";
import type { GetServerSideProps } from "next";
import React, { useEffect, useState } from "react";

interface ServerSideInstances {
  instanceID: string;
  state: string;
  publicIP: string | "N/A";
  privateIP: string | "N/A";
}

// // only seen on server side
// console.log("Attempting with the following credentials:");
// console.log("accessKeyId:", process.env.AWS_SDK_ID);
// console.log("secretAccessKey:", process.env.AWS_SDK_KEY);

AWS.config.update({
  accessKeyId: process.env.AWS_SDK_ID,
  secretAccessKey: process.env.AWS_SDK_KEY,
  region: "eu-north-1",
});

const ec2 = new AWS.EC2();

export const fetchEc2Instances = async () => {
  try {
    console.log("fetching...");
    const data = await ec2.describeInstances().promise();
    console.log("fetched promise...");
    const instances: ServerSideInstances[] = data.Reservations.flatMap(
      (reservation) => {
        reservation.Instances?.map((instance) => ({
          instanceID: instance.InstanceId,
          state: instance.State?.Name || "N/A",
          publicIP: instance.PublicIpAddress || "N/A",
          privateIP: instance.PrivateIpAddress || "N/A",
        }));
      }
    );
    return instances;
  } catch (error) {
    console.log("error fetching ec2...");
    throw error;
  }
};

export const getServerSideProps = (async () => {
  try {
    const serverSideInstances = await fetchEc2Instances();
    return {
      props: { serverSideInstances },
    };
  } catch (error) {
    throw error;
  }
}) satisfies GetServerSideProps<{ serverSideInstances: ServerSideInstances[] }>;

const Resources = () => {
  const [serverSideInstances, setServerSideInstances] = useState<ServerSideInstances[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchEc2Instances();
        console.log(data);
        setServerSideInstances(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return !serverSideInstances || serverSideInstances.length === 0 ? (
    <div>
      <h1>No instances available.</h1>
    </div>
  ) : (
    <div>
      <h1>Server-Side Instances:</h1>
      <table>
        <thead>
          <tr>
            <th>Instance ID</th>
            <th>State</th>
            <th>Public IP</th>
            <th>Private IP</th>
          </tr>
        </thead>
        <tbody>
          {serverSideInstances.map((instance: ServerSideInstances) => (
            <tr key={instance.instanceID}>
              <td>{instance.instanceID}</td>
              <td>{instance.state}</td>
              <td>{instance.publicIP}</td>
              <td>{instance.privateIP}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Resources;
