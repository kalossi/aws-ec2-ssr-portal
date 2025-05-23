//.components/resources.tsx
//the backend
import { GetServerSideProps } from "next";
import {
  InitialServerSideInstance,
  fetchEc2Instances,
} from "../utils/server_side_utils";
import { useState, useEffect } from "react";
import Header from "@/components/header";

const insertInstancesToDB = async (serverSideInstances: InitialServerSideInstance[]) => {
  const { Client } = require('pg');

  const client = new Client({
    user: "pg",
    host: "localhost",
    database: "test",
    password: "test1234",
    port: 5432,
  });

  // console.log(`inside the db func: ${serverSideInstances}`);

  try {
    await client.connect();
    for (const instance of serverSideInstances) {
      const dbQuery = `
      INSERT INTO instances (instance_id, private_ip, public_ip)
      VALUES ($1, $2, $3)
      ON CONFLICT (instance_id) DO NOTHING`;
      const values = [instance.instanceID, instance.privateIP, instance.publicIP];
      const res = await client.query(dbQuery, values);
      await client.query('COMMIT')
    }
  } catch (err) {
    if (err instanceof Error) {
      await client.query('ROLLBACK')
      console.error("Error inserting data:", err.stack);
    } else {
      console.log("Unexpected error");
    }
  } finally {
    await client.end();
  }
};

export const Resources = ({
  initialServerSideInstances,
}: {
  initialServerSideInstances: InitialServerSideInstance[];
}) => {
  const [serverSideInstances, setServerSideInstances] = useState(
    initialServerSideInstances
  );

  //starts a web socket connection when the serverSideInstances change
  useEffect(() => {
    //establish WebSocket server connection ("creates an instance of a class") - Global object in browser enviroment
    const ws = new WebSocket("ws://localhost:8085");
    //triggers when message from server is received (with interval - see ../utils/server_side_utils)
    ws.onmessage = (event) => {
      //received message event.data is string but maybe this is better for consistency
      const receivedInstances = JSON.parse(
        event.data.toString()
      ) as InitialServerSideInstance[];
      //compare is done in string type
      if (
        JSON.stringify(receivedInstances) !==
        JSON.stringify(serverSideInstances)
      ) {
        //if changes has happened, update the state
        setServerSideInstances(receivedInstances);
      }
    };

    ws.onerror = (error) => {
      console.error(error);
    };
    //remember to close WebSocket connection!
    return () => {
      ws.close();
    };
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
          {serverSideInstances.map((instance: InitialServerSideInstance) => (
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
  await insertInstancesToDB(serverSideInstances);
  console.log('insert to db done');
  return {
    props: { serverSideInstances },
  };
};

export default Resources;
