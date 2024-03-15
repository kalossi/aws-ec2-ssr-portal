// .utils/client_side_utils.tsx
import { useEffect, useState } from "react";
import { ServerSideInstances, fetchEc2Instances } from "../utils/server_side_utils";

export const useServerSideEffect = () => {
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
  }, [serverSideInstances]);

  return serverSideInstances;
};