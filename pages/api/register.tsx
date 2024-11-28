// pages/api/register.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createUser } from "@/utils/users"; // Import createUser from utils

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    console.log('Request body:\n', req.body);
    const { username, password, logged_in } = req.body; // Extract form data from the request body

    try {
      if (!username || !password) {
        return res
          .status(400)
          .json({ error: "Username and password are required" });
      }
      // Call the createUser function to insert the user into the database
      await createUser({
        username,
        password,
        logged_in,
        id: 0,
      });

      // Send a success response
      res.status(200).json({ message: "User created successfully" });
    } catch (error) {
      // Send an error response if something goes wrong
      res.status(500).json({ error: error.message || "Failed to create user" });
    }
  } else {
    // Handle unsupported HTTP methods
    res.status(405).json({ error: "Method not allowed" });
  }
}
