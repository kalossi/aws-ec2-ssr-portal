// pages/resources.tsx
import { GetServerSideProps } from "next";
import {
  InitialServerSideInstance,
  fetchEc2Instances,
} from "../utils/ec2_utils";
import { useState, useEffect } from "react";
import { pgPool } from "../utils/server_utils";

const insertInstancesToDB = async (serverSideInstances: InitialServerSideInstance[]) => {
  console.log(`inside the db func: ${serverSideInstances}`);

  try {
    await pgPool.query('BEGIN');
    for (const instance of serverSideInstances) {
      const dbQuery = `
        INSERT INTO instances (instance_id, private_ip, public_ip)
        VALUES ($1, $2, $3)
        ON CONFLICT (instance_id) DO NOTHING`;
      const values = [instance.instanceID, instance.privateIP, instance.publicIP];
      await pgPool.query(dbQuery, values);
    }
    await pgPool.query('COMMIT');
  } catch (err: any) {
    try { await pgPool.query('ROLLBACK'); } catch (_) { /* ignore */ }
    console.error("Error inserting data:", err && err.stack ? err.stack : err);
  } finally {
      // pgPool.end() is not called here to allow connection reuse across requests
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
  const port = process.env.NEXT_PUBLIC_WS_PORT ?? "8085";
  const host = process.env.NEXT_PUBLIC_WS_HOST ?? "localhost";
  const ws = new WebSocket(`ws://${host}:${port}`);

  const lastPayloadRef = { current: "" };

  ws.onopen = () => console.log("WS connected", port);

  ws.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data.toString());

      // Normalize payload to always be an array of instances
      const instances = Array.isArray(parsed)
        ? parsed
        : parsed?.instances ?? [];

      const payload = JSON.stringify(instances);

      // Only update state if something actually changed
      if (payload !== lastPayloadRef.current) {
        lastPayloadRef.current = payload;
        setServerSideInstances(instances);
      }
    } catch (e) {
      console.error("ws parse error", e);
    }
  };

  ws.onerror = (err) => console.error("ws error", err);

  return () => ws.close();
}, []);

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
            <th>Name</th>
            <th>Status</th>
            <th>Public IP</th>
            <th>Private IP</th>
          </tr>
        </thead>
        <tbody>
          {serverSideInstances.map((instance: InitialServerSideInstance) => (
            <tr key={instance.instanceID}>
              <td>{instance.instanceID}</td>
              <td>{instance.name}</td>
              <td>{instance.status}</td>
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
