import { NextApiRequest, NextApiResponse } from "next";
import { uploadToS3 } from "@/utils/s3_upload";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileName, fileContent } = req.body;

    if (!fileName || !fileContent) {
      return res.status(400).json({
        error: "Missing fileName or fileContent",
      });
    }

    const fileSizeBytes = Buffer.byteLength(fileContent);
    const fileSizeMb = fileSizeBytes / (1024 * 1024);

    // Generate unique file key
    const timestamp = Date.now();
    const fileKey = `uploads/${timestamp}-${fileName}`;

    // Upload to S3
    await uploadToS3({
      bucket: process.env.S3_BUCKET_NAME || "my-bucket",
      key: fileKey,
      content: fileContent,
    });

    res.status(200).json({
      message: "File uploaded successfully",
      fileName,
      fileKey,
      fileSizeMb: fileSizeMb.toFixed(2),
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: "Upload failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

export default handler;
