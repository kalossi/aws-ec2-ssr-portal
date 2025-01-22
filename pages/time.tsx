// pages/time.tsx

import React, { useEffect, useState } from "react";

// Time Component that fetches the latest epoch time and displays it
const Time: React.FC = () => {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the latest epoch time every second
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/time");
        if (response.ok) {
          const data = await response.json();
          const epochTime = data.epoch; // Assuming the epoch time is in the response
          setTime(new Date(epochTime * 1000).toLocaleTimeString("en-GB")); // Convert epoch to readable time
        } else {
          console.error("Failed to fetch time");
        }
      } catch (error) {
        console.error("Error fetching time:", error);
      }
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return <p>Current Time: {time ?? "Loading..."}</p>;
};

// TimePage that renders the Time component
const TimePage: React.FC = () => {
  return (
    <div>
      <Time /> {/* This will display the current time fetched from /api/time */}
    </div>
  );
};

export default TimePage;
