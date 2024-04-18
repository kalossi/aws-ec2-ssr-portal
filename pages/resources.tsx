//.components/resources.tsx
import { GetServerSideProps } from "next";
import { InitialServerSideInstances, fetchEc2Instances } from "../utils/server_side_utils";
import { useState, useEffect } from "react";
import Header from "@/components/header";

export const Resources = ({ initialServerSideInstances }: { initialServerSideInstances: InitialServerSideInstances[] }) => {
  const [serverSideInstances, setServerSideInstances] = useState(initialServerSideInstances);

  useEffect(() =>{
    const ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = (event) => {
      const receivedInstances = JSON.parse(event.data.toString()) as InitialServerSideInstances[];
      if (JSON.stringify(receivedInstances) !== JSON.stringify(serverSideInstances)){
        setServerSideInstances(receivedInstances);
      }
    };

    ws.onerror = (error) => {
      console.error(error);
    };

    return () => {
      ws.close();
    }
  }, [serverSideInstances]);

  return !serverSideInstances || serverSideInstances.length === 0 ? (
    <div>
      <Header />
      <h1>No instances available.</h1>
    </div>
  ) : (
    <div>
      <Header />
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
          {serverSideInstances.map((instance: InitialServerSideInstances) => (
            <tr key={instance.instanceID}>
              <td>{instance.instanceID}</td>
              <td>{instance.name}</td>
              <td>{instance.publicIP}</td>
              <td>{instance.privateIP}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const serverSideInstances = await fetchEc2Instances();
  console.log(serverSideInstances);
  return {
    props: { serverSideInstances },
  };
};

export default Resources;
