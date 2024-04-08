//.components/resources.tsx
// import { useServerSideEffect } from "../utils/client_side_utils";
import { GetServerSideProps } from "next";
import { ServerSideInstances, fetchEc2Instances } from "../utils/server_side_utils";
import Header from "@/components/header";

export const Resources = ({ serverSideInstances }: { serverSideInstances: ServerSideInstances[] }) => {

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
          {serverSideInstances.map((instance: ServerSideInstances) => (
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
