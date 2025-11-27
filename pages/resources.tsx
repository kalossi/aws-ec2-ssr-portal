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
    initialServerSideInstances || []
  );

  // create WS once, don't recreate on every state change
  useEffect(() => {
    const port = process.env.WS_PORT ?? '8081';
    const ws = new WebSocket(`ws://localhost:${port}`);

    const lastPayloadRef = { current: '' } as { current: string };

    ws.onopen = () => console.log('WS connected', port);
    ws.onmessage = (event) => {
      try {
        const receivedInstances = JSON.parse(event.data.toString()) as InitialServerSideInstance[];
        const payload = JSON.stringify(receivedInstances);
        if (payload !== lastPayloadRef.current) {
          lastPayloadRef.current = payload;
          setServerSideInstances(receivedInstances);
        }
      } catch (e) {
        console.error('ws parse error', e);
      }
    };
    ws.onerror = (err) => console.error('ws error', err);
    return () => ws.close();
  }, []); // run once on mount

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
            <th>Name</th>
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
  try {
    const serverSideInstances = await fetchEc2Instances();
    console.log('fetched instances length=', serverSideInstances?.length ?? 0);

    // attempt to persist, but don't let DB failures break the page render
    try {
      await insertInstancesToDB(serverSideInstances);
      console.log('insert to db done');
    } catch (dbErr) {
      console.error('insertInstancesToDB failed (logged, continuing):', dbErr);
    }

    // return prop name the component expects
    return {
      props: { initialServerSideInstances: serverSideInstances },
    };
  } catch (err: any) {
    console.error('getServerSideProps failed fetching instances:', err && err.stack ? err.stack : err);
    return {
      props: { initialServerSideInstances: [] },
    };
  }
};

export default Resources;
