// pages/api/time.ts

import { NextApiRequest, NextApiResponse } from "next";

let latestEpochTime: number | null = null;

// Arrow function for the handler
const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { epoch } = req.body;

    // Check if the received data is valid
    if (!epoch || typeof epoch !== "number") {
      return res.status(400).json({ error: "Invalid epoch time" });
    }

    // Store the epoch time
    latestEpochTime = epoch;
    return res.status(200).json({ success: true });
  }

  if (req.method === "GET") {
    // Return the stored epoch time if available
    if (latestEpochTime === null) {
      return res.status(404).json({ error: "No time available yet" });
    }

    return res.status(200).json({ epoch: latestEpochTime });
  }

  // Method Not Allowed if not POST or GET
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
};

export default handler;
