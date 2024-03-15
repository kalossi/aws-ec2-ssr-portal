import { useEffect, useState } from "react";
import { ServerSideInstances, fetchEc2Instances } from "../page";


const useServerSideEffect = () => {
  const [serverSideInstances, setServerSideInstances] = useState<ServerSideInstances[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchEc2Instances();
        setServerSideInstances(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } 
    };
  
    fetchData();
  }, []);

  return serverSideInstances;
};

const Resources: React.FC<{ serverSideInstances: ServerSideInstances[]}> = ({ serverSideInstances }) => {

  useServerSideEffect();

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
